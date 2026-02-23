'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- 🚀 NOVO: FUNÇÕES DO BANCO DE DADOS LOCAL (INDEXEDDB) ---
const DB_NAME = 'VivianAuditoriaDB';
const STORE_NAME = 'checklists';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToIndexedDB = async (key: string, data: any) => {
  const db: any = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

const loadFromIndexedDB = async (key: string) => {
  const db: any = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const removeFromIndexedDB = async (key: string) => {
  const db: any = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};
// -----------------------------------------------------------

// 1. FILTRO DE SETORES CORRETO
const SETORES_LISTA = [
  "Gerente", "SubGerente", "FLV", "Mercearia", "FLC (Frios e Laticínios)"
];

// 2. TAREFAS
const TASK_DATA = {
  'TESTE_SISTEMA': [
    { description: 'TESTE: Validar se a foto está subindo', periodicity: 'DIÁRIO' },
    { description: 'TESTE: Validar se a observação salva', periodicity: 'DIÁRIO' },
  ],
  'Gerente': [
    { description: 'V.O. MANHÃ: Preços no sistema / PDV (Atualização de preços no sistema)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta e repassar ao encarregado', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Balcões de açougue (abastecimento, precificação, qualidade, limpeza)', periodicity: 'DIÁRIO' },
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
    { description: 'DIA: Acompanhar vendas, perdas, margem versus a META do dia anterior/acumulado mês', periodicity: 'DIÁRIO' },
    { description: 'DIA: Verificar rupturas na área de venda e acionar o responsável imediatamente', periodicity: 'DIÁRIO' },
    { description: 'DIA: Comunicar apostas comerciais ao time de encarregados', periodicity: 'DIÁRIO' },
    { description: 'DIA: Ruptura crítica (itens de curva A)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Acompanhamentos vendas dos itens das ofertas, se a exposição foi em aceita', periodicity: 'DIÁRIO' },   
    { description: 'DIA: Preparação para os festivais, degustações, ofertas do dia (cartazeamento, exposição)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Acompanhar divergências no recebimento (quantidade e valor e após entender junto com o comercial e CPD loja os motivos para a correção.', periodicity: 'DIÁRIO' },
    { description: 'SEMANAL: Toda sexta-feira: Definir ofertas do hortifruti', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: Validade dos produtos (lista dos itens com plano de ação)', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: Estoque - Troca - Extrato de movimentação, acompanhamento junto ao Cleber', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: SEXTA 14:00h- Comercial - Lista de produtos com validade curta 7 dias (trabalhar com plano de ação, rebaixe de preço, exposição, cartazeamento, estoques)', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: Acompanhar o despacho de osso', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: Comercial (Levar sugestões de ofertas agressivas ao comercial, como itens próximo de vencimento, levantar as informações ao repassar aos setores)', periodicity: 'SEMANAL' },
    { description: 'MENSAL: Reunião Gerente Geral com encarregados(as) e Subgerente', periodicity: 'MENSAL' },
    { description: 'MENSAL: Reunião Encarregados(as) com a sua equipe (falar dos pontos do mês que passou e plano de ação para o mês seguinte)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Reunião Indicadores com Comercial (Gerente, Sub, RH e Comercial)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Perdas (top 5 perdas por setor e traçar plano de ação)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Divergências no recebimento (Entender o motivo para resolução)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Gerenciar produtos próximos do vencimento com exposição agressiva', periodicity: 'MENSAL' },
    { description: 'MENSAL: Acompanhar cotações', periodicity: 'DIÁRIO' },
    { description: 'MENSAL: Elaborar relatórios semanais das vendas das cotações', periodicity: 'MENSAL' },
    { description: 'MENSAL: Perdas e itens sem giro (Reunião com Prevenção - plano de ação)', periodicity: 'MENSAL' },
  ],
  'SubGerente': [
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
    { description: 'OPERAÇÃO: Ofertas diárias (Pegar o encarte de ofertas e ver como está a exposição, precificação)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Ofertas do dia (abastecimento, precificação)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Pontas de gôndulas (Abastecimento, troca de preços, cartazeamento, validade da ação) - sugerir troca', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Precificação (todos os produtos com a etiqueta de preço)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta na área de venda e repassar ao encarregado da reposição', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: QUINTA - Recolher  lista de validades com encarregados dos setores', periodicity: 'SEMANAL' },
    { description: 'PREVENÇÃO: Lista de produtos com validade curta 15 dias (trabalhar com rebaixe de preço, exposição, cartazeamento, estoques) ', periodicity: 'SEMANAL' },
    { description: 'PREVENÇÃO: SEXTA 14:00h- Comercial - Lista de produtos com validade curta 7 dias (trabalhar com plano de ação, rebaixe de preço, exposição, cartazeamento, estoques)', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Balcão de frios', periodicity: 'DIÁRIO' },
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
    { description: 'DIA: Lista dos itens que acabou de chegar (Verificar se já está na área de venda)', periodicity: 'DIÁRIO' },
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
    { description: 'GESTÃO: Quinta-feira - Entregar p/ Adriano lista dos produtos próximo do vencimento (proxima semana) e suas quantidades, para traçar plano de ação sendo exposição e preço agressivo, buscando venda rápida', periodicity: 'SEMANAL' },
  ]
};

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [currentPeriodicity, setCurrentPeriodicity] = useState('DIÁRIO');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const [senhasBanco, setSenhasBanco] = useState({});
  const [suppressHydration, setSuppressHydration] = useState(false);
  const [isLockedToday, setIsLockedToday] = useState(false);
  const [resolvingTask, setResolvingTask] = useState<any>(null);
  const [tratativaTexto, setTratativaTexto] = useState('');

  useEffect(() => { setSuppressHydration(true); }, []);

  // 🚀 BLOQUEIO ANTI-ATUALIZAÇÃO ACIDENTAL
  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      if (isAuthenticated && !isLockedToday) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, isLockedToday]);

  useEffect(() => {
    const authStatus = localStorage.getItem('user_auth');
    if (authStatus) {
      const savedDept = authStatus.charAt(0).toUpperCase() + authStatus.slice(1);
      if (SETORES_LISTA.includes(savedDept) || authStatus === 'gerente') {
        setDepartment(savedDept === 'Gerente' ? 'Gerente' : savedDept);
        setIsAuthenticated(true);
      }
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = async () => {
      try {
        // @ts-ignore
        const client = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        setSupabase(client);
        let { data } = await client.from('credenciais').select('setor, senha');
        if (data) {
          const creds: any = { 'TESTE_SISTEMA': 'teste123' };
          data.forEach((item: any) => { creds[item.setor] = item.senha; });
          setSenhasBanco(creds);
        }
      } catch (err) { console.error("Erro conexão."); }
    };
    document.body.appendChild(script);
  }, []);

  // 🚀 BUSCA INICIAL DE TAREFAS ADAPTADA PARA INDEXEDDB
  useEffect(() => {
    if (isAuthenticated && department) {
      const today = new Date().toLocaleDateString();
      const lastSubmitDate = localStorage.getItem(`last_submit_date_${department}`);
      setIsLockedToday(lastSubmitDate === today);
      
      const loadTasks = async () => {
        try {
          const saved: any = await loadFromIndexedDB(`chk_vVivian_v8_${department}`);
          if (saved) { 
            setTasks(saved); 
          } else {
            // @ts-ignore
            const allSectorTasks = TASK_DATA[department] || [];
            setTasks(allSectorTasks.map((t: any) => ({ 
              ...t, 
              status: 'Aguardando', 
              observation: '', 
              photos: [], 
              frozen: false,
              created_at: new Date().toISOString() 
            })));
          }
        } catch (e) {
          console.error("Erro ao carregar do IndexedDB", e);
        }
      };
      loadTasks();
    }
  }, [isAuthenticated, department]);

  useEffect(() => {
    async function puxarPendenciasReais() {
      if (!supabase || !department || currentPeriodicity !== 'PENDÊNCIAS') return;
      
      const { data } = await supabase
        .from('respostas')
        .select('*')
        .eq('setor', department)
        .eq('status', 'Não Conforme');

      if (data) {
        const pendenciasFormatadas = data.map((p: any) => ({
          description: p.tarefa,
          status: 'Não Conforme',
          observation: p.observacao,
          photos: p.foto_url ? String(p.foto_url).split(',').filter((link: string) => link.trim().length > 10) : [],
          created_at: p.created_at,
          frozen: false,
          periodicity: 'PENDÊNCIAS'
        }));

        setTasks(prev => {
          const tarefasAtuais = prev.filter(t => t.periodicity !== 'PENDÊNCIAS');
          return [...tarefasAtuais, ...pendenciasFormatadas];
        });
      }
    }
    puxarPendenciasReais();
  }, [currentPeriodicity, department, supabase]);

  const calcularSLA = (dataIso: string) => {
    const dataCriacao = new Date(dataIso);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - dataCriacao.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // 🚀 SALVAMENTO ADAPTADO PARA INDEXEDDB
  const saveState = async (newTasks: any[]) => {
    setTasks(newTasks);
    try {
      await saveToIndexedDB(`chk_vVivian_v8_${department}`, newTasks);
    } catch (e) {
      console.error("Erro ao salvar no IndexedDB", e);
    }
  };

  const finalizarResolucao = async () => {
    if (!supabase || !tratativaTexto) return alert("DESCREVA A TRATATIVA REALIZADA!");
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('respostas')
        .update({ 
          status: 'Conforme',
          observacao_resolucao: tratativaTexto,
          resolvido_em: new Date().toISOString()
        })
        .eq('setor', department)
        .eq('tarefa', resolvingTask.description)
        .eq('status', 'Não Conforme')
        .eq('created_at', resolvingTask.created_at);

      if (!error) {
        const realIdx = tasks.findIndex(t => t.description === resolvingTask.description && t.created_at === resolvingTask.created_at);
        const newTasks = [...tasks];
        if(realIdx !== -1) {
            newTasks[realIdx].status = 'Conforme';
            newTasks[realIdx].frozen = true;
            saveState(newTasks);
        }
        alert("PENDÊNCIA RESOLVIDA COM SUCESSO!");
        setResolvingTask(null);
        setTratativaTexto('');
      } else { throw error; }
    } catch (err) {
      alert("ERRO AO ATUALIZAR BANCO.");
    } finally { setLoading(false); }
  };

  // 🚀 CORREÇÃO DE CLIQUE COM INDEXOF
  const handleStatusChange = (idx: number, clickedStatus: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;

    const newTasks = [...tasks];

    newTasks.forEach((task, tIdx) => {
      if (tIdx !== realIdx && !task.frozen && task.status !== 'Aguardando') {
        const canAutoFreeze = task.status === 'Conforme' || 
                             (task.status === 'Não Conforme' && task.observation && task.photos?.length > 0);
        
        if (canAutoFreeze) {
          newTasks[tIdx].frozen = true;
        }
      }
    });

    newTasks[realIdx].status = newTasks[realIdx].status === clickedStatus ? 'Aguardando' : clickedStatus;
    saveState(newTasks);
  };

  const updateTaskData = (idx: number, field: string, value: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    const newTasks = [...tasks];
    newTasks[realIdx][field] = value;
    saveState(newTasks);
  };

  const handleAddPhoto = (idx: number, photoBase64: any) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    const newTasks = [...tasks];
    if (!newTasks[realIdx].photos) newTasks[realIdx].photos = [];
    newTasks[realIdx].photos.push(photoBase64);
    saveState(newTasks);
  };

  const handleRemovePhoto = (taskIdx: number, photoIdx: number) => {
    const realIdx = tasks.indexOf(filteredTasks[taskIdx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    const newTasks = [...tasks];
    newTasks[realIdx].photos.splice(photoIdx, 1);
    saveState(newTasks);
  };

  const freezeTask = (idx: number) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1) return;
    const task = tasks[realIdx];
    if (task.status === 'Aguardando') return alert("SELECIONE O STATUS ANTES!");
    if (task.status === 'Não Conforme' && (!task.observation || !task.photos || task.photos.length === 0)) {
        return alert("NÃO CONFORME EXIGE OBSERVAÇÃO E FOTO!");
    }
    const newTasks = [...tasks];
    newTasks[realIdx].frozen = true;
    saveState(newTasks);
  };

  const submitChecklist = async () => {
    if (!supabase || isLockedToday) return;

    const currentPeriodTasks = tasks.filter(t => t.periodicity === currentPeriodicity);
    const unfrozenTasks = currentPeriodTasks.filter(t => !t.frozen);

    if (unfrozenTasks.length > 0) {
      return alert(`FALTAM ${unfrozenTasks.length} TAREFAS PARA FINALIZAR NESTA AUDITORIA!`);
    }

    setLoading(true);
    try {
      const toSubmit = currentPeriodTasks;
      const payloads = await Promise.all(toSubmit.map(async (t) => {
        let linksDasFotos = [];
        
        if (t.photos && t.photos.length > 0) {
          for (let i = 0; i < t.photos.length; i++) {
            try {
              const res = await fetch(t.photos[i]);
              const blob = await res.blob();
              const fileName = `${department.replace(/\s/g, '')}_${Date.now()}_${i}.jpg`;
              
              const { data, error } = await supabase.storage.from('checklist-fotos').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
              
              if (data && !error) {
                const { data: pub } = supabase.storage.from('checklist-fotos').getPublicUrl(fileName);
                if (pub?.publicUrl) linksDasFotos.push(pub.publicUrl);
              }
            } catch (imgErr) { console.error("Falha foto."); }
          }
        }
        
        const fotoUrlFinal = linksDasFotos.filter(Boolean).join(',');

        return { 
          setor: department, 
          tarefa: t.description, 
          status: t.status, 
          observacao: t.observation, 
          foto_url: fotoUrlFinal,
          created_at: t.created_at 
        };
      }));

      // @ts-ignore
      await supabase.from('respostas').insert(payloads);
      
      const today = new Date().toLocaleDateString();
      localStorage.setItem(`last_submit_date_${department}`, today);
      setIsLockedToday(true);
      
      alert("SINCRONIZADO COM SUCESSO! BLOQUEADO ATÉ AMANHÃ.");
      const resetTasks = tasks.map(t => t.periodicity === currentPeriodicity ? { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false } : t);
      setTasks(resetTasks);
      
      // 🚀 LIMPEZA DO INDEXEDDB APÓS ENVIO
      await removeFromIndexedDB(`chk_vVivian_v8_${department}`);
    } catch (err) { alert("ERRO AO SINCRONIZAR"); } finally { setLoading(false); }
  };

  const filteredTasks = tasks.filter(t => currentPeriodicity === 'PENDÊNCIAS' ? t.status === 'Não Conforme' : t.periodicity === currentPeriodicity);
  const totalNCPendentes = tasks.filter(t => t.status === 'Não Conforme').length;

  const handleLogin = () => {
    // @ts-ignore
    const senhaCorreta = senhasBanco[department];
    if (senhaCorreta && senhaCorreta === password) {
      localStorage.setItem('user_auth', department.toLowerCase());
      setIsAuthenticated(true);
    } else { alert('SENHA INCORRETA!'); }
  };

  if (!suppressHydration) return null;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 italic font-black text-slate-900 uppercase text-center">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-t-8 border-indigo-600 text-slate-900">
          <div className="mb-10 flex flex-col items-center text-slate-900 font-black italic">
             <div className="h-24 mb-6"><img src="/logo.png" alt="Logo" className="h-full w-auto object-contain text-slate-900 font-black italic" /></div>
             <h1 className="text-4xl tracking-tighter italic uppercase text-slate-900 font-black italic">ACESSO VIVIAN</h1>
          </div>
          <div className="space-y-6 text-slate-900 font-black italic">
            <select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase text-slate-900 font-black italic" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">SELECIONE O SETOR</option>
              {SETORES_LISTA.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <input type="password" placeholder="SENHA" className="w-full p-6 bg-slate-50 border-2 border-indigo-500 rounded-2xl text-center text-2xl outline-none font-black text-slate-900 shadow-inner uppercase italic font-black italic" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full bg-black text-white font-black py-6 rounded-2xl shadow-xl active:scale-95 text-xl italic uppercase font-black italic">ENTRAR</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-8 font-sans font-black italic text-slate-900 uppercase">
      <div className="max-w-5xl mx-auto shadow-2xl rounded-[3.5rem] overflow-hidden bg-white min-h-[90vh] flex flex-col border border-slate-200">
        <header className="bg-slate-900 p-8 text-white border-b border-slate-800 font-black italic">
          <div className="flex justify-between items-center mb-8 text-white font-black italic">
            <div className="flex items-center gap-4 h-12 text-white font-black italic">
              <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain text-white font-black italic" />
              <div className="text-left leading-none border-l-2 border-indigo-500 pl-3 text-white font-black italic">
                <h1 className="text-xl tracking-tighter font-black italic text-white font-black italic">{department}</h1>
                <p className="text-[8px] text-indigo-400 tracking-widest mt-1 font-black italic uppercase text-white font-black italic">SISTEMA VIVIAN</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white font-black italic">
              {totalNCPendentes > 0 && (
                <div className="bg-amber-500 text-black px-4 py-1 rounded-lg animate-pulse flex flex-col items-center border-2 border-black font-black italic">
                  <p className="text-[7px] font-black italic">N.C. PENDENTES</p>
                  <p className="text-sm leading-none font-black italic">{totalNCPendentes}</p>
                </div>
              )}
              {(department === 'Gerente' || department === 'TESTE_SISTEMA') && (
                <button onClick={() => router.push('/dashboard')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] border border-indigo-500 font-black uppercase italic transition-all shadow-lg active:scale-95 font-black italic">📊 DASHBOARD</button>
              )}
              <button onClick={() => { localStorage.removeItem('user_auth'); window.location.href = '/'; }} className="bg-slate-800 px-5 py-2 rounded-xl text-[10px] text-slate-400 hover:text-white transition-all font-black italic uppercase border border-slate-700 text-slate-300 font-black italic">Sair</button>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-800 p-2 rounded-2xl max-w-md mx-auto shadow-inner overflow-x-auto no-scrollbar font-black italic text-white font-black italic">
            {['DIÁRIO', 'SEMANAL', 'MENSAL', 'PENDÊNCIAS'].map(p => (
              <button key={p} onClick={() => setCurrentPeriodicity(p)} className={`flex-1 min-w-[95px] py-3 text-[10px] rounded-xl transition-all font-black italic ${currentPeriodicity === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{p}</button>
            ))}
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1 bg-white overflow-y-auto font-black italic">
          {isLockedToday && currentPeriodicity !== 'PENDÊNCIAS' ? (
            <div className="text-center py-20 text-slate-900 font-black italic">
               <div className="text-6xl mb-4 font-black italic">🔒</div>
               <h2 className="text-2xl italic uppercase font-black text-slate-900 font-black italic">AUDITORIA CONCLUÍDA</h2>
               <p className="text-slate-400 text-sm mt-2 font-bold uppercase italic font-black italic">SISTEMA LIBERADO NOVAMENTE AMANHÃ.</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => {
              const diasSLA = calcularSLA(task.created_at);
              return (
                <div key={idx} className={`p-6 rounded-[2.5rem] border-2 transition-all relative font-black italic ${task.frozen ? 'opacity-50 grayscale bg-slate-100 border-slate-200 text-slate-900 font-black italic' : task.status === 'Não Conforme' ? 'border-red-500 bg-red-50/50 text-slate-900 font-black italic' : task.status === 'Conforme' ? 'border-green-400 bg-green-50/30 text-slate-900 font-black italic' : 'border-slate-100 bg-slate-50 text-slate-900 font-black italic'}`}>
                  {task.frozen && <div className="absolute top-4 right-6 text-xl font-black italic">🔒</div>}
                  
                  {!task.frozen && task.status === 'Não Conforme' && (
                    <div className={`absolute top-2 right-12 px-2 py-1 rounded-md text-[7px] font-black italic shadow-sm font-black italic ${diasSLA > 0 ? 'bg-red-600 text-white font-black italic' : 'bg-amber-500 text-black font-black italic'}`}>
                      SLA: {diasSLA === 0 ? 'HOJE' : `${diasSLA} DIAS`}
                    </div>
                  )}

                  <div className="space-y-6 text-slate-900 font-black italic">
                    <p className="text-lg leading-tight font-black italic uppercase text-slate-900 font-black italic">{task.description}</p>
                    
                    {currentPeriodicity === 'PENDÊNCIAS' ? (
                      <div className="space-y-4 pt-4 border-t-2 border-red-200 text-slate-900 font-black italic">
                         <div className="bg-red-50 p-4 rounded-2xl border-l-4 border-red-500 text-slate-900 font-black italic">
                            <p className="text-[7px] text-red-500 font-black uppercase italic font-black italic">MOTIVO DA NÃO CONFORMIDADE:</p>
                            <p className="text-xs italic font-bold text-slate-900 font-black italic">"{task.observation}"</p>
                         </div>
                         <button onClick={() => setResolvingTask(task)} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase italic shadow-xl active:scale-95 text-sm transition-all text-white font-black italic">✓ RESOLVER ESTE PROBLEMA</button>
                      </div>
                    ) : (
                      <div className="flex gap-4 font-black italic">
                        <button disabled={task.frozen} onClick={() => handleStatusChange(idx, 'Conforme')} className={`flex-1 py-5 rounded-2xl text-[10px] border-2 transition-all shadow-sm font-black italic ${task.status === 'Conforme' ? 'bg-green-600 text-white border-green-600 shadow-md font-black italic' : 'bg-white text-slate-400 border-slate-100 font-black italic'}`}>CONFORME</button>
                        <button disabled={task.frozen} onClick={() => handleStatusChange(idx, 'Não Conforme')} className={`flex-1 py-5 rounded-2xl text-[10px] border-2 transition-all shadow-sm font-black italic ${task.status === 'Não Conforme' ? 'bg-red-600 text-white border-red-600 shadow-md font-black italic' : 'bg-white text-slate-400 border-slate-100 font-black italic'}`}>NÃO CONFORME</button>
                      </div>
                    )}

                    {task.status !== 'Aguardando' && currentPeriodicity !== 'PENDÊNCIAS' && (
                      <div className="space-y-4 pt-4 border-t border-slate-200 font-black italic">
                        {task.status === 'Não Conforme' && (
                          <>
                            <textarea disabled={task.frozen} placeholder="PLANO DE AÇÃO IMEDIATO..." className="w-full p-5 rounded-[2rem] border-2 border-red-200 text-black font-bold outline-none text-sm uppercase italic font-black shadow-inner bg-white font-black italic" value={task.observation} onChange={(e) => updateTaskData(idx, 'observation', e.target.value)} />
                            <div className="flex flex-wrap gap-3 items-center font-black italic">
                              {task.photos?.map((p: string, pIdx: number) => (
                                  <div key={pIdx} className="w-16 h-16 rounded-xl border-2 border-red-200 overflow-hidden shadow-sm relative font-black italic">
                                      <img src={p} className="w-full h-full object-cover font-black italic" />
                                      {!task.frozen && (
                                        <button onClick={() => handleRemovePhoto(idx, pIdx)} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-bl-lg shadow-md text-white font-black font-black italic">X</button>
                                      )}
                                  </div>
                              ))}
                              {!task.frozen && (
                                  <label className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl cursor-pointer shadow-md active:scale-95 transition-all border-2 border-white text-white font-black font-black italic">
                                    +
                                    <input type="file" accept="image/*" capture="environment" className="hidden font-black italic" onChange={(e: any) => {
                                      const reader = new FileReader();
                                      reader.onloadend = () => handleAddPhoto(idx, reader.result);
                                      reader.readAsDataURL(e.target.files[0]);
                                    }} />
                                  </label>
                              )}
                            </div>
                          </>
                        )}
                        {!task.frozen && <button onClick={() => freezeTask(idx)} className="w-full bg-indigo-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase italic shadow-lg active:scale-95 border-b-4 border-indigo-700 text-white font-black italic">✓ FINALIZAR ESTA TAREFA</button>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {currentPeriodicity === 'PENDÊNCIAS' && filteredTasks.length === 0 && (
            <div className="text-center py-20 text-slate-900 font-black italic">
               <div className="text-5xl mb-4 font-black italic">✨</div>
               <h2 className="text-xl italic font-black uppercase text-slate-900 font-black italic">Sem pendências ativas!</h2>
               <p className="text-slate-400 text-[10px] mt-2 italic font-bold uppercase font-black italic">SETOR OPERANDO EM CONFORMIDADE TOTAL.</p>
            </div>
          )}
        </main>

        {/* MODAL DE TRATATIVA */}
        {resolvingTask && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 text-slate-900 font-black italic">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl border-t-8 border-green-500 text-slate-900 font-black italic">
              <h2 className="text-2xl mb-2 italic font-black uppercase text-slate-900 text-slate-900 font-black italic">REGISTRAR SOLUÇÃO</h2>
              <p className="text-[9px] text-slate-400 mb-6 uppercase font-bold text-slate-400 leading-tight font-black italic">Tarefa: {resolvingTask.description}</p>
              <div className="space-y-4 text-left text-slate-900 font-black italic">
                <p className="text-[10px] text-green-600 font-black uppercase italic font-black italic">O QUE FOI FEITO PARA RESOLVER?</p>
                <textarea className="w-full p-5 rounded-[2rem] border-2 border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none h-32 uppercase shadow-inner italic font-black italic" placeholder="EX: REPOSIÇÃO EFETUADA..." value={tratativaTexto} onChange={(e) => setTratativaTexto(e.target.value)} />
                <div className="flex gap-2 pt-4 text-slate-900 font-black italic">
                   <button onClick={() => setResolvingTask(null)} className="flex-1 bg-slate-100 py-5 rounded-2xl text-[10px] text-slate-400 font-black uppercase font-black italic">CANCELAR</button>
                   <button onClick={finalizarResolucao} disabled={loading || !tratativaTexto} className={`flex-[2] py-5 rounded-2xl text-[10px] font-black text-white shadow-xl italic uppercase font-black italic ${loading || !tratativaTexto ? 'bg-slate-300 font-black italic' : 'bg-green-600 active:scale-95 font-black italic'} text-white font-black italic`}>{loading ? 'SALVANDO...' : '✓ CONFIRMAR RESOLUÇÃO'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLockedToday && currentPeriodicity !== 'PENDÊNCIAS' && (
          <footer className="p-8 bg-slate-50 text-center border-t border-slate-200 rounded-b-[3.5rem] font-black italic">
            <button onClick={submitChecklist} disabled={loading} className={`w-full py-7 rounded-[2.5rem] shadow-xl text-xl transition-all active:scale-95 font-black italic uppercase border-b-8 font-black italic ${loading ? 'bg-slate-400 border-slate-500 font-black italic' : 'bg-black text-white border-slate-800 hover:bg-slate-900 font-black italic'} text-white font-black italic`}>
              {loading ? 'SINCRONIZANDO...' : `FINALIZAR AUDITORIA`}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}