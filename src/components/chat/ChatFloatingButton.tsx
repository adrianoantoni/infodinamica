import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { apiService } from '../../services/api';
import { ChatMessage } from '../../types';
import { useApp } from '../../context/AppContext';

export const ChatFloatingButton: React.FC = () => {
  const { user, isLoggedIn } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for messages every 5 seconds when open
  useEffect(() => {
    let interval: any;
    if (isOpen && isLoggedIn && user?.role === 'customer') {
      fetchMessages();
      interval = setInterval(fetchMessages, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isLoggedIn, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // For customers, the "other user" is traditionally the admin (we can use a specific admin ID or a generic support ID)
      // For now, let's assume there's one main admin with a known ID or we fetch it.
      // Better: The backend could have a /api/chat/support endpoint for customers.
      // For this MVP, we'll fetch messages with 'admin-master' (placeholder) or the first admin found.
      const msgs = await apiService.getMessages('admin'); 
      setMessages(msgs);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await apiService.sendMessage(newMessage, 'admin');
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || user?.role !== 'customer') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-indigo-400">
                <div className="relative">
                  <User size={20} />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-indigo-500 rounded-full"></span>
                </div>
              </div>
              <div>
                <h3 className="font-bold">Nexus Assistant</h3>
                <span className="text-[10px] text-indigo-200 uppercase font-black tracking-widest">Suporte Inteligente</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-indigo-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="max-width-[80%] p-3 rounded-2xl text-sm bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none">
                    <p className="font-bold text-indigo-600 text-[10px] uppercase mb-1">Nexus Bot</p>
                    Olá! 👋 Sou o assistente virtual da Infodinâmica. Como posso ajudar com o seu pedido ou saldo hoje?
                    <div className="text-[10px] mt-1 text-gray-400 italic">Responda para iniciar uma conversa com os nossos operadores.</div>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-width-[80%] p-3 rounded-2xl text-sm ${
                      msg.senderId === user.id 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                    <div className={`text-[10px] mt-1 opacity-70 ${msg.senderId === user.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escreva sua mensagem..."
              className="flex-1 border-none focus:ring-0 text-sm py-2 px-0"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center relative"
        >
          <MessageCircle size={24} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
      )}
    </div>
  );
};
