
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DashboardCards } from './components/DashboardCards';
import { StatsChart } from './components/StatsChart';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { UserProfile } from './components/UserProfile';
import { NotificationBanner } from './components/NotificationBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ReminderManager } from './components/ReminderManager';
import { WelcomeCover } from './components/WelcomeCover';
import { Transaction, TransactionType, FinancialSummary, UserProfile as UserProfileType, Category, Reminder } from './types';
import { LayoutDashboard, Bell, ChevronLeft, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'finance_app_transactions_v1';
const PROFILE_KEY = 'finance_app_profile_v1';
const CATEGORIES_KEY = 'finance_app_categories_v1';
const REMINDERS_KEY = 'finance_app_reminders_v1';

const App: React.FC = () => {
  // Navigation & Splash State
  const [activeTab, setActiveTab] = useState('home'); 
  const [showCover, setShowCover] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Modal States
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // State for User Profile
  const [userProfile, setUserProfile] = useState<UserProfileType>({ name: 'Visitante', avatar: '👤' });

  // State for Categories
  const [categories, setCategories] = useState<string[]>(Object.values(Category));

  // State for Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Initial Data Loading
  useEffect(() => {
    const loadData = () => {
      try {
        const savedTransactions = localStorage.getItem(STORAGE_KEY);
        if (savedTransactions) {
          const parsed = JSON.parse(savedTransactions);
          setTransactions(parsed.map((t: any) => ({
            ...t,
            isPaid: t.isPaid !== undefined ? t.isPaid : true
          })));
        }

        const savedProfile = localStorage.getItem(PROFILE_KEY);
        if (savedProfile) setUserProfile(JSON.parse(savedProfile));

        const savedCategories = localStorage.getItem(CATEGORIES_KEY);
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          setCategories(Object.values(Category));
        }

        const savedReminders = localStorage.getItem(REMINDERS_KEY);
        if (savedReminders) setReminders(JSON.parse(savedReminders));
      } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
      } finally {
        setIsInitializing(false);
      }
    };

    loadData();
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (!isInitializing) localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, isInitializing]);

  useEffect(() => {
    if (!isInitializing) localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
  }, [userProfile, isInitializing]);

  useEffect(() => {
    if (!isInitializing) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories, isInitializing]);

  useEffect(() => {
    if (!isInitializing) localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }, [reminders, isInitializing]);

  // Handlers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [transaction, ...prev]);
    setActiveTab('home'); 
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTransactions((prev) => prev.map(t => 
      t.id === id ? { ...t, isPaid: !t.isPaid } : t
    ));
  };

  const handleAddCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const handleUpdateCategory = (oldName: string, newName: string) => {
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    // Update all transactions that were using the old category name
    setTransactions(prev => prev.map(t => t.category === oldName ? { ...t, category: newName } : t));
  };

  const handleAddReminder = (reminder: Reminder) => {
    setReminders(prev => [...prev, reminder]);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions]);

  const handleEnterApp = (tab: string) => {
    setActiveTab(tab);
    setShowCover(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 md:pb-12">
      {showCover && (
        <WelcomeCover 
          userName={userProfile.name} 
          summary={summary} 
          onEnter={handleEnterApp} 
        />
      )}

      {/* Main UI only mounts when needed for better performance */}
      {!showCover && (
        <>
          {/* Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => setShowCover(true)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 mr-1 hidden sm:block"
                  title="Voltar para Capa"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="bg-slate-900 text-white p-2.5 rounded-xl">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
                  Contas em <span className="text-blue-600">Dia!</span>
                </h1>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => setIsReminderModalOpen(true)}
                  className="p-2.5 bg-slate-100 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all relative"
                >
                  <Bell className="w-5 h-5" />
                  {reminders.some(r => r.isActive) && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full"></span>
                  )}
                </button>
                <UserProfile 
                  profile={userProfile} 
                  onUpdateProfile={setUserProfile} 
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
            {/* Alerts & Reminders */}
            <div className={`${activeTab === 'home' ? 'block' : 'hidden'} md:block`}>
              <NotificationBanner transactions={transactions} reminders={reminders} />
            </div>

            {/* Dashboard Cards */}
            <div className={`${activeTab === 'home' ? 'block' : 'hidden'} md:block`}>
              <DashboardCards summary={summary} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (Input & List) */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`${activeTab === 'add' ? 'block' : 'hidden'} md:block`}>
                  <TransactionForm 
                    onAddTransaction={handleAddTransaction} 
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onRemoveCategory={handleRemoveCategory}
                  />
                </div>
                
                <div className={`${activeTab === 'home' ? 'block' : 'hidden'} md:block h-full`}>
                   <TransactionList 
                    transactions={transactions} 
                    onDelete={handleDeleteTransaction}
                    onToggleStatus={handleToggleStatus}
                  />
                </div>
              </div>

              {/* Right Column (Charts & AI) */}
              <div className={`lg:col-span-1 space-y-6 ${activeTab === 'insights' ? 'block' : 'hidden'} md:block`}>
                <GeminiAdvisor transactions={transactions} />
                <StatsChart transactions={transactions} />
              </div>
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}

      {/* Modals always accessible */}
      <ReminderManager 
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onRemoveReminder={handleRemoveReminder}
        onToggleReminder={handleToggleReminder}
      />
    </div>
  );
};

export default App;
