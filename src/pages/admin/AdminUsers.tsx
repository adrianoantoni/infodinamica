import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Mail, Trash2, Edit2, Plus, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const AdminUsers: React.FC = () => {
  const { addToast } = useApp();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'GERENTE', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      addToast('Erro ao carregar equipa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await apiService.updateUser({ id: editingUser.id, ...formData });
        addToast('Utilizador atualizado com sucesso!', 'success');
      } else {
        if (!formData.password) {
          addToast('A password inicial é obrigatória', 'error');
          return;
        }
        await apiService.createUser(formData);
        addToast('Utilizador criado com sucesso!', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      addToast(err.message || 'Erro ao guardar utilizador', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja mesmo eliminar este utilizador? Esta ação não pode ser desfeita.')) return;
    try {
      await apiService.deleteUser(id);
      addToast('Utilizador eliminado com sucesso', 'success');
      fetchUsers();
    } catch (err: any) {
      addToast(err.message || 'Erro ao eliminar utilizador', 'error');
    }
  };

  const openNewUserModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'GERENTE', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração de Equipa</h1>
          <p className="text-gray-500 text-sm">Faça a gestão dos administradores, gerentes e lojistas.</p>
        </div>
        <button 
          onClick={openNewUserModal}
          className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-100"
        >
          <UserPlus className="h-4 w-4" /> Novo Membro
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 font-medium">A carregar detalhes da equipa...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Utilizador / Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Perfil / Permissões</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Data Registo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full w-fit ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'GERENTE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      <Shield className="h-3 w-3" /> {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                       <Edit2 className="h-4 w-4" />
                     </button>
                     <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                       <Trash2 className="h-4 w-4" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">
                {editingUser ? 'Editar Conta Staff' : 'Nova Conta Staff'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome Completo</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">E-Mail (Login)</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Perfil de Acesso</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                  <option value="ADMIN">Administrador (Total)</option>
                  <option value="GERENTE">Gerente (Gestão & Relatórios)</option>
                  <option value="VENDEDOR">Vendedor (Operação de Loja)</option>
                  <option value="CUSTOMER">Cliente (Acesso ao Portal)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between">
                  <span>Senha de Acesso</span>
                  {editingUser && <span className="font-normal text-indigo-500 lowercase normal-case">(Opcional para edição)</span>}
                </label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? "Deixe em branco para manter a atual" : "••••••••"} required={!editingUser} className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-colors">
                  Guardar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
