import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { playSfx } from './audio';

export default function PrivacyPolicyPage({ onBack }: { onBack: () => void }) {
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
          Política De Privacidade
        </h1>

        <div className="space-y-8 text-base md:text-lg leading-relaxed text-[#3b523b]">
          <section>
            <p className="mb-4">
              Nossa Política de Privacidade tem como objetivo informar a você como a Semente Sagrada World como Controlador de Dados, realiza o processamento de seus dados pessoais, tudo de acordo com as disposições da Lei sobre a Proteção de Dados Pessoais e garantia de direitos digitais e Regulamento.
            </p>
            <p className="mb-4">
              Esta Política de Privacidade descreve o procedimento para a coleta, o processamento e o armazenamento de dados pessoais, de acordo com os padrões da empresa para proteção de dados e de acordo com os regulamentos aplicáveis e aplicáveis ao uso que fazemos dos dados pessoais de usuários ou clientes que navegam em nosso site, se registram, fazem pedidos ou interagem com nossa empresa através dos diferentes meios de contato.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">1. RESPONSÁVEL PELO TRATAMENTO</h2>
            <p className="mb-2"><strong>SEMENTE SAGRADA WORLD</strong></p>
            <p className="mb-4"><strong>Email:</strong> suporte@sementesagradaworld.com</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">2. CATEGORIAS DE DADOS PESSOAIS</h2>
            <p className="mb-4">
              Os dados que solicitamos são adequados, relevantes e estritamente necessários para fins específicos e particulares e, em nenhum caso, você é obrigado a fornecê-los, mas sua não comunicação pode afetar a finalidade do serviço ou a impossibilidade de fornecê-lo. É importante que, para que possamos manter seus dados pessoais atualizados, você nos informe sempre que houver uma alteração nos mesmos. Caso você forneça dados de terceiros, deverá ter o consentimento deles e transferir-lhes esta Política de Privacidade, que é entendida e aceita por eles, isentando a organização de qualquer responsabilidade pelo descumprimento dessa obrigação.
            </p>
            <p className="mb-4">Informamos a você que as categorias de dados que podemos processar estão definidas abaixo:</p>
            
            <h3 className="text-xl font-bold mb-2">Dados de identificação e contato</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Nome completo</li>
              <li>Endereço para correspondência</li>
              <li>Número de telefone</li>
              <li>Endereço de e-mail</li>
            </ul>

            <h3 className="text-xl font-bold mb-2">Informações de cobrança e pagamento</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Endereço de cobrança.</li>
              <li>Informações do cartão de crédito (para a execução do pagamento, transferimos para nossos prestadores de serviços de pagamento apenas os dados necessários).</li>
            </ul>

            <h3 className="text-xl font-bold mb-2">Dados de conexão e navegação e dados relacionados ao uso do site</h3>
            <p className="mb-4">Endereço IP, data da visita ao site e informações sobre o navegador.</p>
            <p className="mb-4">
              Além disso, quando você interage com o nosso site, coletamos informações que nos informam sobre o conteúdo, os produtos, os tipos de produtos nos quais você está interessado, acessos a links e sua localização, caso você tenha autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">3. MENORES DE IDADE</h2>
            <p className="mb-4">
              Informamos aos usuários que este Site é destinado apenas a pessoas maiores de 18 anos de idade. Se você for menor de idade, não tente se registrar. Se descobrirmos que obtivemos acidentalmente informações pessoais de um menor, excluiremos essas informações o mais rápido possível.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">4. FINALIDADE E LEGITIMIDADE DO TRATAMENTO</h2>
            <p className="mb-4">Na Semente Sagrada World, processamos as informações que você fornece para os seguintes fins:</p>
            <ul className="list-disc pl-6 space-y-4 mb-4">
              <li><strong>Finalidade:</strong> Processar um pedido ou responder às suas perguntas ou reclamações sobre nossos produtos ou criar sua conta pessoal. (Legitimação: execução de um contrato).</li>
              <li><strong>Finalidade:</strong> Cumprir com nossas obrigações legais de faturamento, contabilidade e impostos. (Legitimação: cumprimento de obrigações legais).</li>
              <li><strong>Finalidade:</strong> Enviar comunicações comerciais relacionadas aos produtos. Em qualquer caso, você pode se opor ao recebimento de comunicações comerciais ou revogar seu consentimento a qualquer momento no seguinte endereço de e-mail: suporte@sementesagradaworld.com.</li>
              <li><strong>Finalidade:</strong> Enviar periodicamente informações sobre nossos produtos, atividades, descontos e promoções que oferecemos aos nossos usuários/clientes.</li>
              <li><strong>Finalidade:</strong> Realizar pesquisas de qualidade e satisfação.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">5. PERÍODOS DE ARMAZENAMENTO</h2>
            <p className="mb-4">
              Seus dados serão mantidos pelo tempo mínimo necessário para cumprir a finalidade para a qual foram coletados e para atender às responsabilidades que possam surgir do tratamento e de qualquer outra exigência legal.
            </p>
            <p className="mb-4">
              Se você criar uma conta, manteremos as informações relacionadas à conta enquanto ela existir. Você poderá solicitar a exclusão de sua conta entrando em contato com a Semente Sagrada World pelo seguinte endereço de e-mail: suporte@sementesagradaworld.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">6. DESTINATÁRIOS DOS DADOS</h2>
            <p className="mb-4">
              O Responsável não comunicará seus dados a terceiros, a menos que obtenha seu consentimento expresso ou que haja uma obrigação legal. Poderá utilizar prestadores de serviços e processadores de dados que podem incluir serviços de hospedagem e manutenção de sistemas, serviços de análise, serviços de mensagens de e-mail, etc.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">7. DIREITOS DE PROTEÇÃO DE DADOS</h2>
            <p className="mb-2">Você pode exercer seus direitos de proteção de dados, se for o caso, enviando uma comunicação por escrito para o nosso endereço de e-mail: suporte@sementesagradaworld.com. Esses direitos são:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Direito de solicitar acesso aos dados pessoais.</li>
              <li>Direito de retificação ou exclusão.</li>
              <li>Direito de oposição.</li>
              <li>Direito de solicitar a limitação de seu processamento.</li>
              <li>Direito à portabilidade de dados.</li>
              <li>Direito de não estar sujeito a decisões baseadas exclusivamente no processamento automatizado de dados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">8. REDES SOCIAIS</h2>
            <p className="mb-4">
              As redes sociais fazem parte da vida diária de muitos usuários da Internet. Todos os usuários que visitam nosso site têm a oportunidade de se juntar às nossas redes sociais. No entanto, você deve estar ciente de que seus dados pertencerão à rede social em questão, portanto, recomendamos que você leia atentamente os termos de uso e as políticas de privacidade das mesmas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">9. SEGURANÇA</h2>
            <p className="mb-4">
              Temos o compromisso de manter seus dados pessoais seguros. A fim de salvaguardar a segurança dos seus dados pessoais, informamos que a Semente Sagrada World tomou todas as medidas técnicas e organizacionais necessárias para garantir a segurança dos dados pessoais fornecidos. Tudo isso para evitar a alteração, perda e / ou tratamento ou acesso não autorizado, conforme exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#1e4a1e]">10. MODIFICAÇÕES NA POLÍTICA DE PRIVACIDADE</h2>
            <p className="mb-4">
              Nossa Política de Privacidade pode ser modificada de acordo com os requisitos legais estabelecidos, práticas do setor, interesses de nossa empresa ou alterações em nosso site. Se tiver dúvidas sobre esta política, você pode entrar em contato conosco por meio do seguinte e-mail: suporte@sementesagradaworld.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
