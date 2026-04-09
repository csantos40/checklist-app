'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// --- 🚀 FUNÇÕES DO BANCO DE DADOS LOCAL (INDEXEDDB) ---
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

const SETORES_LISTA = ["Gerente", "SubGerente", "FLV", "Mercearia", "FLC (Frios e Laticínios)"];

// 2. TAREFAS
const TASK_DATA: any = {
  'TESTE_SISTEMA': [
    { description: 'TESTE: Validar se a foto está subindo', periodicity: 'DIÁRIO' },
    { description: 'TESTE: Validar se a observação salva', periodicity: 'DIÁRIO' },
  ],
  'Gerente': [
    { description: 'V.O. MANHÃ: Preços no sistema / PDV (Atualização de preços no sistema)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
    { 
      description: 'V.O. MANHÃ: Balcões de frios (abastecimento, precificação, qualidade, limpeza, equipamentos)', 
      periodicity: 'DIÁRIO',
      subItems: ['FATIADOS', 'IOGURTES', 'MARGARINAS', 'EMBUTIDOS/MASSAS', 'GELADEIRAS/FREEZERS-SORVERTES']
    },
    { description: 'V.O. MANHÃ: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta e repassar ao encarregado', periodicity: 'DIÁRIO' },
    { 
      description: 'V.O. MANHÃ: Balcões de açougue (abastecimento, precificação, qualidade, limpeza)', 
      periodicity: 'DIÁRIO',
      subItems: ['LINGUIÇA', 'CARNE BOVINA', 'CARNE SUÍNA', 'CARNE AVES', 'PÃO DE ALHO'] 
    },
    { description: 'V.O. MANHÃ: Bebidas frias geladeiras abastecidas constantes', periodicity: 'DIÁRIO', 
      subItems: ['GELADEIRAS FRENTE DE CAIXA', 'GELADEIRAS LINHA COCA-COLA', 'GELADEIRAS REFRIGERANTES/CERVEJAS'] 
    },
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
    { description: 'Acompanhar cotações', periodicity: 'DIÁRIO' },
    { description: 'MENSAL: Elaborar relatórios semanais das vendas das cotações', periodicity: 'MENSAL' },
    { description: 'MENSAL: Perdas e itens sem giro (Reunião com Prevenção - plano de ação)', periodicity: 'MENSAL' },
  ],
  'SubGerente': [
    { description: 'OPERAÇÃO: Acompanhar cotações', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Apresentação pessoal da equipe (uniformes, maquiagem, cabelos) e escalas', periodicity: 'DIÁRIO' },
     { 
      description: 'V.O. MANHÃ: Balcões de açougue (abastecimento, precificação, qualidade, limpeza)', 
      periodicity: 'DIÁRIO',
      subItems: ['LINGUIÇA', 'CARNE BOVINA', 'CARNE SUÍNA', 'CARNE AVES', 'PÃO DE ALHO'] 
    },
    { description: 'OPERAÇÃO: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Bebidas frias geladeiras abastecidas constantes', periodicity: 'DIÁRIO', 
      subItems: ['GELADEIRAS FRENTE DE CAIXA', 'GELADEIRAS LINHA COCA-COLA', 'GELADEIRAS REFRIGERANTES/CERVEJAS'] 
    },
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
    { 
      description: 'OPERAÇÃO: Balcão de frios', 
      periodicity: 'DIÁRIO',
      subItems: ['FATIADOS', 'QUEIJOS', 'MARGARINAS', 'EMBUTIDOS/MASSAS', 'GELADEIRAS/FREEZERS-SORVERTES'] 
    },
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

// 🚀 INJEÇÃO AUTOMÁTICA DE TODAS AS TAREFAS NO AMBIENTE DE TESTE
TASK_DATA['TESTE_SISTEMA'] = [
  ...TASK_DATA['TESTE_SISTEMA'],
  ...TASK_DATA['Gerente'],
  ...TASK_DATA['SubGerente'],
  ...TASK_DATA['FLV'],
  ...TASK_DATA['Mercearia'],
  ...TASK_DATA['FLC (Frios e Laticínios)']
];

export default function Home({ isTesteRoute = false }: { isTesteRoute?: boolean }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const isTeste = isTesteRoute || pathname?.includes('/teste'); 

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
  
  const [offlineCount, setOfflineCount] = useState(0);
  
  // 🚀 ESTADO PARA O BOTÃO SECRETO
  const [clickCount, setClickCount] = useState(0);
  
  // 🚀 ESTADO PARA O LIMITADOR DE HORÁRIO
  const [foraDoHorario, setForaDoHorario] = useState(false);

  useEffect(() => { setSuppressHydration(true); }, []);

  // 🚀 FUNÇÃO EXPLÍCITA PARA RESETAR O APP NO MODO TESTE (NOVO)
  const resetarAppDeTeste = () => {
    const confirm = window.confirm("🧹 Deseja apagar todas as tarefas preenchidas e resetar o aplicativo de teste?");
    if (confirm) {
      localStorage.clear();
      sessionStorage.clear();
      const request = indexedDB.deleteDatabase('VivianAuditoriaDB');
      
      request.onsuccess = () => {
        window.location.href = window.location.pathname + '?reset=' + new Date().getTime();
      };
      request.onerror = () => {
        window.location.href = window.location.pathname + '?reset=' + new Date().getTime();
      };
    }
  };

  // 🚀 LIMITADOR DE HORÁRIO DE TRABALHO
  useEffect(() => {
    const verificarHorario = () => {
      if (!department) return;
      const horaAtual = new Date().getHours();
      
      if (department === 'SubGerente') {
        // SubGerente das 11h às 21h
        setForaDoHorario(horaAtual < 11 || horaAtual >= 21);
      } else if (['Gerente', 'FLV', 'Mercearia', 'FLC (Frios e Laticínios)'].includes(department)) {
        // Demais setores das 07h às 18h
        setForaDoHorario(horaAtual < 7 || horaAtual >= 18);
      } else {
        // TESTE_SISTEMA não tem bloqueio
        setForaDoHorario(false);
      }
    };

    verificarHorario();
    const intervalo = setInterval(verificarHorario, 60000); // Verifica a cada minuto
    return () => clearInterval(intervalo);
  }, [department]);

  // 🚀 ALARME DE VIRADA DE DIA 
  useEffect(() => {
    const verificarViradaDeDia = () => {
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const dataSalva = localStorage.getItem('dataUltimoChecklist');

      if (dataSalva !== dataAtual) {
        console.log('Novo dia detectado. Limpando dados de ontem...');
        
        localStorage.clear();
        sessionStorage.clear();
        
        const request = indexedDB.deleteDatabase('VivianAuditoriaDB');
        
        request.onsuccess = () => {
          localStorage.setItem('dataUltimoChecklist', dataAtual);
          window.location.reload();
        };
        
        request.onerror = () => {
          localStorage.setItem('dataUltimoChecklist', dataAtual);
          window.location.reload();
        };
      }
    };

    verificarViradaDeDia();
  }, []);

  // 🚀 FUNÇÃO DO BOTÃO SECRETO NO LOGO COM MENSAGEM TRANQUILIZADORA
  const handleSecretReset = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      const confirm = window.confirm("🕵️‍♂️ MODO DESENVOLVEDOR: Deseja forçar a atualização do aplicativo?\n\nFIQUE TRANQUILO(A): Suas fotos e textos já preenchidos NÃO serão perdidos. Eles estão seguros no cofre do celular e voltarão para a tela sozinhos!");
      if (confirm) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach(reg => reg.unregister());
            window.location.href = window.location.pathname + '?v=' + new Date().getTime();
          });
        } else {
          window.location.href = window.location.pathname + '?v=' + new Date().getTime();
        }
      }
      setClickCount(0); // Reseta o contador
    }
    
    // Zera o contador se a pessoa demorar mais de 2 segundos para dar os 5 cliques
    setTimeout(() => setClickCount(0), 2000);
  };

  // SISTEMA DE ATUALIZAÇÃO NINJA 
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let reg of registrations) {
            reg.update(); 
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    reg.unregister().then(() => {
                      window.location.reload();
                    });
                  }
                };
              }
            };
          }
        });
      };

      checkForUpdates();

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkForUpdates();
        }
      });
    }
  }, []);

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
      if (authStatus === 'teste_sistema') {
        setDepartment('TESTE_SISTEMA');
        setIsAuthenticated(true);
      } else {
        const savedDept = authStatus.charAt(0).toUpperCase() + authStatus.slice(1);
        if (SETORES_LISTA.includes(savedDept) || authStatus === 'gerente') {
          setDepartment(savedDept === 'Gerente' ? 'Gerente' : savedDept);
          setIsAuthenticated(true);
        }
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

  useEffect(() => {
    if (isAuthenticated && department) {
      const today = new Date().toLocaleDateString();
      const lastSubmitDate = localStorage.getItem(`last_submit_date_${department}`);
      setIsLockedToday(lastSubmitDate === today);
      
      const loadTasks = async () => {
        try {
          const offlineData: any = await loadFromIndexedDB(`offline_sync_${department}`);
          if (offlineData && offlineData.length > 0) setOfflineCount(offlineData.length);

          const saved: any = await loadFromIndexedDB(`chk_vVivian_v9_${department}`);
          // @ts-ignore
          const allSectorTasks = TASK_DATA[department] || [];

          if (saved) { 
            // 🚀 INTELIGÊNCIA: Cruza os dados salvos com os subItems novos do código
            const updatedSaved = saved.map((s: any) => {
               const model = allSectorTasks.find((t:any) => t.description === s.description);
               
               // Se a tarefa tem subItems no código, mas não no cofre (ou tem subItems novos faltando)
               if (model?.subItems) {
                  const subs: any = s.subStatuses || {};
                  model.subItems.forEach((item: string) => {
                     if (!subs[item]) {
                        subs[item] = 'Aguardando'; // Injeta o item novo sem apagar os velhos
                     }
                  });
                  return { ...s, subStatuses: subs };
               }
               return s;
            });
            setTasks(updatedSaved); 
          } else {
            setTasks(allSectorTasks.map((t: any) => {
              let initialSubStatuses = null;
              if (t.subItems) {
                initialSubStatuses = {};
                t.subItems.forEach((item: string) => initialSubStatuses[item] = 'Aguardando');
              }
              return { 
                ...t, 
                status: 'Aguardando', 
                observation: '', 
                photos: [], 
                frozen: false,
                subStatuses: initialSubStatuses,
                created_at: new Date().toISOString() 
              };
            }));
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

  const saveState = async (newTasks: any[]) => {
    setTasks(newTasks);
    try {
      await saveToIndexedDB(`chk_vVivian_v9_${department}`, newTasks);
    } catch (e) {
      console.error("Erro ao salvar no IndexedDB", e);
    }
  };

  const finalizarResolucao = async () => {
    if (!supabase || !tratativaTexto || tratativaTexto.trim().length < 10) return alert("DESCREVA A TRATATIVA REALIZADA COM MAIS DETALHES!");
    
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

  const handleSubStatusChange = (idx: number, subItem: string, clickedStatus: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;

    const newTasks = [...tasks];
    newTasks[realIdx].subStatuses[subItem] = newTasks[realIdx].subStatuses[subItem] === clickedStatus ? 'Aguardando' : clickedStatus;

    const statuses = Object.values(newTasks[realIdx].subStatuses);
    if (statuses.includes('Não Conforme')) {
      newTasks[realIdx].status = 'Não Conforme';
    } else if (statuses.includes('Aguardando')) {
      newTasks[realIdx].status = 'Aguardando';
    } else {
      newTasks[realIdx].status = 'Conforme';
    }

    newTasks.forEach((task, tIdx) => {
      if (tIdx !== realIdx && !task.frozen && task.status !== 'Aguardando') {
        const canAutoFreeze = task.status === 'Conforme' || 
                             (task.status === 'Não Conforme' && task.observation?.trim().length >= 15 && task.photos?.length > 0);
        if (canAutoFreeze && !task.subStatuses) {
          newTasks[tIdx].frozen = true;
        }
      }
    });

    saveState(newTasks);
  };

  const handleStatusChange = (idx: number, clickedStatus: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;

    const newTasks = [...tasks];

    newTasks.forEach((task, tIdx) => {
      if (tIdx !== realIdx && !task.frozen && task.status !== 'Aguardando') {
        const canAutoFreeze = task.status === 'Conforme' || 
                             (task.status === 'Não Conforme' && task.observation?.trim().length >= 15 && task.photos?.length > 0);
        
        if (canAutoFreeze && !task.subStatuses) {
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
    
    if (task.subStatuses && Object.values(task.subStatuses).includes('Aguardando')) {
       return alert("AVALIE TODOS OS BALCÕES ANTES DE FINALIZAR ESTA TAREFA!");
    }

    if (task.status === 'Aguardando') return alert("SELECIONE O STATUS ANTES!");
    
    if (task.status === 'Não Conforme') {
        if (!task.photos || task.photos.length === 0) {
            return alert("NÃO CONFORME EXIGE PELO MENOS UMA FOTO!");
        }
        if (!task.observation || task.observation.trim().length < 15) {
            return alert("A RÉPLICA PARA O RH ESTÁ MUITO CURTA! Detalhe melhor o problema (Mínimo 15 caracteres).");
        }
    }

    const newTasks = [...tasks];
    newTasks[realIdx].frozen = true;
    saveState(newTasks);
  };

  const syncOfflineData = async () => {
    if (!navigator.onLine) return alert("📵 Você ainda está sem internet! Tente novamente quando houver sinal.");
    if (!supabase) return;

    setLoading(true);
    try {
      const offlineData: any = await loadFromIndexedDB(`offline_sync_${department}`) || [];
      
      for (const audit of offlineData) {
        const payloads = await Promise.all(audit.tasks.map(async (t: any) => {
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
              } catch (imgErr) { console.error("Falha ao subir foto offline."); }
            }
          }
          
          const fotoUrlFinal = linksDasFotos.filter(Boolean).join(',');

          let finalObservation = t.observation || '';
          if (t.subStatuses && t.status === 'Não Conforme') {
             const subDetails = Object.entries(t.subStatuses)
                .map(([key, val]) => `${key}: ${val === 'Conforme' ? 'OK' : 'NC'}`)
                .join(' | ');
             finalObservation = `[${subDetails}] - ${t.observation}`;
          }

          return { 
            setor: department, 
            tarefa: t.description, 
            status: t.status, 
            observacao: finalObservation, 
            foto_url: fotoUrlFinal,
            created_at: t.created_at 
          };
        }));

        // @ts-ignore
        await supabase.from('respostas').insert(payloads);
      }

      await removeFromIndexedDB(`offline_sync_${department}`);
      setOfflineCount(0);
      alert("🚀 TUDO SINCRONIZADO COM SUCESSO!");
    } catch (e) {
      alert("ERRO AO SINCRONIZAR FILA. TENTE NOVAMENTE.");
    } finally {
      setLoading(false);
    }
  };

  const submitChecklist = async () => {
    if (foraDoHorario) return alert("FORA DO HORÁRIO PERMITIDO PARA O SEU SETOR!");
    if (isLockedToday) return;

    const currentPeriodTasks = tasks.filter(t => t.periodicity === currentPeriodicity);
    const unfrozenTasks = currentPeriodTasks.filter(t => !t.frozen);

    if (unfrozenTasks.length > 0) {
      return alert(`FALTAM ${unfrozenTasks.length} TAREFAS PARA FINALIZAR NESTA AUDITORIA!`);
    }

    if (!navigator.onLine) {
      const isConfirmed = window.confirm("📵 Você está sem internet! Deseja salvar a auditoria na Fila Offline para sincronizar depois?");
      if (!isConfirmed) return;

      setLoading(true);
      try {
         const offlineData: any = await loadFromIndexedDB(`offline_sync_${department}`) || [];
         offlineData.push({ date: new Date().toISOString(), tasks: currentPeriodTasks });
         await saveToIndexedDB(`offline_sync_${department}`, offlineData);

         const today = new Date().toLocaleDateString();
         localStorage.setItem(`last_submit_date_${department}`, today);
         setIsLockedToday(true);
         setOfflineCount(offlineData.length);

         const resetTasks = tasks.map(t => t.periodicity === currentPeriodicity ? { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false, subStatuses: t.subItems ? t.subItems.reduce((acc:any, i:string)=>({...acc, [i]: 'Aguardando'}), {}) : null } : t);
         setTasks(resetTasks);
         await removeFromIndexedDB(`chk_vVivian_v9_${department}`);

         alert("💾 SALVO NO MODO OFFLINE! Lembre-se de clicar em Sincronizar quando tiver internet.");
      } catch (e) {
         alert("ERRO AO SALVAR OFFLINE.");
      } finally {
         setLoading(false);
      }
      return;
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

        let finalObservation = t.observation || '';
        if (t.subStatuses && t.status === 'Não Conforme') {
           const subDetails = Object.entries(t.subStatuses)
              .map(([key, val]) => `${key}: ${val === 'Conforme' ? 'OK' : 'NC'}`)
              .join(' | ');
           finalObservation = `[${subDetails}] - ${t.observation}`;
        }

        return { 
          setor: department, 
          tarefa: t.description, 
          status: t.status, 
          observacao: finalObservation, 
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
      const resetTasks = tasks.map(t => t.periodicity === currentPeriodicity ? { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false, subStatuses: t.subItems ? t.subItems.reduce((acc:any, i:string)=>({...acc, [i]: 'Aguardando'}), {}) : null } : t);
      setTasks(resetTasks);
      
      await removeFromIndexedDB(`chk_vVivian_v9_${department}`);
    } catch (err) { alert("ERRO DE CONEXÃO! Verifique sua internet ou tente salvar no modo Offline."); } finally { setLoading(false); }
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
    if (isTeste) {
       return (
        <div className="min-h-screen bg-amber-500 flex items-center justify-center p-4 italic font-black text-slate-900 uppercase text-center">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-t-8 border-slate-900 text-slate-900">
            <div className="mb-10 flex flex-col items-center text-slate-900 font-black italic">
               <div className="h-24 mb-6 cursor-pointer" onClick={handleSecretReset}>
                 <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain text-slate-900 font-black italic" />
               </div>
               <h1 className="text-4xl tracking-tighter italic uppercase text-slate-900 font-black italic">MODO TESTE 🛠️</h1>
            </div>
            <div className="space-y-6 text-slate-900 font-black italic">
              <button onClick={() => setDepartment('TESTE_SISTEMA')} className={`w-full p-5 border-2 rounded-2xl font-bold uppercase text-xs transition-all ${department === 'TESTE_SISTEMA' ? 'bg-amber-500 text-black border-amber-500 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-100'}`}>
                {department === 'TESTE_SISTEMA' ? '✅ SETOR DE TESTE ATIVADO' : '👉 CLIQUE AQUI PARA ATIVAR O TESTE'}
              </button>
              <input type="password" placeholder="SENHA: teste123" className="w-full p-6 bg-slate-50 border-2 border-amber-500 rounded-2xl text-center text-2xl outline-none font-black text-slate-900 shadow-inner uppercase italic" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <button onClick={handleLogin} className="w-full bg-black text-white font-black py-6 rounded-2xl shadow-xl active:scale-95 text-xl italic uppercase font-black italic">ENTRAR NO TESTE</button>
              
              {/* 🚀 BOTÃO DE RESET NA TELA DE LOGIN DE TESTE */}
              <button onClick={resetarAppDeTeste} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 text-sm italic uppercase mt-4">
                🧹 ZERAR DADOS DO APP
              </button>

            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 italic font-black text-slate-900 uppercase text-center">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-t-8 border-indigo-600 text-slate-900">
          <div className="mb-10 flex flex-col items-center text-slate-900 font-black italic">
             {/* 🚀 BOTÃO SECRETO ESTÁ AQUI NO LOGO */}
             <div className="h-24 mb-6 cursor-pointer" onClick={handleSecretReset}>
                <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain text-slate-900 font-black italic" />
             </div>
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
        <header className="bg-slate-900 p-6 md:p-8 text-white border-b border-slate-800 font-black italic">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 text-white font-black italic">
            
            <div className="flex items-center gap-4 h-12 text-white font-black italic">
              {/* 🚀 BOTÃO SECRETO ESTÁ AQUI NO LOGO DO HEADER TAMBÉM */}
              <div className="h-full cursor-pointer" onClick={handleSecretReset}>
                <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain text-white font-black italic" />
              </div>
              <div className="text-left leading-none border-l-2 border-indigo-500 pl-3 text-white font-black italic">
                <h1 className="text-xl tracking-tighter font-black italic text-white font-black italic">{department}</h1>
                <p className={`text-[8px] tracking-widest mt-1 font-black italic uppercase text-white font-black italic ${isTeste ? 'text-amber-400' : 'text-indigo-400'}`}>
                  {isTeste ? 'AMBIENTE DE TESTE' : 'SISTEMA VIVIAN'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 text-white font-black italic">
              {totalNCPendentes > 0 && (
                <div className="bg-amber-500 text-black px-4 py-1 rounded-lg animate-pulse flex flex-col items-center border-2 border-black font-black italic">
                  <p className="text-[7px] font-black italic">N.C. PENDENTES</p>
                  <p className="text-sm leading-none font-black italic">{totalNCPendentes}</p>
                </div>
              )}

              {/* 🚀 BOTÃO DE RESET DENTRO DO APP (SÓ NO MODO TESTE) */}
              {isTeste && (
                 <button onClick={resetarAppDeTeste} className="bg-red-600 px-4 py-2 rounded-xl text-[9px] text-white transition-all font-black uppercase shadow-lg active:scale-95">
                   🧹 Resetar Teste
                 </button>
              )}

              {(department === 'Gerente' || department === 'TESTE_SISTEMA') && (
                <button onClick={() => router.push('/dashboard')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] border border-indigo-500 font-black uppercase italic transition-all shadow-lg active:scale-95 font-black italic">📊 DASHBOARD</button>
              )}
              
              <button onClick={() => { 
                  localStorage.removeItem('user_auth'); 
                  window.location.href = isTeste ? '/teste' : '/'; 
              }} className="bg-slate-800 px-5 py-2 rounded-xl text-[10px] text-slate-400 hover:text-white transition-all font-black italic uppercase border border-slate-700 text-slate-300 font-black italic">
                  Sair
              </button>
            </div>

          </div>
          <div className="flex gap-2 bg-slate-800 p-2 rounded-2xl max-w-md mx-auto shadow-inner overflow-x-auto no-scrollbar font-black italic text-white font-black italic">
            {['DIÁRIO', 'SEMANAL', 'MENSAL', 'PENDÊNCIAS'].map(p => (
              <button key={p} onClick={() => setCurrentPeriodicity(p)} className={`flex-1 min-w-[95px] py-3 text-[10px] rounded-xl transition-all font-black italic ${currentPeriodicity === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{p}</button>
            ))}
          </div>
        </header>

        {offlineCount > 0 && (
          <div className="bg-amber-500 mx-6 mt-6 p-4 rounded-2xl flex justify-between items-center shadow-lg border-2 border-amber-600 font-black italic animate-in slide-in-from-top-4">
            <p className="text-black text-[10px] uppercase leading-tight">⚠️ SINAL DE INTERNET PERDIDO: <br/> <span className="text-sm">{offlineCount} AUDITORIA(S) NA FILA</span></p>
            <button onClick={syncOfflineData} disabled={loading} className="bg-black text-white px-5 py-3 rounded-xl text-[10px] uppercase shadow-md active:scale-95 transition-all font-black">
              {loading ? 'ENVIANDO...' : 'SINCRONIZAR AGORA'}
            </button>
          </div>
        )}

        <main className="p-6 space-y-6 flex-1 bg-white overflow-y-auto font-black italic">
          {foraDoHorario && currentPeriodicity !== 'PENDÊNCIAS' ? (
            <div className="text-center py-20 text-slate-900 font-black italic">
               <div className="text-6xl mb-4 font-black italic">⏰</div>
               <h2 className="text-2xl italic uppercase font-black text-slate-900 font-black italic">FORA DO HORÁRIO</h2>
               <p className="text-slate-400 text-sm mt-2 font-bold uppercase italic font-black italic">
                 SEU SETOR RESPONDE DAS {department === 'SubGerente' ? '11H ÀS 21H' : '07H ÀS 18H'}.
               </p>
            </div>
          ) : isLockedToday && currentPeriodicity !== 'PENDÊNCIAS' ? (
            <div className="text-center py-20 text-slate-900 font-black italic">
               <div className="text-6xl mb-4 font-black italic">🔒</div>
               <h2 className="text-2xl italic uppercase font-black text-slate-900 font-black italic">AUDITORIA CONCLUÍDA</h2>
               <p className="text-slate-400 text-sm mt-2 font-bold uppercase italic font-black italic">SISTEMA LIBERADO NOVAMENTE AMANHÃ.</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => {
              const diasSLA = calcularSLA(task.created_at);
              return (
                <div key={idx} className={`p-6 rounded-[2.5rem] border-2 transition-all relative font-black italic ${task.frozen ? 'opacity-50 grayscale bg-slate-100 border-slate-200 text-slate-900 font-black italic' : task.status === 'Não Conforme' ? 'border-amber-400 bg-amber-50/50 text-slate-900 font-black italic' : task.status === 'Conforme' ? 'border-green-400 bg-green-50/30 text-slate-900 font-black italic' : 'border-slate-100 bg-slate-50 text-slate-900 font-black italic'}`}>
                  {task.frozen && <div className="absolute top-4 right-6 text-xl font-black italic">🔒</div>}
                  
                  {!task.frozen && task.status === 'Não Conforme' && (
                    <div className={`absolute top-2 right-12 px-2 py-1 rounded-md text-[7px] font-black italic shadow-sm font-black italic ${diasSLA > 0 ? 'bg-red-600 text-white font-black italic' : 'bg-amber-500 text-black font-black italic'}`}>
                      SLA: {diasSLA === 0 ? 'HOJE' : `${diasSLA} DIAS`}
                    </div>
                  )}

                  <div className="space-y-6 text-slate-900 font-black italic">
                    <p className="text-lg leading-tight font-black italic uppercase text-slate-900 font-black italic">{task.description}</p>
                    
                    {currentPeriodicity === 'PENDÊNCIAS' ? (
                      <div className="space-y-4 pt-4 border-t-2 border-amber-200 text-slate-900 font-black italic">
                         <div className="bg-amber-100 p-4 rounded-2xl border-l-4 border-amber-500 text-slate-900 font-black italic">
                            <p className="text-[7px] text-amber-700 font-black uppercase italic font-black italic">RÉPLICA ENVIADA AO RH NO DIA DA AUDITORIA:</p>
                            <p className="text-xs italic font-bold text-slate-900 font-black italic">"{task.observation}"</p>
                         </div>
                         <button onClick={() => setResolvingTask(task)} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase italic shadow-xl active:scale-95 text-sm transition-all text-white font-black italic">✓ RESOLVER ESTE PROBLEMA</button>
                      </div>
                    ) : task.subStatuses ? (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-3">Avalie cada balcão individualmente:</p>
                        {Object.keys(task.subStatuses).map(subItem => (
                          <div key={subItem} className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-700">{subItem}</span>
                            <div className="flex gap-2">
                              <button disabled={task.frozen} onClick={() => handleSubStatusChange(idx, subItem, 'Conforme')} className={`px-3 py-2 rounded-lg text-[8px] border-2 transition-all font-black ${task.subStatuses[subItem] === 'Conforme' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-slate-300 border-slate-100'}`}>CONFORME</button>
                              <button disabled={task.frozen} onClick={() => handleSubStatusChange(idx, subItem, 'Não Conforme')} className={`px-3 py-2 rounded-lg text-[8px] border-2 transition-all font-black ${task.subStatuses[subItem] === 'Não Conforme' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-300 border-slate-100'}`}>NÃO CONFORME</button>
                            </div>
                          </div>
                        ))}
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
                            <div className="bg-amber-100 p-5 rounded-[2rem] border-2 border-amber-300 w-full mb-2">
                              <p className="text-[10px] text-amber-800 font-black uppercase italic mb-2">🗣️ JUSTIFICATIVA / RÉPLICA PARA O RH:</p>
                              <textarea 
                                disabled={task.frozen} 
                                placeholder="Explique detalhadamente o motivo para o RH..." 
                                className="w-full p-4 rounded-2xl border border-amber-300 text-black font-bold outline-none text-sm uppercase italic shadow-inner bg-white min-h-[80px]" 
                                value={task.observation} 
                                onChange={(e) => updateTaskData(idx, 'observation', e.target.value)} 
                              />
                              {!task.frozen && (
                                <p className={`text-[8px] text-right mt-2 uppercase font-black ${task.observation?.length >= 15 ? 'text-green-600' : 'text-red-500'}`}>
                                  {task.observation?.length || 0}/15 CARACTERES EXIGIDOS
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-3 items-center font-black italic">
                              {task.photos?.map((p: string, pIdx: number) => (
                                  <div key={pIdx} className="w-16 h-16 rounded-xl border-2 border-amber-300 overflow-hidden shadow-sm relative font-black italic">
                                      <img src={p} className="w-full h-full object-cover font-black italic" />
                                      {!task.frozen && (
                                        <button onClick={() => handleRemovePhoto(idx, pIdx)} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-bl-lg shadow-md text-white font-black font-black italic">X</button>
                                      )}
                                  </div>
                              ))}
                              {!task.frozen && (
                                  <label className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl cursor-pointer shadow-md active:scale-95 transition-all border-2 border-white text-white font-black font-black italic">
                                    +
                                    <input type="file" accept="image/*" capture="environment" className="hidden font-black italic" onChange={async (e: any) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      try {
                                        const imageCompression = (await import('browser-image-compression')).default;
                                        const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1024, useWebWorker: true };
                                        const compressedFile = await imageCompression(file, options);
                                        
                                        const reader = new FileReader();
                                        reader.onloadend = () => handleAddPhoto(idx, reader.result);
                                        reader.readAsDataURL(compressedFile);
                                      } catch (error) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => handleAddPhoto(idx, reader.result);
                                        reader.readAsDataURL(file);
                                      }
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

        {!isLockedToday && !foraDoHorario && currentPeriodicity !== 'PENDÊNCIAS' && (
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