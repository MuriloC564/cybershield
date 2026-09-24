# CyberShield - Como usar este esqueleto

## O que já está pronto
- Backend em FastAPI com endpoint de teste (`/health`)
- Frontend em React + Vite já configurado pra chamar o backend
- CORS já liberado entre as duas partes

## Passo a passo pra rodar

### 1. Copiar os arquivos pra pasta do repositório
Copiem as pastas `backend/` e `frontend/`, e o arquivo `.gitignore` (se ainda não existir um)
para dentro da pasta do repositório `cybershield` que vocês clonaram com o GitHub Desktop.

### 2. Rodar o backend
Abram um terminal dentro da pasta `backend/` e sigam as instruções do `README.md` de lá.

### 3. Rodar o frontend
Abram OUTRO terminal (deixem os dois abertos ao mesmo tempo) dentro da pasta `frontend/`
e sigam as instruções do `README.md` de lá.

### 4. Testar
Com os dois rodando, acessem http://localhost:5173 no navegador.
Se aparecer "Backend respondeu: ok" em verde, está tudo funcionando.

### 5. Commitar no GitHub
Voltem pro GitHub Desktop, revisem as mudanças e façam o commit (ex: "Setup inicial do backend e frontend"),
depois cliquem em "Push origin" pra subir pro GitHub.

## Próximos passos do projeto
- [ ] Configurar PostgreSQL e conectar no backend
- [ ] Criar modelo de usuário e sistema de login (JWT)
- [ ] Integrar API da OpenAI (GPT-4o) para gerar perguntas
- [ ] Criar sistema de pontuação
- [ ] Criar telas de quiz e ranking no frontend
- [ ] Deploy em Railway/Render
