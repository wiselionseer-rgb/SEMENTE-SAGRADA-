import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collectionGroup, getDocs, orderBy, query, collection, addDoc, doc, updateDoc, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { X, Package, Search, DollarSign, Calendar, Mail, Loader2, ChevronDown, Ticket, Plus, Check, CheckCircle2, LayoutDashboard, RefreshCcw } from 'lucide-react';
import { SEEDS } from './data';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'coupons'>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // New Coupon Form
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('15');
  const [couponMaxUses, setCouponMaxUses] = useState('10');

  useEffect(() => {
    setLoading(true);

    // Real-time Orders using collectionGroup
    const qOrders = query(collectionGroup(db, 'orders'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(d => ({
        id: d.id,
        userId: d.ref.parent.parent?.id,
        ...d.data()
      }));
      fetchedOrders.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    // Real-time Coupons
    const qCoupons = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
    const unsubscribeCoupons = onSnapshot(qCoupons, (snapshot) => {
      const fetchedCoupons = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setCoupons(fetchedCoupons);
    }, (error) => {
      console.error("Error fetching coupons:", error);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeCoupons();
    };
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount || !couponMaxUses) return;
    
    try {
      const newCoupon = {
        code: couponCode.toUpperCase(),
        discountPercentage: Number(couponDiscount),
        maxUses: Number(couponMaxUses),
        usedCount: 0,
        isActive: true,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, 'coupons'), newCoupon);
      setCoupons([{ id: docRef.id, ...newCoupon }, ...coupons]);
      setCouponCode('');
      setCouponDiscount('15');
      setCouponMaxUses('10');
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("Erro ao criar cupom. Verifique as permissões.");
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', id), { isActive: !currentStatus });
      setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    } catch (error) {
      console.error("Error updating coupon:", error);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const updateOrderStatus = async (userId: string, orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, `users/${userId}/orders`, orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getSeedName = (id: string) => {
    const seed = SEEDS.find(s => s.id === parseInt(id));
    return seed ? seed.name : `Semente #${id}`;
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.userId && o.userId.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const clearAllOrders = async () => {
    if (!window.confirm('⚠️ ATENÇÃO: Isso apagará TODOS os pedidos e cupons, zerando as estatísticas permanentemente. Deseja continuar?')) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      let ops = 0;

      // 1. Clear Orders from all users
      const qOrders = query(collectionGroup(db, 'orders'));
      const ordersSnap = await getDocs(qOrders);
      console.log('Number of orders found via collectionGroup:', ordersSnap.size);
      ordersSnap.forEach((d) => {
        batch.delete(d.ref);
        ops++;
      });

      // 2. Clear Coupons
      const couponsSnap = await getDocs(collection(db, 'coupons'));
      console.log('Number of coupons found:', couponsSnap.size);
      couponsSnap.forEach((d) => {
        batch.delete(d.ref);
        ops++;
      });

      if (ops > 0) {
        await batch.commit();
        alert(`Sucesso! ${ops} registros foram removidos.`);
      } else {
        alert('Não há dados para limpar.');
      }
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      alert('Erro ao tentar limpar os dados. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Coupon Ranking
  const couponRanking = orders.reduce((acc: { [key: string]: { total: number, count: number } }, order) => {
    if (order.appliedCoupon) {
      const code = order.appliedCoupon.toUpperCase();
      if (!acc[code]) acc[code] = { total: 0, count: 0 };
      acc[code].total += order.totalAmount || 0;
      acc[code].count += 1;
    }
    return acc;
  }, {});

  const sortedRanking = Object.entries(couponRanking)
    .sort(([, a], [, b]) => (b as any).total - (a as any).total);

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ zIndex: 999999 }} className="fixed inset-0 bg-black/95 flex flex-col font-sans"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="bg-[#ff00ff]/20 p-2 rounded-xl border border-[#ff00ff]/30">
            <Package className="text-[#ff00ff]" size={24} />
          </div>
          <div>
            <h2 className="text-xl text-white font-black pixel uppercase tracking-widest">Painel Administrativo</h2>
            <p className="text-[#ff00ff] text-xs vt uppercase tracking-[0.2em] font-bold">Gerenciamento Geral</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#050505]">
        {/* Sidebar */}
        <div className="w-full lg:w-80 border-r border-[#333] bg-[#0a0a0a] p-6 flex flex-col gap-6 overflow-y-auto">
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full py-3 px-4 rounded-xl font-black pixel text-[10px] tracking-widest uppercase transition-colors ${activeTab === 'dashboard' ? 'bg-lime-500 text-black' : 'bg-[#111] text-white/50 hover:text-white hover:bg-[#222]'}`}
            >
              Dashboard
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 px-4 rounded-xl font-black pixel text-[10px] tracking-widest uppercase transition-colors ${activeTab === 'orders' ? 'bg-[#ff00ff] text-black' : 'bg-[#111] text-white/50 hover:text-white hover:bg-[#222]'}`}
              >
                Pedidos
              </button>
              <button 
                onClick={() => setActiveTab('coupons')}
                className={`flex-1 py-3 px-4 rounded-xl font-black pixel text-[10px] tracking-widest uppercase transition-colors ${activeTab === 'coupons' ? 'bg-[#00ffff] text-black' : 'bg-[#111] text-white/50 hover:text-white hover:bg-[#222]'}`}
              >
                Cupons
              </button>
            </div>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white/50 text-xs font-black pixel mb-2">Total de Vendas</h3>
            <div className="flex items-center gap-3">
              <DollarSign className="text-lime-500" size={32} />
              <span className="text-3xl text-white font-bold vt">R$ {totalRevenue.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-black/50 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white/50 text-xs font-black pixel mb-2">Pedidos Realizados</h3>
            <div className="flex items-center gap-3">
              <Package className="text-[#00ffff]" size={32} />
              <span className="text-3xl text-white font-bold vt">{orders.length}</span>
            </div>
          </div>

          {activeTab === 'orders' && (
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type="text" 
                placeholder="Buscar pedido ou usuário..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111] border border-[#333] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-lime-500 transition-colors placeholder:text-white/30"
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4">
              <Loader2 className="animate-spin text-lime-500" size={48} />
              <p className="pixel text-sm tracking-widest uppercase">Carregando dados...</p>
            </div>
          ) : activeTab === 'dashboard' ? (
             <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-white font-black pixel text-sm tracking-widest uppercase flex items-center gap-2">
                     <LayoutDashboard className="text-lime-500" size={18} />
                     Resumo Operacional
                   </h3>
                   <button 
                     onClick={clearAllOrders}
                     className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-[9px] font-black pixel tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                   >
                     <RefreshCcw size={12} /> Reiniciar Dados
                   </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-[#111] border border-[#333] rounded-3xl p-6">
                      <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-4">Total Arrecadado</p>
                      <p className="text-lime-400 font-black text-4xl vt">R$ {totalRevenue.toFixed(2)}</p>
                   </div>
                   <div className="bg-[#111] border border-[#333] rounded-3xl p-6">
                      <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-4">Pedidos Realizados</p>
                      <p className="text-white font-black text-4xl vt">{orders.length}</p>
                   </div>
                   <div className="bg-[#111] border border-[#333] rounded-3xl p-6">
                      <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-4">Ticket Médio</p>
                      <p className="text-[#00ffff] font-black text-4xl vt">R$ {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-6">
                      <p className="text-yellow-500/70 text-xs font-black uppercase tracking-widest mb-4">Pendentes</p>
                      <p className="text-yellow-400 font-black text-3xl vt">{orders.filter(o => o.status === 'Pendente').length}</p>
                   </div>
                   <div className="bg-lime-500/10 border border-lime-500/30 rounded-3xl p-6">
                      <p className="text-lime-500/70 text-xs font-black uppercase tracking-widest mb-4">Pagos (A Enviar)</p>
                      <p className="text-lime-400 font-black text-3xl vt">{orders.filter(o => o.status === 'Pago').length}</p>
                   </div>
                   <div className="bg-[#00ffff]/10 border border-[#00ffff]/30 rounded-3xl p-6">
                      <p className="text-[#00ffff]/70 text-xs font-black uppercase tracking-widest mb-4">Enviados</p>
                      <p className="text-[#00ffff] font-black text-3xl vt">{orders.filter(o => o.status === 'Enviado').length}</p>
                   </div>
                </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* ULTIMOS PEDIDOS */}
                    <div className="bg-[#111] border border-[#333] rounded-3xl p-6">
                       <h3 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Package className="text-lime-500" size={18} />
                         Últimos Pedidos
                       </h3>
                       <div className="space-y-2">
                          {orders.slice(0, 5).map(order => (
                             <div key={order.id} className="flex justify-between items-center py-3 border-b border-[#333] last:border-0">
                                <div>
                                   <p className="text-white font-bold text-xs">#{order.id.slice(0,8).toUpperCase()}</p>
                                   <p className="text-white/40 text-[10px] mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-lime-400 font-black text-sm">R$ {order.totalAmount.toFixed(2)}</p>
                                   {order.appliedCoupon && (
                                      <p className="text-[#00ffff] font-bold text-[9px] uppercase tracking-tighter">Cupom: {order.appliedCoupon}</p>
                                   )}
                                </div>
                             </div>
                          ))}
                       </div>
                       <button onClick={() => setActiveTab('orders')} className="w-full mt-6 bg-[#222] hover:bg-[#333] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Ver todos os pedidos</button>
                    </div>

                    {/* RANKING DE CUPONS */}
                    <div className="bg-[#111] border border-[#333] rounded-3xl p-6">
                       <h3 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Ticket className="text-[#ff00ff]" size={18} />
                         Ranking de Cupons (Influencers)
                       </h3>
                       <div className="space-y-4">
                          {sortedRanking.length === 0 ? (
                            <div className="py-10 text-center text-white/20">
                              <p className="text-[10px] font-black uppercase tracking-widest">Nenhum cupom rastreado</p>
                            </div>
                          ) : (
                            (sortedRanking as [string, { total: number, count: number }][]).map(([code, stats], index) => (
                              <div key={code} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 group hover:border-[#ff00ff]/30 transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${
                                      index === 0 ? 'bg-yellow-500 text-black' : 
                                      index === 1 ? 'bg-gray-300 text-black' : 
                                      index === 2 ? 'bg-orange-600 text-white' : 
                                      'bg-white/10 text-white/40'
                                    }`}>
                                       {index + 1}
                                    </div>
                                    <div>
                                       <p className="text-white font-black text-xs font-mono">{code}</p>
                                       <p className="text-white/30 text-[9px] font-bold uppercase">{stats.count} vendas</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[#00ffff] font-black text-base vt">R$ {stats.total.toFixed(2)}</p>
                                    <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                       <div 
                                         className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00ffff]" 
                                         style={{ width: `${Math.min(100, (stats.total / totalRevenue) * 100)}%` }}
                                       />
                                    </div>
                                 </div>
                              </div>
                            ))
                          )}
                       </div>
                    </div>
                  </div>
               </div>
            ) : activeTab === 'orders' ? (
             // ORDERS TAB
             filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/50">
                <p className="pixel text-sm tracking-widest uppercase">Nenhum pedido encontrado.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map(order => (
                  <div key={order.id} className="bg-[#111] border border-[#333] rounded-2xl overflow-hidden transition-all hover:border-white/20">
                    <div 
                      className="p-5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-12 h-12 bg-black rounded-xl border border-white/10 flex items-center justify-center">
                          <Package className={order.status === 'Pendente' ? 'text-yellow-500' : order.status === 'Pago' ? 'text-lime-500' : 'text-[#00ffff]'} size={24} />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm lg:text-base">Pedido #{order.id.slice(0,8).toUpperCase()}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <Calendar size={12} className="text-white/40" />
                             <span className="text-white/40 text-xs font-sans">{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 min-w-[150px]">
                         <div className="flex items-center gap-2">
                           <Mail size={14} className="text-white/40" />
                           <span className="text-white/70 text-xs truncate max-w-[120px] lg:max-w-[200px]" title={order.userId}>{order.userId}</span>
                         </div>
                         <div className="inline-flex">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                                order.status === 'Pago' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 
                                'bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/30'
                            }`}>
                              {order.status}
                            </span>
                         </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-white/50 text-xs font-bold uppercase mb-1">Total</p>
                          <p className="text-lime-400 font-black text-lg">R$ {order.totalAmount.toFixed(2)}</p>
                          {order.appliedCoupon && (
                            <p className="text-[#00ffff] font-black text-[10px] uppercase tracking-tighter mt-1">Cupom: {order.appliedCoupon}</p>
                          )}
                        </div>
                        <ChevronDown size={20} className={`text-white/50 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedOrder === order.id && (
                      <div className="p-5 border-t border-[#333] bg-black/40">
                        <h4 className="text-white/50 text-xs font-black pixel mb-4 tracking-widest">ITENS DO PEDIDO</h4>
                        <div className="flex flex-col gap-3">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-[#111] p-3 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3">
                                 <div className="bg-black p-2 rounded-lg border border-white/10 text-white/50 text-xs font-bold w-10 text-center">
                                   {item.packCount}x
                                 </div>
                                 <div>
                                   <p className="text-white font-bold text-sm">{getSeedName(item.seedId)}</p>
                                   <p className="text-white/50 text-xs">Tipo: <span className="text-white/80">{item.variantType}</span> | Qtd: <span className="text-white/80">{item.quantity}</span></p>
                                 </div>
                              </div>
                              <span className="text-lime-400 font-bold">R$ {item.priceNum.toFixed(2)}</span>
                            </div>
                          ))}

                          {order.bonusSeeds && order.bonusSeeds.length > 0 && (
                             <>
                               <h4 className="text-[#00ffff]/70 text-xs font-black pixel mt-4 mb-2 tracking-widest">BRINDES INCLUSOS</h4>
                               {order.bonusSeeds.map((bonusId: string, idx: number) => (
                                  <div key={`bonus-${idx}`} className="flex justify-between items-center bg-[#00ffff]/5 p-3 rounded-xl border border-[#00ffff]/20">
                                     <div className="flex items-center gap-3">
                                       <div className="bg-black p-2 rounded-lg border border-[#00ffff]/30 text-[#00ffff] text-xs font-bold w-10 text-center">
                                         1x
                                       </div>
                                       <p className="text-[#00ffff] font-bold text-sm">{getSeedName(bonusId)} (Semente Bônus)</p>
                                     </div>
                                     <span className="text-[#00ffff] font-bold">GRÁTIS</span>
                                  </div>
                               ))}
                             </>
                          )}
                        </div>
                        {order.appliedCoupon && (
                          <div className="mt-6 bg-[#00ffff]/5 border border-[#00ffff]/20 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Ticket className="text-[#00ffff]" size={18} />
                              <div>
                                <p className="text-[#00ffff] font-black text-xs uppercase tracking-widest">Cupom Utilizado</p>
                                <p className="text-white font-mono text-sm">{order.appliedCoupon}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Impacto</p>
                              <p className="text-white font-bold text-xs">Venda Rastreada</p>
                            </div>
                          </div>
                        )}
                        {order.status === 'Pendente' && (
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.userId, order.id, 'Pago');
                              }}
                              className="bg-lime-500 hover:bg-lime-400 text-black px-6 py-2 rounded-xl font-black pixel text-[10px] tracking-widest uppercase transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 size={16} /> Marcar como Pago
                            </button>
                          </div>
                        )}
                        {order.status === 'Pago' && (
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.userId, order.id, 'Enviado');
                              }}
                              className="bg-[#00ffff] hover:bg-[#00cccc] text-black px-6 py-2 rounded-xl font-black pixel text-[10px] tracking-widest uppercase transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 size={16} /> Marcar como Enviado
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            // COUPONS TAB
            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
              <div className="bg-black/40 border border-[#333] rounded-2xl p-6 shadow-xl">
                <h3 className="text-white font-black pixel text-sm mb-6 flex items-center gap-3 tracking-widest uppercase"><Ticket className="text-[#00ffff]" size={20}/> Gerar Novo Cupom</h3>
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="flex flex-col gap-2">
                     <label className="text-white/50 text-xs font-bold uppercase">Código do Cupom</label>
                     <input required type="text" placeholder="EX: PROMO15" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="bg-[#111] border border-white/10 text-white p-3 rounded-xl uppercase font-mono focus:border-[#00ffff] outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-white/50 text-xs font-bold uppercase">Desconto (%)</label>
                     <input required type="number" min="1" max="100" placeholder="15" value={couponDiscount} onChange={e => setCouponDiscount(e.target.value)} className="bg-[#111] border border-white/10 text-white p-3 rounded-xl font-mono focus:border-[#00ffff] outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-white/50 text-xs font-bold uppercase">Uso Máximo</label>
                     <input required type="number" min="1" placeholder="10" value={couponMaxUses} onChange={e => setCouponMaxUses(e.target.value)} className="bg-[#111] border border-white/10 text-white p-3 rounded-xl font-mono focus:border-[#00ffff] outline-none" />
                  </div>
                  <button type="submit" className="bg-[#00ffff] hover:bg-[#00cccc] text-black font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                     <Plus size={18} /> Criar Cupom
                  </button>
                </form>
              </div>

              <div className="bg-[#111] border border-[#333] rounded-2xl overflow-hidden">
                 <div className="p-4 border-b border-[#333] bg-black/50">
                   <h3 className="text-white font-black pixel text-xs tracking-widest uppercase">Cupons Cadastrados</h3>
                 </div>
                 {coupons.length === 0 ? (
                   <div className="p-8 text-center text-white/40 font-bold uppercase text-sm">Nenhum cupom gerado.</div>
                 ) : (
                   <table className="w-full text-left text-sm text-white/80">
                     <thead className="bg-[#050505] text-white/50 font-black uppercase text-[10px] tracking-wider pixel">
                       <tr>
                         <th className="p-4 border-b border-[#333]">Código</th>
                         <th className="p-4 border-b border-[#333]">Desconto</th>
                         <th className="p-4 border-b border-[#333]">Usos</th>
                         <th className="p-4 border-b border-[#333]">Status</th>
                         <th className="p-4 border-b border-[#333] text-right">Ações</th>
                       </tr>
                     </thead>
                     <tbody>
                       {coupons.map(coupon => (
                         <tr key={coupon.id} className="border-b border-[#222] hover:bg-white/[0.02]">
                           <td className="p-4 font-mono font-bold text-[#00ffff]">{coupon.code}</td>
                           <td className="p-4 font-bold">{coupon.discountPercentage}%</td>
                           <td className="p-4">
                             <div className="flex items-center gap-2">
                               <div className="w-16 h-2 bg-[#222] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#00ffff]" style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}></div>
                               </div>
                               <span className="text-xs font-mono">{coupon.usedCount} / {coupon.maxUses}</span>
                             </div>
                           </td>
                           <td className="p-4">
                             <button 
                               onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                               className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${coupon.isActive ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                             >
                               {coupon.isActive ? 'Ativo' : 'Inativo'}
                             </button>
                           </td>
                           <td className="p-4 text-right">
                             <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                               <X size={16} />
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
