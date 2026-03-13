
import React from 'react';
import { 
  ShieldCheck, Cloud, Code2, HeadphonesIcon, 
  Lightbulb, Target, Award, Zap, ChevronRight,
  Monitor, Cpu, Users, Building2
} from 'lucide-react';

const services = [
  {
    icon: Code2,
    title: 'Desenvolvimento de Software',
    desc: 'Projetamos soluções de software sob medida — desde aplicações empresariais e plataformas de e-commerce até sistemas de gestão internos — robustos, escaláveis e seguros.'
  },
  {
    icon: Monitor,
    title: 'Venda de Equipamentos',
    desc: 'Comercializamos computadores, telemóveis, periféricos, electrodomésticos e equipamentos de segurança das melhores marcas globais, com garantia e suporte técnico.'
  },
  {
    icon: Building2,
    title: 'Consultoria em TI',
    desc: 'Analisamos a infraestrutura tecnológica da sua empresa e oferecemos consultoria especializada para otimizar processos, reduzir custos e implementar as melhores práticas.'
  },
  {
    icon: ShieldCheck,
    title: 'Segurança da Informação',
    desc: 'Implementamos políticas e sistemas de cibersegurança para proteger os dados e operações da sua empresa, incluindo auditorias, gestão de riscos e proteção contra ameaças.'
  },
  {
    icon: Cloud,
    title: 'Serviços em Cloud',
    desc: 'Apoiamos a migração e gestão dos seus serviços em nuvem (IaaS, PaaS, SaaS), proporcionando escalabilidade, flexibilidade e economia de custos operacionais.'
  },
  {
    icon: HeadphonesIcon,
    title: 'Suporte e Manutenção de TI',
    desc: 'Prestamos suporte técnico contínuo e monitorização da sua infraestrutura, garantindo operações eficientes, seguras e com mínimo tempo de inatividade.'
  },
];

const differentials = [
  { icon: Lightbulb, title: 'Inovação Constante', desc: 'Estamos sempre atualizados com as últimas tendências tecnológicas para entregar o que há de melhor.' },
  { icon: Target, title: 'Atendimento Personalizado', desc: 'Trabalhamos em estreita colaboração com cada cliente para entender profundamente as suas necessidades.' },
  { icon: Award, title: 'Compromisso com a Qualidade', desc: 'Garantimos entregas dentro do prazo, com a mais alta qualidade e que gerem valor real para o cliente.' },
  { icon: Zap, title: 'Suporte Especializado', desc: 'Equipa de profissionais altamente capacitados, disponível para resolver qualquer questão com rapidez.' },
];

const stats = [
  { icon: Cpu, val: '51+', label: 'Produtos Disponíveis' },
  { icon: Users, val: '500+', label: 'Clientes Satisfeitos' },
  { icon: Award, val: '5+', label: 'Anos de Experiência' },
  { icon: ShieldCheck, val: '99.9%', label: 'Uptime do Serviço' },
];

export const AboutUs: React.FC = () => {
  return (
    <div className="space-y-20 py-12 sm:py-20 overflow-hidden">

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-6 relative">
          <div className="absolute -left-8 -top-8 text-indigo-50 -z-10 font-black text-[8rem] sm:text-[12rem] select-none leading-none">INFO</div>
          <span className="inline-block px-4 py-1.5 bg-[#fed700] text-gray-900 text-xs font-black rounded-full uppercase tracking-widest">
            Quem Somos
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
            Tecnologia e <br/>
            <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Inovação</span> ao seu alcance.
          </h1>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-medium max-w-lg">
            A <strong className="text-gray-900">INFODINAMICA</strong> é uma empresa angolana especializada na <strong>venda de equipamentos eletrónicos e informáticos</strong> e na <strong>prestação de serviços de TI</strong>. Com uma equipa qualificada e foco total no cliente, oferecemos soluções tecnológicas que impulsionam o crescimento dos nossos parceiros.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="tel:+244926520214" className="bg-[#242424] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-600 transition-all">
              Contacte-nos
            </a>
            <span className="flex items-center gap-2 px-6 py-4 font-bold text-indigo-600 text-sm">
              09:00 – 22:00, Seg–Dom <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
        <div className="relative hidden sm:block">
          <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
              alt="Equipa INFODINAMICA"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-[#fed700] rounded-[2.5rem] -z-0 flex items-center justify-center p-8 text-gray-900 shadow-2xl">
            <div className="text-center">
              <p className="text-5xl font-black">5+</p>
              <p className="text-xs font-black uppercase tracking-widest mt-1">Anos de Experiência</p>
            </div>
          </div>
          <div className="absolute top-8 -left-8 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 text-center space-y-3 shadow-sm hover:shadow-xl transition-all">
              <s.icon className="h-7 w-7 text-indigo-600 mx-auto" />
              <p className="text-3xl sm:text-4xl font-black text-gray-900">{s.val}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission statement */}
      <div className="bg-[#242424] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 select-none font-black text-[20rem] text-white flex items-center justify-center overflow-hidden leading-none pointer-events-none">INFO</div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <span className="inline-block px-4 py-1.5 bg-[#fed700] text-gray-900 text-xs font-black rounded-full uppercase tracking-widest mb-6">Nossa Missão</span>
          <p className="text-xl sm:text-3xl font-black text-white leading-relaxed">
            "Ser o parceiro tecnológico de confiança das empresas angolanas, contribuindo para o seu crescimento através de equipamentos de qualidade e soluções de TI inovadoras."
          </p>
          <p className="text-gray-400 mt-6 font-medium text-sm sm:text-base">
            — INFODINAMICA · Vendas de Produtos Informáticos e Prestação de Serviços
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-widest mb-4">O Que Fazemos</span>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter">Nossos Serviços</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Differentials */}
      <div className="bg-indigo-600 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-xs font-black rounded-full uppercase tracking-widest mb-4">Porque nos Escolher</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">Nosso Diferencial</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentials.map((d, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/20 transition-all group">
                <div className="w-12 h-12 bg-[#fed700] rounded-2xl flex items-center justify-center text-gray-900 mb-5 group-hover:scale-110 transition-transform shadow-xl">
                  <d.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-white mb-3">{d.title}</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gray-50 rounded-[3rem] p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-block px-4 py-1.5 bg-[#fed700] text-gray-900 text-xs font-black rounded-full uppercase tracking-widest">Pronto para Começar?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter">
              Venha conhecer a INFODINAMICA pessoalmente.
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Visitamos, aconselhamos e entregamos. Seja para uso pessoal, profissional ou empresarial — da escolha do equipamento à instalação e suporte técnico, estamos consigo.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
            <a href="tel:+244926520214" className="bg-[#242424] text-white px-10 py-5 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-600 transition-all text-center uppercase tracking-widest">
              +244 926 520 214
            </a>
            <a href="mailto:infodinamica036@gmail.com" className="bg-[#fed700] text-gray-900 px-10 py-5 rounded-2xl font-black text-sm shadow-xl hover:bg-yellow-400 transition-all text-center uppercase tracking-widest text-xs">
              infodinamica036@gmail.com
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
