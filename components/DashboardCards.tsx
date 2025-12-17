import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { FinancialSummary } from '../types';

interface DashboardCardsProps {
  summary: FinancialSummary;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ summary }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-3 mb-6 md:grid md:grid-cols-3 md:gap-4">
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">Saldo Total</p>
          <h3 className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
            {formatCurrency(summary.balance)}
          </h3>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl">
          <Wallet className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">Receitas</p>
          <h3 className="text-2xl font-bold mt-1 text-emerald-600">
            {formatCurrency(summary.totalIncome)}
          </h3>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl">
          <ArrowUpCircle className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">Despesas</p>
          <h3 className="text-2xl font-bold mt-1 text-rose-600">
            {formatCurrency(summary.totalExpense)}
          </h3>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl">
          <ArrowDownCircle className="w-6 h-6 text-rose-600" />
        </div>
      </div>
    </div>
  );
};