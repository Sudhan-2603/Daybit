import React, { useState, useEffect } from 'react';
import { X, Share2, Mail, Check, AlertCircle } from 'lucide-react';
import { Task, Invite } from '../../types';
import { api } from '../../services/api';

interface InviteModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ task, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInvites();
    }
  }, [isOpen]);

  const loadInvites = async () => {
    try {
      const data = await api.getInvites();
      setInvites(data);
    } catch {
      // Ignored
    }
  };

  if (!isOpen || !task) return null;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setMessage(null);

    try {
      await api.inviteUser(task.id, email.trim());
      setMessage(`Invite sent successfully to ${email}!`);
      setEmail('');
      loadInvites();
    } catch (err: any) {
      setMessage(`Failed: ${err.message || 'Could not send invite'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (inviteId: string, state: 'accepted' | 'rejected') => {
    try {
      await api.respondToInvite(inviteId, state);
      loadInvites();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const taskInvites = invites.filter((inv) => inv.task_id === task.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Share Task
              </h3>
              <p className="text-xs text-slate-400">Invite collaborators via email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Preview */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase text-slate-400">Target Task</span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{task.name}</h4>
          </div>

          {message && (
            <div className="p-3 text-xs rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
              {message}
            </div>
          )}

          {/* Invite Form */}
          <form onSubmit={handleSendInvite} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Collaborator Email
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborator@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all"
              >
                Send
              </button>
            </div>
          </form>

          {/* Invites list */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Active Invites ({taskInvites.length})
            </span>
            {taskInvites.length === 0 ? (
              <p className="text-xs text-slate-400">No active invites for this task yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                {taskInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {inv.to_user}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${
                        inv.state === 'accepted' ? 'text-emerald-500' : inv.state === 'rejected' ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        {inv.state}
                      </span>
                    </div>

                    {inv.state === 'pending' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRespond(inv.id, 'accepted')}
                          className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(inv.id, 'rejected')}
                          className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold hover:bg-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

