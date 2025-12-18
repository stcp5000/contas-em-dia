
import React from 'react';
import { LayoutDashboard, PlusCircle, Sparkles, ArrowRight, Wallet, TrendingUp } from 'lucide-react';
import { FinancialSummary } from '../types';

interface WelcomeCoverProps {
  onEnter: (tab: string) => void;
  summary: FinancialSummary;
  userName: string;
}

export const WelcomeCover: React.FC<WelcomeCoverProps> = ({ onEnter, summary, userName }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-950/30 rounded-full blur-[100px]"></div>
      
      <div className="relative z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center">
        {/* Logo & Header */}
        <div className="mb-12 text-center animate-fade-in">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            Contas em <span className="text-blue-400">Dia!</span>
          </h1>
          <p className="text-slate-400 text-lg">Olá, <span className="text-slate-200 font-medium">{userName}</span>. Sua gestão financeira de alto nível.</p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 animate-slide-up">
          {/* Dashboard Shortcut */}
          <button 
            onClick={() => onEnter('home')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl text-left hover:border-blue-500/50 transition-all duration-300 hover:translate-y-[-4px] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutDashboard className="w-24 h-24 text-white" />
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4 text-blue-400">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Visão Geral</h3>
            <p className="text-slate-400 text-sm mb-6">Acompanhe seu saldo e histórico completo de transações.</p>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              Ver Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Transaction Shortcut */}
          <button 
            onClick={() => onEnter('add')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl text-left hover:border-emerald-500/50 transition-all duration-300 hover:translate-y-[-4px] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <PlusCircle className="w-24 h-24 text-white" />
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit mb-4 text-emerald-400">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nova Conta</h3>
            <p className="text-slate-400 text-sm mb-6">Registre uma nova despesa ou receita rapidamente.</p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              Adicionar Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* AI Shortcut */}
          <button 
            onClick={() => onEnter('insights')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl text-left hover:border-amber-500/50 transition-all duration-300 hover:translate-y-[-4px] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl w-fit mb-4 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Insights IA</h3>
            <p className="text-slate-400 text-sm mb-6">Receba dicas personalizadas do seu consultor virtual.</p>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              Analisar Finanças <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Quick Summary Bar */}
        <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-wrap justify-around items-center gap-8 animate-fade-in delay-500">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Saldo Atual</p>
            <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total Receitas</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total Despesas</p>
            <p className="text-xl font-bold text-rose-400">{formatCurrency(summary.totalExpense)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
