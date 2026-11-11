import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [clearOnNext, setClearOnNext] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyboard = (event: KeyboardEvent) => {
      if (/^[0-9.]$/.test(event.key)) {
        event.preventDefault();
        setDisplay((current) => clearOnNext ? event.key : current === '0' ? event.key : current + event.key);
        setClearOnNext(false);
      } else if (['+', '-', '*', '/'].includes(event.key)) {
        event.preventDefault();
        setExpression(`${display} ${event.key} `);
        setClearOnNext(true);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        setDisplay((current) => current.length > 1 ? current.slice(0, -1) : '0');
      } else if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        if (!expression) return;
        try {
          const formula = `${expression}${display}`.replace(/[^0-9+\-*/.]/g, '');
          const result = Function(`"use strict"; return (${formula})`)();
          setExpression(`${expression}${display} =`);
          setDisplay(String(Number(result.toFixed(6))));
          setClearOnNext(true);
        } catch {
          setDisplay('Error');
          setClearOnNext(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isOpen, display, expression, clearOnNext, onClose]);

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    if (clearOnNext) {
      setDisplay(d);
      setClearOnNext(false);
    } else {
      setDisplay(display === '0' ? d : display + d);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(`${display} ${op} `);
    setClearOnNext(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setClearOnNext(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay((val / 100).toString());
  };

  const handleEqual = () => {
    try {
      if (!expression) return;
      const fullExpr = expression + display;
      const sanitized = fullExpr.replace(/[^0-9+\-*/.]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      setExpression(`${fullExpr} =`);
      setDisplay(String(Number(result.toFixed(6))));
      setClearOnNext(true);
    } catch {
      setDisplay('Error');
      setClearOnNext(true);
    }
  };

  const buttons = [
    { label: 'C', onClick: handleClear, className: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold' },
    { label: '⌫', onClick: handleBackspace, className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200' },
    { label: '%', onClick: handlePercent, className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200' },
    { label: '÷', onClick: () => handleOperator('/'), className: 'bg-black text-white dark:bg-white dark:text-black font-bold text-base' },

    { label: '7', onClick: () => handleDigit('7'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '8', onClick: () => handleDigit('8'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '9', onClick: () => handleDigit('9'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '×', onClick: () => handleOperator('*'), className: 'bg-black text-white dark:bg-white dark:text-black font-bold text-base' },

    { label: '4', onClick: () => handleDigit('4'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '5', onClick: () => handleDigit('5'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '6', onClick: () => handleDigit('6'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '-', onClick: () => handleOperator('-'), className: 'bg-black text-white dark:bg-white dark:text-black font-bold text-base' },

    { label: '1', onClick: () => handleDigit('1'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '2', onClick: () => handleDigit('2'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '3', onClick: () => handleDigit('3'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '+', onClick: () => handleOperator('+'), className: 'bg-black text-white dark:bg-white dark:text-black font-bold text-base' },

    { label: '0', onClick: () => handleDigit('0'), className: 'col-span-2 bg-white dark:bg-zinc-900 text-black dark:text-white' },
    { label: '.', onClick: () => handleDigit('.'), className: 'bg-white dark:bg-zinc-900 text-black dark:text-white font-bold' },
    { label: '=', onClick: handleEqual, className: 'bg-emerald-600 text-white font-bold text-base' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-linear-enter">
      <div 
        className="w-full max-w-xs backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Calculator</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 bg-zinc-50 dark:bg-zinc-950/80 text-right border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="text-xs font-medium text-zinc-400 h-5 truncate">{expression}</div>
          <div className="text-3xl font-extrabold text-black dark:text-white tracking-tight overflow-x-auto no-scrollbar">
            {display}
          </div>
        </div>

        <div className="p-4 grid grid-cols-4 gap-2 bg-zinc-50/50 dark:bg-black">
          {buttons.map((b, idx) => (
            <button
              key={idx}
              onClick={b.onClick}
              className={`h-11 rounded-full flex items-center justify-center text-xs font-semibold border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:opacity-90 active:scale-95 transition-all duration-150 ease-linear ${b.className}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
