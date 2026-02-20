'use client';
import { useState, useEffect } from 'react';

const DEPARTMENTS_CREDENTIALS: Record<string, string> = {
  'Diretoria': 'dir123', 
  'Gerente': 'ger123',   
  'SubGerente': 'sub123',
  'FLV': 'flv123',
  'Mercearia': 'mer123',
  'FLC (Frios e Laticínios)': 'flc123'
};

export default function Dashboard() {
  const [userRole, setUserRole] = useState<'NONE' | 'GERENTE' | 'DIRETORIA'>('NONE');
  const [passInput, setPassInput] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const handleLogin = () => {
    if (passInput === DEPARTMENTS_CREDENTIALS['Gerente']) setUserRole('GERENTE');
    else if (passInput === DEPARTMENTS_CREDENTIALS['Diretoria']) setUserRole('DIRETORIA');
    else alert('Senha incorreta! Acesso negado.');
  };

  useEffect(() => {
    if (userRole !== 'NONE') {
      async function fetchReports() {
        try {
          const res = await fetch('/api/checklist');
          const data = await res.json();
          setReports(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          setReports([]);
        } finally {
          setLoading(false);
        }
      }
      fetchReports();
    }
  }, [userRole]);

  if (userRole === 'NONE') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl text-center border-t-8 border-slate-900">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl mb-6 mx-auto shadow-xl font-black italic">D</div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Portal Executivo</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 mb-8 italic">Direção & Gerência</p>
          <input 
            type="password" 
            placeholder="Senha de Acesso" 
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-slate-900 mb-6 text-center shadow-inner"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest italic">Acessar Dashboard</button>
        </div>
      </div>
    );
  }

  // CÁLCULOS PARA O GRÁFICO COMPARATIVO
  const sectorStats = reports.reduce((acc: any, report) => {
    const dept = report.departamento;
    const errors = report.itens?.filter((i: any) => i.status === 'Não Conforme').length || 0;
    acc[dept] = (acc[dept] || 0) + errors;
    return acc;
  }, {});

  const totalItems = reports.reduce((acc, report) => acc + (report.itens?.length || 0), 0);
  const totalConforme = reports.reduce((acc, report) => acc + (report.itens?.filter((i: any) => i.status === 'Conforme').length || 0), 0);
  const totalNaoConforme = reports.reduce((acc, report) => acc + (report.itens?.filter((i: any) => i.status === 'Não Conforme').length || 0), 0);
  const complianceRate = totalItems > 0 ? ((totalConforme / totalItems) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-left w-full border-l-8 border-slate-900 pl-6">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic text-slate-900">Dashboard Unidade</h1>
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em] mt-2 italic">Acesso: <span className="text-slate-900 underline">{userRole}</span></p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {userRole === 'GERENTE' && (
              <button onClick={() => setShowConfig(!showConfig)} className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg uppercase italic">
                {showConfig ? 'Relatórios' : 'Senhas'}
              </button>
            )}
            <button onClick={() => window.print()} className="bg-white text-slate-900 border-2 border-slate-900 px-8 py-4 rounded-2xl font-black text-xs shadow-md uppercase italic">PDF</button>
          </div>
        </header>

        {showConfig && userRole === 'GERENTE' ? (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-slate-100 animate-in zoom-in duration-300">
             <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter italic text-slate-800">Senhas de Acesso Operacional</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {Object.keys(DEPARTMENTS_CREDENTIALS).map((dept) => (
                 <div key={dept} className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">{dept}</label>
                   <input type="text" defaultValue={DEPARTMENTS_CREDENTIALS[dept as keyof typeof DEPARTMENTS_CREDENTIALS]} className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 outline-none focus:border-slate-900" />
                 </div>
               ))}
             </div>
          </div>
        ) : (
          <>
            {/* COMPARATIVO DE ERROS POR SETOR (GRÁFICO SIMULADO) */}
            <div className="bg-white p-10 rounded-[3rem] shadow-lg mb-12 border border-slate-100">
              <h3 className="text-lg font-black uppercase italic mb-8 border-b-2 border-slate-100 pb-4">Ranking de Não Conformidades por Setor</h3>
              <div className="space-y-6">
                {Object.keys(sectorStats).map(dept => (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase italic text-slate-600">
                      <span>{dept}</span>
                      <span>{sectorStats[dept]} Ocorrências</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-slate-900 rounded-full transition-all duration-1000 shadow-lg" 
                        style={{ width: `${(sectorStats[dept] / totalNaoConforme) * 100 || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-2 italic tracking-widest">Aprovação Final</p>
                <p className="text-6xl font-black tracking-tighter italic">{complianceRate}%</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-green-500 text-green-600">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-2 italic">Total Conformes</p>
                <p className="text-5xl font-black tracking-tighter">{totalConforme}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-red-500 text-red-600">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-2 italic">Total Não Conformes</p>
                <p className="text-5xl font-black tracking-tighter">{totalNaoConforme}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
              {reports.map((report) => 
                (report.itens || []).filter((i: any) => i.status === 'Não Conforme').map((item: any, idx: number) => (
                  <div key={`${report.id}-${idx}`} className="bg-white p-8 rounded-[3rem] shadow-xl flex flex-col md:flex-row gap-8 border border-slate-50 print:mb-8 print:shadow-none print:border-slate-200">
                    {item.photo && (
                      <div className="w-full md:w-56 h-56 shrink-0 overflow-hidden rounded-[2.5rem] border-4 border-white shadow-lg">
                        <img src={item.photo} alt="Evidência" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <span className="text-[10px] font-black bg-red-600 text-white px-4 py-1.5 rounded-full uppercase mb-4 inline-block shadow-lg italic">NÃO CONFORME</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">{report.departamento} • {new Date(report.created_at).toLocaleDateString()}</p>
                      <p className="font-black text-slate-800 mb-6 text-lg leading-tight italic">{item.description}</p>
                      <div className="bg-slate-50 p-5 rounded-2xl border-l-8 border-slate-900 shadow-inner italic text-xs text-slate-600 font-black">"{item.observation}"</div>
                    </div>
                  </div>
                ))
              ).flat()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}