export const APP_CONFIG = {
  title: 'Concreto & Madeira — 3D',
  description: 'Experiência interativa 3D com física em tempo real: Depois da Tempestade.',
  passcode: '02042022',
  assets: {
    favicon: 'assets/favicon.svg'
  }
};

export const GATE_COPY = {
  playAriaLabel: 'Iniciar experiência',
  passwordPlaceholder: 'Data importante',
  passwordAriaLabel: 'Digite a data importante',
  submitAriaLabel: 'Enviar senha',
  wrongPasswordMessage: 'Data incorreta. Tente novamente.'
};

export const NOTICE_COPY = {
  kicker: '',
  title: 'Esta experiência foi feita para ser vivida do começo ao fim.',
  body: '',
  tips: [
    'Arraste com o mouse para girar a câmera, use o scroll para dar zoom.',
    'Se puder, deixe o som ligado para ouvir a tempestade e os encaixes.'
  ],
  cta: 'OK',
  loadingCta: 'Carregando...',
  loadError: 'Não foi possível iniciar o motor 3D. Verifique sua conexão ou suporte a WebGL e tente novamente.'
};

export const DEVICE_NOTICE_COPY = {
  kicker: 'Experiência para computador',
  title: 'Abra esta página no notebook ou PC',
  body: 'Esta experiência 3D foi pensada para notebook ou computador, com tela de no mínimo 720p. No iPhone ou iPad ela não pode ser exibida.'
};

export const PALETTE = {
  baseBg: '#121619',
  deepBg: '#0b0e10'
};

export const MEMORIES = [
  'Nossas risadas',
  'O tempo de respiro',
  'Aprender a ouvir',
  'Paciência & calma',
  'Nossas conversas',
  'Recomeçar melhor',
  'Cuidado mútuo',
  'Novos capítulos',
  'Presença verdadeira',
  'Leveza no olhar',
  'Abrigo seguro',
  'Reconstruir juntos'
];

export const REBUILD_PIECES = [
  {
    id: 'piece-barra-2022',
    kind: 'Memória',
    title: 'Barra 2022',
    disclaimer:
      'Foi o dia aonde a vida me mostrou que talvez eu poderia estar errado em relação ao amor.',
    image: './assets/mem-barra-2022.jpg',
    pieceIds: ['wood-post-0', 'wood-post-1']
  },
  {
    id: 'piece-cuidado',
    kind: 'Virtude',
    title: 'Cuidado',
    disclaimer:
      'Nos pequenos gestos silenciosos — na atenção cotidiana e na constância tranquila de cumprir a própria palavra todos os dias.',
    image: null,
    pieceIds: ['wood-post-2', 'wood-post-3']
  },
  {
    id: 'piece-dialogo',
    kind: 'Virtude',
    title: 'Diálogo aberto',
    disclaimer:
      'Falar com honestidade e sem medo de parecer vulnerável amarra a estrutura antes que pequenas frestas cresçam.',
    image: null,
    pieceIds: ['wood-beam-f']
  },
  {
    id: 'piece-confianca',
    kind: 'Virtude',
    title: 'Confiança',
    disclaimer:
      'Saber que o outro não vai usar suas fragilidades contra você transforma qualquer tempestade em apenas vento passando.',
    image: null,
    pieceIds: ['wood-beam-b']
  },
  {
    id: 'piece-risadas',
    kind: 'Atributo',
    title: 'Risadas',
    disclaimer:
      'Sempre encontrar a felicidade nos piores e melhores momentos que passamos juntos; rir sempre foi nossa válvula de escape.',
    image: './assets/mem-risadas-foto.jpg',
    pieceIds: ['wood-beam-l']
  },
  {
    id: 'piece-empatia',
    kind: 'Virtude',
    title: 'Empatia genuína',
    disclaimer:
      'Tentar sentir o peso que o outro carrega antes de tirar conclusões, oferecendo abrigo em vez de cobrança.',
    image: null,
    pieceIds: ['wood-beam-r']
  },
  {
    id: 'piece-noites-simples',
    kind: 'Memória',
    title: 'Noites simples',
    disclaimer:
      'Não precisava de cenário grande para ser especial: um banquinho na calçada, comida boa e você rindo já virava lembrança inteira.',
    image: './assets/mem-noite-juntos.jpg',
    pieceIds: ['wood-plank-b-0']
  },
  {
    id: 'piece-leveza',
    kind: 'Atributo',
    title: 'Leveza no olhar',
    disclaimer:
      'Olhar para o outro com ternura, mesmo depois de um dia difícil, devolve cor ao que parecia cinza.',
    image: null,
    pieceIds: ['wood-plank-b-1']
  },
  {
    id: 'piece-ouvir',
    kind: 'Virtude',
    title: 'Aprender a ouvir',
    disclaimer:
      'Escutar para compreender de verdade, e não apenas para responder rápido, muda o tom de qualquer conversa.',
    image: null,
    pieceIds: ['wood-plank-b-2']
  },
  {
    id: 'piece-presenca',
    kind: 'Virtude',
    title: 'Presença verdadeira',
    disclaimer:
      'Estar inteiro quando estamos juntos — sem distrações — fecha as paredes laterais contra qualquer ruído de fora.',
    image: null,
    pieceIds: ['wood-plank-l-0', 'wood-plank-l-1', 'wood-plank-l-2']
  },
  {
    id: 'piece-paciencia',
    kind: 'Virtude',
    title: 'Paciência & calma',
    disclaimer:
      'A madeira boa não quebra quando verga: ela absorve o impacto e volta devagar para o prumo com maturidade.',
    image: null,
    pieceIds: ['wood-plank-r-0', 'wood-plank-r-1', 'wood-plank-r-2']
  },
  {
    id: 'piece-abrigo',
    kind: 'Memória',
    title: 'Abrigo seguro',
    disclaimer:
      'Aquela sensação rara de chegar e sentir paz imediata — a porta que sempre reconhece quem você é de verdade.',
    image: './assets/mem-abrigo.svg',
    pieceIds: ['wood-plank-fl', 'wood-plank-fr']
  },
  {
    id: 'piece-forca-em-dupla',
    kind: 'Atributo',
    title: 'Força em dupla',
    disclaimer:
      'Quando a gente se puxa para cima, divide o esforço e celebra cada evolução como vitória dos dois.',
    image: './assets/mem-treino.jpg',
    pieceIds: ['wood-roof-l-0', 'wood-roof-r-0']
  },
  {
    id: 'piece-colo-verdade',
    kind: 'Virtude',
    title: 'Colo & verdade',
    disclaimer:
      'Mostrar quem somos sem armaduras, encostar a cabeça com calma e confiar que a verdade aproxima mais do que qualquer defesa.',
    image: './assets/mem-colo.jpg',
    pieceIds: ['wood-roof-l-1', 'wood-roof-r-1']
  },
  {
    id: 'piece-recomecar',
    kind: 'Memória',
    title: 'Recomeçar melhor',
    disclaimer:
      'Valorizar cada passo dado até aqui e reconstruir com gratidão pelo caminho, mais conscientes e com o coração no lugar certo.',
    image: './assets/mem-sorrisos.jpg',
    pieceIds: ['wood-roof-l-2', 'wood-roof-r-2']
  }
];

export const PHASES_COPY = {
  observe: {
    actionBtn: 'Desencadear Tempestade'
  },
  rebuild: {
    finishBtn: 'Concluir Reconstrução',
    lockedFinishBtn: 'Coloque todas as peças para prosseguir',
    quote:
      'Perder-se também é caminho. Minha força está na solidão; não tenho medo de chuvas tempestivas nem de grandes ventanias soltas, pois eu também sou o escuro da noite.',
    quoteAuthor: 'Clarice Lispector',
    quoteBtn: 'Abrir o que está guardado'
  }
};

export const PIECE_STATUS_LABELS = {
  preservada: 'Preservada',
  danificada: 'Danificada',
  inutilizavel: 'Inutilizável'
};

export const ACT4_COPY = {
  letter: [
    'Gosto de pensar que a nossa relação é como uma casa de madeira. Diferentemente de uma estrutura de concreto, cuja solidez pode existir apenas na união rígida de seus elementos, cada peça da nossa casa representa algo real que construímos juntos: uma memória, uma experiência, um aprendizado, uma qualidade ou uma virtude que descobrimos um no outro. O concreto, nessa metáfora, representa uma relação cuja aparência de solidez não é sustentada por vínculos verdadeiros e significativos. Já a madeira representa aquilo que temos: uma história formada por tantas partes que possuem valor por si mesmas. Uma tempestade pode desfazer nossas conexões, derrubar nossas paredes e mudar completamente a forma da nossa casa, mas não apaga aquilo que cada peça representa. E talvez seja justamente por isso que acredito que ainda podemos recolher nossas tábuas, fortalecer nossas fundações e construir, juntos, uma casa ainda mais bonita do que a primeira.',
    'E talvez seja justamente aí que essa comparação encontre o que estamos vivendo.',
    'Nossa casa também enfrentou tempestades. Em algum momento, algumas estruturas foram comprometidas, determinadas conexões deixaram de funcionar como deveriam e acabamos chegando a um ponto em que continuar tentando sustentar tudo da mesma maneira já não parecia suficiente.',
    'Por isso, acredito que esse tempo também pode ter um significado diferente: o de olhar para tudo com calma, compreender nossos erros, reconhecer nossas necessidades e descobrir o que precisamos mudar como indivíduos.',
    'Eu não quero simplesmente reconstruir a casa que tínhamos. Quero ter a oportunidade de construir uma nova casa com você.',
    'Não quero fingir que nada aconteceu, apagar nossas lembranças ou ignorar aquilo que nos machucou. Quero aprender com tudo isso. Quero conhecer novamente seus detalhes, redescobrir suas manias, ouvir suas histórias e conquistar seu sorriso. Quero que possamos nos aproximar novamente, compartilhar novas histórias e encontrar novos motivos para sorrir juntos.',
    'Quero que possamos escolher novas tábuas, encontrar encaixes melhores, reforçar nossas fundações e criar espaços que talvez nem existissem em nossa primeira construção. Quero uma relação em que possamos conversar mesmo quando for difícil, como está sendo agora, discordar sem nos machucar e encontrar segurança um no outro sem deixar de sermos nós mesmos.',
    'E sei que não cabe somente a mim decidir o que construiremos. Uma casa feita por duas pessoas precisa das duas. Não existe reconstrução verdadeira quando apenas uma delas está disposta a colocar novas peças.',
    'Não sei exatamente como será o futuro, mas sei que, da minha parte, existe vontade de fazer diferente. Não porque nossa história anterior não tenha sido bonita, mas porque acredito que ainda podemos aprender muito sobre como amar, cuidar e construir juntos.',
    'Talvez nossa primeira casa tenha nos ensinado como construir. Talvez essa nova oportunidade, caso também seja o que você deseja, nos ensine como cuidar melhor daquilo que construímos.',
    'E, dessa vez, não precisamos ter pressa para terminar a casa. Podemos aproveitar cada etapa, cada escolha, cada detalhe e cada pequena conquista. Porque, no final, não é sobre construir a casa mais bonita ou mais resistente. É sobre construir um lugar onde nós dois queiramos estar.'
  ],
  mysteryDesc: 'Antes de abrir o bônus, escolha uma das letras abaixo:',
  chosenPrefix: 'Você escolheu a letra',
  inviteNote:
    'Você recebeu um convite para este restaurante. A data e o horário ficam totalmente por sua escolha — você decide quando quiser ir.',
  inviteDateChoice: 'Data e horário: você quem decide',
  musicTracks: [
    {
      title: 'Minha Mensagem para você',
      spotifyUrl: '',
      qrImage: 'assets/spotify-mensagem.jpg'
    },
    {
      title: 'Intenção da carta',
      spotifyUrl: '',
      qrImage: 'assets/spotify-intencao.jpg'
    }
  ]
};

export const RESTAURANTS = {
  A: {
    letter: 'A',
    name: 'Restaurante Amado',
    address: 'Av. Lafayete Coutinho, 660 - Comércio, Salvador - BA',
    otherLetter: 'M'
  },
  M: {
    letter: 'M',
    name: 'Restaurante Mistura',
    address: 'Ladeira do Gabriel, 334 - Dois de Julho / Contorno, Salvador - BA',
    otherLetter: 'A'
  }
};
