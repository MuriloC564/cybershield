# Observações da esteira DevSecOps — CyberShield

Uma tabela por ferramenta. Cada achado: identificador/severidade, onde, classificação
(vulnerabilidade real / falso positivo / risco aceito), ação (com link do commit) e resultado (execução seguinte).

## Visão geral das execuções

| Run | Resultado | O que aconteceu | Commit |
|---|---|---|---|
| [#1](https://github.com/MuriloC564/cybershield/actions/runs/41217415332) | Bloqueada na etapa 2 | Semgrep: 28 achados | [commit](https://github.com/MuriloC564/cybershield/commit/4a26765977ac4af21a065bf465cc6159592799ff) |
| [#2](https://github.com/MuriloC564/cybershield/actions/runs/41218478278) | Bloqueada na etapa 4 | Trivy fs: `python-jose` CRITICAL sem correção | [commit](https://github.com/MuriloC564/cybershield/commit/d5a7b2971d115c8c2b4503f4d050ec4dd3bd7b64) |
| [#3](https://github.com/MuriloC564/cybershield/actions/runs/41223098397) | Bloqueada na etapa 4 | Trivy fs: 6 CVEs HIGH/CRITICAL no `PyJWT 2.10.1` | [commit](https://github.com/MuriloC564/cybershield/commit/a76e7f385a008d6048d5d3713b11441c5901cf4f) |
| [#4](https://github.com/MuriloC564/cybershield/actions/runs/41224285856) | Bloqueada na etapa 6 | Trivy image: 3 CVEs HIGH no `starlette` | [commit](https://github.com/MuriloC564/cybershield/commit/6ac5dfa24512760dcf7a7b64d9fd1455ee793e21) |
| [#5](https://github.com/MuriloC564/cybershield/actions/runs/41225503807) | Falha na etapa 7 | `zaproxy/action-baseline` quebrou (nome de artifact inválido) | [commit](https://github.com/MuriloC564/cybershield/commit/190f8e35f00508a5d75b8c5d870f90226923fed9) |
| [#6](https://github.com/MuriloC564/cybershield/actions/runs/41226973226) | Etapas 1 a 7 verdes; etapa 8 falhou **sem pedir aprovação** | ZAP via `docker run`: baseline "antes" dos cabeçalhos. O environment `producao` ainda não tinha revisor, então o job rodou direto e falhou no deploy antigo: `RENDER_DEPLOY_HOOK` vazio (`curl` com exit code 3) | [commit](https://github.com/MuriloC564/cybershield/commit/6420df338419a557b8ec555e008d963c3619c48b) |
| [#7](https://github.com/MuriloC564/cybershield/actions/runs/41228500946) | Etapas 1 a 7 verdes; produção **rejeitada** (sem comentário) | ZAP "depois" dos cabeçalhos; com o revisor já configurado em `producao`, a rejeição provou que o gate interrompe o deploy | [commit](https://github.com/MuriloC564/cybershield/commit/f87c257e518602c9e37722597fb403afda3ea7fc) |
| [#8](https://github.com/MuriloC564/cybershield/actions/runs/41234658543) | Etapas 1 a 7 verdes; produção **rejeitada** (sem comentário) | Correção de `vite`, `source-map-js` e `python-dotenv`; o gate voltou a parar no revisor | [commit](https://github.com/MuriloC564/cybershield/commit/bf8a4f1c70c2c7d054a21eb8ccdcce39e6c10459) |
| [#9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606) | **Completa (8 etapas + Resumo)** | Smoke tests na etapa 3; produção aprovada; deploy no Render | [commit](https://github.com/MuriloC564/cybershield/commit/282ae54b0d24fa73c115ac7657d2d8a2f7d6bd58) |

## Gitleaks
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
| Nenhum segredo encontrado no histórico completo (`fetch-depth: 0`, `--redact`) | Repositório inteiro | N/A | Nenhuma. O `.env` nunca foi versionado (conferido com `git status` antes de cada commit). Varredura local prévia com Gitleaks 8.18.4 também sem achados | Etapa 1 em success em todas as execuções ([run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606)) |

## Semgrep
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
| `github-actions-mutable-action-tag` (WARNING), 27 ocorrências | `.github/workflows/devsecops.yml` | Vulnerabilidade real (supply chain): tags de actions são mutáveis | Todas as actions fixadas por SHA de commit, com a versão em comentário. Runner fixado em `ubuntu-24.04`. `trivy-action` atualizada para `v0.36.0`, porque a tag `0.28.0` não existe mais ([commit](https://github.com/MuriloC564/cybershield/commit/d5a7b2971d115c8c2b4503f4d050ec4dd3bd7b64)) | 0 achados na [run #2](https://github.com/MuriloC564/cybershield/actions/runs/41218478278) |
| `detect-non-literal-regexp` (WARNING) | `frontend/src/App.jsx:130` | Falso positivo | Suprimido com `// nosemgrep` e justificativa: a entrada passa por `escapeRegExp()` e vem das alternativas do quiz, não de input livre do usuário ([commit](https://github.com/MuriloC564/cybershield/commit/d5a7b2971d115c8c2b4503f4d050ec4dd3bd7b64)) | 0 achados na [run #2](https://github.com/MuriloC564/cybershield/actions/runs/41218478278) |

## Build / npm audit / pip-audit / testes
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
| `vite 8.2.1` (HIGH, 6 advisories do servidor de desenvolvimento) | `frontend/package.json` (devDependency) | Vulnerabilidade real, risco baixo em runtime: `vite` é devDependency e o Dockerfile multi-stage não leva `node_modules` para a imagem final | Atualizado para `vite 8.3.5`; `npm run build` validado ([commit](https://github.com/MuriloC564/cybershield/commit/bf8a4f1c70c2c7d054a21eb8ccdcce39e6c10459)) | `npm audit`: 0 vulnerabilidades ([run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606)) |
| `source-map-js 1.2.1` (HIGH, GHSA-68fv-2mgg-jv7q), dependência indireta via postcss | `frontend/package-lock.json` | Vulnerabilidade real, risco baixo em runtime (só build) | Atualizado para `1.2.2` ([commit](https://github.com/MuriloC564/cybershield/commit/bf8a4f1c70c2c7d054a21eb8ccdcce39e6c10459)) | `npm audit`: 0 vulnerabilidades ([run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606)) |
| `python-dotenv 1.0.1` (CVE-2026-28684 / PYSEC-2026-2270, MEDIUM no Trivy) | `backend/requirements.txt` | Vulnerabilidade real, **não alcançável** no uso atual: o código só chama `load_dotenv()` (nunca `set_key`/`unset_key`) | Atualizado mesmo assim para `1.2.2`; testes locais com Docker + Postgres (cadastro, login, quiz, F5) ([commit](https://github.com/MuriloC564/cybershield/commit/bf8a4f1c70c2c7d054a21eb8ccdcce39e6c10459)) | `pip-audit`: 0 pacotes vulneráveis ([run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606)) |
| Projeto sem suíte de testes (a etapa 3 só fazia build + `compileall`) | `backend/` | Lacuna de qualidade | 9 testes de smoke com `pytest` + `httpx` e Postgres de serviço: `/health`, cabeçalhos de segurança, cadastro, senhas diferentes, usuário duplicado, login válido + `/usuario/me`, senha errada, rota protegida sem token e token adulterado. Dependências de teste em `requirements-dev.txt`, fora da imagem de produção ([commit](https://github.com/MuriloC564/cybershield/commit/282ae54b0d24fa73c115ac7657d2d8a2f7d6bd58)) | `9 passed` na [run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606) (artifact `relatorio-03-build`) |

Observação: a auditoria da etapa 3 é informativa; o bloqueio de dependências está na etapa 4 (Trivy fs). O `backend/teste_ia.py` é um script manual que chama a API da Groq e **não** entra na esteira.

## Trivy fs (SCA)
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
| `CVE-2026-85394` (CRITICAL) em `python-jose 3.5.0`, sem versão corrigida | `backend/requirements.txt` | Vulnerabilidade real, sem correção disponível na biblioteca | Biblioteca substituída por **PyJWT**. `auth.py`: `import jwt` / `PyJWTError`, `algorithms=["HS256"]` fixo, `sub` como string com o username ([commit](https://github.com/MuriloC564/cybershield/commit/a76e7f385a008d6048d5d3713b11441c5901cf4f)) | Achado sumiu na [run #3](https://github.com/MuriloC564/cybershield/actions/runs/41223098397) |
| 6 CVEs HIGH/CRITICAL em `PyJWT 2.10.1` (IDs: CVE-2026-102268 (CRITICAL); CVE-2026-102267, CVE-2026-102271, CVE-2026-32597, CVE-2026-48526 e GHSA-pxh4-856f-4h89 (HIGH)) | `backend/requirements.txt` | Vulnerabilidade real | Atualizado para `PyJWT 2.15.1` (a `2.14.0` era a mínima que corrigia todos) ([commit](https://github.com/MuriloC564/cybershield/commit/6ac5dfa24512760dcf7a7b64d9fd1455ee793e21)) | Etapa 4 com 0 HIGH/CRITICAL na [run #4](https://github.com/MuriloC564/cybershield/actions/runs/41224285856) |

## Trivy image
A etapa 4 (`trivy fs`) lê só os arquivos de dependência declarados. A etapa 6 (`trivy image`) vê tudo o que está dentro da imagem: dependências indiretas, bibliotecas do sistema e da imagem base. Por isso encontrou o que a etapa 4 não via.

| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
| 3 CVEs HIGH em `starlette 0.38.6` (IDs: CVE-2024-47874, CVE-2026-48818 e CVE-2026-54283), dependência **indireta** do FastAPI | Imagem Docker (não aparece no `requirements.txt`) | Vulnerabilidade real | Atualizado para `fastapi==0.162.0` + `starlette==1.3.1`. Migração de `@app.on_event("startup")` para `lifespan` em `main.py`, exigida pela nova versão ([commit](https://github.com/MuriloC564/cybershield/commit/190f8e35f00508a5d75b8c5d870f90226923fed9)). Testes locais com Docker + Postgres: cadastro, login, quiz e F5 mantendo sessão = OK | Etapa 6 com 0 HIGH/CRITICAL na [run #5](https://github.com/MuriloC564/cybershield/actions/runs/41225503807) |
| Sistema operacional da imagem base `python:3.12-slim` (Debian 13.7): 166 achados no relatório completo da [run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606), dos quais **44 HIGH**, 0 CRITICAL, 60 MEDIUM, 61 LOW e 1 UNKNOWN. Pacotes Python da imagem: 6 achados (5 MEDIUM, 1 LOW) | Camada de SO e pacotes da imagem final | Risco aceito (os 44 HIGH não têm correção publicada; o restante está abaixo do gate) | Nenhuma troca de imagem. O gate da etapa 6 usa `--ignore-unfixed` e passou: o JSON filtrado tem **0** HIGH/CRITICAL com correção nos dois alvos (os-pkgs e lang-pkgs). Mitigações já presentes: imagem `slim`, multi-stage (sem ferramentas de build), usuário não-root e segredos só por variável de ambiente | Etapa 6 em success na run #9. Reavaliar quando houver correção publicada; trocar para uma base menor (alpine/distroless) fica como melhoria |

## OWASP ZAP (Etapa 7, Baseline)

| Risco | Antes ([run #6](https://github.com/MuriloC564/cybershield/actions/runs/41226973226)) | Depois ([run #7](https://github.com/MuriloC564/cybershield/actions/runs/41228500946)) |
|---|---|---|
| High | 0 | 0 |
| Medium | 2 | 1 |
| Low | 5 | 1 |
| Informational | 2 | 2 |

Na [run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606) (execução final) o resultado se manteve: 0 High, 1 Medium e 1 Low.

| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
| CSP Header Not Set (Medium) | `/` | Vulnerabilidade real | Middleware de cabeçalhos de segurança no FastAPI ([commit](https://github.com/MuriloC564/cybershield/commit/f87c257e518602c9e37722597fb403afda3ea7fc)) | Ausente na run #7 |
| Missing Anti-clickjacking Header (Medium) | `/` | Vulnerabilidade real | `X-Frame-Options` + `frame-ancestors 'none'` | Ausente na run #7 |
| X-Content-Type-Options, Permissions-Policy, COOP, CORP (Low) | `/` | Vulnerabilidade real (hardening) | Cabeçalhos adicionados no middleware | Ausentes na run #7 |
| CSP: style-src unsafe-inline (Medium), **novo** | `/` | Risco aceito | Sem alteração. React/Vite aplica estilos inline; `script-src 'self'` permanece estrito, então o risco se limita a injeção de CSS, sem execução de JS | Presente nas runs #7 e #9, documentado |
| Cross-Origin-Embedder-Policy ausente (Low) | `/` | Risco aceito | Sem alteração. `require-corp` bloquearia Google Fonts, permitido na CSP | Presente nas runs #7 e #9, documentado |
| Modern Web Application / Storable and Cacheable Content (Info) | `/`, `/assets/*` | Informativo | Sem ação. Assets estáticos sem dado sensível, com hash no nome | N/A |

**Limitações:** o Baseline é passivo; o spider rodou no máximo 1 minuto e achou 5 endpoints (todos GET). A API autenticada (cadastro, login, quiz) não foi testada. "0 High" vale para o que foi alcançado, não prova ausência de falhas. O ZAP roda via `docker run` com imagem fixada por digest, e não pela `zaproxy/action-baseline`, por bug de nome de artifact na action (`The artifact name zap-bruto is not valid`, run #5). Permanece informativo (`-I`).

## Execuções bloqueadas por quality gate
O gate bloqueou o pipeline quatro vezes durante o desenvolvimento, sem precisar forçar:

| # | Etapa que bloqueou | Motivo | Correção | Execução |
|---|---|---|---|---|
| 1 | 2 (Semgrep) | 28 achados | Pin por SHA + `nosemgrep` justificado | [run #1](https://github.com/MuriloC564/cybershield/actions/runs/41217415332) |
| 2 | 4 (Trivy fs) | `python-jose` CRITICAL sem correção | Migração para PyJWT | [run #2](https://github.com/MuriloC564/cybershield/actions/runs/41218478278) |
| 3 | 4 (Trivy fs) | 6 CVEs HIGH/CRITICAL no `PyJWT 2.10.1` | Atualização para `2.15.1` | [run #3](https://github.com/MuriloC564/cybershield/actions/runs/41223098397) |
| 4 | 6 (Trivy image) | `starlette` HIGH | Atualização FastAPI/Starlette | [run #4](https://github.com/MuriloC564/cybershield/actions/runs/41224285856) |

Prints em `docs/evidencias/`.

## Aprovação humana e produção (Etapa 8)

- **Sem gate (run #6):** o registro de aprovações da [run #6](https://github.com/MuriloC564/cybershield/actions/runs/41226973226) está vazio: o environment `producao` ainda não tinha Required reviewers, então a etapa 8 rodou sem parar e falhou por conta do secret vazio. Corrigido configurando o revisor (MuriloC564) e conferindo com `gh api .../environments`.
- **Gate de rejeição:** nas [run #7](https://github.com/MuriloC564/cybershield/actions/runs/41228500946) e [run #8](https://github.com/MuriloC564/cybershield/actions/runs/41234658543) a etapa 8 ficou em Waiting e foi **rejeitada** por MuriloC564 (`state: rejected` em `/actions/runs/{id}/approvals`). As etapas 1 a 7 ficaram em success, a 8 em failure e o Resumo da Esteira rodou mesmo assim (`if: always()`). Isso prova que a rejeição interrompe o deploy.
- **Gate de aprovação:** na [run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606) a etapa 8 ficou em Waiting e foi aprovada por MuriloC564 em 31/10/2026 (horário: 17:25, horário de Brasília), com o comentário: *"Base da decisão: Gitleaks 0 segredos; Semgrep 0 achados (1 falso positivo suprimido com justificativa); build com 9 smoke tests passando, npm audit 0 e pip-audit 0; Trivy fs e Trivy image com 0 HIGH/CRITICAL; ZAP baseline com 0 alertas High (1 Medium e 1 Low tratados como risco aceito)."*
- **Deploy:** o job disparou o deploy hook do serviço `cybershield-prod` (Render, serviço de imagem) com `imgURL` apontando para `ghcr.io/muriloc564/cybershield:282ae54b0d24fa73c115ac7657d2d8a2f7d6bd58`. No Render, o deploy `5dbca22` ficou **Live** com *Trigger: Deploy Hook* e essa mesma imagem (print em `docs/evidencias/`).
- **URL de produção:** https://cybershield-prod-n2em.onrender.com

## Lições aprendidas (mínimo 5)
1. **Fixar versão não basta.** O `python-jose 3.5.0` estava fixado e mesmo assim tinha CVE CRITICAL sem correção. Pinning dá reprodutibilidade, não segurança; é preciso escanear continuamente.
2. **O Trivy fs não enxerga dependência indireta; o Trivy image sim.** O `starlette` vulnerável só apareceu na etapa 6, porque não estava no `requirements.txt`. As duas etapas se complementam.
3. **Atualizar o framework pode exigir mudança de código.** A atualização do Starlette obrigou a migrar `on_event` para `lifespan`. Por isso os testes locais (cadastro, login, quiz, F5) são parte do tratamento, não opcionais.
4. **Colar código pode apagar código.** Ao colar o middleware de cabeçalhos, o `CORSMiddleware` foi apagado por engano. O `git diff` antes do commit pegou o erro. Revisar o diff antes de cada commit é um controle real.
5. **Ferramentas de terceiros também falham.** A `zaproxy/action-baseline` quebrou com erro de nome de artifact; a solução foi `docker run` com imagem fixada por digest, mantendo o resultado auditável.
6. **Supressão exige justificativa.** O único `nosemgrep` e os riscos aceitos do ZAP (COEP, `unsafe-inline` em estilos) estão documentados aqui, para não virar "silenciar para ficar verde".
7. **A CSP resolve um alerta e pode criar outro.** "CSP ausente" virou "CSP com `unsafe-inline` em estilos". Hardening é iterativo.
8. **Tags de actions mudam e somem.** A `trivy-action 0.28.0` deixou de existir (as tags passaram a ter o prefixo `v`); sem pin por SHA e revisão periódica, a esteira quebra ou fica exposta. Há também avisos de actions ainda em Node 20 que precisam de revisão.
9. **Um deploy fora da esteira anula todos os gates.** O serviço antigo do Render (Node, ligado ao Git) tinha Auto-Deploy e publicava cada push direto em produção, inclusive commits que a esteira bloqueou. O Auto-Deploy foi desligado e a produção passou a ser um serviço de imagem, atualizado só pelo deploy hook da etapa 8. Regra de operação: o caminho de deploy é só a esteira; o *Manual Deploy* do painel pode usar a referência antiga da imagem.
10. **Um gate com o nome errado não protege.** A regra de revisores estava em um environment `Production`, enquanto o workflow usa `producao`; o gate real estava desligado. Na run #6 a etapa 8 rodou sem nenhum registro de aprovação, e só foi percebido ao conferir com `gh api .../environments`. Depois da correção, a rejeição nas runs #7 e #8 é a prova de que o gate funciona.
11. **Erro mascarado vira adivinhação.** O deploy falhou com `curl: (22) ... 400`, porque `--fail --silent` esconde o corpo da resposta. A mensagem real (`node environment does not support image URLs`) mostrou que o secret guardava o deploy hook do serviço **antigo**. Ao integrar APIs, registrar o corpo do erro (sem segredos) poupa tempo. Os segredos foram sempre conferidos e gravados sem expor o valor (`gh secret set` interativo, `Read-Host -AsSecureString`).
12. **As ferramentas de dependências divergem.** `npm audit`, `pip-audit` e Trivy encontraram coisas diferentes: o `vite` (HIGH) só aparecia no `npm audit` por ser devDependency, e o `python-dotenv` (MEDIUM) ficava abaixo do gate do Trivy. Classificar por alcançabilidade (build x runtime, código que realmente chama a função) evita tanto alarme falso quanto negligência.
13. **O health check não prova qual versão está no ar.** Durante o deploy, o Render mantém a versão antiga respondendo, então `/health` retorna 200 mesmo antes da imagem nova subir. A prova real é o registro de deploys do Render (trigger *Deploy Hook* e o SHA da imagem), que está nas evidências.
14. **Teste mostra como o sistema realmente se comporta.** Os smoke tests esperavam 400 para senhas diferentes e a API devolveu 422: a validação do schema (Pydantic) barra o pedido antes da rota. O teste foi corrigido, e a rota ganhou um caso que, na prática, nunca é alcançado.
15. **Tempo da esteira:** cerca de 5 a 6 minutos de execução automática até o ponto de aprovação (a etapa 7 com ZAP e a etapa 3 com build e testes são as mais longas), mais o tempo da aprovação humana. **O que melhorariam:** ZAP Full Scan e varredura da API autenticada (importando `/openapi.json`), Dependabot, SBOM e assinatura da imagem com Cosign, OIDC no deploy, testes de integração mais amplos e atualização periódica dos SHAs das actions.
