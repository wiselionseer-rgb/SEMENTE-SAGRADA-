import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { doc, deleteDoc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { SEEDS } from './data';
import { Trash2, Heart, ShoppingCart, Plus } from 'lucide-react';
import { playSfx } from './audio';

export function CartModal({ isOpen, onClose, cartItems, onCheckout }: { isOpen: boolean; onClose: () => void, cartItems: any[], onCheckout: () => void }) {
  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + (item.priceNum || 0), 0);

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
          <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map(item => {
              const seed = SEEDS.find(s => String(s.id) === item.seedId);
              return (
                <div key={item.id} className="flex gap-5 items-center bg-black/40 border border-white/5 p-4 rounded-2xl group hover:border-lime-500/30 transition-all">
                  <div className="w-16 h-16 rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
                    <img src={seed?.image} className="w-full h-full object-cover" alt="seed" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate uppercase tracking-tight">{seed?.name}</h3>
                    <p className="text-[10px] text-white/30 font-black pixel tracking-tighter mt-1">{item.variantType} • {item.quantity}</p>
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
            <div className="border-t border-white/5 pt-6 mt-4 flex justify-between items-end">
               <span className="text-white/30 font-black pixel text-[10px] uppercase tracking-widest mb-1">Total Geral:</span>
               <div className="text-right">
                  <span className="text-[10px] font-black text-white/20 block mb-1 pixel tracking-[0.2em]">BRL</span>
                  <span className="text-4xl text-yellow-500 vt leading-none tracking-tighter shadow-yellow-500/20 drop-shadow-xl">R$ {total.toFixed(2).replace('.',',')}</span>
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
