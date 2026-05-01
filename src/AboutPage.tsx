import React, { useEffect } from 'react';
import { ChevronLeft, Tag, Sprout, Handshake, ShieldCheck, BookOpen, HeartHandshake, Smile, MessageCircle } from 'lucide-react';
import { playSfx } from './audio';

export default function AboutPage({ onBack }: { onBack: () => void }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7f5] text-[#111] font-sans pb-20 relative overflow-hidden">
      {/* HEADER */}
      <div className="bg-[#2E7A4A] border-b border-lime-500/20 sticky top-0 z-[100] px-4 py-4 md:px-8 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => { playSfx('click'); onBack(); }} className="w-10 h-10 flex items-center justify-center hover:bg-black/10 rounded-xl transition-all group">
                 <ChevronLeft size={20} className="text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <h1 className="text-xl md:text-2xl font-black pixel text-white tracking-tighter uppercase">Voltar à Loja</h1>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col items-start bg-white mt-10 rounded-[3rem] shadow-xl border border-gray-100 p-8 md:p-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#1e4a1e] uppercase tracking-wide mb-8 w-full border-b border-gray-100 pb-6">
          SOBRE NÓS
        </h2>
        
        <div className="mb-12">
            <p className="text-[#444] text-lg md:text-xl font-medium leading-relaxed mb-2">
            Somos seus ajudantes no mundo da cannabis.
            </p>
            <p className="text-[#444] text-lg md:text-xl font-medium leading-relaxed">
            A Semente Sagrada World é aquele parceiro que sempre salva, sua verdadeira fada madrinha.
            </p>
        </div>

        <div className="w-full flex justify-center mb-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f5f7f5] opacity-50 z-0 rounded-full blur-3xl pointer-events-none"></div>
            <img src="/gifs/design_sem_nome_4.gif" className="w-80 h-80 object-contain z-10 hover:scale-105 transition-transform duration-500 cursor-pointer drop-shadow-2xl" alt="Mascote" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-[#1e4a1e] uppercase tracking-wide w-full mb-10">Quem Somos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* REVENDA CARD */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-10 hover:shadow-[0_10px_50px_rgba(46,122,74,0.15)] transition-all flex flex-col hover:-translate-y-2 duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center">
                <Tag className="text-[#2E7A4A] fill-[#2E7A4A]/20" size={32} />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-[#222]">Revenda</h4>
            </div>
            
            <p className="text-[15px] text-[#555] leading-loose font-medium mt-auto">
              Há muitos anos, temos uma plataforma confiável. Hoje, oferecemos centenas de strains dos melhores seed banks diferentes.
              Você pode confiar plenamente que está comprando apenas sementes de cannabis originais, sejam elas regulares, feminizadas, ricas em CBD, autoflorescentes, ou de qualquer outro tipo. Caso você não encontre o que esteja buscando, entre em contato com nossa equipe de suporte — faremos nosso melhor para obter o que você precisa.
            </p>
          </div>

          {/* PRODUTORES CARD */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-10 hover:shadow-[0_10px_50px_rgba(46,122,74,0.15)] transition-all flex flex-col hover:-translate-y-2 duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center">
                <Sprout className="text-[#849C65] fill-[#e6cda8]/50" size={36} />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-[#222]">Produtores</h4>
            </div>
            <p className="text-[15px] text-[#555] leading-loose font-medium mt-auto">
              Criamos nosso próprio seed bank, porque sentimos que você confia em nosso conhecimento e expertise — e a sua confiança vale muito para nós. Agora, seus comentários e a enxurrada de pedidos recebidos falam por si só: somos um seed bank líder com milhares de clientes fiéis. De fato, você nos deu tanta energia que também lançamos filiais exclusivas para atender nossos clientes de forma cada vez mais ágil e segura.
            </p>
          </div>
        </div>

        {/* SECTION DOS VALORES E MISSÃO */}
        <div className="mt-20 w-full">
            <h3 className="text-2xl md:text-3xl font-bold text-[#1e4a1e] uppercase tracking-wide w-full mb-8">Nossa missão</h3>
            <p className="text-[15px] text-[#555] leading-loose font-medium mb-6 max-w-4xl">
                Estamos aqui para guiá-lo em sua jornada, desde o momento da escolha das sementes até a colheita de suas plantas. Não importa onde você esteja, que horas são ou quais perguntas você tem, estamos aqui para você.
            </p>
            <ul className="text-[15px] text-[#555] leading-loose font-medium list-none mb-16 space-y-3">
                <li className="flex items-center gap-4"><span className="text-[#2E7A4A] block w-4 h-0.5 bg-[#2E7A4A]"></span> Sabemos o que você gosta de cor.</li>
                <li className="flex items-center gap-4"><span className="text-[#2E7A4A] block w-4 h-0.5 bg-[#2E7A4A]"></span> Vamos te dar uma mão e te ajudar.</li>
                <li className="flex items-center gap-4"><span className="text-[#2E7A4A] block w-4 h-0.5 bg-[#2E7A4A]"></span> Afinal, somos seu parceiro de sempre.</li>
            </ul>

            <div className="w-full flex justify-center mb-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f5f7f5] opacity-50 z-0 rounded-full blur-3xl pointer-events-none"></div>
                <img src="/gifs/sangoku.gif" className="w-[32rem] h-auto object-contain z-10 hover:-translate-y-2 transition-transform duration-500 cursor-pointer drop-shadow-2xl" alt="Nossa Missão" onError={(e) => e.currentTarget.src='/gifs/design_sem_nome_4.gif'} />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-[#1e4a1e] uppercase tracking-wide w-full mb-8">Nossos valores</h3>
            <p className="text-[15px] text-[#555] leading-loose font-medium mb-12 max-w-4xl">
                A forma em que trabalhamos se baseia em liberdade e compreensão mútua, e almejamos fazer com que este mundo torne-se um lugar melhor – começando por nós mesmos. Por isso mesmo, nos empenhamos em...
            </p>
            
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-10 md:p-14 flex flex-col gap-10 hover:shadow-[0_10px_50px_rgba(46,122,74,0.1)] transition-all">
                <div className="flex flex-col gap-6 border-b border-gray-100 pb-12">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <Handshake className="text-[#d88755]" size={36} />
                        </div>
                        <h4 className="text-xl font-bold text-[#222]">Respeitar a todas e todos</h4>
                    </div>
                    <p className="text-[15px] text-[#555] leading-loose font-medium md:ml-[68px]">
                        Valorizamos conexões pessoais com todos com quem trabalhamos. Vocês são todos especiais, então adaptamos nossos métodos de resolução de problemas para cada pessoa.
                    </p>
                </div>

                <div className="flex flex-col gap-6 pt-2 border-b border-gray-100 pb-12">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <ShieldCheck className="text-[#328e50]" size={36} />
                        </div>
                        <h4 className="text-xl font-bold text-[#222]">Ganhar confiança</h4>
                    </div>
                    <p className="text-[15px] text-[#555] leading-loose font-medium md:ml-[68px]">
                        Nos esforçamos para que todos sintam-se seguros conosco e trabalhamos para construir e manter seu respeito e confiança a cada nova interação. Você sempre está em seguro operando conosco.
                    </p>
                </div>

                <div className="flex flex-col gap-6 pt-2 border-b border-gray-100 pb-12">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <BookOpen className="text-[#5599ff]" size={36} />
                        </div>
                        <h4 className="text-xl font-bold text-[#222]">Cultivar e ajudar outros cultivadores</h4>
                    </div>
                    <p className="text-[15px] text-[#555] leading-loose font-medium md:ml-[68px]">
                        Aprendemos e queremos ser melhores a cada dia – pelos nossos clientes, nosso negócio, e por nós mesmos. Através de conversas, informações de produtos, e posts em nosso blog, compartilhamos nosso conhecimento para ajudar você a dominar a arte do cultivo.
                    </p>
                </div>

                <div className="flex flex-col gap-6 pt-2 border-b border-gray-100 pb-12">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <HeartHandshake className="text-[#4caf50]" size={36} />
                        </div>
                        <h4 className="text-xl font-bold text-[#222]">Valorizar a liberdade</h4>
                    </div>
                    <p className="text-[15px] text-[#555] leading-loose font-medium md:ml-[68px]">
                        Respeitamos e conhecemos as necessidades e os valores de cada pessoa sem julgar ou limitar ninguém, sejam eles nossos pares, clientes, parceiros ou funcionários.
                    </p>
                </div>

                <div className="flex flex-col gap-6 pt-2">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <Smile className="text-[#ffca28]" size={36} />
                        </div>
                        <h4 className="text-xl font-bold text-[#222]">Contribuir com sua diversão e curtição!</h4>
                    </div>
                    <p className="text-[15px] text-[#555] leading-loose font-medium md:ml-[68px]">
                        Realmente queremos que você tenha uma boa experiência com a gente. Ao mesmo tempo em que buscamos manter a serenidade e a positividade em nossas interações, focamos em ser rápidos ao processar os pedidos e atender às solicitações.
                    </p>
                </div>
            </div>

            <div className="mt-20">
                <h3 className="text-2xl md:text-3xl font-bold text-[#1e4a1e] uppercase tracking-wide w-full mb-8">Nossa equipe</h3>
                <p className="text-[15px] text-[#555] leading-loose font-medium mb-6">
                    A Semente Sagrada World é composta por dedos-verdes especialistas, amantes de animais, viajantes aventureiros, artistas talentosos, engenheiros cabeçudos, e muito mais. Somos todos diferentes, mas unidos pela paixão pela cannabis e pelo desejo de espalhar essa paixão aos quatro ventos.
                </p>
                <p className="text-[15px] text-[#555] leading-loose font-medium mb-12">
                    Atualmente, nossa equipe tem mais de 80 excelentes profissionais, e está espalhada por todo o mundo. Enfrentamos ideias e problemas de diferentes perspectivas, e tiramos o melhor de diferentes culturas. Isso nos ajuda a entender melhor vocês, nossos clientes maravilhosos, que também vêm de todas as partes do mundo.
                </p>
            </div>
        </div>

      </div>

      {/* NEWSLETTER */}
      <div className="w-full mt-10 mb-[-5rem]">
        <div className="w-full bg-[#dcf1e2] border-[3px] border-[#a8d0b5] rounded-xl relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex-shrink-0 w-32 md:w-48">
            <img src="/gifs/elite_seed.gif" alt="mascot" className="w-full object-contain filter drop-shadow-lg" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-[#2E7A4A] mb-2 leading-tight font-sans">Poucos vão ver isso...</h3>
            <p className="text-sm text-[#444] font-medium leading-relaxed max-w-lg font-sans">
              Estamos liberando um lote limitado de sementes <strong className="font-bold">GRÁTIS</strong> para quem entrar agora.
              Se você curte genética premium, essa é sua chance de testar sem risco.<br/><br/>
              ⚠️ Apenas para quem seguir as regras e agir rápido.
            </p>
          </div>

          <div className="flex-1 w-full flex flex-col items-center md:items-end justify-center">
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-xl transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(37,211,102,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] active:scale-95 shadow-[#25D366]/20 font-sans vt-exclude">
                <MessageCircle size={24} />
                CHAMAR NO WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
