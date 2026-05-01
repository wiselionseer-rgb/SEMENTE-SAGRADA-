import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { playSfx } from './audio';

export default function DisclaimerPage({ onBack }: { onBack: () => void }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f9f4] text-[#2c3e2c] font-sans">
      {/* HEADER */}
      <div className="bg-[#1e4a1e] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center">
          <button 
            onClick={() => {
              playSfx('click');
              onBack();
            }}
            className="flex items-center gap-2 hover:text-[#a8d0b5] transition-colors"
          >
            <ChevronLeft size={24} />
            <span className="font-bold">Voltar para a Loja</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#1e4a1e] tracking-tight border-b-4 border-[#25D366] pb-4 inline-block">
          Isenção de Responsabilidade Limitada
        </h1>

        <div className="space-y-8 text-base md:text-lg leading-relaxed text-[#3b523b]">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Política de drogas</h2>
            <p className="mb-4">
              De acordo com a Convenção Única sobre Entorpecentes assinada em Viena em 1961, a posse, importação e o tráfico de sementes de cânhamo não está sujeita a regulação. Este tratado exclui expressamente as sementes de cannabis da lista de substância narcóticas que estão sujeitas à fiscalização internacional. No entanto, embora a posse de sementes de cannabis não seja crime na Espanha, o cultivo de cannabis pode resultar em sanções penais e administrativas conforme estipula o Artigo 368 do Código Criminal e o Artigo 36.18 da Lei Orgânica de Proteção à Segurança Pública. A Semente Sagrada World não assume a responsabilidade pelo uso indevido de qualquer produto vendido a terceiros. A loja Semente Sagrada World e seus domínios se mantêm cumpridores da lei espanhola e internacional que não regulamenta sementes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Notificação de vendas</h2>
            <p className="mb-4">
              Semente Sagrada World, e todos os outros domínios relacionados vendem e enviam sementes a terceiros sob a condição de que estes itens não serão usados para descumprir a lei. Qualquer consumidor que compra qualquer um dos produtos da loja Semente Sagrada World assume a responsabilidade por entender as leis únicas de seu país e assume a completa responsabilidade por suas ações.
            </p>
            <p className="mb-4">
              Ao fazer um pedido de qualquer um de nossos produtos, você confirma que verificou devidamente as leis locais e internacionais de seu país, e que tem certeza de que isso é uma coisa segura a se fazer. Além disso, você concorda que assume a completa responsabilidade por tomar esta decisão.
            </p>
            <p className="mb-4 font-bold text-red-700">
              Por favor, observe: você precisa obrigatoriamente ter maioridade legal para encomendar sementes da Semente Sagrada World! Enquanto a maioridade legal na maior parte dos países é de 18 anos, você é aconselhado a verificar e obedecer as leis locais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Notificação de germinação</h2>
            <p className="mb-4">
              Na maioria dos países ao redor do mundo, a germinação de sementes de cannabis é considerada em grande parte ilegal. A Semente Sagrada World vende sementes de cannabis como souvenirs colecionáveis. Nós nos recusamos expressamente a vender sementes a indivíduos que acreditamos que possam cultivá-las em um país onde é considerado ilegal cultivar cannabis.
            </p>
            <p className="mb-4 font-semibold">
              A Semente Sagrada World não apoia, de maneira nenhuma, indivíduos a descumprirem a lei, local ou internacional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Aviso de entrega</h2>
            <p className="mb-4">
              Embora seja geralmente seguro transportar sementes de cannabis, as leis específicas a respeito da exportação de sementes de cannabis podem mudar de um país para outro. É altamente recomendado que você entenda as regulamentações únicas de seu país e cumpra completamente com estas regras. A Semente Sagrada World recusa toda e qualquer responsabilidade e ramificações legais de qualquer compra irresponsável de indivíduos que falhem em cumprir com as leis pertinentes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Política de Responsabilidade</h2>
            <p className="mb-4">
              A Semente Sagrada World recusa expressamente apoiar o uso, produção ou fornecimento de drogas ilegais e quaisquer outras substâncias controladas.
            </p>
            <p className="mb-4">
              Você deve estar ciente que fumar pode causar danos perigosos e fatais à sua saúde e que nós não o encorajamos a fazê-lo.
            </p>
            <p className="mb-4">
              Todas as informações que podem ser encontradas na Semente Sagrada World e em todos os domínios relacionados estão voltadas apenas para propósitos educacionais. Não é a intenção incitar, tolerar ou promover o cultivo ilegal de drogas ou substâncias controladas. Ao fazer uma encomenda em nosso site, você confirma que assume toda e qualquer responsabilidade por suas ações.
            </p>
            <p className="mb-4 font-bold text-[#1e4a1e]">
              Agradecemos seu total compromisso e responsabilidade.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
