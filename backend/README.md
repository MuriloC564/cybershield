# CyberShield - Backend

## Como rodar localmente

1. Criem um ambiente virtual:
   ```
   python -m venv venv
   ```

2. Ativem o ambiente virtual:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. Instalem as dependências:
   ```
   pip install -r requirements.txt
   ```

4. Rodem o servidor:
   ```
   uvicorn main:app --reload
   ```

5. Acessem no navegador: http://localhost:8000
   - Documentação automática da API: http://localhost:8000/docs
