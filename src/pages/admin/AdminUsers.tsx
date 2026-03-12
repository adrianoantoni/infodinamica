
import React from 'react';
import { UserPlus, Shield, Mail, MoreVertical, Key } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const users = [
    { id: 1, name: 'Admin Master', email: 'admin@nexus.com', role: 'Super Admin', status: 'Active', lastLogin: '2 mins ago' },
    { id: 2, name: 'Joana Silva', email: 'joana.s@nexus.com', role: 'Inventory Manager', status: 'Active', lastLogin: '1 hour ago' },
    { id: 3, name: 'Carlos Santos', email: 'carlos.finance@nexus.com', role: 'Operator', status: 'Offline', lastLogin: 'Yesterday' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Team</h1>
          <p className="text-gray-500 text-sm">Manage staff accounts and access permissions.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-indigo-100">
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full w-fit">
                    <Shield className="h-3 w-3 text-indigo-500" /> {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase ${user.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.status}
                    </span>
                    <span className="text-[10px] text-gray-400">Last seen: {user.lastLogin}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-2 text-gray-400 hover:text-indigo-600"><Key className="h-4 w-4" /></button>
                   <button className="p-2 text-gray-400 hover:text-indigo-600"><MoreVertical className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
