
import React, { useState } from 'react';
import { X, Plus, Trash2, Bell, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { Reminder, Frequency } from '../types';

interface ReminderManagerProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onRemoveReminder: (id: string) => void;
  onToggleReminder: (id: string) => void;
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  isOpen,
  onClose,
  reminders,
  onAddReminder,
  onRemoveReminder,
  onToggleReminder,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [time, setTime] = useState('09:00');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!title.trim()) return;

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: amount ? parseFloat(amount) : undefined,
      frequency,
      time,
      dayOfWeek: frequency === Frequency.WEEKLY ? dayOfWeek : undefined,
      dayOfMonth: frequency === Frequency.MONTHLY ? dayOfMonth : undefined,
      isActive: true,
    };

    onAddReminder(newReminder);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setFrequency(Frequency.MONTHLY);
    setTime('09:00');
    setDayOfWeek(1);
    setDayOfMonth(1);
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Lembretes de Contas
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 px-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="w-5 h-5" /> Novo Lembrete
            </button>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 animate-fade-in">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">O que pagar?</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Aluguel, Internet..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Valor (Opcional)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Horário</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Frequência</label>
                  <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                    {Object.values(Frequency).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                          frequency === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {frequency === Frequency.WEEKLY && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dia da Semana</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                    >
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <option key={day} value={idx}>{day}</option>
                      ))}
                    </select>
                  </div>
                )}

                {frequency === Frequency.MONTHLY && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dia do Mês</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!title.trim()}
                    className="flex-1 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-100"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {reminders.length === 0 && !isAdding && (
              <div className="text-center py-12 text-slate-400">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm">Você ainda não tem lembretes.</p>
              </div>
            )}
            
            {reminders.map((r) => (
              <div key={r.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${r.isActive ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onToggleReminder(r.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${r.isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-400'}`}
                  >
                    {r.isActive ? <Bell className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </button>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{r.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                        {r.frequency}
                      </span>
                      <span className="text-[10px] flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3 h-3" /> {r.time}
                        {r.frequency === Frequency.WEEKLY && ` • ${DAYS_OF_WEEK[r.dayOfWeek!]}`}
                        {r.frequency === Frequency.MONTHLY && ` • Dia ${r.dayOfMonth}`}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveReminder(r.id)}
                  className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
