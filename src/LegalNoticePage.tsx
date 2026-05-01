import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { playSfx } from './audio';

export default function LegalNoticePage({ onBack }: { onBack: () => void }) {
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
          Aviso Legal
        </h1>

        <div className="space-y-8 text-base md:text-lg leading-relaxed text-[#3b523b]">
          <section>
            <p className="mb-4">
              A Semente Sagrada World (doravante denominada "Semente Sagrada World"), responsável pelo Site, coloca à disposição dos usuários o presente documento, que tem como objetivo cumprir as obrigações e informar todos os usuários do Site sobre os Termos de Uso.
            </p>
            <p className="mb-4">
              Qualquer pessoa que acesse este Site assume o papel de usuário, comprometendo-se a cumprir e fazer cumprir as disposições aqui contidas, bem como qualquer outra disposição legal que possa ser aplicável.
            </p>
            <p className="mb-4">
              A Semente Sagrada World se reserva o direito de modificar qualquer tipo de informação que possa aparecer no Site, sem qualquer obrigação de dar aviso prévio ou informar os usuários de tais obrigações, entendendo-se como suficiente a publicação no Site da Semente Sagrada World.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">1. DADOS DE IDENTIFICAÇÃO DA EMPRESA</h2>
            <p className="mb-2"><strong>Nome da empresa:</strong> Semente Sagrada World</p>
            <p className="mb-2"><strong>E-Mail:</strong> suporte@sementesagradaworld.com</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">2. INTRODUÇÃO</h2>
            <p className="mb-4">
              Os presentes Termos de Uso do Site regulam as condições de acesso e uso do site, de propriedade da Semente Sagrada World, que o usuário do Site deve ler e aceitar para utilizar todos os serviços e informações fornecidos pelo Site.
            </p>
            <p className="mb-4">
              O acesso ou uso do Site, de todo ou parte de seu conteúdo e serviços, significa a aceitação total destes Termos de Uso. O fornecimento e o uso do Site estão sujeitos à estrita conformidade com os termos contidos nestes Termos de Uso do Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">3. TERMOS DE USO</h2>
            <p className="mb-4">
              Os presentes Termos de Uso do Site regulam o acesso e o uso do Site, incluindo o conteúdo e os serviços disponibilizados aos usuários no e/ou por meio do Site, seja pela Semente Sagrada World, por seus usuários ou por terceiros. No entanto, o acesso e o uso de determinados conteúdos e/ou serviços podem estar sujeitos a determinadas condições específicas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">4. INFORMAÇÕES E SERVIÇOS</h2>
            <p className="mb-4">
              Os usuários podem acessar diferentes tipos de informações e serviços por meio do Site. A Semente Sagrada World se reserva o direito de modificar, a qualquer momento e sem aviso prévio, a apresentação e a configuração das informações e dos serviços oferecidos pelo Site. O usuário reconhece e concorda expressamente que, a qualquer momento, a Semente Sagrada World poderá interromper, desativar e/ou cancelar qualquer informação ou serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">5. DISPONIBILIDADE DE INFORMAÇÕES E SERVIÇOS DO SITE</h2>
            <p className="mb-4">
              A Semente Sagrada World não garante a disponibilidade contínua e permanente dos serviços, ficando assim exonerada de qualquer responsabilidade por possíveis danos causados em decorrência da indisponibilidade do serviço por motivos de força maior ou erros nas redes de transferência de dados, ou desconexões causadas por trabalhos de melhoria ou manutenção.
            </p>
            <p className="mb-4">
              A Semente Sagrada World poderá, a seu exclusivo critério, negar, retirar, suspender e/ou bloquear, a qualquer momento e sem aviso prévio, o acesso a informações e serviços aos usuários que violarem essas regras.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">6. RESPONSABILIDADE DO SITE</h2>
            <p className="mb-4">
              Salvo nos casos em que a lei expressamente exija o contrário, e apenas na medida e no âmbito impostos, a Semente Sagrada World não garante nem assume qualquer responsabilidade por quaisquer danos causados pelo uso e utilização de informações, dados ou serviços do Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">7. OBRIGAÇÕES DO USUÁRIO</h2>
            <p className="mb-4">
              O usuário deve respeitar sempre os presentes Termos de Uso do Site. O usuário declara expressamente que usará o Site de forma diligente e assume qualquer responsabilidade que possa surgir do não cumprimento das regras.
            </p>
            <p className="mb-4">
              O usuário se compromete a não fazer uso indevido do site, conforme especificado nos termos gerais aplicáveis pela legislação competente de navegação segura e integridade de usuários da Internet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">8. DADOS PESSOAIS</h2>
            <p className="mb-4">
              As informações ou dados pessoais fornecidos pelo usuário serão tratados de acordo com a Política de Privacidade incluída neste Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">9. COOKIES</h2>
            <p className="mb-4">
              Se você quiser conhecer nossa Política de Cookies, leia atentamente a Política de Cookies incluída neste Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">10. LINKS PARA OUTROS SITES</h2>
            <p className="mb-4">
              A Semente Sagrada World não garante nem assume qualquer responsabilidade por danos sofridos pelo acesso a serviços de terceiros por meio de conexões ou links dos sites vinculados. A função dos links que aparecem é exclusivamente a de informar o usuário sobre a existência de outras fontes de informação na Internet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">11. PROPRIEDADE INTELECTUAL E INDUSTRIAL</h2>
            <p className="mb-4">
              Todos os conteúdos, marcas registradas, logotipos e desenhos acessíveis no Site, correspondem aos seus legítimos proprietários, sendo reservados todos os direitos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">12. MODIFICAÇÕES</h2>
            <p className="mb-4">
              A Semente Sagrada World se reserva o direito de modificar a qualquer momento os presentes Termos de Uso do Site. Em todo caso, recomenda-se que você os consulte periodicamente. Os presentes Termos de Uso devem ser lidos em conjunto com nossos Termos e Condições, Política de Privacidade e Política de Cookies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
