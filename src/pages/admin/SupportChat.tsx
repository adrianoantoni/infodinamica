import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/api';
import { ChatMessage, User } from '@/types';
import { Send, User as UserIcon, Search, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

export const SupportChat: React.FC = () => {
  const { user: currentUser, formatPrice, addToast } = useApp();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll conversations list
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      interval = setInterval(() => fetchMessages(selectedUser.id), 5000); // Poll messages
    }
    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const data = await apiService.getAdminConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const data = await apiService.getMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setLoading(true);
    try {
      await apiService.sendMessage(newMessage, selectedUser.id);
      setNewMessage('');
      fetchMessages(selectedUser.id);
    } catch (error) {
      addToast('Erro ao enviar mensagem', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 p-4 md:p-8">
      {/* Sidebar - Conversations List */}
      <div className="w-full md:w-80 lg:w-96 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <MessageSquare className="text-indigo-600" /> Suporte Directo
          </h2>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Pesquisar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic text-sm space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Search size={24} className="text-gray-200" />
              </div>
              <p>Nenhum utilizador encontrado.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const lastMsg = (conv.messagesSent?.[0] || conv.messagesReceived?.[0]);
              const isSelected = selectedUser?.id === conv.id;
              const isOnline = conv.lastActive && (new Date().getTime() - new Date(conv.lastActive).getTime() < 5 * 60 * 1000);
              
              return (
                <button 
                  key={conv.id}
                  onClick={() => setSelectedUser(conv)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border group/item ${
                    isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-white border-transparent hover:bg-gray-50 active:scale-[0.98]'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-colors ${
                      isSelected ? 'bg-indigo-500' : 'bg-indigo-50 text-indigo-600 group-hover/item:bg-indigo-100'
                    }`}>
                      {conv.name.charAt(0)}
                    </div>
                    {isOnline && (
                      <div className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-black uppercase text-[10px] tracking-widest truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {conv.name}
                      </p>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {conv.role === 'CUSTOMER' ? 'Cliente' : 'Staff'}
                      </span>
                    </div>
                    <p className={`text-[9px] truncate mt-1.5 font-medium ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                      {lastMsg?.content || 'Sem mensagens anteriores'}
                    </p>
                  </div>
                  {(conv.messagesReceived?.[0]?.isRead === false) && !isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#fed700] ring-4 ring-[#fed700]/20 animate-pulse" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 flex flex-col overflow-hidden relative">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center h-24">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
                    {selectedUser.name.charAt(0)}
                  </div>
                  {selectedUser.lastActive && (new Date().getTime() - new Date(selectedUser.lastActive).getTime() < 5 * 60 * 1000) && (
                    <div className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-black italic uppercase tracking-tighter text-gray-900 leading-none">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    {selectedUser.lastActive && (new Date().getTime() - new Date(selectedUser.lastActive).getTime() < 5 * 60 * 1000) ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Online Agora</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-gray-300 shadow-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Offline</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden md:flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email do Cliente</p>
                  <p className="text-xs font-bold text-gray-900">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] group`}>
                    <div 
                      className={`p-4 rounded-3xl text-sm font-medium ${
                        msg.senderId === currentUser?.id 
                          ? 'bg-gray-900 text-white rounded-tr-none shadow-xl shadow-gray-200' 
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-2 mt-2 px-1 ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.senderId === currentUser?.id && (
                        <CheckCircle2 size={12} className={msg.isRead ? 'text-indigo-400' : 'text-gray-200'} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-50 flex gap-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva a sua resposta..."
                className="flex-1 bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 group active:scale-95"
              >
                <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-6">
            <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center">
              <MessageSquare size={48} className="text-gray-200" />
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-300">Central de Respostas</h3>
              <p className="max-w-xs mx-auto text-sm italic font-medium mt-2">Selecione uma conversa na lista lateral para começar a dar suporte aos seus clientes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
