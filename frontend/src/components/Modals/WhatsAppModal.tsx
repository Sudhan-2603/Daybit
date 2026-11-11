import React, { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { api } from '../../services/api';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded?: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose, onTaskAdded }) => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'bot'; text: string; time: string }[]
  >([
    {
      sender: 'bot',
      text: '👋 Welcome to Daybit WhatsApp Assistant!\nYou can manage your tasks using:\n• add <name> | <place> | <date time>\n• list today\n• done <id>',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userCommand = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userCommand, time: now }]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '15550239999',
                    phone_number_id: '1099238475892',
                  },
                  messages: [
                    {
                      from: '1234567890',
                      id: `wamid.${Date.now()}`,
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      text: {
                        body: userCommand,
                      },
                      type: 'text',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const res = await api.postWhatsAppWebhook(payload);
      
      let botReply = '';
      if (res.action === 'add') {
        botReply = `✅ Created task: "${res.name}" in [${res.place || 'Work'}]!`;
        if (onTaskAdded) onTaskAdded();
      } else if (res.action === 'list') {
        botReply = `📋 Today's Tasks:\n• Homepage UI Design Draft (Work) [Progress: 0/4]\n• Product Catalog Layout (Work) [Progress: 2/4]\n• Payment Gateway Setup (Work) [Progress: 3/4]`;
      } else if (res.action === 'done') {
        botReply = `🎉 Marked task ${res.task_id} as Complete!`;
        if (onTaskAdded) onTaskAdded();
      } else {
        botReply = `❓ Command processed. Try:\n• add Buy groceries | Personal | 2026-11-12 10:00\n• list today\n• done <id>`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ Webhook Notice: ${err.message || 'Command executed'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCommand = (cmd: string) => {
    setInput(cmd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-linear-enter">
      <div 
        className="w-full max-w-lg backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col h-[600px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-black dark:text-white">Daybit WhatsApp Bot</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-zinc-400">WhatsApp Cloud API Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/70 dark:bg-zinc-950/80">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-line shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-xs'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-xs'
                }`}
              >
                {m.text}
                <span className="block text-[9px] text-zinc-400 text-right mt-1 font-mono">
                  {m.time}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-ping"></span>
              <span>Processing command...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Light Grey Capsules */}
        <div className="px-4 py-2 bg-white dark:bg-black border-t border-zinc-200/60 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Try:</span>
          <button
            onClick={() => handleQuickCommand('list today')}
            className="px-3 py-1 text-[11px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 whitespace-nowrap transition-colors duration-150"
          >
            list today
          </button>
          <button
            onClick={() => handleQuickCommand('add Review Design Mockup | Work | 2026-11-12 17:00')}
            className="px-3 py-1 text-[11px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 whitespace-nowrap transition-colors duration-150"
          >
            add Review Mockup | Work | 17:00
          </button>
          <button
            onClick={() => handleQuickCommand('done 1')}
            className="px-3 py-1 text-[11px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 whitespace-nowrap transition-colors duration-150"
          >
            done 1
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-black border-t border-zinc-200/60 dark:border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type WhatsApp command..."
            className="flex-1 px-4 py-2 text-xs rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-40 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
