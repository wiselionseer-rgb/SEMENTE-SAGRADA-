import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { playSfx } from './audio';

export default function TermsPage({ onBack }: { onBack: () => void }) {
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
          Termos e Condições
        </h1>

        <div className="space-y-8 text-base md:text-lg leading-relaxed text-[#3b523b]">
          <section>
            <p className="mb-4">
              O nosso acordo padrão para os serviços que oferecemos está descrito nestes Termos e Condições, bem como em cada um dos documentos nele referidos. Por favor, leia todos os termos com atenção, além dos outros documentos inseridos, para a sua segurança e benefício. Se você tiver alguma pergunta, por favor, entre em contato com a nossa equipe.
            </p>
            <p className="mb-4">
              Ao visitar, usar e/ou comprar em nosso site Semente Sagrada World, você aceita os nossos Termos e Condições, Política de Privacidade e Isenção de Reponsabilidade Limitada.
            </p>
            <p className="mb-4">
              Ao usar, visitar e/ou comprar neste site, você confirma que você possui maioridade legal. A maioridade legal é alcançada ao completar 18 anos de idade. Se você não tem certeza a respeito da maioridade legal em sua região, consulte as leis locais.
            </p>
            <p className="mb-4">
              Estes termos são um acordo legal entre a Semente Sagrada World (Empreendedor, nós ou nosso) e o Consumidor (Cliente, você ou seu), estabelecido para que nós possamos provê-lo com nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 1 – Definições</h2>
            <p className="mb-2">Nestes Termos e Condições, as seguintes definições são aplicáveis:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Tempo de Consideração:</strong> o termo indica o tempo no qual o consumidor pode exercer o seu Direito de Rescisão.</li>
              <li><strong>Consumidor:</strong> a pessoa natural que não esteja negociando em nome de uma empresa ou profissão, e que chegue a um acordo (Contrato à Distância) com o Empreendedor.</li>
              <li><strong>Contrato à Distância:</strong> um acordo feito entre o Empreendedor e o Consumidor baseado em um sistema corporativo organizado de vendas à distância de produtos e/ou serviços, incluindo a realização de um acordo usando uma ou mais Técnicas de Comunicação à Distância.</li>
              <li><strong>Meio Durável:</strong> qualquer instrumento que permita ao Consumidor ou Empreendedor armazenar informações endereçadas pessoalmente a eles de uma forma que seja acessível para referência futura por um período de tempo adequado.</li>
              <li><strong>Empreendedor:</strong> a corporação que oferece produtos aos Consumidores à distância – neste caso, a Semente Sagrada World.</li>
              <li><strong>Direito à Rescisão:</strong> a possibilidade de o consumidor rescindir o Contrato à Distância dentro do Tempo de Consideração.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 2 – Aplicabilidade</h2>
            <p className="mb-4">
              Estes Termos e Condições são aplicáveis a todas as ofertas feitas pelo Empreendedor e a todos os Contratos à Distância firmados entre o Empreendedor e um Consumidor. Estes Termos e Condições Gerais estarão acessíveis ao Consumidor antes da realização de um Contrato à Distância. Se isto não for possível, então, antes do fechamento de um Contrato à Distância, o Empreendedor irá informar ao Consumidor as maneiras em que os Termos e Condições estão disponíveis para avaliação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 3 – Oferta</h2>
            <p className="mb-4">
              Será explicitamente especificado caso uma oferta esteja sujeita a um limite de validade ou outras qualificações. Uma oferta inclui uma descrição factual dos serviços e produtos oferecidos. Esta descrição é devidamente detalhada para permitir que o Consumidor acesse adequadamente os produtos e/ou serviços.
            </p>
            <p className="mb-4">
              Cada oferta inclui informações que informem explicitamente o Consumidor quais direitos e obrigações estão ligadas à esta oferta assim que ela seja aceita pelo Consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 4 – O Contrato</h2>
            <p className="mb-4">
              O contrato entre o Empreendedor e o Consumidor finaliza no momento que o Consumidor aceitar a oferta e as condições impostas tenham sido implementadas. Se o Consumidor aceitar a oferta eletronicamente, o Empreendedor irá prontamente confirmar o seu recebimento.
            </p>
            <p className="mb-4">
              O Empreendedor pode adquirir, dentro dos parâmetros legais, informações sobre a capacidade do Consumidor de realizar um pagamento completo, bem como a informações necessárias para que o Contrato à Distância alcance uma conclusão responsável.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 5 – Direito de Rescisão</h2>
            <p className="mb-4">
              O Consumidor tem o Direito de Rescisão de um contrato dentro de 14 dias corridos (Tempo de Consideração) sem fornecer explicação. O período de rescisão expira depois do 14° dia corrido que o Consumidor esteja em posse dos bens encomendados.
            </p>
            <p className="mb-4">
              Para exercer o Direito de Rescisão, o Consumidor deve informar o nosso suporte claramente sobre a sua decisão, de preferência através do nosso contato de e-mail <strong>suporte@sementesagradaworld.com</strong> ou WhatsApp.
            </p>
            <h3 className="text-xl font-bold mb-2">Consequências da Rescisão</h3>
            <p className="mb-4">
              Contanto que o Consumidor inicie a Rescisão, o Empreendedor irá iniciar o reembolso de todos os pagamentos recebidos do Consumidor o mais rápido possível (não mais tardar que 14 dias após o recebimento). O Consumidor será responsável por enviar de volta os bens ao vendedor, arcando com os custos de frete. O reembolso poderá ser retido até que o Empreendedor receba os bens.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 6 – Cobranças de Rescisão</h2>
            <p className="mb-4">
              Caso o Consumidor deseje exercer o Direito de Rescisão, será responsável por pagar os custos para devolução do produto. O valor dos produtos devolvidos será reembolsado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 7 – Exclusões do Direito de Rescisão</h2>
            <p className="mb-2">O Direito de Rescisão só pode ser excluído para os seguintes tipos de produtos:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Que estejam estabelecidos pelo Empreendedor de acordo com especificações do Consumidor.</li>
              <li>Que são claramente para uso pessoal.</li>
              <li>Sementes cujas embalagens e/ou lacres originais tenham sido abertos, os quais não podem ser devolvidos devido à sua natureza.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 8 – Definição de Preços</h2>
            <p className="mb-4">
              Os preços de produtos se mantêm válidos a partir do momento em que um pedido é feito e não podem ser alterados posteriormente. O Empreendedor se reserva o direito de ajustar preços em casos aplicáveis antes da realização do pedido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 9 – Garantia e Uso Limitado</h2>
            <p className="mb-4">
              Nossas sementes são vendidas estritamente para <strong>fins de coleção e preservação da genética</strong>.
            </p>
            <p className="mb-4 text-red-700 font-bold">
              É expressamente proibida a germinação ou o cultivo das mesmas em países ou estados onde tal prática não seja autorizada por lei.
            </p>
            <p className="mb-4">
              O cliente é o único responsável por conhecer e cumprir com as leis de sua região ou país. Não nos responsabilizamos de forma alguma por problemas legais resultantes do descumprimento desta regra por parte do cliente, e não serão aceitas reclamações relacionadas a taxa de germinação ou características do cultivo, uma vez que sua destinação legal perante a nossa loja não inclui cultivo onde for proibido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 10 – Entrega e Cumprimento</h2>
            <p className="mb-4">
              A Semente Sagrada World irá gerenciar de forma responsável o recebimento e execução das encomendas. O local de entrega é determinado pelo endereço divulgado pelo Consumidor.
            </p>
            <p className="mb-4 text-[#1e4a1e] font-semibold bg-[#dcf1e2] p-4 rounded-lg">
              No caso de um pacote ter sido apreendido pela alfândega, o Empreendedor se reserva o direito de não reenviá-lo ou reembolsá-lo, pois o Empreendedor não pode prever ou influenciar o trabalho das autoridades. Ao fazer uma encomenda em nosso site, o Consumidor concorda com esta cláusula.
            </p>
            <p className="mb-4">
              Caso o Consumidor alegue que o pacote não foi recebido (apesar da confirmação de entrega do correio/transportadora), o Empreendedor avaliará a situação, mas reserva-se o direito de não reenviar gratuitamente se o sistema constar como entregue. Se o pedido for devolvido devido a impostos ou endereço incorreto não informado pelo cliente a tempo, deduções de envio poderão ser realizadas em reembolsos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 11 – Pagamento</h2>
            <p className="mb-4">
               É dever do Consumidor informar o Empreendedor sobre quaisquer imprecisões nas informações de pagamento. É permitido pagamentos e transações mediante opções disponibilizadas no momento da compra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 12 – Reclamações e Disputas</h2>
            <p className="mb-4">
              As reclamações relativas à execução de um acordo devem conter uma descrição precisa e apresentadas dentro de um prazo razoável. Responderemos às reclamações em tempo viável para encontrar um acordo mútuo adequado. 
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">Artigo 13 – Informações da Empresa</h2>
            <p className="mb-4">
              <strong>Semente Sagrada World</strong><br />
              <strong>Email:</strong> suporte@sementesagradaworld.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
