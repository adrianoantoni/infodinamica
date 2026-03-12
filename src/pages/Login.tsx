
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Chrome } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (role: 'admin' | 'customer') => void;
  onNavigateHome: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulating authentication
    const role = isAdminMode ? 'admin' : 'customer';
    login(role);
    onLoginSuccess(role);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 md:p-12">
      <div className="max-w-xl w-full">
        {/* Branding */}
        <div className="text-center mb-10">
          <h1 
            className="text-4xl md:text-5xl font-black text-indigo-600 cursor-pointer inline-block tracking-tighter italic"
            onClick={onNavigateHome}
          >
            NEXUS<span className="text-gray-900">COMMERCE</span>
          </h1>
          <p className="text-gray-500 mt-3 font-medium text-lg">The future of e-commerce management.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-6 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${!isAdminMode ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <User className="h-5 w-5" /> Customer
            </button>
            <button 
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-6 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isAdminMode ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ShieldCheck className="h-5 w-5" /> Administrator
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Email Address</label>
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
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                  <a href="#" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Forgot?</a>
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

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 shadow-2xl shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              Sign In to Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]"><span className="bg-white px-4 text-gray-400 font-black">Secure Access</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 py-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest text-gray-600">
                <Chrome className="h-5 w-5 text-red-500" /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest text-gray-600">
                <User className="h-5 w-5 text-indigo-500" /> Guest
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm font-medium text-gray-500 mt-10">
          Don't have an account? <a href="#" className="text-indigo-600 font-black hover:underline uppercase tracking-tight">Create one for free</a>
        </p>
        <p className="text-center text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">
          Software: Infodinamica
        </p>
      </div>
    </div>
  );
};
