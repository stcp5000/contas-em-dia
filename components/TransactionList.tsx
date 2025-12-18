
import React, { useState, useMemo } from 'react';
import { 
  Trash2, ArrowUpRight, ArrowDownLeft, X, CheckCircle2, 
  Clock, AlertCircle, AlertTriangle, ReceiptText, 
  ChevronDown, Calendar, FilterX, AlertOctagon,
  ArrowUpCircle, ArrowDownCircle, ListFilter,
  CalendarDays
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ITEMS_PER_PAGE = 20;

type FilterType = 'all' | TransactionType.INCOME | TransactionType.EXPENSE;

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onToggleStatus }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Helper for date comparison
  const getTransactionTimeStatus = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDate = new Date(dateString);
    const localItemDate = new Date(itemDate.valueOf() + itemDate.getTimezoneOffset() * 60000);
    localItemDate.setHours(0, 0, 0, 0);

    if (localItemDate.getTime() > today.getTime()) return 'future';
    if (localItemDate.getTime() < today.getTime()) return 'past';
    return 'today';
  };

  // Memoized filtering and sorting
  const { filteredTransactions, sortedTransactions } = useMemo(() => {
    const filtered = transactions.filter((t) => {
      // Date Filter
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      
      // Type Filter
      if (filterType !== 'all' && t.type !== filterType) return false;
      
      return true;
    });

    const sorted = [...filtered].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { filteredTransactions: filtered, sortedTransactions: sorted };
  }, [transactions, startDate, endDate, filterType]);

  // Paginated View
  const paginatedTransactions = useMemo(() => {
    return sortedTransactions.slice(0, displayLimit);
  }, [sortedTransactions, displayLimit]);

  const hasMore = sortedTransactions.length > displayLimit;

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + ITEMS_PER_PAGE);
  };

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
    setFilterType('all');
    setDisplayLimit(ITEMS_PER_PAGE);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  const getDeadlineStatus = (t: Transaction) => {
    if (t.type === TransactionType.INCOME || t.isPaid) return null;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    // Use dueDate if available, fallback to date
    const targetDateStr = t.dueDate || t.date;
    const dueDate = new Date(targetDateStr);
    const localDueDate = new Date(dueDate.valueOf() + dueDate.getTimezoneOffset() * 60000);
    const diffTime = localDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3 && diffDays >= 0) return 'soon';
    return null;
  };

  const getRowStyle = (t: Transaction) => {
    const timeStatus = getTransactionTimeStatus(t.date);
    if (timeStatus === 'future') return 'bg-blue-50/20 border-l-4 border-blue-400/50';
    
    if (t.type === TransactionType.INCOME) return '';
    if (t.isPaid) return 'opacity-60 bg-slate-50/50';
    
    const status = getDeadlineStatus(t);
    if (status === 'overdue') return 'bg-red-50 border-l-4 border-red-500';
    if (status === 'soon') return 'bg-amber-50 border-l-4 border-amber-400';
    
    return '';
  };

  const getMobileCardStyle = (t: Transaction) => {
     const timeStatus = getTransactionTimeStatus(t.date);
     if (timeStatus === 'future') return 'border-l-4 border-blue-400 border-dashed bg-blue-50/10';

     if (t.type === TransactionType.INCOME) return 'border-l-4 border-emerald-500 bg-white';
     if (t.isPaid) return 'opacity-70 border-l-4 border-slate-300 bg-white';
     
     const status = getDeadlineStatus(t);
     if (status === 'overdue') return 'border-l-4 border-red-500 bg-red-50/60';
     if (status === 'soon') return 'border-l-4 border-amber-400 bg-amber-50/60';
     
     return 'border-l-4 border-rose-500 bg-white';
  };

  const isFiltered = startDate !== '' || endDate !== '' || filterType !== 'all';

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full relative">
      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar Exclusão?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Você está prestes a remover "<span className="font-semibold text-slate-700">{transactionToDelete.description}</span>". 
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTransactionToDelete(null)}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-200"
                >
                  Excluir agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Filters */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            Histórico de Atividades
            {isFiltered && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                Filtrado
              </span>
            )}
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
            {filteredTransactions.length} registros
          </span>
        </div>

        {/* Improved Filter Controls */}
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex flex-col xl:flex-row gap-4">
            
            {/* Type Filter Section */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <ListFilter className="w-3 h-3" /> Filtrar Tipo
              </div>
              <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                <button
                  onClick={() => setFilterType('all')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterType === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Tudo
                </button>
                <button
                  onClick={() => setFilterType(TransactionType.INCOME)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterType === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Receitas
                </button>
                <button
                  onClick={() => setFilterType(TransactionType.EXPENSE)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterType === TransactionType.EXPENSE ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Despesas
                </button>
              </div>
            </div>

            {/* Date Filter Section */}
            <div className="xl:flex-[2]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <Calendar className="w-3 h-3" /> Filtrar Período
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                  <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-slate-400 uppercase">De</span>
                </div>

                <div className="hidden sm:block text-slate-300 font-light">/</div>

                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                  <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-slate-400 uppercase">Até</span>
                </div>

                {/* Clear Button */}
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-100 shrink-0 w-full sm:w-auto justify-center"
                    title="Limpar todos os filtros"
                  >
                    <FilterX className="w-4 h-4" /> <span className="sm:hidden xl:inline">Limpar</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden bg-slate-50 p-4 space-y-3 overflow-y-auto">
        {paginatedTransactions.map((t) => {
          const status = getDeadlineStatus(t);
          const timeStatus = getTransactionTimeStatus(t.date);
          return (
            <div key={t.id} className={`p-4 rounded-xl shadow-sm border border-slate-100 relative transition-colors ${getMobileCardStyle(t)}`}>
               <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {t.category}
                        </span>
                        {timeStatus === 'future' && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                            <CalendarDays className="w-2.5 h-2.5" /> Agendado
                          </span>
                        )}
                     </div>
                     <div className="flex items-start gap-2">
                        {t.type === TransactionType.INCOME && (
                          <ReceiptText className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                        )}
                        {t.type === TransactionType.EXPENSE && !t.isPaid && (
                          <AlertTriangle className={`w-4 h-4 mt-1 flex-shrink-0 ${status === 'overdue' ? 'text-red-500' : 'text-amber-500'}`} />
                        )}
                        <h4 className={`font-bold text-base leading-tight ${t.isPaid ? 'text-slate-500 line-through font-medium' : 'text-slate-800'}`}>
                          {t.description}
                        </h4>
                     </div>
                     {t.dueDate && t.dueDate !== t.date && (
                       <p className="text-[10px] text-slate-400 mt-1">Vence em: {formatDate(t.dueDate)}</p>
                     )}
                  </div>
                  <div className="text-right ml-4">
                     <p className={`font-bold text-base whitespace-nowrap ${
                        t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {t.type === TransactionType.EXPENSE && '- '}{formatCurrency(t.amount)}
                     </p>
                     <div className="flex items-center justify-end gap-1 mt-1">
                        <p className={`text-[11px] font-medium ${timeStatus === 'future' ? 'text-blue-600' : status === 'overdue' ? 'text-red-600' : status === 'soon' ? 'text-amber-600' : 'text-slate-400'}`}>
                          {formatDate(t.date)}
                        </p>
                        {(status === 'overdue' || status === 'soon') && (
                          <span title={status === 'overdue' ? 'Atrasado' : 'Vence em breve'}>
                            <AlertCircle className={`w-3 h-3 ${status === 'overdue' ? 'text-red-600' : 'text-amber-600'}`} />
                          </span>
                        )}
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100/50">
                  <button 
                    onClick={() => onToggleStatus(t.id)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                      t.isPaid 
                        ? 'bg-slate-100 text-slate-500' 
                        : timeStatus === 'future'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {t.isPaid ? (
                      <><CheckCircle2 className="w-4 h-4" /> Pago</>
                    ) : (
                      <><Clock className="w-4 h-4" /> {timeStatus === 'future' ? 'Agendado' : 'Pendente'}</>
                    )}
                  </button>
                  <button 
                    onClick={() => setTransactionToDelete(t)}
                    className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg active:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
          );
        })}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">Nenhum resultado para os filtros selecionados.</p>
          </div>
        )}

        {hasMore && (
          <button 
            onClick={handleLoadMore}
            className="w-full py-4 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <ChevronDown className="w-4 h-4" /> Carregar mais registros
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Data/Vencimento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.map((t) => {
                const timeStatus = getTransactionTimeStatus(t.date);
                const status = getDeadlineStatus(t);
                return (
                  <tr key={t.id} className={`hover:bg-opacity-80 transition-colors group ${getRowStyle(t)}`}>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => onToggleStatus(t.id)}
                        className={`p-1 rounded-full transition-all ${
                          t.isPaid 
                            ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' 
                            : timeStatus === 'future'
                            ? 'text-blue-500 bg-blue-50 hover:bg-blue-100'
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
                            : timeStatus === 'future'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {t.type === TransactionType.INCOME 
                            ? <ArrowUpRight className="w-4 h-4" /> 
                            : timeStatus === 'future'
                            ? <CalendarDays className="w-4 h-4" />
                            : <ArrowDownLeft className="w-4 h-4" />
                          }
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-medium ${t.isPaid ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                            {t.description}
                          </span>
                          {timeStatus === 'future' && (
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">Agendado</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/50 border border-slate-100 text-slate-600">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className={timeStatus === 'future' ? 'text-blue-600 font-medium' : ''}>
                            {formatDate(t.date)}
                          </span>
                          {status === 'overdue' && <span title="Atrasado"><AlertCircle className="w-3 h-3 text-red-500" /></span>}
                          {status === 'soon' && <span title="Vence em breve"><AlertCircle className="w-3 h-3 text-amber-500" /></span>}
                        </div>
                        {t.dueDate && t.dueDate !== t.date && (
                          <span className="text-[10px] text-slate-400">Vence: {formatDate(t.dueDate)}</span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-right font-medium ${
                      t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-700'
                    }`}>
                      {t.type === TransactionType.EXPENSE && '- '}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => setTransactionToDelete(t)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">
                    Nenhum resultado encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {hasMore && (
            <div className="p-4 bg-slate-50 text-center">
              <button 
                onClick={handleLoadMore}
                className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2 mx-auto"
              >
                <ChevronDown className="w-4 h-4" /> Carregar mais registros
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
