'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SETORES_TESTE = ["Gerente", "SubGerente", "FLV", "Mercearia", "FLC (Frios e Laticínios)"];

// TAREFAS DE EXEMPLO PARA TESTE
const TASK_DATA_TESTE = {
  'Gerente': [
    { description: 'TESTE: V.O. MANHÃ: PREÇOS NO SISTEMA / PDV', periodicity: 'DIÁRIO' },
    { description: 'TESTE: V.O. MANHÃ: REPOSIÇÃO (ÁREA DE VENDA)', periodicity: 'DIÁRIO' },
  ],
  'FLV': [
    { description: 'TESTE: Todas as bancas estão abastecidas?', periodicity: 'DIÁRIO' },
  ],
  'Mercearia': [
    { description: 'TESTE: Itens que acabaram de chegar já estão na área de venda?', periodicity: 'DIÁRIO' },
  ]
};

export default function ModoTeste() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // ❄️ LOGICA DE TRAVA INDIVIDUAL (FROZEN)
  const freezeTaskTeste = (idx) => {
    const task = tasks[idx];
    if (task.status === 'Aguardando') return alert("SELECIONE O STATUS ANTES DE TRAVAR!");
    
    // 🛡️ TRAVA DE SEGURANÇA DO NÃO CONFORME
    if (task.status === 'Não Conforme') {
      if (!task.observation || task.observation.length < 5) {
        return alert("ERRO: NO MODO TESTE TAMBÉM É OBRIGATÓRIO ESCREVER O PLANO DE AÇÃO!");
      }
      if (!task.photos || task.photos.length === 0) {
        return alert("ERRO: TAREFA NÃO CONFORME EXIGE AO MENOS 1 FOTO!");
      }
    }

    const newTasks = [...tasks];
    newTasks[idx].frozen = true;
    setTasks(newTasks);
    alert("TAREFA TRAVADA COM SUCESSO!");
  };

  const handleStatusChange = (idx, status) => {
    if (tasks[idx].frozen) return;
    const newTasks = [...tasks];
    newTasks[idx].status = newTasks[idx].status === status ? 'Aguardando' : status;
    setTasks(newTasks);
  };

  const handleLoginTeste = () => {
    if (password === 'teste123') setIsAuthenticated(true);
    else alert('Senha de teste incorreta!');
  };

  useEffect(() => {
    if (isAuthenticated && department) {
      // @ts-ignore
      const allSectorTasks = TASK_DATA_TESTE[department] || [];
      setTasks(allSectorTasks.map(t => ({ 
        ...t, status: 'Aguardando', observation: '', photos: [], frozen: false 
      })));
    }
  }, [isAuthenticated, department]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-amber-500 flex items-center justify-center p-4 italic font-black uppercase text-center">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-t-8 border-black">
          <h1 className="text-3xl mb-6">MODO TESTE 🛠️</h1>
          <select className="w-full p-5 bg-slate-100 border-2 rounded-2xl mb-4 font-black italic" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">SELECIONE O SETOR</option>
            {SETORES_TESTE.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <input type="password" placeholder="SENHA: teste123" className="w-full p-5 bg-slate-50 border-2 border-amber-500 rounded-2xl mb-6 text-center font-black" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLoginTeste} className="w-full bg-black text-white py-5 rounded-2xl font-black">INICIAR TREINAMENTO</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-black uppercase italic text-slate-900">
      <div className="bg-amber-600 text-white text-center py-2 text-[10px] fixed top-0 left-0 right-0 z-50 tracking-widest">
        ESTÁGIO DE TREINAMENTO - TRAVAS DE SEGURANÇA ATIVAS
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl mt-10 overflow-hidden border-4 border-amber-500 min-h-[80vh] flex flex-col">
        <header className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <h1 className="text-xl leading-none">{department} (TESTE)</h1>
          <button onClick={() => window.location.reload()} className="bg-red-600 px-4 py-2 rounded-xl text-[10px]">RESETAR TUDO</button>
        </header>

        <main className="p-6 space-y-6 flex-1">
          {tasks.map((task, idx) => (
            <div key={idx} className={`p-6 rounded-[2.5rem] border-2 transition-all relative ${task.frozen ? 'opacity-50 bg-slate-100' : 'bg-slate-50 border-slate-200'}`}>
              {task.frozen && <div className="absolute top-4 right-6 text-xl">🔒</div>}
              
              <p className="mb-4 text-lg">{task.description}</p>
              <div className="flex gap-4 mb-4">
                <button disabled={task.frozen} onClick={() => handleStatusChange(idx, 'Conforme')} className={`flex-1 py-4 rounded-xl border-2 font-black ${task.status === 'Conforme' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-400'}`}>CONFORME</button>
                <button disabled={task.frozen} onClick={() => handleStatusChange(idx, 'Não Conforme')} className={`flex-1 py-4 rounded-xl border-2 font-black ${task.status === 'Não Conforme' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-400'}`}>NÃO CONFORME</button>
              </div>

              {task.status !== 'Aguardando' && (
                <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                  {task.status === 'Não Conforme' && (
                    <>
                      <textarea disabled={task.frozen} className="w-full p-4 rounded-2xl border-2 border-red-200 font-black" placeholder="DESCREVA O PLANO DE AÇÃO..." value={task.observation} onChange={(e) => {
                        const n = [...tasks]; n[idx].observation = e.target.value; setTasks(n);
                      }} />
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        {task.photos?.map((p, pIdx) => (
                          <div key={pIdx} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-indigo-500 relative">
                            <img src={p} className="w-full h-full object-cover" />
                            {!task.frozen && <button onClick={() => { const n = [...tasks]; n[idx].photos.splice(pIdx,1); setTasks(n); }} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 text-[10px]">X</button>}
                          </div>
                        ))}
                        
                        {!task.frozen && (
                          <label className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white text-2xl cursor-pointer shadow-lg border-2 border-white">
                            + <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                              const reader = new FileReader();
                              reader.onloadend = () => { const n = [...tasks]; n[idx].photos.push(reader.result); setTasks(n); };
                              // @ts-ignore
                              reader.readAsDataURL(e.target.files[0]);
                            }} />
                          </label>
                        )}
                      </div>
                    </>
                  )}
                  
                  {!task.frozen && (
                    <button onClick={() => freezeTaskTeste(idx)} className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-black italic">✓ TRAVAR TAREFA</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </main>

        <footer className="p-8 border-t border-slate-100">
          <button onClick={() => {
            const unfrozen = tasks.filter(t => !t.frozen).length;
            if (unfrozen > 0) return alert(`FALTAM ${unfrozen} TAREFAS PARA TRAVAR!`);
            
            setLoading(true); 
            setTimeout(() => { 
              alert('✅ SIMULAÇÃO CONCLUÍDA!\nOs dados foram processados localmente e descartados como planejado.'); 
              window.location.reload(); 
            }, 1500); 
          }} className="w-full py-6 bg-amber-500 text-black rounded-2xl text-xl shadow-xl font-black">
            {loading ? 'PROCESSANDO...' : 'FINALIZAR AUDITORIA DE TESTE'}
          </button>
        </footer>
      </div>
    </div>
  );
}