import React, { useState, useEffect, useMemo } from 'react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DashboardCards } from './components/DashboardCards';
import { StatsChart } from './components/StatsChart';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { UserProfile } from './components/UserProfile';
import { NotificationBanner } from './components/NotificationBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Transaction, TransactionType, FinancialSummary, UserProfile as UserProfileType, Category } from './types';
import { LayoutDashboard } from 'lucide-react';

const STORAGE_KEY = 'finance_app_transactions_v1';
const PROFILE_KEY = 'finance_app_profile_v1';
const CATEGORIES_KEY = 'finance_app_categories_v1';

const App: React.FC = () => {
  // Mobile Tab State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'add', 'insights'

  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        isPaid: t.isPaid !== undefined ? t.isPaid : true
      }));
    }
    return [];
  });

  // State for User Profile
  const [userProfile, setUserProfile] = useState<UserProfileType>(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? JSON.parse(saved) : { name: 'Usuário', avatar: '👤' };
  });

  // State for Categories
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : Object.values(Category);
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 md:pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 text-white p-2.5 rounded-xl">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
              Contas em <span className="text-blue-600">Dia!</span>
            </h1>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:hidden">
              Contas<span className="text-blue-600">!</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <UserProfile 
              profile={userProfile} 
              onUpdateProfile={setUserProfile} 
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Alerts */}
        <div className={`${activeTab === 'home' ? 'block' : 'hidden'} md:block`}>
          <NotificationBanner transactions={transactions} />
        </div>

        {/* Dashboard Cards */}
        <div className={`${activeTab === 'home' ? 'block' : 'hidden'} md:block`}>
          <DashboardCards summary={summary} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Input & List) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Form */}
            <div className={`${activeTab === 'add' ? 'block' : 'hidden'} md:block`}>
              <TransactionForm 
                onAddTransaction={handleAddTransaction} 
                categories={categories}
                onAddCategory={handleAddCategory}
                onRemoveCategory={handleRemoveCategory}
              />
            </div>
            
            {/* List */}
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

            <div className="text-center text-xs text-slate-400 mt-8 mb-4">
              <p>Seus dados são salvos localmente.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;