import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { doc, deleteDoc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { SEEDS, getQtyLabel, getBonusSeeds } from './data';
import { Trash2, Heart, ShoppingCart, Plus, Gift, Percent, Truck } from 'lucide-react';
import { playSfx } from './audio';
import { motion, AnimatePresence } from 'motion/react';

export function CartModal({ isOpen, onClose, cartItems, onCheckout }: { isOpen: boolean; onClose: () => void, cartItems: any[], onCheckout: () => void }) {
  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + (item.priceNum || 0), 0);
  
  // Calculate total bonus seeds from packs
  const totalBonusSeedsFromPacks = cartItems.reduce((acc, item) => {
    const bonusPerPack = getBonusSeeds(item.quantity);
    return acc + (bonusPerPack * (item.packCount || 1));
  }, 0);

  // Rewards levels
  const seedGoal = 116.63;
  const discountGoal = 408.20;
  const freeShippingGoal = 680.00;
  
  const hasExtraSeed = total >= seedGoal;
  const hasDiscount = total >= discountGoal;
  const hasFreeShipping = total >= freeShippingGoal;
  
  const progressPercent = Math.min((total / freeShippingGoal) * 100, 100);

  const removeItem = async (itemId: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${itemId}`));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/cartItems/${itemId}`);
    }
  };

  const handleCheckoutClick = () => {
    playSfx('click');
    onCheckout();
    onClose();
  };

  const updateItem = async (item: any, delta: number, seed: any) => {
    if (!auth.currentUser || !seed) return;
    const basePrice = parseFloat(seed.prices[item.quantity].replace('.', '').replace(',', '.'));
    const newCount = (item.packCount || 1) + delta;
    
    try {
      if (newCount <= 0) {
        await deleteDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${item.id}`));
      } else {
        const { id, ...data } = item;
        await setDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${item.id}`), {
          ...data,
          packCount: newCount,
          priceNum: basePrice * newCount
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/cartItems/${item.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-lg p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-500/50 to-transparent"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors pixel text-[10px]">X</button>
        <h2 className="text-2xl text-lime-400 font-bold mb-8 pixel tracking-tighter">CARRINHO</h2>
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 opacity-20">
             <ShoppingCart size={40} />
             <p className="text-white/50 text-xs font-black pixel tracking-widest">SISTEMA VAZIO</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
            {/* Rewards Progress UI */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 mb-2 relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-black text-sm uppercase leading-tight max-w-[150px]">Receba sementes grátis, frete grátis e descontos</h3>
                  <button className="text-white/20 hover:text-white transition-colors">
                     <Plus size={14} className="rotate-45" />
                  </button>
               </div>
               
               <div className="flex justify-between items-center text-[10px] font-black pixel text-white/40 mb-3 uppercase tracking-widest">
                  <span>0%</span>
                  {hasFreeShipping ? (
                      <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">Frete Grátis</div>
                  ) : hasDiscount ? (
                      <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30">4% Off</div>
                  ) : hasExtraSeed ? (
                      <div className="bg-lime-500/20 text-lime-400 px-2 py-1 rounded border border-lime-500/30">1 Semente</div>
                  ) : (
                      <div className="bg-white/5 text-white/40 px-2 py-1 rounded border border-white/10">0 Bônus</div>
                  )}
               </div>

               <div className="relative h-2 bg-white/5 rounded-full mb-6">
                  <div 
                     className="absolute h-full bg-lime-500 rounded-full shadow-[0_0_15px_rgba(132,204,22,0.5)] transition-all duration-1000"
                     style={{ width: `${progressPercent}%` }}
                  >
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-lime-500 shadow-xl"></div>
                  </div>
                  {/* Marks for goals */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full border border-white/20" style={{ left: `${(seedGoal / freeShippingGoal) * 100}%` }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full border border-white/20" style={{ left: `${(discountGoal / freeShippingGoal) * 100}%` }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1.5 h-1.5 bg-black rounded-full border border-white/20"></div>
               </div>

               <div className="flex flex-col gap-4">
                  <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${total < seedGoal ? 'bg-white/[0.02] border-white/5' : 'bg-lime-500/10 border-lime-500/30'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${total < seedGoal ? 'bg-white/5 border-white/10 text-white/20' : 'bg-lime-500 text-black border-lime-400'}`}>
                           <Gift size={18} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] text-white/40 font-black uppercase">Receba</span>
                           <span className={`text-sm font-black ${total < seedGoal ? 'text-white/60' : 'text-lime-400'}`}>1 semente grátis</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] text-white/20 font-black pixel uppercase block">Gaste</span>
                        <span className="text-sm font-black text-lime-400">R$ {seedGoal.toFixed(2)}</span>
                     </div>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${total < discountGoal ? 'bg-white/[0.02] border-white/5' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${total < discountGoal ? 'bg-white/5 border-white/10 text-white/20' : 'bg-yellow-500 text-black border-yellow-400'}`}>
                           <Percent size={18} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] text-white/40 font-black uppercase">Receba</span>
                           <span className={`text-sm font-black ${total < discountGoal ? 'text-white/60' : 'text-yellow-400'}`}>4% de desconto</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] text-white/20 font-black pixel uppercase block">Gaste</span>
                        <span className="text-sm font-black text-white/60 font-mono">R$ {discountGoal.toFixed(2)}</span>
                     </div>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${total < freeShippingGoal ? 'bg-white/[0.02] border-white/5' : 'bg-blue-500/10 border-blue-500/30'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${total < freeShippingGoal ? 'bg-white/5 border-white/10 text-white/20' : 'bg-blue-500 text-black border-blue-400'}`}>
                           <Truck size={18} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] text-white/40 font-black uppercase">Receba</span>
                           <span className={`text-sm font-black ${total < freeShippingGoal ? 'text-white/60' : 'text-blue-400'}`}>Frete grátis</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] text-white/20 font-black pixel uppercase block">Gaste</span>
                        <span className="text-sm font-black text-white/60 font-mono">R$ {freeShippingGoal.toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap gap-2 mt-6">
                  <div className="bg-lime-500/10 border border-lime-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black text-lime-500 uppercase tracking-tighter">
                     1 semente/pedido
                  </div>
                  {totalBonusSeedsFromPacks > 0 && (
                     <div className="bg-lime-500/10 border border-lime-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black text-lime-500 uppercase tracking-tighter">
                        {totalBonusSeedsFromPacks} sementes bônus
                     </div>
                  )}
                  <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black text-white/40 uppercase tracking-tighter">
                     1%
                  </div>
               </div>
               
               <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                  <Gift size={200} />
               </div>
            </div>

            {cartItems.map(item => {
              const seed = SEEDS.find(s => String(s.id) === item.seedId);
              return (
                <div key={item.id} className="flex gap-5 items-center bg-black/40 border border-white/5 p-4 rounded-2xl group hover:border-lime-500/30 transition-all">
                  <div className="w-16 h-16 rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
                    <img src={seed?.image} className="w-full h-full object-cover" alt="seed" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate uppercase tracking-tight">{seed?.name}</h3>
                    <p className="text-[10px] text-white/30 font-black pixel tracking-tighter mt-1">{item.variantType} • {getQtyLabel(item.quantity)}</p>
                    <p className="text-lime-400 vt text-xl mt-2 leading-none">R$ {item.priceNum.toFixed(2).replace('.',',')}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button onClick={() => updateItem(item, -1, seed)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-black border border-white/10 hover:bg-white/5 transition-colors text-white/40">-</button>
                    <span className="text-white vt text-lg w-4 text-center">{item.packCount || 1}</span>
                    <button onClick={() => updateItem(item, 1, seed)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-black border border-white/10 hover:bg-white/5 transition-colors text-white/40">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-500 transition-colors p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
            <div className="border-t border-white/5 pt-6 mt-4 flex flex-col gap-4">
               {totalBonusSeedsFromPacks > 0 && (
                  <div className="bg-lime-500/5 border border-lime-500/10 rounded-2xl p-4 flex items-center justify-between mb-2">
                     <div className="flex items-center gap-3">
                        <Gift className="text-lime-500" size={20} />
                        <div>
                           <p className="text-[10px] text-white/40 font-black pixel uppercase tracking-tighter">Bônus Acumulado</p>
                           <p className="text-sm font-black text-white">+{totalBonusSeedsFromPacks} Sementes Grátis</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-lime-500 bg-lime-500/10 px-2 py-1 rounded uppercase">Ativo</span>
                  </div>
               )}
               <div className="flex justify-between items-end">
                  <span className="text-white/30 font-black pixel text-[10px] uppercase tracking-widest mb-1">Total Geral:</span>
                  <div className="text-right">
                     <span className="text-[10px] font-black text-white/20 block mb-1 pixel tracking-[0.2em]">BRL</span>
                     <span className="text-4xl text-yellow-500 vt leading-none tracking-tighter shadow-yellow-500/20 drop-shadow-xl">R$ {total.toFixed(2).replace('.',',')}</span>
                  </div>
               </div>
            </div>
            <button onClick={handleCheckoutClick} className="w-full bg-[#84cc16] hover:bg-[#a3e635] text-black font-black py-4 mt-6 rounded-2xl uppercase tracking-widest text-[11px] pixel transition-all active:scale-95 shadow-[0_10px_30px_rgba(132,204,22,0.2)]">
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function FavoritesModal({ isOpen, onClose, favorites }: { isOpen: boolean; onClose: () => void, favorites: string[] }) {
  if (!isOpen) return null;

  const removeFav = async (seedId: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/favorites/${seedId}`));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/favorites/${seedId}`);
    }
  };

  const favSeeds = SEEDS.filter(s => favorites.includes(String(s.id)));

  return (
    <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-lg p-8 relative shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff00ff]/50 to-transparent"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors pixel text-[10px]">X</button>
        <h2 className="text-2xl text-[#ff00ff] font-bold mb-8 pixel tracking-tighter">FAVORITOS</h2>
        
        {favSeeds.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 opacity-20">
             <Heart size={40} />
             <p className="text-white/50 text-xs font-black pixel tracking-widest italic font-sans">Nenhum dado encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {favSeeds.map(seed => (
              <div key={seed.id} className="flex gap-5 items-center bg-black/40 border border-white/5 p-4 rounded-2xl group hover:border-[#ff00ff]/30 transition-all">
                <div className="w-16 h-16 rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
                  <img src={seed.image} className="w-full h-full object-cover" alt="seed" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm uppercase tracking-tight truncate">{seed.name}</h3>
                  <p className="text-[10px] text-[#ff00ff] font-black pixel tracking-tighter mt-1">{seed.type}</p>
                </div>
                <button onClick={() => removeFav(String(seed.id))} className="text-white/20 hover:text-red-500 transition-colors p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrdersModal({ isOpen, onClose, orders }: { isOpen: boolean; onClose: () => void, orders: any[] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-2xl p-8 relative shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-500/50 to-transparent"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors pixel text-[10px]">X</button>
        <h2 className="text-2xl text-lime-400 font-bold mb-8 pixel tracking-tighter">HISTÓRICO</h2>
        
        {orders.length === 0 ? (
           <div className="flex flex-col items-center py-20 gap-4 opacity-20">
              <Plus size={40} className="rotate-45" />
              <p className="text-white/50 text-xs font-black pixel tracking-widest">SEM REGISTROS</p>
           </div>
        ) : (
          <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {orders.sort((a,b) => b.createdAt - a.createdAt).map(order => (
              <div key={order.id} className="flex flex-col bg-black/40 border border-white/5 p-6 rounded-[2rem] shadow-inner">
                <div className="flex flex-wrap gap-6 justify-between items-start mb-6 border-b border-white/5 pb-5">
                  <div>
                    <span className="text-[9px] text-white/30 uppercase pixel tracking-[0.2em] block mb-1">Pedido ID</span>
                    <p className="text-sm vt text-lime-500">#{order.id.slice(0,12)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/30 uppercase pixel tracking-[0.2em] block mb-1">Protocolo Data</span>
                    <p className="text-xs text-white/70 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/30 uppercase pixel tracking-[0.2em] block mb-1">Status Rede</span>
                    <p className="text-[10px] font-black pixel text-yellow-500 uppercase tracking-tighter">{order.status}</p>
                  </div>
                   <div className="text-right">
                    <span className="text-[9px] text-white/30 uppercase pixel tracking-[0.2em] block mb-1">Liquidado</span>
                    <p className="text-2xl vt text-white tracking-tighter">R$ {order.totalAmount.toFixed(2).replace('.',',')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {order.items.map((item: any, i: number) => {
                     const seed = SEEDS.find(s => String(s.id) === item.seedId);
                     return (
                       <div key={i} className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                         <img src={seed?.image} className="w-8 h-8 rounded-lg object-cover grayscale opacity-50" alt="" />
                         <div className="flex flex-col">
                            <span className="text-[10px] text-white/80 font-bold uppercase truncate max-w-[120px]">{seed?.name}</span>
                            <span className="text-[8px] text-white/30 pixel uppercase tracking-tighter">{item.variantType} • {item.quantity}</span>
                         </div>
                         <span className="text-lime-500 vt text-sm ml-2">x{item.packCount || 1}</span>
                       </div>
                     )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
