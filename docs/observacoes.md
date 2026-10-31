# Observações da esteira DevSecOps — CyberShield

Uma tabela por ferramenta. Cada achado: identificador/severidade, onde, classificação
(vulnerabilidade real / falso positivo / risco aceito), ação (com link do commit) e resultado (execução seguinte).

## Gitleaks
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
|        |      |               |             |           |

## Semgrep
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
| `github-actions-mutable-action-tag` (WARNING), 27 ocorrências | `.github/workflows/devsecops.yml` | Vulnerabilidade real (supply chain): tags de actions são mutáveis | Todas as actions fixadas por SHA de commit, com a versão em comentário. Runner fixado em `ubuntu-24.04`. `trivy-action` atualizada para `v0.36.0`, porque a tag `0.28.0` não existe mais | Preencher com o link da execução seguinte sem o achado |
| `detect-non-literal-regexp` (WARNING) | `frontend/src/App.jsx:130` | Falso positivo | Suprimido com `// nosemgrep` e justificativa: a entrada passa por `escapeRegExp()` e vem das alternativas do quiz, não de input livre do usuário | Preencher com o link da execução seguinte sem o achado |

## Build / npm audit / pip-audit
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
|        |      |               |             |           |

## Trivy fs (SCA)
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
|        |      |               |             |           |

## Trivy image
Comparar com a etapa 4 (app x imagem base) e mostrar antes/depois da troca de imagem base, se houver.
| Achado | Onde | Classificação | Ação tomada | Resultado |
|--------|------|---------------|-------------|-----------|
|        |      |               |             |           |

## OWASP ZAP
| Achado | Onde (URL) | Classificação | Ação tomada | Resultado |
|--------|------------|---------------|-------------|-----------|
|        |            |               |             |           |

## Execução bloqueada por quality gate
Branch `teste-gate/...`, o que foi introduzido de propósito, qual etapa bloqueou, link da execução e correção.

## Lições aprendidas (mínimo 5)
1.
2.
3.
4.
5.
