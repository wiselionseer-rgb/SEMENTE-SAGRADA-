import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { playSfx } from './audio';

export default function CookiesPolicyPage({ onBack }: { onBack: () => void }) {
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
          Política De Cookies
        </h1>

        <div className="space-y-8 text-base md:text-lg leading-relaxed text-[#3b523b]">
          <section>
            <p className="mb-4">
              Nosso site usa cookies para fornecer um serviço melhor e proporcionar a você uma melhor experiência de navegação. Queremos informá-lo de forma clara e precisa sobre os cookies que usamos, detalhando abaixo o que é um cookie, para que ele é usado, que tipos de cookies usamos, qual é a finalidade deles e como você pode configurá-los ou desativá-los, se desejar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">1. O QUE SÃO COOKIES?</h2>
            <p className="mb-4">
              São arquivos que são baixados para o seu computador ou outro dispositivo quando você acessa um site e permitem que o proprietário dessa página armazene ou recupere determinadas informações sobre diversas variáveis, como, por exemplo, o número de vezes que a página foi visitada pelo usuário, garantir a sessão do usuário durante a navegação na página etc. É necessário ressaltar que, se você os rejeitar, poderá continuar usando nosso Site, embora o uso de alguns dos serviços e funcionalidades do Site possa ser limitado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">2. TIPOS DE COOKIES</h2>
            <p className="mb-4">
              Abaixo, fornecemos informações sobre os tipos de cookies usados em nosso Site e a finalidade desses cookies:
            </p>
            
            <h3 className="text-xl font-bold mb-2">2.1. Tipos de cookies de acordo com a entidade que os gerencia</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Cookies próprios:</strong> São aqueles que são enviados ao equipamento terminal do usuário a partir de nossos próprios equipamentos ou domínios e a partir dos quais prestamos o serviço que você solicita.</li>
              <li><strong>Cookies de terceiros:</strong> São aqueles que são enviados ao equipamento terminal do usuário a partir de um computador ou domínio que não é gerenciado por nós, mas por outra entidade que trata os dados obtidos por meio de cookies.</li>
            </ul>

            <h3 className="text-xl font-bold mb-2">2.2. Tipos de cookies de acordo com o tempo em que permanecem ativos</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Cookies de sessão:</strong> São um tipo de cookies projetados para coletar e armazenar dados enquanto o usuário acessa o site.</li>
              <li><strong>Cookies persistentes:</strong> São um tipo de cookies em que os dados permanecem armazenados no terminal e podem ser acessados e processados por um período definido pelo gerenciador de cookies.</li>
            </ul>

            <h3 className="text-xl font-bold mb-2">2.3. Tipos de cookies de acordo com sua finalidade</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Cookies estritamente necessários:</strong> São aqueles que permitem que o usuário navegue pelo site e use as diferentes opções ou serviços existentes nele. Instalamos esses cookies sem o seu consentimento.</li>
              <li><strong>Cookies analíticos:</strong> São aqueles que nos permitem quantificar o número de usuários e, assim, realizar a medição e a análise estatística do uso feito pelos usuários do site.</li>
              <li><strong>Cookies de personalização:</strong> São aqueles que permitem que o usuário acesse o serviço com algumas características predefinidas com base em uma série de critérios no terminal do usuário.</li>
              <li><strong>Cookies de publicidade comportamental:</strong> São aqueles utilizados para armazenar informações sobre o comportamento do usuário obtidas por meio de observação contínua.</li>
              <li><strong>Transferência de cookies:</strong> Esses cookies nos permitem compartilhar dados derivados de cookies de publicidade comportamental com fornecedores terceirizados para que eles possam personalizar sua publicidade digital.</li>
            </ul>

            <h3 className="text-xl font-bold mb-2">2.4. Tipos de cookies usados em nosso site</h3>
            <p className="mb-4">
              Utilizamos cookies com funcionalidades limitadas e em sua grande maioria voltados para a operabilidade essencial da plataforma (como segurança, prevenção a fraudes, e funcionamento do carrinho de compras e autenticação). Além disso, há cookies para finalidades estatísticas e de marketing integrados com provedores terceiros ou de domínios próprios e de acordo com a legislação aplicável. Você pode saber mais sobre transferências internacionais dependendo de quais terceiros processam informações a depender da localização do provedor (2.5).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">3. CONSENTIMENTO</h2>
            <p className="mb-4">
              Quando o usuário acessar nosso site pela primeira vez (ou quando os cookies não tiverem sido aceitos), verá um aviso indicando que o site usa cookies, e o usuário poderá aceitar ou rejeitar o uso de cookies ou usar a opção de configuração para ativar determinados cookies. O usuário pode configurar seu navegador para notificar e rejeitar a instalação de cookies enviados pela Web, sem afetar a capacidade do usuário de acessar o conteúdo do nosso site. No entanto, ressaltamos que, em qualquer caso, a qualidade da operação do site pode diminuir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">4. COMO DESABILITAR OU EXCLUIR COOKIES</h2>
            <p className="mb-4">
              Você pode recusar e excluir facilmente os cookies instalados em seu computador. Os procedimentos para bloquear e excluir cookies podem diferir de um navegador da Internet para outro. Para maiores informações consulte as configurações do seu navegador ou dispositivo nas secções dedicadas a rastreamento, privacidade e histórico de navegação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">5. SEUS DIREITOS COM RELAÇÃO AOS DADOS PESSOAIS</h2>
            <p className="mb-4">
              Ao navegar em nosso site, podemos processar seus dados pessoais de acordo com a Política de Privacidade incluída neste site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">6. MODIFICAÇÕES NA POLÍTICA DE COOKIES</h2>
            <p className="mb-4">
              Podemos modificar esta Política de Cookies de acordo com os requisitos legislativos ou regulamentares, ou para adaptar esta política às instruções emitidas pelas autoridades ou órgãos de regulação ou fiscalização competentes, portanto, os usuários são aconselhados a visitá-la periodicamente.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
