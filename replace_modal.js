const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('<div className="fixed inset-0 bg-black/95'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('})()}'));

if (startIdx !== -1 && endIdx !== -1) {
  const newContent = `          <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-2 sm:p-6 overflow-y-auto font-sans" onClick={() => setSelectedSeedId(null)}>
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
                          setCurrentImgIdx(prev => (prev === 0 ? seed.gallery.length - 1 : prev - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playSfx('click');
                          setCurrentImgIdx(prev => (prev === seed.gallery.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
                    className={\`absolute top-4 right-4 md:top-6 md:right-6 p-2.5 rounded-full backdrop-blur-md z-30 transition-all border \${isFavorite ? 'bg-pink-500/20 text-pink-500 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'bg-black/50 text-white/50 border-white/10 hover:text-white hover:bg-black/80'}\`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
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
                        className={\`w-14 h-14 object-cover rounded cursor-pointer transition-all border-2 \${idx === currentImgIdx ? 'border-lime-500 shadow-[0_0_10px_rgba(163,230,53,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'}\`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* RIGHT COLUMN: SCROLLABLE INFO & CART */}
              <div className="lg:w-[60%] xl:w-[55%] h-[60vh] lg:h-[95vh] overflow-y-auto flex flex-col bg-[#050505] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent relative">
                
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
                       <span className="bg-[#111] text-gray-300 px-2 py-0.5 rounded border border-[#333]">USA 🇺🇸</span>
                       <span className="flex items-center gap-1"><span className="text-yellow-500 text-sm">★</span> <span className="text-gray-300 font-bold">4.8</span> <span className="text-lime-500 hover:underline cursor-pointer">77 análises</span></span>
                       <span className="!text-lime-500 border border-lime-500/30 bg-lime-500/10 px-2 py-0.5 rounded">{variant.type}</span>
                    </div>

                    <div className="flex gap-2 mb-8">
                      <button onClick={() => setVariantType('Feminizada')} className={\`flex-1 font-sans text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all \${!isAuto ? 'bg-lime-500/10 text-lime-400 font-bold border border-lime-500/30 shadow-[0_0_10px_rgba(163,230,53,0.1)]' : 'bg-[#111] border border-[#333] text-gray-500 hover:bg-[#222]'}\`}>Feminizada</button>
                      <button onClick={() => setVariantType('Automatica')} className={\`flex-1 font-sans text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all \${isAuto ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 'bg-[#111] border border-[#333] text-gray-500 hover:bg-[#222]'}\`}>Automática</button>
                    </div>
                    
                    <h4 className="font-bold text-white text-lg mb-4">Características</h4>
                    <div className="flex flex-col text-sm border-t border-[#222]">
                       {[
                         ['Marca', 'HighBreed Seeds', true],
                         ['Tipo', variant.type, false],
                         ['Floração', isAuto ? 'Automática' : 'Fotoperíodo', false],
                         ['Ambiente', seed.isIndoor && seed.isOutdoor ? 'Indoor / Outdoor' : (seed.isIndoor ? 'Indoor' : 'Outdoor'), false],
                         ['THC', \`\${specs.thc}%\`, false],
                         ['CBD', \`\${seed.cbd}%\`, false],
                         ['Genética', \`\${specs.sativaPct}% Sat / \${100-specs.sativaPct}% Ind\`, false],
                         ['Rendimento', \`\${specs.yieldIndoor}\`, false],
                         ['Tempo', specs.floweringTime, false]
                       ].map(([label, val, isGreen]) => (
                         <div key={label.toString()} className="flex justify-between py-3 border-b border-[#1a1a1a] items-start gap-4">
                           <span className="text-gray-500 w-[40%] font-medium text-[11px] uppercase tracking-wider">{label}</span>
                           <span className={\`w-[60%] text-right font-bold text-[13px] \${isGreen ? 'text-lime-400 hover:underline cursor-pointer' : 'text-gray-300'}\`}>{val}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* FAR RIGHT (BUY BOX) */}
                  <div className="xl:w-[45%] p-6 md:p-8 bg-[#0a0a0a] flex flex-col relative w-full lg:sticky top-0 h-fit">
                     
                     <div className="bg-[#111] border border-lime-900/40 rounded-xl p-4 flex flex-col gap-2 mb-6 shadow-inner">
                        <div className="flex items-center justify-between">
                            <span className="text-lime-500/80 text-[10px] font-black uppercase tracking-widest">Cupom Ativos</span>
                            <span className="border border-lime-500/50 text-lime-500 bg-lime-500/20 px-2 py-0.5 rounded text-[9px] font-bold">+2 Sementes</span>
                        </div>
                        <div className="bg-[#000] border border-[#222] px-3 py-2 rounded text-xs font-black text-lime-500 tracking-wider flex justify-between uppercase">HIGHBREEDPROMO <span className="cursor-pointer text-gray-500 hover:text-white">📋</span></div>
                     </div>

                     <h4 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-4">Selecione o Pacote</h4>
                     
                     <div className="flex flex-col gap-2.5 mb-6">
                        {[...QUANTITIES].map((q, idx) => {
                          const qCount = parseInt(q.replace('X', '')) || 1;
                          const isPopular = idx === 2;
                          const priceStr = seed.prices[q];
                          const basePriceStr = seed.prices['X2']; // mockup comparison price
                          const comparePrice = (parseFloat(basePriceStr.replace('.', '').replace(',', '.')) / 2) * qCount * 1.5;
                          
                          return (
                            <button 
                              key={q} 
                              onClick={() => setVariantQty(q)}
                              className={\`flex items-center justify-between border rounded-xl p-3 w-full text-left transition-all relative overflow-hidden group \${variant.qty === q ? 'border-lime-500/80 bg-lime-500/10 shadow-[0_0_15px_rgba(163,230,53,0.05)]' : 'border-[#222] hover:border-[#444] bg-[#111]'}\`}
                            >
                              {variant.qty === q && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-lime-500"></div>}
                              <div className="flex items-center gap-3">
                                 <div className={\`w-4 h-4 rounded-full border flex items-center justify-center p-0.5 transition-colors \${variant.qty === q ? 'border-lime-500 bg-black' : 'border-gray-500 bg-[#222]'}\`}>
                                   {variant.qty === q && <div className="w-full h-full rounded-full bg-lime-500" />}
                                 </div>
                                 <span className={\`font-medium text-sm \${variant.qty === q ? 'text-white' : 'text-gray-300'}\`}>{qCount} semente{qCount > 1 ? 's' : ''}</span>
                                 {isPopular && <span className="bg-lime-500/20 text-lime-400 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-lime-500/40">Popular</span>}
                              </div>
                              <div className="flex flex-col items-end">
                                {idx > 0 && <span className="text-[10px] text-gray-600 line-through">R$ {comparePrice.toFixed(2).replace('.',',')}</span>}
                                <span className={\`font-black text-sm vt text-lg \${variant.qty === q ? 'text-lime-400' : 'text-white group-hover:text-lime-400'}\`}>R$ {priceStr}</span>
                              </div>
                            </button>
                          )
                        })}
                     </div>

                     <div className="flex justify-between items-end mb-6 border-t border-[#222] pt-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Preço Total</span>
                          <span className="vt text-4xl text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.2)] leading-none">R$ {seed.prices[variant.qty]}</span>
                          <span className="text-[11px] text-gray-500 mt-1">~ R$ {(parseFloat(seed.prices[variant.qty].replace('.', '').replace(',', '.')) / parseInt(variant.qty.replace('X', '') || 1)).toFixed(2)} / un</span>
                        </div>
                     </div>

                     {(() => {
                        const existingItem = cartItems.find(i => i.seedId === String(seed.id) && i.quantity === variant.qty && i.variantType === variant.type);
                        if (existingItem) {
                          return (
                            <div className="flex items-center justify-between bg-black border border-lime-500 rounded-xl p-1 mb-4">
                              <button onClick={() => {
                                playSfx('click');
                                const newCount = (existingItem.packCount || 1) - 1;
                                if (newCount <= 0) {
                                  deleteDoc(doc(db, \`users/\${auth.currentUser?.uid}/cartItems/\${existingItem.id}\`));
                                } else {
                                  let pStr = seed.prices[variant.qty];
                                  if (typeof pStr === 'string') pStr = pStr.replace('.', '').replace(',', '.');
                                  const basePriceNum = parseFloat(pStr);
                                  const { id, ...data } = existingItem;
                                  setDoc(doc(db, \`users/\${auth.currentUser?.uid}/cartItems/\${existingItem.id}\`), {
                                    ...data,
                                    packCount: newCount,
                                    priceNum: basePriceNum * newCount
                                  });
                                }
                              }} className="w-12 h-10 flex items-center justify-center text-lime-500 hover:text-white hover:bg-[#222] rounded-lg font-black text-xl transition-all">-</button>
                              <span className="text-white font-bold text-xs tracking-widest">{existingItem.packCount || 1} CARRINHO</span>
                              <button onClick={() => { playSfx('click'); addToCart(); }} className="w-12 h-10 flex items-center justify-center text-lime-500 hover:text-white hover:bg-[#222] rounded-lg font-black text-xl transition-all">+</button>
                            </div>
                          );
                        }
                        return (
                          <button 
                            onClick={() => { playSfx('click'); addToCart(); }}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-xs py-4 rounded-xl mb-4 transition-all shadow-[0_0_20px_rgba(255,204,0,0.15)] active:scale-95 flex justify-center items-center gap-2 tracking-widest"
                          >
                            Por no Carrinho <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                          </button>
                        );
                     })()}

                     <button 
                       onClick={() => {
                          playSfx('click');
                          setG(p => ({...p, selSeed: i, isAuto}));
                          setSelectedSeedId(null);
                          addLog(\`🛒 Escolheu \${seed.name} (\${isAuto ? 'Auto' : 'Fem'}) para plantar!\`, '#ffff00');
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
                <div className="p-6 md:p-10 lg:p-14 flex flex-col gap-14 bg-[#050505]">
                    
                    {/* INFORMACOES DA STRAIN */}
                    <div>
                       <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Informações sobre a strain {seed.name}</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">\${specs.description}</p>
                    </div>

                    {/* GENETICA */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-5">Genética</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">
                           O pool genético do mercado moderno de sementes de cannabis é muito grande e é necessário um talento especial para saber quais plantas cruzar para que possam reforçar as melhores características umas das outras. 
                           Para essa strain, a combinação vencedora inclui linhagens como <span className="text-white font-semibold">{seed.genetic}</span>. Com uma família tão respeitável, a híbrida resultante não poderia ser menos que espetacular.
                       </p>
                    </div>

                    {/* TEMPO DE FLORACAO */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-5">Tempo de Floração</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">
                           Com um período de floração que gira em torno de <span className="text-white font-semibold">{specs.floweringTime}</span>, a {seed.name} é uma strain de finalização na medida, perfeita para growers impacientes, produtores comerciais e aqueles que procuram uma rotatividade rápida.
                       </p>
                    </div>

                    {/* RENDIMENTO */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-5">Rendimento</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide">
                           Essa strain produz rendimentos generosos de cerca de <span className="text-white font-semibold">{specs.yieldIndoor}</span> quando cultivada em indoor, o que está bem acima da média. No outdoor, é possível colher até <span className="text-white font-semibold">{specs.yieldOutdoor}</span> por planta, desde que as condições climáticas permitam que os buds amadureçam completamente antes do início do tempo frio.
                       </p>
                    </div>

                    {/* Efeitos */}
                    <div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-5">Efeitos</h3>
                       <p className="text-gray-400 text-sm md:text-base leading-[1.8] tracking-wide mb-10">
                           A {seed.name} oferece um efeito de corpo inteiro de primeira classe que relaxa todos os músculos e elimina todos os pensamentos ruins da sua cabeça, abrindo espaço para uma felicidade que consome tudo. O que você deve ter cuidado é com o poder chapante desse fumo - não inale muito profundamente ou seus joelhos podem tremer antes mesmo de você passar o baseado para seus amigos. 
                           <br/><br/>
                           <span className="italic text-gray-500">{seed.effect}</span>
                       </p>
                       <div className="flex gap-8 md:gap-12 pl-2">
                           <div className="flex flex-col items-center gap-4">
                               <div className="w-20 h-20 rounded-full bg-[#111] border-[3px] border-[#333] flex items-center justify-center text-4xl shadow-inner">😌</div>
                               <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Relaxado</span>
                           </div>
                           <div className="flex flex-col items-center gap-4">
                               <div className="w-20 h-20 rounded-full bg-[#111] border-[3px] border-[#333] flex items-center justify-center text-4xl shadow-inner text-white">🌿</div>
                               <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Medicinal</span>
                           </div>
                           <div className="flex flex-col items-center gap-4 relative">
                               <div className="absolute -inset-2 bg-yellow-500/10 rounded-full blur-xl z-0"></div>
                               <div className="w-20 h-20 rounded-full bg-[#111] border-[3px] border-yellow-500/30 flex items-center justify-center text-4xl relative z-10 shadow-inner">😁</div>
                               <span className="text-xs text-yellow-500/80 font-bold uppercase tracking-widest">Feliz</span>
                           </div>
                       </div>
                    </div>
                </div>

              </div>
            </div>
          </div>`;

  lines.splice(startIdx, endIdx - startIdx, newContent);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
} else {
  console.log("Indexes not found", startIdx, endIdx);
}
