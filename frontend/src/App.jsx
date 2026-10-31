import { useState, useEffect } from 'react'
import './App.css'
import Historia from './Historia.jsx'
import './historia.css'
import {
  registrar, login, salvarToken, pegarToken, logout, buscarUsuarioAtual,
  buscarCategorias, buscarPontuacaoCategoria, buscarProgressoUsuario,
  obterPergunta, enviarResposta, iniciais, recuperarSenha, redefinirSenha,
  buscarLojaSkins, comprarSkinPersonagem, equiparSkinPersonagem, desequiparSkinPersonagem,
} from './auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const ESTILOS_ALTERNATIVA = [
  { cor: 'vermelho', icone: '🛡️' },
  { cor: 'azul', icone: '🔒' },
  { cor: 'ambar', icone: '🔑' },
  { cor: 'verde', icone: '🐛' },
]

const ICONE_AREA = { cyber: '🛡️', rh: '🧑‍💼', geral: '🎯' }
const ICONE_MODULO = { phishing: '🎣', mitre: '🗺️', 'eventos-historicos': '🕰️', curiosidades: '✨', 'rh-basico': '📋' }
const IMAGENS_RAPOSA = {
  cyber: '/mascotes/cyber/raposa-cyber.png',
  rh: '/mascotes/rh/raposa-rh.png',
  geral: '/mascotes/geral/raposa-geral.png',
}
const IMAGEM_RAPOSA_BASE = '/mascotes/raposa-base.png'
const IMAGEM_RAPOSA_INICIAL = '/mascotes/raposa-inicial.png'
const NOME_RAPOSA = 'Yabuki'

const SKINS = [
  { 
    id: 'padrao', nome: 'Recruta Digital', imagem: IMAGEM_RAPOSA_INICIAL, requisito: null, raridade: 'comum',
    descricao: 'A forma base da Yabuki. Pronta para proteger a rede e aprender com você.',
    falas: { acerto: 'Boa! Primeiro acesso garantido! 👍', combo3: 'ACE! Três seguidas! 🦊', combo5: 'Combo INSANO! 🚀', erro: 'Quase! Não desista, você consegue! 🦊', dica: 'Pense com calma antes de responder.' }
  },
  { 
    id: 'naruto-classico', nome: 'Naruto Clássico', imagem: '/mascotes/skins/yabuki-naruto-classico.png', requisito: 'olho-clinico', raridade: 'rara',
    descricao: 'O ninja que sonhava em ser Hokage. Agora protege a rede da Vila da Folha com seu jutsu de segurança.',
    falas: { acerto: 'Dattebayo! Isso aí!', combo3: 'Jutsu Multi-Shadow de Proteção!', combo5: 'Modo Sennin ativado! 🐸', erro: 'Droga... preciso treinar mais.', dica: 'Use seu Byakugan para inspecionar o remetente.' }
  },
  { 
    id: 'akame', nome: 'Akame (Night Raid)', imagem: '/mascotes/skins/yabuki-akame.png', requisito: 'guardiao-senha', raridade: 'rara',
    descricao: 'Assassina da Night Raid. Sua espada corta qualquer malware em frações de segundo, sem deixar rastros.',
    falas: { acerto: 'Eliminado.', combo3: 'Corte relâmpago!', combo5: 'Imperial Arms: Murasame ativa!', erro: 'Alvo escapou... por pouco.', dica: 'Não baixe a guarda. Observe os detalhes ocultos.' }
  },
  { 
    id: 'sailor-moon', nome: 'Sailor Yabuki', imagem: '/mascotes/skins/yabuki-sailor-moon.png', requisito: 'arquivista-digital', raridade: 'rara',
    descricao: 'Guardiã do amor e da justiça. Ela protege os dados sensíveis com o poder do Cristal de Prata.',
    falas: { acerto: 'Em nome da Lua, eu vou punir você! 🌙', combo3: 'Poder do Luar, Ação!', combo5: 'Cura com o Cristal de Prata!', erro: 'Oh não, o inimigo é forte!', dica: 'Acredite no poder do seu coração.' }
  },
  { 
    id: 'spike', nome: 'Spike Spiegel', imagem: '/mascotes/skins/yabuki-spike.png', requisito: 'analista-attck', raridade: 'epica',
    descricao: 'Caçador de recompensas do Bebop. Hackeia sistemas enquanto escuta jazz e fuma cigarrinho.',
    falas: { acerto: 'Viu isso, Ed? O firewall caiu.', combo3: 'Bang. 🤠', combo5: 'See you space cowboy...', erro: 'Essa doeu mais que um soco do Jet.', dica: 'Siga o fluxo dos dados, como água.' }
  },
  { 
    id: 'takumi', nome: 'Takumi (AE86)', imagem: '/mascotes/skins/yabuki-takumi.png', requisito: 'escudo-rh', raridade: 'epica',
    descricao: 'O Rei de Akina. Entrega os pacotes de rede mais rápido do que um AE86 descendo a montanha.',
    falas: { acerto: 'Drift perfeito.', combo3: 'Aderência total!', combo5: 'O motor roncou!', erro: 'Derrapei na curva...', dica: 'Sinta a estrada antes de acelerar.' }
  },
  { 
    id: 'rikudou', nome: 'Naruto Rikudou', imagem: '/mascotes/skins/yabuki-rikudou.png', requisito: 'sobrevivente', raridade: 'epica',
    descricao: 'O Sábio dos Seis Caminhos desperta para detectar assinaturas maliciosas em escala global.',
    falas: { acerto: 'O poder do Rinnegan!', combo3: 'Shinra Tensei!', combo5: 'Bola da Verdade Selada!', erro: 'A paz ainda está longe...', dica: 'Enxergue a verdade além das ilusões.' }
  },
  { 
    id: 'joe', nome: 'Yabuki Joe', imagem: '/mascotes/skins/yabuki-joe.png', requisito: 'mestre-cyber', raridade: 'lendario',
    descricao: 'O lendário boxeador que desafiou o mundo. Na arena digital, ele troca golpes com ameaças até o sino final. Lutou contra Jose Mendoza no intenso 15º round. Mesmo sofrendo da síndrome do pugilista avançada, ele não recuou. Morreu no ringue, mas provou que um homem verdadeiro é livre e luta até o fim.',
    falas: { acerto: 'Um cruzado de direita perfeito!', combo3: 'Ele está cambaleando!', combo5: 'Nocaute técnico!', erro: 'Recebi um golpe forte... mas estou de pé.', dica: 'Dance no ringue, espere o golpe abrir a guarda.' }
  },
  { 
    id: 'cinzas', nome: 'Cinzas Brancas', imagem: '/mascotes/skins/yabuki-cinzas.png', requisito: 'guardiao-yabuki', raridade: 'secreta',
    descricao: 'A imagem mais marcante do boxe. Yabuki sentado no cantinho do ringue, coberto de cinzas brancas. Representa o sacrifício final de um herói que deu tudo de si. Na segurança da informação, ela é o lembrete de que, mesmo quando tudo parece perdido, a defesa jamais deve se render.',
    falas: { acerto: 'O sino tocou... mas a luta continua.', combo3: 'O espírito não se quebra.', combo5: 'Até o último respiro.', erro: 'A dor é passageira, a glória é eterna.', dica: 'Aceda as cinzas do passado para guiar seu próximo passo.' }
  },
]

function getFalaSkin(skinId, tipo) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0]
  return skin.falas[tipo] || skin.falas.acerto
}

const BADGES = [
  { slug: 'iniciao', nome: 'Iniciação', descricao: 'Complete sua primeira missão de treino.', icone: '🌱', raridade: 'comum' },
  { slug: 'volta-por-cima', nome: 'Volta por Cima', descricao: 'Erre uma pergunta e acerte a seguinte.', icone: '🔄', raridade: 'comum' },
  { slug: 'sem-brechas', nome: 'Sem Brechas', descricao: 'Complete uma missão de 5 perguntas sem errar.', icone: '🛡️', raridade: 'raro' },
  { slug: 'olho-clinico', nome: 'Olho Clínico', descricao: 'Alcance sequência 5 em Phishing.', icone: '🦅', raridade: 'raro' },
  { slug: 'analista-attck', nome: 'Analista ATT&CK', descricao: 'Alcance 100 pontos em MITRE ATT&CK.', icone: '🕵️', raridade: 'raro' },
  { slug: 'arquivista-digital', nome: 'Arquivista Digital', descricao: 'Alcance 100 pontos em Eventos Históricos.', icone: '📜', raridade: 'raro' },
  { slug: 'escudo-rh', nome: 'Escudo de RH', descricao: 'Alcance 100 pontos em RH.', icone: '🤝', raridade: 'raro' },
  { slug: 'guardiao-senha', nome: 'Guardião da Senha', descricao: 'Alcance sequência 5 em Curiosidades.', icone: '🔑', raridade: 'raro' },
  { slug: 'sobrevivente', nome: 'Sobrevivente', descricao: 'Alcance um combo de 10 no Modo Sobrevivência.', icone: '💀', raridade: 'epico' },
  { slug: 'mestre-cyber', nome: 'Mestre Cyber', descricao: 'Acumule 500 pontos no total.', icone: '👑', raridade: 'lendario' },
  { slug: 'guardiao-yabuki', nome: 'Guardião da Yabuki', descricao: 'Alcance a pontuação máxima (1000 pontos).', icone: '🦊', raridade: 'lendario' },
]

const DICAS_CONTEXTUAIS = {
  phishing: 'O cadeado HTTPS não prova que o site é legítimo.',
  mitre: 'Pense na intenção do atacante, não só na ferramenta usada.',
  'eventos-historicos': 'Muitos ataques históricos exploraram falhas humanas, não só técnicas.',
  curiosidades: 'Curiosidade não é sinônimo de segurança: sempre valide a fonte.',
  'rh-basico': 'Processos claros protegem tanto a empresa quanto as pessoas.',
}

const DESAFIOS_DIARIOS = [
  { texto: 'Complete 3 perguntas sem usar dica.', xp: 25 },
  { texto: 'Acerte uma questão de cada área.', xp: 25 },
  { texto: 'Sobreviva a uma mini-missão de phishing.', xp: 25 },
  { texto: 'Revise duas perguntas que você errou.', xp: 25 },
  { texto: 'Jogue o Modo Geral.', xp: 25 },
]

function obterDesafioDoDia() {
  const hoje = new Date().toISOString().slice(0, 10)
  let hash = 0
  for (const c of hoje) hash = (hash * 31 + c.charCodeAt(0)) % 1000
  return DESAFIOS_DIARIOS[hash % DESAFIOS_DIARIOS.length]
}

function escapeRegExp(texto) { return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

function gerarDica(pergunta) {
  if (!pergunta) return 'Pense com calma antes de responder.'
  const correta = pergunta.alternativas?.[pergunta.resposta_correta]
  let dica = pergunta.explicacao || 'Pense com calma antes de responder.'
  if (correta) {
   // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp -- entrada escapada por escapeRegExp() e vinda das alternativas do quiz, nao de input livre
    try { dica = dica.replace(new RegExp(escapeRegExp(correta), 'ig'), '▓▓▓▓▓') } catch {}
  }
  return dica
}


const PERSONAGENS_CYBER = [
  {
    id: 'clara', nome: 'Clara', apelido: 'Sentinela', tipo: 'ALUNA', nivel: 3,
    especialidade: 'Blue Team / Defesa', imagem: '/historia/personagens/clara/perfil.png',
    cor: '#2de2e6', icone: '🛡️',
    habilidade: 'Linha de Defesa',
    habilidadeDesc: 'Melhora a leitura de logs, alertas e sinais de atividade suspeita durante desafios defensivos.',
    descricao: 'Perfil defensivo e analítico. Clara se destaca quando precisa observar o ambiente, identificar anomalias e proteger a operação.',
    atributos: { phishing: 4, threat: 5, malware: 5, web: 5, defesa: 7, sistemas: 4 }
  },
  {
    id: 'murilo', nome: 'Murilo', apelido: 'Rei dos Anões', tipo: 'ALUNO', nivel: 3,
    especialidade: 'Threat Intelligence', imagem: '/historia/personagens/murilo/perfil.png',
    cor: '#ff4757', icone: '🔎',
    habilidade: 'Olho do Anão',
    habilidadeDesc: 'Enxerga relações entre pistas, IOCs e informações aparentemente desconectadas com maior facilidade.',
    descricao: 'Investigador natural. Murilo é forte em correlação de informações, padrões, pistas e construção de contexto sobre ameaças.',
    atributos: { phishing: 5, threat: 7, malware: 4, web: 4, defesa: 5, sistemas: 5 }
  },
  {
    id: 'vitor', nome: 'Vitor', apelido: 'Salame', tipo: 'ALUNO', nivel: 3,
    especialidade: 'Phishing / Engenharia Social', imagem: '/historia/personagens/vitor/perfil.png',
    cor: '#ffc93c', icone: '🎭',
    habilidade: 'Leitura Social',
    habilidadeDesc: 'Reconhece com mais facilidade urgência falsa, manipulação, pretextos e tentativas de persuasão.',
    descricao: 'Especialista em entender o lado humano do ataque. Vitor analisa por que uma isca funciona e como o atacante tenta convencer a vítima.',
    atributos: { phishing: 7, threat: 5, malware: 3, web: 5, defesa: 4, sistemas: 4 }
  },
  {
    id: 'lincoln', nome: 'Lincoln', apelido: 'Raio-X', tipo: 'ALUNO', nivel: 3,
    especialidade: 'Malware Analysis', imagem: '/historia/personagens/lincoln/perfil.png',
    cor: '#bd5cff', icone: '🦠',
    habilidade: 'Raio-X',
    habilidadeDesc: 'Facilita a identificação de comportamentos, indicadores e características importantes de arquivos suspeitos.',
    descricao: 'Focado em comportamento malicioso e análise técnica. Sua maior vantagem aparece quando o problema está escondido dentro de um arquivo ou processo.',
    atributos: { phishing: 4, threat: 4, malware: 7, web: 5, defesa: 5, sistemas: 5 }
  },
  {
    id: 'enzo', nome: 'Enzo', apelido: 'Route Breaker', tipo: 'ALUNO', nivel: 3,
    especialidade: 'Web Security', imagem: '/historia/personagens/enzo/perfil.png',
    cor: '#3d7eff', icone: '🌐',
    habilidade: 'Quebra de Rota',
    habilidadeDesc: 'Ganha vantagem ao interpretar fluxos web, requisições, parâmetros e possíveis pontos de exploração.',
    descricao: 'Voltado para aplicações web. Enzo entende rotas, entradas, autenticação e os caminhos que podem expor uma aplicação.',
    atributos: { phishing: 5, threat: 4, malware: 4, web: 7, defesa: 4, sistemas: 5 }
  },
  {
    id: 'beoni', nome: 'Beoni', apelido: 'Terminal', tipo: 'ALUNO', nivel: 3,
    especialidade: 'Sistemas / Linux', imagem: '/historia/personagens/beoni/perfil.png',
    cor: '#2ed573', icone: '🐧',
    habilidade: 'Terminal',
    habilidadeDesc: 'Recebe vantagem em desafios de comandos, permissões, processos, serviços e administração de sistemas.',
    descricao: 'Especialista em sistemas. Beoni se sente em casa no terminal e tem facilidade para entender o que acontece por baixo da interface.',
    atributos: { phishing: 4, threat: 5, malware: 5, web: 4, defesa: 5, sistemas: 7 }
  },
  {
    id: 'rafaela', nome: 'Rafaela', apelido: 'Resposta Zero', tipo: 'ALUNA', nivel: 3,
    especialidade: 'Incident Response', imagem: '/historia/personagens/rafaela/perfil.png',
    cor: '#ff7aa8', icone: '🚨',
    habilidade: 'Resposta Rápida',
    habilidadeDesc: 'Aumenta a eficiência em decisões de contenção, priorização e investigação durante um incidente ativo.',
    descricao: 'Rápida na tomada de decisão. Rafaela se destaca quando uma ameaça já está acontecendo e é preciso conter, entender e responder.',
    atributos: { phishing: 5, threat: 6, malware: 4, web: 5, defesa: 7, sistemas: 4 }
  },
  {
    id: 'cleiton', nome: 'Cleiton', apelido: 'Guardião do SOC', tipo: 'PROFESSOR', nivel: 10,
    especialidade: 'Cyber Defense / SOC', imagem: '/historia/personagens/cleiton/perfil.png',
    cor: '#2de2e6', icone: '🛡️',
    habilidade: 'Comando de Defesa',
    habilidadeDesc: 'Consegue coordenar defesa, investigação e resposta mantendo visão ampla do incidente e da infraestrutura.',
    descricao: 'Professor e referência defensiva. Seu radar representa experiência consolidada em SOC, análise, resposta e segurança operacional.',
    atributos: { phishing: 8, threat: 9, malware: 8, web: 8, defesa: 10, sistemas: 9 }
  },
  {
    id: 'fabio', nome: 'Fábio', apelido: 'Bruxo do Linux', tipo: 'PROFESSOR', nivel: 10,
    especialidade: 'Linux / Segurança Técnica', imagem: '/historia/personagens/fabio/perfil.png',
    cor: '#bd5cff', icone: '🧙',
    habilidade: 'Shell Arcano',
    habilidadeDesc: 'Domínio técnico avançado de Linux, sistemas e investigação permite encontrar caminhos que passam despercebidos.',
    descricao: 'Professor de perfil extremamente técnico. O Bruxo domina sistemas, Linux e análise aprofundada, com atributos altos em praticamente todas as áreas.',
    atributos: { phishing: 8, threat: 9, malware: 9, web: 9, defesa: 9, sistemas: 10 }
  },
  {
    id: 'mizuguchi',
    nome: 'Mizuguchi',
    apelido: 'Pantera',
    tipo: 'ALUNO',
    nivel: 3,

    especialidade:
      'Threat Hunting / Stealth Recon',

    imagem:
      '/historia/personagens/mizuguchi/perfil.png',

    cor: '#a855f7',

    icone: '🐆',

    habilidade:
      'Pantera Sombria',

    habilidadeDesc:
      'Usa reconhecimento silencioso e análise de comportamento para seguir rastros, detectar anomalias e encontrar ameaças que tentam permanecer escondidas.',

    descricao:
      'Mizuguchi possui um perfil silencioso e observador. Sua especialidade é caçar ameaças discretamente, acompanhar rastros e perceber comportamentos anormais antes que o atacante revele sua posição.',

    atributos: {
      phishing: 4,
      threat: 7,
      malware: 5,
      web: 5,
      defesa: 6,
      sistemas: 6,
    },
  },

  {
    id: 'jb',
    nome: 'JB',
    apelido: 'Operador',
    tipo: 'ALUNO',
    nivel: 3,

    especialidade:
      'Infraestrutura / Segurança Operacional',

    imagem:
      '/historia/personagens/jb/perfil.png',

    cor: '#8fa36a',

    icone: '🎒',

    habilidade:
      'Protocolo de Campo',

    habilidadeDesc:
      'Analisa o ambiente de forma metódica, identifica pontos críticos da infraestrutura e mantém a operação organizada mesmo sob pressão.',

    descricao:
      'JB possui um perfil disciplinado e operacional. Sua maior força está em sistemas, infraestrutura e defesa, tratando incidentes como operações que precisam de reconhecimento, organização e execução precisa.',

    atributos: {
      phishing: 4,
      threat: 5,
      malware: 5,
      web: 4,
      defesa: 7,
      sistemas: 7,
    },
  },
]

const ATRIBUTOS_PERSONAGEM = [
  ['phishing', 'Phishing'],
  ['threat', 'Threat Intel'],
  ['malware', 'Malware'],
  ['web', 'Web Security'],
  ['defesa', 'Defesa'],
  ['sistemas', 'Sistemas'],
]

function RadarPersonagem({ atributos, cor }) {
  const cx = 150
  const cy = 150
  const raio = 104
  const pontos = ATRIBUTOS_PERSONAGEM.map((_, i) => {
    const angulo = -Math.PI / 2 + i * (Math.PI * 2 / ATRIBUTOS_PERSONAGEM.length)
    return [cx + Math.cos(angulo) * raio, cy + Math.sin(angulo) * raio]
  })
  const poligono = (escala) => pontos.map(([x, y]) =>
    `${cx + (x - cx) * escala},${cy + (y - cy) * escala}`
  ).join(' ')
  const valorPontos = ATRIBUTOS_PERSONAGEM.map(([chave], i) => {
    const [x, y] = pontos[i]
    const escala = atributos[chave] / 10
    return `${cx + (x - cx) * escala},${cy + (y - cy) * escala}`
  }).join(' ')

  return (
    <div className="personagem-radar-wrap">
      <svg className="personagem-radar" viewBox="0 0 300 300" role="img" aria-label="Radar de capacidades">
        {[0.2, 0.4, 0.6, 0.8, 1].map((escala) => (
          <polygon key={escala} points={poligono(escala)} className="radar-grade" />
        ))}
        {pontos.map(([x, y], i) => (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="radar-eixo" />
        ))}
        <polygon points={valorPontos} className="radar-valor" style={{ '--radar-cor': cor }} />
        {ATRIBUTOS_PERSONAGEM.map(([chave], i) => {
          const [x, y] = pontos[i]
          const escala = atributos[chave] / 10
          return <circle key={chave} cx={cx + (x - cx) * escala} cy={cy + (y - cy) * escala} r="4" className="radar-ponto" style={{ '--radar-cor': cor }} />
        })}
      </svg>
    </div>
  )
}

function TelaPersonagens({ equipadas = {}, skinsLoja = [] }) {
  const [selecionadoId, setSelecionadoId] = useState('murilo')
  const [imagemFalhou, setImagemFalhou] = useState({})
  const personagem = PERSONAGENS_CYBER.find((p) => p.id === selecionadoId) || PERSONAGENS_CYBER[0]
  const alunos = PERSONAGENS_CYBER.filter((p) => p.tipo !== 'PROFESSOR')
  const professores = PERSONAGENS_CYBER.filter((p) => p.tipo === 'PROFESSOR')
  const imagemDo = (p) => skinsLoja.find((s) => s.id === (equipadas[p.id] || `${p.id}-padrao`))?.imagem || p.imagem

  const card = (p) => (
    <button
      type="button"
      key={p.id}
      className={`personagem-mini-card ${selecionadoId === p.id ? 'ativo' : ''}`}
      style={{ '--personagem-cor': p.cor }}
      onClick={() => setSelecionadoId(p.id)}
    >
      <div className="personagem-mini-avatar">
        {!imagemFalhou[p.id] ? (
          <img
            src={imagemDo(p)}
            alt={p.nome}
            onError={() => setImagemFalhou((atual) => ({ ...atual, [p.id]: true }))}
          />
        ) : (
          <span>{p.icone}</span>
        )}
      </div>
      <div>
        <strong>{p.nome}</strong>
        <span>{p.apelido}</span>
      </div>
      <b>NV. {p.nivel}</b>
    </button>
  )

  return (
    <section className="personagens-area">
      <header className="personagens-cabecalho">
        <div>
          <span className="personagens-kicker">CYBERSHIELD // ROSTER</span>
          <h1>Personagens</h1>
          <p>Conheça as especialidades, capacidades e habilidades únicas de cada integrante.</p>
        </div>
        <div className="personagens-legenda">
          <span><i className="legenda-aluno" /> Alunos: especialidade inicial 7/10</span>
          <span><i className="legenda-professor" /> Professores: experiência 8–10</span>
        </div>
      </header>

      <div className="personagem-ficha" style={{ '--personagem-cor': personagem.cor }}>
        <div className="personagem-arte-painel">
          <div className="personagem-tipo">{personagem.tipo}</div>
          <div className="personagem-arte">
            {!imagemFalhou[`grande-${personagem.id}`] ? (
              <img
                key={personagem.id}
                src={imagemDo(personagem)}
                alt={personagem.nome}
                onError={() => setImagemFalhou((atual) => ({ ...atual, [`grande-${personagem.id}`]: true }))}
              />
            ) : (
              <div className="personagem-placeholder">
                <span>{personagem.icone}</span>
                <small>Adicione depois:</small>
                <code>{personagem.imagem}</code>
              </div>
            )}
          </div>
          <div className="personagem-identidade">
            <span>{personagem.apelido}</span>
            <h2>{personagem.nome}</h2>
            <p>{personagem.especialidade}</p>
          </div>
        </div>

        <div className="personagem-capacidades">
          <div className="personagem-bloco-titulo">
            <div>
              <span>CAPACIDADES</span>
              <h3>Radar técnico</h3>
            </div>
            <div className="personagem-nivel">NV. <strong>{personagem.nivel}</strong></div>
          </div>

          <RadarPersonagem atributos={personagem.atributos} cor={personagem.cor} />

          <div className="personagem-atributos-grid">
            {ATRIBUTOS_PERSONAGEM.map(([chave, nome]) => (
              <div className="personagem-atributo" key={chave}>
                <div>
                  <span>{nome}</span>
                  <strong>{personagem.atributos[chave]}/10</strong>
                </div>
                <div className="personagem-barra">
                  <i style={{ width: `${personagem.atributos[chave] * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="personagem-detalhes">
          <span className="personagem-detalhes-kicker">PERFIL OPERACIONAL</span>
          <h3>{personagem.especialidade}</h3>
          <p className="personagem-descricao">{personagem.descricao}</p>

          <div className="personagem-habilidade">
            <div className="personagem-habilidade-icone">{personagem.icone}</div>
            <div>
              <span>HABILIDADE ESPECIAL</span>
              <strong>{personagem.habilidade}</strong>
              <p>{personagem.habilidadeDesc}</p>
            </div>
          </div>

          <div className="personagem-ponto-forte">
            <span>MAIOR CAPACIDADE</span>
            <strong>
              {ATRIBUTOS_PERSONAGEM.reduce((melhor, atual) =>
                personagem.atributos[atual[0]] > personagem.atributos[melhor[0]] ? atual : melhor
              )[1]}
            </strong>
            <b>
              {Math.max(...Object.values(personagem.atributos))}/10
            </b>
          </div>
        </aside>
      </div>

      <div className="personagens-roster">
        <div className="personagens-grupo">
          <div className="personagens-grupo-titulo">
            <span>01</span><div><strong>Alunos</strong><small>Especialistas em formação</small></div>
          </div>
          <div className="personagens-lista">{alunos.map(card)}</div>
        </div>

        <div className="personagens-grupo personagens-grupo-professores">
          <div className="personagens-grupo-titulo">
            <span>02</span><div><strong>Professores</strong><small>Mestres do CyberShield</small></div>
          </div>
          <div className="personagens-lista">{professores.map(card)}</div>
        </div>
      </div>
    </section>
  )
}


function TelaLoja({ token, loja, setLoja, aoEquipar }) {
  const [personagemFiltro, setPersonagemFiltro] = useState('todos')
  const [mensagem, setMensagem] = useState('')
  const [ocupado, setOcupado] = useState(null)
  const skins = loja?.skins || []
  const personagensComSkin = PERSONAGENS_CYBER.filter(p => skins.some(s => s.personagem_id === p.id && s.preco > 0))
  const exibidas = skins.filter(s => s.preco > 0 && (personagemFiltro === 'todos' || s.personagem_id === personagemFiltro))

  async function recarregar() {
    const data = await buscarLojaSkins(token)
    setLoja(data)
    return data
  }
  async function comprar(skin) {
    try {
      setOcupado(skin.id); setMensagem('')
      await comprarSkinPersonagem(token, skin.id)
      await recarregar()
      setMensagem(`${skin.nome} foi adicionada ao seu inventário.`)
    } catch (e) { setMensagem(e.message) }
    finally { setOcupado(null) }
  }
  async function equipar(skin) {
    try {
      setOcupado(skin.id); setMensagem('')
      await equiparSkinPersonagem(token, skin.personagem_id, skin.id)
      const data = await recarregar()
      aoEquipar?.(data.equipadas || {})
      setMensagem(`${skin.nome} equipada com sucesso.`)
    } catch (e) { setMensagem(e.message) }
    finally { setOcupado(null) }
  }
  async function desequipar(skin) {
    try {
      setOcupado(skin.id); setMensagem('')
      await desequiparSkinPersonagem(token, skin.personagem_id)
      const data = await recarregar()
      aoEquipar?.(data.equipadas || {})
      setMensagem(`${skin.nome} desequipada. ${PERSONAGENS_CYBER.find(p => p.id === skin.personagem_id)?.nome || 'O personagem'} voltou ao visual padrão.`)
    } catch (e) { setMensagem(e.message) }
    finally { setOcupado(null) }
  }

  return <section className="loja-area">
    <header className="loja-cabecalho">
      <div><span className="personagens-kicker">CYBERSHIELD // STORE</span><h1>Loja de Skins</h1><p>Use os créditos conquistados nos desafios para personalizar seus personagens.</p></div>
      <div className="loja-carteira"><span>CARTEIRA</span><strong>◈ {loja?.creditos ?? 0}</strong><small>créditos disponíveis</small></div>
    </header>
    <div className="loja-filtros">
      <button className={personagemFiltro === 'todos' ? 'ativo' : ''} onClick={() => setPersonagemFiltro('todos')}>Todas</button>
      {personagensComSkin.map(p => <button key={p.id} className={personagemFiltro === p.id ? 'ativo' : ''} onClick={() => setPersonagemFiltro(p.id)}>{p.nome}</button>)}
    </div>
    {mensagem && <div className="loja-mensagem">{mensagem}</div>}
    <div className="loja-grid">
      {exibidas.map(skin => {
        const dono = PERSONAGENS_CYBER.find(p => p.id === skin.personagem_id)
        return <article className={`loja-skin-card raridade-loja-${skin.raridade}`} key={skin.id}>
          <div className="loja-skin-imagem">
            <img src={skin.imagem} alt={skin.nome} onError={(e) => { e.currentTarget.onerror=null; e.currentTarget.src=dono?.imagem || IMAGEM_RAPOSA_INICIAL }} />
            <span className="loja-raridade">{skin.raridade}</span>
            {skin.equipada && <b className="loja-equipada">EQUIPADA</b>}
          </div>
          <div className="loja-skin-info"><small>{dono?.nome || skin.personagem_id}</small><h3>{skin.nome}</h3><p>{skin.descricao}</p>
            <div className="loja-skin-rodape"><strong>◈ {skin.preco}</strong>
              {skin.equipada ? <button className="botao-desequipar" onClick={() => desequipar(skin)} disabled={ocupado === skin.id}>{ocupado === skin.id ? 'Aguarde...' : 'Desequipar'}</button> : skin.comprada ? <button onClick={() => equipar(skin)} disabled={ocupado === skin.id}>Equipar</button> : <button onClick={() => comprar(skin)} disabled={ocupado === skin.id || (loja?.creditos ?? 0) < skin.preco}>{ocupado === skin.id ? 'Aguarde...' : 'Comprar'}</button>}
            </div>
          </div>
        </article>
      })}
    </div>
    {!exibidas.length && <div className="loja-vazia">As próximas skins desse personagem aparecerão aqui.</div>}
  </section>
}

function App() {
  const [status, setStatus] = useState('Conectando ao backend...')
  const [isConnected, setIsConnected] = useState(false)

  const [token, setToken] = useState(pegarToken())
  const [usuario, setUsuario] = useState(null)
  const [telaAuth, setTelaAuth] = useState('login')

  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  const [tokenRecuperacao, setTokenRecuperacao] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')

  const [erroAuth, setErroAuth] = useState(null)
  const [msgSucesso, setMsgSucesso] = useState(null)
  const [carregandoAuth, setCarregandoAuth] = useState(false)

  const [tela, setTela] = useState('areas')
  const [categorias, setCategorias] = useState([])
  const [areaSelecionada, setAreaSelecionada] = useState(null)
  const [moduloSelecionado, setModuloSelecionado] = useState(null)
  const [pontuacaoAtual, setPontuacaoAtual] = useState(null)
  const [displayedPoints, setDisplayedPoints] = useState(0)
  const [dificuldadeSelecionada, setDificuldadeSelecionada] = useState('easy')

  const [progresso, setProgresso] = useState(null)
  const [carregandoProgresso, setCarregandoProgresso] = useState(false)
  const [erroProgresso, setErroProgresso] = useState(null)

  const [pergunta, setPergunta] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erroQuiz, setErroQuiz] = useState(null)
  const [respostaSelecionada, setRespostaSelecionada] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [mensagemCombo, setMensagemCombo] = useState(null)
  const [celebracaoRaposa, setCelebracaoRaposa] = useState(null)
  const [sequenciaLocal, setSequenciaLocal] = useState(0)
  const [floatXP, setFloatXP] = useState(false)

  const [modoJogo, setModoJogo] = useState('livre')
  const [perguntasRespondidasMissao, setPerguntasRespondidasMissao] = useState(0)
  const [acertosMissao, setAcertosMissao] = useState(0)
  const [pontosInicioMissao, setPontosInicioMissao] = useState(0)
  const [maiorSequenciaMissao, setMaiorSequenciaMissao] = useState(0)
  const [mostrarResumo, setMostrarResumo] = useState(false)
  const [perguntasErradasSessao, setPerguntasErradasSessao] = useState([])
  const [filaRevisao, setFilaRevisao] = useState([])

  const [comboSobrevivencia, setComboSobrevivencia] = useState(0)
  const [recordeSobrevivencia, setRecordeSobrevivencia] = useState(0)
  const [tempoRestante, setTempoRestante] = useState(15)

  const [dicaVisivel, setDicaVisivel] = useState(false)
  const [dicaUsadaAtual, setDicaUsadaAtual] = useState(false)

  const [badgesDesbloqueados, setBadgesDesbloqueados] = useState([])
  const [novoBadge, setNovoBadge] = useState(null)
  const [ultimaRespostaErrou, setUltimaRespostaErrou] = useState(false)

  const [mensagemNivel, setMensagemNivel] = useState(null)

  const [skinAtual, setSkinAtual] = useState('padrao')
  const [mostrarSeletorSkins, setMostrarSeletorSkins] = useState(false)
  const [skinDetalhe, setSkinDetalhe] = useState(null)

  const [lojaPersonagens, setLojaPersonagens] = useState({ creditos: 0, skins: [], equipadas: {} })

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => { setStatus(`Backend respondeu: ${data.status}`); setIsConnected(true) })
      .catch(() => { setStatus('Não foi possível conectar ao backend.'); setIsConnected(false) })
  }, [])

  useEffect(() => {
    if (!token) { setUsuario(null); return }
    buscarUsuarioAtual(token).then(setUsuario).catch(() => { logout(); setToken(null) })
  }, [token])

  useEffect(() => {
    if (!token || !usuario) return
    buscarCategorias().then(setCategorias).catch(() => setErroQuiz('Não foi possível carregar as áreas.'))
  }, [token, usuario])

  useEffect(() => {
    if (!token || !usuario) return
    carregarProgresso()
  }, [token, usuario])

  useEffect(() => {
    if (!token || !usuario) return
    buscarLojaSkins(token).then(setLojaPersonagens).catch(() => {})
  }, [token, usuario])

  useEffect(() => {
    if (usuario) {
      const skin = SKINS.find(s => s.id === skinAtual) || SKINS[0]
      setCelebracaoRaposa({ fala: getFalaSkin(skinAtual, 'acerto'), sequencia: 0, id: Date.now(), imagem: skin.imagem })
      verificarStreak()
    }
  }, [usuario, skinAtual])

  useEffect(() => {
    if (!usuario) return
    try {
      const salvos = JSON.parse(localStorage.getItem(`cybershield_badges_${usuario.username}`) || '[]')
      setBadgesDesbloqueados(salvos)
      
      // Carregar a skin específica do usuário logado
      const skinSalva = localStorage.getItem(`cybershield_skin_${usuario.username}`) || 'padrao'
      setSkinAtual(skinSalva)
    } catch { 
      setBadgesDesbloqueados([]) 
      setSkinAtual('padrao')
    }
  }, [usuario])

  useEffect(() => {
    if (!pontuacaoAtual) return
    const target = pontuacaoAtual.pontos
    if (target === displayedPoints) return

    const start = displayedPoints
    const duration = 600
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      setDisplayedPoints(Math.floor(start + (target - start) * progress))
      if (progress === 1) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [pontuacaoAtual])

  function verificarStreak() {
    if (!usuario) return
    const today = new Date().toISOString().slice(0, 10)
    const lastLogin = localStorage.getItem(`cybershield_last_login_${usuario.username}`)
    let streak = parseInt(localStorage.getItem(`cybershield_streak_${usuario.username}`) || '0')

    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      if (lastLogin === yesterday) streak += 1
      else streak = 1
      
      localStorage.setItem(`cybershield_last_login_${usuario.username}`, today)
      localStorage.setItem(`cybershield_streak_${usuario.username}`, String(streak))
      
      if (streak > 1) setMensagemNivel(`🔥 Sequência de ${streak} dias! Bônus de 10 XP adicionados!`)
    }
  }

  function desbloquearBadge(slug) {
    setBadgesDesbloqueados((atual) => {
      if (atual.includes(slug)) return atual
      const atualizado = [...atual, slug]
      if (usuario) {
        try { localStorage.setItem(`cybershield_badges_${usuario.username}`, JSON.stringify(atualizado)) } catch {}
      }
      const badge = BADGES.find((b) => b.slug === slug)
      if (badge) setNovoBadge(badge)
      return atualizado
    })
  }

  // Checagem de pontos totais usando o campo correto
  useEffect(() => {
    if (!progresso) return
    const total = progresso.pontos_totais ?? 0
    if (total >= 500) desbloquearBadge('mestre-cyber')
    if (total >= 1000) desbloquearBadge('guardiao-yabuki')
  }, [progresso])

  useEffect(() => { if (!novoBadge) return; const t = setTimeout(() => setNovoBadge(null), 4500); return () => clearTimeout(t) }, [novoBadge])
  useEffect(() => { if (!mensagemNivel) return; const t = setTimeout(() => setMensagemNivel(null), 3500); return () => clearTimeout(t) }, [mensagemNivel])

  useEffect(() => {
    if (!areaSelecionada || !usuario) return
    try {
      const salvo = Number(localStorage.getItem(`cybershield_recorde_${usuario.username}_${areaSelecionada.slug}`) || 0)
      setRecordeSobrevivencia(salvo)
    } catch { setRecordeSobrevivencia(0) }
  }, [areaSelecionada, usuario])

  useEffect(() => {
    if (modoJogo === 'sobrevivencia' && pergunta && respostaSelecionada === null && !mostrarResumo) {
      setTempoRestante(15)
      const interval = setInterval(() => {
        setTempoRestante((t) => {
          if (t <= 1) { clearInterval(interval); if (respostaSelecionada === null) responder(-1); return 0 }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [modoJogo, pergunta, respostaSelecionada, mostrarResumo])

  function salvarRecordeSeMaior(valor) {
    if (!areaSelecionada || !usuario) return
    if (valor > recordeSobrevivencia) {
      setRecordeSobrevivencia(valor)
      try { localStorage.setItem(`cybershield_recorde_${usuario.username}_${areaSelecionada.slug}`, String(valor)) } catch {}
    }
  }

  function limparCamposSenha() { setSenha(''); setConfirmarSenha(''); setNovaSenha(''); setConfirmarNovaSenha('') }

  async function handleAuthSubmit(e) {
    e.preventDefault(); setErroAuth(null); setMsgSucesso(null); setCarregandoAuth(true)
    try {
      if (telaAuth === 'cadastro') { const data = await registrar({ nome, sobrenome, email, username, senha, confirmarSenha }); salvarToken(data.access_token); setToken(data.access_token) }
      if (telaAuth === 'login') { const data = await login(username, senha); salvarToken(data.access_token); setToken(data.access_token) }
      if (telaAuth === 'recuperar') { const data = await recuperarSenha(email); setMsgSucesso(data.token ? `Token gerado: ${data.token}. Use-o para redefinir a senha.` : 'Se o e-mail estiver cadastrado, você receberá instruções.'); setTelaAuth('redefinir') }
      if (telaAuth === 'redefinir') { await redefinirSenha(tokenRecuperacao, novaSenha, confirmarNovaSenha); setMsgSucesso('Senha redefinida com sucesso. Faça login com a nova senha.'); setTelaAuth('login'); setTokenRecuperacao(''); limparCamposSenha() }
    } catch (err) { setErroAuth(err.message) } finally { setCarregandoAuth(false) }
  }

  function handleLogout() { 
    logout(); 
    setToken(null); 
    setUsuario(null); 
    setSkinAtual('padrao') // Resetar a skin para o padrão ao sair
    resetarNavegacao() 
  }

  function resetarNavegacao() {
    setTela('areas'); setAreaSelecionada(null); setModuloSelecionado(null); setPontuacaoAtual(null)
    setPergunta(null); setCelebracaoRaposa(null); setSequenciaLocal(0); setModoJogo('livre')
    setMostrarResumo(false); setPerguntasRespondidasMissao(0); setAcertosMissao(0); setMaiorSequenciaMissao(0)
    setPerguntasErradasSessao([]); setFilaRevisao([]); setComboSobrevivencia(0)
    setDicaVisivel(false); setDicaUsadaAtual(false); setMensagemNivel(null)
  }

  const areasPrincipais = categorias.filter((c) => c.categoria_pai_id === null)
  function modulosDaArea(area) { return categorias.filter((c) => c.categoria_pai_id === area.id) }

  async function selecionarArea(area) {
    setAreaSelecionada(area); setModuloSelecionado(null)
    if (area.eh_modo_geral) { await entrarNoQuiz(area, area, 'missao'); return }
    setTela('hub')
    try { const pont = await buscarPontuacaoCategoria(token, area.slug); setPontuacaoAtual(pont); setDificuldadeSelecionada(pont.nivel_atual || 'easy') } catch { setPontuacaoAtual(null) }
  }

  async function selecionarModulo(modulo) {
    setModuloSelecionado(modulo)
    await entrarNoQuiz(areaSelecionada, modulo, 'missao')
  }

  async function entrarNoQuiz(area, categoriaParaPontuar, modo = 'livre') {
    setModoJogo(modo); setPerguntasRespondidasMissao(0); setAcertosMissao(0); setMaiorSequenciaMissao(0)
    setMostrarResumo(false); setComboSobrevivencia(0); setDicaVisivel(false); setDicaUsadaAtual(false)
    setUltimaRespostaErrou(false); setMensagemNivel(null); setTela('quiz')
    try { const pont = await buscarPontuacaoCategoria(token, categoriaParaPontuar.slug); setPontuacaoAtual(pont); setPontosInicioMissao(pont.pontos || 0) } catch { setPontuacaoAtual(null); setPontosInicioMissao(0) }
    buscarPergunta(categoriaParaPontuar.slug)
  }

  function iniciarSobrevivencia(area) {
    const modulos = modulosDaArea(area)
    if (!modulos.length) return
    const modulo = modulos[Math.floor(Math.random() * modulos.length)]
    setModuloSelecionado(modulo)
    entrarNoQuiz(area, modulo, 'sobrevivencia')
  }

  function voltarParaAreas() {
    resetarNavegacao()
    if (usuario) setCelebracaoRaposa({ fala: getFalaSkin(skinAtual, 'acerto'), sequencia: 0, id: Date.now(), imagem: SKINS.find(s => s.id === skinAtual).imagem })
  }

  function voltarParaHub() {
    setTela('hub'); setModuloSelecionado(null); setPergunta(null); setModoJogo('livre')
    setMostrarResumo(false); setPerguntasRespondidasMissao(0); setAcertosMissao(0); setMaiorSequenciaMissao(0)
    setComboSobrevivencia(0); setDicaVisivel(false); setDicaUsadaAtual(false); setMensagemNivel(null)
  }

  async function abrirRanking() { setTela('ranking'); setErroProgresso(null); await carregarProgresso(); }

  async function carregarProgresso() {
    if (!token) return
    setCarregandoProgresso(true); setErroProgresso(null)
    try { const data = await buscarProgressoUsuario(token); setProgresso(data) } catch (err) { setErroProgresso(err.message || 'Não foi possível carregar seu progresso.') } finally { setCarregandoProgresso(false) }
  }

  function buscarPergunta(categoriaSlug) {
    setCarregando(true); setErroQuiz(null); setPergunta(null); setRespostaSelecionada(null)
    setFeedback(null); setMensagemCombo(null); setDicaVisivel(false); setDicaUsadaAtual(false)
    obterPergunta(token, categoriaSlug, dificuldadeSelecionada)
      .then(setPergunta)
      .catch(() => setErroQuiz('Não foi possível gerar a pergunta. Tente novamente.'))
      .finally(() => setCarregando(false))
  }

  function trocarDificuldade(nivel) {
    setDificuldadeSelecionada(nivel)
    if (pontuacaoAtual) setPontuacaoAtual({ ...pontuacaoAtual, nivel_atual: nivel })
  }

  function avancarRevisao(fila) {
    if (!fila.length) { voltarParaHub(); return }
    const [proxima, ...resto] = fila
    setFilaRevisao(resto); setPergunta(proxima); setRespostaSelecionada(null); setFeedback(null)
    setMensagemCombo(null); setDicaVisivel(false); setDicaUsadaAtual(false); setCarregando(false)
  }

  function iniciarRevisaoDosErros() {
    const fila = perguntasErradasSessao
    setPerguntasErradasSessao([]); setModoJogo('revisao'); setMostrarResumo(false)
    avancarRevisao(fila)
  }

  async function responder(indice) {
    if (respostaSelecionada !== null || !pergunta) return
    
    setRespostaSelecionada(indice)
    setDicaVisivel(false)
    
    const acertou = indice === pergunta.resposta_correta
    const categoriaSlug = pergunta.categoria_slug
    const skinImg = SKINS.find(s => s.id === skinAtual).imagem

    if (acertou && ultimaRespostaErrou) desbloquearBadge('volta-por-cima')
    setUltimaRespostaErrou(!acertou)

    if (modoJogo === 'missao') {
      setPerguntasRespondidasMissao((n) => n + 1)
      if (acertou) setAcertosMissao((n) => n + 1)
    }

    if (!acertou) {
      const explicacao = pergunta.explicacao || `A resposta certa era: "${pergunta.alternativas[pergunta.resposta_correta]}"`
      setFeedback({ acertou: false, texto: explicacao })
      setSequenciaLocal(0)
      if (modoJogo !== 'revisao') {
        setPerguntasErradasSessao((lista) => { const jaTem = lista.some((p) => p.pergunta === pergunta.pergunta); return jaTem ? lista : [...lista, pergunta] })
      }
      if (modoJogo === 'sobrevivencia') salvarRecordeSeMaior(comboSobrevivencia)
      setCelebracaoRaposa({ fala: getFalaSkin(skinAtual, 'erro'), sequencia: 0, id: Date.now(), imagem: skinImg })
    } else {
      setFeedback({ acertou: true, texto: pergunta.explicacao || 'Boa! Resposta correta.' })
      setFloatXP(true)
      setTimeout(() => setFloatXP(false), 1000)

      const proximaSequencia = sequenciaLocal + 1
      setMaiorSequenciaMissao((m) => Math.max(m, proximaSequencia))
      if (modoJogo === 'sobrevivencia') {
        setComboSobrevivencia((c) => c + 1)
        if (comboSobrevivencia + 1 >= 10) desbloquearBadge('sobrevivente')
      }

      let tipoFala = 'acerto'
      if (proximaSequencia >= 5) tipoFala = 'combo5'
      else if (proximaSequencia >= 3) tipoFala = 'combo3'

      setSequenciaLocal(proximaSequencia)
      setCelebracaoRaposa({ fala: getFalaSkin(skinAtual, tipoFala), sequencia: proximaSequencia, id: Date.now(), imagem: skinImg })
    }

    try {
      const data = await enviarResposta(token, categoriaSlug, acertou, dicaUsadaAtual)
      
      // Checagem de Badges feita com os dados reais do módulo atual
      if (acertou) {
        const moduloSlug = pergunta.categoria_pergunta
        const melhorSeq = data.melhor_sequencia
        const pontosModulo = data.pontos

        if (moduloSlug === 'phishing' && melhorSeq >= 5) desbloquearBadge('olho-clinico')
        if (moduloSlug === 'mitre' && pontosModulo >= 100) desbloquearBadge('analista-attck')
        if (moduloSlug === 'eventos-historicos' && pontosModulo >= 100) desbloquearBadge('arquivista-digital')
        if (moduloSlug === 'rh-basico' && pontosModulo >= 100) desbloquearBadge('escudo-rh')
        if (moduloSlug === 'curiosidades' && melhorSeq >= 5) desbloquearBadge('guardiao-senha')
      }

      if (pontuacaoAtual && data.nivel_atual && data.nivel_atual !== pontuacaoAtual.nivel_atual) {
        const nomes = { easy: 'Fácil', medium: 'Intermediário', hard: 'Difícil' }
        setMensagemNivel(`Dificuldade adaptada para ${nomes[data.nivel_atual] || data.nivel_atual}.`)
      }
      setPontuacaoAtual(data)
      if (typeof data.creditos === 'number') setLojaPersonagens(atual => ({ ...atual, creditos: data.creditos }))
      if (data.mensagem_combo) setMensagemCombo(data.mensagem_combo)
      await carregarProgresso()
    } catch {}
  }

  function avancar() {
    if (modoJogo === 'missao') {
      if (perguntasRespondidasMissao >= 5) {
        if (acertosMissao === 5) desbloquearBadge('sem-brechas')
        desbloquearBadge('iniciao')
        setMostrarResumo(true); return
      }
      buscarPergunta(pergunta.categoria_slug); return
    }
    if (modoJogo === 'sobrevivencia') {
      const acertouUltima = respostaSelecionada === pergunta.resposta_correta
      if (!acertouUltima) { setMostrarResumo(true); return }
      const modulos = modulosDaArea(areaSelecionada)
      const proximoModulo = modulos.length ? modulos[Math.floor(Math.random() * modulos.length)] : moduloSelecionado
      setModuloSelecionado(proximoModulo)
      buscarPergunta(proximoModulo.slug); return
    }
    if (modoJogo === 'revisao') { avancarRevisao(filaRevisao); return }
    buscarPergunta(pergunta.categoria_slug)
  }

  let rotuloBotaoAvancar = 'Próxima ameaça ▸'
  if (modoJogo === 'missao' && perguntasRespondidasMissao >= 5) rotuloBotaoAvancar = 'Ver relatório da missão ▸'
  if (modoJogo === 'sobrevivencia' && pergunta && respostaSelecionada !== pergunta.resposta_correta) rotuloBotaoAvancar = 'Ver resultado ▸'
  if (modoJogo === 'revisao') rotuloBotaoAvancar = filaRevisao.length ? 'Próxima revisão ▸' : 'Concluir revisão ▸'

  const nomeAreaAtual = areaSelecionada?.nome
  const nomeModuloAtual = moduloSelecionado?.nome
  const desafioHoje = obterDesafioDoDia()
  const skinAtualData = SKINS.find(s => s.id === skinAtual)

  const renderizarCenario = () => {
    if (!pergunta) return null
    const tipo = pergunta.cenario_tipo || 'padrao'

    if (tipo === 'email') return (
      <div className="cenario-alerta">
        <span className="cenario-alerta-kicker">⚠ ALERTA DE E-MAIL</span>
        <div className="cenario-email-box">
          <div className="cenario-email-meta">{pergunta.cenario_titulo && <span><strong>Assunto:</strong> {pergunta.cenario_titulo}</span>}</div>
          <p className="cenario-email-corpo">{pergunta.cenario_conteudo}</p>
        </div>
        <p className="cenario-pergunta-texto">{pergunta.pergunta}</p>
      </div>
    )

    if (tipo === 'url') return (
      <div className="cenario-url-box">
        <span className="cenario-alerta-kicker">🔗 INSPEÇÃO DE URL</span>
        <div className="url-display"><code>{pergunta.cenario_conteudo}</code></div>
        <p className="cenario-pergunta-texto">{pergunta.pergunta}</p>
      </div>
    )

    if (tipo === 'chat') return (
      <div className="cenario-chat-box">
        <span className="cenario-alerta-kicker">💬 SIMULAÇÃO DE CHAT - {pergunta.cenario_titulo}</span>
        <div className="chat-display"><p className="chat-msg">{pergunta.cenario_conteudo}</p></div>
        <p className="cenario-pergunta-texto">{pergunta.pergunta}</p>
      </div>
    )

    if (tipo === 'log') return (
      <div className="cenario-log-box">
        <span className="cenario-alerta-kicker">🖥️ MONITOR DE SEGURANÇA - {pergunta.cenario_titulo}</span>
        <div className="log-display"><pre>{pergunta.cenario_conteudo}</pre></div>
        <p className="cenario-pergunta-texto">{pergunta.pergunta}</p>
      </div>
    )

    if (tipo === 'noticia') return (
      <div className="cenario-noticia-box">
        <span className="cenario-alerta-kicker">📰 PORTAL DE NOTÍCIAS</span>
        <div className="noticia-display">
          <h4 className="noticia-titulo">{pergunta.cenario_titulo}</h4>
          <p className="noticia-corpo">{pergunta.cenario_conteudo}</p>
        </div>
        <p className="cenario-pergunta-texto">{pergunta.pergunta}</p>
      </div>
    )

    return (
      <>
        <span className="quiz-kicker">DESAFIO DE SEGURANÇA</span>
        <h2 className="pergunta-texto">{pergunta.pergunta}</h2>
      </>
    )
  }

  function aplicarSkin(id) {
    if (usuario) {
      localStorage.setItem(`cybershield_skin_${usuario.username}`, id)
    }
    setSkinAtual(id)
    setMostrarSeletorSkins(false)
    setSkinDetalhe(null)
    setCelebracaoRaposa({ fala: getFalaSkin(id, 'acerto'), sequencia: 0, id: Date.now(), imagem: SKINS.find(s => s.id === id).imagem })
  }

  function verificarRequisitoSkin(requisito) {
    if (!requisito) return true
    return badgesDesbloqueados.includes(requisito)
  }

  return (
    <div className={`app-shell tema-bg-${areaSelecionada?.slug || 'default'} ${tela === 'personagens' ? 'app-shell-personagens' : ''}`}>
      <header className="topbar-nova">
        <div className="marca" onClick={voltarParaAreas} style={{ cursor: token ? 'pointer' : 'default' }}>
          <span className="marca-icone">🦊</span>
          <span className="marca-texto">CyberShield</span>
        </div>

        {isConnected && token && usuario && (
          <nav className="nav-links">
            <button className={`nav-link ${tela === 'areas' ? 'ativo' : ''}`} onClick={voltarParaAreas}>Áreas</button>
            <button className={`nav-link ${tela === 'historia' ? 'ativo' : ''}`} onClick={() => setTela('historia')}>História</button>
            <button className={`nav-link ${tela === 'personagens' ? 'ativo' : ''}`} onClick={() => setTela('personagens')}>Personagens</button>
            <button className={`nav-link ${tela === 'loja' ? 'ativo' : ''}`} onClick={() => setTela('loja')}>Loja</button>
            <button className={`nav-link ${tela === 'ranking' ? 'ativo' : ''}`} onClick={abrirRanking}>Meu Desempenho</button>
            <button className="nav-link" disabled>Perfil</button>
          </nav>
        )}

        <div className="topbar-direita">
          {isConnected && token && usuario && (
            <>
              {pontuacaoAtual && (
                <div className="placar" aria-label="Pontuação atual">
                  <span className="placar-label">{(areaSelecionada?.nome || '').toUpperCase() || 'SCORE'}</span>
                  <span className="placar-valor">{String(displayedPoints).padStart(4, '0')}</span>
                  {floatXP && <span className="float-xp">+10 XP</span>}
                </div>
              )}
              <div className="usuario-chip">
                <span className="usuario-avatar">{iniciais(usuario)}</span>
                <span className="usuario-nome">{usuario.username}</span>
              </div>
              <button className="botao-logout" onClick={handleLogout}>Sair</button>
            </>
          )}
        </div>
      </header>

      <main className={`conteudo ${token && usuario ? 'com-assistente' : ''} ${!token ? 'conteudo--login' : ''} tela-${tela}`}>
        {!token && (
          <div className="parceiros-logos">
            <img src="/logos/railway.png" alt="Railway" className="parceiro-logo parceiro-logo--mono" />
            <img src="/logos/grok.png" alt="Grok" className="parceiro-logo parceiro-logo--mono" />
            <img src="/logos/leroy-merlin.png" alt="Leroy Merlin" className="parceiro-logo parceiro-logo--cor" />
          </div>
        )}
        {!token && <p className="subtitulo">Plataforma Gamificada de Conscientização em Cibersegurança</p>}

        {!isConnected && (
          <>
            <div className="status-box disconnected"><span className="status-ponto" />{status}</div>
            <p className="hint">Se aparecer erro de conexão, confirmem que o backend está rodando na porta 8000.</p>
          </>
        )}

        {isConnected && !token && (
          <section className="auth-area">
            <div className="auth-hero">
              <div className="auth-hero-icone"><img src={IMAGEM_RAPOSA_BASE} alt="Yabuki, a raposa mascote do CyberShield" /></div>
              <h1 className="auth-hero-titulo">CyberShield</h1>
              <p className="auth-hero-subtitulo">Treine seus reflexos contra ameaças digitais</p>
            </div>

            <form className="auth-card" onSubmit={handleAuthSubmit}>
              <div className="auth-tabs">
                <button type="button" className={`auth-tab ${telaAuth === 'login' ? 'ativo' : ''}`} onClick={() => { setTelaAuth('login'); setErroAuth(null); setMsgSucesso(null) }}>Entrar</button>
                <button type="button" className={`auth-tab ${telaAuth === 'cadastro' ? 'ativo' : ''}`} onClick={() => { setTelaAuth('cadastro'); setErroAuth(null); setMsgSucesso(null) }}>Cadastrar</button>
              </div>

              {telaAuth === 'cadastro' && (
                <>
                  <div className="auth-campo"><span className="auth-campo-icone">👤</span><input className="auth-input" type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
                  <div className="auth-campo"><span className="auth-campo-icone">👤</span><input className="auth-input" type="text" placeholder="Sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required /></div>
                  <div className="auth-campo"><span className="auth-campo-icone">📧</span><input className="auth-input" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                </>
              )}

              {(telaAuth === 'login' || telaAuth === 'cadastro') && (
                <>
                  <div className="auth-campo"><span className="auth-campo-icone">👤</span><input className="auth-input" type="text" placeholder="Nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
                  <div className="auth-campo"><span className="auth-campo-icone">🔒</span><input className="auth-input" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required /></div>
                  {telaAuth === 'cadastro' && (
                    <>
                      <div className="auth-campo"><span className="auth-campo-icone">🔒</span><input className="auth-input" type="password" placeholder="Confirmar senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required /></div>
                      <div className="senha-regras">
                        A senha deve ter no mínimo 8 caracteres, incluindo:
                        <ul>
                          <li>Uma letra maiúscula</li>
                          <li>Uma letra minúscula</li>
                          <li>Um número</li>
                        </ul>
                      </div>
                    </>
                  )}
                </>
              )}

              {telaAuth === 'recuperar' && (<div className="auth-campo"><span className="auth-campo-icone">📧</span><input className="auth-input" type="email" placeholder="E-mail cadastrado" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>)}
              {telaAuth === 'redefinir' && (
                <>
                  <div className="auth-campo"><span className="auth-campo-icone">🔑</span><input className="auth-input" type="text" placeholder="Token de recuperação" value={tokenRecuperacao} onChange={(e) => setTokenRecuperacao(e.target.value)} required /></div>
                  <div className="auth-campo"><span className="auth-campo-icone">🔒</span><input className="auth-input" type="password" placeholder="Nova senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required /></div>
                  <div className="auth-campo"><span className="auth-campo-icone">🔒</span><input className="auth-input" type="password" placeholder="Confirmar nova senha" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} required /></div>
                </>
              )}

              {erroAuth && <p className="erro">{erroAuth}</p>}
              {msgSucesso && <p className="feedback feedback-certo">{msgSucesso}</p>}

              <button className="botao-cta auth-submit" type="submit" disabled={carregandoAuth}>
                {carregandoAuth ? 'Aguarde...' : telaAuth === 'login' ? 'Acessar sistema' : telaAuth === 'cadastro' ? 'Criar conta' : telaAuth === 'recuperar' ? 'Enviar instruções' : 'Redefinir senha'}
              </button>

              {telaAuth === 'login' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <button type="button" className="botao-voltar" onClick={() => { setTelaAuth('recuperar'); setErroAuth(null); setMsgSucesso(null) }}>Esqueci minha senha</button>
                  <button type="button" className="botao-voltar" onClick={() => { setTelaAuth('cadastro'); setErroAuth(null); setMsgSucesso(null) }}>Criar uma conta</button>
                </div>
              )}
              {(telaAuth === 'recuperar' || telaAuth === 'redefinir') && (<button type="button" className="botao-voltar" onClick={() => { setTelaAuth('login'); setErroAuth(null); setMsgSucesso(null) }}>Voltar para login</button>)}
            </form>
          </section>
        )}

        {isConnected && token && usuario && tela === 'areas' && (
          <section className="areas-area">
            <div className="hero-mascote">
              <div className="hero-texto">
                <h1>Treine seus reflexos contra ameaças digitais</h1>
                <p>Escolha uma área e comece a proteger sua rede</p>
              </div>
              <div className="mascote-container">
                <span className="mascote-glow" />
                <img className="mascote" src={IMAGEM_RAPOSA_INICIAL} alt="Yabuki, a mascote do CyberShield" />
              </div>
            </div>

            <div className="desafio-diario">
              <span className="desafio-diario-kicker">DESAFIO DE HOJE</span>
              <p>{desafioHoje.texto}</p>
              <span className="desafio-diario-xp">+{desafioHoje.xp} XP sugeridos</span>
            </div>

            <div className="destaques">
              <h2>Áreas de treinamento</h2>
              <div className="grade-destaques">
                {areasPrincipais.map((area) => (
                  <button key={area.id} className={`card-destaque tema-${area.slug}`} onClick={() => selecionarArea(area)}>
                    <div className="card-destaque-capa">
                      {IMAGENS_RAPOSA[area.slug] ? <img className="card-destaque-imagem" src={IMAGENS_RAPOSA[area.slug]} alt={area.nome} onError={(e) => { e.currentTarget.style.display = 'none' }} /> : <span className="card-destaque-icone">{ICONE_AREA[area.slug] || '📁'}</span>}
                      {area.eh_modo_geral && <span className="card-tag">★ Desafio</span>}
                    </div>
                    <div className="card-destaque-info">
                      <h3>{area.nome}</h3>
                      <p>{area.eh_modo_geral ? 'Desafie-se com tudo misturado' : `Módulos de ${area.nome}`}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {isConnected && token && usuario && tela === 'personagens' && (
          <TelaPersonagens equipadas={lojaPersonagens.equipadas} skinsLoja={lojaPersonagens.skins} />
        )}

        {isConnected && token && usuario && tela === 'loja' && (
          <TelaLoja token={token} loja={lojaPersonagens} setLoja={setLojaPersonagens} aoEquipar={(equipadas) => setLojaPersonagens(atual => ({ ...atual, equipadas }))} />
        )}

        {isConnected && token && usuario && tela === 'historia' && (
          <Historia token={token} onSair={voltarParaAreas} onPontos={setPontuacaoAtual} />
        )}

        {isConnected && token && usuario && tela === 'hub' && areaSelecionada && (
          <section className="hub-area">
            <button className="botao-voltar" onClick={voltarParaAreas}>‹ Áreas</button>
            <h2 className="secao-titulo">{ICONE_AREA[areaSelecionada.slug]} {areaSelecionada.nome}</h2>
            {pontuacaoAtual && <p className="hub-resumo">{pontuacaoAtual.pontos} pontos · {pontuacaoAtual.titulo}</p>}

            <div className="seletor-dificuldade">
              <span className="seletor-dificuldade-label">Nível das perguntas</span>
              <div className="seletor-dificuldade-opcoes">
                <button className={`dificuldade-botao dificuldade-easy ${dificuldadeSelecionada === 'easy' ? 'ativo' : ''}`} onClick={() => trocarDificuldade('easy')}>Fácil</button>
                <button className={`dificuldade-botao dificuldade-medium ${dificuldadeSelecionada === 'medium' ? 'ativo' : ''}`} onClick={() => trocarDificuldade('medium')}>Médio</button>
                <button className={`dificuldade-botao dificuldade-hard ${dificuldadeSelecionada === 'hard' ? 'ativo' : ''}`} onClick={() => trocarDificuldade('hard')}>Difícil</button>
              </div>
            </div>

            <div className="cards-grid">
              {modulosDaArea(areaSelecionada).map((modulo) => (
                <button key={modulo.id} className="card-modulo" onClick={() => selecionarModulo(modulo)}>
                  <span className="card-icone">{ICONE_MODULO[modulo.slug] || '📄'}</span>
                  <span className="card-nome">{modulo.nome}</span>
                </button>
              ))}
            </div>
            <button className="botao-sobrevivencia" onClick={() => iniciarSobrevivencia(areaSelecionada)}>🏆 Modo Sobrevivência {recordeSobrevivencia > 0 ? ` · Recorde: ${recordeSobrevivencia}` : ''}</button>
            <button className="botao-voltar" style={{ marginTop: '15px', fontSize: '0.9rem', color: '#2de2e6', textAlign: 'center', width: '100%' }} onClick={() => entrarNoQuiz(areaSelecionada, areaSelecionada, 'livre')}>🎯 Treino Livre (Sem limite)</button>
          </section>
        )}

        {isConnected && token && usuario && tela === 'ranking' && (
          <section className="ranking-area">
            <div className="ranking-cabecalho">
              <div>
                <button className="botao-voltar" onClick={voltarParaAreas}>‹ Áreas</button>
                <span className="ranking-kicker">CYBERSHIELD // PERFORMANCE</span>
                <h1 className="ranking-titulo">Meu Desempenho</h1>
                <p className="ranking-subtitulo">Acompanhe sua evolução pessoal no treinamento.</p>
              </div>
              <button className="ranking-atualizar" onClick={abrirRanking} disabled={carregandoProgresso}>{carregandoProgresso ? 'Atualizando...' : '↻ Atualizar'}</button>
            </div>

            {erroProgresso && <div className="ranking-erro">{erroProgresso}</div>}
            {carregandoProgresso && !progresso && (<div className="ranking-loading"><div className="scan-barra"><div className="scan-luz" /></div><p>Analisando seu desempenho...</p></div>)}

            {progresso && (
              <>
                <div className="progresso-resumo">
                  <div className="progresso-card progresso-card-destaque"><span className="progresso-card-icone">🏆</span><span className="progresso-card-label">PONTOS TOTAIS</span><strong>{progresso.pontos_totais ?? 0}</strong></div>
                  <div className="progresso-card"><span className="progresso-card-icone">⚡</span><span className="progresso-card-label">MELHOR SEQUÊNCIA</span><strong>{progresso.melhor_sequencia ?? 0}</strong></div>
                  <div className="progresso-card"><span className="progresso-card-icone">🎖️</span><span className="progresso-card-label">TÍTULO</span><strong>{progresso.titulo || 'Iniciante'}</strong></div>
                  <div className="progresso-card"><span className="progresso-card-icone">🧠</span><span className="progresso-card-label">ÁREA FORTE</span><strong>{progresso.area_forte?.nome || 'Ainda treinando'}</strong></div>
                </div>

                <div className="progresso-analise">
                  <div className="progresso-painel">
                    <div className="progresso-painel-topo">
                      <div><span className="progresso-painel-kicker">DIAGNÓSTICO</span><h2>O que você precisa melhorar</h2></div>
                      <span className="progresso-painel-icone">🎯</span>
                    </div>
                    {progresso.areas?.length > 0 ? (
                      <div className="melhorias-lista">
                        {[...progresso.areas].sort((a, b) => (a.pontos || 0) - (b.pontos || 0)).slice(0, 3).map((area, index) => (
                          <div className="melhoria-item" key={area.slug || area.nome || index}>
                            <span className="melhoria-numero">{index + 1}</span>
                            <div className="melhoria-info"><strong>{area.nome}</strong><span>{area.pontos ?? 0} pontos · nível {area.nivel_atual ?? 'easy'}</span></div>
                            <span className="melhoria-status">TREINAR</span>
                          </div>
                        ))}
                      </div>
                    ) : (<p className="ranking-vazio">Responda algumas perguntas para que a Yabuki consiga analisar seu desempenho.</p>)}
                  </div>

                  <div className="progresso-painel painel-forte">
                    <span className="progresso-painel-kicker">SEU DESTAQUE</span>
                    <div className="area-forte-icone">🦊</div>
                    <h2>{progresso.area_forte?.nome || 'Continue treinando'}</h2>
                    <p>{progresso.area_forte ? `Você está tendo seu melhor desempenho em ${progresso.area_forte.nome}.` : 'Continue respondendo desafios para descobrir sua área mais forte.'}</p>
                  </div>
                </div>

                <div className="progresso-areas">
                  <div className="progresso-secao-header">
                    <div><span className="progresso-painel-kicker">EVOLUÇÃO</span><h2>Progresso por área</h2></div>
                    <span>{progresso.areas?.length || 0} áreas</span>
                  </div>
                  {progresso.areas?.length > 0 ? (
                    <div className="progresso-areas-lista">
                      {progresso.areas.map((area, index) => {
                        const pontos = Number(area.pontos || 0)
                        const percentual = Math.min(100, Math.max(0, pontos / 5))
                        return (
                          <div className="area-progresso" key={area.slug || area.nome || index}>
                            <div className="area-progresso-topo">
                              <div className="area-progresso-nome">
                                <span className="area-progresso-icone">{ICONE_AREA[area.slug] || '📁'}</span>
                                <div><strong>{area.nome}</strong><span>{area.titulo || area.nivel_atual || 'Iniciante'}</span></div>
                              </div>
                              <div className="area-progresso-pontos"><strong>{pontos}</strong><span>pontos</span></div>
                            </div>
                            <div className="barra-progresso"><div className="barra-progresso-preenchida" style={{ width: `${percentual}%` }} /></div>
                            <div className="area-progresso-footer"><span>Sequência atual: {area.sequencia_atual ?? 0}</span><span>Melhor: {area.melhor_sequencia ?? 0}</span></div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (<div className="ranking-vazio">Você ainda não possui pontuações registradas. Comece um treinamento!</div>)}
                </div>

                <div className="progresso-badges">
                  <span className="progresso-painel-kicker">CONQUISTAS</span>
                  <h2>Minhas conquistas</h2>
                  <div className="badges-grid">
                    {BADGES.map((b) => (
                      <div key={b.slug} className={`badge-item ${badgesDesbloqueados.includes(b.slug) ? 'desbloqueado' : 'bloqueado'} raridade-${b.raridade}`}>
                        <div className="badge-glow"></div>
                        <span className="badge-item-icone">{b.icone}</span>
                        <strong>{b.nome}</strong>
                        <small>{b.descricao}</small>
                        <span className="badge-item-raridade">{b.raridade.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {isConnected && token && usuario && tela === 'quiz' && (
          <section className="quiz-area">
            <button className="botao-voltar" onClick={areaSelecionada?.eh_modo_geral ? voltarParaAreas : voltarParaHub}>‹ {areaSelecionada?.eh_modo_geral ? 'Áreas' : nomeAreaAtual}</button>

            {nomeModuloAtual && <p className="quiz-contexto">{nomeAreaAtual} · {nomeModuloAtual}</p>}
            {pontuacaoAtual && modoJogo !== 'sobrevivencia' && (<p className="quiz-contexto-nivel">Nível: {pontuacaoAtual.nivel_atual} · Sequência: {pontuacaoAtual.sequencia_atual}</p>)}
            {modoJogo === 'sobrevivencia' && !mostrarResumo && (<p className="quiz-contexto-nivel">🏆 Combo: {comboSobrevivencia} · Recorde: {recordeSobrevivencia} · ⏱️ {tempoRestante}s</p>)}
            
            {modoJogo === 'missao' && !mostrarResumo && (
              <div className="barra-missao-wrap">
                <div className="missao-header">
                  <span className="barra-missao-label">MISSÃO {Math.min(perguntasRespondidasMissao + 1, 5)} / 5</span>
                  {sequenciaLocal > 0 && <span className="combo-badge">🔥 COMBO ×{sequenciaLocal}</span>}
                </div>
                <div className="barra-missao"><div className="barra-missao-preenchida" style={{ width: `${(perguntasRespondidasMissao / 5) * 100}%` }} /></div>
              </div>
            )}

            {mensagemNivel && <div className="nivel-banner">{mensagemNivel}</div>}

            {carregando && (
              <div className="quiz-card">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-box"></div>
                <div className="skeleton skeleton-box"></div>
                <div className="skeleton skeleton-box"></div>
                <div className="skeleton skeleton-box"></div>
              </div>
            )}

            {erroQuiz && <p className="erro">{erroQuiz}</p>}
            {mensagemCombo && <div className="combo-banner">{mensagemCombo}</div>}

            {mostrarResumo && (
              <div className="quiz-card resumo-card">
                {modoJogo === 'missao' && (
                  <>
                    <span className="quiz-kicker">RELATÓRIO DA MISSÃO</span>
                    <h2 className="pergunta-texto">{acertosMissao}/5 ameaças neutralizadas</h2>
                    <div className="relatorio-grid">
                      <div className="relatorio-item"><span className="relatorio-label">XP GANHO</span><strong className="relatorio-valor">+{Math.max(0, (pontuacaoAtual?.pontos || 0) - pontosInicioMissao)}</strong></div>
                      <div className="relatorio-item"><span className="relatorio-label">MAIOR SEQUÊNCIA</span><strong className="relatorio-valor">{maiorSequenciaMissao}🔥</strong></div>
                    </div>
                    {perguntasErradasSessao.length > 0 && (
                      <div className="relatorio-falhas">
                        <span className="relatorio-falhas-titulo">⚠ Pontos de Atenção:</span>
                        <p>Você errou {perguntasErradasSessao.length} pergunta(s). Revise os conceitos de <strong>{perguntasErradasSessao[0].categoria_pergunta || nomeModuloAtual}</strong> para fortalecer sua defesa.</p>
                      </div>
                    )}
                  </>
                )}
                {modoJogo === 'sobrevivencia' && (
                  <>
                    <span className="quiz-kicker">FIM DA RODADA</span>
                    <h2 className="pergunta-texto">Combo final: {comboSobrevivencia}</h2>
                    <p className="resumo-linha">Recorde: {recordeSobrevivencia}</p>
                  </>
                )}
                <div className="resumo-acoes">
                  {modoJogo === 'missao' && (<button className="botao-cta" onClick={() => entrarNoQuiz(areaSelecionada, moduloSelecionado || areaSelecionada, 'missao')}>Iniciar nova missão</button>)}
                  {modoJogo === 'sobrevivencia' && (<button className="botao-cta" onClick={() => iniciarSobrevivencia(areaSelecionada)}>Tentar de novo</button>)}
                  {modoJogo === 'missao' && perguntasErradasSessao.length > 0 && (<button className="botao-cta botao-cta--secundario" onClick={iniciarRevisaoDosErros}>Revisar erros ({perguntasErradasSessao.length})</button>)}
                  <button className="botao-voltar" onClick={areaSelecionada?.eh_modo_geral ? voltarParaAreas : voltarParaHub}>Voltar ao hub</button>
                </div>
              </div>
            )}

            {pergunta && !carregando && !mostrarResumo && (
              <div className="quiz-card">
                <div className="quiz-card-topo">
                  <div className="cenario-container">{renderizarCenario()}</div>
                  {pontuacaoAtual && (<div className="quiz-mini-stats"><span>LVL {pontuacaoAtual.nivel_atual}</span><span>🔥 {pontuacaoAtual.sequencia_atual}</span></div>)}
                </div>

                {respostaSelecionada === null && (
                  <div className="dica-area">
                    {!dicaVisivel ? (<button type="button" className="botao-dica" onClick={() => { setDicaVisivel(true); setDicaUsadaAtual(true) }}>💡 Pedir dica da Yabuki</button>) : (<p className="dica-texto">A dica está no balão da Yabuki! 👉</p>)}
                  </div>
                )}

                <div className="alternativas-grid">
                  {pergunta.alternativas.map((alt, i) => {
                    const estilo = ESTILOS_ALTERNATIVA[i] || ESTILOS_ALTERNATIVA[0]
                    let classe = `alternativa alt-${estilo.cor}`
                    if (respostaSelecionada !== null) {
                      if (i === pergunta.resposta_correta) classe += ' correta'
                      else if (i === respostaSelecionada) classe += ' incorreta'
                      else classe += ' neutra'
                    }
                    return (
                      <button key={i} className={classe} onClick={() => responder(i)} disabled={respostaSelecionada !== null}>
                        <span className="alt-icone">{estilo.icone}</span>
                        <span className="alt-texto">{alt}</span>
                      </button>
                    )
                  })}
                </div>

                {feedback && (
                  <div className={`feedback-rico ${feedback.acertou ? 'feedback-certo' : 'feedback-errado'}`}>
                    <strong>{feedback.acertou ? '✓ AMEAÇA NEUTRALIZADA' : '⚠ BRECHA IDENTIFICADA'}</strong>
                    <p>{feedback.texto}</p>
                    {DICAS_CONTEXTUAIS[pergunta.categoria_pergunta] && (<small>Dica da Yabuki: {DICAS_CONTEXTUAIS[pergunta.categoria_pergunta]}</small>)}
                  </div>
                )}

                {respostaSelecionada !== null && (<button className="botao-cta botao-proxima" onClick={avancar}>{rotuloBotaoAvancar}</button>)}
              </div>
            )}
          </section>
        )}
      </main>

      {isConnected && token && usuario && (
        <aside className="raposa-assistente" aria-live="polite">
          {(() => {
            const pontosTotais = progresso?.pontos_totais || 0;
            let rank = { titulo: 'Recruta Digital', cor: '#7c8ba8' }
            if (pontosTotais >= 300) rank = { titulo: 'Guardião Cibernético', cor: '#ffd700' }
            else if (pontosTotais >= 150) rank = { titulo: 'Analista Defensivo', cor: '#3d7eff' }
            else if (pontosTotais >= 50) rank = { titulo: 'Aprendiz de Rede', cor: '#2de2e6' }

            return (
              <>
                <div className="raposa-assistente-balao" style={{ borderColor: rank.cor }}>
                  <small className="raposa-assistente-nome" style={{ color: rank.cor }}>{NOME_RAPOSA} - {rank.titulo}</small>
                  <span>
                    {dicaVisivel && pergunta ? `💡 ${getFalaSkin(skinAtual, 'dica')}` : (celebracaoRaposa?.fala || getFalaSkin(skinAtual, 'acerto'))}
                  </span>
                  {celebracaoRaposa?.sequencia > 0 && !dicaVisivel && <small className="raposa-assistente-combo" style={{ color: rank.cor }}>COMBO ×{celebracaoRaposa.sequencia}</small>}
                  
                  <button className="botao-skins" onClick={() => setMostrarSeletorSkins(true)} title="Personalizar Yabuki">
                     🎨 Skins
                  </button>
                </div>

                <div className="raposa-assistente-personagem" aria-hidden="true">
                  <div className="mascote-glow" style={{ background: `radial-gradient(circle, ${rank.cor}33, transparent 70%)` }}></div>
                  <img src={celebracaoRaposa?.imagem || skinAtualData.imagem} alt="Yabuki" style={{ filter: `drop-shadow(0 0 18px ${rank.cor}80) drop-shadow(0 0 40px ${rank.cor}40)` }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGEM_RAPOSA_INICIAL }} />
                </div>

                {pontuacaoAtual && (
                  <div className="raposa-stats">
                    <div className="raposa-stat"><span className="raposa-stat-valor">{pontuacaoAtual.pontos}</span><span className="raposa-stat-label">PONTOS</span></div>
                    <div className="raposa-stat"><span className="raposa-stat-valor">{pontuacaoAtual.melhor_sequencia}</span><span className="raposa-stat-label">MELHOR SEQ.</span></div>
                    <div className="raposa-stat"><span className="raposa-stat-valor">{pontuacaoAtual.titulo}</span><span className="raposa-stat-label">TÍTULO</span></div>
                  </div>
                )}
              </>
            )
          })()}
        </aside>
      )}

      {mostrarSeletorSkins && (
        <div className="modal-skins-overlay" onClick={() => { setMostrarSeletorSkins(false); setSkinDetalhe(null) }}>
          <div className="modal-skins-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setMostrarSeletorSkins(false); setSkinDetalhe(null) }}>✖</button>
            <h2 className="modal-title">Personalização da Yabuki</h2>
            
            {!skinDetalhe ? (
              <div className="skins-grid-modal">
                {SKINS.map(skin => {
                  const desbloqueada = verificarRequisitoSkin(skin.requisito)
                  return (
                    <div key={skin.id} className={`skin-card raridade-${skin.raridade} ${desbloqueada ? 'desbloqueada' : 'bloqueada'} ${skinAtual === skin.id ? 'selecionada' : ''}`} onClick={() => desbloqueada ? setSkinDetalhe(skin) : null}>
                      <div className="skin-img-wrap">
                        <img src={skin.imagem} alt={skin.nome} className={desbloqueada ? '' : 'locked'} />
                      </div>
                      <div className="skin-info">
                        <strong>{skin.nome}</strong>
                        <span className={`skin-raridade-tag raridade-${skin.raridade}`}>{skin.raridade.toUpperCase()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="skin-detalhe-view">
                <button className="botao-voltar" onClick={() => setSkinDetalhe(null)}>‹ Voltar</button>
                <div className="skin-detalhe-header">
                  <img src={skinDetalhe.imagem} alt={skinDetalhe.nome} />
                  <div>
                    <h3>{skinDetalhe.nome}</h3>
                    <span className={`skin-raridade-tag raridade-${skinDetalhe.raridade}`}>{skinDetalhe.raridade.toUpperCase()}</span>
                  </div>
                </div>
                <p className="skin-descricao">{skinDetalhe.descricao}</p>
                
                {verificarRequisitoSkin(skinDetalhe.requisito) ? (
                  <button className="botao-cta" onClick={() => aplicarSkin(skinDetalhe.id)} disabled={skinAtual === skinDetalhe.id}>
                    {skinAtual === skinDetalhe.id ? 'Skin Atualmente Equipada' : 'Equipar Skin'}
                  </button>
                ) : (
                  <div className="skin-locked-msg">
                    🔒 Bloqueada<br />
                    Conquiste o badge: <strong>{BADGES.find(b => b.slug === skinDetalhe.requisito)?.nome || 'Desconhecido'}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {novoBadge && (
        <div className="badge-toast" role="status">
          <span className="badge-toast-icone">{novoBadge.icone}</span>
          <div>
            <strong>Conquista desbloqueada!</strong>
            <p>{novoBadge.nome} — {novoBadge.descricao}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App