'use client';
import { useState, useEffect } from 'react';

// ========================================================
// 1. DEFINIÇÃO DAS CREDENCIAIS (FORA DO ESCOPO PARA EVITAR ERRO)
// ========================================================
const DEPARTMENTS_CREDENTIALS: Record<string, string> = {
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

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [currentPeriodicity, setCurrentPeriodicity] = useState('DIÁRIO');
  const [tasks, setTasks] = useState<any[]>([]);

  const handleLogin = () => {
    if (DEPARTMENTS_CREDENTIALS[department] === password) {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta para o departamento selecionado!');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const sectorTasks = (TASK_DATA[department] || []).filter(t => t.periodicity === currentPeriodicity);
      setTasks(sectorTasks.map(task => ({ ...task, status: 'Pendente', observation: '', photo: null })));
    }
  }, [isAuthenticated, department, currentPeriodicity]);

  const updateTask = (idx: number, field: string, value: any) => {
    const newTasks = [...tasks];
    newTasks[idx] = { ...newTasks[idx], [field]: value };
    setTasks(newTasks);
  };

  const handleFileChange = (idx: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateTask(idx, 'photo', reader.result);
    reader.readAsDataURL(file);
  };

  const submitChecklist = async () => {
    if (tasks.some(t => t.status === 'Pendente')) return alert('ERRO: Marque todos os itens!');
    if (tasks.some(t => t.status === 'Não Conforme' && (t.observation.trim() === '' || !t.photo))) {
      return alert('ERRO: Itens "Não Conforme" exigem Observação e FOTO REAL!');
    }

    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ departamento: department, tipo: currentPeriodicity, itens: tasks })
    });

    if (res.ok) {
      alert(`Checklist enviado com sucesso!`);
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-500/20">✓</div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Acesso Restrito</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 italic">Identifique o Departamento</p>
          </div>
          <div className="space-y-5">
            <select 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-600 transition-all cursor-pointer"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Selecione o Setor</option>
              {Object.keys(DEPARTMENTS_CREDENTIALS).map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <input 
              type="password"
              placeholder="Digite a Senha"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-600 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-tighter italic">Entrar no Sistema</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <header className="bg-slate-900 p-8 text-white text-center border-b border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">{department}</h1>
            <button onClick={() => setIsAuthenticated(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 hover:text-white transition-all shadow-md">SAIR</button>
          </div>
          <div className="flex gap-2 bg-slate-800 p-1.5 rounded-2xl max-w-sm mx-auto shadow-inner">
            {['DIÁRIO', 'SEMANAL', 'MENSAL'].map(p => (
              <button key={p} onClick={() => setCurrentPeriodicity(p)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${currentPeriodicity === p ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{p}</button>
            ))}
          </div>
        </header>

        <main className="p-6 space-y-6 min-h-[500px]">
          {tasks.map((task, idx) => (
            <div key={idx} className={`p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${
              task.status === 'Não Conforme' ? 'border-red-200 bg-red-50/40 shadow-inner' : 
              task.status === 'Conforme' ? 'border-green-100 bg-green-50/20 shadow-sm' : 
              'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start gap-4">
                  <p className="font-bold text-slate-800 text-lg flex-1 leading-tight">{task.description}</p>
                  <div className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase border shadow-sm ${
                    task.status === 'Pendente' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                    task.status === 'Conforme' ? 'bg-green-100 text-green-700 border-green-200' : 
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>{task.status}</div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => updateTask(idx, 'status', 'Conforme')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black transition-all border-2 ${task.status === 'Conforme' ? 'bg-green-600 text-white border-green-700 shadow-md scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 shadow-sm'}`}>CONFORME</button>
                  <button onClick={() => updateTask(idx, 'status', 'Não Conforme')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black transition-all border-2 ${task.status === 'Não Conforme' ? 'bg-red-600 text-white border-red-700 shadow-md scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 shadow-sm'}`}>NÃO CONFORME</button>
                </div>

                {task.status === 'Não Conforme' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <textarea placeholder="Descreva o desvio detalhadamente (Obrigatório)..." className="w-full p-5 rounded-[2rem] border-2 border-red-200 outline-none focus:border-red-500 text-sm shadow-inner bg-white font-medium" value={task.observation} onChange={(e) => updateTask(idx, 'observation', e.target.value)} />
                    <label className={`w-full flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer ${!task.photo ? 'border-red-400 bg-red-50 animate-pulse' : 'border-green-500 bg-green-50'}`}>
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{task.photo ? '📸 Foto Registrada com Sucesso' : '📷 Abrir Câmera e Tirar Foto (Obrigatório)'}</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>

        <footer className="p-8 bg-slate-50 border-t border-slate-200 text-center">
          <button onClick={submitChecklist} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-7 rounded-[2rem] shadow-xl transition-all active:scale-[0.98] uppercase tracking-tighter text-xl italic">Finalizar Checklist de {department}</button>
          <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Sistema de Gestão Operacional Unidade</p>
        </footer>
      </div>
    </div>
  );
}