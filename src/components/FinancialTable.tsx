import React from 'react';
import { Trash2, Pencil, FileText, User, Calendar, CreditCard, Wallet } from 'lucide-react';
import { FinancialEntry } from '../types';

interface FinancialTableProps {
  entries: FinancialEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: FinancialEntry) => void;
}

export const FinancialTable: React.FC<FinancialTableProps> = ({ entries, onDelete, onEdit }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">Nenhuma entrada registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-bottom border-gray-100">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">CPF</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conta Depositada</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Depósito</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivo</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mês</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-4 text-sm text-gray-600 font-mono">{entry.cpf}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-semibold text-gray-900 text-right">
                  {formatCurrency(entry.value)}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.depositAccount === 'CPF' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <Wallet className="w-3 h-3 mr-1" />
                    {entry.depositAccount}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {formatDate(entry.depositDate)}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {entry.depositReason}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {entry.month}
                  </div>
                </td>
                <td className="p-4 text-center flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
