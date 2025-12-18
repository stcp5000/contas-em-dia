
import React, { useState, useRef } from 'react';
import { PlusCircle, Camera, Loader2, ScanLine, Settings, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types';
import { analyzeBillImage } from '../services/geminiService';
import { CategoryManager } from './CategoryManager';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onUpdateCategory?: (oldName: string, newName: string) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onAddTransaction, 
  categories, 
  onAddCategory, 
  onRemoveCategory,
  onUpdateCategory
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<string>(categories[0] || Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState(true);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    // Auto-suggest due date as the same transaction date if it hasn't been manually changed much
    setDueDate(newDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAddTransaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
      dueDate: type === TransactionType.EXPENSE ? dueDate : undefined,
      isPaid,
    });

    setDescription('');
    setAmount('');
    setIsPaid(true); 
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const result = await analyzeBillImage(base64String, categories);
        
        if (result) {
          if (result.description) setDescription(result.description);
          if (result.amount) setAmount(result.amount.toString());
          if (result.date) {
            setDate(result.date);
            setDueDate(result.dueDate || result.date);
          }
          if (result.category && categories.includes(result.category)) {
            setCategory(result.category);
          } else if (result.category) {
            setCategory(categories.includes(result.category) ? result.category : (categories[0] || 'Outros'));
          }
          if (result.type) setType(result.type);
          setIsPaid(false);
        } else {
          alert("Não foi possível ler os dados da imagem. Tente novamente com uma foto mais nítida.");
        }
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      alert("Erro ao processar imagem.");
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {isScanning && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-slate-800">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="font-medium animate-pulse text-lg">Lendo conta com IA...</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-blue-600" />
            Nova Transação
          </h3>
          
          <button
            type="button"
            onClick={triggerCamera}
            className="w-full sm:w-auto text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>Escanear Conta</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-medium"
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Tipo de Transação</label>
            <div className="flex bg-slate-50 border border-slate-200/60 p-1.5 rounded-2xl shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setType(TransactionType.INCOME);
                  setIsPaid(true); 
                }}
                className={`flex-1 py-3 px-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  type === TransactionType.INCOME 
                    ? 'bg-white text-emerald-600 shadow-md shadow-slate-200/50 border border-slate-200 scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                <ArrowUpCircle className={`w-4 h-4 ${type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-300'}`} />
                Receita
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.EXPENSE)}
                className={`flex-1 py-3 px-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  type === TransactionType.EXPENSE 
                    ? 'bg-white text-rose-600 shadow-md shadow-slate-200/50 border border-slate-200 scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                <ArrowDownCircle className={`w-4 h-4 ${type === TransactionType.EXPENSE ? 'text-rose-500' : 'text-slate-300'}`} />
                Despesa
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Categoria</label>
              <button 
                type="button" 
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                Editar
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-medium appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Data da Transação</label>
            <input 
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-medium"
                required
            />
          </div>

          {type === TransactionType.EXPENSE && (
            <div className="lg:col-span-2 animate-fade-in">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Data de Vencimento
              </label>
              <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-medium"
                  required
              />
            </div>
          )}

          <div className={`lg:col-span-2 flex items-center pt-2 md:pt-8 ${type === TransactionType.INCOME ? 'md:col-start-5' : ''}`}>
            <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-50 p-3 rounded-xl w-full">
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isPaid ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                {isPaid && <ScanLine className="w-4 h-4 text-white" />} 
              </div>
              <input 
                type="checkbox" 
                checked={isPaid} 
                onChange={(e) => setIsPaid(e.target.checked)} 
                className="hidden" 
              />
              <span className="text-sm text-slate-700 font-semibold">
                {isPaid ? 'Já foi pago/recebido' : 'Pagamento pendente'}
              </span>
            </label>
          </div>
          
          <div className="lg:col-span-2 flex justify-end items-end md:col-start-5 lg:col-start-5">
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-6 py-4 rounded-xl text-base font-bold transition-all w-full md:w-auto shadow-lg shadow-slate-200"
            >
              Adicionar Transação
            </button>
          </div>
        </form>
      </div>

      <CategoryManager 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={onAddCategory}
        onRemoveCategory={onRemoveCategory}
        onUpdateCategory={onUpdateCategory}
      />
    </>
  );
};
