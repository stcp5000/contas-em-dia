import React, { useState } from 'react';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface GeminiAdvisorProps {
  transactions: Transaction[];
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ transactions }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAdvice(null);
    try {
      const result = await getFinancialAdvice(transactions);
      setAdvice(result);
    } catch (e) {
      setAdvice("Não foi possível conectar ao consultor virtual no momento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl shadow-lg text-white p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-xl">Consultor Gemini IA</h3>
            <p className="text-indigo-100 text-xs opacity-90">Análise inteligente das suas finanças</p>
          </div>
        </div>

        {!advice && !loading && (
          <div className="mt-4">
            <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
              Descubra padrões de gastos, receba dicas de economia personalizadas e entenda melhor para onde seu dinheiro está indo com o poder da inteligência artificial.
            </p>
            <button
              onClick={handleAnalyze}
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Bot className="w-5 h-5" />
              Analisar Minhas Finanças
            </button>
          </div>
        )}

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 animate-spin text-white/80 mb-3" />
            <p className="text-sm font-medium animate-pulse">Consultando o Gemini...</p>
          </div>
        )}

        {advice && (
          <div className="mt-4 bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10 animate-fade-in max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
            <button 
              onClick={() => setAdvice(null)}
              className="mt-4 text-xs text-indigo-200 hover:text-white underline"
            >
              Fechar análise
            </button>
          </div>
        )}
      </div>
    </div>
  );
};