
import React, { useState } from 'react';
import { X, Plus, Trash2, Settings, Tag, Edit2, Check, AlertTriangle } from 'lucide-react';
import { Category } from '../types';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onUpdateCategory?: (oldName: string, newName: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onRemoveCategory,
  onUpdateCategory,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [categoryToRemove, setCategoryToRemove] = useState<string | null>(null);

  // System defined categories that cannot be modified
  const SYSTEM_CATEGORIES = Object.values(Category) as string[];

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const startEditing = (cat: string) => {
    setEditingCategory(cat);
    setEditValue(cat);
  };

  const handleUpdate = () => {
    if (editingCategory && editValue.trim() && editValue !== editingCategory && onUpdateCategory) {
      onUpdateCategory(editingCategory, editValue.trim());
    }
    setEditingCategory(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'add') handleAdd();
      if (action === 'edit') handleUpdate();
    }
    if (e.key === 'Escape' && action === 'edit') {
      setEditingCategory(null);
    }
  };

  const confirmDelete = () => {
    if (categoryToRemove) {
      onRemoveCategory(categoryToRemove);
      setCategoryToRemove(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in flex flex-col max-h-[80vh] relative">
        
        {/* Deletion Confirmation Overlay */}
        {categoryToRemove && (
          <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Excluir Categoria?</h4>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Deseja realmente excluir "<span className="font-bold text-slate-700">{categoryToRemove}</span>"?<br/>
              Transações vinculadas a ela não serão excluídas, mas ficarão órfãs.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setCategoryToRemove(null)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-100"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

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
              onKeyDown={(e) => handleKeyDown(e, 'add')}
              placeholder="Nova categoria..."
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus={!editingCategory}
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
              {categories.map((cat) => {
                const isSystem = SYSTEM_CATEGORIES.includes(cat);
                const isEditing = editingCategory === cat;

                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg group transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-md ${isSystem ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-500'}`}>
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      
                      {isEditing ? (
                        <div className="flex-1 flex gap-1 animate-fade-in">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'edit')}
                            className="flex-1 p-1 px-2 text-sm border border-blue-300 rounded focus:outline-none"
                            autoFocus
                          />
                          <button onClick={handleUpdate} className="p-1 text-emerald-600 bg-emerald-50 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-sm font-medium truncate ${isSystem ? 'text-slate-400' : 'text-slate-700'}`}>
                          {cat} {isSystem && <span className="text-[9px] font-bold uppercase ml-1 opacity-50 tracking-tighter">(Sistema)</span>}
                        </span>
                      )}
                    </div>

                    {!isSystem && !isEditing && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => startEditing(cat)}
                          className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCategoryToRemove(cat)}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total de {categories.length} categorias</span>
        </div>
      </div>
    </div>
  );
};
