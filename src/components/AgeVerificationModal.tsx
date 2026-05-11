import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Check, ChevronRight } from 'lucide-react';

interface AgeVerificationModalProps {
  onVerify: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerify }) => {
  const [agreed, setAgreed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure styles are loaded
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    if (agreed) {
      localStorage.setItem('age-verified-v2', 'true');
      onVerify();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        >
          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(rgba(0,255,0,0.03)_0px,transparent_1px,transparent_2px)] z-10"></div>
          
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border-2 border-[#00ff00] p-6 md:p-8 shadow-[0_0_50px_rgba(0,255,0,0.2)] overflow-hidden"
          >
            {/* Header with mascot/icon */}
            <div className="flex items-center gap-4 mb-6 border-b border-[#00ff00]/30 pb-4">
              <div className="w-12 h-12 bg-[#ff00ff]/20 border border-[#ff00ff] rounded flex items-center justify-center p-2 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                 <img src="/gifs/flower_bed.gif" className="w-full h-full pixelate" alt="Icon" />
              </div>
              <div>
                <h2 className="pixel text-[#00ff00] text-xl md:text-2xl leading-tight uppercase tracking-wider">
                  Semente Sagrada
                </h2>
                <p className="vt text-[#ff00ff] text-sm uppercase tracking-[0.2em] font-bold italic">
                  Acesso Restrito
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4 mb-8">
              <div className="bg-[#111111] border-l-4 border-yellow-500 p-4 space-y-2">
                <div className="flex items-center gap-2 text-yellow-500 mb-1">
                  <ShieldAlert size={18} />
                  <span className="pixel text-xs">AVISO IMPORTANTE</span>
                </div>
                <p className="vt text-white text-base md:text-lg leading-relaxed text-balance italic">
                  Este site é destinado exclusivamente para <span className="text-[#00ff00] font-bold">COLECIONADORES</span>.
                </p>
                <p className="vt text-gray-400 text-sm md:text-base leading-relaxed">
                  Todas as sementes fornecidas são itens de coleção para preservação genética. O cultivo pode ser proibido dependendo da legislação local.
                </p>
              </div>

              <ul className="vt space-y-2 text-gray-300 text-sm md:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-[#00ff00] mt-1 shrink-0"><Check size={14} /></span>
                  <span><strong>Semente Sagrada World:</strong> Genéticas originais com origem na <strong>Espanha</strong> para o Brasil.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00ff00] mt-1 shrink-0"><Check size={14} /></span>
                  <span>Entrega discreta e garantida em todo o território nacional.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00ff00] mt-1 shrink-0"><Check size={14} /></span>
                  <span>Venda autorizada estritamente como item de coleção para preservação.</span>
                </li>
              </ul>
            </div>

            {/* Checkbox Acceptance */}
            <label className="flex items-center gap-3 cursor-pointer group mb-8 p-3 border border-[#00ff00]/10 hover:border-[#00ff00]/30 transition-all rounded bg-white/[0.02]">
              <div 
                className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${
                  agreed ? 'bg-[#00ff00] border-[#00ff00]' : 'border-gray-600 group-hover:border-[#00ff00]'
                }`}
              >
                {agreed && <Check size={16} className="text-black font-bold" />}
              </div>
              <p className="vt text-xs md:text-sm text-gray-200 select-none flex-1">
                Confirmo que tenho <span className="text-[#00ff00] font-bold italic underline">MAIS DE 18 ANOS</span> e aceito os 
                <span className="text-[#ff00ff] hover:underline px-1">Termos e Condições</span> 
                e a <span className="text-[#ff00ff] hover:underline px-1">Política de Privacidade</span>.
              </p>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={agreed} 
                onChange={() => setAgreed(!agreed)} 
              />
            </label>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={!agreed}
              className={`w-full group relative flex items-center justify-center gap-2 p-4 overflow-hidden transition-all duration-300 ${
                agreed 
                ? 'bg-[#00ff00] hover:bg-[#00cc00] shadow-[0_0_20px_rgba(0,255,0,0.4)]' 
                : 'bg-gray-800 opacity-50 cursor-not-allowed grayscale'
              }`}
            >
              <span className={`pixel text-sm uppercase font-bold tracking-widest transition-colors ${agreed ? 'text-black' : 'text-gray-400'}`}>
                Entrar no Universo
              </span>
              <ChevronRight size={18} className={agreed ? "text-black group-hover:translate-x-1 transition-transform" : "text-gray-400"} />
              
              {/* Scanline pattern for button */}
              {agreed && (
                <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.1)_3px)]"></div>
              )}
            </button>

            {/* Footer tiny text */}
            <p className="vt text-[10px] text-gray-600 text-center mt-4 uppercase tracking-[0.3em]">
              Semente Sagrada World &copy; MMXXIV - Cyber-Preservação 
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgeVerificationModal;
