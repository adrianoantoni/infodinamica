
import React from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Twitter, Facebook, MessageSquare, Clock, Globe } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-20 items-start">
        {/* Left: Contact Hub */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">Connect with us</span>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-none">Let's <br/> <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-8">Talk.</span></h1>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">Whether it's a technical query, a bulk order request, or just saying hello, we are all ears.</p>
          </div>

          <div className="grid grid-cols-1 gap-10">
            <div className="flex gap-5 items-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                 <Mail className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Support</p>
                  <p className="font-black text-gray-900 text-lg">support@nexus.io</p>
               </div>
            </div>
            
            <div className="flex gap-5 items-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform">
                 <Phone className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Call Center</p>
                  <p className="font-black text-gray-900 text-lg">+44 (0) 20 1234 5678</p>
               </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[2.5rem] p-10 space-y-6">
             <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2"><Clock className="h-4 w-4" /> Office Hours</h4>
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-400 font-bold">Mon - Fri</span>
                   <span className="text-gray-900 font-black">08:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-400 font-bold">Saturday</span>
                   <span className="text-gray-900 font-black">09:00 AM - 05:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-400 font-bold">Sunday</span>
                   <span className="text-red-500 font-black uppercase">Closed</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Modern Form */}
        <div className="lg:col-span-3">
          <form className="bg-white p-10 sm:p-16 rounded-[4rem] shadow-2xl shadow-indigo-500/10 border border-gray-50 space-y-8 relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] flex items-center justify-center -z-0">
                <MessageSquare className="h-8 w-8 text-indigo-200" />
             </div>
             
             <div className="relative z-10 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Full Name</label>
                    <input type="text" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900" placeholder="e.g. John Wick" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900" placeholder="john@nexus.io" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                  <select className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900 appearance-none">
                    <option>General Inquiry</option>
                    <option>Order Support</option>
                    <option>Partnership Proposal</option>
                    <option>Report an Issue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                  <textarea rows={6} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900 resize-none" placeholder="Describe how we can assist you..."></textarea>
                </div>

                <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95">
                  <Send className="h-4 w-4" /> Ship My Message
                </button>
             </div>
          </form>
          
          <div className="mt-12 flex items-center justify-center gap-10">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-4 w-4" /> We support 25+ Languages
             </p>
             <div className="flex gap-4">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <button key={i} className="text-gray-300 hover:text-indigo-600 transition-colors">
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
