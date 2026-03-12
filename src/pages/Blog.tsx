
import React from 'react';
import { Calendar, User, ArrowRight, MessageCircle, Play, Music, Images, Search, Tag } from 'lucide-react';

const POSTS = [
  { id: 1, title: 'The Future of Wireless Audio: Lossless Streaming', date: 'Oct 24, 2023', author: 'Marcus Sterling', category: 'Tech', type: 'video', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', excerpt: 'Dive into the technological shifts that are finally bringing audiophile quality to wireless gear.' },
  { id: 2, title: '2024 Interior Design: Minimalist & Smart', date: 'Oct 20, 2023', author: 'Elena Rossi', category: 'Home', type: 'gallery', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80', excerpt: 'How smart appliances are being integrated into minimalist homes for a better living experience.' },
  { id: 3, title: 'Sustainable Supply Chain Mastery', date: 'Oct 15, 2023', author: 'David Chen', category: 'Business', type: 'article', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80', excerpt: 'Top strategies for effective inventory control in a modern e-commerce environment.' }
];

export const Blog: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      {/* Blog Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-10">
        <div className="space-y-6">
          <span className="px-4 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase tracking-[0.2em]">The Nexus Journal</span>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Insights for a <br/> Modern <span className="text-indigo-600">Lifestyle</span>.</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Search articles..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm shadow-sm" />
          </div>
          <div className="flex gap-2">
            {['All', 'Tech', 'Lifestyle', 'Business'].map(cat => (
              <button key={cat} className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border ${cat === 'All' ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-100'}`}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {POSTS.map(post => (
          <article key={post.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col">
            <div className="relative aspect-[16/11] overflow-hidden">
               <img src={post.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
               
               {/* Type Icon Overlay */}
               <div className="absolute top-6 left-6">
                 <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl flex items-center gap-2 shadow-sm">
                    {post.type === 'video' && <Play className="h-3 w-3 text-indigo-600 fill-current" />}
                    {post.type === 'gallery' && <Images className="h-3 w-3 text-indigo-600" />}
                    {post.type === 'article' && <Tag className="h-3 w-3 text-indigo-600" />}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{post.category}</span>
                 </div>
               </div>
            </div>

            <div className="p-10 flex-1 flex flex-col">
               <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {post.date}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                  <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {post.author}</span>
               </div>
               
               <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">{post.title}</h3>
               <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-10">{post.excerpt}</p>
               
               <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:translate-x-2 transition-transform">
                    Continue Reading <ArrowRight className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1.5 text-gray-400 font-bold text-xs">
                     <MessageCircle className="h-4 w-4" /> 8
                  </div>
               </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination / CTA */}
      <div className="mt-24 text-center space-y-8">
         <button className="px-12 py-5 bg-gray-900 text-white rounded-[1.5rem] font-bold hover:bg-black transition-all uppercase text-xs tracking-[0.2em] shadow-2xl">Load More Stories</button>
         <div className="flex justify-center items-center gap-3 text-gray-400 font-bold text-xs uppercase tracking-widest">
            <span>Page 1</span>
            <span className="w-12 h-px bg-gray-200"></span>
            <span className="text-indigo-600">Page 10</span>
         </div>
      </div>
    </div>
  );
};
