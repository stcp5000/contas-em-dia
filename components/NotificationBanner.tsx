import React, { useMemo } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface NotificationBannerProps {
  transactions: Transaction[];
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ transactions }) => {
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
      // Fix timezone offset issue for accurate date comparison
      const localDueDate = new Date(dueDate.valueOf() + dueDate.getTimezoneOffset() * 60000);
      return localDueDate < today;
    });

    const dueSoon = pendingExpenses.filter(t => {
      const dueDate = new Date(t.date);
      const localDueDate = new Date(dueDate.valueOf() + dueDate.getTimezoneOffset() * 60000);
      return localDueDate >= today && localDueDate <= threeDaysFromNow;
    });

    return { overdue, dueSoon };
  }, [transactions]);

  if (alerts.overdue.length === 0 && alerts.dueSoon.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6 animate-fade-in">
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
