# CyberShield — Esteira DevSecOps

[![DevSecOps Pipeline](https://github.com/MuriloC564/cybershield/actions/workflows/devsecops.yml/badge.svg)](https://github.com/MuriloC564/cybershield/actions/workflows/devsecops.yml)

**Produção:** https://cybershield-prod-n2em.onrender.com

## Integrante

| Nome | RM | Turma |
|---|---|---|
| Murilo Chaves Amorim | 564702 | 2TDCPG |

Trabalho individual — FIAP, disciplina DevSecOps: *Esteira de Segurança com GitHub Actions*.

## Sobre o projeto

O **CyberShield** é uma plataforma gamificada de conscientização em cibersegurança: o usuário escolhe uma área (Cyber, RH ou Modo Geral), responde a perguntas de quiz geradas por IA, acumula pontos, sequências de acertos (combo) e conquistas, e compra skins na loja. Foi desenvolvido no Challenge e, nesta atividade, levado à produção por uma esteira DevSecOps automatizada, com segurança verificada em cada etapa.

**Stack:** React 19 + Vite (frontend), FastAPI + SQLAlchemy + PostgreSQL + JWT/PyJWT (backend), IA via Groq. O produto final é **uma imagem Docker única**: o build do frontend é servido pelo próprio FastAPI, na mesma origem da API.

## Diagrama da esteira

```mermaid
flowchart LR
  A["push (main)"] --> B["1 Gitleaks"]
  B --> C["2 Semgrep"]
  C --> D["3 Build, deps, testes"]
  D --> E["4 Trivy fs"]
  E --> F["5 Docker build + GHCR"]
  F --> G["6 Trivy image"]
  G --> H["7 Homologação + ZAP"]
  H --> I{{"Aprovação humana"}}
  I --> J["8 Deploy em produção"]
  J --> K["★ Resumo da Esteira"]
```

Cada etapa só executa se a anterior terminar com sucesso. O job **Resumo da Esteira** roda sempre (`if: always()`), mesmo quando uma etapa falha, para mostrar o ponto de quebra.

## As 8 etapas

Relatórios da execução completa mais recente: [run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606) (seção *Artifacts*).

| # | Etapa | Ferramenta | Objetivo | Quality gate | Relatório (artifact) |
|---|---|---|---|---|---|
| 1 | Secrets | Gitleaks 8.18.4 | Nenhuma credencial no código nem no histórico do Git (`fetch-depth: 0`, `--redact`) | Bloqueia se achar qualquer segredo | `relatorio-01-gitleaks` |
| 2 | SAST | Semgrep 1.75.0 (`p/default`, `p/owasp-top-ten`, `p/python`, `p/javascript`) | Vulnerabilidades e más práticas no código-fonte | Bloqueia com achados (`--error`) | `relatorio-02-semgrep` |
| 3 | Build, dependências e testes | npm, pip, `npm audit`, `pip-audit`, pytest | Build reprodutível (`npm ci`), inventário e auditoria de dependências, 9 smoke tests, artefato nomeado pelo SHA | Bloqueia se build ou testes falharem (a auditoria é informativa) | `relatorio-03-build`, `artefato-aplicacao` |
| 4 | SCA | Trivy (`fs`) | CVEs em bibliotecas de terceiros e *misconfigurations* | Bloqueia HIGH/CRITICAL | `relatorio-04-trivy-sca` |
| 5 | Imagem | Docker Buildx + GHCR | Build multi-stage e publicação em `ghcr.io` com tag igual ao SHA do commit | Bloqueia se build ou push falharem | `relatorio-05-docker-build` |
| 6 | Scan da imagem | Trivy (`image`) | Vulnerabilidades da imagem publicada (SO e dependências, inclusive indiretas) | Bloqueia HIGH/CRITICAL com correção (`--ignore-unfixed`) | `relatorio-06-trivy-image` |
| 7 | Homologação + DAST | OWASP ZAP Baseline | Imagem aprovada sobe efêmera no runner (com Postgres de serviço) e é testada "de fora para dentro" | Informativo; a decisão é do aprovador | `relatorio-07-homologacao-zap` |
| 8 | Aprovação + produção | GitHub Environments + Render | Deploy só após aprovação humana, com a imagem pelo SHA | Aprovação manual; rejeição interrompe | `relatorio-08-producao` |
| ★ | Resumo da Esteira | jq + Job Summary | Consolida status e contagem de achados de todas as etapas | Sempre executa | `resumo-da-esteira` |

Explicação detalhada de cada etapa em [`docs/pipeline.md`](docs/pipeline.md).

### Trivy fs (etapa 4) x Trivy image (etapa 6)

- **Etapa 4 (`trivy fs`)** lê só os arquivos de dependência declarados (`package-lock.json`, `requirements.txt`) e os arquivos de configuração. Ela encontra vulnerabilidades **da aplicação**: as bibliotecas que escolhemos.
- **Etapa 6 (`trivy image`)** inspeciona a imagem pronta: pacotes do sistema operacional da imagem base **e** dependências indiretas. Foi ela que achou 3 CVEs HIGH no `starlette`, dependência indireta do FastAPI que não aparece no `requirements.txt`.
- No relatório completo da imagem final há 44 HIGH do sistema operacional (Debian) **sem correção publicada**; como o gate usa `--ignore-unfixed`, eles não bloqueiam. A decisão está registrada como risco aceito em [`docs/observacoes.md`](docs/observacoes.md).

### Adaptação da etapa 3 (Node + Python)

O exemplo da atividade usa só Node.js. O CyberShield tem duas stacks, então a etapa 3 instala e builda o frontend (`npm ci`, `npm run build`, `npm audit`) e instala, checa a sintaxe e audita o backend (`pip install`, `compileall`, `pip-audit`). Os testes de smoke do backend rodam contra um Postgres de serviço.

### Sobre o Resumo da Esteira

O job de resumo depende de todas as etapas, inclusive da 8, então só é gerado **depois** da aprovação (ou rejeição) do deploy. Não foi criado um resumo parcial antes da aprovação.

## Resumo da Esteira de uma execução completa

Execução [#9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606): 8 etapas e o Resumo em sucesso.

![Resumo da Esteira](docs/evidencias/04-resumo-da-esteira.png)

## Registro da aprovação humana

| | |
|---|---|
| **Quem aprovou** | MuriloC564 (revisor obrigatório do environment `producao`) |
| **Quando** | 31/10/2026, 17:25 (horário de Brasília) |
| **Execução** | [run #9](https://github.com/MuriloC564/cybershield/actions/runs/41237584606), commit `282ae54` |
| **Imagem aprovada** | `ghcr.io/muriloc564/cybershield:282ae54b0d24fa73c115ac7657d2d8a2f7d6bd58` |

**Base da decisão (comentário registrado na aprovação):** Gitleaks 0 segredos; Semgrep 0 achados (1 falso positivo suprimido com justificativa em `docs/observacoes.md`); build com 9 smoke tests passando, `npm audit` 0 e `pip-audit` 0 vulnerabilidades; Trivy fs e Trivy image com 0 HIGH/CRITICAL; ZAP baseline com 0 alertas High (1 Medium e 1 Low tratados como risco aceito).

Resultado no Render: deploy `5dbca22` **Live**, *Trigger: Deploy Hook*, com a imagem do SHA acima.

As runs [#7](https://github.com/MuriloC564/cybershield/actions/runs/41228500946) e [#8](https://github.com/MuriloC564/cybershield/actions/runs/41234658543) foram **rejeitadas** na etapa 8, o que demonstra que a rejeição interrompe o deploy.

## URL de produção

https://cybershield-prod-n2em.onrender.com — o serviço roda no plano gratuito do Render e hiberna por inatividade; a primeira requisição pode levar cerca de 50 segundos.

## Como executar

### Localmente (desenvolvimento)

Pré-requisitos: Python 3.12+, Node 22+, um PostgreSQL acessível.

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # preencha DATABASE_URL, JWT_SECRET_KEY e GROQ_API_KEY
uvicorn main:app --reload           # http://localhost:8000

# Frontend (outro terminal)
cd frontend
npm ci
npm run dev                         # http://localhost:5173
```

Para gerar um `JWT_SECRET_KEY` forte: `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Sem a `GROQ_API_KEY`, a geração de perguntas por IA fica indisponível.

### Via Docker (imagem única)

```bash
# 1) Postgres de teste
docker run -d --name pg-teste -e POSTGRES_USER=teste -e POSTGRES_PASSWORD=teste \
  -e POSTGRES_DB=cybershield -p 5432:5432 postgres:16-alpine

# 2) Build da imagem
docker build -t cybershield .

# 3) Execução
docker run --rm -p 8080:8080 \
  -e DATABASE_URL="postgresql://teste:teste@host.docker.internal:5432/cybershield" \
  -e DB_SSLMODE=disable \
  -e JWT_SECRET_KEY="<valor-longo-e-aleatorio>" \
  cybershield
```

Abra http://localhost:8080. O app exige SSL na conexão com o banco por padrão (`DB_SSLMODE=require`); `DB_SSLMODE=disable` é só para um Postgres local sem SSL. No Linux, troque `host.docker.internal` pelo IP do host ou use `--network host`.

### Testes

```bash
cd backend
pip install -r requirements-dev.txt
export DATABASE_URL="postgresql://teste:teste@localhost:5432/cybershield"
python -m pytest -v
```

## Boas práticas aplicadas

- `permissions: contents: read` no topo do workflow; `packages: write` só na etapa 5; `packages: read` nas etapas 6 e 7.
- Todas as actions fixadas por **SHA de commit**, runner `ubuntu-24.04`, ferramentas e imagens com versão fixada (o ZAP, por digest).
- Dockerfile multi-stage, imagem final `python:3.12-slim`, usuário **não-root**, sem segredos em `ENV`/`ARG`, `.dockerignore` configurado, tag da imagem = SHA do commit (nunca `latest`).
- Segredos só em *Environment secrets* do `producao` (deploy hook) e no painel do provedor (banco, JWT, chave da IA). O `.env` nunca é versionado.
- O deploy em produção acontece **somente** pela etapa 8. O Auto-Deploy do Render foi desativado e o serviço usa a imagem do GHCR, para que nenhum caminho contorne os quality gates.
- Supressões (um `nosemgrep`) e riscos aceitos só com justificativa escrita em [`docs/observacoes.md`](docs/observacoes.md).

## Documentação e evidências

- [`docs/pipeline.md`](docs/pipeline.md): explicação de cada etapa.
- [`docs/observacoes.md`](docs/observacoes.md): achados, correções, falsos positivos, riscos aceitos e lições aprendidas.
- [`docs/evidencias/`](docs/evidencias/): prints das execuções (execução bloqueada por quality gate, aprovação pendente, execução completa, Resumo da Esteira, deploy no Render, aplicação em produção e imagem em Packages).

| Evidência | Arquivo |
|---|---|
| Execução bloqueada por quality gate (Semgrep) | `docs/evidencias/01-execucao-bloqueada-semgrep.png` |
| Tela de aprovação do environment `producao` | `docs/evidencias/02-aprovacao-pendente.png` |
| Execução completa | `docs/evidencias/03-execucao-completa.png` |
| Resumo da Esteira | `docs/evidencias/04-resumo-da-esteira.png` |
| Deploy no Render (trigger *Deploy Hook*) | `docs/evidencias/05-render-deploy-hook.png` |
| Aplicação em produção | `docs/evidencias/06-app-em-producao.png` |
| Imagem publicada em Packages | `docs/evidencias/07-ghcr-packages.png` |
| Rejeição do deploy pelo aprovador (run #7) | `docs/evidencias/08-gate-rejeicao-run7.png` |
| Etapa 8 sem gate e com secret vazio (run #7, 1ª tentativa) | `docs/evidencias/09-run7-etapa8-sem-gate.png` |
| Environments antes da correção (gate no environment errado) | `docs/evidencias/10-environments-antes-da-correcao.png` |
| Serviço antigo do Render com Auto-Deploy | `docs/evidencias/11-render-servico-antigo-auto-deploy.png` |
| Bloqueio do Trivy fs (run #2, `python-jose`) | `docs/evidencias/12-bloqueio-trivy-fs-run2.png` |
| Bloqueio do Trivy image (run #4, `starlette`) | `docs/evidencias/13-bloqueio-trivy-image-run4.png` |
| Falha da action do ZAP (run #5) | `docs/evidencias/14-falha-zap-action-run5.png` |
| Configuração final do environment `producao` | `docs/evidencias/16-environment-producao-final.png` |
