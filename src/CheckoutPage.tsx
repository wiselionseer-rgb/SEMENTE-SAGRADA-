import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, ChevronRight, Globe, CheckCircle2, Ticket, Heart, Plus, Minus, Gift } from 'lucide-react';
import { SEEDS, Seed, getQtyLabel, getBonusSeeds } from './data';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, deleteDoc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { playSfx } from './audio';

interface CheckoutPageProps {
  cartItems: any[];
  onBack: () => void;
  onProceed: (data: { totalAmount: number; selectedBonuses: number[]; shippingCost: number | null; zip: string; appliedCoupon: { id: string, code: string } | null }) => void;
}

export default function CheckoutPage({ cartItems, onBack, onProceed }: CheckoutPageProps) {
  useEffect(() => {
    const el = document.getElementById('app-content');
    if (el) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discountPercentage: number; maxUses: number; usedCount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const totalItemsRef = cartItems.reduce((acc, item) => acc + (item.priceNum || 0), 0);
  
  // Dynamic promotional logic
  const discountAmount = appliedCoupon ? appliedCoupon.discountPercentage : 
    (totalItemsRef >= 1500 ? 15 : 
     totalItemsRef >= 1000 ? 10 : 
     totalItemsRef >= 600 ? 6 : 
     totalItemsRef >= 300 ? 4 : 0);
  const isFreeShipping = totalItemsRef >= 680.00;

  const handleApplyCoupon = async () => {
    if (!couponCodeInput) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCodeInput.toUpperCase()), where('isActive', '==', true));
      const snap = await getDocs(q);
      if (snap.empty) {
        setCouponError('Cupom inválido ou expirado.');
        setAppliedCoupon(null);
      } else {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        if (data.usedCount >= data.maxUses) {
          setCouponError('Limite de uso deste cupom atingido.');
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon({ id: docSnap.id, code: data.code, discountPercentage: data.discountPercentage, maxUses: data.maxUses, usedCount: data.usedCount });
          setCouponCodeInput('');
        }
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };
  
  // Calculate total bonus seeds from packs
  const totalBonusSeedsFromPacks = cartItems.reduce((acc, item) => {
    const bonusPerPack = getBonusSeeds(item.quantity);
    return acc + (bonusPerPack * (item.packCount || 1));
  }, 0);

  // Selectable bonus seeds logic: follows the pack bonuses
  const extraBonusCount = totalBonusSeedsFromPacks;
  const nextTierProgress = (totalItemsRef % 116.63) / 116.63 * 100;
  const missingForNext = 116.63 - (totalItemsRef % 116.63);

  const [selectedBonuses, setSelectedBonuses] = useState<number[]>([]);
  const [shippingCepCart, setShippingCepCart] = useState('');
  const [calculatedShipping, setCalculatedShipping] = useState<number | null>(null);

  const handleCalculateShipping = (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length < 5) {
      setCalculatedShipping(null);
      return;
    }
    const prefix = parseInt(cleanCep.substring(0, 2));
    const fullPrefix = parseInt(cleanCep.substring(0, 3));
    
    if ((prefix >= 66 && prefix <= 69) || prefix === 77 || (fullPrefix >= 768 && fullPrefix <= 769)) {
       setCalculatedShipping(114.88);
    } else if (prefix >= 40 && prefix <= 65) {
       setCalculatedShipping(91.89);
    } else if ((prefix >= 70 && prefix <= 76) || (prefix >= 78 && prefix <= 79)) {
       setCalculatedShipping(68.88);
    } else if (prefix >= 1 && prefix <= 39) {
       setCalculatedShipping(45.88);
    } else if (prefix >= 80 && prefix <= 99) {
       setCalculatedShipping(34.38);
    } else {
       setCalculatedShipping(null);
    }
  };

  // Choose bonus seeds that match item species in cart
  const cartSeedIds = new Set(cartItems.map(item => String(item.seedId)));
  const bonusOptions = SEEDS.filter(seed => cartSeedIds.has(String(seed.id)));

  // Ensure selected bonuses are still valid species if cart changed
  useEffect(() => {
    const validIds = new Set(bonusOptions.map(b => b.id));
    setSelectedBonuses(prev => prev.filter(id => validIds.has(id)));
  }, [cartItems]);

  const toggleBonus = (id: number) => {
    playSfx('click');
    if (selectedBonuses.includes(id)) {
      setSelectedBonuses(prev => prev.filter(b => b !== id));
    } else {
      if (selectedBonuses.length < extraBonusCount) {
        setSelectedBonuses(prev => [...prev, id]);
      }
    }
  };

  const updateCartItem = async (item: any, delta: number) => {
    if (!auth.currentUser) return;
    const seed = SEEDS.find(s => String(s.id) === item.seedId);
    if (!seed) return;
    
    const basePrice = parseFloat(seed.prices[item.quantity as keyof typeof seed.prices].replace('.', '').replace(',', '.'));
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

  const removeCartItem = async (itemId: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/cartItems/${itemId}`));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/cartItems/${itemId}`);
    }
  };

  const handleProceedAction = () => {
    if (cartItems.length === 0) return;
    playSfx('click');
    const itemsPrice = totalItemsRef * (1 - discountAmount/100);
    onProceed({
      totalAmount: itemsPrice,
      selectedBonuses: selectedBonuses,
      shippingCost: isFreeShipping ? 0 : calculatedShipping,
      zip: shippingCepCart,
      appliedCoupon: appliedCoupon
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#84cc16 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-lime-500/5 to-transparent top-0 h-1/2"></div>
      
      {/* HEADER */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[1000] px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all group">
                 <ShoppingCart size={20} className="text-lime-500 group-hover:scale-110 transition-transform" />
              </button>
              <h1 className="text-xl md:text-2xl font-black pixel text-lime-400 tracking-tighter">CARRINHO ({cartItems.length})</h1>
           </div>
           <div className="hidden md:flex items-center gap-3">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pt-1">VALOR TOTAL:</span>
              <span className="text-2xl vt text-lime-500">R$ {(totalItemsRef * (1 - discountAmount/100) + (isFreeShipping ? 0 : (calculatedShipping || 0))).toFixed(2).replace('.', ',')}</span>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* LEFT COLUMN: ITEMS & BONUSES */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* CONFIDENCE BANNER */}
          <div className="bg-[#111] border border-lime-500/20 rounded-2xl p-5 flex items-center gap-5 shadow-[0_0_30px_rgba(132,204,22,0.05)]">
            <div className="w-14 h-14 rounded-2xl bg-lime-500/10 flex items-center justify-center text-3xl shadow-inner border border-lime-500/20">🛡️</div>
            <div>
              <h4 className="font-black text-sm text-lime-400 uppercase tracking-widest pixel leading-none mb-2">Segurança Garantida</h4>
              <p className="text-[11px] text-white/50 leading-relaxed font-bold">Protocolos de criptografia ativos. Seus dados estão protegidos pela nossa <span className="text-lime-500 underline cursor-pointer hover:text-white transition-colors">Digital Privacy Policy</span>.</p>
            </div>
          </div>

          {/* ITEMS LIST */}
          <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 md:p-10 flex flex-col gap-8">
              {cartItems.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="text-6xl mb-6 opacity-20">🛒</div>
                  <p className="text-white/30 font-black pixel tracking-widest">SISTEMA VAZIO</p>
                  <button onClick={onBack} className="mt-8 text-lime-500 font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-colors">Voltar aos Arquivos</button>
                </div>
              ) : (
                cartItems.map(item => {
                  const seed = SEEDS.find(s => String(s.id) === item.seedId);
                  if (!seed) return null;
                  const itemTotal = item.priceNum || 0;
                  const perSeed = itemTotal / (parseInt(item.quantity.replace('X','')) * (item.packCount || 1));

                  return (
                    <div key={item.id} className="flex flex-col md:flex-row gap-6 md:gap-8 pb-8 border-b border-white/5 last:border-0 last:pb-0 group">
                      <div className="w-full md:w-36 h-48 md:h-36 rounded-3xl bg-[#0a0a0a] border border-white/5 overflow-hidden flex-shrink-0 relative group-hover:border-lime-500/30 transition-colors">
                        <img src={seed.image} alt={seed.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                           <span className="text-[9px] font-black pixel text-lime-500/80 bg-black/40 px-2 py-1 rounded border border-white/10 uppercase">{item.variantType}</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                           <div className="max-w-md">
                              <h3 className="font-black text-xl md:text-2xl text-white tracking-tight pixel leading-none group-hover:text-lime-400 transition-colors mb-2 uppercase">{seed.name}</h3>
                              <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">PACK: {getQtyLabel(item.quantity).toUpperCase()} • GENÉTICA PREMIUM</p>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-3xl vt text-white tracking-tight leading-none">R$ {itemTotal.toFixed(2).replace('.', ',')}</span>
                              <span className="text-[10px] text-lime-500/60 font-black pixel mt-2 uppercase tracking-tighter">R$ {perSeed.toFixed(2).replace('.', ',')} / UN</span>
                           </div>
                        </div>

                        <div className="flex items-center justify-between mt-8">
                           <div className="flex items-center gap-8">
                              <div className="flex items-center bg-[#111] rounded-2xl border border-white/5 p-1 h-11">
                                 <button onClick={() => updateCartItem(item, -1)} className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                                   <Minus size={14} className="text-white/60" />
                                 </button>
                                 <span className="px-5 text-lg font-black text-white vt leading-none">{item.packCount || 1}</span>
                                 <button onClick={() => updateCartItem(item, 1)} className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                                   <Plus size={14} className="text-white/60" />
                                 </button>
                              </div>
                              <button onClick={() => removeCartItem(item.id)} className="text-[10px] font-black text-white/30 hover:text-red-500 flex items-center gap-2 transition-colors uppercase tracking-[0.2em] pixel">
                                 <Trash2 size={12} /> <span className="pt-0.5">EXCLUIR</span>
                              </button>
                           </div>
                           <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-lime-500 hover:bg-lime-500/10 transition-all">
                              <Heart size={18} fill="currentColor" className="fill-transparent" />
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* BONUS SEEDS SECTION */}
          <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Ticket size={120} strokeWidth={0.5} />
             </div>
             
             <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div>
                   <h2 className="text-2xl font-black pixel text-white leading-none uppercase mb-2">Protocolo de Bônus</h2>
                   <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Selecione {extraBonusCount - selectedBonuses.length} unidades extras grátis</p>
                </div>
                {selectedBonuses.length === extraBonusCount && (
                  <div className="flex items-center gap-3 text-lime-500 bg-lime-500/10 px-5 py-2.5 rounded-2xl border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)]">
                     <CheckCircle2 size={18} />
                     <span className="text-[10px] font-black pixel uppercase tracking-tighter">SINCRONIA COMPLETA</span>
                  </div>
                )}
             </div>

             <div className="bg-lime-500/5 border border-lime-500/10 rounded-2xl p-5 flex items-center gap-5 mb-10">
                <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center text-2xl shadow-inner border border-lime-500/20">🎁</div>
                <p className="text-[11px] font-bold text-lime-100 uppercase tracking-wide leading-relaxed">
                   Bônus de Sementes: Você ganha sementes grátis conforme o <span className="text-white">pacote escolhido</span> (ex: 2+1, 12+4). Selecione abaixo.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {bonusOptions.map(option => {
                  const isSelected = selectedBonuses.includes(option.id);
                  const canSelectMore = selectedBonuses.length < extraBonusCount;

                  return (
                    <div 
                      key={option.id}
                      onClick={() => (canSelectMore || isSelected) && toggleBonus(option.id)}
                      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-lime-500 bg-lime-500/10 shadow-[0_0_20px_rgba(132,204,22,0.1)]' : (canSelectMore ? 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10' : 'border-white/5 opacity-40 cursor-not-allowed')}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-xl bg-black border border-white/5 overflow-hidden">
                            <img src={option.image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-300" alt="" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm font-black pixel text-white uppercase tracking-tighter group-hover:text-lime-400 transition-colors leading-none mb-1">{option.name}</span>
                            <span className="text-[9px] uppercase font-black text-lime-500 bg-lime-500/10 px-1.5 py-0.5 rounded inline-block w-fit tracking-widest mt-1">FREEWARE</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 px-2">
                         <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-black transition-all ${isSelected ? 'bg-lime-500 text-black' : 'bg-white/5 text-white/20'}`}>
                                {isSelected ? '-' : '+'}
                             </div>
                             <span className="w-4 text-center text-sm font-black vt text-white">{isSelected ? 1 : 0}</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6">
          
          {/* REWARDS CARD */}
          <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-lime-500/10 blur-[80px] rounded-full"></div>
             
             <h3 className="font-black pixel text-sm text-lime-400 mb-6 uppercase tracking-widest leading-none">Status de Upgrade</h3>
             
             <div className="relative h-4 bg-white/5 rounded-full mt-6 mb-2 overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-lime-600 via-lime-400 to-[#bef264] transition-all duration-1000 rounded-full" 
                  style={{ width: `${nextTierProgress}%` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
             </div>
             
             <div className="flex justify-between items-center mb-8 px-1">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-lime-500/60 uppercase tracking-widest mb-1">ATIVA</span>
                   <span className="text-[8px] font-black text-white bg-lime-600 px-2 py-0.5 rounded pixel tracking-tighter">RECARGA 6%</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">BLOQUEADA</span>
                   <span className="text-[8px] font-black text-white/30 border border-white/10 px-2 py-0.5 rounded pixel tracking-tighter">RECARGA 9%</span>
                </div>
             </div>

             <div className="flex justify-between items-center mb-6">
                <span className="text-xl vt text-white/30">R$ {totalItemsRef.toFixed(2).replace('.',',')}</span>
                <div className="h-px bg-white/5 flex-1 mx-4"></div>
                <span className="text-xl vt text-white/30">R$ {(totalItemsRef + missingForNext).toFixed(2).replace('.',',')}</span>
             </div>

             <div className="flex flex-col gap-4 bg-black/60 p-5 rounded-3xl border border-white/5 shadow-inner">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 shadow-lg">
                      <Plus size={18} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-1">Próximo Nível:</p>
                      <p className="text-[11px] font-black text-lime-500 pixel uppercase tracking-tighter flex items-center gap-1">
                        +1 UNIDADE <span className="text-white opacity-40 mx-1">•</span> <span className="text-white/60 vt text-sm">FALTAM R$ {missingForNext.toFixed(2).replace('.',',')}</span>
                      </p>
                   </div>
                </div>
                <div className="h-px bg-white/5 my-1"></div>
                <div className="flex items-center gap-4 opacity-40">
                   <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20">
                      <Ticket size={18} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-1">Upgrade Tier 3:</p>
                      <p className="text-[11px] font-black text-white/40 pixel uppercase tracking-tighter">
                        DISCOUNT 9% <span className="text-white opacity-20 mx-1">•</span> <span className="text-white/40 vt text-sm">R$ {(missingForNext + 116.63).toFixed(2).replace('.',',')}</span>
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* SUMMARY */}
          <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute bottom-0 right-0 p-4 opacity-[0.02]">
                <ShoppingCart size={150} strokeWidth={1} />
             </div>

             <h4 className="font-black pixel text-xs text-white/30 mb-8 uppercase tracking-[0.3em]">RESUMO DA TRANSAÇÃO</h4>
             
             <div className="flex flex-col gap-5 mb-10">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                   <span className="text-[11px] font-black text-white/40 uppercase tracking-widest pixel">Preço Base:</span>
                   <span className="text-xl vt text-white">R$ {totalItemsRef.toFixed(2).replace('.', ',')}</span>
                </div>
                {extraBonusCount > 0 && (
                   <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <span className="text-[11px] font-black text-lime-500 uppercase tracking-widest pixel">Sementes Bônus ({selectedBonuses.length}/{extraBonusCount}):</span>
                      <span className="text-xl vt text-lime-500">+{selectedBonuses.length} UN</span>
                   </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <span className="text-[11px] font-black text-lime-500 uppercase tracking-widest pixel">Desconto Operacional ({discountAmount}%):</span>
                     <span className="text-xl vt text-lime-500">-R$ {(totalItemsRef * discountAmount / 100).toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                {isFreeShipping ? (
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest pixel">Frete Express:</span>
                     <span className="text-xl vt text-blue-500">GRÁTIS</span>
                  </div>
                ) : (
                   <div className="flex flex-col gap-3 border-b border-white/5 pb-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-black text-white/40 uppercase tracking-widest pixel">Frete Estimado:</span>
                         <span className="text-xl vt text-white/60">
                            {calculatedShipping !== null ? `+ R$ ${calculatedShipping.toFixed(2).replace('.', ',')}` : 'PENDENTE'}
                         </span>
                      </div>
                      <div className="flex gap-2">
                         <input 
                            type="text" 
                            placeholder="Seu CEP"
                            value={shippingCepCart}
                            onChange={(e) => {
                               let val = e.target.value.replace(/\D/g, '');
                               if (val.length > 8) val = val.slice(0, 8);
                               if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
                               setShippingCepCart(val);
                               if (val.length === 9) handleCalculateShipping(val);
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-lime-400 w-full focus:outline-none focus:border-lime-500/50"
                         />
                         <button 
                            type="button"
                            onClick={() => handleCalculateShipping(shippingCepCart)}
                            className="bg-white/10 hover:bg-white/20 text-white font-black text-[9px] px-3 py-1.5 rounded-lg transition-all"
                         >
                            OK
                         </button>
                      </div>
                   </div>
                )}
                
                {/* COUPON INPUT */}
                <div className="flex flex-col gap-3 border-b border-white/5 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest pixel flex items-center gap-2"><Ticket size={14} className="text-[#00ffff]" /> Cupom de Desconto:</span>
                    {appliedCoupon ? (
                      <span className="text-sm vt text-[#00ffff]">{appliedCoupon.code} (-{appliedCoupon.discountPercentage}%)</span>
                    ) : (
                      <span className="text-xs vt text-white/40">NENHUM</span>
                    )}
                  </div>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Insira o código"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#00ffff] w-full focus:outline-none focus:border-[#00ffff]/50 uppercase font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="bg-[#00ffff]/10 hover:bg-[#00ffff]/20 text-[#00ffff] font-black text-[9px] px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'OK'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCodeInput('');
                          setCouponError('');
                        }}
                        className="text-red-400 text-[9px] font-black hover:underline pixel tracking-widest uppercase"
                      >
                        Remover Cupom
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-500 text-[10px] font-bold mt-1">{couponError}</p>}
                </div>

                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                   <span className="text-[11px] font-black text-yellow-500 uppercase tracking-widest pixel">Economia Acumulada:</span>
                   <span className="text-xl vt text-yellow-500">R$ {(totalItemsRef * 0.4).toFixed(2).replace('.', ',')}</span>
                </div>
             </div>

             <div className="mb-10">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black pixel text-white uppercase tracking-widest mb-1 underline underline-offset-8 decoration-lime-500/50">VALOR TOTAL:</span>
                   <div className="text-right">
                      <span className="text-[9px] font-black text-white/20 block mb-1 pixel tracking-[0.3em]">BRL FINAL</span>
                      <span className="text-[3.5rem] vt text-lime-500 leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(132,204,22,0.3)]">
                        R$ {(totalItemsRef * (1 - discountAmount/100) + (isFreeShipping ? 0 : (calculatedShipping || 0))).toFixed(2).replace('.', ',')}
                      </span>
                   </div>
                </div>
             </div>

             <button 
               onClick={handleProceedAction}
               className="w-full bg-[#84cc16] hover:bg-[#a3e635] text-black font-black uppercase py-5 rounded-3xl shadow-[0_10px_30px_rgba(132,204,22,0.3)] transition-all active:scale-95 text-[11px] pixel tracking-tighter"
             >
                PROSSEGUIR COM A FINALIZAÇÃO
             </button>
          </div>

          {/* FOOTER INFO */}
          <div className="flex flex-col gap-6 pt-4">
             <div className="flex justify-between items-center group cursor-pointer border border-white/5 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4 text-[9px] font-black pixel text-white/40 uppercase tracking-widest group-hover:text-lime-500 transition-colors">
                   <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center shadow-lg">
                      <Globe size={18} className="text-white/20 group-hover:text-lime-500 transition-colors" />
                   </div>
                   Envio Discreto Global Ativo
                </div>
                <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[8px] text-white/20 pixel">?</div>
             </div>
             <div className="flex justify-between items-center group cursor-pointer border border-white/5 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4 text-[9px] font-black pixel text-white/40 uppercase tracking-widest group-hover:text-lime-500 transition-colors">
                   <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center font-black text-lime-500 shadow-lg text-lg vt">
                      $
                   </div>
                   Múltiplos Gateways de Pagamento
                </div>
                <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[8px] text-white/20 pixel">?</div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
