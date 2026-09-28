import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { enviarResposta } from './auth.js'
import './BossBattle.css'

const CONFIG = {
  bossMax: 300,
  muriloMax: 160,
  vitorMax: 160,

  danoInimigoMin: 22,
  danoInimigoMax: 36,

  finalHP: 65,
}

const ASSETS = {
  fundo: '/historia/fase1/batalha/fundo-boss.png',

  boss: '/historia/fase1/batalha/phishing-monster.png',

  murilo: {
    normal: '/historia/personagens/murilo/batalha/costas.png',

    correlacao:
      '/historia/personagens/murilo/batalha/correlacao.png',

    olho:
      '/historia/personagens/murilo/batalha/olho-do-anao.png',

    quebra:
      '/historia/personagens/murilo/batalha/quebra-de-padrao.png',

    ioc:
      '/historia/personagens/murilo/batalha/cacador-de-ioc.png',

    especial:
      '/historia/personagens/murilo/batalha/especial.png',
  },

  vitor: {
    normal: '/historia/personagens/vitor/batalha/costas.png',

    pretexto:
      '/historia/personagens/vitor/batalha/leitura-de-pretexto.png',

    autoridade:
      '/historia/personagens/vitor/batalha/quebra-de-autoridade.png',

    urgencia:
      '/historia/personagens/vitor/batalha/controle-de-urgencia.png',

    engenharia:
      '/historia/personagens/vitor/batalha/engenharia-reversa-social.png',

    especial:
      '/historia/personagens/vitor/batalha/especial.png',
  },
}

const LUTADORES = {
  murilo: {
    nome: 'MURILO',
    subtitulo: 'THREAT INTELLIGENCE',

    ataques: [
      {
        id: 'correlacao',
        nome: 'CORRELAÇÃO',
        dano: 30,
        sprite: ASSETS.murilo.correlacao,
        descricao:
          'Cruza indicadores e encontra relações escondidas dentro da campanha.',
      },

      {
        id: 'olho-do-anao',
        nome: 'OLHO DO ANÃO',
        dano: 38,
        sprite: ASSETS.murilo.olho,
        descricao:
          'Analisa rapidamente os sinais da infraestrutura e expõe inconsistências.',
      },

      {
        id: 'quebra-de-padrao',
        nome: 'QUEBRA DE PADRÃO',
        dano: 46,
        sprite: ASSETS.murilo.quebra,
        descricao:
          'Identifica o padrão operacional da ameaça e o quebra antes da adaptação.',
      },

      {
        id: 'cacador-de-ioc',
        nome: 'CAÇADOR DE IOC',
        dano: 55,
        combo: 2,
        sprite: ASSETS.murilo.ioc,
        descricao:
          'Rastreia indicadores comprometidos e atinge diretamente a infraestrutura.',
      },
    ],
  },

  vitor: {
    nome: 'VITOR',
    subtitulo: 'SOCIAL ENGINEERING',

    ataques: [
      {
        id: 'leitura-de-pretexto',
        nome: 'LEITURA DE PRETEXTO',
        dano: 30,
        sprite: ASSETS.vitor.pretexto,
        descricao:
          'Identifica a história criada pelo atacante para manipular a vítima.',
      },

      {
        id: 'quebra-de-autoridade',
        nome: 'QUEBRA DE AUTORIDADE',
        dano: 38,
        sprite: ASSETS.vitor.autoridade,
        descricao:
          'Desmonta a falsa autoridade utilizada pelo atacante.',
      },

      {
        id: 'controle-de-urgencia',
        nome: 'CONTROLE DE URGÊNCIA',
        dano: 46,
        sprite: ASSETS.vitor.urgencia,
        descricao:
          'Neutraliza medo, urgência e pressão psicológica.',
      },

      {
        id: 'engenharia-reversa-social',
        nome: 'ENGENHARIA REVERSA SOCIAL',
        dano: 55,
        combo: 2,
        sprite: ASSETS.vitor.engenharia,
        descricao:
          'Reconstrói o golpe e utiliza o próprio pretexto contra a ameaça.',
      },
    ],
  },
}

const PERGUNTAS = [
  {
    id: 'smishing',
    pergunta:
      'Uma mensagem SMS contém um link falso e tenta roubar dados da vítima. Como esse ataque é classificado?',
    alternativas: ['Smishing', 'Ransomware', 'DDoS', 'SQL Injection'],
    correta: 0,
    explicacao:
      'Smishing é uma modalidade de phishing realizada por SMS.',
  },

  {
    id: 'dominio',
    pergunta:
      'Qual é um dos sinais mais importantes ao analisar uma página suspeita que imita um banco?',
    alternativas: [
      'A página possuir imagens',
      'O site utilizar HTTPS',
      'O domínio não corresponder ao domínio oficial',
      'A página possuir formulário',
    ],
    correta: 2,
    explicacao:
      'O domínio precisa realmente pertencer à instituição que a página afirma representar.',
  },

  {
    id: 'https',
    pergunta:
      'Um site possuir HTTPS significa que ele necessariamente é legítimo?',
    alternativas: [
      'Sim',
      'Não. Sites maliciosos também podem utilizar HTTPS',
      'Sim, se possuir logotipo',
      'Somente em computadores',
    ],
    correta: 1,
    explicacao:
      'HTTPS protege a comunicação, mas não comprova que o proprietário é legítimo.',
  },

  {
    id: 'arroba',
    pergunta:
      'No endereço https://banksecure.com@malicious-site.com/login, qual domínio será realmente acessado?',
    alternativas: [
      'banksecure.com',
      'login.com',
      'malicious-site.com',
      'Os dois',
    ],
    correta: 2,
    explicacao:
      'Nesse endereço, o host real é malicious-site.com.',
  },

  {
    id: 'urgencia',
    pergunta:
      '"Sua conta será bloqueada em 10 minutos. Confirme seus dados agora." Qual técnica está sendo explorada?',
    alternativas: [
      'Urgência e pressão psicológica',
      'Criptografia',
      'Persistência',
      'Escalonamento de privilégios',
    ],
    correta: 0,
    explicacao:
      'A urgência tenta reduzir o tempo que a vítima tem para analisar a situação.',
  },

  {
    id: 'dominio-parecido',
    pergunta:
      'Qual endereço apresenta maior sinal de impersonação de uma empresa chamada CyberBank?',
    alternativas: [
      'cyberbank.com.br',
      'app.cyberbank.com.br',
      'cyberbank-seguranca-login.com',
      'suporte.cyberbank.com.br',
    ],
    correta: 2,
    explicacao:
      'Usar o nome da empresa dentro de outro domínio não torna o endereço oficial.',
  },

  {
    id: 'pretexto',
    pergunta:
      'Um atacante conhece o nome do aluno e se passa pelo suporte da faculdade. O que torna o golpe mais convincente?',
    alternativas: [
      'A personalização e um pretexto coerente',
      'A existência de HTML',
      'O horário',
      'A velocidade da internet',
    ],
    correta: 0,
    explicacao:
      'Informações contextualizadas tornam o pretexto mais plausível.',
  },

  {
    id: 'correlacao',
    pergunta:
      'Vários domínios recentes possuem páginas quase idênticas. O que isso pode indicar?',
    alternativas: [
      'Todos são legítimos',
      'Não existe relação',
      'Podem fazer parte da mesma campanha',
      'São necessariamente atacantes diferentes',
    ],
    correta: 2,
    explicacao:
      'Infraestrutura e padrões semelhantes podem indicar uma campanha relacionada.',
  },

  {
    id: 'ioc',
    pergunta:
      'Qual destes elementos pode ser utilizado como indicador durante uma investigação de phishing?',
    alternativas: [
      'Domínio utilizado na campanha',
      'Cor favorita da vítima',
      'Modelo do monitor',
      'Volume do computador',
    ],
    correta: 0,
    explicacao:
      'Domínios e URLs podem funcionar como indicadores úteis para correlação.',
  },

  {
    id: 'canal-oficial',
    pergunta:
      'Uma mensagem afirma ser do banco e exige uma ação imediata. Qual é a atitude mais segura?',
    alternativas: [
      'Responder a mensagem',
      'Abrir o link',
      'Acessar o banco por um canal oficial independente',
      'Enviar a senha',
    ],
    correta: 2,
    explicacao:
      'A verificação deve ser feita através de um canal oficial acessado independentemente.',
  },

  {
    id: 'adaptacao',
    pergunta:
      'O atacante muda logotipos e mensagens constantemente. O que ainda pode relacionar os ataques?',
    alternativas: [
      'Somente as cores',
      'Indicadores técnicos e padrões de comportamento',
      'Somente o remetente',
      'A resolução das imagens',
    ],
    correta: 1,
    explicacao:
      'Mudanças visuais não necessariamente eliminam padrões técnicos e comportamentais.',
  },
]

function embaralhar(lista) {
  const copia = [...lista]

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }

  return copia
}

function danoAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function SpriteSeguro({
  src,
  fallback,
  className = '',
  alt = '',
}) {
  const [atual, setAtual] = useState(src)

  /*
   * IMPORTANTE:
   * quando src muda de costas.png para o sprite do golpe,
   * o componente recebe uma key diferente lá embaixo.
   * Isso força a imagem nova a ser carregada.
   */

  return (
    <img
      src={atual}
      alt={alt}
      draggable="false"
      className={className}
      onError={() => {
        if (fallback && atual !== fallback) {
          setAtual(fallback)
        }
      }}
    />
  )
}

function BarraHP({
  nome,
  hp,
  max,
  boss = false,
}) {
  const porcentagem = Math.max(
    0,
    Math.min(100, (hp / max) * 100)
  )

  const classe =
    porcentagem <= 25
      ? 'critico'
      : porcentagem <= 50
        ? 'alerta'
        : ''

  return (
    <div className={`pkm-hp-card ${boss ? 'boss' : ''}`}>
      <div className="pkm-hp-top">
        <strong>{nome}</strong>
        <span>{boss ? 'Lv.??' : 'Lv.50'}</span>
      </div>

      <div className="pkm-hp-row">
        <b>HP</b>

        <div className="pkm-hp-track">
          <i
            className={classe}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>

      <div className="pkm-hp-value">
        {Math.max(0, hp)}/{max}
      </div>
    </div>
  )
}

export default function BossBattle({
  token,
  categoriaSlug = 'phishing',
  aoPontuar,
  onVitoria,
  onSair,
}) {
  const [bossHP, setBossHP] = useState(CONFIG.bossMax)

  const [muriloHP, setMuriloHP] = useState(CONFIG.muriloMax)
  const [vitorHP, setVitorHP] = useState(CONFIG.vitorMax)

  const [perguntaIndex, setPerguntaIndex] = useState(0)
  const [selecionada, setSelecionada] = useState(null)

  const [etapa, setEtapa] = useState('pergunta')
  const [heroi, setHeroi] = useState(null)

  const [combo, setCombo] = useState(0)

  const [estado, setEstado] = useState('lutando')

  const [mensagem, setMensagem] = useState(
    'O PHISHING MONSTER apareceu!'
  )

  const [animacao, setAnimacao] = useState('')

  /*
   * Guarda qual golpe está sendo mostrado.
   *
   * Exemplo:
   * {
   *   heroi: 'murilo',
   *   id: 'quebra-de-padrao',
   *   sprite: '/.../quebra-de-padrao.png'
   * }
   */
  const [tecnicaAtiva, setTecnicaAtiva] = useState(null)

  const [danoBoss, setDanoBoss] = useState(null)
  const [danoHeroi, setDanoHeroi] = useState(null)

  const pergunta =
    PERGUNTAS[perguntaIndex % PERGUNTAS.length]

  const ordem = useMemo(
    () =>
      embaralhar(
        pergunta.alternativas.map((_, index) => index)
      ),
    [pergunta.id]
  )

  const finisherDisponivel =
    bossHP <= CONFIG.finalHP &&
    bossHP > 0 &&
    muriloHP > 0 &&
    vitorHP > 0

  const spriteMurilo =
    tecnicaAtiva?.heroi === 'murilo'
      ? tecnicaAtiva.sprite
      : ASSETS.murilo.normal

  const spriteVitor =
    tecnicaAtiva?.heroi === 'vitor'
      ? tecnicaAtiva.sprite
      : ASSETS.vitor.normal

  const muriloEspecial =
    tecnicaAtiva?.heroi === 'murilo'

  const vitorEspecial =
    tecnicaAtiva?.heroi === 'vitor'

  async function registrarResposta(acertou) {
    try {
      const data = await enviarResposta(
        token,
        categoriaSlug,
        acertou,
        false
      )

      aoPontuar?.(data)
    } catch (erro) {
      console.error(
        'Erro ao registrar resposta do Boss Battle:',
        erro
      )
    }
  }

  function proximaRodada() {
    setPerguntaIndex((atual) => atual + 1)
    setSelecionada(null)

    setEtapa('pergunta')
    setHeroi(null)

    setTecnicaAtiva(null)
    setAnimacao('')

    setDanoBoss(null)
    setDanoHeroi(null)

    setMensagem('Analise a próxima isca.')
  }

  function ataqueDoBoss() {
    const vivos = []

    if (muriloHP > 0) vivos.push('murilo')
    if (vitorHP > 0) vivos.push('vitor')

    if (!vivos.length) {
      setEstado('derrota')
      return
    }

    const alvo =
      vivos[Math.floor(Math.random() * vivos.length)]

    const dano = danoAleatorio(
      CONFIG.danoInimigoMin,
      CONFIG.danoInimigoMax
    )

    setDanoHeroi({
      alvo,
      dano,
    })

    setAnimacao(`boss-ataca-${alvo}`)

    let novoMurilo = muriloHP
    let novoVitor = vitorHP

    if (alvo === 'murilo') {
      novoMurilo = Math.max(0, muriloHP - dano)
      setMuriloHP(novoMurilo)
    } else {
      novoVitor = Math.max(0, vitorHP - dano)
      setVitorHP(novoVitor)
    }

    setMensagem(
      `PHISHING MONSTER contra-atacou! ${
        alvo === 'murilo' ? 'Murilo' : 'Vitor'
      } recebeu ${dano} de dano.`
    )

    window.setTimeout(() => {
      setAnimacao('')
      setDanoHeroi(null)

      if (novoMurilo <= 0 && novoVitor <= 0) {
        setEstado('derrota')
        return
      }

      proximaRodada()
    }, 1250)
  }

  async function responder(index) {
    if (
      estado !== 'lutando' ||
      etapa !== 'pergunta' ||
      selecionada !== null
    ) {
      return
    }

    const acertou = index === pergunta.correta

    setSelecionada(index)

    await registrarResposta(acertou)

    if (acertou) {
      setCombo((atual) => atual + 1)

      setMensagem(
        `Correto! ${pergunta.explicacao}`
      )

      window.setTimeout(() => {
        setEtapa('personagem')
        setMensagem('Escolha quem vai atacar.')
      }, 550)

      return
    }

    setCombo(0)

    setMensagem(
      `Incorreto. ${pergunta.explicacao}`
    )

    window.setTimeout(() => {
      ataqueDoBoss()
    }, 750)
  }

  function escolherHeroi(id) {
    if (id === 'murilo' && muriloHP <= 0) return
    if (id === 'vitor' && vitorHP <= 0) return

    setHeroi(id)
    setEtapa('tecnica')

    setMensagem(
      `Escolha uma técnica de ${LUTADORES[id].nome}.`
    )
  }

  function usarTecnica(ataque) {
    if (
      estado !== 'lutando' ||
      etapa !== 'tecnica' ||
      !heroi
    ) {
      return
    }

    if (ataque.combo && combo < ataque.combo) {
      setMensagem(
        `${ataque.nome} exige COMBO x${ataque.combo}.`
      )
      return
    }

    /*
     * Aqui está a correção principal.
     *
     * TODA habilidade agora recebe seu sprite.
     */
    setTecnicaAtiva({
      heroi,
      id: ataque.id,
      sprite: ataque.sprite,
    })

    setEtapa('animando')

    setMensagem(
      `${LUTADORES[heroi].nome} usou ${ataque.nome}!`
    )

    /*
     * Cada habilidade também recebe uma classe própria.
     *
     * Exemplos:
     * habilidade-murilo-quebra-de-padrao
     * habilidade-vitor-controle-de-urgencia
     */
    setAnimacao(
      `habilidade-${heroi}-${ataque.id}`
    )

    const bonus = combo >= 3 ? 8 : 0

    const dano = ataque.dano + bonus

    const novoBossHP = Math.max(
      0,
      bossHP - dano
    )

    /*
     * Primeiro mostramos o sprite.
     * Depois o impacto acontece.
     */
    window.setTimeout(() => {
      setDanoBoss(dano)
      setBossHP(novoBossHP)
    }, 700)

    /*
     * Mantemos a arte por tempo suficiente
     * para o jogador realmente vê-la.
     */
    window.setTimeout(() => {
      setDanoBoss(null)
      setAnimacao('')
      setTecnicaAtiva(null)

      if (novoBossHP <= 0) {
        setEstado('vitoria')
        setEtapa('resultado')
        return
      }

      if (
        novoBossHP <= CONFIG.finalHP &&
        muriloHP > 0 &&
        vitorHP > 0
      ) {
        setEtapa('final')

        setMensagem(
          'PADRÃO IDENTIFICADO! Técnica conjunta disponível.'
        )

        return
      }

      /*
       * Após nosso ataque o boss responde.
       */
      setEtapa('inimigo')

      window.setTimeout(() => {
        ataqueDoBoss()
      }, 300)
    }, 1900)
  }

  function ataqueFinal() {
    if (!finisherDisponivel) return

    setEtapa('animando')

    /*
     * No especial usamos a arte especial do Murilo.
     * Depois podemos criar uma CG exclusiva com os dois.
     */
    setTecnicaAtiva({
      heroi: 'murilo',
      id: 'especial',
      sprite: ASSETS.murilo.especial,
    })

    setAnimacao('ataque-conjunto')

    setMensagem(
      'MURILO + VITOR — CORRELAÇÃO × LEITURA DE PRETEXTO!'
    )

    window.setTimeout(() => {
      setDanoBoss(bossHP)
      setBossHP(0)
    }, 850)

    window.setTimeout(() => {
      setTecnicaAtiva(null)
      setDanoBoss(null)
      setAnimacao('')

      setEstado('vitoria')
      setEtapa('resultado')
    }, 2200)
  }

  function reiniciar() {
    setBossHP(CONFIG.bossMax)

    setMuriloHP(CONFIG.muriloMax)
    setVitorHP(CONFIG.vitorMax)

    setPerguntaIndex(0)
    setSelecionada(null)

    setEtapa('pergunta')
    setHeroi(null)

    setCombo(0)

    setEstado('lutando')

    setMensagem(
      'O PHISHING MONSTER apareceu!'
    )

    setAnimacao('')
    setTecnicaAtiva(null)

    setDanoBoss(null)
    setDanoHeroi(null)
  }

  return createPortal(
    <div
      className={`
        pkm-battle
        ${animacao}
        ${tecnicaAtiva ? 'tem-tecnica-ativa' : ''}
      `}
    >
      <img
        src={ASSETS.fundo}
        className="pkm-background"
        alt=""
        draggable="false"
      />

      <div className="pkm-vignette" />

      <button
        type="button"
        className="pkm-exit"
        onClick={onSair}
      >
        ← SAIR
      </button>

      <div className="pkm-combo">
        <span>COMBO</span>
        <strong>x{combo}</strong>
      </div>

      {/* HUD DO BOSS */}

      <div className="pkm-boss-hud">
        <BarraHP
          nome="PHISHING MONSTER"
          hp={bossHP}
          max={CONFIG.bossMax}
          boss
        />
      </div>

      {/* BOSS */}

      <div className="pkm-boss-stage">
        <SpriteSeguro
          key={ASSETS.boss}
          src={ASSETS.boss}
          fallback="/historia/fase1/phishing-monster-final.png"
          alt="Phishing Monster"
          className="pkm-boss-sprite"
        />

        {danoBoss !== null && (
          <strong className="pkm-damage pkm-damage-boss">
            -{danoBoss}
          </strong>
        )}
      </div>

      {/* MURILO E VITOR */}

      <div className="pkm-party-stage">
        <div
          className={`
            pkm-fighter
            pkm-fighter-murilo
            ${heroi === 'murilo' ? 'selecionado' : ''}
            ${muriloEspecial ? 'usando-sprite-tecnica' : ''}
          `}
        >
          <SpriteSeguro
            /*
             * A KEY é fundamental.
             * Sem ela o componente antigo pode manter o
             * fallback anterior em vez de carregar o golpe.
             */
            key={spriteMurilo}
            src={spriteMurilo}
            fallback={ASSETS.murilo.normal}
            alt="Murilo"
            className={`
              pkm-fighter-sprite
              ${muriloEspecial ? 'pkm-technique-sprite' : ''}
            `}
          />

          {danoHeroi?.alvo === 'murilo' && (
            <strong className="pkm-damage pkm-damage-player">
              -{danoHeroi.dano}
            </strong>
          )}
        </div>

        <div
          className={`
            pkm-fighter
            pkm-fighter-vitor
            ${heroi === 'vitor' ? 'selecionado' : ''}
            ${vitorEspecial ? 'usando-sprite-tecnica' : ''}
          `}
        >
          <SpriteSeguro
            key={spriteVitor}
            src={spriteVitor}
            fallback={ASSETS.vitor.normal}
            alt="Vitor"
            className={`
              pkm-fighter-sprite
              ${vitorEspecial ? 'pkm-technique-sprite' : ''}
            `}
          />

          {danoHeroi?.alvo === 'vitor' && (
            <strong className="pkm-damage pkm-damage-player">
              -{danoHeroi.dano}
            </strong>
          )}
        </div>
      </div>

      {/* HP DA DUPLA */}

      <div className="pkm-party-hud">
        <BarraHP
          nome="MURILO"
          hp={muriloHP}
          max={CONFIG.muriloMax}
        />

        <BarraHP
          nome="VITOR"
          hp={vitorHP}
          max={CONFIG.vitorMax}
        />
      </div>

      {/* MENU INFERIOR */}

      {estado === 'lutando' && (
        <div className="pkm-command-panel">
          <section className="pkm-dialogue-box">
            <span className="pkm-label">
              CYBERSHIELD // BATTLE
            </span>

            <h2>{mensagem}</h2>

            {etapa === 'pergunta' && (
              <p>{pergunta.pergunta}</p>
            )}

            <span className="pkm-dialogue-arrow">
              ▶
            </span>
          </section>

          {/* PERGUNTA */}

          {etapa === 'pergunta' && (
            <section className="pkm-options">
              {ordem.map((index) => {
                let classe = ''

                if (selecionada !== null) {
                  if (index === pergunta.correta) {
                    classe = 'correta'
                  } else if (index === selecionada) {
                    classe = 'errada'
                  } else {
                    classe = 'neutra'
                  }
                }

                return (
                  <button
                    type="button"
                    key={index}
                    className={classe}
                    disabled={selecionada !== null}
                    onClick={() => responder(index)}
                  >
                    <span className="pkm-option-arrow">
                      ▶
                    </span>

                    <span>
                      {pergunta.alternativas[index]}
                    </span>
                  </button>
                )
              })}
            </section>
          )}

          {/* ESCOLHER PERSONAGEM */}

          {etapa === 'personagem' && (
            <section className="pkm-options pkm-character-options">
              <button
                type="button"
                disabled={muriloHP <= 0}
                onClick={() => escolherHeroi('murilo')}
              >
                <span className="pkm-option-arrow">▶</span>

                <strong>MURILO</strong>

                <small>THREAT INTEL</small>
              </button>

              <button
                type="button"
                disabled={vitorHP <= 0}
                onClick={() => escolherHeroi('vitor')}
              >
                <span className="pkm-option-arrow">▶</span>

                <strong>VITOR</strong>

                <small>SOCIAL ENGINEERING</small>
              </button>

              {finisherDisponivel && (
                <button
                  type="button"
                  className="pkm-finisher-button"
                  onClick={ataqueFinal}
                >
                  <span className="pkm-option-arrow">▶</span>

                  <strong>ATAQUE CONJUNTO</strong>

                  <small>CORRELAÇÃO × PRETEXTO</small>
                </button>
              )}
            </section>
          )}

          {/* TÉCNICAS */}

          {etapa === 'tecnica' && heroi && (
            <section className="pkm-options pkm-techniques">
              {LUTADORES[heroi].ataques.map((ataque) => {
                const bloqueado =
                  ataque.combo &&
                  combo < ataque.combo

                return (
                  <button
                    type="button"
                    key={ataque.id}
                    disabled={bloqueado}
                    onClick={() => usarTecnica(ataque)}
                  >
                    <span className="pkm-option-arrow">
                      ▶
                    </span>

                    <span className="pkm-tech-text">
                      <strong>{ataque.nome}</strong>
                      <small>{ataque.descricao}</small>
                    </span>

                    <b className="pkm-tech-damage">
                      {bloqueado
                        ? `COMBO x${ataque.combo}`
                        : `${ataque.dano} DMG`}
                    </b>
                  </button>
                )
              })}

              <button
                type="button"
                className="pkm-back-option"
                onClick={() => {
                  setHeroi(null)
                  setEtapa('personagem')
                  setMensagem('Escolha quem vai atacar.')
                }}
              >
                ← VOLTAR
              </button>
            </section>
          )}

          {/* DURANTE ANIMAÇÃO */}

          {(etapa === 'animando' ||
            etapa === 'inimigo') && (
            <section className="pkm-options pkm-wait-panel">
              <strong>
                {etapa === 'animando'
                  ? 'EXECUTANDO TÉCNICA...'
                  : 'TURNO DO INIMIGO...'}
              </strong>
            </section>
          )}

          {/* FINAL */}

          {etapa === 'final' && (
            <section className="pkm-options pkm-final-panel">
              <button
                type="button"
                className="pkm-finisher-button"
                onClick={ataqueFinal}
              >
                <span className="pkm-option-arrow">▶</span>

                <strong>
                  CORRELAÇÃO × LEITURA DE PRETEXTO
                </strong>

                <small>
                  EXECUTAR TÉCNICA CONJUNTA
                </small>
              </button>
            </section>
          )}
        </div>
      )}

      {/* VITÓRIA */}

      {estado === 'vitoria' && (
        <div className="pkm-result-overlay">
          <div className="pkm-result-card">
            <span>AMEAÇA NEUTRALIZADA</span>

            <h1>PHISHING MONSTER</h1>

            <h2>DERROTADO</h2>

            <p>
              Murilo e Vitor quebraram a campanha de phishing.
            </p>

            <button
              type="button"
              onClick={onVitoria}
            >
              CONTINUAR HISTÓRIA
            </button>
          </div>
        </div>
      )}

      {/* DERROTA */}

      {estado === 'derrota' && (
        <div className="pkm-result-overlay">
          <div className="pkm-result-card derrota">
            <span>EQUIPE DERRUBADA</span>

            <h1>PHISHING MONSTER</h1>

            <h2>DOMINOU A BATALHA</h2>

            <button
              type="button"
              onClick={reiniciar}
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        </div>
      )}
    </div>,

    document.body
  )
}