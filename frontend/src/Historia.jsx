import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { createPortal } from 'react-dom'

import { enviarResposta } from './auth.js'

import {
  FASES,
  PERSONAGENS,
} from './historia.js'

import BossBattle from './BossBattle.jsx'

import './historia.css'


// ================================================================
// UTILITÁRIOS
// ================================================================

function embaralhar(lista) {
  const copia = [...lista]

  for (
    let i = copia.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      )

    ;[
      copia[i],
      copia[j],
    ] = [
      copia[j],
      copia[i],
    ]
  }

  return copia
}


function preloadImagem(src) {
  if (!src) {
    return
  }

  const imagem =
    new Image()

  imagem.src =
    src
}


function preloadFase(fase) {
  if (!fase?.cenas) {
    return
  }

  const imagens =
    new Set()

  fase.cenas.forEach(
    (cena) => {
      if (cena.fundo) {
        imagens.add(
          cena.fundo
        )
      }

      cena.elenco?.forEach(
        (personagem) => {
          imagens.add(
            `/historia/personagens/${personagem.id}/neutro.png`
          )

          imagens.add(
            `/historia/personagens/${personagem.id}/fala.png`
          )

          imagens.add(
            `/historia/personagens/${personagem.id}/pergunta.png`
          )
        }
      )
    }
  )

  // Como o elenco da sala é dinâmico,
  // garantimos o preload dos quatro.
  ;[
    'murilo',
    'vitor',
    'cleiton',
    'fabio',
  ].forEach(
    (id) => {
      imagens.add(
        `/historia/personagens/${id}/neutro.png`
      )

      imagens.add(
        `/historia/personagens/${id}/fala.png`
      )

      imagens.add(
        `/historia/personagens/${id}/pergunta.png`
      )
    }
  )

  imagens.forEach(
    preloadImagem
  )
}


function useDigitando(
  texto,
  velocidade = 16
) {
  const [
    n,
    setN,
  ] = useState(0)


  useEffect(() => {
    setN(0)

    if (!texto) {
      return undefined
    }


    const reduzirMovimento =
      window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches


    if (reduzirMovimento) {
      setN(
        texto.length
      )

      return undefined
    }


    const timer =
      window.setInterval(
        () => {
          setN(
            (atual) => {
              if (
                atual >=
                texto.length
              ) {
                window.clearInterval(
                  timer
                )

                return atual
              }

              return (
                atual + 1
              )
            }
          )
        },

        velocidade
      )


    return () =>
      window.clearInterval(
        timer
      )

  }, [
    texto,
    velocidade,
  ])


  return {
    visivel:
      texto
        ? texto.slice(
            0,
            n
          )
        : '',

    completo:
      !texto ||
      n >= texto.length,

    pular: () =>
      setN(
        texto
          ? texto.length
          : 0
      ),
  }
}


// ================================================================
// SPRITE
// ================================================================

function caminhoSprite(
  id,
  pose
) {
  return (
    `/historia/personagens/${id}/${pose}.png`
  )
}


function Sprite({
  id,
  lado,
  pose,
  ativo,
  falando,
}) {
  const personagem =
    PERSONAGENS[id]


  const [
    falhas,
    setFalhas,
  ] = useState({})


  if (!personagem) {
    return null
  }


  const poseUsada =
    falhas[pose]
      ? 'neutro'
      : pose


  const semArte =
    Boolean(
      falhas[poseUsada]
    )


  const espelho =
    lado === 'dir' &&
    personagem.espelhar !==
      false
      ? -1
      : 1


  return (
    <div
      className={`
        hist-sprite
        hist-sprite-${lado}
        ${
          ativo
            ? 'ativo'
            : ''
        }
        ${
          falando
            ? 'falando'
            : ''
        }
      `}

      style={{
        '--espelho':
          espelho,

        '--cor-personagem':
          personagem.cor,
      }}
    >

      {semArte ? (

        <div
          className="
            hist-sprite-vazio
          "
        >
          <strong>
            {
              personagem.nome
            }
          </strong>

          <small>
            {pose}
          </small>
        </div>

      ) : (

        <img
          key={
            `${id}-${poseUsada}`
          }

          className="
            hist-sprite-img
          "

          src={
            caminhoSprite(
              id,
              poseUsada
            )
          }

          alt={
            personagem.nome
          }

          draggable="false"

          onError={() => {
            setFalhas(
              (atual) => ({
                ...atual,

                [poseUsada]:
                  true,
              })
            )
          }}
        />

      )}

    </div>
  )
}


// ================================================================
// FUNDO
// ================================================================

function Fundo({
  src,
}) {
  const [
    carregado,
    setCarregado,
  ] = useState(false)


  const [
    erro,
    setErro,
  ] = useState(false)


  useEffect(() => {
    setCarregado(false)
    setErro(false)

    if (!src) {
      return
    }

    // Faz o navegador começar
    // a carregar antes da renderização.
    preloadImagem(src)
  }, [src])


  return (
    <div
      className={`
        hist-fundo-wrapper
        ${
          carregado
            ? 'carregado'
            : ''
        }
      `}
    >

      {!carregado && (
        <div
          className="
            hist-fundo-espera
          "
        />
      )}


      {!erro && src && (
        <img
          key={src}

          className="
            hist-fundo
          "

          src={src}

          alt=""

          draggable="false"

          onLoad={() =>
            setCarregado(
              true
            )
          }

          onError={() => {
            setErro(true)
            setCarregado(true)
          }}
        />
      )}


      {erro && (
        <div
          className="
            hist-fundo
            hist-fundo-vazio
          "
        >
          <span>
            Fundo não encontrado
          </span>

          <small>
            {src}
          </small>
        </div>
      )}

    </div>
  )
}


// ================================================================
// INTRO
// ================================================================

function IntroVideo({
  src,
  onFim,
}) {
  const [
    saindo,
    setSaindo,
  ] = useState(false)


  function finalizar() {
    if (saindo) {
      return
    }

    setSaindo(true)

    window.setTimeout(
      onFim,
      300
    )
  }


  return (
    <div
      className={`
        hist-intro
        ${
          saindo
            ? 'saindo'
            : ''
        }
      `}
    >

      <video
        className="
          hist-intro-video
        "

        src={src}

        autoPlay

        muted

        playsInline

        preload="auto"

        onEnded={
          finalizar
        }

        onError={
          finalizar
        }
      />


      <div
        className="
          hist-intro-vinheta
        "
      />


      <button
        type="button"

        className="
          hist-intro-pular
        "

        onClick={
          finalizar
        }
      >
        Pular
      </button>

    </div>
  )
}


// ================================================================
// BALÃO
// ================================================================

function Balao({
  quem,
  lado = 'esq',
  texto,
  onClick,
  children,
}) {
  const personagem =
    PERSONAGENS[quem] ||
    PERSONAGENS.narrador


  return (
    <div
      className={`
        hist-balao
        hist-balao-${
          quem ===
          'narrador'
            ? 'narrador'
            : lado
        }
      `}

      style={{
        '--cor-personagem':
          personagem.cor,
      }}

      onClick={
        onClick
      }
    >

      {personagem.nome && (
        <span
          className="
            hist-balao-nome
          "
        >
          {
            personagem.nome
          }
        </span>
      )}


      {texto && (
        <p
          className="
            hist-balao-texto
          "
        >
          {texto}
        </p>
      )}


      {children}

    </div>
  )
}


// ================================================================
// CELULAR
// ================================================================

function Celular({
  de,
  texto,
}) {
  return (
    <div
      className="
        hist-celular
      "
    >

      <div
        className="
          hist-celular-tela
        "
      >

        <div
          className="
            hist-celular-topo
          "
        >
          <span>
            20:47
          </span>

          <span>
            ● ● ●
          </span>
        </div>


        <span
          className="
            hist-celular-de
          "
        >
          {de}
        </span>


        <p
          className="
            hist-celular-msg
          "
        >
          {texto}
        </p>

      </div>

    </div>
  )
}


// ================================================================
// TELA FINAL
// ================================================================

function TelaFinal({
  final,
  onContinuar,
}) {
  return (
    <div
      className="
        hist-final
      "
    >

      <div
        className="
          hist-final-grid
        "
      />


      <div
        className="
          hist-final-brilho
        "
      />


      <div
        className="
          hist-final-scan
        "
      />


      <div
        className="
          hist-final-conteudo
        "
      >

        <span
          className="
            hist-final-status
          "
        >
          INCIDENTE CONTIDO
        </span>


        <span
          className="
            hist-final-kicker
          "
        >
          {final?.kicker}
        </span>


        <h1>
          {final?.titulo}
        </h1>


        <div
          className="
            hist-final-linha
          "
        />


        <p>
          {final?.subtitulo}
        </p>


        <div
          className="
            hist-final-meta
          "
        >
          <span>
            INVESTIGAÇÃO 01
          </span>

          <i />

          <span>
            PARAÍSO
          </span>

          <i />

          <span>
            ZERO TRUST
          </span>
        </div>


        <button
          type="button"

          className="
            hist-final-botao
          "

          onClick={
            onContinuar
          }
        >
          CONCLUIR FASE
        </button>

      </div>

    </div>
  )
}


// ================================================================
// DUPLAS DINÂMICAS
// ================================================================

const DUPLA_ALUNOS = [
  {
    id: 'murilo',
    lado: 'esq',
  },

  {
    id: 'vitor',
    lado: 'dir',
  },
]


const DUPLA_PROFESSORES = [
  {
    id: 'cleiton',
    lado: 'esq',
  },

  {
    id: 'fabio',
    lado: 'dir',
  },
]


function obterElencoVisivel(
  cena,
  fala,
  emFalas
) {
  if (
    !cena.elencoDinamico
  ) {
    return (
      cena.elenco ||
      []
    )
  }


  if (
    emFalas &&
    fala
  ) {
    if (
      fala.quem ===
        'murilo' ||
      fala.quem ===
        'vitor'
    ) {
      return DUPLA_ALUNOS
    }


    if (
      fala.quem ===
        'cleiton' ||
      fala.quem ===
        'fabio'
    ) {
      return DUPLA_PROFESSORES
    }
  }


  return (
    cena.elenco ||
    DUPLA_PROFESSORES
  )
}


// ================================================================
// CENA
// ================================================================

function Cena({
  fase,
  cena,
  indice,
  total,
  token,
  aoPontuar,
  onFimCena,
  onSair,
}) {
  const [
    falaIdx,
    setFalaIdx,
  ] = useState(0)


  const [
    selecionada,
    setSelecionada,
  ] = useState(null)


  const [
    resultado,
    setResultado,
  ] = useState(null)


  const [
    mostrarFinal,
    setMostrarFinal,
  ] = useState(false)


  const falas =
    cena.falas || []


  const escolha =
    cena.escolha


  const emFalas =
    falaIdx <
    falas.length


  const fala =
    emFalas
      ? falas[falaIdx]
      : null


  const efeito =
    useDigitando(
      fala?.texto ||
      ''
    )


  const ordem =
    useMemo(
      () => {
        if (!escolha) {
          return []
        }


        return embaralhar(
          escolha
            .alternativas
            .map(
              (_, i) =>
                i
            )
        )
      },

      [
        cena.id,
        escolha,
      ]
    )


  const elencoVisivel =
    obterElencoVisivel(
      cena,
      fala,
      emFalas
    )


  function ladoDe(id) {
    const atual =
      elencoVisivel.find(
        (personagem) =>
          personagem.id ===
          id
      )


    if (atual) {
      return atual.lado
    }


    if (
      id === 'vitor' ||
      id === 'fabio'
    ) {
      return 'dir'
    }


    return 'esq'
  }


  function terminarCena() {
    if (cena.final) {
      setMostrarFinal(
        true
      )

      return
    }


    onFimCena()
  }


  function proximaFala() {
    if (
      falaIdx + 1 <
      falas.length
    ) {
      setFalaIdx(
        (atual) =>
          atual + 1
      )

      return
    }


    if (escolha) {
      setFalaIdx(
        falas.length
      )

      return
    }


    terminarCena()
  }


  function avancar() {
    if (
      !efeito.completo
    ) {
      efeito.pular()

      return
    }


    proximaFala()
  }


  async function escolher(
    indiceOriginal
  ) {
    if (
      selecionada !==
      null
    ) {
      return
    }


    const acertou =
      indiceOriginal ===
      escolha.correta


    setSelecionada(
      indiceOriginal
    )


    setResultado({
      acertou,
      extra: null,
    })


    try {
      const data =
        await enviarResposta(
          token,
          fase.categoria_slug,
          acertou,
          false
        )


      setResultado({
        acertou,

        extra:
          data?.mensagem_combo ||
          (
            acertou
              ? 'Resposta registrada.'
              : null
          ),
      })


      aoPontuar?.(
        data
      )

    } catch (erro) {
      console.error(
        'Erro ao registrar resposta da história:',
        erro
      )


      setResultado({
        acertou,
        extra: null,
      })
    }
  }


  function poseDe(id) {
    if (
      resultado &&
      escolha
    ) {
      if (
        id ===
        escolha.resposta_quem
      ) {
        return (
          resultado.acertou
            ? 'acerto'
            : 'erro'
        )
      }

      return 'neutro'
    }


    if (
      !emFalas &&
      escolha
    ) {
      if (
        id ===
        escolha.resposta_quem
      ) {
        return 'resposta'
      }


      if (
        id ===
        escolha.quem
      ) {
        return 'pergunta'
      }


      return 'neutro'
    }


    if (
      fala &&
      fala.quem === id
    ) {
      if (fala.pose) {
        return fala.pose
      }


      return (
        efeito.completo
          ? 'neutro'
          : 'fala'
      )
    }


    return 'neutro'
  }


  const destaque =
    emFalas &&
    fala &&
    fala.quem !==
      'narrador'
      ? fala.quem
      : null


  const falandoId =
    emFalas &&
    fala &&
    fala.quem !==
      'narrador' &&
    !efeito.completo
      ? fala.quem
      : null


  // ==============================================================
  // BOSS
  // ==============================================================

  if (
    cena.tipo ===
    'boss'
  ) {
    return (
      <BossBattle
        token={
          token
        }

        categoriaSlug={
          fase.categoria_slug
        }

        aoPontuar={
          aoPontuar
        }

        onSair={
          onSair
        }

        onVitoria={
          onFimCena
        }
      />
    )
  }


  // ==============================================================
  // FINAL
  // ==============================================================

  if (mostrarFinal) {
    return createPortal(
      <div
        className="
          hist-cena
          hist-cena-final
        "
      >

        <TelaFinal
          final={
            cena.final
          }

          onContinuar={
            onFimCena
          }
        />

      </div>,

      document.body
    )
  }


  const local =
    (
      cena.id ===
        'manha-seguinte' ||
      cena.id ===
        'cleiton-ja-sabia' ||
      cena.id ===
        'zero-trust'
    )
      ? 'FACULDADE'
      : 'PARAÍSO'


  // ==============================================================
  // CENA NORMAL
  // ==============================================================

  return createPortal(
    <div
      className="
        hist-cena
      "

      role="region"

      aria-label={
        `${fase.titulo}, cena ${indice + 1} de ${total}`
      }
    >

      <Fundo
        src={
          cena.fundo
        }
      />


      <div
        className="
          hist-vinheta
        "
      />


      <div
        className="
          hist-hud
        "
      >

        <button
          type="button"

          className="
            hist-voltar
          "

          onClick={
            onSair
          }
        >
          Sair da fase
        </button>


        <div
          className="
            hist-hud-centro
          "
        >

          <span
            className="
              hist-hud-label
            "
          >
            INVESTIGAÇÃO 01
          </span>


          <span
            className="
              hist-hud-local
            "
          >
            {local}
          </span>

        </div>


        <span
          className="
            hist-progresso
          "
        >

          {Array.from(
            {
              length:
                total,
            },

            (_, i) => (
              <span
                key={i}

                className={`
                  hist-ponto
                  ${
                    i < indice
                      ? 'feito'
                      : i === indice
                        ? 'atual'
                        : ''
                  }
                `}
              />
            )
          )}

        </span>

      </div>


      {elencoVisivel.map(
        (personagem) => (
          <Sprite
            key={
              `${cena.id}-${personagem.id}`
            }

            id={
              personagem.id
            }

            lado={
              personagem.lado
            }

            pose={
              poseDe(
                personagem.id
              )
            }

            ativo={
              destaque ===
                null ||
              destaque ===
                personagem.id
            }

            falando={
              falandoId ===
              personagem.id
            }
          />
        )
      )}


      {cena.celular && (
        <Celular
          de={
            cena.celular.de
          }

          texto={
            cena.celular.texto
          }
        />
      )}


      <div
        className="
          hist-interface
        "

        aria-live="polite"
      >

        {emFalas && (
          <Balao
            key={
              `${cena.id}-${falaIdx}`
            }

            quem={
              fala.quem
            }

            lado={
              ladoDe(
                fala.quem
              )
            }

            texto={
              efeito.visivel
            }

            onClick={
              avancar
            }
          >

            {efeito.completo && (
              <button
                type="button"

                className="
                  hist-continuar
                "

                onClick={
                  (evento) => {
                    evento
                      .stopPropagation()

                    proximaFala()
                  }
                }
              >
                Continuar
              </button>
            )}

          </Balao>
        )}


        {!emFalas &&
          escolha && (
            <>

              <Balao
                quem={
                  escolha.quem
                }

                lado={
                  ladoDe(
                    escolha.quem
                  )
                }

                texto={
                  escolha.pergunta
                }
              />


              <Balao
                quem={
                  escolha
                    .resposta_quem
                }

                lado={
                  ladoDe(
                    escolha
                      .resposta_quem
                  )
                }

                texto={
                  resultado
                    ? ''
                    : 'Eu diria que é...'
                }
              >

                <div
                  className="
                    hist-alternativas
                  "
                >

                  {ordem.map(
                    (i) => {
                      const estado =
                        selecionada ===
                        null
                          ? ''
                          : i ===
                              escolha
                                .correta
                            ? 'correta'
                            : i ===
                                selecionada
                              ? 'incorreta'
                              : 'neutra'


                      return (
                        <button
                          key={i}

                          type="button"

                          className={`
                            hist-alternativa
                            ${estado}
                          `}

                          disabled={
                            selecionada !==
                            null
                          }

                          onClick={() =>
                            escolher(
                              i
                            )
                          }
                        >
                          {
                            escolha
                              .alternativas[i]
                          }
                        </button>
                      )
                    }
                  )}

                </div>


                {resultado && (
                  <div
                    className={`
                      hist-feedback
                      ${
                        resultado
                          .acertou
                          ? 'certo'
                          : 'errado'
                      }
                    `}
                  >

                    <strong>
                      {
                        resultado
                          .acertou
                          ? 'Acertou!'
                          : 'Resposta incorreta.'
                      }
                    </strong>


                    <p>
                      {
                        escolha
                          .explicacao
                      }
                    </p>


                    {resultado.extra && (
                      <small>
                        {
                          resultado
                            .extra
                        }
                      </small>
                    )}


                    <button
                      type="button"

                      className="
                        hist-continuar
                      "

                      onClick={
                        terminarCena
                      }
                    >
                      Continuar a história
                    </button>

                  </div>
                )}

              </Balao>

            </>
          )}

      </div>

    </div>,

    document.body
  )
}


// ================================================================
// PRINCIPAL
// ================================================================

export default function Historia({
  token,
  onSair,
  onPontos,
}) {
  const [
    faseAtual,
    setFaseAtual,
  ] = useState(null)


  const [
    cenaIdx,
    setCenaIdx,
  ] = useState(0)


  const [
    introPendente,
    setIntroPendente,
  ] = useState(false)


  const jogando =
    Boolean(
      faseAtual
    )


  useEffect(() => {
    if (!jogando) {
      return undefined
    }


    const anterior =
      document.body
        .style
        .overflow


    document.body
      .style
      .overflow =
        'hidden'


    return () => {
      document.body
        .style
        .overflow =
          anterior
    }

  }, [jogando])


  function iniciar(
    fase
  ) {
    // Carrega fundo-sala e demais
    // imagens antes de chegar nelas.
    preloadFase(
      fase
    )


    setFaseAtual(
      fase
    )


    setCenaIdx(
      0
    )


    setIntroPendente(
      Boolean(
        fase.intro
      )
    )
  }


  function voltarParaFases() {
    setFaseAtual(
      null
    )

    setCenaIdx(
      0
    )

    setIntroPendente(
      false
    )
  }


  if (!faseAtual) {
    return (
      <section
        className="
          historia
        "
      >

        <div
          className="
            hist-topo
          "
        >

          <span
            className="
              hist-topo-kicker
            "
          >
            CYBERSHIELD
          </span>


          <h2>
            Modo História
          </h2>


          <p>
            Investigue incidentes,
            encontre pistas e enfrente
            ameaças inspiradas em
            ataques de cibersegurança.
          </p>

        </div>


        <div
          className="
            hist-fases
          "
        >

          {FASES.map(
            (
              fase,
              indice
            ) => (

              <button
                key={
                  fase.id
                }

                type="button"

                className="
                  hist-fase-card
                "

                disabled={
                  !fase.disponivel
                }

                onClick={() =>
                  iniciar(
                    fase
                  )
                }
              >

                <span
                  className="
                    hist-fase-icone
                  "
                >
                  {
                    fase.icone
                  }
                </span>


                <span
                  className="
                    hist-fase-info
                  "
                >

                  <strong>
                    Fase {
                      indice + 1
                    }:{' '}
                    {
                      fase.titulo
                    }
                  </strong>


                  <small>
                    {
                      fase.modulo
                    }
                  </small>


                  <em>
                    {
                      fase.disponivel
                        ? fase.resumo
                        : 'Em breve'
                    }
                  </em>

                </span>

              </button>

            )
          )}

        </div>


        <button
          type="button"

          className="
            hist-voltar
          "

          onClick={
            onSair
          }
        >
          Voltar para as áreas
        </button>

      </section>
    )
  }


  if (
    introPendente &&
    faseAtual.intro
  ) {
    return createPortal(
      <div
        className="
          hist-cena
        "
      >

        <IntroVideo
          src={
            faseAtual.intro
          }

          onFim={() =>
            setIntroPendente(
              false
            )
          }
        />

      </div>,

      document.body
    )
  }


  const cenas =
    faseAtual.cenas


  const cenaAtual =
    cenas[cenaIdx]


  if (!cenaAtual) {
    return null
  }


  return (
    <Cena
      key={
        cenaAtual.id
      }

      fase={
        faseAtual
      }

      cena={
        cenaAtual
      }

      indice={
        cenaIdx
      }

      total={
        cenas.length
      }

      token={
        token
      }

      aoPontuar={
        onPontos
      }

      onSair={
        voltarParaFases
      }

      onFimCena={() => {
        if (
          cenaIdx + 1 <
          cenas.length
        ) {
          // Pré-carrega explicitamente
          // o fundo da próxima cena.
          preloadImagem(
            cenas[
              cenaIdx + 1
            ]?.fundo
          )


          setCenaIdx(
            (atual) =>
              atual + 1
          )

          return
        }


        voltarParaFases()
      }}
    />
  )
}