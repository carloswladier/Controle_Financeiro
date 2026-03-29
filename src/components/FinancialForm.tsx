import React, { useState, useEffect } from 'react';
import { PlusCircle, DollarSign, User, Hash, Calendar, CreditCard, Wallet, FileText, Pencil, X } from 'lucide-react';
import { DepositAccountType, FinancialEntry } from '../types';

interface FinancialFormProps {
  onAddEntry: (entry: Omit<FinancialEntry, 'id' | 'createdAt'>) => void;
  onUpdateEntry?: (id: string, entry: Omit<FinancialEntry, 'id' | 'createdAt'>) => void;
  initialData?: FinancialEntry | null;
  onCancel?: () => void;
  entries: FinancialEntry[];
}

export const FinancialForm: React.FC<FinancialFormProps> = ({ 
  onAddEntry, 
  onUpdateEntry, 
  initialData, 
  onCancel,
  entries
}) => {
  const [cpf, setCpf] = useState(initialData?.cpf || '');
  const [name, setName] = useState(initialData?.name || '');
  const [value, setValue] = useState(initialData?.value.toString() || '');
  const [depositAccount, setDepositAccount] = useState<DepositAccountType>(initialData?.depositAccount || 'CPF');
  const [depositDate, setDepositDate] = useState(initialData?.depositDate || new Date().toISOString().split('T')[0]);
  const [depositReason, setDepositReason] = useState(initialData?.depositReason || '');
  const [month, setMonth] = useState(initialData?.month || new Date().toLocaleString('pt-BR', { month: 'long' }));

  // Auto-fill CPF when name matches an existing entry (starts with)
  useEffect(() => {
    if (!initialData && name.trim().length >= 3) {
      const searchName = name.trim().toLowerCase();
      // Search from most recent to oldest
      const match = [...entries].reverse().find(entry => 
        entry.name.toLowerCase().startsWith(searchName)
      );
      
      if (match) {
        setCpf(match.cpf);
      }
    }
  }, [name, entries, initialData]);

  useEffect(() => {
    if (initialData) {
      setCpf(initialData.cpf);
      setName(initialData.name);
      setValue(initialData.value.toString());
      setDepositAccount(initialData.depositAccount);
      setDepositDate(initialData.depositDate);
      setDepositReason(initialData.depositReason);
      setMonth(initialData.month);
    } else {
      setCpf('');
      setName('');
      setValue('');
      setDepositAccount('CPF');
      setDepositDate(new Date().toISOString().split('T')[0]);
      setDepositReason('');
      setMonth(new Date().toLocaleString('pt-BR', { month: 'long' }));
    }
  }, [initialData]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !name || !value || !depositDate || !depositReason) return;

    const data = {
      cpf,
      name,
      value: parseFloat(value),
      depositAccount,
      depositDate,
      depositReason,
      month,
    };

    if (initialData && onUpdateEntry) {
      onUpdateEntry(initialData.id, data);
    } else {
      onAddEntry(data);
    }

    if (!initialData) {
      // Reset form only if adding
      setCpf('');
      setName('');
      setValue('');
      setDepositReason('');
      setDepositDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${initialData ? 'border-blue-200 ring-2 ring-blue-50' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {initialData ? (
            <Pencil className="w-5 h-5 text-blue-600" />
          ) : (
            <PlusCircle className="w-5 h-5 text-blue-600" />
          )}
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? 'Editar Registro' : 'Nova Entrada'}
          </h2>
        </div>
        {initialData && onCancel && (
          <button 
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Hash className="w-3 h-3" /> CPF
          </label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3 h-3" /> Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome Completo"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0,00"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Conta Depositada
          </label>
          <select
            value={depositAccount}
            onChange={(e) => setDepositAccount(e.target.value as DepositAccountType)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          >
            <option value="CPF">CPF</option>
            <option value="MEI">MEI</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Data do Depósito
          </label>
          <input
            type="date"
            value={depositDate}
            onChange={(e) => setDepositDate(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3 h-3" /> Motivo do Depósito
          </label>
          <input
            type="text"
            value={depositReason}
            onChange={(e) => setDepositReason(e.target.value)}
            placeholder="Ex: Pagamento de serviço"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Mês
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className={`w-full ${initialData ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2`}
          >
            {initialData ? (
              <>
                <Pencil className="w-4 h-4" /> Atualizar
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Adicionar
              </>
            )}
          </button>
          {initialData && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
