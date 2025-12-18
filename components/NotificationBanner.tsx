
import React, { useMemo } from 'react';
import { AlertTriangle, CalendarClock, BellRing, Clock } from 'lucide-react';
import { Transaction, TransactionType, Reminder, Frequency } from '../types';

interface NotificationBannerProps {
  transactions: Transaction[];
  reminders?: Reminder[];
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ transactions, reminders = [] }) => {
  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const pendingExpenses = transactions.filter(
      t => t.type === TransactionType.EXPENSE && !t.isPaid
    );

    const overdue = pendingExpenses.filter(t => {
      const dueDate = new Date(t.date);
      const localDueDate = new Date(dueDate.valueOf() + dueDate.getTimezoneOffset() * 60000);
      return localDueDate < today;
    });

    const dueSoon = pendingExpenses.filter(t => {
      const dueDate = new Date(t.date);
      const localDueDate = new Date(dueDate.valueOf() + dueDate.getTimezoneOffset() * 60000);
      return localDueDate >= today && localDueDate <= threeDaysFromNow;
    });

    // Check reminders for today
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const currentDayOfMonth = now.getDate();
    
    const todaysReminders = reminders.filter(r => {
      if (!r.isActive) return false;
      
      if (r.frequency === Frequency.DAILY) return true;
      if (r.frequency === Frequency.WEEKLY) return r.dayOfWeek === currentDayOfWeek;
      if (r.frequency === Frequency.MONTHLY) return r.dayOfMonth === currentDayOfMonth;
      
      return false;
    });

    return { overdue, dueSoon, todaysReminders };
  }, [transactions, reminders]);

  if (alerts.overdue.length === 0 && alerts.dueSoon.length === 0 && alerts.todaysReminders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6 animate-fade-in">
      {/* Active Reminders for Today */}
      {alerts.todaysReminders.length > 0 && (
        <div className="bg-blue-600 border border-blue-500 rounded-xl p-4 flex items-start gap-3 shadow-md shadow-blue-100 text-white">
          <div className="bg-white/20 p-2 rounded-full flex-shrink-0 animate-pulse">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold">Lembretes de Hoje</h4>
            <div className="mt-1 space-y-1">
              {alerts.todaysReminders.map(r => (
                <div key={r.id} className="flex items-center justify-between text-xs bg-white/10 rounded px-2 py-1">
                  <span className="font-medium">{r.title}</span>
                  <span className="opacity-80 flex items-center gap-1"><Clock className="w-3 h-3" /> {r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overdue Alerts */}
      {alerts.overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-800">
              {alerts.overdue.length} {alerts.overdue.length === 1 ? 'conta atrasada' : 'contas atrasadas'}!
            </h4>
            <p className="text-xs text-red-600 mt-1">
              Verifique: {alerts.overdue.map(t => t.description).slice(0, 3).join(', ')}
              {alerts.overdue.length > 3 && '...'}
            </p>
          </div>
        </div>
      )}

      {/* Due Soon Alerts */}
      {alerts.dueSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <CalendarClock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800">
              {alerts.dueSoon.length} {alerts.dueSoon.length === 1 ? 'conta vence' : 'contas vencem'} em breve
            </h4>
            <p className="text-xs text-amber-600 mt-1">
              Fique atento a: {alerts.dueSoon.map(t => t.description).slice(0, 3).join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
