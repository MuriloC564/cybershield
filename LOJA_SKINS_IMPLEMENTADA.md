# Loja de skins — implementação

## O que foi adicionado
- Nova aba **Loja** no menu principal.
- Carteira de **créditos** persistida no PostgreSQL.
- Cada acerto continua aumentando a pontuação normal e também rende a mesma quantidade em créditos.
- Comprar uma skin desconta apenas créditos; **não reduz a pontuação/ranking**.
- Inventário de skins por usuário.
- Skin equipada por personagem salva no backend.
- A aba **Personagens** passa a mostrar a skin equipada.
- Catálogo inicial preparado para Clara e Murilo, além das skins padrão dos demais personagens.

## Antes de iniciar o backend
Execute uma vez:

```bash
cd backend
python migrate_loja.py
```

A migração cria `usuarios.creditos`, `skins_compradas` e `skins_equipadas`. Na primeira execução, usuários antigos recebem créditos equivalentes aos pontos que já possuíam.

## Artes esperadas
Coloque as PNGs transparentes nestes caminhos:

- `frontend/public/historia/personagens/clara/skins/red-hat.png`
- `frontend/public/historia/personagens/clara/skins/reigan.png`
- `frontend/public/historia/personagens/murilo/skins/cinzas-do-ringue.png`

Enquanto uma arte não existir, o card da loja usa a imagem padrão do personagem como fallback.

## Preços iniciais
- Clara — Red Hat: 180 créditos
- Clara — Reigan: 300 créditos
- Murilo — Cinzas do Ringue: 500 créditos

O catálogo fica em `backend/main.py`, na constante `SKINS_PERSONAGENS`.
