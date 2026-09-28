export const PERSONAGENS = {
  murilo: {
    nome: 'Murilo',
    cor: '#ff4757',
    espelhar: false,
  },

  vitor: {
    nome: 'Vitor',
    cor: '#f5f5f5',
    espelhar: false,
  },

  clara: {
    nome: 'Clara',
    cor: '#2de2e6',
  },

  cleiton: {
    nome: 'Prof. Cleiton',
    cor: '#3d7eff',
    espelhar: false,
  },

  fabio: {
    nome: 'Prof. Fábio',
    cor: '#bd5cff',
    espelhar: false,
  },

  bruxo: {
    nome: 'Prof. Fábio',
    cor: '#bd5cff',
    espelhar: false,
  },

  lincoln: {
    nome: 'Lincoln',
    cor: '#2ed573',
  },

  enzo: {
    nome: 'Enzo',
    cor: '#ff8a3d',
  },

  beoni: {
    nome: 'Beoni',
    cor: '#7c8ba8',
  },

  rafaela: {
    nome: 'Rafaela',
    cor: '#ff7ac8',
  },

  narrador: {
    nome: '',
    cor: '#7c8ba8',
  },
}


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


export const FASES = [
  {
    id: 'fase-1',

    titulo: 'Sinais em Paraíso',

    modulo:
      'Phishing & Engenharia Social',

    categoria_slug:
      'phishing',

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

        elenco:
          DUPLA_ALUNOS,

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
            texto:
              'Qual?',
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
      // 02 — PARAÍSO
      // ==========================================================

      {
        id: 'chegada-paraiso',

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco:
          DUPLA_ALUNOS,

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

          resposta_quem:
            'vitor',

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

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco:
          DUPLA_ALUNOS,

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

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco:
          DUPLA_ALUNOS,

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
            texto:
              'Não.',
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

        elenco:
          DUPLA_ALUNOS,

        celular: {
          de:
            'Campanha ativa',

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

          resposta_quem:
            'vitor',

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

        elenco:
          DUPLA_ALUNOS,

        celular: {
          de:
            'DESCONHECIDO',

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
            texto:
              'Chegou.',
          },
        ],
      },


      // ==========================================================
      // 07 — VULTO
      // ==========================================================

      {
        id: 'vulto-e-revelacao',

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco:
          DUPLA_ALUNOS,

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
            texto:
              'Vi.',
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
            texto:
              'Não.',
          },

          {
            quem: 'narrador',
            texto:
              'A sombra para. Correntes arrastam pelo piso. Anzóis e falsas interfaces surgem entre glitches vermelhos.',
          },
        ],
      },


      // ==========================================================
      // 08 — CONFRONTO
      // ==========================================================

      {
        id: 'phishing-monster',

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco:
          DUPLA_ALUNOS,

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
              'A criatura alterna iscas, mensagens e falsos sinais de confiança enquanto avança sobre os dois.',
          },
        ],

        escolha: {
          quem: 'murilo',

          resposta_quem:
            'vitor',

          pergunta:
            'Uma página parece legítima e usa HTTPS, mas o domínio é diferente do oficial. O que deve ser validado?',

          alternativas: [
            'O cadeado HTTPS',
            'O domínio e a origem oficial verificada',
            'O logotipo da página',
            'A urgência da mensagem',
          ],

          correta: 1,

          explicacao:
            'A aparência e o HTTPS também podem existir em páginas fraudulentas. A validação precisa considerar o domínio, a origem e os canais oficiais.',
        },
      },


      // ==========================================================
      // 09 — BOSS
      // ==========================================================

      {
        id:
          'batalha-phishing-monster',

        tipo: 'boss',

        fundo:
          '/historia/fase1/fundo-estacao.png',
      },


      // ==========================================================
      // 10 — PÓS-BATALHA
      // ==========================================================

      {
        id: 'pos-batalha',

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco:
          DUPLA_ALUNOS,

        falas: [
          {
            quem: 'narrador',
            texto:
              'O último impacto atravessa a estrutura do Phishing Monster. Os fragmentos vermelhos começam a desaparecer.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Isso definitivamente não era um golpe normal.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Ele estava aprendendo.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Aprendendo com a gente?',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Toda vez que a gente entendia uma técnica, ele mudava.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Até a gente combinar as duas análises.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Correlação e Leitura de Pretexto.',
          },
        ],
      },


      // ==========================================================
      // 11 — OBSERVADOR
      // ==========================================================

      {
        id: 'observador',

        fundo:
          '/historia/fase1/fundo-estacao.png',

        elenco:
          DUPLA_ALUNOS,

        falas: [
          {
            quem: 'narrador',
            texto:
              'No extremo da plataforma, uma figura humana observa os dois em silêncio.',
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
      // 12 — FACULDADE
      // ==========================================================

      {
        id: 'manha-seguinte',

        fundo:
          '/historia/fase1/fundo-sala.png',

        elenco:
          DUPLA_ALUNOS,

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
              'Cleiton já está na sala. O jeito como olha para os dois elimina a necessidade da primeira explicação.',
          },
        ],
      },


      // ==========================================================
      // 13 — PROFESSORES
      // ==========================================================

      {
        id:
          'cleiton-ja-sabia',

        fundo:
          '/historia/fase1/fundo-sala.png',

        elenco:
          DUPLA_PROFESSORES,

        elencoDinamico:
          true,

        falas: [
          {
            quem: 'cleiton',
            pose: 'fala',
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
            pose: 'fala',
            texto:
              'Eu sabia que havia atividade anormal. Não sabia que vocês encontrariam algo daquele nível.',
          },

          {
            quem: 'narrador',
            texto:
              'A porta se abre. Fábio entra e caminha até a frente da sala.',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Pelo jeito vocês já começaram sem mim.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Se vocês dois já sabiam que tinha alguma coisa em Paraíso, podiam ter avisado.',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'Sabíamos que havia atividade anormal. Isso é diferente de saber exatamente o que estava lá.',
          },

          {
            quem: 'murilo',
            pose: 'pergunta',
            texto:
              'Então aquilo já apareceu antes?',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Aquilo especificamente? Não.',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Mas fenômenos parecidos... sim.',
          },
        ],
      },


      // ==========================================================
      // 14 — ZERO TRUST
      // ==========================================================

      {
        id: 'zero-trust',

        fundo:
          '/historia/fase1/fundo-sala.png',

        elenco:
          DUPLA_PROFESSORES,

        elencoDinamico:
          true,

        falas: [
          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'O que vocês enfrentaram em Paraíso tem um nome no nosso arquivo: Phishing Monster.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Vocês deram nome praquilo?',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Não fomos nós.',
          },

          {
            quem: 'murilo',
            pose: 'pergunta',
            texto:
              'Então quem foi?',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Essa é uma das perguntas que ainda estamos tentando responder.',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'E antes que vocês perguntem: não, ele não foi o primeiro caso.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Tem mais daquelas coisas?',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Existem outros registros. Com comportamentos diferentes, técnicas diferentes e padrões diferentes.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'A criatura de Paraíso estava se adaptando.',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'Exatamente.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Toda vez que a gente entendia uma técnica, ela mudava.',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Porque vocês estavam olhando para cada ataque isoladamente.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'Até a gente juntar a correlação dele com a minha leitura de pretexto.',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'E foi exatamente isso que tornou o padrão visível.',
          },

          {
            quem: 'narrador',
            texto:
              'Cleiton troca um olhar rápido com Fábio antes de continuar.',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'Existe uma regra que vocês vão precisar aprender se pretendem continuar investigando esses casos.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Que regra?',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'Nunca confiem apenas na aparência.',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Não confiem na origem presumida. Não confiem no primeiro padrão que encontrarem.',
          },

          {
            quem: 'murilo',
            pose: 'pergunta',
            texto:
              'Zero Trust.',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'Exatamente.',
          },

          {
            quem: 'vitor',
            pose: 'fala',
            texto:
              'E aquele cara na estação?',
          },

          {
            quem: 'fabio',
            pose: 'fala',
            texto:
              'Se ele estava observando a luta, precisamos descobrir por quê.',
          },

          {
            quem: 'murilo',
            pose: 'fala',
            texto:
              'Ele queria que a gente percebesse que estava lá.',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'Então não deem a ele aquilo que ele espera.',
          },

          {
            quem: 'vitor',
            pose: 'pergunta',
            texto:
              'Que seria?',
          },

          {
            quem: 'cleiton',
            pose: 'fala',
            texto:
              'Confiança.',
          },

          {
            quem: 'narrador',
            texto:
              'A sala fica em silêncio por alguns segundos. Paraíso havia terminado, mas a investigação estava apenas começando.',
          },
        ],

        final: {
          kicker:
            'CASO PARAÍSO ENCERRADO',

          titulo:
            'FASE 1 CONCLUÍDA',

          subtitulo:
            'O incidente foi contido. A investigação Zero Trust está apenas começando.',
        },
      },
    ],
  },
]