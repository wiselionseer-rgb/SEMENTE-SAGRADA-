import React, { useState, useEffect } from 'react';
import { SEEDS, QUANTITIES, Quantity } from './data';

export default function ManualPage({ onBack, onSelectSeed }: { onBack: () => void, onSelectSeed?: (id: number) => void }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState('fem_reg');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [shopVariants, setShopVariants] = useState<Record<number, { qty: Quantity, type: 'Feminizada' | 'Automatica' }>>({});
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const [isAccessing, setIsAccessing] = useState(false);

  const openArticle = (item: any) => {
    setIsAccessing(true);
    setTimeout(() => {
      setActiveArticle(item);
      setIsAccessing(false);
    }, 1500);
  };

  const quizQuestions = [
    { q: "Qual o seu principal objetivo?", options: ["Relaxamento profundo", "Energia e Criatividade", "Uso Medicinal"] },
    { q: "Onde você vai cultivar?", options: ["Ambiente interno (espaço reduzido)", "Ao ar livre (com bastante sol)"] },
    { q: "Temperaturas na sua região?", options: ["Principalmente calor", "Clima ameno ou frio"] },
    { q: "Qual aroma você prefere?", options: ["Frutados / Doces", "Terrosos / Pinho", "Cítricos"] },
    { q: "Sua experiência de cultivo?", options: ["Nenhuma (é minha primeira vez)", "Tenho uma noção básica", "Já plantei antes"] },
    { q: "Você tem pressa?", options: ["Quero minha colheita o mais rápido possível", "Posso esperar para ter rendimentos maiores"] }
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-black min-h-screen font-sans text-white pb-20 relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#84cc16 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      {/* HEADER BANNER */}
      <div className="w-full bg-[#050505] relative overflow-hidden h-[180px] md:h-[240px] flex items-center justify-center border-b border-white/5">
        <div className="absolute inset-0 z-0 opacity-20 bg-center bg-cover mix-blend-overlay" style={{backgroundImage: "url('/gif/banner_bg.gif')"}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
        
        <div className="relative z-10 flex items-center gap-6 w-full max-w-7xl px-8">
          <img src="/gifs/Design sem nome (2).gif" className="h-[140px] md:h-[200px] object-contain drop-shadow-[0_0_20px_rgba(132,204,22,0.3)]" alt="Mascot" />
          <div className="flex flex-col">
            <span className="text-lime-500 pixel text-[10px] tracking-[0.3em] mb-2">MODULO DE APRENDIZADO</span>
            <h1 className="text-white text-lg md:text-2xl font-black uppercase tracking-tighter leading-none pixel">
              SEEDS FOR <br/><span className="text-lime-400">BEGINNERS</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-12 relative z-10">
        <button 
          onClick={onBack}
          className="mb-12 text-[10px] font-black text-white/30 hover:text-lime-400 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group pixel"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> IR PARA CENTRAL
        </button>

        <p className="text-center text-white/40 font-medium mb-12 max-w-3xl mx-auto text-sm md:text-base leading-relaxed italic border-x border-white/5 px-8">
          "Faça todos os passos e ganhe sementes de graça com seu primeiro pedido para marcar o início da nossa amizade."
        </p>

        {/* TIMELINE */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-24">
          <button onClick={() => scrollTo('step-1')} className="flex items-center gap-3 bg-white/5 border border-white/5 hover:border-lime-500/30 transition-all text-white/50 hover:text-lime-400 px-6 py-3 rounded-2xl pixel text-[9px] uppercase tracking-widest">
            <span className="text-lg grayscale group-hover:grayscale-0">👨‍🌾</span> 01. Básico
          </button>
          <div className="w-4 h-[1px] bg-white/10 hidden md:block"></div>
          <button onClick={() => scrollTo('step-2')} className="flex items-center gap-3 bg-lime-500/10 border border-lime-500/20 transition-all text-lime-400 px-6 py-3 rounded-2xl pixel text-[9px] uppercase tracking-widest shadow-[0_0_20px_rgba(132,204,22,0.1)]">
            <span className="text-lg">🌰</span> 02. Cepas
          </button>
          <div className="w-4 h-[1px] bg-white/10 hidden md:block"></div>
          <button onClick={() => scrollTo('step-3')} className="flex items-center gap-3 bg-white/5 border border-white/5 hover:border-lime-500/30 transition-all text-white/50 hover:text-lime-400 px-6 py-3 rounded-2xl pixel text-[9px] uppercase tracking-widest">
            <span className="text-lg grayscale group-hover:grayscale-0">📖</span> 03. Cultivo
          </button>
          <div className="w-4 h-[1px] bg-white/10 hidden md:block"></div>
          <button onClick={() => scrollTo('step-4')} className="flex items-center gap-3 bg-white/5 border border-white/5 hover:border-lime-500/30 transition-all text-white/50 hover:text-lime-400 px-6 py-3 rounded-2xl pixel text-[9px] uppercase tracking-widest">
            <span className="text-lg grayscale group-hover:grayscale-0">🛒</span> 04. Pedido
          </button>
        </div>

        {/* STEP 1 */}
        <div id="step-1" className="mb-32 scroll-m-20">
           <div className="flex flex-col items-center mb-12">
              <span className="text-lime-500 pixel text-[8px] tracking-[0.4em] mb-4">FASE ALPHA</span>
              <h2 className="text-center text-base md:text-lg font-black text-white px-6 py-3 border-y border-white/5 pixel uppercase tracking-tighter">
                <span className="text-lime-400">01.</span> BASICO DO SISTEMA
              </h2>
           </div>

           <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[3rem] p-12 border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-lime-500/30 to-transparent"></div>
             
             <div className="flex flex-wrap justify-center border-b border-white/5 pb-10 mb-12 gap-10">
               <div onClick={() => setActiveTab('fem_reg')} className={`flex flex-col items-center cursor-pointer transition-all ${activeTab === 'fem_reg' ? 'text-lime-400 scale-110' : 'text-white/20 hover:text-white/40'}`}>
                 <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl mb-4 transition-all ${activeTab === 'fem_reg' ? 'border-lime-500/50 bg-lime-500/10 shadow-[0_0_20px_rgba(132,204,22,0.2)]' : 'border-white/5 bg-white/5 opacity-50'}`}>
                   ♀️
                 </div>
                 <span className="font-black text-[10px] pixel tracking-tighter uppercase">Fem vs Reg</span>
               </div>
               <div onClick={() => setActiveTab('auto_photo')} className={`flex flex-col items-center cursor-pointer transition-all ${activeTab === 'auto_photo' ? 'text-lime-400 scale-110' : 'text-white/20 hover:text-white/40'}`}>
                 <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl mb-4 transition-all ${activeTab === 'auto_photo' ? 'border-lime-500/50 bg-lime-500/10 shadow-[0_0_20px_rgba(132,204,22,0.2)]' : 'border-white/5 bg-white/5 opacity-50'}`}>⏱️</div>
                 <span className="font-black text-[10px] pixel tracking-tighter uppercase">Auto vs Foto</span>
               </div>
               <div onClick={() => setActiveTab('indoor_outdoor')} className={`flex flex-col items-center cursor-pointer transition-all ${activeTab === 'indoor_outdoor' ? 'text-lime-400 scale-110' : 'text-white/20 hover:text-white/40'}`}>
                 <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl mb-4 transition-all ${activeTab === 'indoor_outdoor' ? 'border-lime-500/50 bg-lime-500/10 shadow-[0_0_20px_rgba(132,204,22,0.2)]' : 'border-white/5 bg-white/5 opacity-50'}`}>🏠</div>
                 <span className="font-black text-[10px] pixel tracking-tighter uppercase">Indoor vs Out</span>
               </div>
               <div onClick={() => setActiveTab('indica_sativa')} className={`flex flex-col items-center cursor-pointer transition-all ${activeTab === 'indica_sativa' ? 'text-lime-400 scale-110' : 'text-white/20 hover:text-white/40'}`}>
                 <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl mb-4 transition-all ${activeTab === 'indica_sativa' ? 'border-lime-500/50 bg-lime-500/10 shadow-[0_0_20px_rgba(132,204,22,0.2)]' : 'border-white/5 bg-white/5 opacity-50'}`}>🧬</div>
                 <span className="font-black text-[10px] pixel tracking-tighter uppercase">Indica vs Sat</span>
               </div>
             </div>

             <div className="grid md:grid-cols-2 gap-16 px-4 md:px-12 min-h-[300px]">
               {activeTab === 'fem_reg' && (
                 <>
                   <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-2xl text-lime-400 font-bold shadow-[0_0_15px_rgba(132,204,22,0.1)]">♀</div>
                        <h3 className="font-black text-xs uppercase text-white pixel tracking-[0.2em]">SISTEMA FEMINIZADO</h3>
                      </div>
                      <ul className="space-y-4 text-sm text-white/40 font-medium">
                        <li className="flex gap-3"><span className="text-lime-500">■</span> 99% de plantas femininas, essenciais para buds</li>
                        <li className="flex gap-3"><span className="text-lime-500">■</span> Protocolo ideal para iniciantes em rede</li>
                        <li className="flex gap-3"><span className="text-lime-500">■</span> Maior valor agregado em cripto-ativos</li>
                        <li className="flex gap-3"><span className="text-lime-500">■</span> Perfeitas para consumo direto</li>
                      </ul>
                   </div>
                   <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl text-white/40 font-bold">⚥</div>
                         <h3 className="font-black text-xs uppercase text-white pixel tracking-[0.2em] opacity-50">SISTEMA REGULAR</h3>
                      </div>
                      <ul className="space-y-4 text-sm text-white/20 font-medium italic">
                        <li className="flex gap-3"><span>○</span> Plantas masculinas e femininas (não produzem buds)</li>
                        <li className="flex gap-3"><span>○</span> Foco em breeders e criadores de protocolo</li>
                        <li className="flex gap-3"><span>○</span> Valor de entrada reduzido</li>
                        <li className="flex gap-3"><span>○</span> Perfeitas para cruzamentos e novas genéticas</li>
                      </ul>
                   </div>
                 </>
               )}

               {activeTab === 'auto_photo' && (
                 <>
                   <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-2xl text-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.1)]">⏱️</div>
                        <h3 className="font-black text-xs uppercase text-white pixel tracking-[0.2em]">AUTOMÁTICAS</h3>
                      </div>
                      <ul className="space-y-4 text-sm text-white/40 font-medium">
                        <li className="flex gap-3"><span className="text-lime-500">■</span> Protocolo de floração independente de rede</li>
                        <li className="flex gap-3"><span className="text-lime-500">■</span> Ciclo ultra-rápido (60-90 dias)</li>
                        <li className="flex gap-3"><span className="text-lime-500">■</span> Alta tolerância a erros de sistema</li>
                        <li className="flex gap-3"><span className="text-lime-500">■</span> Compactas, ocupam pouco espaço em disco</li>
                      </ul>
                   </div>
                   <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl text-white/40">☀️</div>
                         <h3 className="font-black text-xs uppercase text-white pixel tracking-[0.2em] opacity-50">FOTOPERÍODO</h3>
                      </div>
                      <ul className="space-y-4 text-sm text-white/20 font-medium italic">
                        <li className="flex gap-3"><span>○</span> Dependem do ciclo de rede (12/12)</li>
                        <li className="flex gap-3"><span>○</span> Escalonamento massivo de recursos</li>
                        <li className="flex gap-3"><span>○</span> Suporta stress avançado (High Stress Training)</li>
                        <li className="flex gap-3"><span>○</span> Fase vegetativa controlada pelo usuário</li>
                      </ul>
                   </div>
                 </>
               )}
                {activeTab === 'indoor_outdoor' && (
                  <>
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                       <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-2xl text-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.1)]">🏠</div>
                         <h3 className="font-black text-xs uppercase text-white pixel tracking-[0.2em]">CULTIVO INDOOR</h3>
                       </div>
                       <ul className="space-y-4 text-sm text-white/40 font-medium">
                         <li className="flex gap-3"><span className="text-lime-500">■</span> Controle total de variáveis climáticas</li>
                         <li className="flex gap-3"><span className="text-lime-500">■</span> Discrição máxima e segurança de rede</li>
                         <li className="flex gap-3"><span className="text-lime-500">■</span> Qualidade superior e buds densos</li>
                         <li className="flex gap-3"><span className="text-lime-500">■</span> Independência total das estações do ano</li>
                       </ul>
                    </div>
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl text-white/40">🌳</div>
                          <h3 className="font-black text-xs uppercase text-white pixel tracking-[0.2em] opacity-50">CULTIVO OUTDOOR</h3>
                       </div>
                       <ul className="space-y-4 text-sm text-white/20 font-medium italic">
                         <li className="flex gap-3"><span>○</span> Energia solar gratuita e ilimitada</li>
                         <li className="flex gap-3"><span>○</span> Plantas gigantes com rendimento massivo</li>
                         <li className="flex gap-3"><span>○</span> Ecossistema natural e micro-vida</li>
                         <li className="flex gap-3"><span>○</span> Menor investimento inicial em hardware</li>
                       </ul>
                    </div>
                  </>
                )}
                {activeTab === 'indica_sativa' && (
                  <>
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                       <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-2xl text-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.1)]">🌿</div>
                         <h3 className="font-black text-xs uppercase text-white pixel tracking-[0.2em]">DOMINÂNCIA INDICA</h3>
                       </div>
                       <ul className="space-y-4 text-sm text-white/40 font-medium">
                         <li className="flex gap-3"><span className="text-lime-500">■</span> Efeito relaxante e sedativo profundo</li>
                         <li className="flex gap-3"><span className="text-lime-500">■</span> Estrutura baixa, compacta e robusta</li>
                         <li className="flex gap-3"><span className="text-lime-500">■</span> Floração mais rápida da categoria</li>
                         <li className="flex gap-3"><span className="text-lime-500">■</span> Ideal para controle de ansiedade e sono</li>
                       </ul>
                    </div>
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl text-white/40">🌴</div>
                          <h3 className="font-black text-xs uppercase text-white pixel tracking-[0.2em] opacity-50">DOMINÂNCIA SATIVA</h3>
                       </div>
                       <ul className="space-y-4 text-sm text-white/20 font-medium italic">
                         <li className="flex gap-3"><span>○</span> Efeito energético, criativo e cerebral</li>
                         <li className="flex gap-3"><span>○</span> Plantas altas que "esticam" na floração</li>
                         <li className="flex gap-3"><span>○</span> Perfil de terpenos cítricos e complexos</li>
                         <li className="flex gap-3"><span>○</span> Ideal para uso diurno e atividades sociais</li>
                       </ul>
                    </div>
                  </>
                )}
             </div>
           </div>
        </div>

        {/* STEP 2 */}
        <div id="step-2" className="mb-32 scroll-m-20">
           <div className="flex flex-col items-center mb-12">
              <span className="text-lime-500 pixel text-[8px] tracking-[0.4em] mb-4">FASE BETA</span>
              <h2 className="text-center text-base md:text-lg font-black text-white px-6 py-3 border-y border-white/5 pixel uppercase tracking-tighter">
                <span className="text-lime-400">02.</span> ESCOLHA DO PROTOCOLO
              </h2>
           </div>

           <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[3rem] overflow-hidden mb-16 border border-white/5 flex flex-col items-center relative shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-lime-500/30 to-transparent"></div>
             
             <div className="p-10 md:p-20 text-center max-w-3xl z-10">
               {quizStarted ? (
                 quizStep < quizQuestions.length ? (
                   <div className="flex flex-col items-center animate-in fade-in duration-500">
                     <span className="text-lime-500 pixel text-[9px] mb-4">ETAPA {quizStep + 1}/{quizQuestions.length}</span>
                     <h4 className="font-bold text-white text-xl mb-10 pixel tracking-tighter">{quizQuestions[quizStep].q}</h4>
                     <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                       {quizQuestions[quizStep].options.map((opt, idx) => (
                         <button 
                           key={idx}
                           onClick={() => setQuizStep(p => p + 1)}
                           className="bg-white/5 hover:bg-lime-500/10 hover:border-lime-500/50 border border-white/10 text-white/70 hover:text-lime-400 font-bold py-4 px-8 rounded-2xl transition-all text-xs pixel tracking-widest shadow-lg"
                         >
                           {opt}
                         </button>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center animate-in zoom-in duration-700">
                     <div className="text-6xl mb-6 drop-shadow-[0_0_20px_rgba(132,204,22,0.4)]">🚀</div>
                     <h4 className="font-black text-lime-400 text-2xl mb-4 pixel tracking-tighter">PROTOCOLOS IDENTIFICADOS</h4>
                     <p className="text-white/40 text-sm mb-6 italic">"Seu perfil de cultivador foi mapeado em nossa rede."</p>
                     
                     <div className="w-full mb-8 pt-4 border-t border-white/5">
                        <h5 className="text-[10px] font-black text-lime-400 mb-4 pixel tracking-widest uppercase">CONEXÃO ESTABELECIDA: RECOMENDAÇÕES PARA VOCÊ</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                           {SEEDS.slice(0, 2).map((seed, k) => (
                              <div 
                                 key={k} 
                                 onClick={() => onSelectSeed?.(seed.id)}
                                 className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col items-center gap-4 hover:border-lime-500/50 hover:bg-lime-500/5 transition-all group/rec cursor-pointer shadow-2xl relative overflow-hidden"
                              >
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 blur-[60px] pointer-events-none group-hover/rec:bg-lime-500/10 transition-all"></div>
                                 
                                 <div className="w-full aspect-square rounded-3xl overflow-hidden border border-white/10 relative shadow-inner">
                                    <img 
                                       src={seed.image} 
                                       alt={seed.name} 
                                       className="w-full h-full object-cover grayscale group-hover/rec:grayscale-0 group-hover/rec:scale-110 transition-all duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/rec:opacity-100 transition-opacity"></div>
                                 </div>

                                 <div className="w-full text-center">
                                    <div className="text-xs font-black text-lime-400 mb-1 pixel tracking-[0.2em] uppercase">Mecanismo Ideal</div>
                                    <div className="text-sm md:text-base font-black text-white mb-2 pixel tracking-tighter truncate w-full">{seed.name}</div>
                                    <div className="flex items-center justify-center gap-4 mt-4">
                                       <div className="flex flex-col items-end border-r border-white/10 pr-4">
                                          <span className="text-[8px] text-white/40 pixel uppercase">A partir de</span>
                                          <span className="text-xl text-yellow-500 vt leading-none">R$ {seed.prices['X2']}</span>
                                       </div>
                                       <button className="bg-lime-500 text-black font-black text-[10px] px-6 py-3 rounded-xl hover:bg-lime-400 transition-colors pixel uppercase tracking-widest shadow-lg">
                                          ACESSAR
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-wrap justify-center gap-4">
                       <button onClick={() => { setQuizStarted(false); setQuizStep(0); }} className="text-white/20 hover:text-white/50 text-[9px] pixel uppercase tracking-widest underline decoration-dotted">Reiniciar Scan</button>
                       <button onClick={onBack} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black text-[10px] px-8 py-3 rounded-xl transition-all pixel tracking-widest uppercase">FECHAR E VOLTAR</button>
                     </div>
                   </div>
                 )
               ) : (
                 <>
                   <h3 className="font-black text-base md:text-lg text-white mb-8 pixel tracking-widest uppercase">NEXUS DISCOVERY: <span className="text-lime-400">BEGINNER SCAN</span></h3>
                   <p className="text-white/40 text-sm leading-relaxed mb-12 font-medium italic">
                     "Nós queremos que você se dê bem - e é por isso que criamos este quiz interativo. Responda apenas a 6 perguntas, e você terá uma cepa potente e saborosa que irá sobreviver a qualquer erro que você possa cometer."
                   </p>
                   <button 
                     onClick={() => setQuizStarted(true)}
                     className="bg-lime-500 hover:bg-lime-400 text-black font-black text-[11px] px-12 py-5 rounded-2xl transition-all pixel tracking-widest shadow-[0_10px_40px_rgba(132,204,22,0.2)]"
                   >
                     INICIAR DIAGNÓSTICO
                   </button>
                 </>
               )}
             </div>
             <div className="w-full bg-gradient-to-t from-lime-500/10 to-transparent relative flex justify-center pt-10">
                <img src="/gifs/Design sem nome (3).gif" className="h-[220px] object-contain opacity-40 mix-blend-screen drop-shadow-[0_0_30px_rgba(132,204,22,0.3)] grayscale hover:grayscale-0 transition-all duration-700" alt="quiz mascot" />
             </div>
           </div>

           <div className="text-center mb-16">
              <span className="text-lime-500 pixel text-[8px] tracking-[0.4em] block mb-2 opacity-50 uppercase">Arquivo Carregado</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter pixel">RECOMENDAÇÕES <span className="text-lime-400">SMART</span></h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {SEEDS.slice(0, 4).map((seed, i) => {
                const variant = shopVariants[i] || { qty: 'X2', type: 'Feminizada' };
                const setVariantQty = (q: Quantity) => setShopVariants(prev => ({...prev, [i]: {...variant, qty: q}}));
                const setVariantType = (t: 'Feminizada' | 'Automatica') => setShopVariants(prev => ({...prev, [i]: {...variant, type: t}}));
                
                const isAuto = variant.type === 'Automatica';
                const specs = isAuto ? seed.auto : seed.fem;

                return (
                <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 group hover:border-lime-500/20 transition-all relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 blur-[80px] pointer-events-none group-hover:bg-lime-500/10 transition-all"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-lime-500/10 text-lime-400 text-[8px] font-black pixel px-2 py-1 rounded-md border border-lime-500/20 uppercase tracking-widest">Beginner safe</span>
                      <span className="vt text-lime-400 text-lg opacity-40 group-hover:opacity-100 transition-opacity">#{seed.id}</span>
                    </div>

                    <div className="h-48 w-full flex items-center justify-center mb-6 relative group/img">
                      <div className="absolute inset-0 bg-white/5 rounded-2xl scale-95 group-hover/img:scale-100 transition-transform"></div>
                      <img 
                        src={seed.image} 
                        alt={seed.name} 
                        className="w-full h-full object-cover rounded-2xl z-10 grayscale group-hover:grayscale-0 transition-all duration-500 border border-white/10" 
                      />
                    </div>
                    
                    <h4 className="font-bold text-white text-base mb-1 uppercase tracking-tight pixel tracking-tighter truncate">{seed.name} {isAuto ? 'Auto' : ''}</h4>
                    <p className="text-[10px] text-white/30 font-black pixel tracking-widest mb-4">SYSTEM PROTOCOL</p>
                    
                    <div className="flex gap-2 text-[9px] mb-6 pixel tracking-tighter">
                      <button onClick={() => setVariantType('Feminizada')} className={`flex-1 py-2 rounded-xl border transition-all ${!isAuto ? 'bg-lime-500 text-black border-lime-500 font-bold' : 'border-white/5 text-white/30 hover:text-white/60'}`}>FEM</button> 
                      <button onClick={() => setVariantType('Automatica')} className={`flex-1 py-2 rounded-xl border transition-all ${isAuto ? 'bg-lime-500 text-black border-lime-500 font-bold' : 'border-white/5 text-white/30 hover:text-white/60'}`}>AUTO</button>
                    </div>

                    <div className="mt-auto border-t border-white/5 pt-6">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/20 pixel mb-1 tracking-widest">VALOR</span>
                          <span className="text-xl text-yellow-500 vt leading-none tracking-tighter">R$ {seed.prices[variant.qty]}</span>
                        </div>
                        <button 
                          onClick={() => onSelectSeed?.(seed.id)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 w-12 h-12 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all shadow-inner"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
           </div>
        </div>

        {/* STEP 3 */}
        <div id="step-3" className="mb-32 scroll-m-20">
           <div className="flex flex-col items-center mb-12">
              <span className="text-lime-500 pixel text-[8px] tracking-[0.4em] mb-4">FASE GAMMA</span>
              <h2 className="text-center text-base md:text-lg font-black text-white px-6 py-3 border-y border-white/5 pixel uppercase tracking-tighter">
                <span className="text-lime-400">03.</span> BANCO DE DADOS
              </h2>
           </div>
           
           <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-white/5 pb-4 gap-4">
             <h3 className="text-sm font-black text-white/40 pixel uppercase tracking-[0.2em]">ARTIGOS DE CULTIVO</h3>
             <button 
               onClick={() => openArticle({ title: 'Acesso ao Mainframe de Cultivo', content: 'Iniciando extração de dados globais... Todos os artigos de cultivo estão sincronizados com as últimas descobertas do Instituto Mecura. Explore os logs abaixo para relatórios detalhados.' })}
               className="flex items-center gap-2 text-lime-400 text-[9px] pixel font-black hover:underline uppercase tracking-widest"
             >
               Acessar Mainframe →
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {[
                { title: 'Folhas enroladas em plantas de cannabis: por que acontece, o que causa...', date: '16 ABRIL 2021', img: '/gifs/garden_wedding.gif', content: 'As folhas curvadas para baixo, popularmente conhecidas como "garra", são um sinal clássico de alerta nas plantas de cannabis. Geralmente, este fenômeno está associado ao excesso de nitrogênio ou flutuações severas de pH na zona radicular.' },
                { title: '5 melhores fertilizantes para o cultivo de cannabis', date: '06 MARÇO 2020', img: '/gifs/flower_bed.gif', content: 'A nutrição é o combustível da sua planta. 1. BioBizz: Excelente para orgânicos. 2. FoxFarm: Versátil e potente. 3. Advanced Nutrients: Tecnologia de pH Perfect.' },
                { title: 'Plantas de maconha masculinas: o que você pode fazer com elas?', date: '11 FEVEREIRO 2020', img: '/gifs/sangoku.gif', content: 'Identificou um macho? Não entre em pânico. Se você não é um breeder, remova-o imediatamente para evitar a polinização das fêmeas.' }
              ].map((post, i) => (
                <div key={i} onClick={() => openArticle(post)} className="cursor-pointer group flex flex-col bg-[#0a0a0a] border border-white/5 p-4 rounded-[2rem] hover:border-lime-500/30 transition-all">
                  <div className="bg-white/5 h-[160px] rounded-2xl mb-5 overflow-hidden flex items-center justify-center border border-white/5">
                     <img src={post.img} alt="blog" className="object-cover w-full h-full opacity-40 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0" />
                  </div>
                  <h4 className="font-black text-[10px] text-white/80 leading-snug mb-4 pixel tracking-tight group-hover:text-lime-400 transition-colors">{post.title}</h4>
                  <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
                    <span className="text-[8px] pixel text-white/20 tracking-tighter uppercase font-black">{post.date}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.8)]"></div>
                  </div>
                </div>
              ))}
           </div>

           <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-white/5 pb-4 gap-4">
             <h3 className="text-sm font-black text-white/40 pixel uppercase tracking-[0.2em]">CULTIVO PROTOCOLS (LOGS)</h3>
             <button 
               onClick={() => openArticle({ title: 'Terminal de Logs em Tempo Real', content: 'Sincronizando com sensores locais... Temperatura estável (24°C). Umidade em 65%. VPD ótimo. Os relatórios de cultivo listados abaixo são experiências reais de cultivadores da nossa comunidade.' })}
               className="flex items-center gap-2 text-lime-400 text-[9px] pixel font-black hover:underline uppercase tracking-widest"
             >
               Logs em tempo real →
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Relatório de Cultivo da GG#4 Original Glue Auto...', icon: '📓', content: 'Semana 8: Flores densas e resinadas. O aroma de querosene e terra está dominando o grow.' },
                { title: 'Relatório de cultivo da Malawi da Ace Seeds: um...', icon: '💻', content: 'Uma sativa pura que exige paciência. 14 semanas de floração.' },
                { title: 'Cultivo da Tutankhamon: Minha Primeira Tentati...', icon: '📖', content: 'Minha primeira experiência. Uma planta robusta que perdoou meus erros de iniciante.' },
                { title: 'Cultivo da Lemon Pie Auto: minha Maior...', icon: '🥧', content: 'FastBuds não decepciona. A Lemon Pie se transformou em um arbusto de 1.2m.' }
              ].map((report, i) => (
                <div key={i} onClick={() => openArticle(report)} className="bg-white/5 hover:bg-lime-500/10 group rounded-2xl flex items-center p-4 cursor-pointer border border-white/5 hover:border-lime-500/20 transition-all">
                  <div className="w-12 h-12 bg-black border border-white/10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-lg group-hover:border-lime-500/30 transition-all">
                    {report.icon}
                  </div>
                  <div className="flex-1 ml-4 flex justify-between items-center">
                    <span className="text-[10px] pixel text-white/50 tracking-tighter uppercase font-black truncate max-w-[200px] group-hover:text-white transition-colors">{report.title}</span>
                    <span className="text-lime-400 pixel text-[8px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Ler Arquivo</span>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* STEP 4 & 5 */}
        <div id="step-4" className="text-center mb-32 scroll-m-20">
           <div className="flex flex-col items-center mb-12">
              <span className="text-lime-500 pixel text-[8px] tracking-[0.4em] mb-4">DEPLOY</span>
              <h2 className="text-center text-base md:text-lg font-black text-white px-6 py-3 border-y border-white/5 pixel uppercase tracking-tighter">
                <span className="text-lime-400">04.</span> PROTOCOLO DE ENVIO
              </h2>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 text-[10px] pixel tracking-tighter">
              <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center shadow-2xl relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-lime-500"></div>
                <div className="text-4xl mb-8 opacity-40">🎁</div>
                <p className="text-white/40 leading-relaxed uppercase tracking-[0.1em]">Bônus de sistema em todos os pacotes identificados.</p>
              </div>
              <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center shadow-2xl relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-lime-500 opacity-20"></div>
                <div className="text-4xl mb-8 opacity-40">🌍</div>
                <p className="text-white/40 leading-relaxed uppercase tracking-[0.1em]">Logística global em rede criptografada e discreta.</p>
              </div>
              <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center shadow-2xl relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-lime-500 opacity-20"></div>
                <div className="text-4xl mb-8 opacity-40">💳</div>
                <p className="text-white/40 leading-relaxed uppercase tracking-[0.1em]">Pagamento via canais seguros, Cash ou ativos digitais.</p>
              </div>
              <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center shadow-2xl relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-lime-500 opacity-20"></div>
                <div className="text-4xl mb-8 opacity-40">🛡️</div>
                <p className="text-white/40 leading-relaxed uppercase tracking-[0.1em]">Garantia de integridade de 100% de satisfação do usuário.</p>
              </div>
           </div>
        </div>

        <div id="step-5" className="text-center mb-10 w-full relative scroll-m-20">
           <div className="flex flex-col items-center mb-12">
              <span className="text-[#ff00ff] pixel text-[8px] tracking-[0.4em] mb-4">RECOMPENSAS EXTRAS</span>
              <h2 className="text-center text-base md:text-lg font-black text-white px-6 py-3 border-y border-white/5 pixel uppercase tracking-tighter">
                <span className="text-[#ff00ff]">05.</span> CLAIM YOUR LOOT
              </h2>
           </div>
           
           <p className="text-white/30 text-xs pixel tracking-widest mb-10 max-w-2xl mx-auto italic leading-relaxed uppercase">
             "Para te agradecer pela sua confiança, nós te daremos 1 semente de graça e mais 1 para cada 20 EUR no seu pedido. Além disso, ao assinar o Nexus Log, você recebe mais brindes."
           </p>
           
           <div className="bg-[#111] border border-white/5 p-10 rounded-[3rem] shadow-inner mb-12 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-[#ff00ff]/5 via-transparent to-[#ff00ff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <p className="text-white font-black text-xl mb-10 pixel tracking-tighter relative z-10">
               PARABÉNS! VOCÊ ESTÁ PRONTO PARA SE TORNAR UM GROWER.
             </p>
             <button 
               onClick={onBack}
               className="bg-[#ff00ff] hover:bg-[#d900d9] text-white font-black uppercase text-[11px] px-16 py-5 rounded-2xl transition-all pixel tracking-[0.2em] shadow-[0_10px_30px_rgba(255,0,255,0.2)] hover:scale-105 active:scale-95 relative z-10"
             >
               INICIAR CULTIVO AGORA
             </button>
           </div>
        </div>
      </div>
      
      {/* NEWSLETTER BANNER */}
      <div className="w-full bg-[#050505] mt-20 pt-16 pb-12 px-8 relative overflow-hidden border-t border-white/5">
         <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
         
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="shrink-0 flex items-center justify-center p-4 bg-white/5 rounded-full border border-white/5">
               <img src="/gifs/Design sem nome (4).gif" className="h-[120px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] contrast-125" alt="mascot" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-black text-white mb-4 pixel tracking-tighter leading-none">ASSINE O <span className="text-lime-400">NEXUS LOG</span> E RECEBA <br/><span className="text-lime-400">02 SEMENTES GRÁTIS</span></h3>
              <p className="text-xs text-white/30 font-black pixel tracking-widest uppercase italic max-w-xl leading-relaxed">Seja o primeiro a receber brindes e atualizações sobre nossas promoções e códigos secretos.</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-md">
              <div className="flex gap-2 w-full p-1 bg-white/5 rounded-2xl border border-white/5">
                <input type="email" placeholder="ENDEREÇO DE E-MAIL" className="flex-1 bg-transparent border-none px-6 py-4 text-[10px] pixel tracking-widest font-black text-white focus:outline-none placeholder:text-white/10" />
                <button className="bg-lime-500 text-black font-black px-10 py-4 rounded-xl hover:bg-lime-400 transition-all text-[10px] pixel tracking-[0.2em] shadow-lg">JOIN</button>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group px-2">
                <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center group-hover:border-lime-500/50 transition-all">
                  <input type="checkbox" className="hidden" />
                  <div className="w-2 h-2 bg-lime-500 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <span className="text-[8px] pixel text-white/20 tracking-widest font-black uppercase group-hover:text-white/40 transition-colors italic">ACEITO OS PROTOCOLOS DE TERMOS E CONDIÇÕES</span>
              </label>
            </div>
         </div>
      </div>

      {/* ACCESSING OVERLAY */}
      {isAccessing && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300 pointer-events-none">
          <div className="w-24 h-24 border-4 border-white/10 border-t-lime-500 rounded-full animate-spin mb-8"></div>
          <div className="pixel text-lime-400 text-sm animate-pulse tracking-[0.5em] uppercase">Acessando Mainframe...</div>
        </div>
      )}

      {/* ARTICLE MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-in zoom-in duration-300 font-sans">
           <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-[3rem] p-8 md:p-16 shadow-[0_0_100px_rgba(132,204,22,0.1)] relative scrollbar-hide">
              <button onClick={() => setActiveArticle(null)} className="absolute top-8 right-8 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-white/50 hover:text-white">✕</button>
              <div className="flex items-center gap-3 mb-8">
                <span className="pixel text-[10px] text-lime-500 font-black tracking-widest bg-lime-500/10 px-3 py-1 rounded-full border border-lime-500/20 uppercase">DATABASE LOG</span>
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,1)]"></span>
                <span className="vt text-white/20 text-[10px] uppercase font-black tracking-widest">ACESSO AUTORIZADO</span>
              </div>
              <h3 className="pixel text-xl md:text-2xl font-black text-white mb-10 leading-tight tracking-tighter uppercase">{activeArticle.title}</h3>
              <div className="vt text-lg md:text-xl text-gray-300 leading-relaxed mb-12">
                 {activeArticle.content}
              </div>
              <div className="pt-10 border-t border-white/5 flex justify-end">
                 <button onClick={() => setActiveArticle(null)} className="bg-lime-500 hover:bg-lime-400 text-black vt text-xl font-black px-10 py-4 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest">
                    FECHAR ARQUIVO
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

