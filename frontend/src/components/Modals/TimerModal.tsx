import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Flag, Timer as TimerIcon, Watch, Plus } from 'lucide-react';
import { audioService } from '../../services/audio';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');

  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [timerRemaining, setTimerRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('60');

  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            audioService.playRingtone('chime');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerRemaining]);

  useEffect(() => {
    let interval: any;
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchMs;
      interval = setInterval(() => {
        setStopwatchMs(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  const handleSetPreset = (minutes: number) => {
    setIsTimerRunning(false);
    setTimerDuration(minutes * 60);
    setTimerRemaining(minutes * 60);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerRemaining(timerDuration);
  };

  const handleResetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isStopwatchRunning) {
      setLaps([stopwatchMs, ...laps]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-linear-enter">
      <div 
        className="w-full max-w-sm backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-full border border-zinc-200/80 dark:border-zinc-800">
            <button
              onClick={() => setMode('timer')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 ease-linear ${
                mode === 'timer'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-500'
              }`}
            >
              <TimerIcon className="w-3.5 h-3.5" />
              <span>Timer</span>
            </button>
            <button
              onClick={() => setMode('stopwatch')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 ease-linear ${
                mode === 'stopwatch'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-500'
              }`}
            >
              <Watch className="w-3.5 h-3.5" />
              <span>Stopwatch</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'timer' && (
          <div className="p-6 flex flex-col items-center">
            {/* Light Grey Presets Capsules */}
            <div className="flex items-center gap-2 mb-6">
              {[5, 15, 25, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetPreset(mins)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ease-linear ${
                    timerDuration === mins * 60
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80'
                  }`}
                >
                  {mins}m
                </button>
              ))}
              <div className="flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-0.5">
                <input
                  aria-label="Custom timer minutes"
                  type="number"
                  min="1"
                  max="999"
                  value={customMinutes}
                  onChange={(event) => setCustomMinutes(event.target.value)}
                  className="w-12 bg-transparent text-center text-[11px] text-zinc-700 dark:text-zinc-200 outline-none"
                />
                <button
                  type="button"
                  title="Set custom timer"
                  onClick={() => {
                    const minutes = Math.min(999, Math.max(1, Number(customMinutes) || 1));
                    setCustomMinutes(String(minutes));
                    handleSetPreset(minutes);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-black text-white dark:bg-white dark:text-black"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative w-48 h-48 rounded-full border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6">
              <div className="text-center">
                <span className={`text-4xl font-black tracking-tight font-mono ${
                  timerRemaining === 0
                    ? 'text-red-600 dark:text-red-500 animate-pulse'
                    : 'text-black dark:text-white'
                }`}>
                  {timerRemaining === 0 ? '00.0' : formatTimer(timerRemaining)}
                </span>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                  {timerRemaining === 0 ? 'Completed' : isTimerRunning ? 'Running' : 'Ready'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleResetTimer}
                className="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-150"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 text-xs font-bold text-white shadow-xs transition-all duration-150 active:scale-95 ${
                  isTimerRunning ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-black dark:bg-white dark:text-black hover:opacity-90'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {mode === 'stopwatch' && (
          <div className="p-6 flex flex-col items-center">
            <div className="my-6 text-center">
              <span className="text-4xl font-black text-red-600 dark:text-red-500 tracking-tight font-mono">
                {formatStopwatch(stopwatchMs)}
              </span>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                Stopwatch
              </span>
            </div>

            <div className="flex items-center gap-3 w-full mb-4">
              <button
                onClick={handleResetStopwatch}
                className="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleLap}
                disabled={!isStopwatchRunning}
                className="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors"
                title="Record Lap"
              >
                <Flag className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 text-xs font-bold text-white shadow-xs transition-all duration-150 active:scale-95 ${
                  isStopwatchRunning ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-black dark:bg-white dark:text-black hover:opacity-90'
                }`}
              >
                {isStopwatchRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </button>
            </div>

            {laps.length > 0 && (
              <div className="w-full max-h-36 overflow-y-auto no-scrollbar border-t border-zinc-100 dark:border-zinc-800 pt-2 space-y-1">
                {laps.map((lapTime, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-3 rounded-full bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-700 dark:text-zinc-300"
                  >
                    <span>Lap {laps.length - idx}</span>
                    <span className="font-bold">{formatStopwatch(lapTime)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
