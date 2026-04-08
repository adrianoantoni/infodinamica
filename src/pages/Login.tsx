
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Chrome, ChevronDown } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (role: string) => void;
  onNavigateHome: () => void;
  onNavigateForgotPassword: () => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateHome, onNavigateForgotPassword, onNavigateRegister }) => {
  const { login, siteSettings, userRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login({ email, password });
      
      // Get the role from localStorage because useApp state might not be updated yet
      const savedUser = JSON.parse(localStorage.getItem('nexus_user') || '{}');
      onLoginSuccess(savedUser.role?.toLowerCase() || userRole?.toLowerCase() || 'customer');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Verifique os seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 md:p-12">
      <div className="max-w-xl w-full">
        {/* Branding */}
        <div className="text-center mb-10 flex flex-col items-center">
          {siteSettings.siteLogo && (
            <img 
              src={siteSettings.siteLogo} 
              alt={siteSettings.siteName} 
              className="h-20 w-auto mb-4 cursor-pointer"
              onClick={onNavigateHome}
            />
          )}
          <h1 
            className="text-4xl md:text-5xl font-black text-indigo-600 cursor-pointer inline-block tracking-tighter italic"
            onClick={onNavigateHome}
          >
            {siteSettings.siteName.split(' ')[0]}<span className="text-gray-900">{siteSettings.siteName.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-gray-500 mt-3 font-medium text-lg">{siteSettings.siteDescription}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Endereço de Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 px-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Palavra-Passe</label>
                  <button 
                    type="button"
                    onClick={onNavigateForgotPassword}
                    className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 shadow-2xl shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'A Processar...' : 'Entrar no Painel'}
              {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]"><span className="bg-white px-4 text-gray-400 font-black">Acesso Seguro</span></div>
            </div>

            <button 
              type="button"
              onClick={onNavigateRegister}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-700 shadow-xl shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              Criar a Minha Conta
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              type="button"
              onClick={onNavigateHome}
              className="w-full py-5 border-2 border-indigo-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 group"
            >
              <ChevronDown className="h-5 w-5 rotate-90" />
              Voltar para a Home
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-medium text-gray-500 mt-10">
          Software: <span className="font-black text-indigo-600 uppercase tracking-widest">{siteSettings.siteName}</span>
        </p>
        <p className="text-center text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">
          Software: Infodinamica
        </p>
      </div>
    </div>
  );
};
