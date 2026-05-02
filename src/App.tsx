import React, { useState, useEffect, useRef } from 'react';
import { SEEDS, Seed, Quantity, QUANTITIES } from './data';
import { GameState, INITIAL_STATE } from './gameState';
import { drawGarden } from './canvas';
import { playSfx, toggleMusic, musicOn, getCurrentTrackName, changeTrack, setOnTrackChangeCallback, setVolume } from './audio';
import { Search, User, Heart, ShoppingCart, Globe, ListFilter, ChevronLeft, ChevronRight, ChevronUp, MessageCircle, Trash2 } from 'lucide-react';
import ManualPage from './ManualPage';

import { AuthModal } from './AuthModal';
import { CartModal, FavoritesModal, OrdersModal } from './StoreModals';
import CheckoutPage from './CheckoutPage';
import PaymentPage from './PaymentPage';
import AboutPage from './AboutPage';
import TermsPage from './TermsPage';
import DisclaimerPage from './DisclaimerPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import CookiesPolicyPage from './CookiesPolicyPage';
import LegalNoticePage from './LegalNoticePage';
import { motion } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, doc, writeBatch, setDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';


type LogEntry = { id: number; time: string; msg: string; color: string };

function lerp(a: string, b: string, t: number) {
  t = Math.max(0, Math.min(1, t));
  const p = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const ca = p(a), cb = p(b);
  return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)},${Math.round(ca[1] + (cb[1] - ca[1]) * t)},${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`;
}

const reviews = [
   { user: "Dr. Marcos P.", service: "CONSULTA MÉDICA", text: "Processo extremamente profissional. A receita digital foi aceita sem problemas na farmácia especializada.", time: "1 HORA ATRÁS" },
   { user: "Juliana S.", service: "LAUDO AGRONÔMICO", text: "O suporte do Wilian foi fundamental para a documentação da minha associação. Nota 10!", time: "4 HORAS ATRÁS" },
   { user: "Ricardo M.", service: "HABEAS CORPUS", text: "Minha família agora tem paz. O suporte jurídico especializado é o melhor que já vi no Brasil.", time: "6 HORAS ATRÁS" },
   { user: "Felipe G.", service: "GENÉTICAS", text: "As sementes de elite do Instituto são outro nível. Vigor ímpar e rendimento acima da média.", time: "1 DIA ATRÁS" },
   { user: "Anonymous", service: "IMPORTAÇÃO", text: "Chegou em 12 dias dos EUA. Todo trâmite da ANVISA foi resolvido por eles. Sem burocracia.", time: "2 DIAS ATRÁS" },
   { user: "Clínica Vida", service: "ASSOCIADOS", text: "A parceria com o Instituto MECURA elevou o nível do nosso tratamento terapêutico. Ciência de verdade.", time: "3 DIAS ATRÁS" }
];

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Validate Connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setFavorites([]);
      setOrders([]);
      return;
    }
    const unsubCart = onSnapshot(collection(db, `users/${user.uid}/cartItems`), (snap) => {
      setCartItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {});
    const unsubFav = onSnapshot(collection(db, `users/${user.uid}/favorites`), (snap) => {
      setFavorites(snap.docs.map(d => d.data().seedId));
    }, (error) => {});
    const unsubOrd = onSnapshot(collection(db, `users/${user.uid}/orders`), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {});
    
    return () => { unsubCart(); unsubFav(); unsubOrd(); };
  }, [user]);

  const [G, setG] = useState<GameState>(INITIAL_STATE);
  const [currentView, setCurrentView] = useState<'home' | 'manual' | 'checkout' | 'payment' | 'about' | 'terms' | 'disclaimer' | 'privacy' | 'cookies' | 'legal'>('home');
  const [checkoutData, setCheckoutData] = useState<{ totalAmount: number; selectedBonuses: number[] } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [popup, setPopup] = useState<{ title: string; content?: React.ReactNode; body?: React.ReactNode } | null>(null);
  const [floats, setFloats] = useState<{id: number; x: number; y: number; text: string}[]>([]);
  const [shopVariants, setShopVariants] = useState<Record<number, { qty: Quantity, type: 'Feminizada' | 'Automatica' }>>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCatalogTab, setActiveCatalogTab] = useState('Buscador');

  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);

  const navItems = [
    { label: 'Feminizadas', filter: 'Feminizadas' },
    { label: 'Automática', filter: 'Automática' },
    { label: 'Buscador', filter: null, isSearch: true },
    { label: 'Coleções', filter: 'Coleções' },
    { label: 'Bancos de Genética', filter: 'Bancos de Genética', hasSub: true },
    { label: 'Drops / Promo', filter: 'Drops / Promo', special: true },
    { label: 'Mural', filter: 'Mural', special: true },
  ];

  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const handleNavClick = (item: any) => {
    playSfx('click');

    if (item.label === 'Bancos de Genética') {
      setOpenMegaMenu(openMegaMenu === 'Bancos de Genética' ? null : 'Bancos de Genética');
      return;
    }

    setOpenMegaMenu(null);
    setActiveCatalogTab(item.label);
    setCurrentView('home');
    
    if (item.isSearch) {
      setActiveFilter(null);
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }

    if (item.label === 'Drops / Promo') {
      const el = document.getElementById('promos');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (item.label === 'Mural') {
      const el = document.getElementById('reviews');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (item.filter) {
      setActiveFilter(item.filter);
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [selectedSeedId, setSelectedSeedId] = useState<number | null>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [similarQtys, setSimilarQtys] = useState<Record<string, Quantity>>({});
  const [popupMsg, setPopupMsg] = useState<{title: string, message: string, btnText: string} | null>(null);

  useEffect(() => {
    if (selectedSeedId !== null) setCurrentImgIdx(0);
  }, [selectedSeedId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const addFloat = (text: string, e: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    setFloats(p => [...p, { id, text, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setFloats(p => p.filter(f => f.id !== id)), 1000);
  };
  const [stageNotif, setStageNotif] = useState<string | null>(null);
  const [tipNotif, setTipNotif] = useState<string | null>(null);
  const [actionAnim, setActionAnim] = useState<'water' | 'fertilize' | 'prune' | 'pests' | null>(null);
  const [visitors, setVisitors] = useState(420369);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(musicOn);
  const [trackName, setTrackName] = useState(getCurrentTrackName());
  const [volume, setVolumeLevel] = useState(0.5);

  useEffect(() => {
    setOnTrackChangeCallback((name) => {
      setTrackName(name);
    });
  }, []);

  const handleNextTrack = () => {
    changeTrack(1);
    setTrackName(getCurrentTrackName());
  };
  const handlePrevTrack = () => {
    changeTrack(-1);
    setTrackName(getCurrentTrackName());
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logIdRef = useRef(0);
  const gRef = useRef(G);
  gRef.current = G;

  const addLog = (msg: string, color = '#88ff88') => {
    const h = String(Math.floor(gRef.current.gameHour)).padStart(2, '0');
    const m = String(Math.floor(gRef.current.gameMin)).padStart(2, '0');
    setLogs(prev => [...prev.slice(-59), { id: ++logIdRef.current, time: `[${h}:${m}]`, msg, color }]);
  };

  useEffect(() => {
    addLog('🌿 Bem-vindo ao Semente Sagrada World!', '#ffff00');
    addLog('Selecione uma semente e clique em PLANTAR!', '#00ff88');
    addLog('💡 Dica: use ⏩ VELOCIDADE para acelerar o tempo.', '#ffaa00');
    
    let c = 420000;
    const iv = setInterval(() => {
      c += Math.floor(Math.random() * 30 + 5);
      if (c >= 420369) { c = 420369; clearInterval(iv); }
      setVisitors(c);
    }, 40);
    return () => clearInterval(iv);
  }, []);

  // Sky drawing
  useEffect(() => {
    const starsCanvas = document.getElementById('sky-stars') as HTMLCanvasElement;
    if (starsCanvas) {
      starsCanvas.width = window.innerWidth;
      starsCanvas.height = 120;
      const ctx = starsCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * starsCanvas.width, y = Math.random() * starsCanvas.height, r = Math.random() * 1.8;
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; ctx.fill();
        }
      }
    }
  }, []);

  // Game Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setG(prev => {
        let { gameMin, gameHour, gameDay, speed, ...rest } = prev;
        gameMin += 10 * speed;
        let daysPassed = 0;
        while (gameMin >= 60) { gameMin -= 60; gameHour++; }
        while (gameHour >= 24) { gameHour -= 24; gameDay++; daysPassed++; }

        let next = { ...rest, gameMin, gameHour, gameDay, speed };

        for (let i = 0; i < daysPassed; i++) {
          next.watered = false; next.fertilized = false;
          if (next.planted && !next.harvested) {
             // --- REALISM LOGIC ---
             // pH balance (ideal 6.0-7.0)
             if (next.ph < 6.0 || next.ph > 7.0) next.health -= 5;
             // temp (ideal 20-28)
             if (next.temp < 18 || next.temp > 30) next.health -= 4;
             // pests (low airflow -> more pests)
             next.pests = Math.min(100, next.pests + (100 - next.airFlow) * 0.05);
             if (next.pests > 20) next.health -= next.pests * 0.1;
             
             // Base needs
             next.water = Math.max(0, next.water - 14);
             next.nutrients = Math.max(0, next.nutrients - 9);
             
             if (next.water < 20) {
               next.health -= 6;
               if (Math.random() < 0.4) setTimeout(() => addLog('⚠️ PLANTA COM SEDE! Regue urgente!', '#ff4444'), 0);
               setTimeout(() => playSfx('warning'), 0);
             } else if (next.water < 40) {
               next.health -= 1;
             }
             if (next.nutrients < 15) next.health -= 3;
             if (next.water >= 30 && next.nutrients >= 20) next.health = Math.min(100, next.health + 1);
             next.health = Math.max(0, Math.min(100, next.health));

             if (next.health <= 5) {
               setTimeout(() => addLog('💀 Planta morreu! Clique RESETAR.', '#ff0000'), 0);
               setTimeout(() => playSfx('death'), 0);
               next.planted = false; next.harvested = true;
             } else {
               const s = SEEDS[next.selSeed];
               const age = next.gameDay - next.plantDay;
               let newStage = 0;
               for (let j = s.stageAt.length - 1; j >= 0; j--) {
                 if (age >= s.stageAt[j]) { newStage = j; break; }
               }
               if (newStage !== next.stage) {
                 next.stage = newStage;
                 const sName = s.stages[newStage];
                 setTimeout(() => {
                   setStageNotif(`✨ NOVA FASE: ${sName.toUpperCase()}`);
                   addLog(`🌿 Nova fase: ${sName}!`, '#ffff00');
                   playSfx('stage');
                 }, 0);
                 if (newStage >= 2) next.pruned = false; // logic adjust from original maybe?
                 if (newStage >= 5) {
                   setTimeout(() => setPopup({
                     title: '🌾 PRONTA PARA COLHER!',
                     body: <>Sua <b>{s.name}</b> chegou ao ponto máximo!<br/><br/><span className="hl">Clique em COLHER AGORA!</span><br/><br/><b>Dica:</b> Observe os tricomas:<br/>• Leitosos = mais eufórico<br/>• Âmbar = sedativo<br/><br/><span className="cy">{s.tip}</span></>
                   }), 0);
                 }
               }
             }
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Render Loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (canvasRef.current) {
        drawGarden(canvasRef.current, gRef.current, SEEDS[gRef.current.selSeed]);
      }
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // Notification clearing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stageNotif) timer = setTimeout(() => setStageNotif(null), 4000);
    if (tipNotif) timer = setTimeout(() => setTipNotif(null), 6000);
    return () => clearTimeout(timer);
  }, [stageNotif, tipNotif]);

  // Cultivation Tips
  useEffect(() => {
    if (G.stage >= 0 && G.planted && !G.harvested) {
      const s = SEEDS[G.selSeed];
      const isAuto = G.isAuto;
      
      let tip = "";
      switch(G.stage) {
        case 0: // Germinação
          tip = `FASE: Germinação da ${s.name}. Mantenha humidade alta (80%+) e temperatura estável em torno de 24°C. Não mexa na semente!`;
          break;
        case 1: // Muda
          tip = `FASE: Muda (Seedling). Sua ${s.name} está frágil. Luz moderada é ideal. Cuidado com regas excessivas, o sistema radicular é minúsculo.`;
          break;
        case 2: // Vegetativo
          tip = `FASE: Vegetativo. Hora de crescer! Suprimento de Nitrogênio é vital (${s.fertilize}). DICA: ${s.tip}. ${s.genetic === 'Sativa' ? 'Lembre-se: Sativas tendem a esticar muito.' : 'Energia total para estrutura foliar.'}`;
          break;
        case 3: // Pré-floração
          tip = `FASE: Pré-floração. ${isAuto ? 'Sua planta automática iniciou o ciclo de vida final sozinha.' : 'Mude o fotoperíodo para 12/12 se estiver em ambiente interno!'} Observe o estiramento vigoroso da ${s.name}.`;
          break;
        case 4: // Floração
          tip = `FASE: Floração. Os buds estão se formando! Aroma de ${s.aroma} está ficando forte. Foque em Fósforo e Potássio. Evite molhar as flores.`;
          break;
        case 5: // Colheita
          tip = `FASE FINAL: Quase lá! Monitore os tricomas da ${s.name}. Se estiverem leitosos com alguns âmbar, é a hora perfeita. Faça o flush final.`;
          break;
        default:
          tip = `DICA: ${s.tip}`;
      }
      
      setTipNotif(tip);
    }
  }, [G.stage, G.selSeed, G.planted, G.isAuto]);

  const handleMusicToggle = () => {
    toggleMusic();
    setIsMusicOn(!isMusicOn);
  };

  const doPlant = () => {
    if (G.planted && !G.harvested) return;
    const s = SEEDS[G.selSeed];
    setG(prev => ({
      ...prev, planted: true, plantDay: prev.gameDay, water: 88, nutrients: 78,
      health: 100, stage: 0, pruned: false, watered: false, fertilized: false, harvested: false
    }));
    playSfx('plant');
    addLog(`🌱 Plantou ${s.name}!`, '#ffff00');
    setPopup({
      title: `🌱 ${s.name} Plantada!`,
      body: <><b>Tipo:</b> {s.type}<br/><b>Floração:</b> ~{s.days} dias<br/><b>THC:</b> ~{s.thc}% | <b>CBD:</b> ~{s.cbd}%<br/><span className="gr">Cuide bem dela!</span><br/><span className="cy">Dica: {s.tip}</span></>
    });
  };

  const triggerAnim = (type: 'water' | 'fertilize' | 'prune' | 'pests') => {
    setActionAnim(type);
    setTimeout(() => setActionAnim(null), 1500);
  };

  // STRATEGIC TIPS POOL (EXPANDED)
  const WATER_TIPS = [
    "FUNDAMENTO: O pH ideal para absorção de nutrientes na cannabis varia entre 5.8 e 6.5.",
    "MANEJO: Molhar as folhas sob sol forte pode causar o efeito 'lupa' e queimá-las severamente.",
    "DICA: Muita água compacta o solo, afogando as raízes e impedindo a oxigenação vital.",
    "FUNDAMENTO: Espere o solo secar (os primeiros 2-3cm) antes de regar novamente. Raízes amam ciclos seco/úmido.",
    "DICA: Água gelada dá choque térmico nas raízes. Use água em temperatura ambiente (20-25°C).",
    "MANEJO: Se as folhas estiverem murchas e pesadas, é excesso de água. Se estiverem caídas e finas, é falta.",
    "TÉCNICA: Regue devagar ao redor do caule para que a água se espalhe uniformemente pelo vaso."
  ];
  const NUTRI_TIPS = [
    "MANEJO: Nitrogênio (N) é o combustível do Vegetativo; Fósforo (P) e Potássio (K) comandam a Floração.",
    "DICA: Bordas das folhas amareladas e 'garra' (folha curvada) indicam excesso de nutrientes (Nutrient Burn).",
    "FUNDAMENTO: O 'Flush' (lavagem do solo com 3x o volume do vaso em água) salva plantas com excesso de sais.",
    "MANEJO: Comece com 1/4 da dose do fabricante. Marcas gringas costumam ser fortes demais para clones jovens.",
    "DICA: Cálcio e Magnésio (CalMag) são fundamentais se você usa água de RO ou iluminação LED potente.",
    "OBSERVAÇÃO: Folhas amareladas de baixo para cima costumam ser deficiência de Nitrogênio móvel.",
    "TÉCNICA: Nutrição foliar é 10x mais rápida, mas use apenas no vegetativo e com luzes baixas."
  ];
  const PRUNE_TIPS = [
    "DICA: A poda 'Topping' (cortar o topo no 3º ou 4º nó) quebra a dominância apical e dobra os rendimentos.",
    "MANEJO: Desfolha técnica nas semanas 1 e 3 da flora abre caminho para a luz chegar nos buds inferiores.",
    "FUNDAMENTO: Remova os 'pipocas' (buds pequenos de baixo) para que a planta foque energia nas colas principais.",
    "DICA: LST (Low Stress Training) é amarrar os galhos para baixo. Isso aumenta a colheita sem o estresse das podas.",
    "MANEJO: Nunca remova mais de 20% das folhas de uma vez. A planta precisa delas para fazer fotossíntese.",
    "TÉCNICA: A poda FIM (Fuck I Missed) visa criar 4 topos principais em vez de 2, mas exige precisão.",
    "DICA: Use sempre tesouras esterilizadas com álcool para evitar fungos e infecções no caule."
  ];
  const PEST_TIPS = [
    "MANEJO: Óleo de Neem com sabão de potássio é a barreira orgânica definitiva contra ácaros e pulgões.",
    "DICA: Mantenha a umidade abaixo de 45% na flora avançada para evitar o mofo cinza (Botrytis), que devora buds.",
    "FUNDAMENTO: Higiene é 90% do sucesso. Limpe o grow semanalmente e nunca entre com roupas usadas na rua.",
    "DICA: Armadilhas amarelas colantes ajudam a monitorar a presença de Fungus Gnats (mosquinhas do solo).",
    "MANEJO: Terra diatomácea no topo do solo cria uma barreira física contra larvas e insetos rastejantes.",
    "OBSERVAÇÃO: Teias minúsculas entre os nós indicam Spider Mites. Aja rápido ou perderá a safra.",
    "DICA: Ventilação forte dificulta a vida dos insetos e fortalece a estrutura mecânica dos galhos."
  ];

  const doWater = () => {
    if (!G.planted || G.harvested) return;
    if (G.watered) { addLog('Já regou hoje! Aguarde.', '#ff8800'); playSfx('warning'); return; }
    setG(prev => ({ ...prev, water: Math.min(100, prev.water + 28), watered: true }));
    playSfx('water');
    addLog('💧 Regou a planta!', '#00ccff');
    setTipNotif(WATER_TIPS[Math.floor(Math.random() * WATER_TIPS.length)]);
    triggerAnim('water');
  };

  const doFertilize = () => {
    if (!G.planted || G.harvested) return;
    if (G.fertilized) { addLog('Já adubou hoje! Excesso queima.', '#ff8800'); playSfx('warning'); return; }
    setG(prev => ({ ...prev, nutrients: Math.min(100, prev.nutrients + 32), fertilized: true }));
    playSfx('fertilize');
    addLog(`🧪 Adubou!`, '#ffaa00');
    setTipNotif(NUTRI_TIPS[Math.floor(Math.random() * NUTRI_TIPS.length)]);
    triggerAnim('fertilize');
  };

  const doPrune = () => {
    if (!G.planted || G.harvested) return;
    if (G.stage < 2) { addLog('Só pode podar no vegetativo!', '#ff4444'); return; }
    if (G.pruned) { addLog('Já podou hoje.', '#ff8800'); return; }
    setG(prev => ({ ...prev, pruned: true, health: Math.min(100, prev.health + 5) }));
    playSfx('prune');
    addLog('✂️ Podou! Crescimento otimizado.', '#aaffaa');
    setTipNotif(PRUNE_TIPS[Math.floor(Math.random() * PRUNE_TIPS.length)]);
    triggerAnim('prune');
  };

  const doClearPests = () => {
    playSfx('click'); 
    setG(p => ({...p, pests: 0})); 
    addLog('🐛 Pragas eliminadas!', '#ff00ff'); 
    triggerAnim('pests');
    setTipNotif(PEST_TIPS[Math.floor(Math.random() * PEST_TIPS.length)]);
  };

  const doHarvest = () => {
    if (!G.planted || G.stage < 5) return;
    const s = SEEDS[G.selSeed];
    const specs = G.isAuto ? s.auto : s.fem;
    const yieldStr = G.isIndoor ? specs.yieldIndoor : specs.yieldOutdoor;
    
    // Helper to parse yield from strings like "400-500 g/planta" or "450 g/m²"
    const getRealYield = (str: string) => {
      const match = str.match(/(\d+)(?:-(\d+))?/);
      if (!match) return s.yieldG;
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      let val = min + Math.random() * (max - min);
      
      // If g/m², assume 1 plant is approx 20-25% of a m² yield for realism in a home grow
      if (str.includes('m²')) val = val * 0.25;
      
      return val;
    };

    const baseYield = getRealYield(yieldStr);
    const hPct = G.health / 100;
    const yield_ = Math.round(baseYield * hPct);
    
    setG(prev => ({ ...prev, harvested: true, planted: false, totalHarvests: prev.totalHarvests + 1, showHarvestEffect: true }));
    playSfx('harvest');
    const qual = hPct > 0.85 ? '🌟 EXCELENTE' : hPct > 0.60 ? '✅ BOA' : '⚠️ REGULAR';
    addLog(`🏆 COLHEITA: ${s.name} | ${yield_}g | ${qual}`, '#ffff00');
    setPopup({
      title: '🏆 COLHEITA CONCLUÍDA!',
      body: <><b>Espécie:</b> {s.name} ({G.isAuto ? 'Auto' : 'Fem'})<br/><b>Qualidade:</b> {qual}<br/><b>Rendimento:</b> {yield_}g<br/><span className="gr">Parabéns! Cultivo completo.</span></>
    });
    setTimeout(() => setG(prev => ({...prev, showHarvestEffect: false})), 5000);
  };

  const resetGame = () => {
    setG({ ...INITIAL_STATE, selSeed: G.selSeed, isAuto: G.isAuto });
    setLogs([]);
    addLog('🔄 Jogo reiniciado! Nova jornada começa.', '#ff8800');
  };

  // Sky calcs
  const h = G.gameHour + G.gameMin/60;
  let skyColor;
  if (h>=5&&h<8) { const t=(h-5)/3; skyColor=lerp('#08091f','#e8673a',t); }
  else if (h>=8&&h<13) { const t=(h-8)/5; skyColor=lerp('#1a6fc4','#64b5f6',t); }
  else if (h>=13&&h<18) { skyColor='#5ba3d9'; }
  else if (h>=18&&h<20) { const t=(h-18)/2; skyColor=lerp('#64b5f6','#e8673a',t); }
  else if (h>=20&&h<22) { const t=(h-20)/2; skyColor=lerp('#e8673a','#08091f',t); }
  else { skyColor='#06070f'; }

  const isDay = h>=6&&h<20;
  const pct = ((h - 6 + 24) % 24) / 24;
  
  const pad = (n: number) => String(n).padStart(2, '0');
  let period = 'MADRUGADA 🌙';
  const periods: [number, string][] = [[0,'MADRUGADA 🌙'],[5,'AMANHECER 🌅'],[8,'MANHÃ ☀️'],[12,'MEIO-DIA 🌞'],[14,'TARDE ☀️'],[18,'ENTARDECER 🌇'],[20,'NOITE 🌙']];
  for(const [ph,pn] of periods) { if (h>=ph) period=pn; }

  const s = SEEDS[G.selSeed];
  const age = G.gameDay - G.plantDay;
  const hpct = Math.round(G.health);
  const growPct = Math.min(100, Math.round((age / s.days) * 100));

  return (
    <div className="font-[Comic Neue] min-h-screen text-[var(--green)]">
      {/* GLOBAL STICKY HEADER */}
      <div className="md:sticky relative top-0 z-[1000] w-full flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        {/* TOP PROMO BAR */}
        <div className="w-full bg-lime-500 text-black py-2 px-4 text-center vt text-[10px] md:text-sm font-bold uppercase tracking-widest flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 shadow-[0_4px_15px_rgba(0,255,0,0.2)]">
          <img src="/images/verde_claro.png" className="h-6 w-6 pixelate inline-block" alt="Promo Promo" />
          <span>Gaste mais R$300 para obter envio grátis discreto!</span>
          <button 
            className="bg-black text-lime-400 px-4 py-1 hover:bg-white hover:text-black transition-colors rounded-full text-xs pixel shadow-inner border border-lime-700"
            onClick={() => {
              playSfx('click');
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Compre agora
          </button>
        </div>

        {/* MAIN HEADER */}
        <div className="w-full bg-black text-white py-4 px-6 border-b-4 border-white/5">
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                playSfx('click');
                setActiveFilter(null);
                setSearchQuery('');
                setActiveCatalogTab('Buscador');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img src="/images/vermelho_com_verde.png" className="w-[50px] h-[50px] pixelate animate-pulse drop-shadow-[0_0_15px_#ff00ff] group-hover:scale-110 transition-transform" alt="Mascot" />
              <div className="flex flex-col">
                 <span className="pixel text-2xl text-lime-500 whitespace-nowrap drop-shadow-[2px_2px_0px_#005500] leading-none group-hover:text-white transition-colors">SEMENTE SAGRADA</span>
                 <span className="vt text-lg text-[#ff00ff] font-bold tracking-[0.4em] uppercase drop-shadow-[1px_1px_0px_#ffffff] leading-relaxed group-hover:tracking-[0.5em] transition-all">World</span>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[600px] relative mt-2 lg:mt-0">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Busca genética, acessório ou palavra-chave..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0a] border-2 border-[#333] rounded-sm py-3 px-6 pr-20 text-lime-400 vt text-lg focus:outline-none focus:border-lime-500 focus:bg-[#111] transition-all placeholder:text-[#555] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <div className="vt text-[10px] text-lime-400 bg-black/80 px-2 py-1 border border-lime-500/30 rounded mr-1 animate-pulse">
                    {SEEDS.filter(s => 
                      normalize(s.name).includes(normalize(searchQuery)) || 
                      normalize(s.subtitle).includes(normalize(searchQuery)) ||
                      normalize(s.effect).includes(normalize(searchQuery)) ||
                      normalize(s.aroma).includes(normalize(searchQuery))
                    ).length} resultados
                  </div>
                )}
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-2 text-white/30 hover:text-white transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
                <button 
                  className="p-2 text-lime-500 hover:text-white transition-colors bg-black border border-[#333] rounded-sm shadow-sm"
                  onClick={() => {
                    playSfx('click');
                    if (searchQuery) {
                      const q = normalize(searchQuery);
                      const results = SEEDS.filter(s => 
                        normalize(s.name).includes(q) || 
                        normalize(s.subtitle).includes(q) ||
                        normalize(s.effect).includes(q) ||
                        normalize(s.aroma).includes(q)
                      );
                      
                      if (results.length > 0) {
                        const firstMatchId = results[0].id;
                        setTimeout(() => {
                          const element = document.getElementById(`seed-${firstMatchId}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          } else {
                            const catalogElement = document.getElementById('catalog');
                            if (catalogElement) catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      } else {
                        const catalogElement = document.getElementById('catalog');
                        if (catalogElement) catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }
                  }}
                >
                  <Search size={22} />
                </button>
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center justify-center gap-6 vt text-gray-400 w-full lg:w-auto p-2 bg-[#111] border border-[#222] rounded-sm">
               <div className="flex items-center gap-2 border-r border-[#333] pr-6 hover:text-lime-400 cursor-pointer transition-colors">
                 <Globe size={18} className="text-[#ff00ff]" /> <span className="font-bold text-xs uppercase tracking-widest">Global</span>
               </div>
               <div className="flex items-center gap-5 px-2">
                  <User onClick={() => user ? setIsOrdersOpen(true) : setIsAuthOpen(true)} className="cursor-pointer hover:text-lime-400 transition-colors" size={20} />
                  <Heart onClick={() => user ? setIsFavoritesOpen(true) : setIsAuthOpen(true)} className="cursor-pointer hover:text-[#ff00ff] transition-colors" size={20} />
                  {/* ListFilter missing implementation here for now */}
                  <ListFilter className="cursor-pointer hover:text-lime-400 transition-colors" size={20} />
                  <div className="relative group p-2 -m-2" onClick={() => user ? setIsCartOpen(true) : setIsAuthOpen(true)}>
                    <ShoppingCart className="cursor-pointer hover:text-lime-400 transition-colors" size={20} />
                    {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-[#ff00ff] text-white pixel text-[8px] w-5 h-5 flex items-center justify-center rounded-sm shadow-[1px_1px_0px_rgba(0,0,0,1)] border border-white flex-shrink-0 animate-bounce">{cartItems.reduce((acc, item) => acc + (item.packCount || 1), 0)}</span>}

                    {/* Hover Cart Preview - Polished UI */}
                    {cartItems.length > 0 && user && (
                      <div className="absolute top-full right-0 mt-4 hidden group-hover:block bg-white text-gray-900 p-5 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-gray-100 z-[200] w-[360px] font-sans scale-up-center cursor-default before:content-[''] before:absolute before:-top-4 before:right-0 before:w-16 before:h-8" onClick={e => e.stopPropagation()}>
                         <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
                             <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Seu Carrinho</span>
                                <span className="font-extrabold text-sm">{cartItems.reduce((acc, item) => acc + (item.packCount || 1), 0)} {cartItems.reduce((acc, item) => acc + (item.packCount || 1), 0) === 1 ? 'item' : 'itens'} adicionais</span>
                             </div>
                             <div className="text-right">
                                <span className="block text-[#84cc16] font-black text-lg leading-none">R$ {cartItems.reduce((acc, item) => acc + (item.priceNum || 0), 0).toFixed(2).replace('.', ',')}</span>
                             </div>
                         </div>
                         
                         <div className="max-h-[280px] overflow-y-auto pr-2 mb-5 space-y-4 custom-scrollbar">
                            {cartItems.map(item => {
                               const seed = SEEDS.find(s => String(s.id) === item.seedId);
                               if (!seed) return null;
                               return (
                                 <div key={item.id} className="flex gap-4 items-center p-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group/item">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative">
                                       <img src={seed.gallery?.[0] || seed.image} alt={seed.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = seed.image; e.currentTarget.onerror = null; }} />
                                       <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/5 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex justify-between items-start gap-2">
                                          <div className="font-black text-xs leading-tight truncate uppercase tracking-tight text-gray-800">{seed.name}</div>
                                          <button 
                                             onClick={async (e) => {
                                                e.stopPropagation();
                                                playSfx('click');
                                                if(auth.currentUser) await deleteDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${item.id}`));
                                             }}
                                             className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                          >
                                             <Trash2 size={14} />
                                          </button>
                                       </div>
                                       <div className="text-[9px] font-bold text-gray-400 mt-0.5">{item.variantType} • Pack: {item.quantity}</div>
                                       
                                       <div className="flex items-center justify-between mt-2">
                                          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-7">
                                             <button 
                                                className="w-7 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors text-xs font-bold" 
                                                onClick={async (e) => {
                                                   e.stopPropagation();
                                                   playSfx('click');
                                                   if(!auth.currentUser) return;
                                                   const newCount = (item.packCount || 1) - 1;
                                                   let pStr = seed.prices[item.quantity as Quantity];
                                                   if (typeof pStr === 'string') pStr = pStr.replace('.', '').replace(',', '.');
                                                   const basePriceNum = parseFloat(pStr);
                                                   if (newCount <= 0) {
                                                      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${item.id}`));
                                                   } else {
                                                      const { id, ...data } = item;
                                                      await setDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${item.id}`), {
                                                         ...data,
                                                         packCount: newCount,
                                                         priceNum: basePriceNum * newCount
                                                      });
                                                   }
                                                }}
                                             >-</button>
                                             <span className="px-2 text-xs font-black text-gray-700 min-w-[20px] text-center">{item.packCount || 1}</span>
                                             <button 
                                                className="w-7 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors text-xs font-bold" 
                                                onClick={async (e) => {
                                                   e.stopPropagation();
                                                   playSfx('click');
                                                   if(!auth.currentUser) return;
                                                   const newCount = (item.packCount || 1) + 1;
                                                   let pStr = seed.prices[item.quantity as Quantity];
                                                   if (typeof pStr === 'string') pStr = pStr.replace('.', '').replace(',', '.');
                                                   const basePriceNum = parseFloat(pStr);
                                                   const { id, ...data } = item;
                                                   await setDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${item.id}`), {
                                                      ...data,
                                                      packCount: newCount,
                                                      priceNum: basePriceNum * newCount
                                                   });
                                                }}
                                             >+</button>
                                          </div>
                                          <span className="font-black text-xs text-gray-900">R$ {item.priceNum ? item.priceNum.toFixed(2).replace('.', ',') : '0,00'}</span>
                                       </div>
                                    </div>
                                 </div>
                               );
                            })}
                         </div>

                         {/* Bonus Progression Overlay */}
                         <div className="bg-gray-50 p-4 rounded-2xl mb-5 space-y-3 border border-gray-100 shadow-inner">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center text-lg">🎁</div>
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Status de Bonus</span>
                                     <span className="text-xs font-black text-gray-700">{1 + Math.floor(cartItems.reduce((acc, item) => acc + (item.priceNum || 0), 0) / 116.63)} semente(s) grátis</span>
                                  </div>
                               </div>
                               <span className="bg-lime-500 text-black font-black text-[9px] px-2 py-1 rounded-md uppercase">Ativo</span>
                            </div>
                            {cartItems.reduce((acc, item) => acc + (item.priceNum || 0), 0) % 116.63 !== 0 && (
                               <p className="text-[9px] text-gray-400 font-bold leading-tight px-1">
                                  Perto de mais um upgrade! Gaste <span className="text-lime-600 font-black">R$ {(116.63 - (cartItems.reduce((acc, item) => acc + (item.priceNum || 0), 0) % 116.63)).toFixed(2).replace('.', ',')}</span> e adicione +1 unidade ao seu kit free.
                               </p>
                            )}
                         </div>

                         <button 
                            onClick={(e) => { 
                               e.stopPropagation();
                               playSfx('click');
                               if(user) setCurrentView('checkout'); 
                               else setIsAuthOpen(true); 
                            }} 
                            className="w-full bg-[#f6ab1c] hover:bg-[#ffb72a] text-black font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(246,171,28,0.3)] transition-all active:scale-95 text-xs pixel tracking-widest flex items-center justify-center gap-2 uppercase hover:-translate-y-0.5"
                         >
                            <ShoppingCart size={16} />
                            Ir para o Checkout
                         </button>
                      </div>
                    )}
                  </div>
               </div>
               {user && (
                 <button onClick={() => signOut(auth)} className="text-[10px] uppercase font-bold text-gray-500 hover:text-red-500 transition-colors">Sair</button>
               )}
            </div>
          </div>
        </div>

        {/* NAVIGATION BAR */}
        <div className="bg-[#050505] text-[#ccc] vt text-[12px] md:text-[14px] font-bold tracking-widest border-b border-[#222]">
          <div className="max-w-[1200px] mx-auto flex overflow-x-auto no-scrollbar">
            {navItems.map((item, idx) => {
              const isActive = activeCatalogTab === item.label;
              const isSpecial = item.special;
              const isLast = idx === navItems.length - 1;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`px-6 py-4 transition-colors whitespace-nowrap border-b-2 uppercase flex items-center gap-1 ${
                    isActive 
                      ? 'bg-[#111] text-lime-400 border-lime-500' 
                      : isSpecial 
                        ? item.label.includes('Drops') ? 'bg-[#330033] hover:bg-[#550055] text-white border-transparent hover:border-[#ff00ff]' : 'bg-[#111111] hover:bg-[#222222] border-transparent hover:border-white'
                        : 'hover:bg-[#111] hover:text-lime-400 border-transparent hover:border-lime-500'
                  } ${isLast ? 'ml-auto border-transparent hover:border-lime-500 text-[#777]' : ''}`}
                >
                  {item.label} {item.hasSub && <span className="text-[#666]">▼</span>}
                </button>
              );
            })}
            <button className="px-6 py-4 hover:bg-[#111] hover:text-lime-400 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-lime-500 ml-auto flex items-center gap-1 uppercase text-[#777]">
              Log / Ajuda <span className="text-[#444]">▼</span>
            </button>
          </div>
        </div>
        
        {/* MEGA MENU - BANCOS DE GENÉTICA */}
        {openMegaMenu === 'Bancos de Genética' && (
          <>
            <div 
               className="fixed inset-0 z-[55]" 
               onClick={() => setOpenMegaMenu(null)}
            />
            <div className="absolute top-[100%] left-0 w-full bg-[#f8f9fa] border-t border-[#e9ecef] shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-[60] pt-6 pb-10 text-[#222]">
              <div className="max-w-[1200px] mx-auto px-6">
                <h3 className="vt font-bold text-lg mb-6 uppercase tracking-[0.2em] text-[#555] border-b pb-2">Bancos de Sementes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                   <div 
                     onClick={() => {
                        playSfx('click');
                        setOpenMegaMenu(null);
                        setActiveFilter('HighBreed Seeds');
                        setActiveCatalogTab('Bancos de Genética');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                     }}
                     className="bg-white border text-center border-[#ddd] rounded-xl p-4 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-[0_4px_20px_rgba(0,255,0,0.2)] hover:border-lime-500 hover:-translate-y-1 transition-all"
                   >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center">
                         <img src="https://seedscountry.com/wp-content/uploads/2021/04/highbreed-logo.png" alt="HighBreed Seeds" className="w-full h-full object-contain drop-shadow" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl text-lime-600">🌱</span>'; }} />
                      </div>
                      <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-[#111]">HighBreed Seeds</span>
                   </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="crt-overlay"></div>
      {floats.map(f => (
        <div key={f.id} className="floating-text" style={{ left: f.x - 30, top: f.y - 20 }}>
          {f.text}
        </div>
      ))}
        {/* SKY */}
        <div id="sky" style={{ background: skyColor, position: 'relative', height: '120px', width: '100%', overflow: 'hidden' }}>
          <canvas id="sky-stars" style={{ opacity: isDay ? 0 : 1, position: 'absolute', top: 0, left: 0 }}></canvas>
          <div id="clouds">
            <div className="retro-cloud" style={{width:70,height:22,top:18,left:'4%'}}></div>
            <div className="retro-cloud" style={{width:100,height:28,top:38,left:'22%'}}></div>
            <div className="retro-cloud" style={{width:85,height:24,top:28,left:'68%'}}></div>
            <div className="retro-cloud" style={{width:70,height:22,top:18,left:'104%'}}></div>
          </div>
          <div id="sun-moon" style={{
            left: `${pct * 108 - 4}%`,
            background: isDay ? 'radial-gradient(circle,#fffde7,#ffcc02)' : 'radial-gradient(circle,#eceff1,#b0bec5)',
            boxShadow: isDay ? '0 0 20px #ffcc02,0 0 50px rgba(255,200,0,0.4)' : '0 0 12px rgba(200,220,255,0.6)',
            top: isDay && h >= 9 && h < 17 ? '12px' : '24px'
          }}></div>
        </div>
      
      <div id="top-header" className="sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-b-8 border-double border-[var(--green)] flex flex-col items-center relative overflow-hidden min-h-[350px] md:min-h-[480px] justify-center">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/animate-this-pixel-art-scene-brazil-and-spain-flag.mp4" type="video/mp4" />
        </video>
        
        {/* Shooting Stars */}
        <div className="shooting-star star-1"></div>
        <div className="shooting-star star-2"></div>
        <div className="shooting-star star-3"></div>
        <div className="shooting-star star-4"></div>

        <div className="absolute inset-0 bg-black/10 z-[1]"></div>
        <div className="relative z-10 flex flex-col items-center w-full px-4 py-12 md:py-16">
          <div className="site-title hover:text-white transition-colors cursor-default drop-shadow-[0_0_15px_rgba(0,255,0,0.8)] text-center px-4">★ SEMENTE SAGRADA WORLD ★</div>
          <div className="site-sub text-center px-4 leading-tight">⚡ A ENCICLOPÉDIA CÓSMICA DAS SEMENTES ⚡</div>
          <div className="vt text-2xl md:text-4xl text-[var(--lime)] mt-4 tracking-widest bg-black/70 px-4 md:px-8 py-2 md:py-3 rounded shadow-inner mb-6 border border-[#00ff00]/30 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
            DIA {pad(Math.floor(G.gameDay))} — {pad(Math.floor(G.gameHour))}:{pad(Math.floor(G.gameMin))} — {period}
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-4 items-center w-full px-2">
            
            {/* BOOMBOX MUSIC PLAYER */}
            <div className="bg-[#111] border-4 border-outset border-[#555] px-2 md:px-4 py-2 md:py-3 flex flex-wrap md:flex-nowrap justify-center items-center gap-2 md:gap-4 drop-shadow-xl min-w-[280px]">
              <div className="flex items-center gap-2">
                <span className="pixel text-[10px] md:text-[14px] text-[#00ff00] animate-pulse">FM/AM</span>
                <button className="pixel text-[10px] md:text-[12px] px-2 md:px-3 py-1 md:py-2 bg-[#333] border-2 border-outset border-[#777] text-white hover:bg-[#555] active:border-inset" onClick={() => { playSfx('click'); handlePrevTrack(); }} onMouseEnter={() => playSfx('hover')}>{'<<'}</button>
                <button className={`pixel text-[10px] md:text-[12px] px-3 md:px-4 py-1 md:py-2 ${isMusicOn ? 'bg-red-700 hover:bg-red-600' : 'bg-[#333] hover:bg-[#555]'} border-2 border-outset border-[#777] text-white active:border-inset transition-colors`} onClick={() => { playSfx('click'); handleMusicToggle(); }} onMouseEnter={() => playSfx('hover')}>
                  {isMusicOn ? '◼ STOP' : '▶ PLAY'}
                </button>
                <button className="pixel text-[10px] md:text-[12px] px-2 md:px-3 py-1 md:py-2 bg-[#333] border-2 border-outset border-[#777] text-white hover:bg-[#555] active:border-inset" onClick={() => { playSfx('click'); handleNextTrack(); }} onMouseEnter={() => playSfx('hover')}>{'>>'}</button>
              </div>
              <div className="w-[140px] md:w-[180px] bg-black border-inset border-4 border-[#333] px-2 md:px-3 py-1 md:py-2 overflow-hidden whitespace-nowrap text-sm md:text-lg text-[#00ffff] font-[Courier_New] shadow-[inset_0_0_10px_rgba(0,255,255,0.2)]">
                {isMusicOn ? <marquee scrollamount="3">🎵 {trackName} 🎵</marquee> : 'POWER OFF'}
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span className="text-[10px] text-white">vol:</span>
                <input 
                  type="range" min="0" max="1" step="0.1" value={volume} 
                  className="w-16 h-2 accent-lime-500 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  onChange={(e) => { 
                    const v = parseFloat(e.target.value); 
                    setVolumeLevel(v); 
                    setVolume(v); 
                  }} 
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <div className="relative">
                <button className="pixel text-[12px] md:text-[14px] px-3 md:px-4 py-2 md:py-3 border-[3px] transition-all text-[var(--orange)] border-[var(--orange)] hover:bg-[#110a00] hover:scale-105 active:scale-95 bg-black/50" onClick={() => { playSfx('click'); setSpeedMenuOpen(!speedMenuOpen); }} onMouseEnter={() => playSfx('hover')}>
                  ⏩ VELOCIDADE
                </button>
                {speedMenuOpen && (
                  <div className="fixed top-[20%] md:top-[150px] left-1/2 md:left-auto md:right-10 transform -translate-x-1/2 md:translate-x-0 bg-[#001800] border-4 border-[var(--orange)] p-3 z-[1000] text-left min-w-[200px] shadow-[10px_10px_0_rgba(0,0,0,0.9)]">
                    <div className="pixel text-[10px] md:text-[12px] text-yellow-300 mb-3 border-b border-[#333] pb-2">VELOCIDADE DO TEMPO</div>
                    {[1, 5, 20, 60].map(v => (
                      <button key={v} onMouseEnter={() => playSfx('hover')} onClick={() => { playSfx('click'); setG(p => ({...p, speed: v})); setSpeedMenuOpen(false); }} className={`block w-full px-3 py-2 bg-[#001100] border-2 border-[#004400] vt text-lg md:text-xl mb-2 hover:bg-[#003300] transition-colors ${G.speed === v ? 'text-yellow-300 border-yellow-300 shadow-[0_0_10px_rgba(255,255,0,0.3)]' : 'text-orange-400'}`}>
                        {v === 1 ? '🐢 Normal (1x)' : v === 5 ? '🐇 Rápido (5x)' : v === 20 ? '⚡ Turbo (20x)' : '🚀 Ultra (1 dia/seg)'}
                      </button>
                    ))}
                    <button onClick={() => setSpeedMenuOpen(false)} className="mt-2 text-[10px] w-full text-center text-gray-500">FECHAR [X]</button>
                  </div>
                )}
              </div>
              <button className="pixel text-[12px] md:text-[14px] px-3 md:px-4 py-2 md:py-3 border-[3px] transition-all text-[var(--cyan)] border-[var(--cyan)] hover:bg-[#001122] hover:scale-105 active:scale-95 bg-black/50" onMouseEnter={() => playSfx('hover')} onClick={() => { playSfx('click'); setPopup({title: '❓ COMO JOGAR', body: <>Plante, regue, adube, espere crescer e colha!<br/>Cuidado para não secar!</>})}}>
                ❓ AJUDA
              </button>
              <button className="pixel text-[12px] md:text-[14px] px-3 md:px-4 py-2 md:py-3 border-[3px] transition-all text-[var(--red)] border-[var(--red)] hover:bg-[#220000] hover:text-white hover:scale-105 active:scale-95 bg-black/50" onMouseEnter={() => playSfx('hover')} onClick={() => { playSfx('click'); resetGame(); }}>
                ↺ RESETAR JOGO
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="marquee-bar">
        <span className="marquee-inner">
          🌿 BEM VINDO AO SEMENTE SAGRADA WORLD 🌿 &nbsp;&nbsp; ★ AS MELHORES SEMENTES DA GALÁXIA ★ &nbsp;&nbsp; 🔥 NOVIDADE: Lemza Haze Ultra chegou! 🔥 &nbsp;&nbsp; 💧 Regue sua planta enquanto passeia pela loja! 💧 &nbsp;&nbsp; 🌱 SEMENTES DE QUALIDADE SUPREMA 🌱 &nbsp;&nbsp; 😎 MELHOR VISTO EM NETSCAPE 4.0 | 800x600 😎 &nbsp;&nbsp;
        </span>
      </div>

      {currentView === 'home' ? (
      <>
        <div className="flex flex-col max-w-[1240px] mx-auto w-full px-2 mt-2 gap-3">
        {/* RESIZED TOP SEED SHOP (HORIZONTAL SCROLLABLE) */}
        <div className="bg-[#000d00] border-2 border-[#003300] p-4 rounded-lg backdrop-blur-xl relative overflow-hidden group/elite-section">
          {/* FLASHY BACKGROUND EFFECTS */}
          <div className="absolute inset-0 bg-transparent opacity-5 pointer-events-none mix-blend-screen scale-150"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/40 via-transparent to-green-900/40 pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff00] to-transparent animate-pulse"></div>

          <div className="flex items-center gap-6 px-4 overflow-x-auto horizontal-scroll-custom no-scrollbar relative z-10">
            {/* MATCHING SEED CARD SIZE & STYLE FOR HEADER (RESIZED SMALLER) */}
            <div 
              className="min-w-[160px] md:min-w-[200px] p-3 border-2 border-lime-500/20 bg-green-950/20 rounded-lg flex flex-col items-center justify-between relative overflow-hidden mr-4 shadow-inner cursor-pointer hover:border-lime-500/40 transition-all group/elite-header"
              onClick={() => {
                playSfx('click');
                const underworldItem = document.getElementById('underworld');
                if (underworldItem) underworldItem.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="absolute inset-0 bg-lime-500/5 opacity-0 group-hover/elite-header:opacity-100 transition-opacity"></div>
              <span className="vt text-[14px] md:text-[18px] text-lime-400 font-black whitespace-nowrap uppercase tracking-[0.1em] drop-shadow-[0_0_10px_rgba(0,255,0,0.3)] italic leading-none text-center mt-1">
                Sementes de Elite
              </span>
              
              <div className="w-full aspect-square flex items-center justify-center relative my-2 transform group-hover/elite-header:scale-110 transition-transform duration-500 border-2 border-red-500 bg-white">
                <img src="/gifs/elite_seed.gif" alt="elite-gif" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_#00ff00] scale-110 brightness-110" />
              </div>

              <div className="flex items-center gap-2 w-full justify-center mb-1">
                <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
                <span className="pixel text-[8px] text-yellow-400 font-black tracking-[0.2em] uppercase animate-pulse">
                  CATÁLOGO
                </span>
                <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
              </div>
            </div>
            {SEEDS.filter(seed => {
              if (!searchQuery) return true;
              const q = normalize(searchQuery);
              return (
                normalize(seed.name).includes(q) ||
                normalize(seed.subtitle).includes(q)
              );
            }).map((seed) => {
              const i = SEEDS.findIndex(s => s.id === seed.id);
              const variant = shopVariants[i] || { qty: 'X2', type: 'Feminizada' };
              const handleChangeQty = (e: React.ChangeEvent<HTMLSelectElement>) => {
                 e.stopPropagation();
                 setShopVariants(prev => ({ ...prev, [i]: { ...variant, qty: e.target.value as Quantity } }));
              };
              const handleChangeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
                 e.stopPropagation();
                 setShopVariants(prev => ({ ...prev, [i]: { ...variant, type: e.target.value as any } }));
              };

              return (
              <div 
                key={i} 
                className={`min-w-[220px] md:min-w-[280px] p-4 border-2 transition-all cursor-pointer rounded-xl flex flex-col justify-between relative group/seed-card overflow-hidden ${G.selSeed === i ? 'border-lime-500 bg-green-950/40 shadow-[0_0_25px_rgba(0,255,0,0.4)] scale-[1.01] z-20' : 'border-[#002200] opacity-80 hover:opacity-100 hover:bg-[#002200]/50 hover:border-lime-600'}`} 
                onClick={() => { 
                  playSfx('click'); 
                  if (!G.planted || G.harvested) {
                    setG(p => ({ ...p, selSeed: i, isAuto: variant.type === 'Automatica' }));
                  }
                  setSelectedSeedId(seed.id); 
                }}
              >
                {/* CARD BACKGROUND GLITCH EFFECT ON SELECTION */}
                {G.selSeed === i && (
                  <div className="absolute inset-0 bg-lime-500/5 animate-pulse pointer-events-none"></div>
                )}

                <div className="flex flex-col items-center mb-6 relative z-10">
                   {/* BIG IMAGE */}
                   <div className="w-full aspect-[4/3] bg-black/80 flex items-center justify-center border border-lime-500/20 mb-4 overflow-hidden rounded-lg relative group-hover/seed-card:border-lime-500/50 transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-t from-green-950/60 to-transparent z-0 opacity-60"></div>
                      <img src={`${window.location.origin}${seed.image}`} alt={seed.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover/seed-card:scale-125 relative z-10 border-4 border-yellow-500" />
                      
                      <div className="absolute top-2 right-2 z-20">
                         {G.selSeed === i && <div className="w-4 h-4 rounded-full bg-lime-500 animate-ping shadow-[0_0_15px_#00ff00]"></div>}
                      </div>
                   </div>
                   
                   <span className="vt text-[15px] font-black text-center leading-tight uppercase tracking-widest transition-all group-hover/seed-card:text-white group-hover/seed-card:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{color: G.selSeed === i ? 'white' : seed.color}}>
                      {seed.name}
                   </span>
                </div>
                
                <div className="flex flex-col gap-3 mt-auto relative z-10 bg-black/40 p-3 rounded-lg border border-green-900/30">
                  <div className="flex justify-between items-center text-[12px] vt">
                    <span className="text-lime-400/60 uppercase font-black tracking-tighter">TIPO</span>
                    <select value={variant.type} onClick={(e) => e.stopPropagation()} onChange={handleChangeType} className="bg-black text-lime-400 border border-green-800 rounded px-2 py-1 outline-none cursor-pointer text-[11px] font-black hover:border-lime-400 transition-colors focus:shadow-[0_0_10px_#00ff00]">
                      <option value="Feminizada">Feminizada</option>
                      <option value="Automatica">Automática</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center text-[12px] vt">
                    <span className="text-lime-400/60 uppercase font-black tracking-tighter">QTD</span>
                    <select value={variant.qty} onClick={(e) => e.stopPropagation()} onChange={handleChangeQty} className="bg-black text-lime-400 border border-green-800 rounded px-2 py-1 outline-none cursor-pointer text-[11px] font-black hover:border-lime-400 transition-colors focus:shadow-[0_0_10px_#00ff00]">
                      {QUANTITIES.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-between items-center vt mt-1 pt-3 border-t border-green-800/40">
                     <span className="text-white/40 uppercase font-black text-[11px] tracking-widest">PREÇO</span>
                     <span className="text-yellow-400 font-black tracking-[0.1em] text-lg drop-shadow-[0_0_10px_rgba(255,255,0,0.3)]">R$ {seed.prices[variant.qty]}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* MAIN GAME ZONE (ENLARGED) */}
        <div className={`game-retro-zone relative min-h-[650px] md:min-h-[850px] border-4 ${
          G.isIndoor 
            ? 'indoor border-[#00ffff] bg-[#000508]' 
            : isDay 
              ? 'border-[#00aa00] bg-gradient-to-b from-[#60a5fa] to-[#dbeafe]' 
              : 'border-[#004400] bg-gradient-to-b from-[#0f172a] to-[#020617]'
        } overflow-hidden rounded-xl shadow-2xl transition-all duration-[3000ms]`}>
          {/* HEADER HUD: DAY & PHASE */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1">
             <div className="vt text-[9px] bg-black/90 px-3 py-0.5 border border-lime-500 text-lime-400 rounded-full shadow-[0_0_10px_rgba(0,255,0,0.3)]">
                DIA {G.gameDay} | {(!G.planted && !G.harvested) ? 'ESPERANDO' : G.harvested ? 'COLHEITA' : s.stages[G.stage].toUpperCase()}
             </div>
          </div>

          {/* CULTIVATION NOTIFICATIONS (CONSOLIDATED AT TOP) */}
          <div className="absolute top-[75px] md:top-[90px] left-1/2 -translate-x-1/2 z-[60] w-full sm:w-[250px] px-2 flex flex-col items-center gap-1 pointer-events-none">
            {stageNotif && (
              <div className="bg-black/95 border-2 border-yellow-400 px-4 py-1 animate-bounce shadow-[0_0_20px_rgba(255,255,0,0.3)] text-center">
                <div className="vt text-xs text-yellow-300 tracking-wider font-bold">✨ {stageNotif}</div>
              </div>
            )}
            {tipNotif && (
               <div className="pointer-events-auto relative bg-cyan-900/90 border border-cyan-400 p-2 w-[180px] md:w-full fade-in shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                  <button 
                    className="absolute top-0 right-1 text-cyan-400 hover:text-white text-xs font-bold p-1 cursor-pointer" 
                    onClick={() => setTipNotif(null)}
                  >
                    X
                  </button>
                  <div className="vt text-[9px] text-cyan-50 leading-tight text-center mt-1">
                     <span className="text-cyan-300 font-black mr-1 block mb-1 border-b border-cyan-700/50 pb-0.5">TIPS:</span>
                     {tipNotif}
                  </div>
               </div>
            )}
          </div>

          {/* LEFT HUD: PLANT STATS (MICRO) */}
          <div className="absolute top-4 left-3 z-50 flex flex-col gap-1.5 w-[90px] pointer-events-none">
            {G.planted && !G.harvested && (
              <>
                <div className="bg-black/90 p-1 border border-green-900/50 rounded backdrop-blur-sm">
                  <div className="flex justify-between vt text-[7px] text-green-400 mb-0.5">
                    <span>HP</span>
                    <span>{hpct}%</span>
                  </div>
                  <div className="w-full h-1 bg-black border border-green-900 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{width: `${hpct}%`}}></div>
                  </div>
                </div>
                <div className="bg-black/90 p-1 border border-blue-900/50 rounded backdrop-blur-sm">
                  <div className="flex justify-between vt text-[7px] text-blue-400 mb-0.5">
                    <span>H2O</span>
                    <span>{Math.round(G.water)}%</span>
                  </div>
                  <div className="w-full h-1 bg-black border border-blue-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{width: `${G.water}%`}}></div>
                  </div>
                </div>
                <div className="bg-black/90 p-1 border border-orange-900/50 rounded backdrop-blur-sm">
                  <div className="flex justify-between vt text-[7px] text-orange-400 mb-0.5">
                    <span>NUT</span>
                    <span>{Math.round(G.nutrients)}%</span>
                  </div>
                  <div className="w-full h-1 bg-black border border-orange-900 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{width: `${G.nutrients}%`}}></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT HUD: ENVIRONMENT (MICRO) */}
          <div className="absolute top-4 right-3 z-50 flex flex-col gap-1 w-[100px]">
             <div className="bg-black/90 p-1 border border-cyan-900/50 rounded backdrop-blur-sm">
                <div className="vt text-[7px] text-cyan-400 flex justify-between items-center mb-1">
                   <span>TEMP</span>
                   <span className={G.temp > 28 || G.temp < 18 ? 'text-red-500 animate-pulse' : 'text-white'}>{G.temp.toFixed(1)}°C</span>
                </div>
                <div className="flex gap-1">
                   <button className="flex-1 bg-red-900/40 border border-red-500/20 text-[10px] py-0.5" onClick={() => setG(p => ({...p, temp: p.temp - 1}))}>-</button>
                   <button className="flex-1 bg-blue-900/40 border border-blue-500/20 text-[10px] py-0.5" onClick={() => setG(p => ({...p, temp: p.temp + 1}))}>+</button>
                </div>
                <div className="vt text-[7px] text-white flex justify-between items-center border-t border-white/5 mt-1 pt-1">
                   <span>PH:{G.ph.toFixed(1)}</span>
                   <div className="flex gap-1">
                      <button className="bg-yellow-900/40 px-1 border border-yellow-500/30" onClick={() => setG(p => ({...p, ph: Math.max(0, p.ph - 0.1)}))}>-</button>
                      <button className="bg-yellow-900/40 px-1 border border-yellow-500/30" onClick={() => setG(p => ({...p, ph: Math.min(14, p.ph + 0.1)}))}>+</button>
                   </div>
                </div>
             </div>
             <div className={`bg-black/90 p-1 border rounded backdrop-blur-sm transition-colors ${G.pests > 10 ? 'border-red-500' : 'border-purple-900'}`}>
                <div className="vt text-[7px] text-purple-400 text-center flex justify-between items-center mb-1">
                   <span>🪲 PRAGAS</span>
                   <span>{G.pests.toFixed(1)}</span>
                </div>
                <button className="w-full bg-purple-900/60 hover:bg-purple-800 border border-purple-500 text-[7px] py-0.5 vt uppercase" onClick={doClearPests}>LIMPAR</button>
             </div>
          </div>

          {/* SUN / MOON OVERLAY (inside game zone) */}
          <div className="absolute inset-0 z-[45] pointer-events-none overflow-hidden">
             {G.isIndoor ? (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse">💡</div>
             ) : (
                <>
                  {!isDay && (
                     <div className="absolute inset-0 bg-[url('/images/underworld_bg.png')] opacity-20 mix-blend-screen" style={{ backgroundSize: '200px' }} />
                  )}
                  {isDay ? (
                    <div 
                      className="absolute text-5xl drop-shadow-[0_0_20px_rgba(255,200,0,0.8)] spin-3d transition-all duration-[3000ms] ease-linear"
                      style={{
                        left: `${((G.clock - 360) / 840) * 100 - 10}%`,
                        top: `${Math.max(10, Math.abs(((G.clock - 360) / 840) - 0.5) * 100)}%`
                      }}
                    >
                      ☀️
                    </div>
                  ) : (
                    <div 
                      className="absolute text-4xl drop-shadow-[0_0_15px_rgba(200,220,255,0.8)] transition-all duration-[3000ms] ease-linear"
                      style={{
                        left: `${((G.clock >= 1200 ? G.clock - 1200 : G.clock + 240) / 600) * 100 - 5}%`,
                        top: `${Math.max(10, Math.abs(((G.clock >= 1200 ? G.clock - 1200 : G.clock + 240) / 600) - 0.5) * 80)}%`
                      }}
                    >
                      🌙
                    </div>
                  )}
                </>
             )}
          </div>

          {/* BUGS OVERLAY */}
          {G.pests > 10 && (
             <div className="absolute inset-0 z-[40] pointer-events-none overflow-hidden">
                {Array.from({ length: Math.floor(G.pests / 10) }).map((_, i) => (
                   <div 
                     key={i} 
                     className="absolute text-xl animate-bounce opacity-80"
                     style={{
                        left: `${15 + (Math.sin(i * 99) * 0.5 + 0.5) * 70}%`,
                        top: `${20 + (Math.cos(i * 77) * 0.5 + 0.5) * 60}%`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '1s'
                     }}
                   >
                     🐛
                   </div>
                ))}
             </div>
          )}

          {/* ACTION ANIMATIONS OVERLAY */}
          {actionAnim === 'water' && (
             <div className="absolute inset-x-0 top-10 h-64 z-[80] pointer-events-none">
                <div className="absolute left-1/2 -translate-x-1/2 top-4 animate-[wiggle_1s_ease-in-out_infinite] z-20">
                   <svg width="80" height="80" viewBox="0 0 64 64" className="drop-shadow-[0_0_15px_#00aaff]">
                      <path fill="#00aaff" d="M12,24 C10,24 8,26 8,28 L8,52 C8,54 10,56 12,56 L44,56 C46,56 48,54 48,52 L48,28 C48,26 46,24 44,24 L38,24 L38,20 C38,18 36,16 34,16 L22,16 C20,16 18,18 18,20 L18,24 L12,24 Z M22,20 L34,20 L34,24 L22,24 L22,20 Z" />
                      <path fill="#00ddff" d="M48,36 C52,36 56,38 56,42 C56,46 52,48 48,48 L48,36 Z" />
                      <path fill="#00ddff" d="M8,40 L4,36 C2,34 2,30 4,28 L14,18 L18,22 L10,30 L10,34 L8,40 Z" />
                   </svg>
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                   <div 
                     key={`drop-${i}`} 
                     className="absolute text-xl animate-bounce drop-shadow-[0_0_10px_#00ccff]"
                     style={{
                        left: `${45 + Math.random() * 10}%`,
                        top: `${40 + Math.random() * 30}%`,
                        animationDelay: `${Math.random() * 0.3}s`,
                        animationDuration: `${0.6 + Math.random() * 0.2}s`
                     }}
                   >
                     💧
                   </div>
                ))}
             </div>
          )}
          {actionAnim === 'fertilize' && (
             <div className="absolute inset-0 flex items-center justify-center z-[80] pointer-events-none">
                <div className="animate-bounce text-8xl drop-shadow-[0_0_20px_rgba(255,170,0,0.8)]" style={{animationDuration:'0.5s'}}>🧪</div>
             </div>
          )}
          {actionAnim === 'prune' && (
             <div className="absolute inset-0 flex items-center justify-center z-[80] pointer-events-none">
                <div className="animate-ping text-8xl drop-shadow-[0_0_20px_rgba(0,255,0,0.8)]" style={{animationDuration:'0.5s'}}>✂️</div>
             </div>
          )}
          {actionAnim === 'pests' && (
             <div className="absolute inset-0 flex items-center justify-center z-[80] pointer-events-none">
                <div className="animate-pulse text-8xl drop-shadow-[0_0_20px_rgba(255,0,255,0.8)]" style={{animationDuration:'0.3s'}}>💨</div>
             </div>
          )}

          {/* HARVEST EFFECT OVERLAY */}
          {G.showHarvestEffect && (
             <div className="absolute inset-0 z-[90] pointer-events-none overflow-hidden bg-black/40 backdrop-blur-sm">
                {/* Fireworks */}
                {Array.from({ length: 25 }).map((_, i) => (
                   <div 
                     key={`fw-${i}`} 
                     className="absolute animate-[ping_1s_ease-out_infinite]"
                     style={{
                        left: `${5 + Math.random() * 90}%`,
                        top: `${5 + Math.random() * 80}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        fontSize: `${30 + Math.random() * 60}px`
                     }}
                   >
                     {['🎆', '🎇', '✨', '💥'][Math.floor(Math.random() * 4)]}
                   </div>
                ))}
                {/* Big Cannabis Buds Bouncing */}
                {Array.from({ length: 40 }).map((_, i) => (
                   <div 
                     key={`bud-${i}`} 
                     className="absolute animate-bounce drop-shadow-[0_0_20px_#00ff00]"
                     style={{
                        left: `${Math.random() * 95}%`,
                        top: `${-10 + Math.random() * 70}%`,
                        animationDelay: `${Math.random() * 1.5}s`,
                        animationDuration: `${1 + Math.random() * 1.5}s`,
                        fontSize: `${40 + Math.random() * 80}px`,
                        filter: `hue-rotate(${Math.random() * 60 - 30}deg)`
                     }}
                   >
                     {['🥦', '🌿', '🌲', '🪴'][Math.floor(Math.random() * 4)]}
                   </div>
                ))}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                   <div className="vt text-6xl md:text-8xl text-yellow-300 font-black drop-shadow-[0_0_40px_rgba(255,255,0,0.8)] text-center px-4 leading-none animate-[wiggle_0.5s_ease-in-out_infinite]">
                       COLHEITA<br/><span className="text-lime-400">GIGANTE!</span>
                   </div>
                </div>
             </div>
          )}

          {/* GARDEN VIEW (CANVAS AREA) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pt-2 pb-24">
            <canvas ref={canvasRef} className="cursor-crosshair max-h-full" />
          </div>

          {/* ACTION BAR (BOTTOM OVERLAY) */}
          <div className="absolute bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2">
            
            {!G.planted || G.harvested ? (
               <button className="w-full py-4 bg-green-700 hover:bg-green-600 text-white font-bold vt text-2xl border-b-6 border-green-900 transition-all active:translate-y-1 shadow-2xl animate-pulse" onClick={(e) => { playSfx('click'); doPlant(); }}>
                  🌱 PLANTAR {s.name.toUpperCase()}
               </button>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-3 px-1">
                  <button className={`py-4 rounded-lg border-b-[6px] vt flex flex-col items-center justify-center gap-1 ${G.watered ? 'opacity-30 bg-black' : 'bg-blue-900 border-blue-950 shadow-[0_6px_0_rgba(0,0,0,0.7)] hover:scale-105 transition-transform'}`} onClick={(e) => { playSfx('click'); doWater(); }} disabled={G.watered}>
                     <span className="text-2xl">💧</span>
                     <span className="text-base font-black uppercase tracking-tighter">Regar</span>
                  </button>
                  <button className={`py-4 rounded-lg border-b-[6px] vt flex flex-col items-center justify-center gap-1 ${G.fertilized ? 'opacity-30 bg-black' : 'bg-orange-900 border-orange-950 shadow-[0_6px_0_rgba(0,0,0,0.7)] hover:scale-105 transition-transform'}`} onClick={(e) => { playSfx('click'); doFertilize(); }} disabled={G.fertilized}>
                     <span className="text-2xl">🧪</span>
                     <span className="text-base font-black uppercase tracking-tighter">Adubar</span>
                  </button>
                  <button className={`py-4 rounded-lg border-b-[6px] vt flex flex-col items-center justify-center gap-1 ${G.pruned || G.stage < 2 ? 'opacity-30 bg-black' : 'bg-green-900 border-green-950 shadow-[0_6px_0_rgba(0,0,0,0.7)] hover:scale-105 transition-transform'}`} onClick={(e) => { playSfx('click'); doPrune(); }} disabled={G.stage < 2 || G.pruned}>
                     <span className="text-2xl">✂️</span>
                     <span className="text-base font-black uppercase tracking-tighter">Podar</span>
                  </button>
                  {G.stage >= 5 ? (
                    <button className="py-4 rounded-lg border-b-[6px] vt text-lg font-black uppercase bg-red-700 border-red-950 animate-pulse shadow-xl" onClick={(e) => { playSfx('click'); doHarvest(); }}>
                      Colher
                    </button>
                  ) : (
                    <button onClick={() => setG(p => ({...p, isIndoor: !p.isIndoor}))} className="py-4 rounded-lg border-b-[6px] vt text-sm font-black uppercase bg-gray-700 border-gray-900 shadow-lg">
                      {G.isIndoor ? '🌻 OUT' : '🏠 IN'}
                    </button>
                  )}
                </div>
                <div className="bg-black/95 p-4 h-[50px] flex items-center justify-center rounded-xl border-4 border-[#006600] shadow-[inset_0_0_20px_rgba(0,255,0,0.4)]">
                   <div className="vt text-[20px] text-lime-400 truncate font-black uppercase tracking-[0.15em]">
                      {logs.length > 0 ? logs[logs.length-1].msg : 'SISTEMA OPERACIONAL'}
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* POPUP OVERLAY */}
          {popup && (
            <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-6">
              <div className="bg-[#001800] border-4 border-double border-green-500 p-6 max-w-sm w-full shadow-[0_0_30px_rgba(0,255,0,0.3)]">
                <div className="pixel text-[9px] text-yellow-300 mb-3 border-b border-[#004400] pb-2 uppercase tracking-widest">{popup.title}</div>
                <div className="vt text-[14px] text-[var(--lime)] leading-relaxed">{popup.body}</div>
                <div className="text-right mt-4"><button className="pixel text-[10px] bg-green-900 px-4 py-2 text-white border border-green-500 hover:bg-green-700" onClick={() => setPopup(null)}>FECHAR</button></div>
              </div>
            </div>
          )}
        </div>
      </div>

      
      {/* ========================================================= */}
      {/* PORTAL TO THE UNDERWORLD                                 */}
      {/* ========================================================= */}
      <div className="w-full bg-[#000] py-8 border-y-[6px] border-double border-[#660066]">
          <div className="text-center">
              <div className="pixel text-lg text-purple-400 animate-pulse">▼▼▼ DESCENDO ÀS RAÍZES ▼▼▼</div>
              <div className="text-[#330033] my-2">〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️</div>
              <a href="#underworld" className="pixel text-sm text-[#ff00ff] hover:text-white border-2 border-[#ff00ff] px-4 py-2 bg-[#110011]">IR PARA O UNDERWORLD</a>
          </div>
      </div>

      {/* ========================================================= */}
      {/* ELITE SEED SHOP CATALOG (HERBIES STYLE - DARK WEB UX)      */}
      {/* ========================================================= */}
      <div id="underworld" className="w-full bg-[#050505] border-t-8 border-double border-[#ff00ff] relative">


        {/* HERO BANNER SECTION */}
        <div className="w-full bg-[#0a000a] relative overflow-hidden py-16 lg:py-24 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] border-b-8 border-double border-[#ff00ff]">
           {/* Retro Hacker/Cyberspace Background */}
           <div className="absolute inset-0 bg-transparent opacity-[0.15] pointer-events-none mix-blend-screen scale-150 transform"></div>
           
           <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between relative z-20">
              <div className="text-white max-w-xl text-center md:text-left mb-12 md:mb-0">
                 <div className="bg-[#ff00ff] text-white inline-block px-4 py-1 mb-8 font-bold pixel text-lg shadow-[4px_4px_0px_#00ff00] border-2 border-white -rotate-2">
                    LENDAS DA CAIXA FORTE
                 </div>
                 <h2 className="vt text-4xl md:text-5xl lg:text-6xl mb-6 font-black tracking-widest drop-shadow-[3px_3px_0px_#ff00ff] leading-none text-lime-400 uppercase">
                   A GENÉTICA QUE O SISTEMA <span className="text-white underline decoration-wavy decoration-yellow-400">ESCONDEU</span>
                 </h2>
                 <p className="vt text-lg md:text-xl mb-10 text-[#ccc] drop-shadow-[2px_2px_0px_#000] tracking-wider bg-black/60 p-5 border-l-4 border-lime-500">
                   Desbloqueie o catálogo secreto. Entrega stealth, 
                   brindes em cada drop e a garantia de quem está na cena desde 1999.
                 </p>
                 <button 
                   className="bg-lime-500 text-black px-10 py-5 font-black pixel text-xl hover:bg-white active:translate-y-1 transition-all shadow-[6px_6px_0px_#ff00ff] uppercase"
                   onClick={() => {
                     playSfx('click');
                     const el = document.getElementById('catalog');
                     if (el) el.scrollIntoView({ behavior: 'smooth' });
                   }}
                 >
                    ACESSAR O ARQUIVO
                 </button>
                 <div className="mt-8 flex items-center justify-center md:justify-start gap-3 bg-black/40 inline-flex px-4 py-2 border border-white/10 rounded-sm">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse box-shadow-[0_0_5px_#ff0000]"></div>
                   <p className="vt text-xs opacity-70 uppercase tracking-widest text-[#fff] font-bold">FRETE GRÁTIS EM PEDIDOS ACIMA DE R$ 200</p>
                 </div>
              </div>
              <div className="relative w-full max-w-[400px] h-[300px]">
                 {/* Retro Hero Composition */}
                 <div className="absolute inset-0 bg-lime-500/10 blur-[50px] rounded-full"></div>
                 <img src={`${window.location.origin}/gifs/elite_seed.gif`} className="absolute right-0 top-1/2 -translate-y-1/2 w-[280px] lg:w-[380px] drop-shadow-[0_0_40px_rgba(255,0,255,0.4)] pixelate z-10 hover:scale-[1.02] transition-transform duration-500" alt="Hero Mascot" />
                 <img src="/images/verde_escura.png" className="absolute left-0 lg:-left-12 top-0 w-[90px] drop-shadow-xl animate-[bounce_4s_infinite] pixelate z-20 bg-lime-500/10 rounded-full p-2 border-2 border-lime-500/30 backdrop-blur-sm" alt="Floating Seed" />
                 <img src="/images/roxa.png" className="absolute right-10 -bottom-12 w-[110px] drop-shadow-xl animate-[pulse_3s_infinite] pixelate z-20 bg-pink-500/10 rounded-full p-2 border-2 border-[#ff00ff]/30 backdrop-blur-sm hover:rotate-180 transition-transform duration-1000" alt="Floating Seed 2" />
              </div>
           </div>
           
           {/* DECORATIVE OVERLAY */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-30"></div>
        </div>

        {/* INFO PERKS (TRUST BADGES) - RETRO/DARK THEME */}
        <div className="bg-[#0a0a0a] border-y border-white/10 w-full py-8 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)] relative z-10">
           <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                {text: 'Entrega sigilosa e garantida para todo o Brasil', bg: 'bg-[#151515]', icon: '🚚'},
                {text: 'Sempre enviamos um brinde genético extra', bg: 'bg-[#151515]', icon: '🎁'},
                {text: 'Cobertura de reposição em até 12 meses', bg: 'bg-[#151515]', icon: '🛡️'},
                {text: 'Time de growers pronto para ajudar no cultivo', bg: 'bg-[#151515]', icon: '💬'},
                {text: 'Pix fácil ou checkout anônimo via criptomoedas', bg: 'bg-[#151515]', icon: '💳'}
              ].map((perk, i) => (
                 <div key={i} className={`flex-1 ${perk.bg} border border-white/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:border-lime-500/50 hover:bg-[#1a1a1a] transition-all cursor-pointer group`}>
                    <p className="vt text-white/70 text-[11px] md:text-xs font-bold leading-relaxed text-center md:text-left uppercase group-hover:text-white transition-colors">{perk.text}</p>
                    <div className="text-2xl md:text-3xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{perk.icon}</div>
                 </div>
              ))}
           </div>
        </div>

        {/* ========================================================= */}
        {/* NEW IMPACTful CTAs: MEDICAL & LEGAL CULTIVATION           */}
        {/* ========================================================= */}
        <div className="w-full bg-black py-16 px-4 relative overflow-hidden z-10">
           <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* MEDICAL CONSULTATION CTA */}
              <div 
                className="relative group overflow-hidden rounded-[2rem] border-4 border-[#222] bg-[#050505] p-8 md:p-12 transition-all hover:border-lime-500 hover:shadow-[0_0_50px_rgba(132,204,22,0.15)] cursor-pointer"
                onClick={() => {
                  playSfx('click');
                  setPopup({
                    title: 'PRESCRIÇÃO MÉDICA & AUTORIZAÇÃO',
                    body: (
                      <div className="p-8 text-white sans text-sm leading-relaxed space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-16 h-16 bg-lime-500/20 rounded-2xl flex items-center justify-center text-3xl border border-lime-500/30">🩺</div>
                           <h4 className="text-xl font-bold text-lime-400">ACESSO MEDICINAL IMEDIATO</h4>
                        </div>
                        <p className="opacity-80">
                          Conectamos você com médicos especialistas no Sistema Endocanabinoide para obtenção de <b>Receita Médica e Laudo</b> conforme as normas da ANVISA.
                        </p>
                        <p className="opacity-80">
                          Este é o primeiro passo crucial para quem busca o cultivo legal através de <b>Habeas Corpus</b> ou importação autorizada.
                        </p>
                        <ul className="space-y-2 mt-4 text-lime-100">
                          <li>✦ Consulta 100% Online</li>
                          <li>✦ Cadastro Imediato no Sistema</li>
                          <li>✦ Suporte Jurídico Preliminar</li>
                        </ul>
                        <div className="pt-6">
                           <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="block w-full bg-lime-500 text-black text-center font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-white transition-all">
                              FALAR COM ESPECIALISTA AGORA
                           </a>
                        </div>
                      </div>
                    )
                  });
                }}
              >
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Globe size={180} strokeWidth={0.5} />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                       <span className="bg-lime-500 text-black vt text-[11px] font-black px-3 py-1 rounded shadow-lg uppercase tracking-wider">ON-LINE 24H</span>
                       <span className="text-white/30 vt text-[10px] uppercase font-bold tracking-widest">Protocolo Health</span>
                    </div>
                    <h3 className="pixel text-3xl md:text-4xl text-white mb-4 leading-tight">
                       PRECISA DE <br/>
                       <span className="text-lime-500">RECEITA MÉDICA?</span>
                    </h3>
                    <p className="vt text-[#888] text-sm md:text-lg mb-8 leading-relaxed max-w-[320px]">
                       Conecte-se com médicos especializados e obtenha sua autorização legal agora mesmo.
                    </p>
                    <div className="flex items-center gap-4 text-lime-500 font-bold vt text-lg hover:translate-x-2 transition-transform">
                       <span>AGENDAR CONSULTA AGORA</span>
                       <ChevronRight size={24} />
                    </div>
                 </div>
              </div>

              {/* LEGAL CULTIVATION COURSE CTA */}
              <div 
                className="relative group overflow-hidden rounded-[2rem] border-4 border-[#222] bg-[#050505] p-8 md:p-12 transition-all hover:border-[#ff00ff] hover:shadow-[0_0_50px_rgba(255,0,255,0.15)] cursor-pointer"
                onClick={() => {
                  playSfx('click');
                  setPopup({
                    title: 'MASTERCLASS: CULTIVO LEGAL & AUTOSSUSTENTÁVEL',
                    body: (
                      <div className="p-8 text-white sans text-sm leading-relaxed space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-16 h-16 bg-[#ff00ff]/20 rounded-2xl flex items-center justify-center text-3xl border border-[#ff00ff]/30">🎓</div>
                           <h4 className="text-xl font-bold text-[#ff00ff]">PRODUZA SEU PRÓPRIO REMÉDIO</h4>
                        </div>
                        <p className="opacity-80">
                          Aprenda a cultivar de forma <b>100% Legalizada e Segura</b> dentro da sua própria casa. Nosso curso completo ensina desde a montagem do setup até os trâmites do <b>Habeas Corpus</b>.
                        </p>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                           <span className="text-[#ff00ff] font-bold block mb-1">MÓDULOS INCLUÍDOS:</span>
                           <ul className="text-xs space-y-1 opacity-70">
                              <li>• Botanica & Genética Avançada</li>
                              <li>• Extrações Medicinais Seguras</li>
                              <li>• Defesa Jurídica & Direitos do Cultivador</li>
                           </ul>
                        </div>
                        <div className="pt-6">
                           <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="block w-full bg-[#ff00ff] text-white text-center font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">
                              ACESSAR O CURSO COMPLETO
                           </a>
                        </div>
                      </div>
                    )
                  });
                }}
              >
                 <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                    <img src="/images/vermelho_com_verde.png" className="w-48 h-48 pixelate" alt="Course mascot" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                       <span className="bg-[#ff00ff] text-white vt text-[11px] font-black px-3 py-1 rounded shadow-lg uppercase tracking-wider">ENSINO ALPHA</span>
                       <span className="text-white/30 vt text-[10px] uppercase font-bold tracking-widest">Masterclass 2024</span>
                    </div>
                    <h3 className="pixel text-3xl md:text-4xl text-white mb-4 leading-tight">
                       CULTIVO <br/>
                       <span className="text-[#ff00ff]">LEGAL EM CASA</span>
                    </h3>
                    <p className="vt text-[#888] text-sm md:text-lg mb-8 leading-relaxed max-w-[320px]">
                       Produza seu próprio medicamento legalizado. Aprenda a arte do autossustento consciente.
                    </p>
                    <div className="flex items-center gap-4 text-[#ff00ff] font-bold vt text-lg hover:translate-x-2 transition-transform">
                       <span>APRENDER A CULTIVAR</span>
                       <ChevronRight size={24} />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 relative z-10 text-center pt-24">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-8 gap-4 border-b border-[#333] pb-4">
             <div className="text-left">
               <h2 className="pixel text-3xl md:text-4xl text-lime-400 tracking-widest uppercase mb-2" style={{textShadow: "2px 2px #ff00ff"}}>
                 O Cofre de Genéticas
               </h2>
               <p className="vt text-[#888] text-sm tracking-[0.2em] font-bold uppercase">Acesso Liberado • Qualidade 100% Garantida</p>
             </div>
             <button className="vt text-xs text-white/50 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">Visualizar o cofre completo <span>&gt;</span></button>
          </div>

          {/* MELHORES COLEÇÕES (QUICK LINKS) */}
          <div className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: '♀️', label: 'Feminizadas' },
                { icon: '💣', label: 'Alto THC' },
                { icon: '⚡', label: 'Flora Rápida' },
                { icon: '⚖️', label: 'Rendimento' },
                { icon: '🛋️', label: 'Indica' },
                { icon: '🌴', label: 'Sativa' },
                { icon: '🏠', label: 'Ambiente Interno' },
                { icon: '🌲', label: 'Ambiente Externo' }
              ].map((col, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveFilter(activeFilter === col.label ? null : col.label)}
                  className={`bg-[#111] hover:bg-lime-500/10 border transition-all p-4 rounded-sm flex flex-col items-center justify-center gap-3 cursor-pointer shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] group ${activeFilter === col.label ? 'border-lime-500 bg-lime-500/20' : 'border-[#222] hover:border-lime-500'}`}
                >
                   <span className="text-3xl group-hover:scale-110 group-hover:-rotate-6 transition-transform grayscale group-hover:grayscale-0 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{col.icon}</span>
                   <span className={`vt text-xs text-center leading-tight uppercase font-bold tracking-wider ${activeFilter === col.label ? 'text-lime-400' : 'text-white/50 group-hover:text-lime-400'}`}>{col.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-left mb-6">
            <h3 className="vt text-2xl text-white font-bold mb-4 uppercase tracking-widest">Sementes Mais Procuradas da Deep Web</h3>
            {/* FILTERS */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { id: 'Alto THC', label: 'Alto THC', icon: <span className="w-2 h-2 rounded-full bg-lime-500 box-shadow-[0_0_5px_#00ff00]"></span> },
                { id: 'Para iniciantes', label: 'Para iniciantes', icon: <span>🌱</span> },
                { id: 'Rendimento', label: 'Grandes Rendimentos', icon: <span>⚖️</span> },
                { id: 'Ambiente Interno', label: 'Ambiente Interno', icon: <span>🏠</span> },
                { id: 'Ambiente Externo', label: 'Ambiente Externo', icon: <span>🌲</span> }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                  className={`vt text-xs px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${activeFilter === f.id ? 'bg-lime-500 text-black border border-lime-500' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'}`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* SHOP CATEGORIES (Now flattened into one big grid for this section) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16 text-left" id="catalog">
            {SEEDS.filter(seed => {
              // Priority search match
              if (searchQuery) {
                const q = normalize(searchQuery);
                const matchesSearch = 
                  normalize(seed.name).includes(q) || 
                  normalize(seed.subtitle).includes(q) || 
                  normalize(seed.effect).includes(q) ||
                  normalize(seed.aroma).includes(q) ||
                  (seed.genetic && normalize(seed.genetic).includes(q));
                if (!matchesSearch) return false;
              }

              if (!activeFilter) return true;
              switch (activeFilter) {
                case 'HighBreed Seeds': return true;
                case 'Bancos de Genética': return true;
                case 'Coleções': return true;
                case 'Alto THC': return seed.isHighThc;
                case 'Para iniciantes': return seed.isBeginnerFriendly;
                case 'Rendimento': return seed.isHighYield;
                case 'Ambiente Interno': return seed.isIndoor;
                case 'Ambiente Externo': return seed.isOutdoor;
                case 'Flora Rápida': return seed.isFastFlowering;
                case 'Indica': return seed.genetic === 'Indica';
                case 'Sativa': return seed.genetic === 'Sativa';
                case 'Feminizadas': return true; // everything has feminizada
                case 'Automática': return true; // everything has auto
                case 'Growers Choice': return seed.badge === 'TOP';
                default: return true;
              }
            }).map((seed) => {
              const i = SEEDS.findIndex(s => s.id === seed.id);
              const variant = shopVariants[i] || { qty: 'X2', type: 'Feminizada' };
              const setVariantQty = (q: Quantity) => setShopVariants(prev => ({...prev, [i]: {...variant, qty: q}}));
              const setVariantType = (t: 'Feminizada' | 'Automatica') => setShopVariants(prev => ({...prev, [i]: {...variant, type: t}}));
              
              const isAuto = variant.type === 'Automatica';
              const specs = isAuto ? seed.auto : seed.fem;

              return (
              <div 
                key={seed.id} 
                id={`seed-${seed.id}`}
                className="group bg-[#0a0a0a] border border-[#222] rounded-xl p-0 relative transition-all hover:border-[#ff00ff]/50 hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
              >
                {/* TOP BADGES */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-30">
                  <span className="bg-blue-600 text-white vt text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase shadow-[0_0_5px_#0000ff]">Garantia 1 ano</span>
                  <span className="bg-lime-600 text-black vt text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase shadow-[0_0_5px_#00ff00]">{seed.badge}</span>
                  {specs.thc > 20 && <span className="bg-[#ff00ff] text-white vt text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase shadow-[0_0_5px_#ff00ff]">Top</span>}
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-2 z-30">
                  <button 
                    className={`transition-colors p-1.5 rounded-full backdrop-blur-sm ${favorites.includes(String(seed.id)) ? 'text-pink-500 bg-pink-500/20' : 'text-white/30 hover:text-pink-500 bg-black/40'}`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) { setIsAuthOpen(true); return; }
                      const isFav = favorites.includes(String(seed.id));
                      const strId = String(seed.id);
                      
                      setFavorites(prev => isFav ? prev.filter(f => f !== strId) : [...prev, strId]);
                      
                      try {
                        if (isFav) {
                          await deleteDoc(doc(db, `users/${user.uid}/favorites/${seed.id}`));
                        } else {
                          await setDoc(doc(db, `users/${user.uid}/favorites/${seed.id}`), {
                            seedId: strId,
                            addedAt: Date.now()
                          });
                        }
                      } catch (err) {
                        setFavorites(prev => !isFav ? prev.filter(f => f !== strId) : [...prev, strId]);
                        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/favorites/${seed.id}`);
                      }
                    }}
                  >
                    <Heart size={20} fill={favorites.includes(String(seed.id)) ? 'currentColor' : 'none'} />
                  </button>
                  <button className="text-white/30 hover:text-lime-400 p-1.5 bg-black/40 rounded-full transition-colors"><ListFilter size={20} /></button>
                </div>

                {/* IMAGE AREA AND TITLE (CLICKABLE) */}
                <div className="cursor-pointer group flex flex-col flex-1" onClick={() => setSelectedSeedId(seed.id)}>
                    <div className="relative aspect-square bg-gradient-to-b from-[#111] to-[#050505] flex flex-col items-center justify-center border-b border-[#222] overflow-hidden">
                      <div className="absolute inset-0 bg-transparent opacity-[0.05] mix-blend-screen pointer-events-none"></div>
                      
                      <img 
                        src={seed.image} 
                        alt={seed.name} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out relative z-10 group-hover:scale-110 origin-center" 
                      />
                    
                    {/* OVERLAPPING THC TAG */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#ff00ff] text-white pixel text-[9px] px-3 py-1.5 rounded-full border border-black shadow-[0_0_10px_rgba(255,0,255,0.6)] z-20 whitespace-nowrap">
                      {specs.thc}% THC
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="pt-6 px-5 flex flex-col text-center bg-[#0d0d0d]">
                    <h4 className="font-sans text-base md:text-lg font-bold text-white mb-1 group-hover:text-lime-400 transition-colors min-h-[40px] flex items-center justify-center">
                      {seed.name} <span className="text-[#666] font-normal ml-1">({isAuto ? 'Auto' : 'Fem'})</span>
                    </h4>
                    <p className="font-sans text-xs text-gray-300 mb-2 leading-tight min-h-[30px] line-clamp-2 px-2" title={seed.flavorProfile}>{seed.flavorProfile}</p>
                  </div>
                </div>
                
                <div className="px-5 pb-5 flex flex-col text-center bg-[#0d0d0d] mt-auto">
                  {/* RATING */}
                  <div className="flex justify-center items-center gap-2 mb-3">
                    <span className="text-yellow-400 text-xs text-nowrap">
                      {seed.rating === '5.0' ? '★★★★★' : '★★★★½'}
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 font-bold">
                      {seed.rating || '5.0'} ({seed.reviews || 0})
                    </span>
                  </div>

                  {/* TAGS (TYPE) */}
                  <div className="flex justify-center gap-2 mb-5">
                    <span className="font-sans text-[10px] text-gray-400 uppercase tracking-widest pt-1">{seed.type}</span>
                    <button onClick={() => setVariantType('Feminizada')} className={`font-sans text-[10px] uppercase tracking-widest px-2 py-1 rounded border transition-colors ${variant.type === 'Feminizada' ? 'border-[#00ff00] text-[#00ff00] bg-[#00ff00]/10 font-bold' : 'border-[#333] text-gray-500 hover:border-lime-500'}`}>
                       Feminizada
                    </button>
                    <button onClick={() => setVariantType('Automatica')} className={`font-sans text-[10px] uppercase tracking-widest px-2 py-1 rounded border transition-colors ${variant.type === 'Automatica' ? 'border-[#ff00ff] text-[#ff00ff] bg-[#ff00ff]/10 font-bold' : 'border-[#333] text-gray-500 hover:border-lime-500'}`}>
                       Auto
                    </button>
                  </div>

                  {/* PACK SELECTOR */}
                  <div className="mt-auto">
                    <p className="font-sans text-[10px] text-gray-500 mb-3 uppercase tracking-widest font-semibold">Pacote (número de sementes)</p>
                    <div className="flex flex-wrap justify-center gap-1.5 mb-5 w-full">
                      {QUANTITIES.map(q => (
                        <button 
                          key={q}
                          onClick={() => setVariantQty(q)}
                          className={`flex-1 min-w-[35px] max-w-[45px] h-8 rounded border font-sans text-xs font-bold flex items-center justify-center transition-colors ${variant.qty === q ? 'border-lime-500 bg-lime-500/10 text-lime-400 shadow-[0_0_10px_rgba(0,255,0,0.1)]' : 'border-[#222] hover:border-lime-500 text-gray-400 hover:text-white bg-[#111]'}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    
                    <div className="pixel text-2xl text-yellow-400 mb-4">R$ {seed.prices[variant.qty]}</div>
                    
                    <button 
                      className="w-full bg-[#ffcc00] hover:bg-white text-black font-black vt text-sm uppercase py-3 rounded-full transition-all shadow-[0_0_15px_rgba(255,204,0,0.5)] active:scale-95"
                      onClick={() => {
                        playSfx('click');
                        setSelectedSeedId(seed.id);
                      }}
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>

          {/* PARA INICIANTES & PROMOS */}
          <div className="mb-24 text-left">
            <h3 className="vt text-3xl text-white font-bold mb-6 flex items-center gap-3">
              Para iniciantes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div 
                onClick={() => { 
                  setCurrentView('manual');
                  setTimeout(() => {
                    const el = document.getElementById('step-2');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] p-5 rounded-2xl relative overflow-hidden group cursor-pointer shadow-sm"
              >
                <div className="absolute right-0 bottom-0 pointer-events-none w-1/2 h-[120%] flex items-end justify-end"><img src="/gifs/elite_seed.gif" className="h-[90%] object-contain" alt="mascot" /></div>
                <div className="relative z-10 w-2/3">
                  <h4 className="font-bold text-[#0f172a] text-lg leading-tight mb-2">Descubra sua Genética</h4>
                  <p className="text-xs text-[#334155] mb-4">Faça um teste rápido e ache a planta perfeita para o seu primeiro cultivo</p>
                  <button 
                    className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#78350f] text-xs font-bold py-2 px-4 rounded-full transition-colors shadow-sm"
                  >
                    Iniciar Teste
                  </button>
                </div>
              </div>

              <div 
                onClick={() => setCurrentView('manual')}
                className="bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] p-5 rounded-2xl relative overflow-hidden group cursor-pointer shadow-sm"
              >
                <div className="absolute -right-2 -bottom-2 pointer-events-none text-8xl opacity-80 mix-blend-multiply flex items-end justify-end">🌱</div>
                <div className="relative z-10 w-2/3">
                  <h4 className="font-bold text-[#064e3b] text-lg leading-tight mb-2">Manual do Cultivador</h4>
                  <p className="text-xs text-[#065f46] mb-4">Passo a passo: do momento da germinação até a sua primeira colheita</p>
                  <button className="border border-[#10b981] text-[#047857] hover:bg-[#10b981] hover:text-white text-xs font-bold py-2 px-4 rounded-full transition-colors">Ler Manual</button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] p-5 rounded-2xl relative overflow-hidden group cursor-pointer shadow-sm">
                <div className="absolute right-[-10px] bottom-[-10px] pointer-events-none w-2/5 flex items-end justify-end opacity-90"><img src="/images/vermelho_com_verde.png" className="w-full object-contain mix-blend-multiply" alt="cactus" /></div>
                <div className="relative z-10 w-3/4">
                  <h4 className="font-bold text-[#1f2937] text-lg leading-tight mb-2">Genéticas Resistentes</h4>
                  <p className="text-xs text-[#4b5563] mb-4">As melhores e mais fortes variedades para quem está começando agora</p>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('underworld');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="border border-[#10b981] text-[#047857] hover:bg-[#10b981] hover:text-white text-xs font-bold py-2 px-4 rounded-full transition-colors"
                  >
                    Ver Variedades
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] p-5 rounded-2xl relative overflow-hidden group cursor-pointer shadow-sm">
                <div className="absolute right-0 bottom-0 pointer-events-none w-1/2 flex items-end justify-end opacity-80"><span className="text-8xl mix-blend-multiply">⚖️</span></div>
                <div className="relative z-10 w-2/3">
                  <h4 className="font-bold text-[#1f2937] text-lg leading-tight mb-2">Dúvidas sobre Envio?</h4>
                  <p className="text-xs text-[#4b5563] mb-4">Entenda como funciona nossa entrega 100% discreta e com garantia genética.</p>
                  <button 
                    onClick={() => setPopup({
                      title: "Política de Envio",
                      body: (
                        <div className="flex flex-col gap-4 text-[#333]">
                           <p><strong>Entrega 100% Discreta:</strong> Seu pedido será enviado em embalagem neutra, sem qualquer menção ao conteúdo ou à nossa marca no exterior do pacote.</p>
                           <p><strong>Garantia de Germinação:</strong> Trabalhamos com genéticas premium rigorosamente testadas. Caso as sementes não germinem seguindo nosso manual, oferecemos reposição.</p>
                           <p><strong>Prazo de Entrega:</strong> Depende da modalidade escolhida no carrinho. Envios expressos costumam chegar em 2 a 5 dias úteis, enquanto envio normal pode levar de 5 a 12 dias úteis.</p>
                           <p><strong>Seguro Incondicional:</strong> Se a sua encomenda for extraviada ou sofrer qualquer dano durante o trajeto, arcaremos com um novo envio por nossa conta.</p>
                        </div>
                      )
                    })}
                    className="border border-[#10b981] text-[#047857] hover:bg-[#10b981] hover:text-white text-xs font-bold py-2 px-4 rounded-full transition-colors"
                  >
                    Ler Política
                  </button>
                </div>
              </div>
            </div>

            {/* PROMOS SECTION */}
            <div id="promos" className="bg-gradient-to-br from-[#e0f1eb] to-[#d6eade] rounded-[32px] p-8 flex flex-col xl:flex-row gap-8 shadow-sm text-[#333]">
              <div className="xl:w-1/4 flex flex-col justify-center">
                 <h3 className="text-xl font-bold text-[#455a64] mb-2 uppercase tracking-wide">Promos</h3>
                 <h4 className="text-4xl md:text-5xl font-black text-[#111827] leading-tight mb-6 tracking-tight">Condições<br/>Insanas</h4>
                 <button className="bg-transparent border border-[#059669] text-[#047857] hover:bg-[#059669] hover:text-white font-bold text-sm px-6 py-3 rounded-full transition-colors self-start w-max">Ver todas as promos</button>
              </div>

              <div className="xl:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Promo Card 1 */}
                 <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="h-40 bg-[#429d98] relative flex overflow-hidden">
                       <div className="p-6 font-black text-white text-3xl leading-none z-10 flex flex-col justify-center drop-shadow-md">
                          <span>3+1</span>
                          <span>5+2</span>
                          <span>10+4</span>
                       </div>
                       <div className="absolute right-0 bottom-0 w-[60%] h-full flex items-end justify-end"><img src="/gifs/elite_seed.gif" alt="Promo" className="h-[120%] object-contain" /></div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col text-left">
                       <h5 className="font-bold text-[#1f2937] text-lg mb-2 leading-tight">Bônus Semente Sagrada World</h5>
                       <p className="text-[#4b5563] text-xs leading-relaxed mb-4 flex-1">Leve mais pagando menos: a cada 3 seeds, a 4ª é por nossa conta. Aproveite a seleção promocional.</p>
                       <span className="text-[#059669] text-xs font-bold mt-auto hover:underline cursor-pointer">Mais informações</span>
                    </div>
                 </div>

                 {/* Promo Card 2 */}
                 <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="h-40 bg-gradient-to-r from-[#4a004a] to-[#7a007a] relative flex items-center justify-center overflow-hidden p-6">
                       <div className="font-black text-white text-5xl leading-none z-10 drop-shadow-md tracking-tighter">
                          1+1=3 <span className="text-yellow-400">ssw</span>
                       </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col text-left">
                       <h5 className="font-bold text-[#1f2937] text-lg mb-2 leading-tight">Trinca de Ouro SSW</h5>
                       <p className="text-[#4b5563] text-xs leading-relaxed mb-4 flex-1">Adicione 3 packs da nossa linha exclusiva no carrinho e o de menor valor sai inteiramente de graça.</p>
                       <span className="text-[#059669] text-xs font-bold mt-auto hover:underline cursor-pointer">Mais informações</span>
                    </div>
                 </div>

                 {/* Promo Card 3 */}
                 <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="h-40 bg-[#f43f5e] relative flex overflow-hidden">
                       <div className="p-6 font-black text-white text-3xl leading-none z-10 flex flex-col justify-center drop-shadow-md">
                          <span>3+1</span>
                          <span>5+2</span>
                          <span>10+4</span>
                       </div>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-yellow-300 text-3xl rotate-[-10deg] drop-shadow-md blur-[0.5px]">
                          Seed<br/>Keepers
                       </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col text-left">
                       <h5 className="font-bold text-[#1f2937] text-lg mb-2 leading-tight">Oferta Exclusiva Seedkeepers</h5>
                       <p className="text-[#4b5563] text-xs leading-relaxed mb-4 flex-1">Estoque limitado: compre 3 e leve 4, compre 5 e leve 7. Genéticas de coleção com bônus absurdo!</p>
                       <span className="text-[#059669] text-xs font-bold mt-auto hover:underline cursor-pointer">Mais informações</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* MASTER GROWER PROMO BANNER */}
          <div className="mt-24 p-1 rounded-lg bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ffff00] shadow-[0_0_50px_rgba(255,0,255,0.2)]">
            <div className="p-10 bg-black relative overflow-hidden group">
              {/* DECORATIVE ELEMENTS */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/20 blur-3xl group-hover:bg-purple-600/40 transition-colors"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-lime-600/20 blur-3xl group-hover:bg-lime-600/40 transition-colors"></div>
              
              <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
                <div className="text-left flex-1">
                  <div className="inline-block bg-white text-black pixel text-[10px] px-2 py-1 mb-4 uppercase font-bold">Oferta de Tempo Limitado</div>
                  <h3 className="pixel text-3xl md:text-5xl text-white mb-4 italic tracking-tight" style={{textShadow: "3px 3px #ff00ff"}}>SUPREME STARTER PACK</h3>
                  <p className="vt text-pink-300 text-xl max-w-2xl leading-relaxed">
                    Três das nossas linhagens mais premiadas em um pacote exclusivo para novos colecionadores.
                    Inclui <span className="text-white font-bold underline">Lemon Haze</span>, <span className="text-white font-bold underline">Blue Dream</span> e <span className="text-white font-bold underline">Purple Kush</span>.
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-6">
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="vt text-white/40 line-through text-xl font-bold italic">R$ 259,70</div>
                      <div className="pixel text-5xl text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">R$ 169,90</div>
                    </div>
                    <div className="bg-pink-600 text-white pixel text-xs p-3 rounded-full animate-bounce shadow-lg">
                      -35%
                    </div>
                  </div>
                  <button className="w-full xl:w-auto bg-gradient-to-r from-lime-500 to-lime-600 text-black pixel text-lg px-12 py-6 hover:scale-105 transition-all shadow-[10px_10px_0px_rgba(255,255,255,0.1)] active:translate-y-1 font-black">
                    RESGATAR AGORA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ZONE: EDUCATIONAL / LEGAL MASTERCLASS                     */}
      {/* ========================================================= */}
      <div className="w-full bg-[#030803] py-16 px-4 relative overflow-hidden">
         {/* Atmospheric Accents */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-lime-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
         
         <div className="w-full relative py-20 mb-8 overflow-hidden">
            {/* Massive Background Brand Name */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 vt text-[25vw] font-black text-white/[0.02] leading-none whitespace-nowrap select-none pointer-events-none">
               MECURA
            </div>
            
            {/* Cinematic Scanlines & Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(163,230,53,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-30"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[500px] bg-lime-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse"></div>

            <div className="max-w-[1400px] mx-auto relative z-10 px-4">
               <div className="text-center group">
                  <div className="inline-flex items-center gap-4 py-3 px-8 bg-black/60 border-2 border-lime-500/30 rounded-full mb-12 backdrop-blur-xl shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                     <span className="w-3 h-3 bg-lime-500 rounded-full animate-ping"></span>
                     <span className="pixel text-[9px] md:text-sm text-lime-400 uppercase tracking-[0.6em]">Protocolo de Elite Nacional</span>
                  </div>
                  
                  <h2 className="vt text-[clamp(50px,16vw,200px)] font-black leading-[0.75] mb-12 select-none tracking-[-0.07em] transition-all duration-1000">
                     <span className="block text-lime-400 drop-shadow-[0_0_80px_rgba(163,230,53,0.8)] group-hover:drop-shadow-[0_0_120px_rgba(163,230,53,1)] transform hover:scale-[1.02] transition-transform cursor-default">INSTITUTO</span>
                     <span className="block text-white group-hover:text-lime-400 transition-colors duration-1000 transform group-hover:scale-95 origin-center">MECURA</span>
                  </h2>
                  
                  <div className="max-w-6xl mx-auto space-y-8 mt-20">
                     <p className="vt text-2xl md:text-4xl text-white uppercase tracking-tighter leading-none animate-fade-in">
                        TRANSFORMANDO <span className="relative inline-block">
                           <span className="relative z-10 bg-lime-500 text-black px-6 py-2 italic font-black text-sm md:text-lg">CULTIVO</span>
                           <span className="absolute -inset-1 bg-lime-400 blur-md opacity-50"></span>
                        </span>
                     </p>
                     <p className="vt text-xl md:text-3xl text-gray-400 uppercase tracking-tighter leading-none">
                        EM <span className="text-lime-400 font-black drop-shadow-[0_0_20px_rgba(163,230,53,0.5)]">ALTA MEDICINA PSICOTRÓPICA DE PRECISÃO.</span>
                     </p>
                  </div>

                  <div className="flex justify-center items-center gap-8 mt-24">
                     <div className="h-[2px] w-24 md:w-64 bg-gradient-to-r from-transparent via-lime-500 to-transparent"></div>
                     <div className="flex gap-4">
                        <div className="w-3 h-3 bg-lime-500 shadow-[0_0_15px_rgba(163,230,53,1)]"></div>
                        <div className="w-3 h-3 bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
                        <div className="w-3 h-3 bg-lime-500 shadow-[0_0_15px_rgba(163,230,53,1)]"></div>
                     </div>
                     <div className="h-[2px] w-24 md:w-64 bg-gradient-to-l from-transparent via-lime-500 to-transparent"></div>
                  </div>
               </div>
            </div>
         </div>

         <div className="max-w-[1200px] mx-auto relative z-10">

            {/* Split Hero: Pedro Nicoletti */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-8 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-8 md:p-16 shadow-2xl">
               <div className="lg:w-1/2 group relative">
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                     <img 
                        src="/images/design_sem_nome_21_1.jpg" 
                        alt="Pedro Nicoletti" 
                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#030803] via-transparent to-transparent"></div>
                     <div className="absolute bottom-8 left-8">
                        <div className="vt text-2xl md:text-4xl text-white font-black uppercase leading-none drop-shadow-2xl">Pedro <br/><span className="text-lime-500">Nicoletti</span></div>
                        <div className="text-lime-400 font-bold italic tracking-widest mt-2 uppercase text-xs opacity-60">Fundador • Método Herbalista</div>
                     </div>
                  </div>
                  {/* Floating Stat badges */}
                  <div className="absolute -right-6 top-1/4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl animate-bounce-slow">
                     <span className="block text-2xl font-black text-white">6+</span>
                     <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Turmas Formadas</span>
                  </div>
                  <div className="absolute -left-6 bottom-1/4 bg-lime-500 p-4 rounded-2xl shadow-xl rotate-[-6deg] hidden md:block">
                     <span className="block text-lg font-black text-black">MEC</span>
                     <span className="text-[10px] text-black/60 font-bold uppercase tracking-widest text-center">Certificado</span>
                  </div>
               </div>

               <div className="lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] text-white/40 mb-8 self-center lg:self-start">
                     Orientação de Nível Profissional
                  </div>
                  <h2 className="vt text-xl md:text-3xl text-white font-black mb-8 uppercase leading-[0.9] tracking-tighter">
                     A Transição para o <span className="text-lime-400">Cultivo Medicinal</span> Começa Aqui.
                  </h2>
                  <div className="space-y-6 text-gray-400 text-lg leading-relaxed mb-12">
                     <p>Dominamos a ciência do cultivo medicinal para que você possa produzir seu próprio medicamento com pureza, legalidade e precisão laboratorial.</p>
                     <p className="border-l-4 border-lime-500 pl-6 italic text-white/80">"Minha missão é democratizar o conhecimento técnico da Cannabis, validado cientificamente pelo Instituto de Química da UnB."</p>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                     <button className="bg-white text-black font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">Bio Completa</button>
                     <button className="bg-transparent border border-white/10 text-white font-bold px-8 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all">Pesquisa UnB</button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* ========================================================= */}
      {/* ZONE: MEDICAL CARE CTA                                    */}
      {/* ========================================================= */}
      <div className="w-full bg-[#0a0a0a] py-10 px-4 relative overflow-hidden">
         {/* Background Effects */}
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-600/10 blur-[100px] rounded-full"></div>
         
         <div className="max-w-[1200px] mx-auto relative z-10">
            {/* Split Hero: Dr. Guilherme */}
            <div className="flex flex-col lg:flex-row items-center gap-16 mb-10 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-8 md:p-16 shadow-2xl">
               {/* Image Side */}
               <div className="lg:w-1/2 group relative">
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                     <img 
                        src="/images/dr-guilherme-compressed.jpg" 
                        alt="Dr. Guilherme" 
                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                     <div className="absolute bottom-8 left-8">
                        <div className="vt text-2xl md:text-4xl text-white font-black uppercase leading-none drop-shadow-2xl">Dr. <br/><span className="text-blue-400">Guilherme</span></div>
                        <div className="text-blue-400 font-bold italic tracking-widest mt-2 uppercase text-xs opacity-60">Médico Prescritor • CRM Especialista</div>
                     </div>
                  </div>
                  {/* Floating Stat badges */}
                  <div className="absolute -right-6 top-1/4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl animate-bounce-slow">
                     <span className="block text-2xl font-black text-white">2.5k+</span>
                     <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Pacientes Atendidos</span>
                  </div>
                  <div className="absolute -left-6 bottom-1/4 bg-blue-500 p-4 rounded-2xl shadow-xl rotate-[-6deg] hidden md:block">
                     <span className="block text-lg font-black text-white text-center">ANVISA</span>
                     <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest text-center">Autorizado</span>
                  </div>
               </div>

               {/* Content Side */}
               <div className="lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] text-blue-400 mb-8 self-center lg:self-start">
                     <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
                     Acesso Legal & Seguro
                  </div>
                  <h2 className="vt text-xl md:text-3xl text-white font-black mb-8 uppercase leading-[0.9] tracking-tighter">
                     Tenha sua <span className="text-[#38bdf8]">Receita Médica</span> em Minutos.
                  </h2>
                  <div className="space-y-6 text-gray-400 text-lg leading-relaxed mb-12">
                     <p>Conectamos você aos melhores especialistas em medicina canabinoide para um tratamento 100% legalizado e seguro via consulta digital.</p>
                     <p className="border-l-4 border-blue-500 pl-6 italic text-white/80">"Nossa missão é garantir saúde e qualidade de vida através do acesso democrático à medicina canabinoide, com total amparo legal e suporte contínuo."</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 w-full max-w-md mx-auto lg:mx-0">
                      <button 
                         onClick={() => {
                            playSfx('click');
                            window.open('https://api.whatsapp.com/send?phone=SEUNUMERO', '_blank');
                         }}
                         className="w-full bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white vt text-xl md:text-2xl px-8 py-6 rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 transition-all group"
                      >
                         <span className="pixel uppercase flex items-center justify-center gap-4">
                            QUERO CONSULTA <span className="group-hover:translate-x-2 transition-transform">→</span>
                         </span>
                      </button>
                      <div className="flex justify-center lg:justify-start gap-8 opacity-50">
                         <div className="flex items-center gap-2">
                            <span className="text-xl">👨‍⚕️</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Digital</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xl">⚖️</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">100% Legal</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xl">📋</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Receita</span>
                         </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Split Hero: Wilian (Agronomic Report) */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-10 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-8 md:p-16 shadow-2xl">
               {/* Image Side */}
               <div className="lg:w-1/2 group relative">
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                     <img 
                        src="/images/wilian-1.jpg" 
                        alt="Engenheiro Wilian" 
                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                     <div className="absolute bottom-8 left-8">
                        <div className="vt text-2xl md:text-4xl text-white font-black uppercase leading-none drop-shadow-2xl">Eng. <br/><span className="text-emerald-400">Wilian</span></div>
                        <div className="text-emerald-400 font-bold italic tracking-widest mt-2 uppercase text-xs opacity-60">Engenheiro Agrônomo • Especialista em Cultivo</div>
                     </div>
                  </div>
                  {/* Floating Stat badges */}
                  <div className="absolute -left-6 top-1/4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl animate-bounce-slow">
                     <span className="block text-2xl font-black text-white">500+</span>
                     <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Laudos Emitidos</span>
                  </div>
                  <div className="absolute -right-6 bottom-1/4 bg-emerald-500 p-4 rounded-2xl shadow-xl rotate-[6deg] hidden md:block">
                     <span className="block text-lg font-black text-white text-center">CREA</span>
                     <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest text-center">Profissional Ativo</span>
                  </div>
               </div>

               {/* Content Side */}
               <div className="lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] text-emerald-400 mb-8 self-center lg:self-start">
                     <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                     Suporte Técnico & Jurídico
                  </div>
                  <h2 className="vt text-xl md:text-3xl text-white font-black mb-8 uppercase leading-[0.9] tracking-tighter">
                     Emita seu <span className="text-emerald-400">Laudo Agronômico</span> para Cultivo.
                  </h2>
                  <div className="space-y-6 text-gray-400 text-lg leading-relaxed mb-12">
                     <p>Obtenha o documento técnico essencial para garantir o amparo jurídico do seu auto-cultivo ou associação. Laudos assinados por engenheiros especialistas.</p>
                     <p className="border-l-4 border-emerald-500 pl-6 italic text-white/80">"A certificação técnica do seu cultivo é o pilar de segurança necessário para transformar seu jardim em uma produção medicinal respeitada e legalmente protegida."</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 w-full max-w-md mx-auto lg:mx-0">
                      <button 
                         onClick={() => {
                            playSfx('click');
                            window.open('https://api.whatsapp.com/send?phone=SEUNUMERO', '_blank');
                         }}
                         className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white vt text-lg md:text-xl px-8 py-6 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all group"
                      >
                         <span className="pixel uppercase flex items-center justify-center gap-4">
                            QUERO MEU LAUDO <span className="group-hover:translate-x-2 transition-transform">→</span>
                         </span>
                      </button>
                      <div className="flex justify-center lg:justify-start gap-8 opacity-50">
                         <div className="flex items-center gap-2">
                            <span className="text-xl">🌿</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Botânica</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xl">⚖️</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Habeas Corpus</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xl">📝</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Assinado</span>
                         </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Split Hero: Legal Support (Habeas Corpus) */}
            <div className="flex flex-col lg:flex-row items-center gap-16 mb-10 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-8 md:p-16 shadow-2xl">
               {/* Image Side */}
               <div className="lg:w-1/2 group relative">
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                     <img 
                        src="/images/suporte-juridico-compressed.jpg" 
                        alt="Suporte Jurídico Especializado" 
                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                     <div className="absolute bottom-8 left-8">
                        <div className="vt text-2xl md:text-4xl text-white font-black uppercase leading-none drop-shadow-2xl">Suporte <br/><span className="text-amber-400">Jurídico</span></div>
                        <div className="text-amber-400 font-bold italic tracking-widest mt-2 uppercase text-xs opacity-60">Advogado Especialista • Habeas Corpus</div>
                     </div>
                  </div>
                  {/* Floating Stat badges */}
                  <div className="absolute -right-6 top-1/4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl animate-bounce-slow">
                     <span className="block text-2xl font-black text-white">100%</span>
                     <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Comprometimento</span>
                  </div>
                  <div className="absolute -left-6 bottom-1/4 bg-amber-500 p-4 rounded-2xl shadow-xl rotate-[-6deg] hidden md:block">
                     <span className="block text-lg font-black text-white text-center">OAB</span>
                     <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest text-center">Atuação Nacional</span>
                  </div>
               </div>

               {/* Content Side */}
               <div className="lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] text-amber-400 mb-8 self-center lg:self-start">
                     <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
                     Segurança Jurídica Plena
                  </div>
                  <h2 className="vt text-xl md:text-3xl text-white font-black mb-8 uppercase leading-[0.9] tracking-tighter">
                     Cultive com <span className="text-amber-400">Total Segurança</span> da Lei.
                  </h2>
                  <div className="space-y-6 text-gray-400 text-lg leading-relaxed mb-12">
                     <p>Tenha acesso direto a advogados especializados na área canábica para obtenção do seu Habeas Corpus preventivo e consultoria para o auto-cultivo medicinal.</p>
                     <p className="border-l-4 border-amber-500 pl-6 italic text-white/80">"O direito à saúde é inalienável. Nossa missão é proteger você e seu jardim com as melhores estratégias jurídicas do país, garantindo paz para o seu tratamento."</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 w-full max-w-md mx-auto lg:mx-0">
                      <button 
                         onClick={() => {
                            playSfx('click');
                            window.open('https://api.whatsapp.com/send?phone=SEUNUMERO', '_blank');
                         }}
                         className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-white vt text-lg md:text-xl px-8 py-6 rounded-3xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all group"
                      >
                         <span className="pixel uppercase flex items-center justify-center gap-4">
                            MEU HABEAS CORPUS <span className="group-hover:translate-x-2 transition-transform">→</span>
                         </span>
                      </button>
                      <div className="flex justify-center lg:justify-start gap-8 opacity-50">
                         <div className="flex items-center gap-2">
                            <span className="text-xl">⚖️</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Defesa</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xl">🔒</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Sigilo</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xl">🏛️</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Tribunais</span>
                         </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Split Hero: Imported Medication Access */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-10 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-8 md:p-16 shadow-2xl">
               {/* Image Side */}
               <div className="lg:w-1/2 group relative">
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                     <img 
                        src="/images/whisk_compressed.jpg" 
                        alt="Acesso a Medicamentos Importados" 
                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                     <div className="absolute bottom-8 left-8">
                        <div className="vt text-2xl md:text-4xl text-white font-black uppercase leading-none drop-shadow-2xl">Acesso <br/><span className="text-violet-400">Internacional</span></div>
                        <div className="text-violet-400 font-bold italic tracking-widest mt-2 uppercase text-xs opacity-60">Importação Legal • Suporte ANVISA</div>
                     </div>
                  </div>
                  {/* Floating Stat badges */}
                  <div className="absolute -left-6 top-1/4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl animate-bounce-slow">
                     <span className="block text-2xl font-black text-white">ANVISA</span>
                     <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Autorização Rápida</span>
                  </div>
                  <div className="absolute -right-6 bottom-1/4 bg-violet-600 p-4 rounded-2xl shadow-xl rotate-[6deg] hidden md:block">
                     <span className="block text-lg font-black text-white text-center">Global</span>
                     <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest text-center">Logística Segura</span>
                  </div>
               </div>

               {/* Content Side */}
               <div className="lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] text-violet-400 mb-8 self-center lg:self-start">
                     <span className="w-2 h-2 bg-violet-400 rounded-full animate-ping"></span>
                     Conexão Global de Saúde
                  </div>
                  <h2 className="vt text-xl md:text-3xl text-white font-black mb-8 uppercase leading-[0.9] tracking-tighter">
                     Acesso aos Melhores <span className="text-violet-400">Medicamentos Importados</span>.
                  </h2>
                  <div className="space-y-6 text-gray-400 text-lg leading-relaxed mb-12">
                     <p> Facilitamos todo o processo de importação para você. Desde a prescrição médica correta até a autorização da ANVISA e a entrega segura internacional.</p>
                     <p className="border-l-4 border-violet-500 pl-6 italic text-white/80">"O acesso à saúde não conhece fronteiras. Facilitamos o processo burocrático para que você receba o melhor tratamento disponível no mundo diretamente na sua porta."</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 w-full max-w-md mx-auto lg:mx-0">
                      <button 
                         onClick={() => {
                            playSfx('click');
                            window.open('https://api.whatsapp.com/send?phone=SEUNUMERO', '_blank');
                         }}
                         className="w-full bg-gradient-to-r from-violet-400 to-violet-600 text-white vt text-lg md:text-xl px-8 py-6 rounded-3xl shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all group"
                      >
                         <span className="pixel uppercase flex items-center justify-center gap-4">
                            MEUS MEDICAMENTOS <span className="group-hover:translate-x-2 transition-transform">→</span>
                         </span>
                      </button>
                      <div className="flex justify-center lg:justify-start gap-8 opacity-50">
                         <div className="flex items-center gap-2">
                            <span className="text-xl">✈️</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Global</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xl">🛡️</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Seguro</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xl">💊</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Qualidade</span>
                         </div>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      </div>


      {/* ========================================================= */}
      {/* ZONE: AVALIAÇÕES (ANIMATED CAROUSEL)                      */}
      {/* ========================================================= */}
      <div id="reviews" className="w-full bg-[#050505] py-24 relative border-t border-white/5 overflow-hidden">
         {/* Subtle background glow */}
         <div className="absolute top-1/2 left-0 w-96 h-96 bg-lime-500/10 blur-[150px] -translate-y-1/2 rounded-full"></div>
         
         <div className="max-w-[1400px] mx-auto px-4 mb-20 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
               <div>
                  <h2 className="pixel text-4xl md:text-6xl text-white mb-4 uppercase tracking-tighter">AVALIAÇÕES</h2>
                  <div className="flex items-center gap-4">
                     <span className="vt text-lime-400 font-bold uppercase tracking-widest text-xs">Excelente ★★★★★</span>
                     <span className="vt text-white/40 font-bold text-[10px] uppercase">Baseado em 12.408 feedbacks reais</span>
                  </div>
               </div>
               <button className="pixel text-[10px] text-white/50 hover:text-lime-400 transition-colors border-b border-white/20 pb-1">VISUALIZAR TODAS</button>
            </div>
         </div>

         {/* The Infinite Carousel */}
         <div className="relative">
            <div className="flex overflow-hidden group">
               <motion.div 
                  className="flex gap-8 whitespace-nowrap"
                  animate={{ x: [0, -1200] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
               >
                  {[...reviews, ...reviews, ...reviews].map((rev, i) => (
                     <div 
                        key={i} 
                        className="w-[450px] bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] flex flex-col justify-between shrink-0 hover:border-lime-500/40 transition-colors cursor-default"
                     >
                        <div>
                           <div className="flex justify-between items-start mb-8">
                              <div>
                                 <div className="text-white font-black text-2xl mb-1 vt uppercase">{rev.user}</div>
                                 <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-lime-500 rounded-full"></span>
                                    <span className="text-lime-400 font-bold text-[10px] uppercase tracking-widest vt">CLIENTE VERIFICADO</span>
                                 </div>
                              </div>
                              <div className="text-lime-400 flex gap-0.5">★★★★★</div>
                           </div>
                           
                           <div className="mb-6">
                              <span className="text-[10px] font-black py-1.5 px-4 bg-white/5 rounded-full text-white/60 uppercase tracking-widest border border-white/10 vt">
                                 {rev.service}
                              </span>
                           </div>

                           <p className="text-gray-300 text-xl italic leading-relaxed whitespace-normal vt">
                              "{rev.text}"
                           </p>
                        </div>

                        <div className="mt-12 flex justify-between items-center opacity-30">
                           <span className="vt text-xs uppercase tracking-widest font-bold">{rev.time}</span>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold">REVIEWS.BR</span>
                             <span className="w-3 h-3 bg-white/50 rounded-full"></span>
                           </div>
                        </div>
                     </div>
                  ))}
               </motion.div>
            </div>
            
            {/* Gradient Masks */}
            <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
         </div>

         <div className="mt-24 flex justify-center items-center gap-12 opacity-10">
            <div className="h-[1px] w-32 bg-white"></div>
            <span className="pixel text-sm tracking-[0.5em] font-black uppercase">TRUSTED BY GROWERS</span>
            <div className="h-[1px] w-32 bg-white"></div>
         </div>
      </div>

      {/* ========================================================= */}
      {/* QUALITY PROMISE & NEWSLETTER (HERBIES STYLE)             */}
      {/* ========================================================= */}
      <div className="w-full bg-[#E5F2E9] py-12 relative overflow-hidden text-[#333]">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-transparent bg-repeat mix-blend-multiply"></div>
        <div className="max-w-[1200px] mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-32 md:w-48">
            <img src="/gifs/elite_seed.gif" alt="mascot" className="w-full object-contain filter drop-shadow-lg" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-[#2E7A4A] mb-2 leading-tight">Poucos vão ver isso...</h3>
            <p className="text-sm text-[#444] font-medium leading-relaxed max-w-lg">
              Estamos liberando um lote limitado de sementes <strong className="font-bold">GRÁTIS</strong> para quem entrar agora.
              Se você curte genética premium, essa é sua chance de testar sem risco.<br/><br/>
              ⚠️ Apenas para quem seguir as regras e agir rápido.
            </p>
          </div>

          <div className="flex-1 w-full flex flex-col gap-3 justify-center">
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-xl transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(37,211,102,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] active:scale-95 shadow-[#25D366]/20">
                <MessageCircle size={24} />
                CHAMAR NO WHATSAPP
            </a>
          </div>
        </div>
      </div>
      </>
      ) : currentView === 'about' ? (
        <AboutPage onBack={() => setCurrentView('home')} />
      ) : currentView === 'terms' ? (
        <TermsPage onBack={() => setCurrentView('home')} />
      ) : currentView === 'disclaimer' ? (
        <DisclaimerPage onBack={() => setCurrentView('home')} />
      ) : currentView === 'privacy' ? (
        <PrivacyPolicyPage onBack={() => setCurrentView('home')} />
      ) : currentView === 'cookies' ? (
        <CookiesPolicyPage onBack={() => setCurrentView('home')} />
      ) : currentView === 'legal' ? (
        <LegalNoticePage onBack={() => setCurrentView('home')} />
      ) : currentView === 'manual' ? (
        <ManualPage onBack={() => setCurrentView('home')} onSelectSeed={(id) => setSelectedSeedId(id)} />
      ) : currentView === 'checkout' ? (
        <CheckoutPage 
          cartItems={cartItems} 
          onBack={() => setCurrentView('home')} 
          onProceed={(data) => {
            setCheckoutData(data);
            setCurrentView('payment');
          }}
        />
      ) : (
        <PaymentPage 
          cartItems={cartItems}
          selectedBonuses={checkoutData?.selectedBonuses || []}
          totalAmount={checkoutData?.totalAmount || 0}
          onBack={() => setCurrentView('checkout')}
          onSuccess={() => {
            setCurrentView('home');
            setIsOrdersOpen(true); 
          }}
        />
      )}

      {/* ========================================================= */}
      {/* FOOTER (HERBIES INSPIRED)                                */}
      {/* ========================================================= */}
      {currentView === 'home' && (
        <footer id="footer" className="w-full bg-[#2E7A4A] pt-16 pb-8 border-t border-lime-500/20 text-white shadow-[0_-10px_30px_rgba(46,122,74,0.3)]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mb-16 text-left vt">
            <div>
              <h5 className="font-bold text-lg mb-4 text-white">Informação</h5>
              <ul className="space-y-3 text-sm text-white/90" onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'LI') {
                  const title = target.textContent || '';
                  setPopup({
                    title: title.toUpperCase(),
                    body: (
                      <div className="p-8 text-white sans text-sm leading-relaxed space-y-4">
                        <p className="opacity-80">
                          {title === 'Envio' && 'Nossos envios são realizados de forma 100% discreta, em embalagens descaracterizadas. O prazo varia de 3 a 10 dias úteis dependendo da sua região.'}
                          {title === 'Acompanhar o meu pedido' && 'Para acompanhar seu pedido, acesse a área Meus Pedidos através do ícone de sacola no menu superior e clique em rastrear.'}
                          {title === 'Política de Devolução' && 'Aceitamos devoluções apenas para sementes na embalagem original lacrada, no prazo de até 7 dias após o recebimento. A garantia de germinação segue as regras específicas do produtor.'}
                          {title === 'Lista de preços' && 'Nossos preços são atualizados periodicamente devido à variação cambial. Consulte o catálogo atual pelo site.'}
                          {title === 'Promoções' && 'Fique de olho em nossa homepage e redes sociais para não perder os drops mensais, bônus progressivos e cupons de desconto temporários.'}
                        </p>
                      </div>
                    )
                  });
                }
              }}>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Envio</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Acompanhar o meu pedido</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Política de Devolução</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Lista de preços</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Promoções</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-4 text-white">Empresa</h5>
              <ul className="space-y-3 text-sm text-white/90" onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'LI') {
                  const title = target.textContent || '';
                  setPopup({
                    title: title.toUpperCase(),
                    body: (
                      <div className="p-8 text-white sans text-sm leading-relaxed space-y-4">
                        <p className="opacity-80">
                          {title === 'Contatos' && 'Você pode entrar em contato conosco através do e-mail suporte@sementesagradaworld.com ou pelo WhatsApp oficial disponível na página inicial.'}
                          {title === 'Avaliações' && 'Confira os relatos de germinação e feedbacks de cultivo da nossa comunidade em nossos fóruns internos e canais sociais.'}
                          {title === 'Programa de Afiliados' && 'Indique amigos e ganhe créditos. Nosso programa de afiliados permite que você acumule bônus para trocar por sementes gratuitas.'}
                          {title === 'Nossos autores' && 'Trabalhamos apenas com bancos de sementes renomados: FastBuds, Barney\'s Farm, Royal Queen, entre outros mestres geneticistas.'}
                          {title === 'Mapa do site' && 'Utilize nosso menu principal para navegar: Catálogo, Pedidos, Meus Favoritos, Carrinho e Área de Checkout.'}
                        </p>
                      </div>
                    )
                  });
                }
              }}>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all" onClick={(e) => { e.stopPropagation(); setCurrentView('about'); }}>Sobre nós</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Contatos</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Avaliações</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Programa de Afiliados</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Nossos autores</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Mapa do site</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-4 text-white">Termos de serviço</h5>
              <ul className="space-y-3 text-sm text-white/90" onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'LI') {
                  const title = target.textContent || '';
                  if (title === 'Termos e Condições') {
                    setCurrentView('terms');
                    window.scrollTo(0, 0);
                    return;
                  }
                  if (title === 'Isenção de Responsabilidade Limitada') {
                    setCurrentView('disclaimer');
                    window.scrollTo(0, 0);
                    return;
                  }
                  if (title === 'Política de Privacidade') {
                    setCurrentView('privacy');
                    window.scrollTo(0, 0);
                    return;
                  }
                  if (title === 'Política de Cookies') {
                    setCurrentView('cookies');
                    window.scrollTo(0, 0);
                    return;
                  }
                  if (title === 'Aviso Legal') {
                    setCurrentView('legal');
                    window.scrollTo(0, 0);
                    return;
                  }
                  setPopup({
                    title: title.toUpperCase(),
                    body: (
                      <div className="p-8 text-white sans text-sm leading-relaxed space-y-4">
                        <p className="opacity-80">
                        </p>
                      </div>
                    )
                  });
                }
              }}>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Termos e Condições</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Isenção de Responsabilidade Limitada</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Política de Privacidade</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Política de Cookies</li>
                <li className="hover:text-lime-300 hover:underline cursor-pointer transition-all">Aviso Legal</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 vt text-white">
             {/* ACEITAMOS */}
             <div>
                <h5 className="font-bold text-sm tracking-wider uppercase mb-2">ACEITAMOS</h5>
                <div className="flex gap-2">
                   <div className="bg-white px-2 py-1 rounded text-black text-[10px] font-bold">PIX</div>
                   <div className="bg-white px-2 py-1 rounded text-[#1A1F71] text-[10px] font-bold italic">VISA</div>
                   <div className="bg-white px-2 py-1 rounded text-[#FF5F00] text-[10px] font-bold italic">Mastercard</div>
                   <div className="bg-white px-2 py-1 rounded text-black text-[10px] font-bold">BTC</div>
                </div>
             </div>

             {/* ENVIO */}
             <div>
                <h5 className="font-bold text-sm tracking-wider uppercase mb-2">ENVIO PARA TODO O BRASIL</h5>
                <div className="flex gap-4">
                   <span className="text-3xl drop-shadow-md">📦</span>
                   <span className="text-3xl drop-shadow-md">📮</span>
                </div>
             </div>

             {/* FOLLOW US */}
             <div>
                <h5 className="font-bold text-sm tracking-wider uppercase mb-2">Follow us</h5>
                <div className="flex gap-2 text-2xl">
                  <div className="cursor-pointer hover:scale-110 transition-transform">📷</div>
                  <div className="cursor-pointer hover:scale-110 transition-transform">💬</div>
                  <div className="cursor-pointer hover:scale-110 transition-transform">🐦</div>
                  <div className="cursor-pointer hover:scale-110 transition-transform">▶️</div>
                  <div className="cursor-pointer hover:scale-110 transition-transform">👾</div>
                </div>
             </div>
          </div>
          
          <div className="mt-8 vt text-[11px] text-white/70 max-w-5xl text-left leading-relaxed">
             Na Semente Sagrada World, são vendidas sementes de cannabis como souvenirs, as quais não devem ser germinadas onde sejam ilegais. Ao comprá-las, você confirma que tem a idade legal para isso e está ciente das legislações e regulamentações locais. A Semente Sagrada World não é responsável por quaisquer violações da lei. Os produtos e as informações aqui contidas são exclusivamente para fins educacionais e de coleção.
          </div>
        </div>
      </footer>
      )}

      {/* SEED MODAL OVERLAY - GLOBAL */}
      {selectedSeedId !== null && (() => {
        const seed = SEEDS.find(s => s.id === selectedSeedId);
        if (!seed) return null;
        const i = SEEDS.findIndex(s => s.id === selectedSeedId);
        const variant = shopVariants[i] || { qty: 'X2', type: 'Feminizada' };
        const isAuto = variant.type === 'Automatica';
        const specs = isAuto ? seed.auto : seed.fem;
        const setVariantQty = (q: Quantity) => setShopVariants(prev => ({...prev, [i]: {...variant, qty: q}}));
        const setVariantType = (t: 'Feminizada' | 'Automatica') => {
          setShopVariants(prev => ({...prev, [i]: {...variant, type: t}}));
          if (seed.gallery) {
            if (t === 'Automatica' && seed.gallery.length >= 3) {
              setCurrentImgIdx(2);
            } else if (t === 'Feminizada' && seed.gallery.length >= 2) {
              setCurrentImgIdx(1);
            } else {
              setCurrentImgIdx(0);
            }
          }
        };

        const addToCart = async () => {
          if (!auth.currentUser) {
            setIsAuthOpen(true);
            return;
          }
          try {
            const priceNum = parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.'));
            
            // Check if item already exists
            const existingItem = cartItems.find(i => i.seedId === String(seed.id) && i.quantity === variant.qty && i.variantType === variant.type);
            
            if (existingItem) {
              const { id, ...data } = existingItem;
              await setDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${existingItem.id}`), {
                ...data,
                packCount: (data.packCount || 1) + 1,
                priceNum: data.priceNum + priceNum
              });
            } else {
              const itemId = String(Date.now());
              await setDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${itemId}`), {
                seedId: String(seed.id),
                quantity: variant.qty,
                variantType: variant.type,
                priceNum: priceNum,
                addedAt: Date.now(),
                packCount: 1
              });
            }
            setIsCartOpen(true);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/cartItems`);
          }
        };

        const toggleFavorite = async () => {
          if (!auth.currentUser) {
            setIsAuthOpen(true);
            return;
          }
          const isFav = favorites.includes(String(seed.id));
          const strId = String(seed.id);
          
          // Optimistic UI
          setFavorites(prev => isFav ? prev.filter(f => f !== strId) : [...prev, strId]);
          
          try {
            if (isFav) {
              await deleteDoc(doc(db, `users/${auth.currentUser.uid}/favorites/${seed.id}`));
            } else {
              await setDoc(doc(db, `users/${auth.currentUser.uid}/favorites/${seed.id}`), {
                seedId: strId,
                addedAt: Date.now()
              });
            }
          } catch (err) {
            // Revert on failure
            setFavorites(prev => !isFav ? prev.filter(f => f !== strId) : [...prev, strId]);
            handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/favorites/${seed.id}`);
          }
        };
        
        const isFavorite = favorites.includes(String(seed.id));
        
        return (
          <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-2 sm:p-6 overflow-y-auto font-sans" onClick={() => setSelectedSeedId(null)}>
            <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl w-full max-w-[1400px] h-[95vh] flex flex-col lg:flex-row relative shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden" onClick={e => e.stopPropagation()}>
              
              {/* CLOSE BUTTON */}
              <button 
                onClick={() => setSelectedSeedId(null)} 
                className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/50 hover:bg-black rounded-full p-2 z-[10001] transition-colors shadow-lg border border-white/10"
                style={{ backdropFilter: 'blur(4px)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              {/* LEFT COLUMN: FULL HEIGHT IMAGE GALLERY */}
              <div className="lg:w-[40%] xl:w-[45%] flex flex-col bg-gradient-to-br from-[#111] to-black border-r border-[#222] relative h-[40vh] lg:h-full z-10 shrink-0">
                <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-hidden group">
                  {/* Background subtle watermark */}
                  <div className="absolute inset-x-0 inset-y-0 opacity-5 pointer-events-none flex items-center justify-center font-black text-6xl text-center select-none leading-none rotate-[-45deg] tracking-tighter text-white">
                     HIGHBREED<br/>SEEDS
                  </div>
                  
                  <img 
                    src={(seed.gallery && seed.gallery.length > 0) ? seed.gallery[currentImgIdx] : seed.image} 
                    alt={seed.name} 
                    className="gallery-img w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" 
                  />

                  {/* GALLERY CONTROLS */}
                  {seed.gallery && seed.gallery.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playSfx('click');
                          setCurrentImgIdx(prev => (prev === 0 ? seed.gallery!.length - 1 : prev - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playSfx('click');
                          setCurrentImgIdx(prev => (prev === seed.gallery!.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                  
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2 z-20">
                    <span className="bg-lime-600 text-black vt text-[11px] font-bold px-3 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1">🌱 99.34% GERMINAÇÃO</span>
                    <span className="bg-[#ff00ff] text-white vt text-[11px] font-bold px-3 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1">⚡ 24023 VENDAS</span>
                  </div>
                  
                  {specs.thc > 0 && 
                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 border-[3px] border-lime-500 rounded-[45%_55%_55%_45%] w-20 h-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm shadow-[0_0_20px_rgba(163,230,53,0.3)] text-center leading-none z-20 transform -rotate-12 transition-transform hover:scale-110 cursor-default">
                      <div className="text-lime-400 font-black text-2xl drop-shadow-[0_0_5px_rgba(163,230,53,0.8)]">{specs.thc}%</div><div className="text-[10px] text-yellow-400 font-black uppercase tracking-wider mt-0.5">THC ✦</div>
                    </div>
                  }
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(); }} 
                    className={`absolute top-4 right-4 md:top-6 md:right-6 p-2.5 rounded-full backdrop-blur-md z-30 transition-all border ${isFavorite ? 'bg-pink-500/20 text-pink-500 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'bg-black/50 text-white/50 border-white/10 hover:text-white hover:bg-black/80'}`}
                  >
                    <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                
                {/* GALLERY THUMBNAILS */}
                {seed.gallery && seed.gallery.length > 1 && (
                  <div className="flex gap-2 p-3 bg-black/90 overflow-x-auto border-t border-[#222] scrollbar-thin scrollbar-thumb-[#333]">
                    {seed.gallery.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img}
                        onClick={(e) => { e.stopPropagation(); playSfx('click'); setCurrentImgIdx(idx); }}
                        className={`w-14 h-14 object-cover rounded cursor-pointer transition-all border-2 ${idx === currentImgIdx ? 'border-lime-500 shadow-[0_0_10px_rgba(163,230,53,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* RIGHT COLUMN: SCROLLABLE INFO & CART */}
              <div className="lg:w-[60%] xl:w-[55%] h-[60vh] lg:h-[95vh] overflow-y-auto flex flex-col bg-[#050505] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                
                {/* TOP HALF: SPECS & BUY BOX */}
                <div className="flex flex-col xl:flex-row border-b border-[#222]">
                  {/* MIDDLE (SPECS) */}
                  <div className="xl:w-[55%] p-6 md:p-8 flex flex-col border-b xl:border-b-0 xl:border-r border-[#222] lg:min-h-[60vh]">
                    <div className="text-[10px] md:text-xs text-lime-600 mb-4 flex flex-wrap gap-1 md:gap-2 uppercase font-bold tracking-wider">
                       <span>Início</span> <span className="text-[#444]">—</span> 
                       <span>Catálogo</span> <span className="text-[#444]">—</span> 
                       <span>HighBreed</span> <span className="text-[#444]">—</span> 
                       <span className="text-gray-300 truncate max-w-[150px]">{seed.name}</span>
                    </div>

                    <h1 className="vt text-4xl md:text-5xl text-white font-bold mb-2 leading-tight">{seed.name}</h1>
                    <h3 className="font-sans text-sm text-gray-400 font-medium mb-6">{seed.subtitle}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-6 pb-4 border-b border-[#222]">
                       <span className="bg-[#111] text-gray-300 px-2 py-0.5 rounded border border-[#333]">Espanha 🇪🇸</span>
                       <span className="flex items-center gap-1">
                         <span className="text-yellow-500 text-sm">
                            {seed.rating === '5.0' ? '★★★★★' : '★★★★½'}
                         </span> 
                         <span className="text-gray-300 font-bold ml-1">{seed.rating || '5.0'}</span> 
                         <span className="text-lime-500 hover:underline cursor-pointer">{seed.reviews || 99} análises</span>
                       </span>
                       <span className="!text-lime-500 border border-lime-500/30 bg-lime-500/10 px-2 py-0.5 rounded">{variant.type}</span>
                    </div>

                    <div className="flex gap-2 mb-8">
                      <button onClick={() => setVariantType('Feminizada')} className={`flex-1 font-sans text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all ${!isAuto ? 'bg-lime-500/10 text-lime-400 font-bold border border-lime-500/30 shadow-[0_0_10px_rgba(163,230,53,0.1)]' : 'bg-[#111] border border-[#333] text-gray-500 hover:bg-[#222]'}`}>Feminizada</button>
                      <button onClick={() => setVariantType('Automatica')} className={`flex-1 font-sans text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all ${isAuto ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 'bg-[#111] border border-[#333] text-gray-500 hover:bg-[#222]'}`}>Automática</button>
                    </div>
                    
                    <h4 className="font-bold text-white text-lg mb-4">Características</h4>
                    <div className="flex flex-col text-sm border-t border-[#222]">
                       {[
                         ['Marca', 'HighBreed Seeds', true],
                         ['Tipo', variant.type, false],
                         ['Floração', isAuto ? 'Automática' : 'Fotoperíodo', false],
                         ['Ambiente', seed.isIndoor && seed.isOutdoor ? 'Indoor / Outdoor' : (seed.isIndoor ? 'Indoor' : 'Outdoor'), false],
                         ['THC', `${specs.thc}%`, false],
                         ['CBD', `${seed.cbd}%`, false],
                         ['Genética', `${specs.sativaPct}% Sat / ${100-specs.sativaPct}% Ind`, false],
                         ['Rendimento', `${specs.yieldIndoor}`, false],
                         ['Tempo', specs.floweringTime, false]
                       ].map(([label, val, isGreen]) => (
                         <div key={label.toString()} className="flex justify-between py-3.5 border-b border-[#1a1a1a] items-start gap-4">
                           <span className="text-gray-500 w-[40%] font-semibold text-xs uppercase tracking-wider">{label}</span>
                           <span className={`w-[60%] text-right font-black text-[15px] ${isGreen ? 'text-lime-400 hover:underline cursor-pointer' : 'text-gray-200'}`}>{val}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* FAR RIGHT (BUY BOX) */}
                  <div className="xl:w-[45%] p-6 md:p-8 bg-[#0a0a0a] flex flex-col relative w-full lg:sticky top-0 h-fit lg:min-h-[60vh]">
                     
                     <div className="bg-[#111] border border-lime-900/40 rounded-xl p-4 flex flex-col gap-2 mb-6 shadow-inner">
                        <div className="flex items-center justify-between">
                            <span className="text-lime-500/80 text-[10px] font-black uppercase tracking-widest">Cupom Ativos</span>
                            <span className="border border-lime-500/50 text-lime-500 bg-lime-500/20 px-2 py-0.5 rounded text-[9px] font-bold">+2 Sementes</span>
                        </div>
                        <div className="bg-[#000] border border-[#222] px-3 py-2 rounded text-xs font-black text-lime-500 tracking-wider flex justify-between uppercase">HIGHBREEDPROMO <span className="cursor-pointer text-gray-500 hover:text-white">📋</span></div>
                     </div>

                     {/* REWARDS PROGRESS WIDGET */}
                     <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                           <button className="text-white/40 hover:text-white"><ChevronUp size={16} /></button>
                        </div>
                        
                        <h5 className="text-white font-black text-base leading-tight pr-6">
                           Receba sementes grátis, frete grátis e descontos
                        </h5>

                        <div className="flex flex-col gap-1">
                           <div className="flex justify-between items-end mb-1">
                              <span className="text-xs text-gray-400 font-black">0%</span>
                              <div className="bg-lime-500/10 border border-lime-500/30 text-lime-500 px-2 py-0.5 rounded text-xs font-black">
                                 {(() => {
                                   const total = parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.'));
                                   if (total >= 408.2) return '4%';
                                   if (total >= 116.63) return '1%';
                                   return '0%';
                                 })()}
                              </div>
                           </div>
                           
                           {/* PROGRESS BAR */}
                           <div className="h-2.5 bg-[#222] rounded-full relative overflow-visible mt-2">
                              {/* Background Rail */}
                              <div className="absolute inset-0 bg-[#151515] rounded-full border border-white/5" />
                              
                              {/* Active Fill */}
                              <div 
                                className="absolute left-0 top-0 bottom-0 bg-lime-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(163,230,53,0.6)] rounded-full z-10"
                                style={{ 
                                   width: `${Math.min(100, (parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.')) / 408.2) * 100)}%` 
                                }}
                              >
                                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-lime-500 shadow-[0_0_10px_white] z-30" />
                              </div>
                              
                              {/* Markers */}
                              <div className="absolute inset-0 flex items-center px-0 pointer-events-none z-20">
                                 {/* Mark 1: Free Seed (116.63) */}
                                 <div 
                                    className="absolute w-2 h-2 bg-black border border-white/20 rounded-full" 
                                    style={{ left: `${(116.63 / 408.2) * 100}%`, transform: 'translateX(-50%)' }}
                                 />
                                 {/* Mark 2: Discount (408.20) */}
                                 <div 
                                    className="absolute w-2 h-2 bg-black border border-white/20 rounded-full" 
                                    style={{ left: '100%', transform: 'translateX(-50%)' }}
                                 />
                              </div>
                           </div>
                           
                           <div className="flex justify-center mt-3 h-6 relative">
                              <div 
                                className="text-lime-500 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)] transform -scale-x-100 absolute transition-all duration-500 animate-bounce"
                                style={{ 
                                   left: `${Math.min(100, (parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.')) / 408.2) * 100)}%`,
                                   transform: 'translateX(-50%) scaleX(-1)'
                                }}
                              >🍃</div>
                           </div>

                           <div className="flex justify-between text-[10px] font-bold text-gray-500 mt-1">
                              <span>R$ 0.00</span>
                              <span>R$ 408.20</span>
                           </div>
                        </div>

                           <div className="space-y-4 pt-3 border-t border-white/5 mt-1">
                           <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                 <div className="w-9 h-9 rounded-full bg-lime-500/10 flex items-center justify-center text-lime-500 border border-lime-500/20">🍃</div>
                                 <div className="flex flex-col">
                                    <span className="text-gray-300 font-bold">Gaste <span className="text-lime-400">R$ 116.63</span></span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-gray-600 font-black">→</span>
                                 <div className="flex flex-col items-end">
                                    <span className="text-gray-400 font-bold">Receba</span>
                                    <span className="text-lime-400 font-black text-sm">1 semente grátis</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                 <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 italic font-black">%</div>
                                 <div className="flex flex-col">
                                    <span className="text-gray-300 font-bold">Gaste <span className="text-white">R$ 408.20</span></span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-gray-600 font-black">→</span>
                                 <div className="flex flex-col items-end">
                                    <span className="text-gray-400 font-bold">Receba</span>
                                    <span className="text-white font-black text-sm"><span className="text-lime-400">4%</span> de desconto</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                           <span className="bg-lime-500/10 border border-lime-500/30 text-lime-500 px-3 py-1 rounded-lg text-[10px] font-bold">1 semente/pedido</span>
                           <span className="bg-lime-500/10 border border-lime-500/30 text-lime-500 px-3 py-1 rounded-lg text-[10px] font-bold">1 semente bônus</span>
                           <span className="bg-lime-500/10 border border-lime-500/30 text-lime-500 px-3 py-1 rounded-lg text-[10px] font-bold">
                              {(() => {
                                 const total = parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.'));
                                 if (total >= 408.2) return '4%';
                                 if (total >= 116.63) return '1%';
                                 return '0%';
                              })()}
                           </span>
                        </div>
                     </div>

                     <h4 className="font-black text-gray-200 text-sm mb-4">Pacote (número de sementes)</h4>
                     
                     <div className="flex flex-col gap-2.5 mb-6">
                        {[...QUANTITIES].map((q, idx) => {
                          const qCount = parseInt(q.replace('X', '')) || 1;
                          const isPopular = idx === 2;
                          const priceStr = seed.prices[q];
                          const basePriceNum = parseFloat(seed.prices['X2'].replace('.', '').replace(',', '.')) / 2;
                          const currentPriceNum = parseFloat(priceStr.replace('.', '').replace(',', '.'));
                          const comparePrice = basePriceNum * qCount * 1.4;
                          const isSelected = variant.qty === q;
                          
                          return (
                            <button 
                              key={q} 
                              onClick={() => {
                                playSfx('click');
                                setVariantQty(q);
                              }}
                              className={`flex items-center justify-between border rounded-xl px-4 py-3.5 w-full text-left transition-all relative overflow-hidden group ${isSelected ? 'border-lime-500 bg-white/5 ring-1 ring-lime-500/50' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                            >
                              <div className="flex items-center gap-3">
                                 <span className={`font-black text-base ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                    {qCount} semente{qCount > 1 ? 's' : ''}
                                 </span>
                                 {isPopular && <span className="bg-lime-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Popular</span>}
                              </div>
                              <div className="flex items-center gap-3">
                                {idx > 0 && <span className="text-[11px] text-gray-500 font-bold line-through">R$ {comparePrice.toFixed(2).replace('.',',')}</span>}
                                <span className={`font-black vt text-xl ${isSelected ? 'text-lime-400' : 'text-white group-hover:text-lime-400'}`}>R$ {priceStr}</span>
                              </div>
                            </button>
                          )
                        })}
                     </div>

                     {/* PACKAGE SUMMARY & QUANTITY */}
                     <div className="flex flex-col gap-4 mb-6 border-t border-white/5 pt-6">
                        <div className="flex flex-col">
                           <span className="text-lime-500 text-[11px] font-black mb-1">Restam menos de {20 + (seed.id % 50)} unidades em estoque</span>
                           <span className="text-gray-300 text-xs font-bold">Selecionado: 1 pacote ({variant.qty.replace('X','')} sementes)</span>
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                 <span className="text-gray-500 line-through text-xs font-bold">R$ {(parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.')) * 1.4).toFixed(2).replace('.',',')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="vt text-5xl text-white leading-none">R$ {seed.prices[variant.qty]}</span>
                                 <span className="text-[11px] text-gray-400 font-bold self-end mb-1">/ R$ {(parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.')) / (parseInt(variant.qty.replace('X', '')) || 1)).toFixed(1).replace('.',',')} por semente</span>
                              </div>
                           </div>
                           
                           {/* QUANTITY CONTROL */}
                           {(() => {
                             const item = cartItems.find(i => i.seedId === String(seed.id) && i.quantity === variant.qty && i.variantType === variant.type);
                             const count = item?.packCount || 1;
                             return (
                               <div className="flex items-center bg-white/10 rounded-full p-1 gap-4">
                               <button 
                                 className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                 onClick={() => {
                                   playSfx('click');
                                   if (item) {
                                     const newCount = (item.packCount || 1) - 1;
                                     if (newCount <= 0) {
                                       deleteDoc(doc(db, `users/${auth.currentUser?.uid}/cartItems/${item.id}`));
                                     } else {
                                       let pStr = seed.prices[variant.qty];
                                       if (typeof pStr === 'string') pStr = pStr.replace('.', '').replace(',', '.');
                                       const basePriceNum = parseFloat(pStr);
                                       const { id, ...data } = item;
                                       setDoc(doc(db, `users/${auth.currentUser?.uid}/cartItems/${item.id}`), {
                                         ...data,
                                         packCount: newCount,
                                         priceNum: basePriceNum * newCount
                                       });
                                     }
                                   }
                                 }}
                               >
                                 <span className="font-bold text-lg">-</span>
                               </button>
                               <span className="text-white font-black text-base w-4 text-center">
                                 {count}
                               </span>
                               <button 
                                 className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                                 onClick={() => { playSfx('click'); addToCart(); }}
                               >
                                 <span className="font-bold text-lg">+</span>
                               </button>
                            </div>
                             )
                           })()}
                        </div>

                        {/* SAVINGS BADGE */}
                        <div className="inline-flex">
                           <div className="bg-lime-500 text-black px-3 py-1.5 rounded-full font-black text-[11px] flex items-center gap-1.5 shadow-[0_4px_10px_rgba(163,230,53,0.3)] animate-pulse">
                              <span>Você economiza R$ {(parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.')) * 0.4).toFixed(2).replace('.',',')}</span>
                           </div>
                        </div>
                     </div>

                     <button 
                       onClick={() => { playSfx('click'); addToCart(); }}
                       className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-sm py-5 rounded-xl mb-3 transition-all shadow-[0_10px_20px_rgba(234,179,8,0.2)] active:scale-95 flex justify-center items-center gap-2 tracking-[0.1em]"
                     >
                       Adicionar ao carrinho
                     </button>

                     <div className="bg-white/5 rounded-full py-2.5 px-4 flex items-center gap-3 mb-6 border border-white/5">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                           Envio: Em até 24 horas úteis
                        </span>
                     </div>

                     <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between mb-6 group cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-lime-500/10 flex items-center justify-center text-2xl">🤝</div>
                           <div className="flex flex-col">
                              <span className="text-gray-200 text-xs font-black leading-tight mb-0.5">As sementes não germinaram?</span>
                              <span className="text-gray-500 text-[10px] font-bold">Nós enviamos outras para você! <span className="text-lime-500 underline">Política de Retorno</span></span>
                           </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                     </div>
                     
                     <div className="flex flex-col gap-3 py-4 border-t border-white/5">
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                              <Globe size={16} className="text-lime-500" />
                              Envio discreto para o mundo todo
                           </div>
                           <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[10px] text-gray-600">?</div>
                        </div>
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                              <div className="w-4 h-4 bg-lime-500/10 border border-lime-500/40 rounded flex items-center justify-center text-[10px] text-lime-500 font-black">$</div>
                              Diversas opções de pagamento
                           </div>
                           <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[10px] text-gray-600">?</div>
                        </div>
                     </div>

                     <button 
                       onClick={() => {
                          playSfx('click');
                          setG(p => ({...p, selSeed: seed, isAuto}));
                          setSelectedSeedId(null);
                          addLog(`🛒 Escolheu ${seed.name} (${isAuto ? 'Auto' : 'Fem'}) para plantar!`, '#ffff00');
                       }}
                       className="w-full bg-[#111] border border-[#333] hover:bg-[#222] hover:border-[#555] text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all active:scale-95 mb-4"
                     >
                       Plantar no Jogo Agora
                     </button>
                     
                     <div className="flex flex-col gap-2 mt-auto text-[10px] text-gray-500 font-medium pt-4">
                       <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#111] border border-[#333] flex items-center justify-center">🌎</div> Envio global seguro</div>
                       <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#111] border border-[#333] flex items-center justify-center">🛡️</div> Checkout anônimo</div>
                     </div>
                  </div>
                </div>

                {/* BOTTOM HALF: ROBUST INFO - WHITE/PRINT 2 STYLE ON DARK */}
                <div className="p-6 md:p-10 lg:p-14 flex flex-col gap-12 bg-[#050505]">
                    
                    {/* INFORMACOES DA STRAIN */}
                    <div>
                       <h3 className="text-2xl md:text-3xl font-bold text-white mb-5 border-l-4 border-lime-500 pl-4">{seed.name}</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">{specs.description}</p>
                    </div>

                    {/* GENETICA */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Genética</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">
                           O pool genético do mercado moderno de sementes de cannabis é muito grande e é necessário um talento especial para saber quais plantas cruzar para que possam reforçar as melhores características umas das outras. 
                           Para essa strain, a combinação vencedora inclui linhagens como <span className="text-white font-semibold">{seed.genetic}</span>. Com uma família tão respeitável, a híbrida resultante não poderia ser menos que espetacular.
                       </p>
                    </div>

                    {/* TEMPO DE FLORACAO */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Tempo de Floração</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">
                           Com um período de floração que gira em torno de <span className="text-white font-semibold">{specs.floweringTime}</span>, a {seed.name} é uma strain de finalização na medida, perfeita para growers impacientes e para produtores que procuram uma rotatividade rápida.
                       </p>
                    </div>

                    {/* RENDIMENTO */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Rendimento</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">
                           Essa strain produz rendimentos generosos de cerca de <span className="text-white font-semibold">{specs.yieldIndoor}</span> quando cultivada em indoor, o que está bem acima da média. No outdoor, é possível colher até <span className="text-white font-semibold">{specs.yieldOutdoor}</span> por planta, desde que as condições climáticas permitam que os buds amadureçam completamente antes do início do tempo frio.
                       </p>
                    </div>

                    {/* Efeitos */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Efeitos & Atributos</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide mb-10">
                           A {seed.name} oferece um efeito de corpo inteiro de primeira classe que relaxa todos os músculos e elimina todos os pensamentos ruins da sua cabeça, abrindo espaço para uma felicidade que consome tudo. O que você deve ter cuidado é com o poder chapante desse fumo - não inale muito profundamente ou seus joelhos podem tremer. 
                           <br/><br/>
                           <span className="italic text-gray-500">{seed.effect}</span>
                       </p>
                       <div className="relative">
                           {/* Glow de fundo dinâmico que pulsa baseada na cor da planta */}
                           <div 
                               className="absolute -inset-10 opacity-20 blur-[60px] rounded-full animate-pulse pointer-events-none z-0"
                               style={{ backgroundColor: seed.color }}
                           ></div>

                           <div className="flex flex-wrap gap-6 md:gap-10 pl-2 relative z-10">
                               {[
                                   { label: 'Relaxado', emoji: '😌', color: '#8b5cf6', sub: 'Corpo' },
                                   { label: 'Medicinal', emoji: '🌿', color: '#10b981', sub: seed.medicinalFor || 'Terapia' },
                                   { label: 'Feliz', emoji: '😁', color: '#fbbf24', sub: 'Mente' },
                                   { label: 'Foco', emoji: '🎯', color: '#06b6d4', sub: 'Energia' }
                               ].map((eff, i) => (
                                   <div key={i} className="flex flex-col items-center gap-3">
                                       <div className="relative group">
                                           <div 
                                               className="absolute -inset-1 bg-current opacity-0 group-hover:opacity-20 rounded-full blur transition-opacity h-full w-full"
                                               style={{ color: eff.color }}
                                           ></div>
                                           <div 
                                               className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0a0a0a] border-[2px] flex items-center justify-center text-2xl md:text-3xl shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] transition-all hover:scale-110 active:scale-95 cursor-default relative overflow-hidden"
                                               style={{ borderColor: `${eff.color}44`, color: eff.color }}
                                           >
                                               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                                               <span className="relative z-10">{eff.emoji}</span>
                                           </div>
                                       </div>
                                       <div className="flex flex-col items-center">
                                           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: eff.color }}>{eff.label}</span>
                                           <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 opacity-60 italic">{eff.sub}</span>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                    </div>

                    {/* Dicas de Cultivo */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Dicas de Cultivo</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide mb-4">
                           A {seed.name} é uma variedade universal que é especialmente recompensadora em ambientes externos, mas também se adapta a qualquer ambiente e configuração interna. Suas flores de cor escura crescem em enormes buds bem gordos, que são fáceis de trimmar, mas em cultivos outdoor, você deve esperar que os buds sejam mais folhosos. É fácil manter as plantas compactas e não muito altas, pois a altura da strain raramente ultrapassa os 120 cm.
                       </p>
                       <ul className="list-disc pl-6 text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide space-y-2">
                           <li>Você pode esperar um bud central bem grande, com uma ramificação substancial em buds menores e periféricos.</li>
                           <li>A planta é perfeita para o cultivo SOG em vasos de 10 a 12 litros.</li>
                           <li>A strain tem melhor desempenho quando treinada com ScrOG.</li>
                           <li>Ela pode assumir algumas tonalidades roxas se você fornecer temperaturas noturnas mais frias para a colheita.</li>
                       </ul>
                    </div>

                    {/* Sementes de {seed.name} */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Sementes de {seed.name}</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">
                           Aproveite a facilidade de cultivar a cannabis mais potente do mundo com nossas sementes {variant.type.toLowerCase()}s! Com a confiança de milhares de growers em todo o Brasil e Portugal, a HighBreed é a sua fonte de sementes de qualidade da {seed.name}. Compre online hoje mesmo e comece sua aventura no cultivo!
                       </p>
                    </div>

                    {/* FAQ da Cepa */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-6">FAQ da Cepa</h3>
                       
                       <div className="flex flex-col gap-6">
                           <div>
                               <h4 className="font-bold text-gray-200 text-base md:text-lg mb-2">É legal encomendar sementes de cannabis para o Brasil e Portugal?</h4>
                               <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">Sim. Na HighBreed, as sementes de cannabis são vendidas como souvenirs colecionáveis. Pedimos que verifique as leis locais antes de fazer o pedido, pois ao encomendar, confirma que está a cumpri-las.</p>
                           </div>
                           
                           <div>
                               <h4 className="font-bold text-gray-200 text-base md:text-lg mb-2">Esta cepa é adequada para cultivo outdoor no Brasil e Portugal?</h4>
                               <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">Com certeza. A {seed.name} é uma excelente escolha para o cultivo ao ar livre no clima de nossa região. Para garantir os melhores resultados possíveis, recomendamos verificar as preferências específicas da cepa na seção "Características" e compará-las com as suas condições locais.</p>
                           </div>

                           <div>
                               <h4 className="font-bold text-gray-200 text-base md:text-lg mb-2">Quais são os métodos de pagamento mais populares para clientes no Brasil e Portugal?</h4>
                               <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">Oferecemos uma variedade de opções de pagamento seguras. Estas incluem os principais cartões de crédito e débito (Visa, Mastercard), PIX, transferências bancárias e criptomoedas como Bitcoin e USDT. Para a lista mais precisa e atualizada de métodos disponíveis para o seu pedido específico, por favor, avance para a página de checkout.</p>
                           </div>
                       </div>
                    </div>

                    {/* Porquê Comprar */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Porquê Comprar Sementes da HighBreed</h3>
                       <ul className="list-disc pl-6 text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide space-y-2">
                           <li>Mais de 20 anos de confiança da comunidade de cultivadores.</li>
                           <li>Genética autêntica e garantida.</li>
                           <li>Envio discreto e rápido diretamente para sua casa.</li>
                       </ul>
                    </div>

                    {/* FAQ de Envio */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-6">FAQ de Envio</h3>
                       <div className="bg-[#111] rounded-xl border border-[#222] divide-y divide-[#222]">
                           <details className="group">
                               <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-gray-300 hover:text-white transition-colors">
                                   <span className="font-bold text-sm">O meu envio é discreto?</span>
                                   <span className="transition group-open:rotate-180 text-gray-500">
                                       <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                   </span>
                               </summary>
                               <div className="text-gray-400 p-5 pt-0 text-sm leading-[1.8]">
                                   Sim, todos os envios são feitos em embalagens discretas sem qualquer menção ao conteúdo ou à nossa logomarca no exterior do pacote.
                               </div>
                           </details>
                           <details className="group">
                               <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-gray-300 hover:text-white transition-colors">
                                   <span className="font-bold text-sm">Quando enviarão a minha encomenda?</span>
                                   <span className="transition group-open:rotate-180 text-gray-500">
                                       <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                   </span>
                               </summary>
                               <div className="text-gray-400 p-5 pt-0 text-sm leading-[1.8]">
                                   Os pedidos feitos e pagos até às 14:00 são enviados no mesmo dia útil. Pedidos em finais de semana ou feriados saem no próximo dia útil.
                               </div>
                           </details>
                           <details className="group">
                               <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-gray-300 hover:text-white transition-colors">
                                   <span className="font-bold text-sm">Depois de fazer uma encomenda, como obtenho o meu número de rastreio?</span>
                                   <span className="transition group-open:rotate-180 text-gray-500">
                                       <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                   </span>
                               </summary>
                               <div className="text-gray-400 p-5 pt-0 text-sm leading-[1.8]">
                                   Assim que o pacote for despachado, você receberá um e-mail com o link e o código de rastreio da transportadora.
                               </div>
                           </details>
                           <details className="group">
                               <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-gray-300 hover:text-white transition-colors">
                                   <span className="font-bold text-sm">Com que empresa fazem os envios?</span>
                                   <span className="transition group-open:rotate-180 text-gray-500">
                                       <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                   </span>
                               </summary>
                               <div className="text-gray-400 p-5 pt-0 text-sm leading-[1.8]">
                                   Trabalhamos com os Correios e transportadoras privadas de alta confiança, dependendo da sua localização e do método escolhido no checkout.
                               </div>
                           </details>
                       </div>
                    </div>

                    {/* Authors Info */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 bg-[#111] rounded-xl border border-[#222] p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#222]">
                                    <img src="https://i.pravatar.cc/150?img=11" className="w-full h-full object-cover" alt="Ethan Cole" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Escrito por</div>
                                    <div className="text-white font-bold text-sm">Ethan Cole</div>
                                    <div className="text-gray-500 text-xs">Especialista em cultivo de cannabis e escritor</div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs md:text-sm leading-[1.8]">Especialista em cultivo de cannabis com mais de uma década de experiência em cultivo indoor e na formação de cultivadores.</p>
                        </div>
                        <div className="flex-1 bg-[#111] rounded-xl border border-[#222] p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#222]">
                                    <img src="https://i.pravatar.cc/150?img=47" className="w-full h-full object-cover" alt="Sylvia Johnson" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Revisto por</div>
                                    <div className="text-white font-bold text-sm">Sylvia Johnson</div>
                                    <div className="text-gray-500 text-xs">Especialista em cultivo indoor</div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs md:text-sm leading-[1.8]">Consultora agronomista focada no estudo genético e aprimoramento de strains de alto rendimento em ambientes controlados.</p>
                        </div>
                    </div>

                    {/* Coleções Relacionadas */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Coleções Relacionadas</h3>
                       <div className="flex flex-wrap gap-4">
                           {[
                               { 
                                 icon: '⭐', 
                                 label: 'Growers Choice', 
                                 msg: 'A elite absoluta das genéticas mundiais. Sementes selecionadas manualmente por mestres cultivadores. Taxa de germinação de 99.9% garantida. Você merece o topo.',
                                 btn: 'GARANTIR MINHA GENÉTICA DE ELITE' 
                               },
                               { 
                                 icon: '♀️', 
                                 label: 'Feminizadas', 
                                 msg: 'Pare de perder tempo com machos. Garanta 100% de flores resinosas e densas em cada centímetro do seu grow. Eficiência máxima para quem leva o cultivo a sério.',
                                 btn: 'DOMINAR MEU ESPAÇO DE CULTIVO' 
                               },
                               { 
                                 icon: '⏱️', 
                                 label: 'Florescem Rápido', 
                                 msg: 'O atalho para o pote cheio. Ciclo acelerado que entrega potência máxima em tempo recorde. Ideal para quem busca eficiência total e colheitas contínuas.',
                                 btn: 'ACELERAR MINHA COLHEITA' 
                               },
                               { 
                                 icon: '💣', 
                                 label: 'Alto Teor THC', 
                                 msg: 'O limite extremo da potência. Tricomas transbordando THC puro para uma experiência profunda e inesquecível. Criada apenas para os paladares mais exigentes.',
                                 btn: 'QUERO A POTÊNCIA MÁXIMA' 
                               },
                               { 
                                 icon: '⚖️', 
                                 label: 'Alto Rendimento', 
                                 msg: 'Colheitas monstruosas que vergam os galhos. Genética estabilizada para produção comercial em pequena escala. Veja seu investimento triplicar em flores.',
                                 btn: 'MULTIPLICAR MEUS RESULTADOS' 
                               },
                               { 
                                 icon: '🌱', 
                                 label: 'Externo', 
                                 msg: 'Resistência ancestral sob a luz do sol. Plantas que se tornam verdadeiras árvores, resistindo bravamente a pragas e variações. Colha o poder da natureza bruta.',
                                 btn: 'CULTIVAR MEU MONSTRO NO SOL' 
                               }
                            ].map((col, idx) => (
                               <div 
                                   key={idx} 
                                   onClick={(e) => {
                                       e.stopPropagation();
                                       playSfx('click');
                                       setPopupMsg({ title: col.label, message: col.msg, btnText: col.btn });
                                   }}
                                   className="flex flex-col items-center justify-center gap-3 bg-[#111] border border-[#222] rounded-xl p-4 w-[100px] h-[100px] md:w-[120px] md:h-[120px] hover:border-lime-500/50 hover:bg-[#1a1a1a] transition-colors cursor-pointer group shadow-sm"
                               >
                                   <div className="text-3xl group-hover:scale-110 transition-transform">{col.icon}</div>
                                   <span className="text-[9px] md:text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest leading-tight">{col.label}</span>
                               </div>
                           ))}
                       </div>
                    </div>

                    {/* Produtos Similares */}
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6 border-b border-[#222] pb-4">Produtos similares</h3>
                        <div className="flex overflow-x-auto pb-6 gap-4 scrollbar-thin scrollbar-thumb-lime-500 scrollbar-track-green-950 snap-x">
                            {SEEDS.filter(s => s.id !== seed.id).map(s => (
                                <div key={s.id} className="min-w-[240px] max-w-[240px] bg-[#0a0a0a] border border-[#222] rounded-xl p-4 flex flex-col group hover:border-[#444] transition-colors relative snap-center snap-always shrink-0">
                                    <div className="absolute top-4 left-4 bg-lime-500 text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded z-10">
                                        Garantia de 1 ano
                                    </div>
                                    <div className="absolute top-10 left-4 bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded z-10">
                                        Top
                                    </div>
                                    <button 
                                        className="absolute top-4 right-4 text-gray-500 hover:text-white z-10 p-2"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            playSfx('click');
                                            if (!auth.currentUser) {
                                                setIsAuthOpen(true);
                                                return;
                                            }
                                            const isFav = favorites.includes(String(s.id));
                                            const strId = String(s.id);
                                            setFavorites(prev => isFav ? prev.filter(f => f !== strId) : [...prev, strId]);
                                            
                                            try {
                                                if (isFav) {
                                                  await deleteDoc(doc(db, `users/${auth.currentUser.uid}/favorites/${s.id}`));
                                                } else {
                                                  await setDoc(doc(db, `users/${auth.currentUser.uid}/favorites/${s.id}`), {
                                                    seedId: strId,
                                                    addedAt: Date.now()
                                                  });
                                                }
                                            } catch (err) {
                                                setFavorites(prev => !isFav ? prev.filter(f => f !== strId) : [...prev, strId]);
                                                console.error(err);
                                            }
                                        }}
                                    >
                                        <Heart size={18} fill={favorites.includes(String(s.id)) ? 'currentColor' : 'none'} className={favorites.includes(String(s.id)) ? 'text-pink-500' : ''} />
                                    </button>
                                    <div className="h-40 w-full mb-4 relative overflow-hidden flex items-center justify-center pt-2">
                                        <img src={s.image} alt={s.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-500 cursor-pointer" onClick={() => setSelectedSeedId(s.id)} />
                                    </div>
                                    <div className="flex justify-center mb-2">
                                        <span className="bg-lime-500/10 text-lime-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-lime-500/30">
                                            {s.fem.thc}% THC
                                        </span>
                                    </div>
                                    <h4 className="text-white text-sm font-bold text-center mb-1 line-clamp-1 cursor-pointer hover:underline" onClick={() => setSelectedSeedId(s.id)}>{s.name}</h4>
                                    <div className="flex justify-center items-center gap-1 text-[11px] text-gray-400 mb-2">
                                        <span className="text-yellow-500 text-xs">
                                            {s.rating === '5.0' ? '★★★★★' : '★★★★½'}
                                        </span> 
                                        {s.rating || '5.0'} ({s.reviews || 0})
                                    </div>
                                    <div className="flex justify-center gap-2 text-[9px] text-gray-500 font-bold uppercase mb-4 tracking-wider">
                                        <span className="bg-[#111] px-1.5 py-0.5 rounded border border-[#222]">Feminizada</span>
                                        <span className="bg-[#111] px-1.5 py-0.5 rounded border border-[#222]">Automática</span>
                                    </div>
                                    <div className="text-[9px] text-center text-gray-500 mb-1 uppercase tracking-widest font-bold">Pacote (Número de sementes)</div>
                                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                                        {QUANTITIES.map((q, qIdx) => {
                                            const activeQ = similarQtys[s.id] || 'X2';
                                            const isActive = activeQ === q;
                                            return (
                                                <button 
                                                    key={q} 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        playSfx('click'); 
                                                        setSimilarQtys(p => ({ ...p, [s.id]: q as Quantity })); 
                                                    }}
                                                    className={`text-[9px] px-1.5 py-1 rounded font-bold border flex-1 ${isActive ? 'border-lime-500 text-lime-500 bg-lime-500/10 shadow-[0_0_10px_rgba(163,230,53,0.1)]' : 'border-[#333] text-gray-400 hover:bg-[#222]'}`}
                                                >
                                                    {q}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-center font-bold text-2xl text-white vt mb-3">
                                        R$ {s.prices[similarQtys[s.id] || 'X2']}
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playSfx('click');
                                            setSelectedSeedId(s.id);
                                        }}
                                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-wider text-xs py-3 rounded-lg transition-colors mt-auto shadow-[0_0_15px_rgba(253,224,71,0.1)] active:scale-95"
                                    >
                                        Comprar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter & Footer inside the modal */}
                    <div className="-mx-6 md:-mx-10 lg:-mx-14 mt-6">
                        {/* Newsletter Strip */}
                        <div className="w-full bg-[#dcf1e2] border-[3px] border-[#a8d0b5] rounded-xl relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mt-8">
                          <div className="flex-shrink-0 w-32 md:w-48">
                            <img src="/gifs/elite_seed.gif" alt="mascot" className="w-full object-contain filter drop-shadow-lg" />
                          </div>
                          
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl md:text-3xl font-black text-[#2E7A4A] mb-2 leading-tight font-sans">Poucos vão ver isso...</h3>
                            <p className="text-sm text-[#444] font-medium leading-relaxed max-w-lg font-sans">
                              Estamos liberando um lote limitado de sementes <strong className="font-bold">GRÁTIS</strong> para quem entrar agora.
                              Se você curte genética premium, essa é sua chance de testar sem risco.<br/><br/>
                              ⚠️ Apenas para quem seguir as regras e agir rápido.
                            </p>
                          </div>

                          <div className="flex-1 w-full flex flex-col items-center md:items-end justify-center">
                            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-xl transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(37,211,102,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] active:scale-95 shadow-[#25D366]/20 font-sans">
                                <MessageCircle size={24} />
                                CHAMAR NO WHATSAPP
                            </a>
                          </div>
                        </div>

                        {/* Footer Strip */}
                        <div className="bg-[#2E7D32] text-white p-8 md:p-12 pb-20 font-sans">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-5xl mx-auto">
                                <div>
                                    <h4 className="font-extrabold text-sm md:text-base mb-5 text-white uppercase tracking-wider">Informação</h4>
                                    <ul className="text-sm font-medium space-y-3 text-[#E8F5E9]">
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Envio</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Acompanhar o meu pedido</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Política de Devolução</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Lista de preços</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Promoções</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-sm md:text-base mb-5 text-white uppercase tracking-wider">Empresa</h4>
                                    <ul className="text-sm font-medium space-y-3 text-[#E8F5E9]">
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4" onClick={(e) => { e.preventDefault(); setSelectedSeedId(null); setCurrentView('about'); }}>Sobre nós</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Contatos</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Avaliações</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Programa de Afiliados</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Nossos autores</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Mapa do site</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-sm md:text-base mb-5 text-white uppercase tracking-wider">Termos de serviço</h4>
                                    <ul className="text-sm font-medium space-y-3 text-[#E8F5E9]" onClick={(e) => {
                                      e.preventDefault();
                                      const target = e.target as HTMLElement;
                                      if (target.tagName === 'A') {
                                        const title = target.textContent || '';
                                        if (title === 'Termos e Condições') {
                                          setCurrentView('terms');
                                          window.scrollTo(0, 0);
                                          return;
                                        }
                                        if (title === 'Isenção de Responsabilidade Limitada') {
                                          setCurrentView('disclaimer');
                                          window.scrollTo(0, 0);
                                          return;
                                        }
                                        if (title === 'Política de Privacidade') {
                                          setCurrentView('privacy');
                                          window.scrollTo(0, 0);
                                          return;
                                        }
                                        if (title === 'Política de Cookies') {
                                          setCurrentView('cookies');
                                          window.scrollTo(0, 0);
                                          return;
                                        }
                                        if (title === 'Aviso Legal') {
                                          setCurrentView('legal');
                                          window.scrollTo(0, 0);
                                          return;
                                        }
                                        setPopup({
                                          title: title.toUpperCase(),
                                          body: (
                                            <div className="p-8 text-[#2c3e2c] bg-white rounded-lg shadow-xl font-sans text-sm leading-relaxed space-y-4">
                                              <p>
                                              </p>
                                            </div>
                                          )
                                        });
                                      }
                                    }}>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Termos e Condições</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Isenção de Responsabilidade Limitada</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Política de Privacidade</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Política de Cookies</a></li>
                                        <li><a href="#" className="hover:text-white hover:underline decoration-white/30 underline-offset-4">Aviso Legal</a></li>
                                    </ul>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <h4 className="font-extrabold text-sm md:text-base mb-4 text-white uppercase tracking-wider">Aceitamos</h4>
                                    <div className="flex gap-2">
                                        <div className="bg-white px-3 py-1.5 rounded text-[#111] font-black text-xs shadow-sm">VISA</div>
                                        <div className="bg-white px-3 py-1.5 rounded text-[#111] font-black text-xs flex items-center shadow-sm">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#EA001B] inline-block -mr-1 mix-blend-multiply relative z-10"></span>
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] inline-block opacity-90"></span>
                                        </div>
                                    </div>
                                    <h4 className="font-extrabold text-sm md:text-base mt-8 mb-3 text-white uppercase tracking-wider">Envio Internacional</h4>
                                    <div className="text-xs text-[#E8F5E9] font-medium flex items-center gap-1">Outros países <span className="text-sm">🌎</span></div>
                                </div>
                            </div>
                            
                            <div className="max-w-5xl mx-auto border-t border-[#4CAF50] pt-10">
                                <p className="text-[10px] md:text-xs text-[#C8E6C9] leading-relaxed font-medium mb-10 text-justify">
                                    Na HighBreed Head Shop, são vendidas sementes de cannabis como souvenirs, as quais não devem ser germinadas onde sejam ilegais. Ao comprá-las, você confirma que tem a idade legal para isso e está ciente das legislações e regulamentações locais. A HighBreed Head Shop não é responsável por quaisquer violações da lei. Os produtos e as informações contidas neste site não foram avaliados pela Anvisa/FDA e NÃO têm a pretensão de diagnosticar, tratar, curar ou prevenir qualquer enfermidade. Todos os produtos contêm menos de 0,3% de THC, quando aplicável, de acordo com as regulamentações locais. Por favor, certifique-se da conformidade com suas leis locais, já que a HighBreed não oferece aconselhamento legal e não assume qualquer responsabilidade pelo uso ou cultivo de cannabis em áreas onde isso é proibido.
                                </p>
                                <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-xs font-bold text-[#E8F5E9]">
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl font-black font-sans tracking-tighter text-white">HighBreed<span className="text-lime-400">.</span></div>
                                        <div className="hidden md:flex gap-2">
                                            <span className="bg-white/10 px-2 py-1 rounded text-[10px] uppercase">Avaliação ⭐⭐⭐⭐⭐</span>
                                            <span className="bg-white/10 px-2 py-1 rounded text-[10px] uppercase">Google Excellent 4.8</span>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right flex flex-col items-center md:items-end leading-relaxed text-[10px]">
                                        <span>Os pagamentos feitos neste site podem ser processados de duas formas:</span>
                                        <span className="text-[#A5D6A7]"> — Diretamente pela HighBreed Seeds Ltd.</span>
                                        <span className="text-[#A5D6A7]"> — Através do nosso provedor de serviços de pagamento, com número de ID fiscal local.</span>
                                        <span className="mt-3 text-white">Copyright © 2007-{(new Date().getFullYear())} HighBreed</span>
                                    </div>
                                    <div className="text-4xl text-white md:ml-4 font-black">18+</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

              </div>
            </div>
          </div>
        );

      })()}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        onCheckout={() => setCurrentView('checkout')}
      />
      <FavoritesModal isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} favorites={favorites} />
      <OrdersModal isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} orders={orders} />

      {/* Popup de Informação Estratégica - Z-index super elevado para ficar acima dos detalhes da semente */}
      {popupMsg && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setPopupMsg(null)}
          ></div>
          
          <div className="bg-[#111] border-2 border-lime-500 rounded-2xl p-6 md:p-10 max-w-lg w-full relative z-[100001] shadow-[0_0_100px_rgba(163,230,53,0.3)] flex flex-col items-center text-center scale-up-center">
            {/* Lacre de Segurança/Qualidade */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black text-[10px] uppercase tracking-[3px] px-6 py-2 rounded-full shadow-[0_5px_15px_rgba(234,179,8,0.3)] whitespace-nowrap">
              Qualidade Certificada
            </div>

            <button 
              onClick={() => setPopupMsg(null)}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors p-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-green-600 text-black rounded-3xl flex items-center justify-center mb-8 rotate-12 shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-2 border-black/20">
              <span className="text-4xl font-bold">!</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 vt leading-none italic">
              {popupMsg.title}
            </h2>

            <div className="w-20 h-1 bg-lime-400 mb-6 rounded-full shadow-[0_0_10px_#84cc16]"></div>

            <p className="text-gray-100 text-lg md:text-xl mb-8 leading-relaxed font-bold tracking-tight px-2">
              {popupMsg.message}
            </p>

            <div className="w-full space-y-4">
              <button 
                onClick={() => {
                  setPopupMsg(null);
                  // Mantém o usuário onde ele está para continuar a leitura/compra
                }}
                className="w-full bg-[#ff00ff] hover:bg-[#d400d4] text-white font-black uppercase tracking-widest py-5 rounded-xl transition-all text-sm shadow-[0_5px_25px_rgba(255,0,255,0.4)] hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 group border-b-4 border-[#8b008b]"
              >
                <span>{popupMsg.btnText}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <div className="flex flex-col gap-1 pt-2">
                <p className="text-yellow-400 text-[11px] font-black uppercase tracking-wider animate-pulse">
                   ⚠️ ESTOQUE LIMITADO: ÚLTIMAS UNIDADES COM DESCONTO! 
                </p>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">
                  Não perca a chance de ter uma genética de elite no seu grow
                </p>
              </div>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            .scale-up-center {
              animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
            }
            @keyframes scale-up-center {
              0% { transform: scale(0.3); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}} />
        </div>
      )}

    </div>
  );
}
