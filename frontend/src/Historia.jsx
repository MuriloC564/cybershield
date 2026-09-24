import {
  useCallback,
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
        Math.random() * (i + 1)
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


function useDigitando(
  texto,
  velocidade = 16
) {
  const [n, setN] =
    useState(0)

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
      setN(texto.length)
      return undefined
    }

    const id =
      window.setInterval(() => {
        setN((valor) => {
          if (
            valor >= texto.length
          ) {
            window.clearInterval(id)
            return valor
          }

          return valor + 1
        })
      }, velocidade)

    return () =>
      window.clearInterval(id)

  }, [texto, velocidade])


  return {
    visivel:
      texto
        ? texto.slice(0, n)
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
// CAMINHO DOS PERSONAGENS
//
// SUA ESTRUTURA:
// public/historia/personagens/murilo/
// public/historia/personagens/vitor/
// ================================================================

const caminhoSprite = (
  id,
  pose
) =>
  `/historia/personagens/${id}/${pose}.png`


// ================================================================
// SPRITE
// ================================================================

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
    personagem.espelhar !== false
      ? -1
      : 1


  return (
    <div
      className={`
        hist-sprite
        hist-sprite-${lado}
        ${ativo ? 'ativo' : ''}
        ${falando ? 'falando' : ''}
      `}
      style={{
        '--espelho':
          espelho,

        '--cor-personagem':
          personagem.cor,
      }}
    >

      {semArte ? (

        <div className="hist-sprite-vazio">

          <strong>
            {personagem.nome}
          </strong>

          <small>
            {pose}
          </small>

        </div>

      ) : (

        <img
          key={poseUsada}

          className="hist-sprite-img"

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

function Fundo({ src }) {
  const [ok, setOk] =
    useState(true)

  useEffect(() => {
    setOk(true)
  }, [src])


  if (!ok) {
    return (
      <div className="hist-fundo hist-fundo-vazio">

        <span>
          Fundo não encontrado
        </span>

        <small>
          {src}
        </small>

      </div>
    )
  }


  return (
    <img
      key={src}

      className="hist-fundo"

      src={src}

      alt=""

      draggable="false"

      onError={() =>
        setOk(false)
      }
    />
  )
}


// ================================================================
// INTRO EM VÍDEO
// ================================================================

function IntroVideo({
  src,
  onFim,
}) {
  const [saindo, setSaindo] =
    useState(false)


  const finalizar =
    useCallback(() => {
      if (saindo) {
        return
      }

      setSaindo(true)

      window.setTimeout(
        onFim,
        300
      )
    }, [onFim, saindo])


  return (
    <div
      className={`
        hist-intro
        ${saindo ? 'saindo' : ''}
      `}
    >

      <video
        className="hist-intro-video"

        src={src}

        autoPlay

        muted

        playsInline

        preload="auto"

        onEnded={finalizar}

        onError={finalizar}
      />


      <div className="hist-intro-vinheta" />


      <button
        type="button"

        className="hist-intro-pular"

        onClick={finalizar}
      >
        Pular
      </button>

    </div>
  )
}


// ================================================================
// CINEMÁTICA COM IMAGEM
// ================================================================

function CinematicaImagem({
  config,
  onFim,
}) {
  const [
    saindo,
    setSaindo,
  ] = useState(false)


  const duracao =
    config.duracao ||
    6000


  const finalizar =
    useCallback(() => {
      setSaindo(true)

      window.setTimeout(
        onFim,
        350
      )
    }, [onFim])


  useEffect(() => {
    const reduzirMovimento =
      window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches


    if (reduzirMovimento) {
      const timer =
        window.setTimeout(
          finalizar,
          1500
        )

      return () =>
        window.clearTimeout(
          timer
        )
    }


    const timer =
      window.setTimeout(
        finalizar,
        duracao
      )


    return () =>
      window.clearTimeout(
        timer
      )

  }, [
    duracao,
    finalizar,
  ])


  return (
    <div
      className={`
        hist-cinematica
        hist-cinematica-${
          config.efeito ||
          'normal'
        }
        ${
          saindo
            ? 'saindo'
            : ''
        }
      `}

      style={{
        '--duracao-cinematica':
          `${duracao}ms`,
      }}
    >

     <div className="hist-cinematica-camera">

  {config.video ? (

    <video
      className="
        hist-cinematica-img
        hist-cinematica-video
      "

      src={config.video}

      poster={
        config.imagemFallback
      }

      autoPlay
      muted
      playsInline
      loop
      preload="auto"
    />

  ) : (

    <img
      className="hist-cinematica-img"

      src={config.imagem}

      alt=""

      draggable="false"
    />

  )}

</div>


      <div className="hist-cinematica-luzes" />

      <div className="hist-cinematica-brilho" />

      <div className="hist-cinematica-glitch" />

      <div className="hist-cinematica-vinheta" />


      <div
        className="
          hist-cinema-bar
          hist-cinema-bar-top
        "
      />

      <div
        className="
          hist-cinema-bar
          hist-cinema-bar-bottom
        "
      />


      {(
        config.titulo ||
        config.subtitulo
      ) && (

        <div className="hist-cinematica-legenda">

          {config.titulo && (
            <strong>
              {config.titulo}
            </strong>
          )}

          {config.subtitulo && (
            <span>
              {config.subtitulo}
            </span>
          )}

        </div>

      )}


      <button
        type="button"

        className="hist-cinematica-pular"

        onClick={finalizar}
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
          quem === 'narrador'
            ? 'narrador'
            : lado
        }
      `}

      style={{
        '--cor-personagem':
          personagem.cor,
      }}

      onClick={onClick}
    >

      {personagem.nome && (
        <span className="hist-balao-nome">
          {personagem.nome}
        </span>
      )}


      {texto && (
        <p className="hist-balao-texto">
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
      className="hist-celular"

      aria-label="Tela do celular encontrado"
    >

      <div className="hist-celular-tela">

        <div className="hist-celular-topo">
          <span>
            20:47
          </span>

          <span>
            ● ● ●
          </span>
        </div>


        <span className="hist-celular-de">
          {de}
        </span>


        <p className="hist-celular-msg">
          {texto}
        </p>

      </div>

    </div>
  )
}


// ================================================================
// REVELAÇÃO FINAL
// ================================================================

function RevelacaoFinal({
  final,
  onContinuar,
}) {
  return (
    <div className="hist-revelacao-final">

      {final?.video ? (

        <video
          className="hist-revelacao-final-video"

          src={final.video}

          poster={final.imagem}

          autoPlay
          muted
          playsInline
          loop
          preload="auto"
        />

      ) : final?.imagem ? (

        <img
          className="hist-revelacao-final-video"

          src={final.imagem}

          alt=""

          draggable="false"
        />

      ) : null}


      <div className="hist-revelacao-final-overlay" />


      <div className="hist-revelacao-final-conteudo">

        {final?.kicker && (
          <span>
            {final.kicker}
          </span>
        )}


        {final?.titulo && (
          <h2>
            {final.titulo}
          </h2>
        )}


        {final?.subtitulo && (
          <p>
            {final.subtitulo}
          </p>
        )}


        <button
          type="button"

          className="hist-revelacao-final-botao"

          onClick={onContinuar}
        >
          Concluir fase
        </button>

      </div>

    </div>
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
    cinematicaFeita,
    setCinematicaFeita,
  ] = useState(
    !cena.cinematica
  )


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


  const escolha =
    cena.escolha


  const ordem =
    useMemo(
      () => {
        if (!escolha) {
          return []
        }

        return embaralhar(
          escolha.alternativas.map(
            (_, indiceAlternativa) =>
              indiceAlternativa
          )
        )
      },

      [
        cena.id,
        escolha,
      ]
    )


  const falas =
    cena.falas || []


  const emFalas =
    falaIdx <
    falas.length


  const fala =
    emFalas
      ? falas[falaIdx]
      : null


  const efeito =
    useDigitando(
      cinematicaFeita
        ? fala?.texto
        : ''
    )


  const ladoDe = (id) =>
    cena.elenco?.find(
      (personagem) =>
        personagem.id === id
    )?.lado || 'esq'


  function terminarCena() {
    if (cena.final) {
      setMostrarFinal(true)
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
    if (!efeito.completo) {
      efeito.pular()
      return
    }

    proximaFala()
  }


  async function escolher(
    indiceOriginal
  ) {
    if (
      selecionada !== null
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


      aoPontuar?.(data)

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
    // ------------------------------------------------------------
    // Resultado de uma pergunta
    // ------------------------------------------------------------

    if (
      resultado &&
      escolha
    ) {
      if (
        id ===
        escolha.resposta_quem
      ) {
        return resultado.acertou
          ? 'acerto'
          : 'erro'
      }

      return 'neutro'
    }


    // ------------------------------------------------------------
    // Momento da escolha
    // ------------------------------------------------------------

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


    // ------------------------------------------------------------
    // Diálogo normal
    // ------------------------------------------------------------

    if (
      fala &&
      fala.quem === id
    ) {
      return (
        fala.pose ||
        (
          efeito.completo
            ? 'neutro'
            : 'fala'
        )
      )
    }


    return 'neutro'
  }


  const destaque =
    emFalas &&
    fala &&
    fala.quem !== 'narrador'
      ? fala.quem
      : null


  const falandoId =
    emFalas &&
    fala &&
    fala.quem !== 'narrador' &&
    !efeito.completo
      ? fala.quem
      : null


  // ==============================================================
  // CINEMÁTICA
  // ==============================================================

  if (!cinematicaFeita) {
    return createPortal(
      <div className="hist-cena">

        <CinematicaImagem
          config={
            cena.cinematica
          }

          onFim={() =>
            setCinematicaFeita(
              true
            )
          }
        />

      </div>,

      document.body
    )
  }


  // ==============================================================
  // TELA FINAL
  // ==============================================================

  if (mostrarFinal) {
    return createPortal(
      <div
        className="
          hist-cena
          hist-cena-final
        "
      >

        <RevelacaoFinal
          final={cena.final}

          onContinuar={
            onFimCena
          }
        />

      </div>,

      document.body
    )
  }


  // ==============================================================
  // CENA NORMAL
  // ==============================================================

  return createPortal(
    <div
      className="hist-cena"

      role="region"

      aria-label={
        `${fase.titulo}, cena ${indice + 1} de ${total}`
      }
    >

      <Fundo
        src={cena.fundo}
      />


      <div className="hist-vinheta" />


      {!cena.cinematica?.semHud && (
        <div className="hist-hud">

          <button
            type="button"

            className="hist-voltar"

            onClick={onSair}
          >
            Sair da fase
          </button>


          <div className="hist-hud-centro">

            <span className="hist-hud-label">
              INVESTIGAÇÃO 01
            </span>

            <span className="hist-hud-local">
              PARAÍSO
            </span>

          </div>


          <span
            className="hist-progresso"

            aria-label={
              `Cena ${indice + 1} de ${total}`
            }
          >

            {Array.from(
              {
                length: total,
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
      )}


      {cena.elenco?.map(
        (personagem) => (
          <Sprite
            key={
              personagem.id
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
              destaque === null ||
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
        className="hist-falas"

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

                className="hist-continuar"

                onClick={(evento) => {
                  evento.stopPropagation()

                  proximaFala()
                }}
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
                  escolha.resposta_quem
                }

                lado={
                  ladoDe(
                    escolha.resposta_quem
                  )
                }

                texto={
                  resultado
                    ? ''
                    : 'Eu diria que é...'
                }
              >

                <div
                  className="hist-alternativas"

                  role="group"

                  aria-label="Escolha a resposta"
                >

                  {ordem.map(
                    (i) => {
                      const estado =
                        selecionada === null
                          ? ''
                          : i === escolha.correta
                            ? 'correta'
                            : i === selecionada
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
                            selecionada !== null
                          }

                          onClick={() =>
                            escolher(i)
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
                        resultado.acertou
                          ? 'certo'
                          : 'errado'
                      }
                    `}
                  >

                    <strong>
                      {
                        resultado.acertou
                          ? 'Acertou!'
                          : 'Resposta incorreta.'
                      }
                    </strong>


                    <p>
                      {
                        escolha.explicacao
                      }
                    </p>


                    {resultado.extra && (
                      <small>
                        {
                          resultado.extra
                        }
                      </small>
                    )}


                    <button
                      type="button"

                      className="hist-continuar"

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
// HISTÓRIA
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


  const jogando = Boolean(faseAtual)


  useEffect(() => {
    if (!jogando) {
      return undefined
    }


    const overflowAnterior =
      document.body.style.overflow


    document.body.style.overflow =
      'hidden'


    return () => {
      document.body.style.overflow =
        overflowAnterior
    }

  }, [jogando])


  function iniciar(fase) {
    setFaseAtual(fase)

    setCenaIdx(0)

    setIntroPendente(
      Boolean(fase.intro)
    )
  }


  function voltarParaFases() {
    setFaseAtual(null)

    setCenaIdx(0)

    setIntroPendente(false)
  }


  // ==============================================================
  // LISTA DE FASES
  // ==============================================================

  if (!faseAtual) {
    return (
      <section className="historia">

        <div className="hist-topo">

          <span className="hist-topo-kicker">
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


        <div className="hist-fases">

          {FASES.map(
            (fase, indice) => (
              <button
                key={fase.id}

                type="button"

                className="hist-fase-card"

                disabled={
                  !fase.disponivel
                }

                onClick={() =>
                  iniciar(fase)
                }
              >

                <span
                  className="hist-fase-icone"

                  aria-hidden="true"
                >
                  {fase.icone}
                </span>


                <span className="hist-fase-info">

                  <strong>
                    Fase {indice + 1}:{' '}
                    {fase.titulo}
                  </strong>

                  <small>
                    {fase.modulo}
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

          className="hist-voltar"

          onClick={onSair}
        >
          Voltar para as áreas
        </button>

      </section>
    )
  }


  // ==============================================================
  // INTRO-METRO.MP4
  // ==============================================================

  if (
    introPendente &&
    faseAtual.intro
  ) {
    return createPortal(
      <div className="hist-cena">

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
          setCenaIdx(
            (atual) =>
              atual + 1
          )

        } else {
          voltarParaFases()
        }
      }}
    />
  )
}