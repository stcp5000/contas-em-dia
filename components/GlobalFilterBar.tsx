
import React from 'react';
import { Calendar, FilterX, ListFilter, Clock } from 'lucide-react';

interface GlobalFilterBarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
  resultsCount: number;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  resultsCount
}) => {
  const isFiltered = startDate !== '' || endDate !== '';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ListFilter className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Filtro de Período</h4>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {isFiltered ? `${resultsCount} transações encontradas` : 'Visualizando todo o histórico'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 md:max-w-2xl">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
            <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-slate-400 uppercase">Até</span>
          </div>

          {isFiltered && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-100 shrink-0 w-full sm:w-auto justify-center"
            >
              <FilterX className="w-4 h-4" /> Limpar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
