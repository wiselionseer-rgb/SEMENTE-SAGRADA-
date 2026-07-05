import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type ServiceType = 'laudo' | 'juridico' | 'medicamentos' | 'consulta' | null;

interface ContactModalProps {
  service: ServiceType;
  onClose: () => void;
}

export function ContactModal({ service, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const getServiceInfo = () => {
    switch (service) {
      case 'laudo':
        return {
          title: 'LAUDO AGRONÔMICO',
          desc: 'Solicite seu laudo técnico assinado por engenheiro para amparo de cultivo.',
          defaultMsg: 'Olá, gostaria de saber mais sobre a emissão do Laudo Agronômico para cultivo.',
          color: 'text-emerald-400',
          btnClass: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_15px_rgba(16,185,129,0.3)]'
        };
      case 'juridico':
        return {
          title: 'SUPORTE JURÍDICO',
          desc: 'Tire suas dúvidas legais e inicie seu processo de Habeas Corpus.',
          defaultMsg: 'Olá, gostaria de falar com um especialista sobre Suporte Jurídico e Habeas Corpus.',
          color: 'text-amber-400',
          btnClass: 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_4px_15px_rgba(245,158,11,0.3)]'
        };
      case 'medicamentos':
        return {
          title: 'ACESSO A MEDICAMENTOS',
          desc: 'Saiba como importar e obter produtos medicinais legalmente.',
          defaultMsg: 'Olá, quero entender como ter acesso legal aos medicamentos e óleos.',
          color: 'text-violet-400',
          btnClass: 'bg-violet-500 hover:bg-violet-400 text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)]'
        };
      case 'consulta':
        return {
          title: 'CONSULTA MÉDICA',
          desc: 'Agende sua avaliação com médicos prescritores especialistas.',
          defaultMsg: 'Olá, gostaria de agendar uma consulta médica para avaliação de tratamento.',
          color: 'text-[#38bdf8]',
          btnClass: 'bg-[#38bdf8] hover:bg-[#7dd3fc] text-black shadow-[0_4px_15px_rgba(56,189,248,0.3)]'
        };
      default:
        return {
          title: 'FALAR COM ESPECIALISTA',
          desc: 'Tire suas dúvidas diretamente com nossa equipe.',
          defaultMsg: 'Olá, gostaria de mais informações.',
          color: 'text-lime-400',
          btnClass: 'bg-lime-500 hover:bg-lime-400 text-black shadow-[0_4px_15px_rgba(132,204,22,0.3)]'
        };
    }
  };

  const info = getServiceInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = `*${info.title}*\nNome: ${name}\nTelefone: ${phone}\n\nMensagem: ${message || info.defaultMsg}`;
    const encoded = encodeURIComponent(finalMsg);
    window.open(`https://api.whatsapp.com/send?phone=5565992898324&text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {service && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 999999 }} className="fixed inset-0 bg-black/90 flex items-center justify-center p-4" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="bg-[#111] border border-[#333] rounded-3xl w-full max-w-md p-8 relative font-sans shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors pixel text-[10px]">X</button>
            
            <h2 className={`vt text-2xl font-black mb-2 uppercase tracking-widest ${info.color}`}>
              {info.title}
            </h2>
            <p className="text-gray-400 text-sm mb-8 font-bold leading-relaxed">{info.desc}</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-2 font-black tracking-[0.2em]">Nome Completo</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/40 border border-[#333] rounded-xl p-4 text-white focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder:text-gray-700 text-sm"
                  placeholder="Digite seu nome"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-2 font-black tracking-[0.2em]">Telefone (WhatsApp)</label>
                <input 
                  required
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-[#333] rounded-xl p-4 text-white focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder:text-gray-700 text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-2 font-black tracking-[0.2em]">Mensagem Adicional (Opcional)</label>
                <textarea 
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-black/40 border border-[#333] rounded-xl p-4 text-white focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder:text-gray-700 text-sm resize-none"
                  placeholder={info.defaultMsg}
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className={`font-black py-4 rounded-xl uppercase tracking-widest mt-4 transition-all active:scale-95 text-xs flex items-center justify-center gap-3 ${info.btnClass}`}
              >
                INICIAR ATENDIMENTO 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.056 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

