from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "system",
            "content": (
                "Você é um gerador de perguntas de quiz sobre cibersegurança. "
                "Responda APENAS com um JSON válido, sem nenhum texto antes ou depois, "
                "sem markdown, sem explicações. Formato exato: "
                '{"pergunta": "...", "alternativas": ["...", "...", "...", "..."], "resposta_correta": 0}'
            )
        },
        {"role": "user", "content": "Gere uma pergunta sobre phishing."}
    ]
)

conteudo_bruto = response.choices[0].message.content

# Remove qualquer bloco de markdown (```json ... ```) que o modelo insista em incluir
conteudo_limpo = re.sub(r"^```json\s*|\s*```$", "", conteudo_bruto.strip())

try:
    pergunta_data = json.loads(conteudo_limpo)
    print("JSON parseado com sucesso:\n")
    print(json.dumps(pergunta_data, indent=2, ensure_ascii=False))
except json.JSONDecodeError as e:
    print("Falhou ao parsear o JSON. Resposta bruta recebida:")
    print(conteudo_bruto)
    print(f"\nErro: {e}")