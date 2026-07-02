import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export const CouponPopup = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'coupons'), where('isActive', '==', true));
    const unsub = onSnapshot(q, (snapshot) => {
      const activeCoupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(activeCoupons);
    }, (error) => {
      console.error("Coupons snapshot listener error:", error);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (coupons.length === 0) return;

    // Show first coupon after a short delay
    const initialTimeout = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), 8000);
    }, 10000);

    // Interval to show the next coupon every 45 seconds
    const interval = setInterval(() => {
      setCurrentCouponIndex(prev => (prev + 1) % coupons.length);
      setVisible(true);
      
      // Hide after 8 seconds
      setTimeout(() => {
        setVisible(false);
      }, 8000);
    }, 45000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [coupons]);

  if (!visible || coupons.length === 0) return null;

  const currentCoupon = coupons[currentCouponIndex];
  if (!currentCoupon) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[9999] bg-[#111] border-2 border-[#00ffff] rounded-xl p-4 shadow-[0_0_20px_rgba(0,255,255,0.4)] max-w-[280px] transition-all duration-500 ease-in-out transform translate-y-0 opacity-100">
      <button 
        onClick={() => setVisible(false)}
        className="absolute -top-3 -right-3 bg-black border-2 border-[#00ffff] text-[#00ffff] rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-[#00ffff] hover:text-black transition-colors z-10"
      >
        ✕
      </button>
      <div className="text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        <h4 className="text-[#00ffff] font-black pixel text-[14px] mb-2 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">CUPOM ATIVO!</h4>
        <p className="text-white text-xs mb-2">Use o código no checkout:</p>
        <div 
          onClick={() => {
            navigator.clipboard.writeText(currentCoupon.code);
            setVisible(false);
          }}
          className="bg-black border border-[#00ffff] text-[#00ffff] font-mono text-xl py-2 px-4 rounded-lg tracking-widest inline-block mx-auto mb-3 select-all cursor-pointer hover:bg-[#00ffff] hover:text-black transition-colors"
          title="Clique para copiar"
        >
          {currentCoupon.code}
        </div>
        <p className="text-lime-400 text-[10px] uppercase font-bold pixel mb-1">
          {currentCoupon.discountPercentage}% DE DESCONTO
        </p>
        <p className="text-[9px] text-white/50">Clique no código para copiar</p>
      </div>
    </div>
  );
};
