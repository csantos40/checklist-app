'use client';
import { useState, useEffect } from 'react';

export default function DebugTeste() {
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = () => {
      try {
        // @ts-ignore - Puxando das variáveis de ambiente globais
        const client = window.supabase.createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        setSupabase(client);
      } catch (err) {
        setError("Erro na configuração de ambiente do Supabase.");
      }
    };
    document.body.appendChild(script);
  }, []);

  const fetchOnlyTests = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('respostas')
        .select('*')
        .eq('setor', 'TESTE_SISTEMA')
        .order('created_at', { ascending: false });
      
      if (dbError) throw dbError;
      setTestData(data || []);
    } catch (err) {
      setError(`Erro de Banco: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabase) fetchOnlyTests();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-black p-8 font-sans text-white uppercase italic">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-yellow-500 pb-8 gap-4">
           <div>
             <h1 className="text-3xl font-black italic text-yellow-500 tracking-tighter">LABORATÓRIO DE DEPURAÇÃO</h1>
             <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Visualizando apenas: TESTE_SISTEMA</p>
           </div>
           <button onClick={fetchOnlyTests} className="bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black text-xs hover:bg-white transition-all shadow-xl active:scale-95">
             Sincronizar Agora
           </button>
        </header>

        {error && (
          <div className="bg-red-600 p-6 rounded-2xl mb-10 text-white font-black text-center shadow-2xl border-4 border-red-400">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center animate-pulse">
             <p className="font-black text-zinc-600 italic tracking-[0.3em]">ESTABELECENDO CONEXÃO SEGURA...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {testData.length > 0 ? testData.map((t, i) => (
              <div key={i} className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
                <div className="flex justify-between mb-4 text-[10px] font-black italic uppercase tracking-widest">
                  <span className="text-yellow-500">{new Date(t.created_at).toLocaleString('pt-BR')}</span>
                  <span className={`px-4 py-1 rounded-full ${t.status === 'Conforme' ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                    {t.status}
                  </span>
                </div>
                
                <h2 className="font-black text-2xl mb-4 leading-none tracking-tight text-white">{t.tarefa}</h2>
                
                {t.observacao && (
                  <div className="bg-black p-6 rounded-2xl border-l-8 border-yellow-500 mb-4 shadow-inner">
                    <p className="text-sm italic font-bold text-zinc-300">"{t.observacao}"</p>
                  </div>
                )}
                
                {t.foto_url && (
                  <div className="mt-6 rounded-[2rem] overflow-hidden border-2 border-zinc-800 shadow-2xl">
                    <img src={t.foto_url} className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500" alt="Evidência de Teste" />
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[3rem]">
                <p className="text-zinc-600 font-black italic uppercase tracking-widest">Nenhum dado de simulação encontrado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}