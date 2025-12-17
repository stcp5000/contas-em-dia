import React, { useState } from 'react';
import { Trash2, ArrowUpRight, ArrowDownLeft, Filter, X, Calendar, CheckCircle2, Clock, MoreVertical } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onToggleStatus }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter((t) => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const getRowStyle = (t: Transaction) => {
    if (t.type === TransactionType.INCOME) return '';
    if (t.isPaid) return 'opacity-60 bg-slate-50/50'; // Completed
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(t.date);
    const localDueDate = new Date(dueDate.valueOf() + dueDate.getTimezoneOffset() * 60000);

    const diffTime = localDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-50 border-l-4 border-red-500'; // Overdue
    if (diffDays <= 3) return 'bg-amber-50 border-l-4 border-amber-400'; // Due soon
    
    return '';
  };

  const getMobileCardStyle = (t: Transaction) => {
     if (t.type === TransactionType.INCOME) return 'border-l-4 border-emerald-500';
     if (t.isPaid) return 'opacity-70 border-l-4 border-slate-300';
     
     const today = new Date();
     today.setHours(0,0,0,0);
     const dueDate = new Date(t.date);
     const localDueDate = new Date(dueDate.valueOf() + dueDate.getTimezoneOffset() * 60000);
     const diffTime = localDueDate.getTime() - today.getTime();
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

     if (diffDays < 0) return 'border-l-4 border-red-500 bg-red-50/30';
     if (diffDays <= 3) return 'border-l-4 border-amber-400 bg-amber-50/30';
     
     return 'border-l-4 border-rose-500';
  };

  const hasFilter = startDate || endDate;

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-800">Nenhuma transação</h3>
        <p className="text-slate-500 mt-2 text-base max-w-xs mx-auto">Adicione suas receitas e despesas para começar a controlar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header and Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            Histórico
            {hasFilter && (
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Filtrado
              </span>
            )}
          </h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {filteredTransactions.length} reg.
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-end gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[120px]">
               <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-600"
              />
            </div>
            <span className="text-slate-400 text-xs">-</span>
            <div className="relative flex-1 min-w-[120px]">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-600"
              />
            </div>
          
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="text-xs text-slate-500 bg-white border border-slate-200 p-2 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card List View (Visible on Small Screens) */}
      <div className="block md:hidden bg-slate-50 p-4 space-y-3 pb-24 overflow-y-auto">
        {filteredTransactions.map((t) => (
          <div key={t.id} className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative ${getMobileCardStyle(t)}`}>
             <div className="flex justify-between items-start mb-2">
                <div>
                   <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.category}</span>
                   <h4 className={`font-bold text-lg ${t.isPaid ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                     {t.description}
                   </h4>
                </div>
                <div className="text-right">
                   <p className={`font-bold text-lg ${
                      t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {t.type === TransactionType.EXPENSE && '- '}{formatCurrency(t.amount)}
                   </p>
                   <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
                </div>
             </div>
             
             <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                <button 
                  onClick={() => onToggleStatus(t.id)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    t.isPaid 
                      ? 'bg-slate-100 text-slate-500' 
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {t.isPaid ? (
                    <><CheckCircle2 className="w-4 h-4" /> Pago</>
                  ) : (
                    <><Clock className="w-4 h-4" /> Pendente</>
                  )}
                </button>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on Small Screens) */}
      <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTransactions.map((t) => (
                <tr key={t.id} className={`hover:bg-opacity-80 transition-colors group ${getRowStyle(t)}`}>
                   <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => onToggleStatus(t.id)}
                      className={`p-1 rounded-full transition-all ${
                        t.isPaid 
                          ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' 
                          : 'text-slate-300 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-500'
                      }`}
                      title={t.isPaid ? "Marcar como pendente" : "Marcar como pago"}
                    >
                      {t.isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full hidden sm:block ${
                        t.type === TransactionType.INCOME 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {t.type === TransactionType.INCOME 
                          ? <ArrowUpRight className="w-4 h-4" /> 
                          : <ArrowDownLeft className="w-4 h-4" />
                        }
                      </div>
                      <span className={`font-medium ${t.isPaid ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                        {t.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/50 border border-slate-100 text-slate-600">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {formatDate(t.date)}
                  </td>
                  <td className={`px-4 py-4 text-right font-medium ${
                    t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-700'
                  }`}>
                    {t.type === TransactionType.EXPENSE && '- '}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};