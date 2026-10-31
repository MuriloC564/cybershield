# Pipeline DevSecOps — explicação das etapas

Fluxo: push em main → 1 Gitleaks → 2 Semgrep → 3 Build/deps/artefato → 4 Trivy fs → 5 Docker/GHCR → 6 Trivy image → 7 Homologação + ZAP → (aprovação humana) → 8 Produção → ★ Resumo.

Para cada etapa descrever: objetivo, ferramenta e versão, quality gate, relatório gerado (artifact) e decisões da equipe.

## Decisões específicas do CyberShield
- Imagem única: o FastAPI serve o frontend (build do Vite) e a API no mesmo domínio.
- Homologação efêmera no runner, com Postgres de serviço e segredo JWT descartável.
- Produção: (preencher: provedor, URL, como as variáveis de ambiente são configuradas).
