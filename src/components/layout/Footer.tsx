
import React from 'react';
import { Truck, ShieldCheck, HelpCircle, Star, Facebook, Twitter, Instagram, Youtube, Send, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { siteSettings, invoiceSettings } = useApp();

  return (
    <footer className="bg-[#f7f7f7] border-t border-gray-200">
      {/* 1. Shipping Information Area */}
      <div className="max-w-7xl mx-auto px-4 py-20 border-b border-dashed border-gray-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="flex-shrink-0 bg-[#fed700] p-5 rounded-2xl shadow-md"><Truck size={36} /></div>
            <div>
              <h3 className="text-lg font-black text-[#242424]">Envio Grátis</h3>
              <p className="text-sm text-gray-500 mt-1">Para compras acima de 500.000,00 kz em todo Província.</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="flex-shrink-0 bg-[#fed700] p-5 rounded-2xl shadow-md"><ShieldCheck size={36} /></div>
            <div>
              <h3 className="text-lg font-black text-[#242424]">Compra Segura</h3>
              <p className="text-sm text-gray-500 mt-1">Seus pagamentos são 100% protegidos.</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="flex-shrink-0 bg-[#fed700] p-5 rounded-2xl shadow-md"><Star size={36} /></div>
            <div>
              <h3 className="text-lg font-black text-[#242424]">Confiança Total</h3>
              <p className="text-sm text-gray-500 mt-1">Garantia total de satisfação do cliente.</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="flex-shrink-0 bg-[#fed700] p-5 rounded-2xl shadow-md"><HelpCircle size={36} /></div>
            <div>
              <h3 className="text-lg font-black text-[#242424]">Suporte 24/7</h3>
              <p className="text-sm text-gray-500 mt-1">Dúvidas? Fale connosco a qualquer momento.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Links and Info */}
      <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
        <div className="space-y-8">
          {siteSettings.siteLogo ? (
            <img src={siteSettings.siteLogo} alt={siteSettings.siteName} className="h-12 w-auto object-contain" />
          ) : (
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
              {siteSettings.siteName}
            </h2>
          )}
          <p className="text-[15px] text-gray-500 leading-relaxed italic">"{siteSettings.siteDescription}"</p>
          <ul className="text-[15px] space-y-4 text-gray-600">
            <li className="flex items-start gap-3"><MapPin size={20} className="mt-1 flex-shrink-0 text-[#fed700]" /> {invoiceSettings.address}</li>
            <li className="flex items-center gap-3"><Phone size={20} className="flex-shrink-0 text-[#fed700]" /> +244 926 520 214 / +244 957 511 286</li>
            <li className="flex items-center gap-3"><Mail size={20} className="flex-shrink-0 text-[#fed700]" /> infodinamica036@gmail.com</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-black mb-8 text-[#242424] uppercase tracking-wider">Produtos</h3>
          <ul className="text-[15px] space-y-5 text-gray-600 font-bold">
            <li className="cursor-pointer hover:text-[#fed700] hover:translate-x-2 transition-all" onClick={() => onNavigate('home')}>Novos Produtos</li>
            <li className="cursor-pointer hover:text-[#fed700] hover:translate-x-2 transition-all" onClick={() => onNavigate('deals')}>Mais Vendidos</li>
            <li className="cursor-pointer hover:text-[#fed700] hover:translate-x-2 transition-all" onClick={() => onNavigate('contact')}>Contacto</li>
            <li className="cursor-pointer hover:text-[#fed700] hover:translate-x-2 transition-all">Política de Envio</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-black mb-8 text-[#242424] uppercase tracking-wider">A Empresa</h3>
          <ul className="text-[15px] space-y-5 text-gray-600 font-bold">
            <li className="cursor-pointer hover:text-[#fed700] hover:translate-x-2 transition-all" onClick={() => onNavigate('about')}>Sobre Nós</li>
            <li className="cursor-pointer hover:text-[#fed700] hover:translate-x-2 transition-all" onClick={() => onNavigate('faq')}>Perguntas Frequentes</li>
            <li className="cursor-pointer hover:text-[#fed700] hover:translate-x-2 transition-all">Termos de Uso</li>
            <li className="cursor-pointer hover:text-[#fed700] hover:translate-x-2 transition-all">Privacidade</li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-xl font-black mb-6 text-[#242424] uppercase tracking-wider">Redes Sociais</h3>
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-white shadow-md flex items-center justify-center rounded-xl text-blue-600 hover:bg-[#fed700] hover:text-white transition-all"><Facebook size={22} /></button>
            <button className="w-12 h-12 bg-white shadow-md flex items-center justify-center rounded-xl text-sky-400 hover:bg-[#fed700] hover:text-white transition-all"><Twitter size={22} /></button>
            <button className="w-12 h-12 bg-white shadow-md flex items-center justify-center rounded-xl text-pink-600 hover:bg-[#fed700] hover:text-white transition-all"><Instagram size={22} /></button>
            <button className="w-12 h-12 bg-white shadow-md flex items-center justify-center rounded-xl text-red-600 hover:bg-[#fed700] hover:text-white transition-all"><Youtube size={22} /></button>
          </div>
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-black text-[#242424] uppercase tracking-wider">Novidades</h3>
            <div className="flex gap-2">
              <input type="email" placeholder="Seu melhor e-mail" className="flex-1 bg-white px-5 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#fed700] shadow-inner" />
              <button className="bg-[#fed700] px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-[1850px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm text-gray-500 font-medium">&copy; {new Date().getFullYear()} {siteSettings.siteName}. Todos os Direitos Reservados.</p>
            <p className="text-xs text-gray-400 font-medium">Desenvolvido por <span className="font-bold text-gray-600">Infodinamica</span></p>
          </div>
          <div className="flex gap-6 items-center opacity-60">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};
