export const PERSONAGENS = {
  murilo: { nome: 'Murilo', cor: '#ff4757', espelhar: false },
  vitor: { nome: 'Vitor', cor: '#f5f5f5', espelhar: false },

  clara: { nome: 'Clara', cor: '#2de2e6' },

  cleiton: {
    nome: 'Prof. Cleiton',
    cor: '#3d7eff',
  },

  fabio: {
    nome: 'Prof. Fábio',
    cor: '#bd5cff',
  },

  // Mantido por compatibilidade com cenas antigas.
  bruxo: {
    nome: 'Prof. Fábio',
    cor: '#bd5cff',
  },

  lincoln: { nome: 'Lincoln', cor: '#2ed573' },
  enzo: { nome: 'Enzo', cor: '#ff8a3d' },
  beoni: { nome: 'Beoni', cor: '#7c8ba8' },
  rafaela: { nome: 'Rafaela', cor: '#ff7ac8' },

  narrador: {
    nome: '',
    cor: '#7c8ba8',
  },
}


const DUPLA = [
  {
    id: 'murilo',
    lado: 'esq',
  },

  {
    id: 'vitor',
    lado: 'dir',
  },
]


export const FASES = [
  {
    id: 'fase-1',

    titulo: 'Sinais em Paraíso',

    modulo: 'Phishing & Engenharia Social',

    categoria_slug: 'phishing',

    icone: '🎣',

    disponivel: true,

    resumo:
      'Murilo e Vitor investigam uma concentração incomum de golpes na Estação Paraíso e descobrem que o caso é muito maior do que imaginavam.',

    intro:
      '/historia/fase1/intro-metro.mp4',

    cenas: [

      // ==========================================================
      // 01 — METRÔ
      // ==========================================================

      {
        id: 'metro-conversa',

        fundo:
          '/historia/fase1/fundo-metro.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Ainda não entendi por que tinha que ser a gente.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Porque somos especiais, Salame.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Os outros vão estar em casa cedo e a gente vai ficar andando no metrô procurando golpe.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Pensa pelo lado bom.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto: 'Qual?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Sua ex não tá aqui.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Vai se ferrar, Murilo.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Calma. Pelo menos hoje o bingo da sala não vai contar quantas vezes você fala dela.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Vocês ainda estão fazendo aquilo?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Eu organizei.',
          },

          {
            quem: 'narrador',
            texto:
              'O trem começa a diminuir a velocidade. O aviso da próxima estação ecoa pelo vagão.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Falando sério... o Cleiton disse que os ataques estão concentrados todos aqui perto?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Paraíso. Mesma região, horários parecidos e várias iscas diferentes. SMS, QR Code, página falsa...',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'E o Bruxo acha que isso pode ser um daqueles monstros.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Ainda é hipótese. Mas tem padrão demais pra ser coincidência.',
          },
        ],
      },


      // ==========================================================
      // 02 — CHEGADA EM PARAÍSO
      // ==========================================================

      {
        id: 'chegada-paraiso',

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'narrador',
            texto:
              'Murilo e Vitor desembarcam em Paraíso e começam a seguir os pontos onde os golpes foram registrados.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Olha isso. Prazo curto, ameaça de devolver o pacote e um link logo embaixo.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Estão tentando fazer a pessoa agir antes de pensar.',
          },

          {
            quem: 'murilo',
            pose: 'pergunta',
            texto:
              'Então classifica pra mim, especialista.',
          },
        ],

        escolha: {
          quem: 'murilo',

          resposta_quem: 'vitor',

          pergunta:
            'Uma mensagem SMS usa urgência e um link falso para tentar roubar dados. Que tipo de ataque é esse?',

          alternativas: [
            'Ransomware',
            'Smishing',
            'Vishing',
            'Phishing por e-mail',
          ],

          correta: 1,

          explicacao:
            'Smishing é phishing realizado por SMS ou mensagens semelhantes. A isca tenta induzir a vítima a agir rapidamente e acessar conteúdo fraudulento.',
        },
      },


      // ==========================================================
      // 03 — INVESTIGAÇÃO
      // ==========================================================

      {
        id: 'andando-paraiso',

        cinematica: {
          imagem:
            '/historia/fase1/02-andando-paraiso.png',

          duracao: 5200,

          efeito: 'caminhada',

          titulo:
            'ESTAÇÃO PARAÍSO',

          subtitulo:
            'Investigação em andamento',
        },

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'narrador',
            texto:
              'Quanto mais avançam pela estação, menor fica o movimento de passageiros.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'As denúncias param quase todas nessa parte.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Os horários também não estão espalhados. Formam uma sequência.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Como se alguém estivesse mudando de posição?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Ou seguindo uma rota.',
          },
        ],
      },


      // ==========================================================
      // 04 — CELULAR
      // ==========================================================

      {
        id: 'celular-no-banco',

        cinematica: {
          imagem:
            '/historia/fase1/03-celular-banco.png',

          duracao: 5000,

          efeito: 'celular',
        },

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'narrador',
            texto:
              'Uma luz chama a atenção dos dois. Um celular está abandonado sobre um banco.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Isso estava nas denúncias?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto: 'Não.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Então alguém deixou isso depois.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'E provavelmente queria que alguém encontrasse.',
          },
        ],
      },


      // ==========================================================
      // 05 — ANÁLISE
      // ==========================================================

      {
        id: 'analise-celular',

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        celular: {
          de: 'Campanha ativa',

          texto:
            'Seu pacote está retido. Regularize agora para evitar a devolução.',
        },

        falas: [
          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Não abre nada. Primeiro olha o endereço.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'O nome tenta parecer oficial, mas o domínio não pertence à empresa.',
          },

          {
            quem: 'murilo',
            pose: 'pergunta',
            texto:
              'Então qual é o sinal mais importante aqui?',
          },
        ],

        escolha: {
          quem: 'murilo',

          resposta_quem: 'vitor',

          pergunta:
            'Qual destes sinais é mais forte para identificar que a página pode ser falsa?',

          alternativas: [
            'O site usa HTTPS',
            'A mensagem fala sobre uma taxa',
            'O domínio não corresponde ao domínio oficial da empresa',
            'A página possui imagens e logotipo',
          ],

          correta: 2,

          explicacao:
            'Um domínio que não corresponde ao endereço oficial da empresa é um forte sinal de fraude. HTTPS protege a conexão, mas não comprova legitimidade.',
        },
      },


      // ==========================================================
      // 06 — AMEAÇA
      // ==========================================================

      {
        id: 'preservar-evidencia',

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        celular: {
          de: 'DESCONHECIDO',

          texto:
            'VOCÊS DEVERIAM TER DEIXADO O CELULAR ONDE ESTAVA.',
        },

        falas: [
          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Quer continuar mexendo?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Não. Já vimos o suficiente. Vamos preservar o aparelho e levar pro Cleiton e pro Fábio.',
          },

          {
            quem: 'narrador',
            texto:
              'Antes que guardem o aparelho, o celular de Murilo vibra.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Murilo... isso chegou no seu celular?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto: 'Chegou.',
          },
        ],
      },


      // ==========================================================
      // 07 — VULTO
      // ==========================================================

      {
        id: 'vulto-e-revelacao',

        cinematica: {
          imagem:
            '/historia/fase1/04-vulto.png',

          duracao: 5200,

          efeito: 'monstro',

          semHud: true,
        },

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'narrador',
            texto:
              'Um ruído seco ecoa no corredor. Uma sombra atravessa a escuridão atrás deles.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Você viu aquilo?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto: 'Vi.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Era uma pessoa?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto: 'Não.',
          },

          {
            quem: 'narrador',
            texto:
              'A sombra para. Correntes arrastam pelo piso. Anzóis e falsas interfaces surgem entre glitches vermelhos.',
          },
        ],
      },


      // ==========================================================
      // 08 — PHISHING MONSTER
      // ==========================================================

      {
        id: 'phishing-monster',

        cinematica: {
          video:
            '/historia/fase1/phishing-monster-final.mp4',

          imagemFallback:
            '/historia/fase1/phishing-monster-final.png',

          duracao: 6500,

          efeito: 'monstro',

          titulo:
            'AMEAÇA IDENTIFICADA',

          subtitulo:
            'PHISHING MONSTER',

          semHud: true,
        },

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Então a hipótese era real.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Fica atento. Ele não está atacando aleatoriamente.',
          },

          {
            quem: 'narrador',
            texto:
              'O monstro alterna iscas, mensagens e falsos sinais de confiança enquanto avança sobre os dois.',
          },
        ],

        escolha: {
          quem: 'murilo',

          resposta_quem: 'vitor',

          pergunta:
            'O monstro exibe uma página convincente, com HTTPS e identidade visual correta, mas o domínio é diferente do oficial. Em que você deve confiar para validar a origem?',

          alternativas: [
            'No cadeado HTTPS',
            'No domínio e na origem oficial verificada',
            'No logotipo da página',
            'Na urgência da mensagem',
          ],

          correta: 1,

          explicacao:
            'A aparência e o HTTPS podem existir em páginas fraudulentas. A validação precisa considerar domínio, origem e canais oficiais.',
        },
      },


      // ==========================================================
      // 09 — PAUSA DA LUTA
      // ==========================================================

      {
        id: 'pausa-da-luta',

        cinematica: {
          imagem:
            '/historia/fase1/05-pausa-luta.png',

          duracao: 5600,

          efeito: 'batalha',

          semHud: true,
        },

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'narrador',
            texto:
              'Depois de uma sequência de ataques, os dois conseguem alguns segundos de distância. Estão cansados e machucados.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Isso não é um Low Sec comum.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Não. Ele está mudando a isca toda vez que a gente entende o padrão.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'E quando eu quebro o pretexto, ele troca a forma de manipulação.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Separados, a gente só está fazendo ele se adaptar.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto: 'Então?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Eu encontro a estrutura. Você encontra o motivo que faz a vítima acreditar nela.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Correlação e Leitura de Pretexto ao mesmo tempo.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Uma chance. É tudo que a gente precisa.',
          },
        ],
      },


      // ==========================================================
      // 10 — GOLPE FINAL
      // ==========================================================

      {
        id: 'golpe-final',

        cinematica: {
          imagem:
            '/historia/fase1/06-golpe-final.png',

          duracao: 7200,

          efeito: 'golpe-final',

          titulo:
            'CORRELAÇÃO × LEITURA DE PRETEXTO',

          subtitulo:
            'Vulnerabilidade encontrada',

          semHud: true,
        },

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'narrador',
            texto:
              'O Olho do Anão encontra as conexões escondidas entre os ataques. Ao mesmo tempo, Vitor desmonta medo, urgência, autoridade e confiança usados como pretexto.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Achei o padrão.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'E eu achei a mentira que mantém ele de pé.',
          },

          {
            quem: 'narrador',
            texto:
              'As duas técnicas convergem. A estrutura e a manipulação deixam de ser duas partes separadas. Pela primeira vez, o Phishing Monster fica exposto.',
          },
        ],
      },


      // ==========================================================
      // 11 — OBSERVADOR
      // ==========================================================

      {
        id: 'observador',

        cinematica: {
          imagem:
            '/historia/fase1/07-observador.png',

          duracao: 6000,

          efeito: 'suspense',

          semHud: true,
        },

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'narrador',
            texto:
              'Os últimos fragmentos vermelhos desaparecem. No extremo da plataforma, uma figura observa os dois em silêncio.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Ei! Você!',
          },

          {
            quem: 'narrador',
            texto:
              'Vitor dá o primeiro passo para correr. Murilo o segura pelo braço.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Me solta. Ele estava olhando a luta inteira.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Exatamente.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'E você vai deixar ele ir?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'A gente mal conseguiu ficar em pé contra aquilo. Se ele queria ser visto, correr atrás dele é fazer exatamente o que ele espera.',
          },

          {
            quem: 'narrador',
            texto:
              'Quando Vitor olha novamente, a figura já desapareceu.',
          },
        ],
      },


      // ==========================================================
      // 12 — MANHÃ SEGUINTE
      // ==========================================================

      {
        id: 'manha-seguinte',

        cinematica: {
          imagem:
            '/historia/fase1/08-chegada-sala.png',

          duracao: 6000,

          efeito: 'manha',

          titulo:
            'MANHÃ SEGUINTE',

          subtitulo:
            'Faculdade de Tecnologia — São Paulo',
        },

        fundo:
          '/historia/fase1/08-chegada-sala.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'narrador',
            texto:
              'Na manhã seguinte, Murilo e Vitor chegam à faculdade ainda sentindo a noite anterior.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Como a gente explica isso sem parecer maluco?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Mostra o celular. Depois a gente conta o resto.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Você fala “o resto” como se a parte do monstro fosse detalhe.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Abre a porta.',
          },

          {
            quem: 'narrador',
            texto:
              'Cleiton já está sentado na frente da sala. O jeito como olha para os dois elimina a necessidade da primeira explicação.',
          },
        ],
      },


      // ==========================================================
      // 13 — CLEITON
      // ==========================================================

      {
        id: 'cleiton-ja-sabia',

        fundo:
          '/historia/fase1/08-chegada-sala.png',

        elenco: DUPLA,

        falas: [
          {
            quem: 'cleiton',
            texto:
              'Sentem. Nós vamos conversar sobre Paraíso.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Como você sabe que—',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Ele já sabia.',
          },

          {
            quem: 'cleiton',
            texto:
              'Eu sabia que havia atividade anormal. Não sabia que vocês encontrariam algo daquele nível.',
          },

          {
            quem: 'narrador',
            texto:
              'A porta da frente se abre. Fábio entra com um notebook e conecta o equipamento ao projetor.',
          },
        ],
      },


      // ==========================================================
      // 14 — ZERO TRUST
      // ==========================================================

      {
        id: 'zero-trust',

        cinematica: {
          imagem:
            '/historia/fase1/09-zero-trust.png',

          duracao: 7000,

          efeito: 'revelacao',

          titulo:
            'ZERO TRUST',

          subtitulo:
            'Confiar nunca. Sempre verificar.',

          semHud: true,
        },

        fundo:
          '/historia/fase1/09-zero-trust.png',

        elenco: [],

        falas: [
          {
            quem: 'cleiton',
            texto:
              'O que vocês enfrentaram em Paraíso tem um nome no nosso arquivo: Phishing Monster.',
          },

          {
            quem: 'fabio',
            texto:
              'E antes que alguém pergunte: não, ele não foi o primeiro.',
          },

          {
            quem: 'narrador',
            texto:
              'No telão aparecem registros de outros incidentes, padrões de ameaça e arquivos classificados.',
          },

          {
            quem: 'vitor',
            texto:
              'Vocês têm um arquivo disso tudo?',
          },

          {
            quem: 'fabio',
            texto:
              'Temos mais do que um arquivo.',
          },

          {
            quem: 'cleiton',
            texto:
              'Zero Trust não é só o nome desta operação. É a regra que mantém vocês vivos a partir de agora: não confiem na aparência, na origem presumida ou no primeiro padrão que encontrarem.',
          },

          {
            quem: 'murilo',
            texto:
              'A criatura estava se adaptando.',
          },

          {
            quem: 'fabio',
            texto:
              'E alguém estava observando a adaptação.',
          },

          {
            quem: 'cleiton',
            texto:
              'Paraíso não foi o começo. Foi apenas o momento em que vocês entraram no caso.',
          },
        ],

        final: {
          kicker:
            'CASO PARAÍSO ENCERRADO',

          titulo:
            'FASE 1 CONCLUÍDA',

          subtitulo:
            'O incidente foi contido. A investigação Zero Trust está apenas começando.',

          imagem:
            '/historia/fase1/09-zero-trust.png',
        },
      },
    ],
  },


  // ==============================================================
  // FASE 2
  // ==============================================================

  {
    id: 'fase-2',

    titulo:
      'Em desenvolvimento',

    modulo:
      'Continuação',

    categoria_slug:
      'phishing',

    icone: '🔒',

    disponivel: false,

    resumo:
      'A investigação Zero Trust continua em breve.',

    cenas: [],
  },
]