import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShieldCheck, CreditCard, Wallet, Truck, Package, Info, CheckCircle2 } from 'lucide-react';
import { SEEDS } from './data';
import { playSfx } from './audio';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

interface PaymentPageProps {
  cartItems: any[];
  selectedBonuses: number[];
  totalAmount: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PaymentPage({ cartItems, selectedBonuses, totalAmount, onBack, onSuccess }: PaymentPageProps) {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CRYPTO' | 'BOLETO'>('PIX');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cpf: '',
    email: auth.currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: 'Brasil',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    // Simple validation
    if (!formData.firstName || !formData.cpf || !formData.email || !formData.address || !formData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    playSfx('click');

    try {
      const batch = writeBatch(db);
      const newOrderRef = doc(collection(db, `users/${auth.currentUser.uid}/orders`));
      
      batch.set(newOrderRef, {
        totalAmount,
        items: cartItems,
        bonusSeeds: selectedBonuses,
        shippingInfo: formData,
        paymentMethod,
        status: 'Pendente',
        createdAt: Date.now()
      });

      // Clear cart
      for (const item of cartItems) {
        batch.delete(doc(db, `users/${auth.currentUser.uid}/cartItems/${item.id}`));
      }
      
      await batch.commit();
      playSfx('stage');
      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/orders`);
    } finally {
      setLoading(false);
    }
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
                 <ChevronLeft size={20} className="text-lime-500 group-hover:-translate-x-1 transition-transform" />
              </button>
              <h1 className="text-xl md:text-2xl font-black pixel text-lime-400 tracking-tighter uppercase">Protocolo de Finalização</h1>
           </div>
           <div className="flex items-center gap-4 bg-lime-500/10 px-4 py-2 rounded-xl border border-lime-500/20">
              <ShieldCheck size={18} className="text-lime-500" />
              <span className="text-[10px] font-black pixel text-white uppercase tracking-tighter">Conexão Segura Ativa</span>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        <form onSubmit={handleFinalize} className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: FORM */}
          <div className="flex-1 flex flex-col gap-8">
            
            {/* STEP 1: IDENTITY */}
            <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 font-bold pixel">01</div>
                <h3 className="text-xl font-black pixel text-white uppercase tracking-tighter">Identificação do Usuário</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">Primeiro Nome *</label>
                  <input 
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="DIGITE SEU NOME"
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">Último Nome</label>
                  <input 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="DIGITE SEU SOBRENOME"
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">E-mail de Contato *</label>
                  <input 
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="SEU@EMAIL.COM"
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">CPF *</label>
                  <input 
                    name="cpf"
                    required
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">Telefone / WhatsApp *</label>
                  <input 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: LOGISTICS */}
            <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 font-bold pixel">02</div>
                <h3 className="text-xl font-black pixel text-white uppercase tracking-tighter">Protocolo de Logística</h3>
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">Endereço Completo *</label>
                  <input 
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="RUA, NÚMERO, APTO..."
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">Cidade *</label>
                    <input 
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="SUA CIDADE"
                      className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all uppercase"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">CEP / ZIP *</label>
                    <input 
                      name="zip"
                      required
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="00000-000"
                      className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2 lg:col-span-1">
                    <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">País</label>
                    <div className="relative">
                      <select 
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all uppercase appearance-none"
                      >
                        <option value="Brasil">Brasil</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Uruguai">Uruguai</option>
                        <option value="Outro">Outro</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">▼</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black pixel text-white/50 uppercase tracking-widest ml-1">Instruções Especiais (Opcional)</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="REFERÊNCIA, HORÁRIO DE ENTREGA, OBSERVAÇÕES..."
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm lg:text-base font-bold sans placeholder:text-white/20 text-lime-400 focus:outline-none focus:border-lime-500/50 transition-all uppercase min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 md:p-10 shadow-2xl relative overflow-hidden">
               <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 font-bold pixel">03</div>
                <h3 className="text-xl font-black pixel text-white uppercase tracking-tighter">Canal de Liquidação</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  type="button"
                  onClick={() => { playSfx('click'); setPaymentMethod('PIX'); }}
                  className={`flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all ${paymentMethod === 'PIX' ? 'bg-lime-500/10 border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'PIX' ? 'bg-lime-500 text-black' : 'bg-white/10 text-white/40'}`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-xs font-black pixel uppercase tracking-widest">PIX E-WALLET</span>
                 </button>
                 <button 
                   type="button"
                   onClick={() => { playSfx('click'); setPaymentMethod('CRYPTO'); }}
                   className={`flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all ${paymentMethod === 'CRYPTO' ? 'bg-[#ff00ff]/10 border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                 >
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'CRYPTO' ? 'bg-[#ff00ff] text-white' : 'bg-white/10 text-white/40'}`}>
                     <Wallet size={24} />
                   </div>
                   <span className="text-xs font-black pixel uppercase tracking-widest">CRIPTO ATIVOS</span>
                 </button>
                 <button 
                   type="button"
                   onClick={() => { playSfx('click'); setPaymentMethod('BOLETO'); }}
                   className={`flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all ${paymentMethod === 'BOLETO' ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                 >
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'BOLETO' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/40'}`}>
                     <CreditCard size={24} />
                   </div>
                   <span className="text-xs font-black pixel uppercase tracking-widest">BOLETO BANCÁRIO</span>
                 </button>
              </div>

              <div className="mt-8 bg-black/60 p-6 rounded-[2rem] border border-white/5 flex items-start gap-4">
                 <Info className="text-lime-500 shrink-0 mt-1" size={18} />
                 <p className="text-sm text-white/70 leading-relaxed font-bold sans uppercase tracking-wide">
                   {paymentMethod === 'PIX' && 'O código PIX será gerado após a confirmação. Pagamentos PIX são processados instantaneamente por nossa rede e garantem bônus extras.'}
                   {paymentMethod === 'CRYPTO' && 'Aceitamos BTC, ETH e USDT. Os detalhes da carteira serão enviados para sua rede de contato segura após a finalização.'}
                   {paymentMethod === 'BOLETO' && 'O boleto bancário tem um prazo de compensação de até 48 horas úteis através do banco central.'}
                 </p>
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="w-full lg:w-[420px] flex flex-col gap-6">
            <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl sticky top-28">
               <h3 className="font-black pixel text-xs text-white/30 mb-8 uppercase tracking-[0.3em]">Resumo da Requisição</h3>
               
               <div className="flex flex-col gap-4 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item, i) => {
                    const seed = SEEDS.find(s => String(s.id) === item.seedId);
                    return (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden shrink-0 group-hover:border-lime-500/30 transition-colors">
                           <img src={seed?.image} className="w-full h-full object-cover grayscale opacity-50" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black text-white uppercase truncate">{seed?.name}</p>
                           <p className="text-[10px] text-white/50 pixel uppercase tracking-tighter">{item.quantity} • {item.variantType}</p>
                        </div>
                        <span className="vt text-white/80 text-xl font-bold">x{item.packCount || 1}</span>
                      </div>
                    )
                  })}
                  {selectedBonuses.length > 0 && (
                    <div className="pt-4 border-t border-white/5 mt-2">
                       <span className="text-[10px] pixel text-lime-500 uppercase tracking-widest block mb-4">HARDWARE BÔNUS ATIVO:</span>
                       {selectedBonuses.map((id, i) => {
                          const seed = SEEDS.find(s => s.id === id);
                          return (
                            <div key={i} className="flex items-center gap-4 mb-3 opacity-80">
                               <div className="w-10 h-10 rounded-lg border border-lime-500/20 bg-lime-500/5 flex items-center justify-center text-sm">🎁</div>
                               <span className="text-sm font-bold text-white uppercase truncate">{seed?.name}</span>
                               <span className="vt text-lime-500 ml-auto font-bold text-lg">FREE</span>
                            </div>
                          )
                       })}
                    </div>
                  )}
               </div>

               <div className="flex flex-col gap-4 border-t border-white/5 pt-8 mb-10">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black pixel text-white/50 uppercase tracking-widest italic">VALOR TOTAL:</span>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-white/30 block mb-2 pixel tracking-[0.3em]">BRL LÍQUIDO</span>
                       <span className="text-5xl vt text-lime-500 leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(132,204,22,0.5)]">
                         R$ {totalAmount.toFixed(2).replace('.', ',')}
                       </span>
                    </div>
                  </div>
               </div>

               <button 
                 type="submit"
                 disabled={loading}
                 className={`w-full bg-lime-500 hover:bg-lime-400 text-black font-black uppercase py-6 rounded-3xl shadow-[0_10px_40px_rgba(132,204,22,0.3)] transition-all active:scale-95 text-xs pixel tracking-widest flex items-center justify-center gap-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  {loading ? (
                    'PROCESSANDO...'
                  ) : (
                    <>
                      <Package size={18} />
                      FINALIZAR PROTOCOLO
                    </>
                  )}
               </button>

               <div className="mt-8 flex items-center gap-4 text-center justify-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center"><Truck size={14} className="text-white/20" /></div>
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center"><ShieldCheck size={14} className="text-white/20" /></div>
                  </div>
                  <p className="text-[8px] font-black pixel text-white/20 uppercase tracking-[0.2em]">Discreet Shipping & Warranty Active</p>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
