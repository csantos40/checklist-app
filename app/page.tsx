'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SETORES_LISTA, PRODUTOS_PADARIA, PRODUTOS_ROTISSERIA, PRODUTOS_CONFEITARIA, TASK_DATA } from './data/tasksData';

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

export default function Home({ isTesteRoute = false }: { isTesteRoute?: boolean }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const isTeste = isTesteRoute || pathname?.includes('/teste'); 

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPeriodicity, setCurrentPeriodicity] = useState('DIÁRIO');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const [senhasBanco, setSenhasBanco] = useState<any>({});
  const [suppressHydration, setSuppressHydration] = useState(false);
  const [isLockedToday, setIsLockedToday] = useState(false);
  const [resolvingTask, setResolvingTask] = useState<any>(null);
  const [tratativaTexto, setTratativaTexto] = useState('');
  
  // 🚀 ESTADO DA ABA ATIVA NO MODO DE TESTE
  const [activeTestSector, setActiveTestSector] = useState('GERAL');
  
  const [offlineCount, setOfflineCount] = useState(0);

  // 🚀 ESTADOS PARA O TOP 10 MAIORES VENDAS
  const [top10Padaria, setTop10Padaria] = useState<any[]>([]);
  const [top10Rotisseria, setTop10Rotisseria] = useState<any[]>([]);
  const [top10Confeitaria, setTop10Confeitaria] = useState<any[]>([]);
  const [isModalTop10Open, setIsModalTop10Open] = useState(false);
  const [activeTop10Category, setActiveTop10Category] = useState<'Padaria' | 'Rotisseria' | 'Confeitaria' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 🚀 ESTADO PARA O FORMULÁRIO DE ANÁLISE GC (COMPRAS 2)
  const initialGCState = {
    departamento: '',
    categoriasDesenvolvidas: '',
    categoriasPositivas: '',
    categoriasNegativas: '',
    categoriasMargemReduzida: '',
    reducaoQuantidades: '',
    reducaoValorVenda: '',
    reducaoValorLucro: '',
    reducaoMargem: ''
  };
  const [gcData, setGcData] = useState(initialGCState);
  
  // 🚀 ESTADO PARA O BOTÃO SECRETO E HORÁRIO
  const [clickCount, setClickCount] = useState(0);
  const [foraDoHorario, setForaDoHorario] = useState(false);

  useEffect(() => { setSuppressHydration(true); }, []);

  // 🚀 CARREGAR DADOS DO LOCALSTORAGE (TOP 10 e GC)
  useEffect(() => {
    if (department === 'Padaria-Confeitaria-Rotisseria' || department === 'TESTE_SISTEMA') {
      const savedPadaria = localStorage.getItem('top10_padaria');
      const savedRotisseria = localStorage.getItem('top10_rotisseria');
      const savedConfeitaria = localStorage.getItem('top10_confeitaria');
      if (savedPadaria) setTop10Padaria(JSON.parse(savedPadaria));
      if (savedRotisseria) setTop10Rotisseria(JSON.parse(savedRotisseria));
      if (savedConfeitaria) setTop10Confeitaria(JSON.parse(savedConfeitaria));
    }
    if (department === 'Compras 2' || department === 'TESTE_SISTEMA') {
      const savedGC = localStorage.getItem('gc_analysis_data');
      if (savedGC) setGcData(JSON.parse(savedGC));
    }
  }, [department]);

  // 🚀 SALVAR DADOS DO GC NO LOCALSTORAGE
  const handleGcChange = (field: string, value: string) => {
    const newData = { ...gcData, [field]: value };
    setGcData(newData);
    localStorage.setItem('gc_analysis_data', JSON.stringify(newData));
  };

  // 🚀 SALVAR TOP 10 NO LOCALSTORAGE
  const saveTop10Local = (category: string, data: any[]) => {
    if (category === 'Padaria') { setTop10Padaria(data); localStorage.setItem('top10_padaria', JSON.stringify(data)); }
    if (category === 'Rotisseria') { setTop10Rotisseria(data); localStorage.setItem('top10_rotisseria', JSON.stringify(data)); }
    if (category === 'Confeitaria') { setTop10Confeitaria(data); localStorage.setItem('top10_confeitaria', JSON.stringify(data)); }
  };

  // 🚀 LÓGICA DE FOTOS NO TOP 10
  const handleTop10Photo = async (e: any, category: string, id: string) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const updatePhoto = (photoBase64: string) => {
        const updateList = (list: any[]) => list.map(item => item.id === id ? { ...item, photo: photoBase64 } : item);
        if (category === 'Padaria') saveTop10Local(category, updateList(top10Padaria));
        if (category === 'Rotisseria') saveTop10Local(category, updateList(top10Rotisseria));
        if (category === 'Confeitaria') saveTop10Local(category, updateList(top10Confeitaria));
    };

    try {
        const imageCompression = (await import('browser-image-compression')).default;
        const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1024, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => updatePhoto(reader.result as string);
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        const reader = new FileReader();
        reader.onloadend = () => updatePhoto(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  // 🚀 LÓGICA DE CAIXAS CLICÁVEIS DE HORÁRIOS (S/N) NO TOP 10
  const handleTop10Status = (category: string, id: string, time: string, status: string) => {
    const updateList = (list: any[]) => list.map(item => {
        if (item.id === id) {
            const newStatuses = { ...(item.statuses || {}) };
            newStatuses[time] = newStatuses[time] === status ? null : status; 
            return { ...item, statuses: newStatuses };
        }
        return item;
    });

    if (category === 'Padaria') saveTop10Local(category, updateList(top10Padaria));
    if (category === 'Rotisseria') saveTop10Local(category, updateList(top10Rotisseria));
    if (category === 'Confeitaria') saveTop10Local(category, updateList(top10Confeitaria));
  };

  const handleAddTop10 = (item: any) => {
    let currentList: any[] = [];
    if (activeTop10Category === 'Padaria') currentList = [...top10Padaria];
    if (activeTop10Category === 'Rotisseria') currentList = [...top10Rotisseria];
    if (activeTop10Category === 'Confeitaria') currentList = [...top10Confeitaria];

    if (currentList.length >= 10) return alert("LIMITE ATINGIDO! Você só pode selecionar 10 itens para a Curva A.");
    if (currentList.find(i => i.id === item.id)) return alert("ESTE ITEM JÁ ESTÁ NA LISTA!");
    
    const newItem = { ...item, statuses: { '10:00': null, '15:00': null }, photo: null };
    currentList.push(newItem);
    saveTop10Local(activeTop10Category!, currentList);
  };

  const handleRemoveTop10 = (category: string, id: string) => {
    if (category === 'Padaria') saveTop10Local(category, top10Padaria.filter(i => i.id !== id));
    if (category === 'Rotisseria') saveTop10Local(category, top10Rotisseria.filter(i => i.id !== id));
    if (category === 'Confeitaria') saveTop10Local(category, top10Confeitaria.filter(i => i.id !== id));
  };

  const getFilteredProducts = () => {
    let list: any[] = [];
    if (activeTop10Category === 'Padaria') list = PRODUTOS_PADARIA;
    if (activeTop10Category === 'Rotisseria') list = PRODUTOS_ROTISSERIA;
    if (activeTop10Category === 'Confeitaria') list = PRODUTOS_CONFEITARIA;
    
    if (!searchTerm) return list;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const searchNoZeros = searchLower.replace(/^0+/, ''); 

    return list.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const idMatchOriginal = item.id.includes(searchLower);
      const idMatchNoZeros = searchNoZeros.length > 0 && item.id.replace(/^0+/, '').includes(searchNoZeros);
      
      return nameMatch || idMatchOriginal || idMatchNoZeros;
    });
  };

  const resetarAppDeTeste = () => {
    const confirm = window.confirm("🧹 Deseja apagar todas as tarefas preenchidas e resetar o aplicativo de teste?");
    if (confirm) {
      localStorage.clear();
      sessionStorage.clear();
      const request = indexedDB.deleteDatabase('VivianAuditoriaDB');
      request.onsuccess = () => { window.location.href = window.location.pathname + '?reset=' + new Date().getTime(); };
      request.onerror = () => { window.location.href = window.location.pathname + '?reset=' + new Date().getTime(); };
    }
  };

  useEffect(() => {
    const verificarHorario = () => {
      if (!department) return;
      const horaAtual = new Date().getHours();
      // Não impõe horário para Compras e testes
      if (department.includes('Compra') || department === 'TESTE_SISTEMA') {
        setForaDoHorario(false);
      } else if (department === 'SubGerente') {
        setForaDoHorario(horaAtual < 11 || horaAtual >= 21);
      } else if (['Gerente', 'FLV', 'Mercearia', 'FLC (Frios e Laticínios)', 'Padaria-Confeitaria-Rotisseria'].includes(department)) {
        setForaDoHorario(horaAtual < 7 || horaAtual >= 18);
      } else {
        setForaDoHorario(false);
      }
    };
    verificarHorario();
    const intervalo = setInterval(verificarHorario, 60000); 
    return () => clearInterval(intervalo);
  }, [department]);

  useEffect(() => {
    const verificarViradaDeDia = () => {
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const dataSalva = localStorage.getItem('dataUltimoChecklist');
      if (dataSalva !== dataAtual) {
        localStorage.clear();
        sessionStorage.clear();
        const request = indexedDB.deleteDatabase('VivianAuditoriaDB');
        request.onsuccess = () => { localStorage.setItem('dataUltimoChecklist', dataAtual); window.location.reload(); };
        request.onerror = () => { localStorage.setItem('dataUltimoChecklist', dataAtual); window.location.reload(); };
      }
    };
    verificarViradaDeDia();
  }, []);

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
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 2000);
  };

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
                    reg.unregister().then(() => { window.location.reload(); });
                  }
                };
              }
            };
          }
        });
      };
      checkForUpdates();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdates();
      });
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      if (isAuthenticated && !isLockedToday) { e.preventDefault(); e.returnValue = ''; }
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
        const match = SETORES_LISTA.find(s => s.toLowerCase() === authStatus.toLowerCase());
        const comprasMatch = SETORES_LISTA.find(s => s.toLowerCase() === authStatus.toLowerCase());
        if (comprasMatch) {
          setDepartment(comprasMatch);
          setIsAuthenticated(true);
        } else if (match || authStatus === 'gerente') {
          setDepartment(match || 'Gerente');
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
          const allSectorTasks = TASK_DATA[department] || [];

          if (saved) { 
            const updatedSaved = saved.map((s: any) => {
               const model = allSectorTasks.find((t:any) => t.description === s.description);
               if (model?.subItems) {
                  const subs: any = s.subStatuses || {};
                  model.subItems.forEach((item: string) => {
                     if (!subs[item]) subs[item] = 'Aguardando';
                  });
                  return { ...s, subStatuses: subs };
               }
               return s;
            });
            setTasks(updatedSaved); 
          } else {
            setTasks(allSectorTasks.map((t: any) => {
              let initialSubStatuses: Record<string, string> | null = null;
              if (t.subItems) {
                initialSubStatuses = {};
                t.subItems.forEach((item: string) => (initialSubStatuses as Record<string, string>)[item] = 'Aguardando');
              }
              return { 
                ...t, 
                status: 'Aguardando', 
                observation: '', 
                photos: [], 
                frozen: false,
                subStatuses: initialSubStatuses,
                testSector: t.testSector,
                created_at: new Date().toISOString() 
              };
            }));
          }
        } catch (e) { console.error("Erro ao carregar do IndexedDB", e); }
      };
      loadTasks();
    }
  }, [isAuthenticated, department]);

  useEffect(() => {
    async function puxarPendenciasReais() {
      if (!supabase || !department || currentPeriodicity !== 'PENDÊNCIAS') return;
      const { data } = await supabase.from('respostas').select('*').eq('setor', department).eq('status', 'Não Conforme');
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
    try { await saveToIndexedDB(`chk_vVivian_v9_${department}`, newTasks);
    } catch (e) { console.error("Erro ao salvar no IndexedDB", e); }
  };

  const checkAutoFreeze = (currentIdx: number, currentTasks: any[]) => {
    return currentTasks.map((task, tIdx) => {
      if (tIdx !== currentIdx && !task.frozen && task.status !== 'Aguardando') {
        let isComplete = true;
        if (task.subStatuses && Object.values(task.subStatuses).includes('Aguardando')) {
           isComplete = false;
        } else if (task.status === 'Não Conforme') {
           const isComprasTask = department.includes('Compra') || task.testSector?.includes('COMPRAS');
           if ((!isComprasTask && (!task.photos || task.photos.length === 0)) || !task.observation || task.observation.trim().length < 15) {
              isComplete = false;
           }
        }
        if (isComplete) return { ...task, frozen: true };
      }
      return task;
    });
  };

  const finalizarResolucao = async () => {
    if (!supabase || !tratativaTexto || tratativaTexto.trim().length < 10) return alert("DESCREVA A TRATATIVA REALIZADA COM MAIS DETALHES!");
    setLoading(true);
    try {
      const { error } = await supabase.from('respostas').update({ status: 'Conforme', observacao_resolucao: tratativaTexto, resolvido_em: new Date().toISOString() }).eq('setor', department).eq('tarefa', resolvingTask.description).eq('status', 'Não Conforme').eq('created_at', resolvingTask.created_at);
      if (!error) {
        const realIdx = tasks.findIndex(t => t.description === resolvingTask.description && t.created_at === resolvingTask.created_at);
        const newTasks = [...tasks];
        if(realIdx !== -1) { newTasks[realIdx].status = 'Conforme'; newTasks[realIdx].frozen = true; saveState(newTasks); }
        alert("PENDÊNCIA RESOLVIDA COM SUCESSO!");
        setResolvingTask(null);
        setTratativaTexto('');
      } else { throw error; }
    } catch (err) { alert("ERRO AO ATUALIZAR BANCO."); } finally { setLoading(false); }
  };

  const handleSubStatusChange = (idx: number, subItem: string, clickedStatus: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    let newTasks = [...tasks];
    newTasks[realIdx].subStatuses[subItem] = newTasks[realIdx].subStatuses[subItem] === clickedStatus ? 'Aguardando' : clickedStatus;
    const statuses = Object.values(newTasks[realIdx].subStatuses);
    if (statuses.includes('Não Conforme')) { newTasks[realIdx].status = 'Não Conforme';
    } else if (statuses.includes('Aguardando')) { newTasks[realIdx].status = 'Aguardando'; } else { newTasks[realIdx].status = 'Conforme'; }
    newTasks = checkAutoFreeze(realIdx, newTasks);
    saveState(newTasks);
  };

  const handleStatusChange = (idx: number, clickedStatus: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    let newTasks = [...tasks];
    newTasks[realIdx].status = newTasks[realIdx].status === clickedStatus ? 'Aguardando' : clickedStatus;
    newTasks = checkAutoFreeze(realIdx, newTasks);
    saveState(newTasks);
  };

  const updateTaskData = (idx: number, field: string, value: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    let newTasks = [...tasks];
    newTasks[realIdx][field] = value;
    newTasks = checkAutoFreeze(realIdx, newTasks);
    saveState(newTasks);
  };

  const handleAddPhoto = (idx: number, photoBase64: any) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    let newTasks = [...tasks];
    if (!newTasks[realIdx].photos) newTasks[realIdx].photos = [];
    newTasks[realIdx].photos.push(photoBase64);
    newTasks = checkAutoFreeze(realIdx, newTasks);
    saveState(newTasks);
  };

  const handleRemovePhoto = (taskIdx: number, photoIdx: number) => {
    const realIdx = tasks.indexOf(filteredTasks[taskIdx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    let newTasks = [...tasks];
    newTasks[realIdx].photos.splice(photoIdx, 1);
    newTasks = checkAutoFreeze(realIdx, newTasks);
    saveState(newTasks);
  };

  const freezeTask = (idx: number) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1) return;
    const task = tasks[realIdx];
    if (task.subStatuses && Object.values(task.subStatuses).includes('Aguardando')) return alert("AVALIE TODOS OS BALCÕES ANTES DE FINALIZAR ESTA TAREFA!");
    if (task.status === 'Aguardando') return alert("SELECIONE O STATUS ANTES!");
    
    // 🚀 VALIDAÇÃO DO BOTÃO DE FINALIZAR ATUALIZADA
    if (task.status === 'Não Conforme') {
        const isComprasTask = department.includes('Compra') || task.testSector?.includes('COMPRAS');
        if (!isComprasTask && (!task.photos || task.photos.length === 0)) return alert("NÃO CONFORME EXIGE PELO MENOS UMA FOTO!");
        if (!task.observation || task.observation.trim().length < 15) return alert("A RÉPLICA PARA O RH ESTÁ MUITO CURTA! Detalhe melhor o problema (Mínimo 15 caracteres).");
    }
    
    let newTasks = [...tasks];
    newTasks[realIdx].frozen = true;
    newTasks = checkAutoFreeze(-1, newTasks);
    saveState(newTasks);
  };

  const syncOfflineData = async () => {
    if (!navigator.onLine) return alert("📵 Você ainda está sem internet! Tente novamente quando houver sinal.");
    if (isTeste) {
      await removeFromIndexedDB(`offline_sync_${department}`);
      setOfflineCount(0);
      return alert("🚀 TUDO SINCRONIZADO COM SUCESSO (AMBIENTE DE TESTE)!");
    }
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
             const subDetails = Object.entries(t.subStatuses).map(([key, val]) => `${key}: ${val === 'Conforme' ? 'OK' : 'NC'}`).join(' | ');
             finalObservation = `[${subDetails}] - ${t.observation}`;
          }
          return { setor: department, tarefa: t.description, status: t.status, observacao: finalObservation, foto_url: fotoUrlFinal, created_at: t.created_at };
        }));
        // @ts-ignore
        await supabase.from('respostas').insert(payloads);
      }
      await removeFromIndexedDB(`offline_sync_${department}`);
      setOfflineCount(0);
      alert("🚀 TUDO SINCRONIZADO COM SUCESSO!");
    } catch (e) { alert("ERRO AO SINCRONIZAR FILA. TENTE NOVAMENTE."); } finally { setLoading(false); }
  };

  const submitChecklist = async () => {
    if (foraDoHorario) return alert("FORA DO HORÁRIO PERMITIDO PARA O SEU SETOR!");
    if (isLockedToday) return;

    // 🚀 ENVIO DOS DADOS DA NOVA ABA DE ANÁLISE GC
    if (currentPeriodicity === 'ANÁLISE GC') {
      if (!gcData.departamento) return alert("Por favor, preencha o Nome do Departamento (Ex: Frios) antes de salvar!");
      if (isTeste) return alert("✅ ANÁLISE GC SALVA COM SUCESSO NO AMBIENTE DE TESTE!");
      
      setLoading(true);
      try {
         const observacaoFormatada = `
           Departamento: ${gcData.departamento} | 
           Cat. Desenvolvidas: ${gcData.categoriasDesenvolvidas || '0'} | 
           Cat. c/ Resultado Positivo: ${gcData.categoriasPositivas || '0'} | 
           Cat. c/ Resultado Negativo: ${gcData.categoriasNegativas || '0'} | 
           Cat. c/ Margem Reduzida: ${gcData.categoriasMargemReduzida || '0'} | 
           Red. de quantidades: ${gcData.reducaoQuantidades || '0'} | 
           Red. do valor de venda: ${gcData.reducaoValorVenda || '0'} | 
           Red. do valor de lucro: ${gcData.reducaoValorLucro || '0'} | 
           Red. de margem de contri: ${gcData.reducaoMargem || '0'}
         `.replace(/\n/g, '').trim();

         const payload = {
           setor: department,
           tarefa: `ANÁLISE GC DE PERFORMANCE - ${gcData.departamento}`,
           status: 'Conforme',
           observacao: observacaoFormatada,
           foto_url: '',
           created_at: new Date().toISOString()
         };

         const { error } = await supabase.from('respostas').insert([payload]);
         if (error) throw error;

         alert("✅ ANÁLISE GC SALVA COM SUCESSO!");
         localStorage.removeItem('gc_analysis_data');
         setGcData(initialGCState);
      } catch (err) {
         alert("❌ ERRO AO SALVAR ANÁLISE GC.");
      } finally {
         setLoading(false);
      }
      return;
    }

    if (currentPeriodicity === 'TOP 10') {
      const todosTop10 = [...top10Padaria, ...top10Rotisseria, ...top10Confeitaria];
      if (todosTop10.length === 0) return alert("Adicione produtos ao TOP 10 antes de salvar!");
      const faltamFotos = todosTop10.filter(item => !item.photo);
      if (faltamFotos.length > 0) return alert(`⚠️ AÇÃO BLOQUEADA: Faltam fotos em ${faltamFotos.length} produto(s) do TOP 10! É obrigatório anexar foto para todos os itens da Curva A.`);
      const faltamStatus = todosTop10.filter(item => {
        if (!item.statuses) return true;
        const marcacoes = Object.values(item.statuses); 
        return marcacoes.every(val => val === null); 
      });
      if (faltamStatus.length > 0) return alert(`⚠️ AÇÃO BLOQUEADA: Você esqueceu de marcar o status (Sim ou Não) em ${faltamStatus.length} produto(s) do TOP 10! Você precisa marcar pelo menos um horário antes de finalizar.`);
      if (isTeste) return alert("✅ ACOMPANHAMENTO DO TOP 10 SALVO COM SUCESSO NO AMBIENTE DE TESTE!");
      setLoading(true);
      try {
        const payloads = await Promise.all(todosTop10.map(async (t) => {
          let fotoUrlFinal = '';
          if (t.photo) {
            try {
              const res = await fetch(t.photo);
              const blob = await res.blob();
              const fileName = `TOP10_${department.replace(/\s/g, '')}_${t.id}_${Date.now()}.jpg`;
              const { data, error } = await supabase.storage.from('checklist-fotos').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
              if (data && !error) {
                const { data: pub } = supabase.storage.from('checklist-fotos').getPublicUrl(fileName);
                if (pub?.publicUrl) fotoUrlFinal = pub.publicUrl;
              }
            } catch (err) { console.error("Falha ao subir foto do TOP 10", err); }
          }
          const statusText = t.statuses ? Object.entries(t.statuses).map(([time, val]) => `${time} (${val || 'Sem Registo'})`).join(' | ') : '';
          return { setor: department, tarefa: `TOP 10: ${t.name}`, status: 'Conforme', observacao: `Acompanhamento: ${statusText}`, foto_url: fotoUrlFinal, created_at: new Date().toISOString() };
        }));
        const { error } = await supabase.from('respostas').insert(payloads);
        if (error) throw error;
        alert("✅ ACOMPANHAMENTO DO TOP 10 SALVO COM SUCESSO NO SERVIDOR!");
      } catch (error) { alert("❌ ERRO AO SALVAR TOP 10 NO SERVIDOR."); } finally { setLoading(false); }
      return;
    }

    const currentPeriodTasks = tasks.filter(t => t.periodicity === currentPeriodicity);

    if (isTeste && department === 'TESTE_SISTEMA') {
      const testSectorTasks = currentPeriodTasks.filter(t => t.testSector === activeTestSector || (!t.testSector && activeTestSector === 'GERAL'));
      const unfrozenTestTasks = testSectorTasks.filter(t => !t.frozen);
      if (unfrozenTestTasks.length > 0) return alert(`FALTAM ${unfrozenTestTasks.length} TAREFAS PARA FINALIZAR A ABA ${activeTestSector}!`);
      const resetTasks = tasks.map(t => {
          if (t.periodicity === currentPeriodicity && (t.testSector === activeTestSector || (!t.testSector && activeTestSector === 'GERAL'))) {
              return { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false, subStatuses: t.subItems ? t.subItems.reduce((acc:any, i:string)=>({...acc, [i]: 'Aguardando'}), {}) : null };
          }
          return t;
      });
      saveState(resetTasks);
      return alert(`🚀 MODO TESTE: SETOR ${activeTestSector} FINALIZADO COM SUCESSO!\n\nAs tarefas desta aba foram limpas para você continuar os testes.`);
    }

    const unfrozenTasks = currentPeriodTasks.filter(t => !t.frozen);
    if (unfrozenTasks.length > 0) return alert(`FALTAM ${unfrozenTasks.length} TAREFAS PARA FINALIZAR NESTA AUDITORIA!`);

    if (isTeste) {
      const today = new Date().toLocaleDateString();
      localStorage.setItem(`last_submit_date_${department}`, today);
      setIsLockedToday(true);
      const resetTasks = tasks.map(t => t.periodicity === currentPeriodicity ? { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false, subStatuses: t.subItems ? t.subItems.reduce((acc:any, i:string)=>({...acc, [i]: 'Aguardando'}), {}) : null } : t);
      setTasks(resetTasks);
      return alert("SINCRONIZADO COM SUCESSO (AMBIENTE DE TESTE)! BLOQUEADO ATÉ AMANHÃ.");
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
         alert("💾 SALVO NO MODO OFFLINE!");
      } catch (e) { alert("ERRO AO SALVAR OFFLINE."); } finally { setLoading(false); }
      return;
    }

    setLoading(true);
    try {
      const payloads = await Promise.all(currentPeriodTasks.map(async (t) => {
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
           const subDetails = Object.entries(t.subStatuses).map(([key, val]) => `${key}: ${val === 'Conforme' ? 'OK' : 'NC'}`).join(' | ');
           finalObservation = `[${subDetails}] - ${t.observation}`;
        }
        return { setor: department, tarefa: t.description, status: t.status, observacao: finalObservation, foto_url: fotoUrlFinal, created_at: t.created_at };
      }));

      await supabase.from('respostas').insert(payloads);
      const today = new Date().toLocaleDateString();
      localStorage.setItem(`last_submit_date_${department}`, today);
      setIsLockedToday(true);
      alert("SINCRONIZADO COM SUCESSO! BLOQUEADO ATÉ AMANHÃ.");
      const resetTasks = tasks.map(t => t.periodicity === currentPeriodicity ? { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false, subStatuses: t.subItems ? t.subItems.reduce((acc:any, i:string)=>({...acc, [i]: 'Aguardando'}), {}) : null } : t);
      setTasks(resetTasks);
      await removeFromIndexedDB(`chk_vVivian_v9_${department}`);
    } catch (err) { alert("ERRO DE CONEXÃO!"); } finally { setLoading(false); }
  };

  let filteredTasks = tasks.filter(t => currentPeriodicity === 'PENDÊNCIAS' ? t.status === 'Não Conforme' : t.periodicity === currentPeriodicity);
  if (department === 'TESTE_SISTEMA' && currentPeriodicity !== 'TOP 10' && currentPeriodicity !== 'PENDÊNCIAS' && currentPeriodicity !== 'ANÁLISE GC') {
    filteredTasks = filteredTasks.filter(t => t.testSector === activeTestSector || (!t.testSector && activeTestSector === 'GERAL'));
  }
  const totalNCPendentes = tasks.filter(t => t.status === 'Não Conforme').length;

  const handleLogin = () => {
    // @ts-ignore
    const senhaCorreta = senhasBanco[department];
    if (
      (senhaCorreta && senhaCorreta === password) || 
      (department === 'Padaria-Confeitaria-Rotisseria' && password === 'pcr123') ||
      (department.includes('Compra') && password === 'compras123') // 🚀 FACILITADOR PARA TESTAR AS COMPRAS
    ) {
      localStorage.setItem('user_auth', department.toLowerCase());
      setIsAuthenticated(true);
      window.location.reload(); 
    } else { 
      alert('SENHA INCORRETA!'); 
    }
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
              <div className="relative w-full">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="SENHA: teste123" 
                  className="w-full p-6 bg-slate-50 border-2 border-amber-500 rounded-2xl text-center text-2xl outline-none font-black text-slate-900 shadow-inner uppercase italic pr-16" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center w-10 h-10"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-800">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-800">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              <button onClick={handleLogin} className="w-full bg-black text-white font-black py-6 rounded-2xl shadow-xl active:scale-95 text-xl italic uppercase font-black italic">ENTRAR NO TESTE</button>
              <button onClick={resetarAppDeTeste} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 text-sm italic uppercase mt-4">🧹 ZERAR DADOS DO APP</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 italic font-black text-slate-900 uppercase text-center">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-t-8 border-indigo-600 text-slate-900">
          <div className="mb-10 flex flex-col items-center text-slate-900 font-black italic">
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
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="SENHA" 
                className="w-full p-6 bg-slate-50 border-2 border-indigo-500 rounded-2xl text-center text-2xl outline-none font-black text-slate-900 shadow-inner uppercase italic font-black italic pr-16" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center w-10 h-10"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-800">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-800">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
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
              {isTeste && (
                 <button onClick={resetarAppDeTeste} className="bg-red-600 px-4 py-2 rounded-xl text-[9px] text-white transition-all font-black uppercase shadow-lg active:scale-95">🧹 Resetar Teste</button>
              )}
              {(department === 'Gerente' || department === 'TESTE_SISTEMA') && (
                <button onClick={() => router.push('/dashboard')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] border border-indigo-500 font-black uppercase italic transition-all shadow-lg active:scale-95 font-black italic">📊 DASHBOARD</button>
              )}
              <button onClick={() => { localStorage.removeItem('user_auth'); window.location.href = isTeste ? '/teste' : '/'; }} className="bg-slate-800 px-5 py-2 rounded-xl text-[10px] text-slate-400 hover:text-white transition-all font-black italic uppercase border border-slate-700 text-slate-300 font-black italic">Sair</button>
            </div>
          </div>
          
          {/* 🚀 MENUS DINÂMICOS COM A NOVA ABA "ANÁLISE GC" */}
          <div className="flex gap-2 bg-slate-800 p-2 rounded-2xl max-w-md mx-auto shadow-inner overflow-x-auto no-scrollbar font-black italic text-white font-black italic">
            {['DIÁRIO', 'SEMANAL', 'MENSAL', 'PENDÊNCIAS', 
               ...(department.includes('Compra') || department === 'TESTE_SISTEMA' ? ['RELATÓRIOS'] : []), 
               ...(department === 'Compras 2' || department === 'TESTE_SISTEMA' ? ['ANÁLISE GC'] : []), 
               ...(department === 'Padaria-Confeitaria-Rotisseria' || department === 'TESTE_SISTEMA' ? ['TOP 10'] : [])
            ].map(p => (
              <button key={p} onClick={() => setCurrentPeriodicity(p)} className={`flex-1 min-w-[80px] py-3 text-[10px] rounded-xl transition-all font-black italic ${currentPeriodicity === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{p}</button>
            ))}
          </div>
          
          {department === 'TESTE_SISTEMA' && currentPeriodicity !== 'TOP 10' && currentPeriodicity !== 'ANÁLISE GC' && (
            <div className="mt-4 flex gap-2 bg-amber-500/20 p-2 rounded-2xl max-w-full overflow-x-auto no-scrollbar border border-amber-500/30">
               {['GERAL', 'GERENTE', 'SUBGERENTE', 'FLV', 'MERCEARIA', 'FLC', 'PADARIA', 'COMPRAS 1', 'COMPRAS 2', 'ASSISTENTE COMPRAS'].map(sec => (
                  <button 
                    key={sec} 
                    onClick={() => setActiveTestSector(sec)} 
                    className={`flex-none px-4 py-2 text-[10px] rounded-xl transition-all font-black uppercase italic ${activeTestSector === sec ? 'bg-amber-500 text-black shadow-md' : 'text-amber-200 hover:bg-amber-500/50 hover:text-white'}`}
                  >
                    {sec}
                  </button>
               ))}
            </div>
          )}
        </header>

        {offlineCount > 0 && (
          <div className="bg-amber-500 mx-6 mt-6 p-4 rounded-2xl flex justify-between items-center shadow-lg border-2 border-amber-600 font-black italic animate-in slide-in-from-top-4">
            <p className="text-black text-[10px] uppercase leading-tight">⚠️ SINAL DE INTERNET PERDIDO: <br/> <span className="text-sm">{offlineCount} AUDITORIA(S) NA FILA</span></p>
            <button onClick={syncOfflineData} disabled={loading} className="bg-black text-white px-5 py-3 rounded-xl text-[10px] uppercase shadow-md active:scale-95 transition-all font-black">SINCRONIZAR AGORA</button>
          </div>
        )}

        <main className="p-6 space-y-6 flex-1 bg-white overflow-y-auto font-black italic">
          
          {foraDoHorario && currentPeriodicity !== 'PENDÊNCIAS' ? (
            <div className="text-center py-20 text-slate-900 font-black italic">
               <div className="text-6xl mb-4 font-black italic">⏰</div>
               <h2 className="text-2xl italic uppercase font-black text-slate-900 font-black italic">FORA DO HORÁRIO</h2>
               <p className="text-slate-400 text-sm mt-2 font-bold uppercase italic font-black italic">SEU SETOR RESPONDE DAS {department === 'SubGerente' ? '11H ÀS 21H' : '07H ÀS 18H'}.</p>
            </div>
          ) : currentPeriodicity === 'ANÁLISE GC' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="text-center mb-6">
                 <h2 className="text-3xl text-indigo-700 font-black uppercase italic">📊 ANÁLISE DE PERFORMANCE GC</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase italic mt-2">Preencha os indicadores da análise diária</p>
               </div>
               
               <div className="bg-white p-6 rounded-[2.5rem] border-2 border-indigo-100 shadow-sm space-y-6">
                 
                 <div className="w-full">
                    <label className="text-[10px] text-indigo-800 font-black uppercase italic ml-2">NOME DO DEPARTAMENTO DA GC</label>
                    <input type="text" placeholder="EX: FRIOS" className="w-full p-4 mt-2 rounded-xl border-2 border-slate-200 text-slate-900 font-bold uppercase outline-none focus:border-indigo-500 transition-all" value={gcData.departamento} onChange={(e) => handleGcChange('departamento', e.target.value)} />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                   {/* COLUNA ESQUERDA - CATEGORIAS */}
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-600 font-black uppercase italic ml-2">Categorias Desenvolvidas</label>
                        <input type="text" placeholder="Ex: 0" className="w-full p-4 mt-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold outline-none focus:border-indigo-500" value={gcData.categoriasDesenvolvidas} onChange={(e) => handleGcChange('categoriasDesenvolvidas', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 font-black uppercase italic ml-2">Categorias com Resultado Positivo</label>
                        <input type="text" placeholder="Ex: 0 - 0%" className="w-full p-4 mt-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold outline-none focus:border-indigo-500" value={gcData.categoriasPositivas} onChange={(e) => handleGcChange('categoriasPositivas', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 font-black uppercase italic ml-2">Categorias com Resultado Negativo</label>
                        <input type="text" placeholder="Ex: 0 - 0%" className="w-full p-4 mt-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold outline-none focus:border-indigo-500" value={gcData.categoriasNegativas} onChange={(e) => handleGcChange('categoriasNegativas', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 font-black uppercase italic ml-2">Categorias com Margem Reduzida</label>
                        <input type="text" placeholder="Ex: 0" className="w-full p-4 mt-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold outline-none focus:border-indigo-500" value={gcData.categoriasMargemReduzida} onChange={(e) => handleGcChange('categoriasMargemReduzida', e.target.value)} />
                      </div>
                   </div>

                   {/* COLUNA DIREITA - REDUÇÕES */}
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-red-600 font-black uppercase italic ml-2">Redução de quantidades vendidas</label>
                        <input type="text" placeholder="Ex: 0 - 0%" className="w-full p-4 mt-1 rounded-xl bg-red-50 border border-red-200 text-red-900 font-bold outline-none focus:border-red-500" value={gcData.reducaoQuantidades} onChange={(e) => handleGcChange('reducaoQuantidades', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-red-600 font-black uppercase italic ml-2">Redução do valor de venda</label>
                        <input type="text" placeholder="Ex: R$ 0,00 - 0%" className="w-full p-4 mt-1 rounded-xl bg-red-50 border border-red-200 text-red-900 font-bold outline-none focus:border-red-500" value={gcData.reducaoValorVenda} onChange={(e) => handleGcChange('reducaoValorVenda', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-red-600 font-black uppercase italic ml-2">Redução do valor do lucro</label>
                        <input type="text" placeholder="Ex: R$ 0,00 - 0%" className="w-full p-4 mt-1 rounded-xl bg-red-50 border border-red-200 text-red-900 font-bold outline-none focus:border-red-500" value={gcData.reducaoValorLucro} onChange={(e) => handleGcChange('reducaoValorLucro', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-red-600 font-black uppercase italic ml-2">Redução de margem de contribuição</label>
                        <input type="text" placeholder="Ex: 0% - 0%" className="w-full p-4 mt-1 rounded-xl bg-red-50 border border-red-200 text-red-900 font-bold outline-none focus:border-red-500" value={gcData.reducaoMargem} onChange={(e) => handleGcChange('reducaoMargem', e.target.value)} />
                      </div>
                   </div>
                 </div>

               </div>
            </div>
          ) : currentPeriodicity === 'TOP 10' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="text-center mb-6">
                 <h2 className="text-3xl text-indigo-700 font-black uppercase italic">🏆 TOP 10 VENDAS</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase italic mt-2">Construa a &quot;Curva A&quot; para monitoramento e produção</p>
               </div>

               {/* PADARIA */}
               <div className="bg-amber-50 rounded-[2rem] border-2 border-amber-200 p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                 <div className="flex justify-between items-center mb-4 pl-4">
                   <h3 className="text-xl text-amber-800 font-black uppercase italic">🍞 PADARIA <span className="text-xs text-amber-500 bg-amber-100 px-2 py-1 rounded-lg ml-2">{top10Padaria.length}/10</span></h3>
                   <button onClick={() => { setActiveTop10Category('Padaria'); setIsModalTop10Open(true); }} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-md active:scale-95">＋ ADICIONAR ITEM</button>
                 </div>
                 <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                   {top10Padaria.map((item, i) => (
                     <div key={item.id} className="bg-white border border-amber-100 p-3 rounded-xl flex flex-col shadow-sm gap-2">
                       <div className="flex justify-between items-start">
                         <p className="text-[10px] text-slate-700 uppercase font-bold italic leading-tight pr-2">
                           <span className="text-amber-500 font-black mr-1">{i+1}.</span> {item.name}
                         </p>
                         <div className="flex items-center gap-2">
                           <label className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer shadow-sm transition-all ${item.photo ? 'bg-green-500 text-white' : 'bg-slate-100 border-2 border-slate-300 text-slate-400 hover:bg-slate-200'}`}>
                             <span className="text-sm">📸</span>
                             <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleTop10Photo(e, 'Padaria', item.id)} />
                           </label>
                           <button onClick={() => handleRemoveTop10('Padaria', item.id)} className="text-red-500 bg-red-50 w-8 h-8 rounded-lg font-black hover:bg-red-100 transition-all">X</button>
                         </div>
                       </div>
                       
                       {item.photo && (
                         <div className="w-full flex justify-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                           <img src={item.photo} alt="Foto Produto" className="h-20 object-contain rounded-md" />
                         </div>
                       )}
                       <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                         {['10:00', '15:00'].map(time => (
                           <div key={time} className="flex flex-col items-center">
                             <span className="text-[8px] font-black text-slate-500 mb-1">{time}</span>
                             <div className="flex gap-1">
                               <button onClick={() => handleTop10Status('Padaria', item.id, time, 'S')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'S' ? 'bg-green-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>S</button>
                               <button onClick={() => handleTop10Status('Padaria', item.id, time, 'N')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'N' ? 'bg-red-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>N</button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                   {top10Padaria.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum item selecionado.</p>}
                 </div>
               </div>

               {/* ROTISSERIA */}
               <div className="bg-red-50 rounded-[2rem] border-2 border-red-200 p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                 <div className="flex justify-between items-center mb-4 pl-4">
                   <h3 className="text-xl text-red-800 font-black uppercase italic">🍗 ROTISSERIA <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-lg ml-2">{top10Rotisseria.length}/10</span></h3>
                   <button onClick={() => { setActiveTop10Category('Rotisseria'); setIsModalTop10Open(true); }} className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-md active:scale-95">＋ ADICIONAR ITEM</button>
                 </div>
                 <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                   {top10Rotisseria.map((item, i) => (
                     <div key={item.id} className="bg-white border border-red-100 p-3 rounded-xl flex flex-col shadow-sm gap-2">
                       <div className="flex justify-between items-start">
                         <p className="text-[10px] text-slate-700 uppercase font-bold italic leading-tight pr-2">
                           <span className="text-red-500 font-black mr-1">{i+1}.</span> {item.name}
                         </p>
                         <div className="flex items-center gap-2">
                           <label className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer shadow-sm transition-all ${item.photo ? 'bg-green-500 text-white' : 'bg-slate-100 border-2 border-slate-300 text-slate-400 hover:bg-slate-200'}`}>
                             <span className="text-sm">📸</span>
                             <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleTop10Photo(e, 'Rotisseria', item.id)} />
                           </label>
                           <button onClick={() => handleRemoveTop10('Rotisseria', item.id)} className="text-red-500 bg-red-50 w-8 h-8 rounded-lg font-black hover:bg-red-100 transition-all">X</button>
                         </div>
                       </div>
                       
                       {item.photo && (
                         <div className="w-full flex justify-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                           <img src={item.photo} alt="Foto Produto" className="h-20 object-contain rounded-md" />
                         </div>
                       )}
                       <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                         {['10:00', '15:00'].map(time => (
                           <div key={time} className="flex flex-col items-center">
                             <span className="text-[8px] font-black text-slate-500 mb-1">{time}</span>
                             <div className="flex gap-1">
                               <button onClick={() => handleTop10Status('Rotisseria', item.id, time, 'S')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'S' ? 'bg-green-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>S</button>
                               <button onClick={() => handleTop10Status('Rotisseria', item.id, time, 'N')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'N' ? 'bg-red-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>N</button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                   {top10Rotisseria.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum item selecionado.</p>}
                 </div>
               </div>

               {/* CONFEITARIA */}
               <div className="bg-pink-50 rounded-[2rem] border-2 border-pink-200 p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-pink-500"></div>
                 <div className="flex justify-between items-center mb-4 pl-4">
                   <h3 className="text-xl text-pink-800 font-black uppercase italic">🍰 CONFEITARIA <span className="text-xs text-pink-500 bg-pink-100 px-2 py-1 rounded-lg ml-2">{top10Confeitaria.length}/10</span></h3>
                   <button onClick={() => { setActiveTop10Category('Confeitaria'); setIsModalTop10Open(true); }} className="bg-pink-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-md active:scale-95">＋ ADICIONAR ITEM</button>
                 </div>
                 <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                   {top10Confeitaria.map((item, i) => (
                     <div key={item.id} className="bg-white border border-pink-100 p-3 rounded-xl flex flex-col shadow-sm gap-2">
                       <div className="flex justify-between items-start">
                         <p className="text-[10px] text-slate-700 uppercase font-bold italic leading-tight pr-2">
                           <span className="text-pink-500 font-black mr-1">{i+1}.</span> {item.name}
                         </p>
                         <div className="flex items-center gap-2">
                           <label className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer shadow-sm transition-all ${item.photo ? 'bg-green-500 text-white' : 'bg-slate-100 border-2 border-slate-300 text-slate-400 hover:bg-slate-200'}`}>
                             <span className="text-sm">📸</span>
                             <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleTop10Photo(e, 'Confeitaria', item.id)} />
                           </label>
                           <button onClick={() => handleRemoveTop10('Confeitaria', item.id)} className="text-red-500 bg-red-50 w-8 h-8 rounded-lg font-black hover:bg-red-100 transition-all">X</button>
                         </div>
                       </div>
                       
                       {item.photo && (
                         <div className="w-full flex justify-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                           <img src={item.photo} alt="Foto Produto" className="h-20 object-contain rounded-md" />
                         </div>
                       )}
                       <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                         {['10:00', '15:00'].map(time => (
                           <div key={time} className="flex flex-col items-center">
                             <span className="text-[8px] font-black text-slate-500 mb-1">{time}</span>
                             <div className="flex gap-1">
                               <button onClick={() => handleTop10Status('Confeitaria', item.id, time, 'S')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'S' ? 'bg-green-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>S</button>
                               <button onClick={() => handleTop10Status('Confeitaria', item.id, time, 'N')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'N' ? 'bg-red-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>N</button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                   {top10Confeitaria.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum item selecionado.</p>}
                 </div>
               </div>
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
              
              // 🚀 VERIFICAÇÃO SE A TAREFA ATUAL É DE COMPRAS
              const isComprasTask = department.includes('Compra') || task.testSector?.includes('COMPRAS');

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
                            <p className="text-xs italic font-bold text-slate-900 font-black italic">&quot;{task.observation}&quot;</p>
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
                        
                        {/* 🚀 EXIBIR TEXTO SE FOR "NÃO CONFORME" */}
                        {task.status === 'Não Conforme' && (
                          <>
                            <div className="bg-amber-100 p-5 rounded-[2rem] border-2 border-amber-300 w-full mb-2">
                              <p className="text-[10px] text-amber-800 font-black uppercase italic mb-2">🗣️ JUSTIFICATIVA / RÉPLICA PARA O RH:</p>
                              <textarea disabled={task.frozen} placeholder="Explique detalhadamente o motivo para o RH..." className="w-full p-4 rounded-2xl border border-amber-300 text-black font-bold outline-none text-sm uppercase italic shadow-inner bg-white min-h-[80px]" value={task.observation} onChange={(e) => updateTaskData(idx, 'observation', e.target.value)} />
                              {!task.frozen && <p className={`text-[8px] text-right mt-2 uppercase font-black ${task.observation?.length >= 15 ? 'text-green-600' : 'text-red-500'}`}>{task.observation?.length || 0}/15 CARACTERES EXIGIDOS</p>}
                            </div>
                            
                            {/* 🚀 CÂMERA TOTALMENTE OCULTA PARA OS SETORES DE COMPRAS (Mesmo no modo teste) */}
                            {!isComprasTask && (
                              <div className="flex flex-wrap gap-3 items-center font-black italic">
                                {task.photos?.map((p: string, pIdx: number) => (
                                    <div key={pIdx} className="w-16 h-16 rounded-xl border-2 border-amber-300 overflow-hidden shadow-sm relative font-black italic">
                                        <img src={p} alt="Anexo Auditoria" className="w-full h-full object-cover font-black italic" />
                                        {!task.frozen && <button onClick={() => handleRemovePhoto(idx, pIdx)} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-bl-lg shadow-md text-white font-black font-black italic">X</button>}
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
                            )}
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

        {/* 🚀 MODAL DO TOP 10 PARA BUSCAR PRODUTOS */}
        {isModalTop10Open && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-100 w-full max-w-2xl rounded-[3rem] shadow-2xl border-t-8 border-indigo-500 overflow-hidden flex flex-col h-[80vh]">
              <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black uppercase italic text-slate-900">Buscar Produto</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-1">Adicionando à lista: {activeTop10Category}</p>
                </div>
                <button onClick={() => { setIsModalTop10Open(false); setSearchTerm(''); }} className="bg-slate-100 text-slate-600 w-10 h-10 rounded-full font-black text-lg hover:bg-slate-200">X</button>
              </div>
              <div className="p-6 bg-slate-50 border-b border-slate-200">
                <input 
                  type="text" 
                  placeholder="NOME OU CÓDIGO DO PRODUTO..." 
                  className="w-full p-4 rounded-xl border-2 border-slate-200 uppercase text-xs font-black italic text-slate-900 outline-none focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-2">
                {getFilteredProducts().map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-indigo-300 transition-all">
                    <div>
                      <p className="text-[10px] text-indigo-500 font-black italic">CÓD: {item.id}</p>
                      <p className="text-xs text-slate-800 font-bold uppercase italic leading-tight">{item.name}</p>
                    </div>
                    <button onClick={() => handleAddTop10(item)} className="bg-indigo-600 text-white w-8 h-8 rounded-lg font-black shadow-md hover:scale-105 active:scale-95">+</button>
                  </div>
                ))}
                {getFilteredProducts().length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-bold uppercase italic text-xs">Nenhum produto encontrado.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🚀 BOTÃO DE FINALIZAR */}
        {!isLockedToday && !foraDoHorario && currentPeriodicity !== 'PENDÊNCIAS' && (
          <footer className="p-8 bg-slate-50 text-center border-t border-slate-200 rounded-b-[3.5rem] font-black italic">
            <button onClick={submitChecklist} disabled={loading} className={`w-full py-7 rounded-[2.5rem] shadow-xl text-xl transition-all active:scale-95 font-black italic uppercase border-b-8 font-black italic ${loading ? 'bg-slate-400 border-slate-500 font-black italic' : 'bg-black text-white border-slate-800 hover:bg-slate-900 font-black italic'} text-white font-black italic`}>
              {loading ? 'SINCRONIZANDO...' : currentPeriodicity === 'TOP 10' ? 'SALVAR ACOMPANHAMENTO TOP 10' : currentPeriodicity === 'ANÁLISE GC' ? 'SALVAR ANÁLISE GC' : (isTeste && department === 'TESTE_SISTEMA') ? `FINALIZAR SETOR: ${activeTestSector}` : `FINALIZAR AUDITORIA`}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}