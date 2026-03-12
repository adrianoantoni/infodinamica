
import React from 'react';
import { Users, Globe, Award, ShieldCheck, ChevronRight, Target, Heart, Zap } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="space-y-32 py-24 overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8 relative">
          <div className="absolute -left-12 -top-12 text-indigo-50/50 -z-10 font-black text-[12rem] select-none">NXS</div>
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-widest">Our DNA</span>
          <h1 className="text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">Redefining the <br/> <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Standard</span> of Quality.</h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-lg font-medium">Nexus Commerce isn't just an online store. We are a technology hub dedicated to curating the finest products and ensuring they reach you with unmatched efficiency.</p>
          <div className="flex flex-wrap gap-4">
             <button className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:bg-black transition-all">Work with us</button>
             <button className="flex items-center gap-2 px-8 py-4 font-bold text-indigo-600 hover:translate-x-2 transition-all">Explore our vision <ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl relative z-10 border-[16px] border-white">
             <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" alt="Office Culture" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-indigo-600 rounded-[3rem] -z-0 flex items-center justify-center p-12 text-white">
             <div className="text-center">
                <p className="text-5xl font-black">10+</p>
                <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-80">Years of Experience</p>
             </div>
          </div>
          <div className="absolute top-10 -left-10 w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-40"></div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-indigo-600 py-32 relative">
         <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
               <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Our Core Values</h2>
               <div className="w-24 h-1.5 bg-white/20 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { icon: Target, title: 'Precision', desc: 'Every detail in our supply chain is optimized for speed and accuracy.' },
                 { icon: Heart, title: 'Customer First', desc: 'We build relationships, not just transactions. Your satisfaction is our North Star.' },
                 { icon: Zap, title: 'Innovation', desc: 'Constant improvement of our platform to provide a seamless shopping experience.' }
               ].map((v, i) => (
                 <div key={i} className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/20 transition-all group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform shadow-xl">
                       <v.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{v.title}</h3>
                    <p className="text-indigo-100 leading-relaxed text-sm">{v.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Stats and Culture */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 grid grid-cols-2 gap-8">
            {[
              { icon: Globe, label: 'Operating Countries', val: '45+' },
              { icon: Users, label: 'Global Employees', val: '1.2k' },
              { icon: Award, label: 'Global Awards', val: '24' },
              { icon: ShieldCheck, label: 'Store Points', val: '99.9%' }
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col justify-center text-center space-y-3">
                <stat.icon className="h-8 w-8 text-indigo-600 mx-auto" />
                <p className="text-4xl font-black text-gray-900">{stat.val}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
         </div>
         <div className="bg-gray-900 rounded-[3rem] p-12 text-white flex flex-col justify-center space-y-8 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mb-16 -mr-16 blur-3xl"></div>
            <h3 className="text-3xl font-black leading-tight">Ready to join the revolution?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">We are always looking for talented individuals to join our global remote team.</p>
            <button className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all uppercase text-xs tracking-widest">View Openings</button>
         </div>
      </div>
    </div>
  );
};
