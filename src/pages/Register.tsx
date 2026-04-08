
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/api';
import { User, Mail, Lock, Phone, MapPin, Building2, Hash, ChevronDown, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const PROVINCIAS_ANGOLA = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Lunda Norte', 'Lunda Sul',
  'Luanda', 'Malange', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

interface RegisterProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
  onRegisterSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateLogin, onNavigateHome, onRegisterSuccess }) => {
  const { siteSettings, addToast } = useApp();
  const [isEmpresa, setIsEmpresa] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    provincia: '',
    companyName: '',
    nif: '',
    municipio: '',
    bairro: '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return 'O nome é obrigatório.';
    if (!form.email.trim()) return 'O email é obrigatório.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email inválido.';
    if (!form.password) return 'A senha é obrigatória.';
    if (form.password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (form.password !== form.confirmPassword) return 'As senhas não coincidem.';
    if (!form.phone.trim()) return 'O número de telefone é obrigatório.';
    if (!form.provincia) return 'Selecione a sua província.';
    if (isEmpresa) {
      if (!form.companyName.trim()) return 'O nome da empresa é obrigatório.';
      if (!form.nif.trim()) return 'O NIF é obrigatório.';
      if (!form.municipio.trim()) return 'O município é obrigatório.';
      if (!form.bairro.trim()) return 'O bairro é obrigatório.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        provincia: form.provincia,
        municipio: isEmpresa ? form.municipio : null,
        bairro: isEmpresa ? form.bairro : null,
        companyName: isEmpresa ? form.companyName : null,
        nif: isEmpresa ? form.nif : null,
        customerType: isEmpresa ? 'Empresa' : 'Regular',
      });

      setSuccess(true);
      addToast('Conta criada com sucesso! Faça login para continuar.', 'success');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100 animate-bounce">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter uppercase">Conta Criada!</h2>
          <p className="text-gray-500 mb-8 font-medium">A sua conta foi registada com sucesso. Faça login para começar a usar a plataforma.</p>
          <button
            onClick={onNavigateLogin}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-3"
          >
            Ir para o Login <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full">
        {/* Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          {siteSettings.siteLogo && (
            <img
              src={siteSettings.siteLogo}
              alt={siteSettings.siteName}
              className="h-16 w-auto mb-3 cursor-pointer"
              onClick={onNavigateHome}
            />
          )}
          <h1
            className="text-3xl md:text-4xl font-black text-indigo-600 cursor-pointer tracking-tighter italic"
            onClick={onNavigateHome}
          >
            {siteSettings.siteName.split(' ')[0]}<span className="text-gray-900">{siteSettings.siteName.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-sm">Crie a sua conta para começar a comprar</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* Account Type Toggle */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setIsEmpresa(false)}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!isEmpresa ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <User className="h-4 w-4" /> Particular
            </button>
            <button
              onClick={() => setIsEmpresa(true)}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isEmpresa ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Building2 className="h-4 w-4" /> Empresa
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-5">
            {/* Row: Name */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">
                {isEmpresa ? 'Nome do Responsável' : 'Nome Completo'} *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                />
              </div>
            </div>

            {/* Row: Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="nome@email.com"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">Telefone *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+244 9XX XXX XXX"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Row: Password + Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">Confirmar Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="Repetir a senha"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Provincia */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">Província *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.provincia}
                  onChange={(e) => updateField('provincia', e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm appearance-none cursor-pointer"
                >
                  <option value="">Selecionar Província</option>
                  {PROVINCIAS_ANGOLA.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Empresa-specific fields */}
            {isEmpresa && (
              <div className="space-y-5 pt-2 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-2 pt-3">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Dados da Empresa</span>
                </div>

                {/* Company Name + NIF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">Nome da Empresa *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => updateField('companyName', e.target.value)}
                        placeholder="Razão social"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">NIF *</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.nif}
                        onChange={(e) => updateField('nif', e.target.value)}
                        placeholder="Número de Identificação Fiscal"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Municipio + Bairro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">Município *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.municipio}
                        onChange={(e) => updateField('municipio', e.target.value)}
                        placeholder="Nome do município"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-2">Bairro *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.bairro}
                        onChange={(e) => updateField('bairro', e.target.value)}
                        placeholder="Nome do bairro"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center animate-pulse">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-indigo-600 text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 shadow-2xl shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  A Criar Conta...
                </>
              ) : (
                <>
                  Criar a Minha Conta
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]"><span className="bg-white px-4 text-gray-400 font-black">Já tem conta?</span></div>
            </div>

            {/* Login Link */}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="w-full py-5 border-2 border-indigo-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-3"
            >
              Entrar na Minha Conta
            </button>
          </form>
        </div>

        <p className="text-center text-xs font-bold text-gray-400 mt-8 uppercase tracking-widest">
          Software: Infodinamica
        </p>
      </div>
    </div>
  );
};
