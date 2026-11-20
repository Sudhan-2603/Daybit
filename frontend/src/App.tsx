import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { TabBar } from './components/TabBar';
import type { MainTab } from './components/TabBar';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { BoardView } from './components/Views/BoardView';
import { ListView } from './components/Views/ListView';
import { EmptyTasksView } from './components/Views/EmptyTasksView';
import { CalendarView } from './components/Views/CalendarView';
import { DashboardView } from './components/Views/DashboardView';
import { ProfileView } from './components/Views/ProfileView';
import { SettingsView } from './components/Views/SettingsView';

import { TaskModal } from './components/Modals/TaskModal';
import { ReminderNotificationModal } from './components/Modals/ReminderNotificationModal';
import { CalculatorModal } from './components/Modals/CalculatorModal';
import { TimerModal } from './components/Modals/TimerModal';
import { WhatsAppModal } from './components/Modals/WhatsAppModal';
import { AuthModal } from './components/Modals/AuthModal';
import { InviteModal } from './components/Modals/InviteModal';
import { ProfileModal } from './components/Modals/ProfileModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import type { TasksViewMode } from './components/Modals/SettingsModal';
import { SuccessToast } from './components/Modals/SuccessToast';
import { FeedbackModal } from './components/Modals/FeedbackModal';

import type { Task, Place, TaskStatus, User, DashboardStats, CreateTaskDto, UpdateTaskDto } from './types';
import { api } from './services/api';
import { wsService } from './services/websocket';

const mergeTasksById = (...groups: Task[][]): Task[] => {
  const unique = new Map<string, Task>();
  groups.flat().forEach((task) => { if (!unique.has(task.id)) unique.set(task.id, task); });
  return [...unique.values()];
};

export function App() {
  // App & User State
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Tab State: Tasks (Unified from kanban/board/list), Calendar, Dashboard
  const [activeTab, setActiveTab] = useState<MainTab>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | 'All'>('All');

  // Modals State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus | undefined>();
  const [defaultDate, setDefaultDate] = useState<string | undefined>();

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderTask, setReminderTask] = useState<Task | null>(null);

  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteTask, setInviteTask] = useState<Task | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [sectionTransition, setSectionTransition] = useState<'enter' | 'exit'>('enter');
  const sectionTransitionTimer = useRef<number | null>(null);
  const wsUnsubscribe = useRef<(() => void) | null>(null);
  const [tasksViewMode, setTasksViewMode] = useState<TasksViewMode>(() =>
    (localStorage.getItem('daybit.tasksViewMode') as TasksViewMode) || 'kanban'
  );
  const [darkBg, setDarkBg] = useState(() => localStorage.getItem('daybit.darkBg') || 'pure-black');
  const [lightBg, setLightBg] = useState(() => localStorage.getItem('daybit.lightBg') || 'pure-white');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('daybit.fontFamily') || 'Inter');
  const [language, setLanguage] = useState(() => localStorage.getItem('daybit.language') || 'en');
  const [backgroundAccent, setBackgroundAccent] = useState(() => localStorage.getItem('daybit.backgroundAccent') || 'neutral');
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(() => localStorage.getItem('daybit.whatsapp_enabled') === 'true');

  useEffect(() => {
    const fonts: Record<string, string> = {
      Inter: "'Inter', sans-serif",
      Roboto: "'Roboto', sans-serif",
      Outfit: "'Outfit', sans-serif",
      'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
      'JetBrains Mono': "'JetBrains Mono', monospace",
      Poppins: "'Poppins', sans-serif",
      'Noto Sans Tamil': "'Noto Sans Tamil', sans-serif",
      'Noto Sans Telugu': "'Noto Sans Telugu', sans-serif",
      'Noto Sans Devanagari': "'Noto Sans Devanagari', sans-serif",
    };
    const selectedFont = fonts[fontFamily] || fonts.Inter;
    document.documentElement.style.fontFamily = selectedFont;
    document.body.style.fontFamily = selectedFont;
    document.documentElement.style.setProperty('--app-font', selectedFont);
    document.documentElement.lang = language;
  }, [fontFamily, language]);

  useEffect(() => {
    const darkColorHex: Record<string, string> = {
      'pure-black': '#000000',
      'deep-carbon': '#09090b',
      'slate-midnight': '#0f172a',
      'dark-navy': '#030712',
      'deep-forest': '#051c14',
      'deep-plum': '#180816',
    };
    const lightColorHex: Record<string, string> = {
      'pure-white': '#ffffff',
      'warm-cream': '#fafaf9',
      'soft-mist': '#f8fafc',
      'ice-blue': '#f0f9ff',
      'mint-fresh': '#f0fdf4',
      'rose-whisper': '#fff1f2',
    };
    const activeColor = darkMode ? (darkColorHex[darkBg] || '#000000') : (lightColorHex[lightBg] || '#ffffff');
    document.documentElement.style.backgroundColor = activeColor;
    document.body.style.backgroundColor = activeColor;
  }, [darkMode, darkBg, lightBg]);
  const accentHex: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', amber: '#f59e0b', rose: '#f43f5e', violet: '#8b5cf6' };
  const accentOverlay = accentHex[backgroundAccent] ? `radial-gradient(ellipse at top right, ${accentHex[backgroundAccent]}20, transparent 55%)` : undefined;

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Load Initial Data
  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      let currentUser: User | null = null;
      if (api.isDesktopApp() || !api.hasRemoteBackend()) {
        currentUser = api.enableOfflineMode();
      } else {
        try {
          currentUser = await api.getMe();
        } catch {
          const storedUser = api.getUser();
          if (storedUser) {
            currentUser = storedUser;
          } else {
            // Seamless offline fallback: never lock user out when network/backend is absent
            currentUser = api.enableOfflineMode();
          }
        }
      }
      setUser(currentUser);

      try {
        const [fetchedTasks, fetchedStats] = await Promise.all([
          api.getTasks(),
          api.getDashboardStats(),
        ]);
        setTasks(mergeTasksById(fetchedTasks));
        setStats(fetchedStats);
      } catch (loadErr) {
        console.warn('Initial task sync deferred:', loadErr);
      }

      setupWebSocket();
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setupWebSocket = () => {
    if (api.isOfflineSession()) return;
    const token = api.getToken();
    if (!token) return;

    wsUnsubscribe.current?.();
    wsService.connect(token);
    wsService.onConnected(() => setWsConnected(true));
    wsService.onDisconnected(() => setWsConnected(false));

    wsUnsubscribe.current = wsService.subscribe((event) => {
      switch (event.type) {
        case 'TaskCreated':
          setTasks((prev) => mergeTasksById([event.task], prev));
          refreshDashboard();
          break;

        case 'TaskUpdated':
          setTasks((prev) => mergeTasksById([event.task], prev.filter((task) => task.id !== event.task.id)));
          refreshDashboard();
          break;

        case 'TaskDeleted':
          setTasks((prev) => prev.filter((t) => t.id !== event.task_id));
          refreshDashboard();
          break;

        case 'TaskReminder':
          setReminderTask(event.task);
          setReminderModalOpen(true);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Daybit reminder: ${event.task.name}`, { body: 'Your task reminder is due.' });
          }
          break;
      }
    });
  };

  useEffect(() => {
    initialize();

    return () => {
      wsService.disconnect();
      wsUnsubscribe.current?.();
      wsUnsubscribe.current = null;
      if (sectionTransitionTimer.current !== null) window.clearTimeout(sectionTransitionTimer.current);
    };
  }, [initialize]);

  const changeTabWithTransition = (tab: MainTab) => {
    if (tab === activeTab) return;
    if (sectionTransitionTimer.current !== null) window.clearTimeout(sectionTransitionTimer.current);
    setSectionTransition('exit');
    sectionTransitionTimer.current = window.setTimeout(() => {
      setActiveTab(tab);
      setSectionTransition('enter');
      sectionTransitionTimer.current = null;
    }, 180);
  };

  const refreshDashboard = async () => {
    try {
      const updated = await api.getDashboardStats();
      setStats(updated);
    } catch {
      // Ignored
    }
  };

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const tagsArray: string[] = Array.isArray(task.tags)
        ? task.tags
        : typeof task.tags === 'string'
        ? (() => {
            try {
              const p = JSON.parse(task.tags);
              return Array.isArray(p) ? p : [task.tags];
            } catch {
              return [task.tags];
            }
          })()
        : [];

      const matchSearch =
        searchQuery === '' ||
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tagsArray.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPlace =
        selectedPlace === 'All' || task.place === selectedPlace;

      return matchSearch && matchPlace;
    });
  }, [tasks, searchQuery, selectedPlace]);

  // Handler: Status Update (via Drag and Drop)
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const updated = await api.updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
      refreshDashboard();
    } catch (err) {
      console.error('Failed to update task status:', err);
      const fresh = await api.getTasks();
      setTasks(mergeTasksById(fresh));
    }
  };

  // Handler: Save Task
  const handleSaveTask = async (
    taskData: CreateTaskDto | UpdateTaskDto,
    isEdit: boolean,
    taskId?: string
  ) => {
    try {
      if (isEdit && taskId) {
        const updated = await api.updateTask(taskId, taskData as UpdateTaskDto);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updated : t))
        );
      } else {
        const created = await api.createTask(taskData as CreateTaskDto);
        setTasks((prev) => mergeTasksById([created], prev));
      }
      if (!isEdit) setSuccessToastOpen(true);
      refreshDashboard();
    } catch (err: any) {
      alert(`Error saving task: ${err.message}`);
    }
  };

  const handleToggleComplete = useCallback((task: Task) => {
    const status: TaskStatus = task.status === 'Complete' ? 'In Progress' : 'Complete';
    const previousStatus = task.status;
    const previousProgress = task.progress_done;
    const progress_done = status === 'Complete' ? (task.progress_total || 4) : 0;
    // Instant 0ms optimistic response
    setTasks((prev) => prev.map((item) => item.id === task.id ? { ...item, status, progress_done } : item));
    // Asynchronous background persistence
    api.updateTask(task.id, { status, progress_done }).catch((err) => {
      console.error('Failed to sync task completion:', err);
      setTasks((prev) => prev.map((item) => item.id === task.id ? { ...item, status: previousStatus, progress_done: previousProgress } : item));
    });
  }, []);

  const handleRequestNotification = async (task: Task) => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }
    const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    if (permission === 'granted') {
      new Notification('Daybit notifications enabled', { body: `Reminders for “${task.name}” can now appear here.` });
    } else {
      alert('Notifications are blocked. Enable them in your browser settings to receive task reminders.');
    }
  };

  // Handler: Delete Task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      refreshDashboard();
    } catch (err: any) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  // Handler: Reminder Responses (Accept, Remind, Reject)
  const handleReminderAction = async (taskId: string, action: 'accept' | 'remind' | 'reject') => {
    try {
      const updated = await api.respondToReminder(taskId, action);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
      setReminderModalOpen(false);
      setReminderTask(null);
      refreshDashboard();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setTasks([]);
    setStats(null);
    setAuthModalOpen(true);
  };

  return (
    <div
      className="min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-250 ease-linear antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800"
      style={{
        backgroundColor: darkMode ? (darkBg === 'pure-black' ? '#000000' : '#18181b') : (lightBg === 'pure-white' ? '#ffffff' : '#f4f4f5'),
        backgroundImage: [accentOverlay, darkMode
          ? darkBg === 'dark-mesh' ? 'linear-gradient(135deg, #18181b, #000000, #27272a)' : undefined
          : lightBg === 'light-mist' ? 'linear-gradient(135deg, #ffffff, #f4f4f5, #e4e4e7)' : undefined].filter(Boolean).join(', ') || undefined,
      }}
    >
      {/* Frosted Glass Header with Compact Search & Filter */}
      <Navbar
        user={user}
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setDefaultStatus(undefined);
          setDefaultDate(undefined);
          setTaskModalOpen(true);
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        wsConnected={wsConnected}
        onOpenProfile={() => changeTabWithTransition('profile')}
        onOpenSettings={() => changeTabWithTransition('settings')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPlace={selectedPlace}
        onPlaceChange={setSelectedPlace}
        searchResults={filteredTasks}
        onSelectSearchResult={(task) => {
          setTaskToEdit(task);
          setTaskModalOpen(true);
          setSearchQuery('');
        }}
      />

      {/* Frosted Glass Floating Capsule Bar (Clean & Focused on Navigation/Tools) */}
      <TabBar
        activeTab={activeTab}
        onChangeTab={changeTabWithTransition}
        onOpenCalculator={() => setCalcModalOpen(true)}
        onOpenTimer={() => setTimerModalOpen(true)}
        onOpenWhatsApp={() => setWhatsAppModalOpen(true)}
        whatsAppEnabled={whatsAppEnabled}
      />

      {/* Main Workspace Section */}
      <main className={`flex-1 flex flex-col w-full pb-24 md:pb-0 animate-linear-${sectionTransition}`}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-zinc-400">Loading Daybit...</p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Tasks Section (Unified from Kanban/Board/List) */}
            {activeTab === 'tasks' && tasks.length === 0 && (
              <EmptyTasksView onAddTask={() => {
                setTaskToEdit(null);
                setDefaultStatus(undefined);
                setDefaultDate(undefined);
                setTaskModalOpen(true);
              }} />
            )}

            {activeTab === 'tasks' && tasks.length > 0 && tasksViewMode === 'kanban' && (
              <KanbanBoard
                tasks={filteredTasks}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onAddTask={(status) => {
                  setTaskToEdit(null);
                  setDefaultStatus(status);
                  setDefaultDate(undefined);
                  setTaskModalOpen(true);
                }}
                onEditTask={(task) => {
                  setTaskToEdit(task);
                  setTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onInviteTask={(task) => {
                  setInviteTask(task);
                  setInviteModalOpen(true);
                }}
                onTriggerReminder={(task) => {
                  setReminderTask(task);
                  setReminderModalOpen(true);
                }}
                onToggleComplete={handleToggleComplete}
                onRequestNotification={handleRequestNotification}
              />
            )}

            {activeTab === 'tasks' && tasks.length > 0 && tasksViewMode === 'board' && (
              <BoardView
                tasks={filteredTasks}
                onEditTask={(task) => { setTaskToEdit(task); setTaskModalOpen(true); }}
                onDeleteTask={handleDeleteTask}
                onInviteTask={(task) => { setInviteTask(task); setInviteModalOpen(true); }}
                onTriggerReminder={(task) => { setReminderTask(task); setReminderModalOpen(true); }}
                onToggleComplete={handleToggleComplete}
                onRequestNotification={handleRequestNotification}
              />
            )}

            {activeTab === 'tasks' && tasks.length > 0 && tasksViewMode === 'list' && (
              <ListView
                tasks={filteredTasks}
                onEditTask={(task) => { setTaskToEdit(task); setTaskModalOpen(true); }}
                onDeleteTask={handleDeleteTask}
                onInviteTask={(task) => { setInviteTask(task); setInviteModalOpen(true); }}
                onTriggerReminder={(task) => { setReminderTask(task); setReminderModalOpen(true); }}
                onToggleComplete={handleToggleComplete}
              />
            )}

            {/* 2. Calendar Section */}
            {activeTab === 'calendar' && (
              <CalendarView
                tasks={filteredTasks}
                onSelectTask={(task) => {
                  setTaskToEdit(task);
                  setTaskModalOpen(true);
                }}
                onAddTask={(dateStr) => {
                  setTaskToEdit(null);
                  setDefaultStatus('To Do');
                  setDefaultDate(dateStr);
                  setTaskModalOpen(true);
                }}
              />
            )}

            {/* 3. Dashboard Section (Graph Bar Chart) */}
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                tasks={tasks}
                onRefresh={refreshDashboard}
              />
            )}

            {/* 4. Profile Screen (Full Dedicated Screen) */}
            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                tasks={tasks}
                wsConnected={wsConnected}
                onOpenSettings={() => changeTabWithTransition('settings')}
                onLogout={handleLogout}
              />
            )}

            {/* 5. Settings Screen (Full Dedicated Screen) */}
            {activeTab === 'settings' && (
              <SettingsView
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                tasksViewMode={tasksViewMode}
                onSelectTasksViewMode={(mode) => {
                  setTasksViewMode(mode);
                  localStorage.setItem('daybit.tasksViewMode', mode);
                }}
                darkBg={darkBg}
                onSelectDarkBg={(bg) => {
                  setDarkBg(bg);
                  localStorage.setItem('daybit.darkBg', bg);
                }}
                lightBg={lightBg}
                onSelectLightBg={(bg) => {
                  setLightBg(bg);
                  localStorage.setItem('daybit.lightBg', bg);
                }}
                fontFamily={fontFamily}
                onSelectFontFamily={(font) => { setFontFamily(font); localStorage.setItem('daybit.fontFamily', font); }}
                language={language as any}
                onSelectLanguage={(value) => { setLanguage(value); localStorage.setItem('daybit.language', value); }}
                backgroundAccent={backgroundAccent}
                onSelectBackgroundAccent={(value) => { setBackgroundAccent(value); localStorage.setItem('daybit.backgroundAccent', value); }}
                whatsAppEnabled={whatsAppEnabled}
                onToggleWhatsAppEnabled={(val) => {
                  setWhatsAppEnabled(val);
                  localStorage.setItem('daybit.whatsapp_enabled', String(val));
                }}
                onOpenWhatsApp={() => setWhatsAppModalOpen(true)}
                onOpenFeedbacks={() => setFeedbackModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* --- Modals --- */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatus}
        defaultDate={defaultDate}
      />

      <ReminderNotificationModal
        isOpen={reminderModalOpen}
        task={reminderTask}
        onAccept={(id) => handleReminderAction(id, 'accept')}
        onRemind={(id) => handleReminderAction(id, 'remind')}
        onReject={(id) => handleReminderAction(id, 'reject')}
        onClose={() => setReminderModalOpen(false)}
      />

      <CalculatorModal
        isOpen={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
      />

      <TimerModal
        isOpen={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
      />

      <WhatsAppModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        onTaskAdded={async () => {
          const fresh = await api.getTasks();
          setTasks(mergeTasksById(fresh));
          refreshDashboard();
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          initialize();
        }}
      />

      <InviteModal
        isOpen={inviteModalOpen}
        task={inviteTask}
        onClose={() => setInviteModalOpen(false)}
      />

      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} user={user} />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        tasksViewMode={tasksViewMode}
        onSelectTasksViewMode={(mode) => { setTasksViewMode(mode); localStorage.setItem('daybit.tasksViewMode', mode); }}
        darkBg={darkBg}
        onSelectDarkBg={(bg) => { setDarkBg(bg); localStorage.setItem('daybit.darkBg', bg); }}
        lightBg={lightBg}
        onSelectLightBg={(bg) => { setLightBg(bg); localStorage.setItem('daybit.lightBg', bg); }}
        onOpenFeedback={() => setFeedbackModalOpen(true)}
      />
      <FeedbackModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
      <SuccessToast
        isOpen={successToastOpen}
        onClose={() => setSuccessToastOpen(false)}
        title="Tasks Save successfully"
        message="Payment successful"
      />
    </div>
  );
}

export default App;
