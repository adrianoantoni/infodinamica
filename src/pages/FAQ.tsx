
import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Search } from 'lucide-react';

const FAQ_ITEMS = [
  { q: "What are the available delivery times?", a: "We offer several shipping options. Standard delivery usually takes 3 to 5 business days, while express delivery can reach your address within 24 to 48 hours depending on your region." },
  { q: "How does the return policy work?", a: "Nexus provides a simple return process. You have 30 days from receiving your order to request a return. The product must be in its original packaging and unused." },
  { q: "Can I track my order in real-time?", a: "Yes, absolutely! Once your order is processed, a tracking code will be sent to your email and available in your customer panel under 'My Orders'." },
  { q: "Are the products original and certified?", a: "Every single item in our store is 100% original. We work directly with brands and authorized distributors to ensure the highest quality standards." },
  { q: "What payment methods are accepted?", a: "We accept all major credit cards, PayPal, Stripe, and localized methods like PIX for instant payments." }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center mb-20 space-y-4">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-200">
          <HelpCircle className="h-10 w-10" />
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Support Center</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">Find answers to the most common questions about our platform and services.</p>
        
        <div className="relative max-w-md mx-auto mt-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for a question..." 
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className={`bg-white rounded-3xl border transition-all duration-500 ${openIndex === idx ? 'border-indigo-600 shadow-xl shadow-indigo-500/5' : 'border-gray-100 hover:border-indigo-200'}`}>
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-8 text-left group"
            >
              <span className={`text-lg font-bold transition-colors ${openIndex === idx ? 'text-indigo-600' : 'text-gray-800'}`}>{item.q}</span>
              <div className={`p-2 rounded-xl transition-all ${openIndex === idx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-50'}`}>
                <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${openIndex === idx ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-8 pb-8 pt-0 text-gray-500 leading-relaxed border-t border-gray-50 mt-2 pt-6">
                {item.a}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 bg-gray-900 rounded-[3rem] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-6">
           <h3 className="text-3xl font-black">Still confused?</h3>
           <p className="text-gray-400 max-w-sm mx-auto">Our specialized support agents are available 24/7 to help you with any issue.</p>
           <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/50">
             <MessageCircle className="h-5 w-5" /> Chat with Us Now
           </button>
        </div>
      </div>
    </div>
  );
};
