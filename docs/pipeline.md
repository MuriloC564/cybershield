# Pipeline DevSecOps — explicação das etapas

Arquivo do workflow: [`.github/workflows/devsecops.yml`](../.github/workflows/devsecops.yml).

## Visão geral

- **Gatilho:** `push` na `main` e em branches `teste-gate/**` (para demonstrar bloqueios), mais execução manual (`workflow_dispatch`). Commits que mexem só em `docs/**`, `README.md` e `.gitignore` **não** disparam a esteira (`paths-ignore`).
- **Sequência:** cada job depende do anterior (`needs`). O deploy em produção só ocorre na `main`.
- **Relatórios:** cada job publica seus arquivos com `actions/upload-artifact` e `if: always()`, então o relatório existe até quando a etapa falha.
- **Permissões:** `contents: read` no topo; `packages: write` só na etapa 5 e `packages: read` nas etapas 6 e 7.
- **Versões:** actions fixadas por SHA de commit (com a versão em comentário), runner `ubuntu-24.04`, ferramentas e imagens com versão fixada.

```
push (main)
   │
   ▼
[1 Gitleaks] → [2 Semgrep] → [3 Build/deps/testes] → [4 Trivy fs]
   ┌──────────────────────────────────────────────────────┘
   ▼
[5 Docker → GHCR] → [6 Trivy image] → [7 Homologação + ZAP]
                                            │
                                  ⏸ aprovação humana
                                            ▼
                                   [8 Deploy produção]
                                            │
                                [★ Resumo da Esteira]
```

## Etapa 1 — Secrets (Gitleaks)

- **Objetivo:** garantir que nenhuma credencial esteja no código ou no histórico do Git.
- **Como:** binário do Gitleaks 8.18.4 sobre o histórico completo (`fetch-depth: 0`), com `--redact` para o relatório não reexpor o segredo.
- **Quality gate:** `--exit-code 1` — qualquer segredo encontrado bloqueia a esteira.
- **Relatório:** `relatorio-01-gitleaks` (`gitleaks.json`).
- **Resultado:** nenhum segredo encontrado em nenhuma execução. Antes de publicar o repositório, o histórico também foi varrido localmente. Se um segredo real aparecer, a ação correta é rotacionar a credencial (removê-la do último commit não basta).

## Etapa 2 — SAST (Semgrep)

- **Objetivo:** achar vulnerabilidades e más práticas no código-fonte antes do build.
- **Como:** Semgrep 1.75.0 com os rulesets `p/default`, `p/owasp-top-ten`, `p/python` e `p/javascript`; relatório em JSON.
- **Quality gate:** `--error` — achados bloqueiam.
- **Relatório:** `relatorio-02-semgrep` (`semgrep.json`).
- **Resultado:** 28 achados na primeira execução (27 de `github-actions-mutable-action-tag` no próprio workflow e 1 `detect-non-literal-regexp` no frontend). O primeiro foi corrigido fixando as actions por SHA; o segundo era falso positivo e foi suprimido com `// nosemgrep` e justificativa registrada em `docs/observacoes.md`.

## Etapa 3 — Build, dependências, testes e artefato

- **Objetivo:** compilar de forma reprodutível, inventariar e auditar dependências, rodar os testes e publicar o artefato versionado pelo commit.
- **Frontend:** `npm ci`, `npm run build`, `npm ls --all` (árvore) e `npm audit --json`.
- **Backend:** `pip install -r requirements.txt`, `compileall`, `pip list` (árvore) e `pip-audit`.
- **Testes:** 9 smoke tests com `pytest` e `httpx` (arquivo `backend/tests/test_smoke.py`) contra um Postgres de serviço: `/health`, cabeçalhos de segurança, cadastro, senhas diferentes, usuário duplicado, login válido com `/usuario/me`, senha errada, rota protegida sem token e token adulterado. As dependências de teste ficam em `requirements-dev.txt`, fora da imagem de produção; o `JWT_SECRET_KEY` dos testes é gerado aleatoriamente a cada execução.
- **Artefato:** `app-<sha>.tar.gz`, nomeado pelo SHA do commit.
- **Quality gate:** falha de build ou de testes bloqueia. A auditoria (`npm audit`, `pip-audit`) é **informativa**; o bloqueio de dependências vulneráveis está na etapa 4.
- **Relatório:** `relatorio-03-build` (`arvore-dependencias.txt`, `arvore-python.txt`, `npm-audit.json`, `pip-audit.json`, `testes.txt`, `resultado-testes.xml`) e `artefato-aplicacao`.

## Etapa 4 — SCA (Trivy fs)

- **Objetivo:** detectar CVEs em bibliotecas de terceiros e configurações inseguras (Dockerfile, IaC).
- **Como:** `trivy fs` na raiz com os scanners `vuln`, `misconfig` e `secret`; relatório completo em tabela e relatório filtrado em JSON (HIGH/CRITICAL). Depende dos arquivos de lock (`package-lock.json`, `requirements.txt`).
- **Quality gate:** `--exit-code 1` com HIGH ou CRITICAL.
- **Relatório:** `relatorio-04-trivy-sca` (`trivy-fs.txt`, `trivy-fs.json`).
- **Resultado:** bloqueou duas vezes (`python-jose` CRITICAL sem correção, depois 6 CVEs no `PyJWT 2.10.1`); a biblioteca foi trocada por PyJWT e atualizada para a `2.15.1`.

## Etapa 5 — Docker build e GHCR

- **Objetivo:** construir a imagem e publicá-la no GitHub Container Registry, identificada de forma imutável pelo SHA do commit e pelo digest.
- **Dockerfile:** multi-stage. O estágio 1 (`node:22-alpine`) builda o frontend; o estágio 2 (`python:3.12-slim`) instala o backend e recebe só o `dist` do frontend, que o FastAPI serve. Roda como usuário **não-root** (uid 10001), porta 8080, sem segredos em `ENV`/`ARG`; as credenciais entram só por variável de ambiente em tempo de execução.
- **Como:** `docker/build-push-action` com login no GHCR pelo `GITHUB_TOKEN`. Tag = SHA do commit; **nunca** `latest`.
- **Quality gate:** falha de build ou push bloqueia.
- **Relatório:** `relatorio-05-docker-build` (imagem, digest e commit).

## Etapa 6 — Scan da imagem (Trivy image)

- **Objetivo:** analisar a imagem publicada (SO e bibliotecas, inclusive dependências indiretas) antes de qualquer deploy.
- **Como:** `trivy image` sobre a mesma tag/SHA publicada na etapa 5; credenciais do registry passadas por variável de ambiente. Relatório completo em tabela e JSON filtrado em HIGH/CRITICAL com correção.
- **Quality gate:** `--exit-code 1` com HIGH/CRITICAL que já tenham correção (`--ignore-unfixed`).
- **Relatório:** `relatorio-06-trivy-image` (`trivy-image.txt`, `trivy-image.json`).
- **Resultado:** bloqueou uma vez (3 CVEs HIGH no `starlette`, dependência indireta do FastAPI). Na imagem final: 0 HIGH/CRITICAL com correção; os HIGH do sistema operacional sem correção publicada estão registrados como risco aceito em `docs/observacoes.md`.

## Etapa 7 — Homologação e DAST (OWASP ZAP)

- **Objetivo:** executar a aplicação em ambiente de homologação e testá-la "de fora para dentro", achando falhas visíveis só em execução (cabeçalhos, cookies, exposição de informações).
- **Como:** o job usa o environment `homologacao`, sobe um Postgres como serviço, executa a imagem aprovada no próprio runner (com `DB_SSLMODE=disable` e um `JWT_SECRET_KEY` descartável, gerado na hora) e roda o **ZAP Baseline** contra `http://localhost:8080`. O ZAP roda via `docker run` com a imagem fixada por digest.
- **Quality gate:** informativo. A decisão de seguir para produção é do aprovador, com base no relatório.
- **Relatório:** `relatorio-07-homologacao-zap` (`report_html.html`, `report_json.json`, `report_md.md`).
- **Resultado:** a primeira varredura achou 2 Medium e 5 Low; depois do middleware de cabeçalhos de segurança no FastAPI (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP e CORP) restaram 1 Medium (`style-src 'unsafe-inline'`) e 1 Low (COEP), ambos registrados como risco aceito. **Limitação:** o Baseline é passivo e não exercita a API autenticada.
- O ZAP só é executado contra o ambiente do próprio projeto.

## Etapa 8 — Aprovação humana e deploy em produção

- **Objetivo:** controle de mudança — o deploy só acontece depois que um revisor aprova explicitamente.
- **Environment `producao`:** Required reviewers (MuriloC564), sem opção de contornar a regra como administrador.
- **Como:** o job fica em *Waiting* até a aprovação; a rejeição interrompe o deploy. Aprovado, ele chama o **deploy hook** do serviço `cybershield-prod` no Render (serviço de imagem), passando `imgURL` com a imagem do GHCR **pelo SHA** da execução, e então faz um *health check* em `/health` na URL de produção. O hook é um *Environment secret* do `producao`.
- **Relatório:** `relatorio-08-producao` (imagem, digest, responsável pela execução, resultado, URL, data e link da execução).
- **Observação:** o health check não prova, sozinho, qual versão está no ar (o Render mantém a antiga respondendo durante o deploy). A prova é o registro de deploys do Render, com *Trigger: Deploy Hook* e o SHA da imagem.

## ★ Resumo da Esteira

- **Objetivo:** consolidar em um só lugar o resultado e a contagem de achados de todas as etapas.
- **Como:** o job `pipeline-summary` depende de todos os outros e roda com `if: always()`. Ele baixa os relatórios, extrai as contagens com `jq` e escreve uma tabela no `$GITHUB_STEP_SUMMARY`.
- **Relatório:** `resumo-da-esteira` (`resumo-esteira.md`).
- Como depende da etapa 8, o resumo só é gerado depois da aprovação ou rejeição do deploy.

## Decisões específicas do CyberShield

- **Imagem única:** o FastAPI serve o frontend e a API na mesma origem, o que simplifica o ZAP, o scan da imagem e o deploy.
- **Homologação efêmera no runner:** não há ambiente de homologação permanente; cada execução sobe a imagem aprovada com um banco descartável.
- **Produção separada do Git:** o serviço de produção usa a imagem do GHCR, não o código do repositório, e só é atualizado pelo deploy hook da etapa 8. O Auto-Deploy do serviço antigo foi desativado por contornar os quality gates.
- **Dependências de teste fora da imagem:** `requirements-dev.txt` separado de `requirements.txt`.
