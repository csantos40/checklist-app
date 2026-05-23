'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardDefinitiva() {
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState(''); 
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState(null);
  const [selectedSector, setSelectedSector] = useState('TODOS'); 
  const [statusFilter, setStatusFilter] = useState('TODOS'); 
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState(''); 
  const [selectedTask, setSelectedTask] = useState(null);
  
  // 🚀 NOVOS ESTADOS PARA A CAIXA DE OBSERVAÇÃO COMPARTILHADA
  const [comentarioGestao, setComentarioGestao] = useState('');
  const [salvandoComentario, setSalvandoComentario] = useState(false);
  
  const router = useRouter();

  const SETORES_FILTRO = ["Gerente", "SubGerente", "FLV", "Mercearia", "FLC (Frios e Laticínios)", "Padaria-Confeitaria-Rotisseria"];

  useEffect(() => {
    const authStatus = localStorage.getItem('user_auth');
    if (authStatus === 'direcao' || authStatus === 'rh' || authStatus === 'gerente' || authStatus === 'teste_sistema') {
      setAuthorized(true);
      setUserRole(authStatus || ''); 
    } else {
      router.push('/gestao'); 
    }

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      const client = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      setSupabase(client);
    };
    document.body.appendChild(script);
  }, [router]);

  const fetchData = async (client: any) => {
    if (!client) return;
    try {
      const { data } = await client
        .from('respostas')
        .select('*')
        .neq('setor', 'TESTE_SISTEMA')
        .order('created_at', { ascending: false });
      setReports(data || []);
    } catch (err) { console.error("Erro ao buscar dados:", err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!supabase || !authorized) return;

    fetchData(supabase);

    const channel = (supabase as any)
      .channel('db_changes_vivian')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'respostas' },
        () => {
          console.log('⚡ Mudança detectada! Atualizando Dashboard...');
          fetchData(supabase);
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [supabase, authorized]);

  // 🚀 CARREGA O COMENTÁRIO DO BANCO DE DADOS QUANDO ABRIR A TAREFA
  useEffect(() => {
    if (selectedTask) {
      setComentarioGestao((selectedTask as any).comentario_gestao || '');
    }
  }, [selectedTask]);

  // 🚀 FUNÇÃO PARA SALVAR O COMENTÁRIO NO SUPABASE
  const salvarComentario = async () => {
    if (!supabase || !selectedTask) return;
    
    setSalvandoComentario(true);
    try {
      const { error } = await (supabase as any)
        .from('respostas')
        .update({ comentario_gestao: comentarioGestao })
        .eq('setor', (selectedTask as any).setor)
        .eq('tarefa', (selectedTask as any).tarefa)
        .eq('created_at', (selectedTask as any).created_at);

      if (error) throw error;
      
      // Atualiza a tela imediatamente para não precisar recarregar
      const updatedReports: any = reports.map((r: any) => 
        r.created_at === (selectedTask as any).created_at && r.tarefa === (selectedTask as any).tarefa 
          ? { ...r, comentario_gestao: comentarioGestao } 
          : r
      );
      setReports(updatedReports);
      setSelectedTask({ ...selectedTask, comentario_gestao: comentarioGestao } as any);
      
      alert("✅ Observação salva com sucesso! Todos já podem ver.");
    } catch (err) {
      alert("❌ Erro ao salvar observação. Tente novamente.");
    } finally {
      setSalvandoComentario(false);
    }
  };

  const calcularSLA = (dataCriacao: any) => {
    if (!dataCriacao) return 0;
    const hoje = new Date();
    const criacao = new Date(dataCriacao);
    const diffTime = Math.abs(hoje.getTime() - criacao.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // 🚀 LÓGICA DO RADAR DO RH (Cálculo de Inadimplência)
  const calcularDiasSemPreencher = (dataIso: string | null) => {
    if (!dataIso) return Infinity;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    const criacao = new Date(dataIso);
    criacao.setHours(0, 0, 0, 0);
    const diffTime = hoje.getTime() - criacao.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const statusSetores = SETORES_FILTRO.map(setor => {
    const reportsSetor = reports.filter((r: any) => r.setor === setor);
    if (reportsSetor.length === 0) {
      return { setor, diasAtraso: Infinity, ultimaData: null };
    }
    const ultimoReport = reportsSetor[0]; 
    const diasAtraso = calcularDiasSemPreencher((ultimoReport as any).created_at);
    return { setor, diasAtraso, ultimaData: (ultimoReport as any).created_at };
  });

  const setoresAtrasados = statusSetores.filter(s => s.diasAtraso > 0);

  const handleLogout = () => {
    const role = localStorage.getItem('user_auth');
    localStorage.removeItem('user_auth');
    if (role === 'rh') window.location.href = '/rh';
    else if (role === 'gerente') window.location.href = '/';
    else if (role === 'teste_sistema') window.location.href = '/teste';
    else window.location.href = '/gestao';
  };

  const filteredReports = reports.filter((r: any) => {
    const matchSector = selectedSector === 'TODOS' || r.setor === selectedSector;
    const matchStatus = statusFilter === 'TODOS' || r.status === statusFilter;
    
    let matchDate = true;
    if (startDate || endDate) {
      const reportDate = new Date(r.created_at).toLocaleDateString('en-CA');
      if (startDate && endDate) {
        matchDate = reportDate >= startDate && reportDate <= endDate;
      } else if (startDate) {
        matchDate = reportDate >= startDate;
      } else if (endDate) {
        matchDate = reportDate <= endDate;
      }
    }
    
    return matchSector && matchStatus && matchDate;
  });

  const conformesCount = filteredReports.filter((r: any) => r.status === 'Conforme').length;
  const naoConformesCount = filteredReports.filter((r: any) => r.status === 'Não Conforme').length;
  const totalNoFiltro = filteredReports.length;
  const score = totalNoFiltro > 0 ? ((conformesCount / totalNoFiltro) * 100).toFixed(0) : 0;

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans uppercase italic font-black text-[#1E293B]">
      
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .printable-modal, .printable-modal * { visibility: visible; }
          .printable-modal { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto space-y-6 no-print">
        
        <header className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-center border border-slate-100 gap-4">
          <div className="flex items-center gap-4 text-[#1E293B]">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl tracking-tighter italic uppercase text-[#1E293B]">DASHBOARD CENTRAL</h1>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
             <div className="flex flex-col items-center">
                <p className="text-[7px] mb-1 text-slate-400">DATA INICIAL</p>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-100 p-2 rounded-xl text-[10px] font-black outline-none h-[46px]"
                />
             </div>
             
             <div className="flex flex-col items-center">
                <p className="text-[7px] mb-1 text-slate-400">DATA FINAL</p>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-100 p-2 rounded-xl text-[10px] font-black outline-none h-[46px]"
                />
             </div>

             <button onClick={() => setStatusFilter(statusFilter === 'Conforme' ? 'TODOS' : 'Conforme')} className={`px-4 py-2 rounded-xl border transition-all text-center min-w-[100px] ${statusFilter === 'Conforme' ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-green-50 border-green-100 text-green-700'}`}>
                <p className="text-[7px]">CONFORMES</p>
                <p className="text-xl">{conformesCount}</p>
             </button>
             <button onClick={() => setStatusFilter(statusFilter === 'Não Conforme' ? 'TODOS' : 'Não Conforme')} className={`px-4 py-2 rounded-xl border transition-all text-center min-w-[100px] ${statusFilter === 'Não Conforme' ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-red-50 border-red-100 text-red-700'}`}>
                <p className="text-[7px]">PENDÊNCIAS</p>
                <p className="text-xl">{naoConformesCount}</p>
             </button>
             <div className="bg-[#0F172A] px-6 py-2 rounded-xl text-white shadow-lg text-center min-w-[120px] flex flex-col justify-center">
                <p className="text-[7px] text-indigo-400 uppercase">SCORE PERÍODO</p>
                <p className="text-2xl">{score}%</p>
             </div>
          </div>

          <div className="flex gap-2">
            {(userRole === 'gerente' || userRole === 'teste_sistema') && (
              <button onClick={() => router.push(userRole === 'gerente' ? '/' : '/teste')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[9px] shadow-md hover:bg-indigo-700 transition-all font-black uppercase italic">📋 TAREFAS</button>
            )}
            <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-3 rounded-xl text-[9px] shadow-md flex items-center gap-2 hover:bg-green-700 transition-all font-black uppercase italic">🖨️ IMPRIMIR</button>
            <button onClick={handleLogout} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[9px] shadow-md font-black uppercase italic">SAIR</button>
          </div>
        </header>

        {/* 🚀 RADAR DO RH - ALERTA DE INADIMPLÊNCIA */}
        {setoresAtrasados.length > 0 && (
          <div className="bg-red-50 border-2 border-red-500 rounded-[2rem] p-6 shadow-sm no-print mb-6">
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl animate-pulse">⚠️</div>
               <div>
                 <h2 className="text-red-700 text-lg font-black uppercase italic tracking-tighter">Radar RH: Inadimplência</h2>
                 <p className="text-red-500 text-[10px] uppercase font-bold italic">Setores que não realizaram a auditoria hoje</p>
               </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {setoresAtrasados.map(s => (
                <div key={s.setor} className="bg-white border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm min-w-[200px]">
                   <div className="flex-1">
                     <p className="text-xs text-slate-800 font-black uppercase italic leading-tight">{s.setor}</p>
                     <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-1">
                       Último envio: {s.ultimaData ? new Date(s.ultimaData).toLocaleDateString() : 'Nunca Preenchido'}
                     </p>
                   </div>
                   <div className="bg-red-100 text-red-700 px-3 py-2 rounded-xl text-center">
                     <p className="text-xl font-black italic leading-none">{s.diasAtraso === Infinity ? '∞' : s.diasAtraso}</p>
                     <p className="text-[6px] uppercase font-black italic">Dias Atrás</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100">
          <button onClick={() => {setSelectedSector('TODOS'); setStatusFilter('TODOS'); setStartDate(''); setEndDate('');}} className={`px-4 py-2 rounded-lg text-[9px] border-2 transition-all ${selectedSector === 'TODOS' && statusFilter === 'TODOS' && startDate === '' && endDate === '' ? 'bg-black text-white border-black' : 'bg-white text-slate-400 border-slate-50'}`}>RESETAR TUDO</button>
          {SETORES_FILTRO.map(setor => (
            <button key={setor} onClick={() => setSelectedSector(setor)} className={`px-4 py-2 rounded-lg text-[9px] border-2 transition-all ${selectedSector === setor ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-50'}`}>{setor}</button>
          ))}
        </div>

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReports.map((item: any, idx: number) => {
            const diasAtraso = calcularSLA(item.created_at);
            const fotos = item.foto_url ? String(item.foto_url).split(',').filter((f: any) => f.trim().length > 5) : [];
            
            return (
              <div key={idx} onClick={() => setSelectedTask(item)} className={`bg-white p-5 rounded-[2.5rem] shadow-xl border-t-[8px] flex flex-col gap-4 transition-all cursor-pointer hover:scale-[1.02] ${item.status === 'Não Conforme' ? 'border-red-500' : 'border-green-500'}`}>
                <div className="w-full h-40 overflow-hidden rounded-xl bg-slate-100 relative">
                  {fotos.length > 0 ? (
                    <img src={fotos[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[7px] text-slate-300 italic uppercase font-black">Sem Foto Registrada</div>
                  )}

                  {item.status === 'Não Conforme' && (
                    <div className={`absolute bottom-2 left-2 px-3 py-1 rounded-lg text-[8px] font-black shadow-lg ${diasAtraso > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-black'}`}>
                      {diasAtraso === 0 ? 'POSTADO HOJE' : `${diasAtraso} DIAS EM ABERTO`}
                    </div>
                  )}

                  <div className={`absolute top-2 right-2 text-white text-[7px] px-2 py-1 rounded-md shadow-md font-black ${item.status === 'Não Conforme' ? 'bg-red-600' : 'bg-green-600'}`}>
                    {item.status}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-indigo-600 text-[8px] font-black uppercase italic">{new Date(item.created_at).toLocaleDateString()} • {item.setor}</p>
                    <p className="font-bold text-xs leading-tight uppercase line-clamp-2 text-[#1E293B]">{item.tarefa}</p>
                  </div>

                  <div className="space-y-2">
                    {(item.status === 'Não Conforme' || item.observacao_resolucao) && (
                      <div className="bg-red-50 p-3 rounded-2xl border-l-4 border-red-500">
                         <p className="text-[6px] text-red-500 font-black uppercase italic">Ocorrência:</p>
                         <p className="text-[10px] font-bold text-slate-700 italic leading-tight">"{item.observacao || 'SEM DESCRIÇÃO'}"</p>
                      </div>
                    )}

                    {item.observacao_resolucao && (
                      <div className="bg-green-50 p-3 rounded-2xl border-l-4 border-green-500">
                         <p className="text-[6px] text-green-600 font-black uppercase italic">Tratativa Efetuada:</p>
                         <p className="text-[10px] font-bold text-green-800 italic leading-tight">"{item.observacao_resolucao}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300 no-scrollbar overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in duration-300 printable-modal">
            <div className="absolute top-6 right-6 z-10 flex gap-2 no-print">
              <button onClick={() => window.print()} className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shadow-xl hover:bg-green-700 transition-all">🖨️</button>
              <button onClick={() => setSelectedTask(null)} className="bg-white text-[#1E293B] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black shadow-xl hover:bg-red-600 hover:text-white transition-all">✕</button>
            </div>

            <div className="md:w-1/2 h-[350px] md:h-auto bg-slate-200">
              {(selectedTask as any).foto_url && String((selectedTask as any).foto_url).length > 5 ? (
                <img src={String((selectedTask as any).foto_url).split(',')[0]} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-black italic uppercase">Imagem Não Registrada</div>
              )}
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
              <div className="mb-8 text-[#1E293B]">
                <span className={`px-4 py-2 rounded-full text-[10px] font-black text-white ${(selectedTask as any).status === 'Não Conforme' ? 'bg-red-600' : 'bg-green-600'}`}>
                  {(selectedTask as any).status}
                </span>
                <h2 className="text-2xl font-black leading-tight italic uppercase mt-4 text-[#1E293B]">{(selectedTask as any).tarefa}</h2>
                <p className="text-indigo-600 text-[10px] mt-4 font-black italic uppercase">{(selectedTask as any).setor} • {new Date((selectedTask as any).created_at).toLocaleDateString()}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 p-6 rounded-[2rem] border-l-8 border-red-500">
                  <p className="text-[8px] text-red-600 mb-2 font-black uppercase italic">Análise do Problema:</p>
                  <p className="text-sm font-bold italic text-slate-900 leading-relaxed uppercase">" {(selectedTask as any).observacao || 'NÃO DESCRITO'} "</p>
                </div>

                {(selectedTask as any).observacao_resolucao && (
                  <div className="bg-green-50 p-6 rounded-[2rem] border-l-8 border-green-500">
                    <p className="text-[8px] text-green-600 mb-2 font-black uppercase italic">Tratativa de Resolução:</p>
                    <p className="text-sm font-bold italic text-green-900 leading-relaxed uppercase">" {(selectedTask as any).observacao_resolucao} "</p>
                    <p className="text-[7px] text-green-500 mt-2 font-black italic">FINALIZADO EM: {new Date((selectedTask as any).resolvido_em).toLocaleString()}</p>
                  </div>
                )}
                
                {/* 🚀 NOVA CAIXA COMPARTILHADA (Aparece para pendências) */}
                {(selectedTask as any).status === 'Não Conforme' && (
                  <div className="bg-amber-100 p-6 rounded-[2rem] border-l-8 border-amber-400 mt-4 no-print">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-[8px] text-amber-700 font-black uppercase italic">📌 Observações da Gestão / Comunicação</p>
                       <p className="text-[6px] text-amber-600 font-black uppercase italic bg-amber-200 px-2 py-1 rounded">Visível a Todos</p>
                    </div>
                    <textarea
                      value={comentarioGestao}
                      onChange={(e) => setComentarioGestao(e.target.value)}
                      placeholder="Escreva orientações ou questionamentos sobre esta pendência..."
                      className="w-full bg-white/70 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 outline-none focus:bg-white transition-all min-h-[100px] italic font-bold placeholder:text-amber-400"
                    />
                    
                    <div className="flex justify-end mt-3">
                      <button 
                        onClick={salvarComentario}
                        disabled={salvandoComentario || comentarioGestao === ((selectedTask as any).comentario_gestao || '')}
                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase italic shadow-md transition-all ${salvandoComentario || comentarioGestao === ((selectedTask as any).comentario_gestao || '') ? 'bg-amber-300 text-amber-600' : 'bg-amber-500 text-black hover:scale-105 active:scale-95'}`}
                      >
                        {salvandoComentario ? 'Salvando...' : 'Salvar Observação'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-16 pt-8 border-t-2 border-slate-100 hidden print:block">
                <div className="flex justify-between gap-10">
                   <div className="flex-1 border-t border-black text-center pt-2">
                      <p className="text-[8px] font-black uppercase italic">Assinatura Encarregado</p>
                   </div>
                   <div className="flex-1 border-t border-black text-center pt-2">
                      <p className="text-[8px] font-black uppercase italic">Assinatura Auditoria</p>
                   </div>
                </div>
              </div>

              <button onClick={() => setSelectedTask(null)} className="mt-10 w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-xl italic uppercase no-print">Fechar Análise</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}