'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PainelRH() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const router = useRouter();

  // 🚀 REDIRECIONAMENTO AUTOMÁTICO PARA DASHBOARD APÓS LOGIN
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  // 🛠️ A CORREÇÃO ESTÁ AQUI: handleLogout focado no RH
  const handleLogout = () => {
    localStorage.removeItem('user_auth'); // Remove a permissão
    setIsAuthenticated(false);
    setPassword('');
    // Forçamos o redirecionamento para a URL do RH, sem passar pela gestão
    window.location.href = "/rh"; 
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 italic font-black uppercase text-slate-900">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-t-8 border-indigo-600 text-center">
          <div className="mb-10 flex flex-col items-center">
            <div className="h-24 mb-6">
              <img src="/logo.png" alt="Logo Vivian" className="h-full w-auto object-contain" />
            </div>
            <h1 className="text-2xl tracking-tighter italic">Portal RH Vivian</h1>
            <p className="text-[10px] text-slate-400 mt-2 tracking-widest font-black italic">Acesso Exclusivo</p>
          </div>
          
          <input 
            type="password" 
            placeholder="SENHA RH" 
            className="w-full p-5 bg-slate-50 border-2 border-indigo-600 rounded-2xl text-center text-2xl mb-6 outline-none shadow-inner font-black italic text-slate-900" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && password === 'rh123' && (localStorage.setItem('user_auth', 'rh'), setIsAuthenticated(true))} 
          />
          
          <button 
            onClick={() => { 
              if(password === 'rh123') {
                localStorage.setItem('user_auth', 'rh');
                setIsAuthenticated(true);
              } else {
                alert('Senha Incorreta!');
              }
            }} 
            className="w-full bg-black text-white font-black py-6 rounded-2xl uppercase shadow-xl italic active:scale-95 transition-all"
          >
            Entrar no Portal
          </button>
        </div>
      </div>
    );
  }

  // Tela de transição antes de pular para a Dashboard
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 italic font-black uppercase text-white text-center">
        <img src="/logo.png" alt="Logo" className="h-24 mb-8 animate-bounce" />
        <h2 className="text-3xl tracking-tighter">LOGADO COM SUCESSO</h2>
        <p className="text-indigo-400 mt-4 animate-pulse">CARREGANDO DASHBOARD RH...</p>
        
        <button 
          onClick={handleLogout}
          className="mt-10 bg-red-600 text-white px-8 py-3 rounded-xl text-[10px] shadow-lg"
        >
          CANCELAR E SAIR
        </button>
    </div>
  );
}