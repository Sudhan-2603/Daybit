import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

interface FeedbackEntry { id: string; text: string; createdAt: string; }
interface FeedbackModalProps { isOpen: boolean; onClose: () => void; }
const STORAGE_KEY = 'daybit.feedback';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<FeedbackEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as FeedbackEntry[]; } catch { return []; }
  });
  const [text, setText] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }, [entries]);
  if (!isOpen) return null;

  const addFeedback = (event: React.FormEvent) => {
    event.preventDefault();
    const message = text.trim();
    if (!message) return;
    setEntries((current) => [{ id: crypto.randomUUID(), text: message, createdAt: new Date().toISOString() }, ...current]);
    setText('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-linear-enter" onMouseDown={onClose}>
      <section className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white/95 shadow-2xl dark:border-zinc-800 dark:bg-black/95" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800"><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-zinc-500" /><h2 className="font-bold text-zinc-900 dark:text-white">Feedback</h2></div><button onClick={onClose} aria-label="Close feedback" className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"><X className="h-4 w-4" /></button></header>
        <form onSubmit={addFeedback} className="flex gap-2 border-b border-zinc-200/70 p-4 dark:border-zinc-800"><textarea value={text} onChange={(event) => setText(event.target.value)} rows={2} maxLength={1000} placeholder="Share feedback about Daybit…" className="min-w-0 flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white" /><button type="submit" disabled={!text.trim()} aria-label="Send feedback" className="self-end rounded-full bg-black p-3 text-white disabled:opacity-40 dark:bg-white dark:text-black"><Send className="h-4 w-4" /></button></form>
        <div className="space-y-2 overflow-y-auto p-4">
          {entries.length ? entries.map((entry) => <article key={entry.id} className="animate-card-enter rounded-2xl border border-zinc-200/80 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60"><p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">{entry.text}</p><time className="mt-2 block text-[10px] text-zinc-400">{new Date(entry.createdAt).toLocaleString()}</time></article>) : <p className="py-8 text-center text-sm text-zinc-500">No feedback yet. Add the first note above.</p>}
        </div>
        <p className="border-t border-zinc-200/70 px-4 py-2.5 text-[10px] text-zinc-400 dark:border-zinc-800">Feedback saved on this device.</p>
      </section>
    </div>
  );
};
