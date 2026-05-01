export type Quantity = 'X2' | 'X4' | 'X7' | 'X12' | 'X50' | 'X100';

export interface SeedSpecs {
  thc: number;
  sativaPct: number;
  yieldIndoor: string;
  yieldOutdoor: string;
  floweringTime: string;
  description: string;
}

export type Seed = {
  id: number;
  name: string;
  type: string; // 'Indica' | 'Sativa' | 'Híbrida'
  genetic: 'Sativa' | 'Indica' | 'Híbrida';
  badge: string;
  color: string;
  stemColor: string;
  leafColor: string;
  flowerColor: string;
  budsColor: string;
  darkLeaf: string;

  subtitle: string;
  flavorProfile: string;
  fem: SeedSpecs;
  auto: SeedSpecs;

  // General attributes for the old canvas generic logic
  days: number;
  thc: number;
  cbd: number;
  yieldG: number;
  aroma: string;
  effect: string;
  tip: string;
  waterFreq: string;
  fertilize: string;
  medicinalFor: string;
  stages: string[];
  stageAt: number[];
  image: string;
  gallery?: string[];
  
  // Categorias para filtros
  isHighThc?: boolean;
  isHighYield?: boolean;
  isIndoor?: boolean;
  isOutdoor?: boolean;
  isBeginnerFriendly?: boolean;
  isFastFlowering?: boolean;
  category?: 'best' | 'beginner' | 'thc' | 'yield';
  rating?: string;
  reviews?: number;
  prices: Record<Quantity, string>;
};

export const QUANTITIES: Quantity[] = ['X2', 'X4', 'X7', 'X12', 'X50', 'X100'];

export const SEEDS: Seed[] = [
  { 
    id: 0, 
    name: 'Açaí Chocolate Punch', 
    type: 'Indica', 
    genetic: 'Indica',
    badge: 'TOP', 
    color: '#4a2c2a', 
    stemColor: '#3e2723', 
    leafColor: '#5d4037', 
    flowerColor: '#8d6e63', 
    budsColor: '#3e2723', 
    darkLeaf: '#212121',
    subtitle: 'Chocolate terroso com frutas escuras e tons roxos intensos',
    flavorProfile: 'Híbrido com predominância índica, com perfil de chocolate-açaí e alto teor de THC.',
    fem: {
      thc: 26,
      sativaPct: 40,
      yieldIndoor: '450-550 g/m²',
      yieldOutdoor: '800-1000 g/planta',
      floweringTime: '7-8 semanas',
      description: 'Açai Chocolate Punch é um híbrido premium com ligeira predominância índica, nascido do cruzamento entre Purple Punch e Chocolate Diesel. Desenvolvida pela HighBreed Seeds para o mercado brasileiro, esta genética destaca-se pelo seu perfil organoléptico único, combinando o clássico chocolate terroso da Chocolate Diesel com as notas frutadas escuras e tons roxos característicos da Purple Punch. É especialmente recomendado para: alívio do estresse, ansiedade, dor leve a moderada, relaxamento noturno e melhoria do humor.'
    },
    auto: {
      thc: 23,
      sativaPct: 35,
      yieldIndoor: '450 g/m²',
      yieldOutdoor: '40-50 g/planta',
      floweringTime: '60-65 dias',
      description: 'Açaí Chocolate Punch Auto é a versão autoflorescente da renomada Açaí Chocolate Punch, criada a partir do cruzamento entre Purple Punch × Chocolate Diesel e genética Ruderalis de alta estabilidade. Desenvolvida pela HighBreed Seeds, esta autoflorescente mantém a essência da versão feminizada: o sabor característico do açaí autêntico com notas de chocolate terroso, frutas escuras e especiarias. Sua estrutura compacta e robustez herdada da Ruderalis a tornam ideal tanto para iniciantes quanto experientes.'
    },
    days: 60, 
    thc: 20, 
    cbd: 0.5, 
    yieldG: 50, 
    aroma: 'Chocolate, açaí, terra', 
    effect: 'Relaxante profundo', 
    tip: 'Crescimento vigoroso', 
    waterFreq: 'A cada 2 dias', 
    fertilize: 'Moderado', 
    medicinalFor: 'Ansiedade', 
    stages: ['Germinação', 'Muda', 'Vegetativo', 'Pré-floração', 'Floração', 'Colheita'], 
    stageAt: [0, 10, 20, 35, 45, 60], 
    image: '/gifs/acai_chocolate_punch.jpg', 
    gallery: ['/gifs/acai_chocolate_punch.jpg', '/gifs/acai_fem.jpg', '/gifs/acai_auto_gallery.jpg'],
    category: 'best', 
    rating: '5.0',
    reviews: 124,
    prices: { 'X2': '85,00', 'X4': '130,00', 'X7': '205,00', 'X12': '290,00', 'X50': '900,00', 'X100': '1375,00' },
    isHighThc: true,
    isIndoor: true,
    isOutdoor: true
  },
  { 
    id: 1, 
    name: 'Brick Banana Blocks', 
    type: 'Híbrida', 
    genetic: 'Híbrida',
    badge: 'TOP', 
    color: '#e6c200', 
    stemColor: '#c0a000', 
    leafColor: '#fdfd96', 
    flowerColor: '#fff59d', 
    budsColor: '#d4ac0d', 
    darkLeaf: '#b7950b',
    subtitle: 'Sabores intensos, frutados e relaxantes',
    flavorProfile: 'Indica frutada com alto teor de THC e notas de banana.',
    fem: {
      thc: 27,
      sativaPct: 40,
      yieldIndoor: '600 g/m²',
      yieldOutdoor: '1000 g/planta',
      floweringTime: '9 semanas',
      description: 'Brick Banana Blocks é uma potente variedade indica, criada a partir do cruzamento de Sour Lemon, Apple e Bananas. Com predominância de genética indica, oferece efeitos profundamente relaxantes, tornando-se a escolha perfeita para aliviar o estresse e relaxar após um longo dia. Esta variedade com alto teor de THC prospera em ambientes internos e externos, garantindo colheitas generosas. Suas flores densas e resinosas exalam um doce aroma frutado de banana com um toque cítrico e sour.'
    },
    auto: {
      thc: 26,
      sativaPct: 45,
      yieldIndoor: '400 g/m²',
      yieldOutdoor: '45 g/planta',
      floweringTime: '60 dias',
      description: 'A versão autoflorescente da Brick Banana Blocks é uma potente variedade indica. Com predominância de genética indica, oferece efeitos profundamente relaxantes, tornando-se a escolha perfeita para aliviar o estresse. Devido à sua predominância indica, é especialmente recomendada para tratar condições como insônia, dores leves a moderadas e perda de apetite.'
    },
    days: 65, 
    thc: 18, 
    cbd: 1, 
    yieldG: 55, 
    aroma: 'Banana, doces', 
    effect: 'Criativo', 
    tip: 'Cuidado com umidade', 
    waterFreq: 'A cada 3 dias', 
    fertilize: 'Moderado', 
    medicinalFor: 'Fadiga', 
    stages: ['Germinação', 'Muda', 'Vegetativo', 'Pré-floração', 'Floração', 'Colheita'], 
    stageAt: [0, 10, 20, 35, 45, 60], 
    image: '/gifs/bbb.jpg', 
    gallery: ['/gifs/bbb.jpg', '/gifs/sjj_gallery.jpg', '/gifs/bbb_auto_gallery.jpg'],
    category: 'best', 
    rating: '4.9',
    reviews: 89,
    prices: { 'X2': '70,00', 'X4': '110,00', 'X7': '170,00', 'X12': '240,00', 'X50': '750,00', 'X100': '1250,00' },
    isBeginnerFriendly: true,
    isIndoor: true
  },
  { 
    id: 2, 
    name: 'Gary Rainbow Road', 
    type: 'Híbrida', 
    genetic: 'Híbrida',
    badge: 'RARE', 
    color: '#ff00ff', 
    stemColor: '#990099', 
    leafColor: '#ff99ff', 
    flowerColor: '#ffccff', 
    budsColor: '#ff66ff', 
    darkLeaf: '#660066',
    subtitle: 'A combinação perfeita entre produção e potência',
    flavorProfile: 'Produção máxima com um nível incrível de THC e tons doces e amanteigados.',
    fem: {
      thc: 28,
      sativaPct: 55,
      yieldIndoor: '750 g/m²',
      yieldOutdoor: '1200 g/planta',
      floweringTime: '8 semanas',
      description: 'Gary Rainbow Road é uma variedade excepcional, resultado do cruzamento entre Gary Payton e Rainbow. Este híbrido combina as melhores qualidades de seus pais, oferecendo uma experiência equilibrada que agrada tanto aos consumidores recreativos quanto medicinais. As flores são densamente cobertas de tricomas, exalando um aroma fascinante com tons de Skittlez, cereja e biscoito. Seu efeito é bem equilibrado, proporcionando um "high" mental harmonioso e um profundo relaxamento.'
    },
    auto: {
      thc: 25,
      sativaPct: 55,
      yieldIndoor: '500 g/m²',
      yieldOutdoor: '50 g/planta',
      floweringTime: '60 - 65 dias',
      description: 'A versão autoflorescente da Gary Rainbow Road é robusta e prospera em ambientes internos e externos, oferecendo produção elevada e um ótimo nível de THC em tempo recorde. Os efeitos equilibrados garantem criatividade e relaxamento suave sem prostração, ideal para quem busca aliviar o estresse, melhorar o humor e encontrar inspiração ao longo do dia.'
    },
    days: 70, 
    thc: 22, 
    cbd: 0.5, 
    yieldG: 60, 
    aroma: 'Frutado, complexo', 
    effect: 'Eufórico', 
    tip: 'Luz intensa', 
    waterFreq: 'A cada 2 dias', 
    fertilize: 'Alto', 
    medicinalFor: 'Estresse', 
    stages: ['Germinação', 'Muda', 'Vegetativo', 'Pré-floração', 'Floração', 'Colheita'], 
    stageAt: [0, 10, 20, 35, 45, 60], 
    image: '/gifs/grr1.jpg', 
    gallery: ['/gifs/grr1.jpg', '/gifs/grr_gallery.jpg', '/gifs/grr_auto_gallery.jpg'],
    category: 'best', 
    rating: '5.0',
    reviews: 156,
    prices: { 'X2': '70,00', 'X4': '110,00', 'X7': '170,00', 'X12': '240,00', 'X50': '750,00', 'X100': '1250,00' },
    isHighThc: true,
    isHighYield: true,
    isOutdoor: true
  },
  { 
    id: 3, 
    name: 'Gomu Gomu Mango', 
    type: 'Sativa', 
    genetic: 'Sativa',
    badge: 'SWEET', 
    color: '#ff9800', 
    stemColor: '#e65100', 
    leafColor: '#ffcc80', 
    flowerColor: '#fff3e0', 
    budsColor: '#ef6c00', 
    darkLeaf: '#bf360c',
    subtitle: 'Uma fusão de relaxamento e doçura com atributos medicinais',
    flavorProfile: 'Uma experiência relaxante e calmante com sabores de frutas tropicais.',
    fem: {
      thc: 23,
      sativaPct: 40,
      yieldIndoor: '550 g/m²',
      yieldOutdoor: '900 g/planta',
      floweringTime: '8 semanas',
      description: 'Gomu Gomu Mango é uma variedade fascinante que combina a genética de Somango e Bubble Gum. Esta variedade produz flores densas e cobertas de resina, exalando um aroma irresistível de Skittlez, chiclete e manga. Os efeitos são realmente medicinais, estimulando o apetite e melhorando a qualidade do sono, favorecendo o alívio do estresse e a tranquilidade sem sedação excessiva.'
    },
    auto: {
      thc: 23,
      sativaPct: 40,
      yieldIndoor: '400 g/m²',
      yieldOutdoor: '40 g/planta',
      floweringTime: '55-60 dias',
      description: 'A Gomu Gomu Mango Auto é cultivada com cuidado para destacar os melhores traços da Somango e Bubble Gum em ciclo rápido. Ideal para uso medicinal ou para desfrutar de um momento despreocupado e agradável, induzindo um relaxamento suave que permite ao usuário permanecer ativo, enquanto entrega muito sabor e efeito calmante.'
    },
    days: 60, 
    thc: 19, 
    cbd: 0.5, 
    yieldG: 55, 
    aroma: 'Manga, doce', 
    effect: 'Energético', 
    tip: 'Fácil cultivo', 
    waterFreq: 'A cada 3 dias', 
    fertilize: 'Normal', 
    medicinalFor: 'Tensão', 
    stages: ['Germinação', 'Muda', 'Vegetativo', 'Pré-floração', 'Floração', 'Colheita'], 
    stageAt: [0, 10, 20, 35, 45, 60], 
    image: '/gifs/ggm1.jpg', 
    gallery: ['/gifs/ggm1.jpg', '/gifs/ggm_gallery.jpg', '/gifs/ggm_auto_gallery.jpg'],
    category: 'best', 
    rating: '4.9',
    reviews: 72,
    prices: { 'X2': '70,00', 'X4': '110,00', 'X7': '170,00', 'X12': '240,00', 'X50': '750,00', 'X100': '1250,00' },
    isFastFlowering: true,
    isIndoor: true
  },
  { 
    id: 4, 
    name: 'Sherbert Jedi Joint', 
    type: 'Indica', 
    genetic: 'Indica',
    badge: 'LEGEND', 
    color: '#27ae60', 
    stemColor: '#1e8449', 
    leafColor: '#82e0aa', 
    flowerColor: '#d5f5e3', 
    budsColor: '#1abc9c', 
    darkLeaf: '#196f3d',
    subtitle: 'Híbrido energizante com THC potente, perfeito para vibes diurnas',
    flavorProfile: 'Sabor forte de biscoito com notas de menta e Oreo.',
    fem: {
      thc: 30,
      sativaPct: 60,
      yieldIndoor: '700 g/m²',
      yieldOutdoor: '1000 g/planta',
      floweringTime: '8 semanas',
      description: 'Sherbet Jedi Joint é uma poderosa variedade híbrida, fruto do cruzamento entre Sherbet e T-Mint. Com 60% de predominância Sativa, esta variedade energiza o seu dia com uma experiência vibrante e estimulante. Seu sabor é intenso e marcante, com base dominante de biscoito enriquecida por notas frescas de menta e Oreo. Inicia com um "high" cerebral impulsionador.'
    },
    auto: {
      thc: 27,
      sativaPct: 55,
      yieldIndoor: '450 g/m²',
      yieldOutdoor: '45 g/planta',
      floweringTime: '60 dias',
      description: 'A variante Sherbet Jedi Joint Auto leva o incrível aroma de menta, biscoito e Oreo para um ciclo super produtivo e rápido. O "high" cerebral te impulsiona a ser criativo, seguido por um leve relaxamento corporal que não te deixa fora de combate. Ideal tanto para uso recreativo quanto terapêutico em qualquer hora do dia.'
    },
    days: 65, 
    thc: 24, 
    cbd: 0.5, 
    yieldG: 45, 
    aroma: 'Cítrico, gelado', 
    effect: 'Relaxante', 
    tip: 'Cuidado extra', 
    waterFreq: 'A cada 2 dias', 
    fertilize: 'P/K alto', 
    medicinalFor: 'Dores', 
    stages: ['Germinação', 'Muda', 'Vegetativo', 'Pré-floração', 'Floração', 'Colheita'], 
    stageAt: [0, 10, 20, 35, 45, 60], 
    image: '/gifs/sjj1.jpg', 
    gallery: ['/gifs/sjj1.jpg', '/gifs/sjj_fem_gallery.jpg', '/gifs/bbb_gallery.jpg'],
    category: 'best', 
    rating: '5.0',
    reviews: 213,
    prices: { 'X2': '70,00', 'X4': '110,00', 'X7': '170,00', 'X12': '240,00', 'X50': '750,00', 'X100': '1250,00' },
    isHighThc: true,
    isIndoor: true
  },
  { 
    id: 5, 
    name: 'Super Saiyan Runtz', 
    type: 'Híbrida', 
    genetic: 'Híbrida',
    badge: 'HOT', 
    color: '#ff5252', 
    stemColor: '#d32f2f', 
    leafColor: '#ff8a80', 
    flowerColor: '#ffebee', 
    budsColor: '#c62828', 
    darkLeaf: '#388e3c',
    subtitle: 'Uma fusão total de potência e sabor',
    flavorProfile: 'Sativa extremamente potente com notas de diesel, caramelo sutil e terra.',
    fem: {
      thc: 29,
      sativaPct: 60,
      yieldIndoor: '650 g/m²',
      yieldOutdoor: '950 g/planta',
      floweringTime: '9 semanas',
      description: 'Super Saiyan Runtz é uma variedade poderosa que combina o melhor de sua linhagem genética, Runtz e Sour Diesel. O aroma cativante mistura diesel, caramelo e um toque terroso. O "high" cerebral inicial é energizante, ideal para despertar criatividade, que depois evolui para felicidade e um relaxamento profundo e narcótico para desconectar de verdade.'
    },
    auto: {
      thc: 26,
      sativaPct: 50,
      yieldIndoor: '400 g/m²',
      yieldOutdoor: '40 g/planta',
      floweringTime: '65 dias',
      description: 'A autoflorescente da Super Saiyan Runtz herda a força de Runtz e Sour Diesel em um pacote compacto. Oferece as deliciosas notas de diesel, caramelo e terra. Seus efeitos são perfeitos tanto para quem busca euforia e energia mental inicial, quanto para o relaxamento pesado subsequente que auxilia na recuperação física.'
    },
    days: 60, 
    thc: 25, 
    cbd: 0.5, 
    yieldG: 50, 
    aroma: 'Doces, balas', 
    effect: 'Poderoso', 
    tip: 'Cuidado no veg', 
    waterFreq: 'A cada 2 dias', 
    fertilize: 'Normal', 
    medicinalFor: 'Ansiedade', 
    stages: ['Germinação', 'Muda', 'Vegetativo', 'Pré-floração', 'Floração', 'Colheita'], 
    stageAt: [0, 10, 20, 35, 45, 60], 
    image: '/gifs/ssr1.jpg', 
    gallery: ['/gifs/ssr1.jpg', '/gifs/ssr_gallery.jpg', '/gifs/ssr_auto_gallery.jpg'],
    category: 'best', 
    rating: '4.9',
    reviews: 104,
    prices: { 'X2': '70,00', 'X4': '110,00', 'X7': '170,00', 'X12': '240,00', 'X50': '750,00', 'X100': '1250,00' },
    isHighThc: true,
    isFastFlowering: true,
    isIndoor: true,
    isOutdoor: true
  }
];
