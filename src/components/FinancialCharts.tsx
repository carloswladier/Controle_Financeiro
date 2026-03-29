import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LabelList,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FinancialEntry } from '../types';

interface FinancialChartsProps {
  entries: FinancialEntry[];
  selectedMonth?: string;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ entries, selectedMonth = 'Todos' }) => {
  const monthsOrder = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const processBarData = () => {
    const grouped = entries.reduce((acc, entry) => {
      const month = entry.month;
      if (!acc[month]) {
        acc[month] = { month, CPF: 0, MEI: 0 };
      }
      acc[month][entry.depositAccount] += entry.value;
      return acc;
    }, {} as Record<string, { month: string; CPF: number; MEI: number }>);

    return monthsOrder
      .filter(month => grouped[month])
      .map(month => grouped[month]);
  };

  const totalCPF = entries.filter(e => e.depositAccount === 'CPF').reduce((sum, e) => sum + e.value, 0);
  const totalMEI = entries.filter(e => e.depositAccount === 'MEI').reduce((sum, e) => sum + e.value, 0);

  const pieData = [
    { name: 'CPF', value: totalCPF, color: '#2563eb' },
    { name: 'MEI', value: totalMEI, color: '#dc2626' }
  ].filter(d => d.value > 0);

  const barData = processBarData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatLabel = (value: number) => {
    if (value === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
      compactDisplay: 'short'
    }).format(value);
  };

  if (barData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 h-[300px]">
        <p>Adicione registros para visualizar os gráficos.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Resumo Financeiro {selectedMonth !== 'Todos' ? `(${selectedMonth})` : ''}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Total CPF</p>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(totalCPF)}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wider mb-1">Total MEI</p>
          <p className="text-xl font-bold text-red-900">{formatCurrency(totalMEI)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[250px] w-full">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Evolução Mensal</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Bar dataKey="CPF" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={30}>
                <LabelList dataKey="CPF" position="top" formatter={formatLabel} style={{ fill: '#1e40af', fontSize: '10px', fontWeight: 'bold' }} />
              </Bar>
              <Bar dataKey="MEI" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={30}>
                <LabelList dataKey="MEI" position="top" formatter={formatLabel} style={{ fill: '#991b1b', fontSize: '10px', fontWeight: 'bold' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[250px] w-full border-l border-gray-50 pl-6 hidden lg:block">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Distribuição</p>
          <ResponsiveContainer width="100%" height="100%">
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
