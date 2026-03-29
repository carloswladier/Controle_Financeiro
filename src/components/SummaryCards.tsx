import React from 'react';
import { TrendingUp, Users, CreditCard, Wallet } from 'lucide-react';
import { FinancialEntry } from '../types';

interface SummaryCardsProps {
  entries: FinancialEntry[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ entries }) => {
  const totalValue = entries.reduce((acc, curr) => acc + curr.value, 0);
  const cpfCount = entries.filter(e => e.depositAccount === 'CPF').length;
  const meiCount = entries.filter(e => e.depositAccount === 'MEI').length;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const cards = [
    {
      title: 'Valor Total',
      value: formatCurrency(totalValue),
      icon: Wallet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Depósitos CPF',
      value: cpfCount,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Depósitos MEI',
      value: meiCount,
      icon: CreditCard,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Média por Entrada',
      value: entries.length > 0 ? formatCurrency(totalValue / entries.length) : 'R$ 0,00',
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
            <card.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
