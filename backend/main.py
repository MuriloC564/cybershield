import os
import json
import random
import re
import secrets
from difflib import SequenceMatcher
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from openai import OpenAI
from database import SessionLocal, engine, Base
from models import Usuario, Categoria, Pontuacao, SkinComprada, SkinEquipada
from schemas import UsuarioCadastro, UsuarioLogin, RespostaQuiz, RecuperarSenha, RedefinirSenha, CompraSkin, EquiparSkin
from auth import hash_senha, verificar_senha, criar_token, usuario_atual

load_dotenv()
app = FastAPI(title="CyberShield API")

ORIGENS_PERMITIDAS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://cybershield-liart.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENS_PERMITIDAS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
client_ia = None
if GROQ_API_KEY:
    client_ia = OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")



SKINS_PERSONAGENS = [
    {"id":"clara-padrao","personagem_id":"clara","nome":"Sentinela","raridade":"comum","preco":0,"imagem":"/historia/personagens/clara/perfil.png","descricao":"Visual padrão da Clara."},
    {"id":"clara-red-hat","personagem_id":"clara","nome":"Red Hat","raridade":"rara","preco":180,"imagem":"/historia/personagens/clara/skins/red-hat.png","descricao":"Uma skin inspirada no universo Linux e Red Hat."},
    {"id":"clara-reigan","personagem_id":"clara","nome":"Reigan","raridade":"epica","preco":300,"imagem":"/historia/personagens/clara/skins/reigan.png","descricao":"Visual especial com pose de disparo espiritual."},
    {"id":"murilo-padrao","personagem_id":"murilo","nome":"Rei dos Anões","raridade":"comum","preco":0,"imagem":"/historia/personagens/murilo/perfil.png","descricao":"Visual padrão do Murilo."},
    {"id":"murilo-boxe","personagem_id":"murilo","nome":"Cinzas do Ringue","raridade":"lendaria","preco":500,"imagem":"/historia/personagens/murilo/skins/cinzas-do-ringue.png","descricao":"Homenagem aos grandes clássicos do mangá de boxe."},
    {"id":"murilo-nouzen","personagem_id":"murilo","nome":"Ceifador 86","raridade":"epica","preco":420,"imagem":"/historia/personagens/murilo/skins/ceifador-86.png","descricao":"Visual militar inspirado no Capitão Nouzen, com uniforme de campanha e lenço claro."},
    {"id":"vitor-padrao","personagem_id":"vitor","nome":"Salame","raridade":"comum","preco":0,"imagem":"/historia/personagens/vitor/perfil.png","descricao":"Visual padrão do Vitor."},
    {"id":"lincoln-padrao","personagem_id":"lincoln","nome":"Raio-X","raridade":"comum","preco":0,"imagem":"/historia/personagens/lincoln/perfil.png","descricao":"Visual padrão do Lincoln."},
    {"id":"enzo-padrao","personagem_id":"enzo","nome":"Route Breaker","raridade":"comum","preco":0,"imagem":"/historia/personagens/enzo/perfil.png","descricao":"Visual padrão do Enzo."},
    {"id":"beoni-padrao","personagem_id":"beoni","nome":"Terminal","raridade":"comum","preco":0,"imagem":"/historia/personagens/beoni/perfil.png","descricao":"Visual padrão do Beoni."},
    {"id":"rafaela-padrao","personagem_id":"rafaela","nome":"Resposta Zero","raridade":"comum","preco":0,"imagem":"/historia/personagens/rafaela/perfil.png","descricao":"Visual padrão da Rafaela."},
    {"id":"cleiton-padrao","personagem_id":"cleiton","nome":"Guardião do SOC","raridade":"comum","preco":0,"imagem":"/historia/personagens/cleiton/perfil.png","descricao":"Visual padrão do Cleiton."},
    {"id":"fabio-padrao","personagem_id":"fabio","nome":"Bruxo do Linux","raridade":"comum","preco":0,"imagem":"/historia/personagens/fabio/perfil.png","descricao":"Visual padrão do Fábio."},
]
SKINS_POR_ID = {skin["id"]: skin for skin in SKINS_PERSONAGENS}

def carteira_usuario(db: Session, usuario: Usuario):
    compradas = {x.skin_id for x in db.query(SkinComprada).filter(SkinComprada.usuario_id == usuario.id).all()}
    equipadas = {x.personagem_id: x.skin_id for x in db.query(SkinEquipada).filter(SkinEquipada.usuario_id == usuario.id).all()}
    return compradas, equipadas

NIVEIS = ["easy", "medium", "hard"]
TITULOS = [
    (0, "Iniciante"),
    (50, "Aprendiz"),
    (150, "Analista"),
    (300, "Especialista"),
    (500, "Hackudão"),
]

SUBTEMAS = {
    "phishing": ["identificação de phishing", "e-mails falsos", "smishing", "vishing", "spear phishing", "engenharia social", "sites falsos", "anexos maliciosos", "inspeção de url"],
    "mitre": ["MITRE ATT&CK", "táticas", "Initial Access", "Persistence", "Lateral Movement", "Credential Access", "Exfiltration", "Privilege Escalation"],
    "eventos-historicos": ["WannaCry", "Stuxnet", "SolarWinds", "Colonial Pipeline", "Mirai", "Equifax", "Yahoo", "ransomware"],
    "curiosidades": ["história da cibersegurança", "criptografia", "senhas", "2FA", "malware", "firewall", "vulnerabilidades", "segurança digital"],
    "rh-basico": ["recrutamento", "onboarding", "avaliação de desempenho", "cultura organizacional", "feedback", "desenvolvimento", "comunicação interna", "processos seletivos"],
}

def Q(pergunta, correta, errada1, errada2, errada3, explicacao, cenario_tipo="padrao", cenario_titulo="", cenario_conteudo=""):
    return {
        "pergunta": pergunta,
        "alternativas": [correta, errada1, errada2, errada3],
        "resposta_correta": 0,
        "explicacao": explicacao,
        "cenario_tipo": cenario_tipo,
        "cenario_titulo": cenario_titulo,
        "cenario_conteudo": cenario_conteudo,
    }

PERGUNTAS_BACKUP = {
    "phishing": [
        Q("Analise a seguinte URL recebida por e-mail. O que indica que ela é maliciosa?", "A substituição do 'l' por '1' em paypa1", "O uso do protocolo HTTPS", "O domínio terminar em .com", "A presença da palavra 'secure'", "Golpistas usam caracteres parecidos para registrar domínios falsos e enganar a vítima.", "url", "Inspetor de URL", "https://www.paypa1-secure.com/login"),
        Q("Você recebeu esta mensagem no WhatsApp corporativo. O que você deve fazer?", "Ignorar e não clicar, pois é engenharia social", "Clicar no link para verificar a conta", "Encaminhar para outros colegas para ver se funcionou", " responder agradecendo", "Golpistas usam urgência em canais de chat para roubar credenciais rapidamente.", "chat", "WhatsApp - TI Corporativo", "🚨 ALERTA: Sua conta será bloqueada em 2h! Acesse http://bit.ly/secure-now para manter seu acesso."),
        Q("Por favor, valide sua conta para evitar o bloqueio em 15 minutos.", "O e-mail usa um domínio falsificado", "A presença do logotipo da Microsoft", "O fato de pedir para clicar em um link", "O horário de envio do e-mail", "Golpistas costumam substituir letras por números em domínios falsos.", "email", "suporte@micros0ft-seguranca.com", "Alerta de Segurança: Conta Bloqueada"),
        Q("Qual é um sinal comum de phishing?", "Urgência para clicar ou fornecer dados", "Backup automático", "Atualização normal do sistema", "Arquivo criado pelo próprio usuário", "Golpes de phishing frequentemente usam urgência e pressão."),
        Q("O que é phishing?", "Uma tentativa de enganar alguém para obter informações", "Um firewall", "Um backup", "Um protocolo de rede", "Phishing usa engenharia social para enganar vítimas."),
        Q("O que fazer ao receber um link suspeito?", "Verificar o endereço por um canal confiável", "Clicar imediatamente", "Enviar para todos os colegas", "Desativar o antivírus", "Links suspeitos devem ser verificados antes do acesso."),
        Q("O que caracteriza spear phishing?", "Um golpe direcionado a um alvo específico", "Um backup", "Um ataque físico", "Um problema de impressora", "Spear phishing é mais direcionado que campanhas genéricas."),
        Q("O que é smishing?", "Phishing realizado por mensagens", "Um antivírus", "Um firewall", "Um backup", "Smishing normalmente utiliza SMS ou aplicativos de mensagens."),
        Q("O que é vishing?", "Phishing realizado por chamadas de voz", "Phishing por arquivos ZIP", "Um protocolo de rede", "Um antivírus", "Vishing utiliza comunicação de voz para aplicar engenharia social."),
        Q("Por que verificar o domínio de um site é importante?", "Um atacante pode usar um domínio parecido com o legítimo", "Todo domínio externo é perigoso", "O domínio revela a senha", "O domínio aumenta a internet", "Domínios semelhantes podem ser usados em páginas falsas."),
    ],
    "mitre": [
        Q("Analise o log de monitoramento. Qual tática está sendo executada?", "Lateral Movement", "Initial Access", "Impact", "Defense Evasion", "O atacante está se movendo entre sistemas da rede, caracterizando movimentação lateral.", "log", "Servidor de Monitoramento - Alerta Crítico", "[08:14:32] ALERTA: Usuário 'admin' acessou \\\\fileserver\\\\backup\\\\. IP de origem: 192.168.1.50 (Estação de Trabalho)."),
        Q("O que é o MITRE ATT&CK?", "Uma base de conhecimento sobre técnicas e táticas de ataques", "Um antivírus", "Um sistema operacional", "Um serviço de armazenamento", "O MITRE ATT&CK organiza comportamentos de adversários."),
        Q("O que uma tática representa no MITRE ATT&CK?", "O objetivo que o adversário busca alcançar", "O endereço IP", "A senha da vítima", "O modelo do computador", "Táticas representam objetivos dos adversários."),
        Q("Qual destas é uma tática do MITRE ATT&CK?", "Initial Access", "Tela azul", "Backup completo", "Formatação", "Initial Access é uma tática do framework."),
        Q("Qual é o objetivo de Persistence?", "Manter acesso a um ambiente comprometido", "Aumentar a internet", "Criar backups", "Remover usuários", "Persistence trata da manutenção do acesso."),
        Q("O que representa Lateral Movement?", "Movimentação entre sistemas ou recursos da rede", "Criação de uma senha", "Atualização do antivírus", "Criptografia de arquivo", "Lateral Movement representa movimentação dentro do ambiente."),
        Q("Qual é a finalidade de Credential Access?", "Obter credenciais ou informações de autenticação", "Aumentar a memória RAM", "Instalar impressoras", "Atualizar o sistema", "Credential Access envolve obtenção de credenciais."),
        Q("O que caracteriza Exfiltration?", "Transferência de dados para fora do ambiente", "Criar usuários", "Instalar atualizações", "Limpar arquivos", "Exfiltration trata da retirada de dados."),
        Q("Por que o MITRE ATT&CK é útil?", "Ajuda a mapear comportamentos de ataques e defesas", "Substitui firewalls", "Garante que nenhum ataque acontecerá", "É um gerenciador de senhas", "O framework ajuda equipes a entender e mapear ataques."),
        Q("O que uma técnica descreve no MITRE ATT&CK?", "Como um adversário pode executar uma ação", "O preço de um antivírus", "O modelo do computador", "A velocidade da rede", "Técnicas descrevem métodos usados pelos adversários."),
    ],
    "eventos-historicos": [
        Q("Qual foi a principal consequência do ataque de ransomware citado na notícia?", "Paralização de serviços essenciais e infraestrutura", "Aumento da velocidade da internet", "Lançamento de um novo software", "Diminuição do preço de hardware", "O ransomware costuma interromper operações críticas de organizações.", "noticia", "Portal de Notícias - Tecnologia", "URGENTE: Empresa de logística sofre ataque de Ransomware. Operações estão paradas há 48 horas e resgate é exigido em criptomoedas."),
        Q("O WannaCry ficou conhecido principalmente por qual tipo de ataque?", "Ransomware", "Phishing telefônico", "Roubo físico", "Ataque Bluetooth", "WannaCry foi um grande ataque de ransomware."),
        Q("O Stuxnet ficou associado a qual contexto?", "Sistemas industriais", "Redes sociais", "Jogos online", "Impressoras domésticas", "Stuxnet ficou conhecido por atingir sistemas industriais."),
        Q("O ataque da SolarWinds é exemplo de quê?", "Ataque à cadeia de suprimentos de software", "Falha de impressora", "Ataque físico", "Golpe telefônico", "SolarWinds é um caso importante de supply chain attack."),
        Q("O incidente da Colonial Pipeline envolveu principalmente qual ameaça?", "Ransomware", "Bluetooth", "Roubo de celulares", "Vírus de macro", "O incidente foi associado a ransomware."),
        Q("A botnet Mirai ficou conhecida por explorar principalmente quais dispositivos?", "Dispositivos IoT", "Relógios mecânicos", "Impressoras offline", "Discos externos", "Mirai comprometeu dispositivos IoT para ataques DDoS."),
        Q("O caso Equifax ficou relacionado principalmente a qual problema?", "Grande vazamento de dados pessoais", "Falha de energia", "Roubo de celulares", "Ataque físico", "O incidente envolveu exposição de dados pessoais."),
        Q("Por que o WannaCry teve impacto tão amplo?", "Conseguiu se espalhar rapidamente entre sistemas vulneráveis", "Funcionava somente sem rede", "Afetava apenas celulares", "Dependia de Bluetooth", "A propagação entre sistemas vulneráveis ampliou o impacto."),
        Q("Por que ataques à cadeia de suprimentos são preocupantes?", "Um componente confiável pode atingir muitos clientes", "Eles nunca usam software", "Afetam apenas um computador", "Não podem explorar vulnerabilidades", "Comprometer um fornecedor pode ampliar o alcance do ataque."),
        Q("Qual é uma lição de grandes ataques de ransomware?", "Backups, correções e preparação são importantes", "Backups devem ser evitados", "Senhas não precisam ser protegidas", "Atualizações são sempre perigosas", "Preparação e backups ajudam a reduzir impactos."),
    ],
    "curiosidades": [
        Q("O que significa 2FA?", "Autenticação de dois fatores", "Firewall de duas áreas", "Dois arquivos de acesso", "Análise de duas redes", "2FA adiciona uma segunda etapa de autenticação."),
        Q("Por que senhas longas são mais resistentes?", "Aumentam o espaço de combinações possíveis", "Aumentam a velocidade do PC", "Impedem todo malware", "Substituem o firewall", "Senhas maiores aumentam a dificuldade de adivinhação."),
        Q("O que é autenticação multifator?", "Uso de mais de um fator para confirmar identidade", "Uso de uma única senha", "Um antivírus", "Um backup", "MFA combina diferentes fatores de autenticação."),
        Q("O que é criptografia?", "Transformação de dados para protegê-los contra acesso indevido", "Aumento de memória", "Um malware", "Um navegador", "Criptografia protege informações usando técnicas matemáticas."),
        Q("O que é um firewall?", "Um mecanismo que controla tráfego de rede conforme regras", "Um gerador de senhas", "Um editor de imagens", "Um ransomware", "Firewalls filtram tráfego conforme políticas."),
        Q("O que significa malware?", "Software malicioso", "Software de edição", "Hardware de rede", "Sistema de backup", "Malware é software criado com finalidade maliciosa."),
        Q("Qual é uma boa prática para senhas?", "Usar senhas únicas em diferentes serviços", "Compartilhar senhas", "Desativar MFA", "Publicar senhas", "Senhas únicas reduzem o impacto de vazamentos."),
        Q("Para que serve um gerenciador de senhas?", "Armazenar e gerar credenciais de forma protegida", "Remover todo malware", "Substituir firewalls", "Aumentar a internet", "Gerenciadores ajudam a usar senhas únicas."),
        Q("O que é uma vulnerabilidade?", "Uma fraqueza que pode ser explorada", "Uma senha longa", "Um backup", "Um navegador", "Vulnerabilidades podem ser exploradas por atacantes."),
        Q("Por que manter sistemas atualizados é importante?", "Atualizações podem corrigir vulnerabilidades conhecidas", "Eliminam todas as senhas", "Impedem qualquer ataque", "Substituem backups", "Correções podem eliminar falhas conhecidas."),
    ],
    "rh-basico": [
        Q("Você recebeu esta mensagem do seu superior no WhatsApp. O que você deve fazer?", "Verificar presencialmente ou por outro canal oficial antes de qualquer ação", "Fazer a transferência imediatamente para resolver o problema", "Pedir o número da conta novamente", "Ignorar completamente sem verificar", "Golpistas se passam por superiores pedindo urgência. Sempre confirme por outro canal.", "chat", "WhatsApp - Chefe Imediato", "Oi, tudo bem? Estou em uma reunião e preciso que você faça uma transferência urgente para o fornecedor. Depois faço o reembolso. Pode ser?"),
        Q("O que é onboarding?", "Processo de integração de uma nova pessoa à organização", "Processo de demissão", "Um firewall", "Um sistema operacional", "Onboarding ajuda na integração de novos colaboradores."),
        Q("Qual é uma boa prática em uma entrevista?", "Usar critérios relacionados à vaga e evitar discriminação", "Escolher pela idade", "Ignorar requisitos", "Avaliar somente aparência", "Critérios objetivos tornam o processo mais justo."),
        Q("Para que serve uma avaliação de desempenho?", "Acompanhar resultados e oportunidades de desenvolvimento", "Eliminar funcionários automaticamente", "Substituir treinamentos", "Controlar senhas", "Avaliações ajudam no acompanhamento e desenvolvimento."),
        Q("O que caracteriza um feedback construtivo?", "É específico, respeitoso e orientado à melhoria", "É humilhante", "Evita exemplos", "Serve apenas para punir", "Feedback construtivo orienta melhorias."),
        Q("O que é cultura organizacional?", "Conjunto de valores, comportamentos e práticas compartilhados", "Um software", "Um contrato", "Um antivírus", "Cultura influencia o ambiente e os comportamentos da organização."),
        Q("Por que um plano de desenvolvimento profissional é útil?", "Ajuda a definir competências, metas e ações", "Elimina feedback", "Impede mudanças", "Substitui todas as avaliações", "Planos ajudam a transformar necessidades em objetivos."),
        Q("Qual é um objetivo da comunicação interna?", "Garantir que informações relevantes cheguem às pessoas certas", "Esconder informações", "Evitar documentação", "Compartilhar senhas", "Comunicação clara ajuda no alinhamento das equipes."),
        Q("Qual atitude contribui para um recrutamento justo?", "Definir critérios objetivos relacionados à função", "Escolher por amizade", "Ignorar requisitos", "Usar critérios diferentes sem justificativa", "Critérios objetivos tornam o processo mais consistente."),
        Q("Por que documentar objetivos de uma equipe é útil?", "Facilita acompanhamento e avaliação de resultados", "Impede colaboração", "Substitui comunicação", "Serve somente para punição", "Objetivos documentados facilitam acompanhamento."),
        Q("Qual é uma boa prática durante a integração de um novo colaborador?", "Apresentar processos, pessoas, ferramentas e expectativas", "Deixar sem orientação", "Compartilhar senhas", "Evitar acompanhamento", "Uma integração estruturada facilita a adaptação."),
    ],
}

perguntas_recentes = {}
MAX_PERGUNTAS_HISTORICO = 100

def normalizar_pergunta(texto: str) -> str:
    if not texto: return ""
    texto = str(texto).strip().lower()
    substituicoes = str.maketrans({"á": "a", "à": "a", "ã": "a", "â": "a", "ä": "a", "é": "e", "è": "e", "ê": "e", "ë": "e", "í": "i", "ì": "i", "î": "i", "ï": "i", "ó": "o", "ò": "o", "õ": "o", "ô": "o", "ö": "o", "ú": "u", "ù": "u", "û": "u", "ü": "u", "ç": "c"})
    texto = texto.translate(substituicoes)
    texto = re.sub(r"[^a-z0-9\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto

def pergunta_ja_usada(pergunta: str, historico: list) -> bool:
    normalizada = normalizar_pergunta(pergunta)
    if not normalizada: return True
    for antiga in historico:
        antiga_normalizada = normalizar_pergunta(antiga)
        if not antiga_normalizada: continue
        if normalizada == antiga_normalizada: return True
        similaridade = SequenceMatcher(None, normalizada, antiga_normalizada).ratio()
        if similaridade >= 0.90: return True
    return False

def obter_historico_perguntas(usuario_id: int, categoria_slug: str) -> list:
    return perguntas_recentes.get(f"{usuario_id}:{categoria_slug}", [])

def registrar_pergunta_historico(usuario_id: int, categoria_slug: str, pergunta: str):
    if not pergunta: return
    chave = f"{usuario_id}:{categoria_slug}"
    historico = perguntas_recentes.get(chave, [])
    if pergunta_ja_usada(pergunta, historico): return
    historico.append(pergunta)
    perguntas_recentes[chave] = historico[-MAX_PERGUNTAS_HISTORICO:]

def calcular_titulo(pontos: int) -> str:
    titulo = "Iniciante"
    for minimo, nome in TITULOS:
        if int(pontos or 0) >= minimo: titulo = nome
    return titulo

def normalizar_email(email: str) -> str:
    return (email or "").strip().lower()

def categoria_por_slug(db: Session, slug: str):
    categoria = db.query(Categoria).filter(Categoria.slug == slug).first()
    if not categoria: raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    return categoria

def obter_ou_criar_pontuacao(db: Session, usuario: Usuario, categoria: Categoria):
    pontuacao = db.query(Pontuacao).filter(Pontuacao.usuario_id == usuario.id, Pontuacao.categoria_id == categoria.id).first()
    if not pontuacao:
        pontuacao = Pontuacao(usuario_id=usuario.id, categoria_id=categoria.id, pontos=0, sequencia_atual=0, melhor_sequencia=0, nivel_atual="easy", titulo="Iniciante")
        db.add(pontuacao)
        db.commit()
        db.refresh(pontuacao)
    return pontuacao

def criar_categoria_se_nao_existir(db, nome, slug, pai_id=None, modo_geral=0):
    categoria = db.query(Categoria).filter(Categoria.slug == slug).first()
    if categoria:
        alterou = False
        if categoria.nome != nome: categoria.nome = nome; alterou = True
        if categoria.categoria_pai_id != pai_id: categoria.categoria_pai_id = pai_id; alterou = True
        if categoria.eh_modo_geral != modo_geral: categoria.eh_modo_geral = modo_geral; alterou = True
        if alterou: db.commit(); db.refresh(categoria)
        return categoria
    categoria = Categoria(nome=nome, slug=slug, categoria_pai_id=pai_id, eh_modo_geral=modo_geral)
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria

def garantir_categorias(db: Session):
    cyber = criar_categoria_se_nao_existir(db, "Cyber", "cyber", None, 0)
    rh = criar_categoria_se_nao_existir(db, "RH", "rh", None, 0)
    criar_categoria_se_nao_existir(db, "Geral", "geral", None, 1)
    criar_categoria_se_nao_existir(db, "Phishing", "phishing", cyber.id, 0)
    criar_categoria_se_nao_existir(db, "MITRE ATT&CK", "mitre", cyber.id, 0)
    criar_categoria_se_nao_existir(db, "Eventos Históricos", "eventos-historicos", cyber.id, 0)
    criar_categoria_se_nao_existir(db, "Curiosidades", "curiosidades", cyber.id, 0)
    criar_categoria_se_nao_existir(db, "RH Básico", "rh-basico", rh.id, 0)

@app.on_event("startup")
def startup():
    db = SessionLocal()
    try: garantir_categorias(db)
    finally: db.close()

PALAVRAS_CHAVE_CYBER = [
    "phishing", "senha", "malware", "vírus", "virus", "ransomware", "firewall", "hacker", "hack", "cibersegurança", "ciber", "cyber", "criptografia", "segurança", "vulnerabilidade", "exploit", "mitre", "ataque", "dados", "autenticação", "2fa", "engenharia social", "ddos", "botnet", "spyware", "trojan", "backup", "rede", "credencial"
]

def pergunta_eh_valida(pergunta: dict, slug: str) -> bool:
    if slug == "rh-basico": return True
    texto = (str(pergunta.get("pergunta", "")) + " " + str(pergunta.get("explicacao", "")) + " " + str(pergunta.get("cenario_titulo", "")) + " " + str(pergunta.get("cenario_conteudo", ""))).lower()
    return any(palavra in texto for palavra in PALAVRAS_CHAVE_CYBER)

def validar_pergunta(pergunta: dict, slug: str, historico: list) -> bool:
    if not isinstance(pergunta, dict): return False
    texto = str(pergunta.get("pergunta", "")).strip()
    alternativas = pergunta.get("alternativas")
    explicacao = str(pergunta.get("explicacao", "")).strip()
    try: correta = int(pergunta.get("resposta_correta"))
    except: return False
    if not texto or not explicacao or not isinstance(alternativas, list) or len(alternativas) != 4: return False
    if any(not str(a).strip() for a in alternativas): return False
    if correta < 0 or correta > 3: return False
    if pergunta_ja_usada(texto, historico): return False
    if not pergunta_eh_valida(pergunta, slug): return False
    return True

def pergunta_backup(slug: str, usuario_id: int):
    banco = PERGUNTAS_BACKUP.get(slug, [])
    if not banco: banco = PERGUNTAS_BACKUP.get("curiosidades", [])
    historico = obter_historico_perguntas(usuario_id, slug)
    disponiveis = [p for p in banco if not pergunta_ja_usada(p.get("pergunta", ""), historico)]
    if not disponiveis: return None
    return random.choice(disponiveis).copy()

def gerar_pergunta_ia(slug: str, nivel: str, historico: list):
    if not client_ia: return None
    subtemas = SUBTEMAS.get(slug, ["segurança digital"])
    perguntas_proibidas = "\n".join(f"- {p}" for p in historico[-30:]) or "- Nenhuma pergunta anterior."
    
    if slug == "phishing":
        tipo_cenario = random.choice(["email", "url"])
    elif slug == "mitre":
        tipo_cenario = "log"
    elif slug == "eventos-historicos":
        tipo_cenario = "noticia"
    elif slug == "rh-basico":
        tipo_cenario = "chat"
    else:
        tipo_cenario = "padrao"

    # Cenário completo só entra no nível difícil, e só em módulos que têm um tipo de cenário definido.
    usar_cenario = (nivel == "hard" and tipo_cenario != "padrao")

    if nivel == "easy":
        instrucao_nivel = (
            "Nível FÁCIL: faça uma pergunta simples, direta e conceitual — do tipo 'o que é X' ou "
            "'qual destas opções é um exemplo de X'. Sem cenários, sem histórias fictícias, sem jargão "
            "técnico desnecessário. Precisa ser compreensível por qualquer funcionário da empresa, "
            "mesmo sem nenhum conhecimento prévio de TI ou segurança."
        )
    elif nivel == "medium":
        instrucao_nivel = (
            "Nível MÉDIO: faça uma pergunta um pouco mais específica, que exija entender a diferença "
            "entre conceitos próximos ou aplicar uma regra prática. Pode citar um exemplo bem curto em "
            "uma frase, mas SEM montar um cenário completo (sem e-mail fictício, sem log, sem notícia)."
        )
    elif usar_cenario:
        instrucao_nivel = (
            f"Nível DIFÍCIL: crie um cenário realista do tipo '{tipo_cenario}' com dados fictícios "
            "(preencha 'cenario_titulo' e 'cenario_conteudo') e faça uma pergunta que exija ANALISAR "
            "esse cenário para responder — não uma definição direta. A pessoa precisa interpretar o "
            "cenário para acertar."
        )
    else:
        instrucao_nivel = (
            "Nível DIFÍCIL: faça uma pergunta técnica avançada, testando conhecimento aprofundado ou "
            "uma nuance específica do tema, sem exigir um cenário fictício completo."
        )

    campos_cenario = (
        "\"cenario_tipo\":\"" + tipo_cenario + "\","
        "\"cenario_titulo\":\"...\","
        "\"cenario_conteudo\":\"...\","
    ) if usar_cenario else (
        "\"cenario_tipo\":\"nenhum\","
        "\"cenario_titulo\":\"\","
        "\"cenario_conteudo\":\"\","
    )

    for tentativa in range(1, 5):
        subtema = random.choice(subtemas)
        try:
            system_prompt = (
                f"Você é o gerador oficial de perguntas do CyberShield. "
                f"Crie uma pergunta educativa de múltipla escolha. "
                f"{instrucao_nivel} "
                "A pergunta deve ser nova. Não repita nem reformule perguntas anteriores. "
                "Retorne SOMENTE JSON válido. "
                "Formato: {"
                + campos_cenario +
                "\"pergunta\":\"...\","
                "\"alternativas\":[\"...\",\"...\",\"...\",\"...\"],"
                "\"resposta_correta\":0,"
                "\"explicacao\":\"Explique o conceito e por que a resposta correta é a certa.\"}"
            )

            resposta = client_ia.chat.completions.create(
                model=GROQ_MODEL,
                temperature=0.9,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Categoria: {slug}\nNível: {nivel}\nSubtema: {subtema}\n\nPERGUNTAS PROIBIDAS:\n{perguntas_proibidas}\n\nRegras:\n1. Exatamente 4 alternativas.\n2. Uma única alternativa correta.\n3. resposta_correta de 0 a 3.\n4. Não repetir perguntas anteriores.\n5. Não apenas trocar algumas palavras.\n6. Testar conhecimento diferente.\n7. Retornar somente JSON."},
                ],
            )
            conteudo = (resposta.choices[0].message.content or "").strip()
            conteudo = re.sub(r"^```(?:json)?\s*", "", conteudo)
            conteudo = re.sub(r"\s*```$", "", conteudo)
            pergunta = json.loads(conteudo)
            
            pergunta.setdefault("cenario_tipo", tipo_cenario if usar_cenario else "nenhum")
            pergunta.setdefault("cenario_titulo", "")
            pergunta.setdefault("cenario_conteudo", "")
            
            if validar_pergunta(pergunta, slug, historico):
                print("[IA] Pergunta aprovada:", pergunta["pergunta"])
                return pergunta
            print(f"[IA] Tentativa {tentativa}: pergunta rejeitada.")
        except Exception as erro:
            print(f"[IA] Tentativa {tentativa}/4 falhou: {erro}")
    return None

def embaralhar_alternativas(pergunta: dict):
    alternativas = list(pergunta["alternativas"])
    correta = int(pergunta["resposta_correta"])
    indices = list(range(len(alternativas)))
    random.shuffle(indices)
    pergunta["alternativas"] = [alternativas[i] for i in indices]
    pergunta["resposta_correta"] = indices.index(correta)
    return pergunta

def dados_pontuacao_categoria(db: Session, usuario: Usuario, categoria: Categoria):
    pontuacao = db.query(Pontuacao).filter(Pontuacao.usuario_id == usuario.id, Pontuacao.categoria_id == categoria.id).first()
    if not pontuacao:
        return {"pontos": 0, "sequencia_atual": 0, "melhor_sequencia": 0, "nivel_atual": "easy", "titulo": "Iniciante"}
    pontos = int(pontuacao.pontos or 0)
    return {
        "pontos": pontos,
        "sequencia_atual": int(pontuacao.sequencia_atual or 0),
        "melhor_sequencia": int(pontuacao.melhor_sequencia or 0),
        "nivel_atual": pontuacao.nivel_atual or "easy",
        "titulo": pontuacao.titulo or calcular_titulo(pontos),
    }

def dados_area_agregada(db: Session, usuario: Usuario, categoria: Categoria):
    filhos = db.query(Categoria).filter(Categoria.categoria_pai_id == categoria.id).order_by(Categoria.id).all()
    categorias_somadas = [categoria] + filhos
    ids_categorias = [c.id for c in categorias_somadas]

    pontuacoes_db = db.query(Pontuacao).filter(
        Pontuacao.usuario_id == usuario.id,
        Pontuacao.categoria_id.in_(ids_categorias)
    ).all()
    
    pontuacoes_dict = {p.categoria_id: p for p in pontuacoes_db}
    
    pontos = 0
    melhor_sequencia = 0
    sequencia_atual = 0
    niveis = []

    for cat in categorias_somadas:
        pontuacao = pontuacoes_dict.get(cat.id)
        if pontuacao:
            pontos += int(pontuacao.pontos or 0)
            melhor_sequencia = max(melhor_sequencia, int(pontuacao.melhor_sequencia or 0))
            sequencia_atual = max(sequencia_atual, int(pontuacao.sequencia_atual or 0))
            nivel = pontuacao.nivel_atual or "easy"
            if nivel in NIVEIS:
                niveis.append(nivel)

    if niveis:
        nivel_atual = NIVEIS[max(NIVEIS.index(n) for n in niveis)]
    else:
        nivel_atual = "easy"

    return {
        "pontos": pontos,
        "sequencia_atual": sequencia_atual,
        "melhor_sequencia": melhor_sequencia,
        "nivel_atual": nivel_atual,
        "titulo": calcular_titulo(pontos),
        "filhos": filhos,
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/categorias")
def listar_categorias(db: Session = Depends(get_db)):
    garantir_categorias(db)
    categorias = db.query(Categoria).order_by(Categoria.id).all()
    return [{"id": c.id, "nome": c.nome, "slug": c.slug, "categoria_pai_id": c.categoria_pai_id, "eh_modo_geral": bool(c.eh_modo_geral)} for c in categorias]

@app.get("/quiz/pergunta")
def obter_pergunta(categoria_slug: str, dificuldade: str = None, username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    categoria = categoria_por_slug(db, categoria_slug)
    slug_para_pergunta = categoria.slug

    if int(categoria.eh_modo_geral or 0) == 1:
        modulos = db.query(Categoria).filter(Categoria.categoria_pai_id.isnot(None), Categoria.eh_modo_geral == 0).all()
        if modulos:
            modulo = random.choice(modulos)
            slug_para_pergunta = modulo.slug

    pontuacao = obter_ou_criar_pontuacao(db, usuario, categoria)

    if dificuldade in NIVEIS:
        pontuacao.nivel_atual = dificuldade
        db.commit()
        db.refresh(pontuacao)

    nivel = pontuacao.nivel_atual or "easy"
    historico = obter_historico_perguntas(usuario.id, slug_para_pergunta)

    pergunta = gerar_pergunta_ia(slug_para_pergunta, nivel, historico)

    if pergunta is None:
        pergunta = pergunta_backup(slug_para_pergunta, usuario.id)

    if pergunta is None:
        historico_atualizado = obter_historico_perguntas(usuario.id, slug_para_pergunta)
        pergunta = gerar_pergunta_ia(slug_para_pergunta, nivel, historico_atualizado)

    if pergunta is None:
        raise HTTPException(status_code=503, detail="Não foi possível gerar uma pergunta nova neste momento.")

    historico_final = obter_historico_perguntas(usuario.id, slug_para_pergunta)
    if pergunta_ja_usada(pergunta["pergunta"], historico_final):
        raise HTTPException(status_code=503, detail="A pergunta gerada já foi utilizada.")

    registrar_pergunta_historico(usuario.id, slug_para_pergunta, pergunta["pergunta"])
    pergunta = embaralhar_alternativas(pergunta)
    pergunta["categoria_slug"] = categoria.slug
    pergunta["categoria_pergunta"] = slug_para_pergunta
    pergunta["nivel"] = nivel

    return pergunta

@app.post("/registrar")
def registrar(dados: UsuarioCadastro, db: Session = Depends(get_db)):
    username = dados.username.strip()
    email = normalizar_email(dados.email)
    if not username: raise HTTPException(status_code=400, detail="Nome de usuário é obrigatório.")
    if dados.senha != dados.confirmar_senha: raise HTTPException(status_code=400, detail="As senhas não coincidem.")
    
    if db.query(Usuario).filter(Usuario.username == username).first(): raise HTTPException(status_code=400, detail="Nome de usuário já cadastrado.")
    if db.query(Usuario).filter(Usuario.email == email).first(): raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")

    usuario = Usuario(nome=dados.nome.strip(), sobrenome=dados.sobrenome.strip(), username=username, email=email, senha_hash=hash_senha(dados.senha))
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    token = criar_token({"sub": usuario.username})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/login")
def login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    identificador = dados.username.strip()
    usuario = db.query(Usuario).filter((Usuario.username == identificador) | (Usuario.email == identificador.lower())).first()
    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")
    token = criar_token({"sub": usuario.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/usuario/me")
def obter_usuario(username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return {"username": usuario.username, "nome": usuario.nome, "sobrenome": usuario.sobrenome, "email": usuario.email}

@app.get("/usuario/me/pontuacao/{categoria_slug}")
def obter_pontuacao_categoria(categoria_slug: str, username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    categoria = categoria_por_slug(db, categoria_slug)
    if categoria.categoria_pai_id is None and int(categoria.eh_modo_geral or 0) == 0:
        dados = dados_area_agregada(db, usuario, categoria)
    else:
        obter_ou_criar_pontuacao(db, usuario, categoria)
        dados = dados_pontuacao_categoria(db, usuario, categoria)
        
    return {
        "categoria_slug": categoria.slug,
        "pontos": dados["pontos"],
        "sequencia_atual": dados["sequencia_atual"],
        "melhor_sequencia": dados["melhor_sequencia"],
        "nivel_atual": dados["nivel_atual"],
        "titulo": dados["titulo"],
    }

@app.get("/usuario/me/progresso")
def obter_progresso_usuario(username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    categorias = db.query(Categoria).filter(Categoria.eh_modo_geral == 0, Categoria.categoria_pai_id.is_(None)).order_by(Categoria.id).all()

    areas = []
    total_pontos = 0
    melhor_sequencia = 0

    for categoria in categorias:
        dados = dados_area_agregada(db, usuario, categoria)
        pontos = dados["pontos"]
        total_pontos += pontos
        melhor_sequencia = max(melhor_sequencia, dados["melhor_sequencia"])
        areas.append({
            "categoria_id": categoria.id, "categoria_slug": categoria.slug, "categoria_nome": categoria.nome,
            "nome": categoria.nome, "slug": categoria.slug, "pontos": pontos,
            "sequencia_atual": dados["sequencia_atual"], "melhor_sequencia": dados["melhor_sequencia"],
            "nivel_atual": dados["nivel_atual"], "titulo": dados["titulo"],
        })

    areas_ordenadas = sorted(areas, key=lambda a: a["pontos"], reverse=True)
    area_forte = areas_ordenadas[0] if areas_ordenadas and areas_ordenadas[0]["pontos"] > 0 else None

    if not areas:
        diagnostico = "Nenhuma área foi encontrada. Verifique as categorias cadastradas."
    elif total_pontos == 0:
        diagnostico = "Responda algumas perguntas para que a Yabuki consiga analisar seu desempenho."
    else:
        menor = sorted(areas, key=lambda a: a["pontos"])[0]
        diagnostico = f"Continue treinando principalmente {menor['nome']} para equilibrar seu desempenho."

    return {
        "usuario": usuario.username, "pontos_totais": total_pontos, "melhor_sequencia": melhor_sequencia,
        "titulo": calcular_titulo(total_pontos), "areas": areas, "categorias": areas,
        "area_forte": area_forte, "diagnostico": diagnostico,
    }

@app.post("/quiz/responder")
def responder_quiz(dados: RespostaQuiz, username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    categoria = categoria_por_slug(db, dados.categoria_slug)
    pontuacao = obter_ou_criar_pontuacao(db, usuario, categoria)
    mensagem_combo = None

    if dados.acertou:
        pontuacao.sequencia_atual = int(pontuacao.sequencia_atual or 0) + 1
        pontuacao.melhor_sequencia = max(int(pontuacao.melhor_sequencia or 0), pontuacao.sequencia_atual)
        bonus = min(pontuacao.sequencia_atual, 5)
        ganho = 10 + (bonus - 1) * 2
        pontuacao.pontos = int(pontuacao.pontos or 0) + ganho
        usuario.creditos = int(usuario.creditos or 0) + ganho

        if pontuacao.sequencia_atual == 3: mensagem_combo = "Sequência de 3! Você está pegando o jeito. 🔥"
        elif pontuacao.sequencia_atual == 5: mensagem_combo = "ACE! 5 acertos seguidos! 🎯"
        elif pontuacao.sequencia_atual >= 7 and pontuacao.sequencia_atual % 2 == 1:
            mensagem_combo = f"IMPARÁVEL! {pontuacao.sequencia_atual} acertos seguidos! 🚀"
    else:
        pontuacao.sequencia_atual = 0

    pontuacao.titulo = calcular_titulo(pontuacao.pontos)
    db.commit()
    db.refresh(pontuacao)

    return {
        "pontos": pontuacao.pontos, "sequencia_atual": pontuacao.sequencia_atual,
        "melhor_sequencia": pontuacao.melhor_sequencia, "nivel_atual": pontuacao.nivel_atual,
        "titulo": pontuacao.titulo, "mensagem_combo": mensagem_combo, "creditos": int(usuario.creditos or 0),
    }

@app.get("/loja/skins")
def listar_skins(username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    compradas, equipadas = carteira_usuario(db, usuario)
    itens = []
    for skin in SKINS_PERSONAGENS:
        item = dict(skin)
        item["comprada"] = skin["preco"] == 0 or skin["id"] in compradas
        item["equipada"] = equipadas.get(skin["personagem_id"], f'{skin["personagem_id"]}-padrao') == skin["id"]
        itens.append(item)
    return {"creditos": int(usuario.creditos or 0), "skins": itens, "equipadas": equipadas}

@app.post("/loja/comprar")
def comprar_skin(dados: CompraSkin, username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    skin = SKINS_POR_ID.get(dados.skin_id)
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if not skin: raise HTTPException(status_code=404, detail="Skin não encontrada.")
    if skin["preco"] == 0: return {"mensagem":"Esta skin já é gratuita.", "creditos":int(usuario.creditos or 0)}
    existente = db.query(SkinComprada).filter(SkinComprada.usuario_id == usuario.id, SkinComprada.skin_id == skin["id"]).first()
    if existente: raise HTTPException(status_code=409, detail="Você já possui esta skin.")
    if int(usuario.creditos or 0) < skin["preco"]: raise HTTPException(status_code=400, detail="Créditos insuficientes.")
    usuario.creditos = int(usuario.creditos or 0) - skin["preco"]
    db.add(SkinComprada(usuario_id=usuario.id, skin_id=skin["id"]))
    db.commit(); db.refresh(usuario)
    return {"mensagem":f'{skin["nome"]} desbloqueada!', "creditos":int(usuario.creditos or 0)}

@app.post("/loja/equipar")
def equipar_skin(dados: EquiparSkin, username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    skin = SKINS_POR_ID.get(dados.skin_id)
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if not skin or skin["personagem_id"] != dados.personagem_id: raise HTTPException(status_code=400, detail="Skin inválida para este personagem.")
    if skin["preco"] > 0:
        possui = db.query(SkinComprada).filter(SkinComprada.usuario_id == usuario.id, SkinComprada.skin_id == skin["id"]).first()
        if not possui: raise HTTPException(status_code=403, detail="Compre esta skin antes de equipá-la.")
    registro = db.query(SkinEquipada).filter(SkinEquipada.usuario_id == usuario.id, SkinEquipada.personagem_id == dados.personagem_id).first()
    if registro: registro.skin_id = skin["id"]
    else: db.add(SkinEquipada(usuario_id=usuario.id, personagem_id=dados.personagem_id, skin_id=skin["id"]))
    db.commit()
    return {"mensagem":f'{skin["nome"]} equipada!', "personagem_id":dados.personagem_id, "skin_id":skin["id"]}

@app.delete("/loja/equipar/{personagem_id}")
def desequipar_skin(personagem_id: str, username: str = Depends(usuario_atual), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    registro = db.query(SkinEquipada).filter(
        SkinEquipada.usuario_id == usuario.id,
        SkinEquipada.personagem_id == personagem_id,
    ).first()
    if registro:
        db.delete(registro)
        db.commit()
    return {"mensagem":"Skin desequipada. Visual padrão restaurado.", "personagem_id":personagem_id, "skin_id":None}

@app.post("/recuperar-senha")
def recuperar_senha(dados: RecuperarSenha, db: Session = Depends(get_db)):
    email = normalizar_email(dados.email)
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario: return {"mensagem": "Se o e-mail estiver cadastrado, você receberá instruções."}
    
    token = secrets.token_urlsafe(32)
    usuario.reset_token_hash = hash_senha(token)
    usuario.reset_token_expira_em = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    return {"mensagem": "Token de recuperação gerado.", "token": token}

@app.post("/redefinir-senha")
def redefinir_senha(dados: RedefinirSenha, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(
        Usuario.reset_token_hash.isnot(None),
        Usuario.reset_token_expira_em.isnot(None),
        Usuario.reset_token_expira_em > datetime.utcnow()
    ).first()

    if not usuario or not verificar_senha(dados.token, usuario.reset_token_hash):
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")
    
    if dados.nova_senha != dados.confirmar_nova_senha:
        raise HTTPException(status_code=400, detail="As senhas não coincidem.")

    usuario.senha_hash = hash_senha(dados.nova_senha)
    usuario.reset_token_hash = None
    usuario.reset_token_expira_em = None
    db.commit()
    return {"mensagem": "Senha redefinida com sucesso."}

from fastapi.staticfiles import StaticFiles

if os.path.isdir("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="frontend")