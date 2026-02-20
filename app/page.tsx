'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// CREDENCIAIS UNIFICADAS
const CREDENTIALS: Record<string, string> = {
  'Diretoria': 'dir123',
  'Gerente': 'ger123',
  'SubGerente': 'sub123',
  'FLV': 'flv123',
  'Mercearia': 'mer123',
  'FLC (Frios e Laticínios)': 'flc123'
};

// BASE DE DADOS CONSOLIDADA - TODOS OS SETORES (GERENTE, SUB, FLV, MERCEARIA, FLC)
const TASK_DATA: Record<string, any[]> = {
  'Gerente': [
    // VOLTA OLÍMPICA MANHÃ
    { description: 'V.O. MANHÃ: Preços no sistema / PDV (Atualização de preços no sistema)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta e repassar ao encarregado', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Balcões de açougue (abastecimento, precificação, qualidade, limpeza)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Bebidas frias geladeiras abastecidas constantes', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Cartazeamento dentro e fora da loja (Validade, descrição, local correto)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Depósito organizado e limpo', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Equipamentos em funcionamento (refrigeradores, freezers, iluminação...)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Hortifruti (Qualidade, precificação, abastecimento, cartazeamento)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Limpeza e organização dos banheiros e frente de caixa', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Ofertas do dia (abastecimento, precificação)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Pontos extras (Abastecimento, precificação, validade)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Precificação (todos os produtos com a etiqueta de preço)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Som do rádio interno (volume, ruídos...)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Limpeza e organização dos banheiros', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Limpeza e organização da frente de caixa', periodicity: 'DIÁRIO' },


    // DURANTE O DIA
    { description: 'DIA: Acompanhar vendas, perdas, margem versus a META do dia anterior/acumulado mês', periodicity: 'DIÁRIO' },
    { description: 'DIA: Perdas e itens sem giro (Reunião com Prevenção - plano de ação)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Verificar rupturas na área de venda e acionar o responsável imediatamente', periodicity: 'DIÁRIO' },
    { description: 'DIA: Comunicar apostas comerciais ao time de encarregados', periodicity: 'DIÁRIO' },
    { description: 'DIA: Comercial (Levar sugestões de ofertas agressivas, itens próx. vencimento)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Ruptura crítica (itens de curva A)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Lista dos itens que acabou de chegar (Verificar se já está na área de venda)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Preparação para os festivais, degustações, ofertas do dia (cartazeamento, exposição)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Validade dos produtos (lista dos itens com plano de ação)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Acompanhar divergências no recebimento (quantidade e valor e após entender junto com o comercial e CPD loja os motivos para a correção.', periodicity: 'DIÁRIO' },


    // VOLTA OLÍMPICA 14H
    { description: 'V.O. 14H: Preços no sistema / PDV (Atualização de preços no sistema)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta na área de venda e repassar ao encarregado da reposição', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Balcões de açougue  (abastecimento, precificação, qualidade, limpeza)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Bebidas frias  geladeiras abastecidas constantes', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Cartazeamento dentro e fora da loja (Validade, descrição, local correto)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Depósito organizado e limpo', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Equipamentos em funcionamento (refrigerados, freezers, iluminação...)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Hortifrutti (Qualidade, precificação, abastecimento, cartazeamento)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Limpeza e organização da frente de caixa', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Limpeza e organização dos banheiros', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Ofertas do dia (abastecimento, precificação)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Pontos extras (Abastecimento, precificação, validade)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Precificação (todos os produtos com a etiqueta de preço)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Som do rádio interno (volume, rúidos...)', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Limpeza e organização dos banheiros', periodicity: 'DIÁRIO' },
    { description: 'V.O. 14H: Limpeza e organização da frente de caixa', periodicity: 'DIÁRIO' },

    // MENSAL / REUNIÕES
    { description: 'MENSAL: Reunião Gerente Geral com encarregados(as) e Subgerente', periodicity: 'MENSAL' },
    { description: 'MENSAL: Reunião Encarregados(as) com a sua equipe (falar dos pontos do mês que passou e plano de ação para o mês seguinte)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Reunião Indicadores com Comercial (Gerente, Sub, RH e Comercial)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Perdas (top 5 perdas por setor e traçar plano de ação)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Divergências no recebimento (Entender o motivo para resolução)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Gerenciar produtos próximos do vencimento com exposição agressiva', periodicity: 'MENSAL' },
    { description: 'MENSAL: Acompanhamentos vendas dos itens das ofertas, se a exposição foi em aceita', periodicity: 'MENSAL' },
    { description: 'MENSAL: Estoque - Troca - Extrato de movimentação, acompanhamento junto ao Cleber', periodicity: 'MENSAL' },
    { description: 'MENSAL: Acompanhar cotações', periodicity: 'MENSAL' },
    { description: 'MENSAL: Acompanhar o despacho de osso', periodicity: 'MENSAL' },
    { description: 'MENSAL: Elaborar relatórios semanais das vendas das cotações', periodicity: 'MENSAL' },
    { description: 'MENSAL: Toda sexta-feira: Definir ofertas do hortifruti', periodicity: 'MENSAL' },
  ],
  'SubGerente': [
    // VOLTA OLÍMPICA MANHÃ
    { description: 'OPERAÇÃO: Acompanhar cotações', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Apresentação pessoal da equipe (uniformes, maquiagem, cabelos) e escalas', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Balcões de açougue  (abastecimento, precificação, qualidade, limpeza)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Bebidas frias  geladeiras abastecidas constantes', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Cartazeamento dentro e fora da loja (Validade, descrição, local correto)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Corredores da área de venda (está livre para que o cliente consiga passar com os carrinhos)', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Depósito organizado e limpo', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Equipamentos em funcionamento (refrigerados, freezers, iluminação...)', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Festivais - Exposição agressivo e cartazeamento (não deixar falta o item)', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Hortifrutti (Qualidade, precificação, abastecimento, cartazeamento)', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Limpeza e organização da frente de caixa', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Limpeza e organização dos banheiros', periodicity: 'DIÁRIO' },
    { description: 'PREVENÇÃO: Lista de produtos com validade curta 15 dias (trabalhar com rebaixe de preço, exposição, cartazeamento, estoques) ', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Ofertas diárias (Pegar o encarte de ofertas e ver como está a exposição, precificação)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Ofertas do dia (abastecimento, precificação)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Pontas de gôndulas (Abastecimento, troca de preços, cartazeamento, validade da ação) - sugerir troca', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Precificação (todos os produtos com a etiqueta de preço)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta na área de venda e repassar ao encarregado da reposição', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Balcão de frios', periodicity: 'DIÁRIO' },
  
     // DURANTE O DIA
     { description: 'OPERAÇÃO: Balcões de açougue  (abastecimento, precificação, qualidade, limpeza)', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Bebidas frias  geladeiras abastecidas constantes', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Corredores da área de venda (está livre para que o cliente consiga passar com os carrinhos)', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Depósito organizado e limpo', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Equipamentos em funcionamento (refrigerados, freezers, iluminação...)', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Festivais - Exposição agressivo e cartazeamento (não deixar falta o item)', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Hortifrutti (Qualidade, precificação, abastecimento, cartazeamento)', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Limpeza e organização dos banheiros', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Ofertas do dia (abastecimento, precificação)', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: Precificação (todos os produtos com a etiqueta de preço)', periodicity: 'DIÁRIO' },
     { description: 'OPERAÇÃO: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta na área de venda e repassar ao encarregado da reposição', periodicity: 'DIÁRIO' },
  
  ],
  'FLV': [
    { description: 'ABASTECIMENTO: Todas as bancas estão abastecidas?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Todos os produtos possui etiquetas de preço?', periodicity: 'DIÁRIO' },
    { description: 'RECEBIMENTO: No recebimento das mercadorias todos os produtos que são pesaveis foram pesados?', periodicity: 'DIÁRIO' },
    { description: 'RECEBIMENTO: No recebimento das mercadorias durante a pesagem foi descontado a TARA das caixas?', periodicity: 'DIÁRIO' },
    { description: 'RECEBIMENTO: No recebimento das mercadorias foi pesado fora das caixas de madeira ?', periodicity: 'DIÁRIO' },
    { description: 'RECEBIMENTO: No recebimento das mercadorias foi constatado qualidade ruim? ', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza e organização das cameras frias', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza das bancas', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza e organização da aréa de fracionamento dos produtos e seus utensilios', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento do descarte', periodicity: 'DIÁRIO' },
    { description: 'VENDAS: Acompanhamento das vendas do setor, sendo do dia anterior versus a meta', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento das perdas do setor', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento do balanço nas quintas-feiras e análise das divergências', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Sugestão das compras, observando períodos do mês, garantindo os produtos disponíveis e evitando perdas', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Terça e Quarta: Preparação para o dia da feira, providenciando cartazeamento "TERÇA E QUARTA VERDE"', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Sexta: Definir os itens que entrará na agenda de ofertas, olhando margem, preço atual e preço sugerido', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Foi realizado o envio da sugestão de ofertas para o Heitor?', periodicity: 'SEMANAL' },
  
  ],
  'Mercearia': [
    { description: 'ABASTECIMENTO: Itens que acabaram de chegar já estão na área de venda?', periodicity: 'DIÁRIO' },
    { description: 'PRECIFICAÇÃO: Verificação de todos os corredores da lista de alterados', periodicity: 'DIÁRIO' },
    { description: 'PRECIFICAÇÃO: Todos os cartazes estão legíveis?', periodicity: 'DIÁRIO' },
    { description: 'PRECIFICAÇÃO: Na área de venda possui rupturas? ', periodicity: 'DIÁRIO' },
    { description: 'REPOSIÇÃO: Corredores e prateleiras limpos e organizados (paredão visual)', periodicity: 'DIÁRIO' },
    { description: 'VALIDADE: Pegar a lista dos produtos próximo e vencimento e suas quantidades, para traçar plano de ação sendo exposição e preço agressivo, buscando venda rápida', periodicity: 'DIÁRIO' },
    { description: 'GESTÃO: Distribuir tarefas entre repositores (foco em ofertas e tabloide)', periodicity: 'DIÁRIO' },
    { description: 'GESTÃO: Corredores desobstruídos, passagem livre para clientes. Gondolas abastecidas, pontos extras abastecidos. Precificação. Cartaz.', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Itens sem venda está na área de venda?', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Escalas de trabalho', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Acompanhar itens que mais vende e alinhar abastecimento, pontos extras', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Organizando junto aos respositores um uma BATIDA DE VALIDADE no seu setor, SENDO 2h por dia, para identificação de produtos vencidos ou próximo para fazer as devidas tratativas', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Analisar perdas (vencimento/avarias) - suporte do Cleber - SEMANAL', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Acompanhar as vendas do setor versus a meta, traçar planos de ação para buscar o atingimento', periodicity: 'SEMANAL' },
  ],
  'FLC (Frios e Laticínios)': [
    { description: 'OPERAÇÃO: Todas as geladeiras e área de venda estão abastecidas?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: As geladeiras estão limpas?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Todos os produtos possui etiquetas de preço?', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza e organização das cameras frias?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento da movimentação dos retalhos dos queijos?', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza e organização da aréa de manipulação de fatiados e seus utensilios?', periodicity: 'DIÁRIO' },
    { description: 'VENDAS: Acompanhamento das vendas do setor, sendo do dia anterior versus a meta?', periodicity: 'DIÁRIO' },
    { description: 'VENDAS: Verificação da lista de ofertas?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento das perdas do setor?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento do balanço e análise das divergências?', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Foi realizado a ronda de validade?', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Foi programado as escalas de trabalho da equipe?', periodicity: 'SEMANAL' },
    
  ]
};

export default function LoginPage() {
  const [dept, setDept] = useState('Diretoria');
  const [pass, setPass] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Verifica se a senha bate com o departamento selecionado
    if (CREDENTIALS[dept] === pass) {
      // REGRA DE REDIRECIONAMENTO:
      // Se for gestão (Diretoria/Gerente), vai para o Dashboard
      if (dept === 'Diretoria' || dept === 'Gerente') {
        router.push('/dashboard');
      } else {
        // Se for operação, vai para o checklist do setor
        router.push(`/checklist/${dept.toLowerCase().replace(/ /g, '-')}`);
      }
    } else {
      alert('Senha incorreta para este departamento!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl text-center border-t-8 border-slate-700">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl mb-6 mx-auto shadow-xl font-black italic">V</div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800 leading-none">Acesso Restrito</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 mb-8">Vivian Loja - Auditoria</p>
        
        <select 
          className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none mb-4 appearance-none"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          {Object.keys(CREDENTIALS).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <input 
          type="password" 
          placeholder="Senha de Acesso" 
          className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-slate-900 mb-6 text-center shadow-inner"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <button 
          onClick={handleLogin}
          className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest italic"
        >
          Entrar no Sistema
        </button>
      </div>
    </div>
  );
}