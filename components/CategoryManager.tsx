import React, { useState } from 'react';
import { X, Plus, Trash2, Settings, Tag } from 'lucide-react';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onRemoveCategory,
}) => {
  const [newCategory, setNewCategory] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            Gerenciar Categorias
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Input */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nova categoria..."
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!newCategory.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1.5 rounded-md text-slate-500">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{cat}</span>
                  </div>
                  <button
                    onClick={() => onRemoveCategory(cat)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Remover categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
            <span className="text-[10px] text-slate-400">Total de {categories.length} categorias</span>
        </div>
      </div>
    </div>
  );
};