export const APP_CONFIG = {
  title: 'Concreto & Madeira',
  description: 'Uma pequena metáfora interativa.',
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

export const DEVICE_NOTICE_COPY = {
  kicker: 'Experiência para computador',
  title: 'Abra esta página no notebook ou PC',
  body: 'Esta experiência foi pensada para notebook ou computador, com tela de no mínimo 720p. No iPhone ou iPad ela não pode ser exibida.'
};

export const PALETTE = {
  baseBg: '#121619',
  deepBg: '#0b0e10',
  skyAct1: 'radial-gradient(circle at 50% 35%, #1a2024 0%, #121619 65%, #0b0e10 100%)',
  skyAct2: 'radial-gradient(circle at 50% 35%, #1f1d1b 0%, #121619 68%, #0b0e10 100%)',
  skyAct3Low: 'radial-gradient(circle at 50% 40%, #241e19 0%, #121619 70%, #0b0e10 100%)',
  skyAct3Mid: 'radial-gradient(circle at 50% 42%, #3d2817 0%, #171516 68%, #0b0e10 100%)',
  skyAct3Warm: 'radial-gradient(circle at 50% 42%, #78350f 0%, #2b1608 48%, #121619 100%)'
};

export const NOTICE_COPY = {
  kicker: 'Aviso importante',
  title: 'Esta experiência foi feita para ser vivida do começo ao fim.',
  body: 'Vá com calma, sem pular etapas, até revelar o que está guardado no final.',
  tips: [
    'Use o toque ou arraste na tela para interagir com os elementos.',
    'Se puder, deixe o som ligado.'
  ],
  cta: 'Começar Experiência'
};

export const MEMORIES = [
  'Nossas risadas',
  'O tempo de respiro',
  'Aprender a ouvir',
  'Paciência & calma',
  'Nossas conversas',
  'Recomeçar melhor',
  'Cuidado mútuo',
  'Novos capítulos'
];

export const ACTS_COPY = {
  act1: {
    badge: 'Ato I',
    title: 'A Ilusão da Rigidez',
    instructionStart: 'Toque ou arraste sobre o bloco de concreto para simular o peso dos dias...',
    instructionLastHit: 'Mais um impacto... a estrutura não aguenta!',
    instructionProgress: (hits, max) => `A tensão está aumentando... (${hits}/${max})`,
    quote: 'Quando algo é rígido demais para dobrar, qualquer tempestade transforma tudo em ruínas impossíveis de colar.',
    nextBtn: 'Continuar'
  },
  act2: {
    badge: 'Ato II',
    title: 'A Tempestade na Madeira',
    instructionStart: 'Deslize o dedo pela tela como o vento da tempestade...',
    instructionAfterStorm: 'Toque nas tábuas caídas para ver o que ficou guardado...',
    quote: 'A madeira não vira pó. A tempestade desmonta a estrutura, mas cada peça continua inteira.',
    nextBtn: 'Reconstruir'
  },
  act3: {
    badge: 'Ato III',
    title: 'A Reconstrução',
    instructionStart: 'Arraste (ou toque) nas tábuas para encaixar no desenho da casa...',
    goldenPlankBaseMemory: 'Tábua Nova: Recomeço',
    goldenPlankLinkMemory: 'Tábua Nova: Maturidade',
    quote: 'Podemos levantar a mesma casa com as peças que guardamos — e com tábuas novas, ainda mais fortes.',
    nextBtn: 'Abrir o que está guardado'
  }
};

export const ACT4_COPY = {
  badge: '21 de Dezembro • Carta Aberta',
  title: 'As peças continuam inteiras',
  letter:
    '"Não quero apressar o tempo que precisamos para colocar a cabeça no lugar. Deixo essa carta hoje apenas para que você saiba que as peças continuam aqui, inteiras e guardadas. Quando a poeira baixar, quero recomeçar com você."',
  mysteryKicker: 'O Próximo Alicerce',
  mysteryDesc: 'Antes de abrir o convite final, escolha uma letra às cegas para descobrir o cenário:',
  optionPrefix: 'Opção',
  chosenPrefix: 'Você escolheu a letra',
  switchPrefix: 'Ver opção',
  gcalBtn: 'Salvar no Google Agenda',
  icsBtn: 'Baixar Convite (.ics — Apple / Outlook)'
};

export const INVITE_EVENT = {
  dateLabel: '30 de Janeiro de 2027',
  timeLabel: '21:00',
  gcalDates: '20270131T000000Z/20270131T023000Z',
  dtStart: '20270131T000000Z',
  dtEnd: '20270131T023000Z',
  fileDateSuffix: '30Jan2027',
  summaryPrefix: 'Jantar & Recomeço',
  description: 'Nosso reencontro depois de colocarmos a cabeça no lugar. Sem pressa, peça por peça.',
  icsProdid: '-//Concreto & Madeira//Convite Especial//PT'
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
