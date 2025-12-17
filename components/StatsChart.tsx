import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Transaction, TransactionType } from '../types';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface StatsChartProps {
  transactions: Transaction[];
}

const PIE_COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const StatsChart: React.FC<StatsChartProps> = ({ transactions }) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Logic for Pie Chart Data (Expenses by Category)
  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const dataMap = expenses.reduce((acc, curr) => {
      if (acc[curr.category]) {
        acc[curr.category] += curr.amount;
      } else {
        acc[curr.category] = curr.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(dataMap).map(category => ({
      name: category,
      value: dataMap[category],
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Logic for Bar Chart Data (Income vs Expense by Month)
  const barData = useMemo(() => {
    const dataMap: Record<string, { name: string; income: number; expense: number; sortKey: string }> = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      // Create a key YYYY-MM for sorting
      const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      // Create a display name like "Jan/24"
      const name = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { name, income: 0, expense: 0, sortKey };
      }

      if (t.type === TransactionType.INCOME) {
        dataMap[sortKey].income += t.amount;
      } else {
        dataMap[sortKey].expense += t.amount;
      }
    });

    return Object.values(dataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 h-[400px] flex items-center justify-center flex-col text-center">
         <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mb-3">
          <span className="text-xl">📊</span>
         </div>
        <p className="text-slate-500 text-sm">Adicione transações para visualizar os gráficos.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800">
          {chartType === 'pie' ? 'Distribuição de Gastos' : 'Evolução Mensal'}
        </h3>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setChartType('pie')}
            className={`p-1.5 rounded-md transition-all ${
              chartType === 'pie' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Categorias"
          >
            <PieIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-all ${
              chartType === 'bar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Evolução"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            pieData.length > 0 ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Sem despesas registradas
              </div>
            )
          ) : (
            <BarChart
              data={barData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar 
                dataKey="income" 
                name="Receitas" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
              <Bar 
                dataKey="expense" 
                name="Despesas" 
                fill="#f43f5e" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};