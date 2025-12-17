import React, { useState } from 'react';
import { User, Edit2, X, Check } from 'lucide-react';
import { UserProfile as IUserProfile } from '../types';

interface UserProfileProps {
  profile: IUserProfile;
  onUpdateProfile: (profile: IUserProfile) => void;
}

const AVATAR_OPTIONS = [
  '👤', '👩', '👨', '🧑', '👵', '👴', 
  '👩‍💼', '👨‍💼', '🕵️', '👷', '👸', '🤴',
  '🦁', '🐶', '🐱', '🐼', '🦊', '🐸',
  '🚀', '⭐', '💎', '💰', '🎩', '🎧'
];

export const UserProfile: React.FC<UserProfileProps> = ({ profile, onUpdateProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);

  const handleOpen = () => {
    setTempName(profile.name);
    setTempAvatar(profile.avatar);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (tempName.trim()) {
      onUpdateProfile({ name: tempName, avatar: tempAvatar });
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {/* Header Display */}
      <button 
        onClick={handleOpen}
        className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-100 group"
      >
        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-xl shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
          {profile.avatar}
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Olá,</p>
          <p className="text-sm font-semibold text-slate-700 leading-none">{profile.name}</p>
        </div>
      </button>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Avatar Selection */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Escolha seu Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setTempAvatar(avatar)}
                      className={`text-2xl p-2 rounded-lg transition-all hover:bg-slate-50 flex items-center justify-center aspect-square ${
                        tempAvatar === avatar 
                          ? 'bg-blue-50 ring-2 ring-blue-500 shadow-sm scale-110' 
                          : 'grayscale hover:grayscale-0 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Seu Nome</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  placeholder="Como gostaria de ser chamado?"
                  autoFocus
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!tempName.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                <Check className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
