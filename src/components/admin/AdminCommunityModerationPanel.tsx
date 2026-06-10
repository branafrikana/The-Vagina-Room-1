import React, { useState } from 'react';
import { Shield, Trash2, Check, X } from 'lucide-react';

export default function AdminCommunityModerationPanel() {
  const [threads, setThreads] = useState([
    { id: '1', title: 'New to the room!', author: 'member@example.com', flagCount: 0 },
    { id: '2', title: 'Question about holistic healing', author: 'user2@example.com', flagCount: 2 },
  ]);

  const deleteThread = (id: string) => {
    if (confirm("Are you sure you want to delete this thread?")) {
      setThreads(threads.filter(t => t.id !== id));
    }
  };

  return (
    <div className="p-6 bg-black/40 border border-white/5 rounded">
      <h2 className="text-xl font-black text-brand-gold mb-6 flex items-center gap-2">
        <Shield size={20} /> Community Moderation
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Title</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Author</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Flags</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-mono text-white/70">
            {threads.map(thread => (
              <tr key={thread.id} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b border-white/5">{thread.title}</td>
                <td className="px-4 py-3 border-b border-white/5">{thread.author}</td>
                <td className="px-4 py-3 border-b border-white/5 text-amber-500 font-bold">{thread.flagCount}</td>
                <td className="px-4 py-3 border-b border-white/5 flex gap-2">
                  <button onClick={() => deleteThread(thread.id)} className="text-red-400 hover:text-red-200"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
