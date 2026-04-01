import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, ArrowRight, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { apiService } from '@/services/api';

interface ResetPasswordProps {
  token: string;
  onNavigateLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onNavigateLogin }) => {
  const { addToast, siteSettings } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await apiService.resetPassword(token, password);
      setIsSuccess(true);
      addToast('Senha redefinida com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao redefinir a senha', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100">
           <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
             <CheckCircle2 size={40} />
           </div>
           <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic mb-4">Senha Atualizada!</h2>
           <p className="text-gray-500 font-medium mb-8">
             A sua nova senha foi configurada com sucesso. Já pode entrar na sua conta.
           </p>
           <button 
             onClick={onNavigateLogin}
             className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
           >
             Ir para Login <ChevronLeft size={18} className="rotate-180" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10 flex flex-col items-center">
          {siteSettings.siteLogo && (
            <img src={siteSettings.siteLogo} alt={siteSettings.siteName} className="h-16 w-auto mb-4" />
          )}
          <h1 className="text-4xl font-black text-indigo-600 tracking-tighter italic">
            {siteSettings.siteName.split(' ')[0]}<span className="text-gray-900">{siteSettings.siteName.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Definir nova senha</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 md:p-14">
          <form onSubmit={handleSubmit} className="space-y-8">
             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2 font-black">Nova Senha</label>
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

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2 font-black">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                    />
                  </div>
                </div>
             </div>

             <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
             >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Atualizar Senha'}
                {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};
