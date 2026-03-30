import { useState, useEffect } from 'react';
import { LayoutDashboard, PieChart, Settings, LogOut, Search, Loader2, AlertCircle, BarChart3, Download, Filter } from 'lucide-react';
import { FinancialEntry } from './types';
import { FinancialForm } from './components/FinancialForm';
import { FinancialTable } from './components/FinancialTable';
import { SummaryCards } from './components/SummaryCards';
import { FinancialCharts } from './components/FinancialCharts';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';

type Tab = 'dashboard' | 'reports';

export default function App() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('Todos');

  const months = [
    'Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [isMigrating, setIsMigrating] = useState(false);

  // Check if Supabase is configured
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL)) && 
                               !!(import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY));

  const hasLocalData = !!localStorage.getItem('financial_entries') && JSON.parse(localStorage.getItem('financial_entries') || '[]').length > 0;

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchEntries();
    } else {
      // Fallback to local storage if Supabase is not configured
      const saved = localStorage.getItem('financial_entries');
      setEntries(saved ? JSON.parse(saved) : []);
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  const handleMigrateData = async () => {
    if (!isSupabaseConfigured) return;
    
    const saved = localStorage.getItem('financial_entries');
    if (!saved) return;
    
    const localEntries: FinancialEntry[] = JSON.parse(saved);
    if (localEntries.length === 0) return;

    if (!confirm(`Deseja migrar ${localEntries.length} registros do armazenamento local para o banco de dados Supabase?`)) return;

    try {
      setIsMigrating(true);
      setError(null);

      // Insert all local entries into Supabase
      const { error } = await supabase
        .from('financial_entries')
        .insert(localEntries.map(entry => ({
          cpf: entry.cpf,
          name: entry.name,
          value: entry.value,
          deposit_account: entry.depositAccount,
          deposit_date: entry.depositDate,
          deposit_reason: entry.depositReason,
          month: entry.month,
          created_at: new Date(entry.createdAt).toISOString()
        })));

      if (error) throw error;

      // Clear local storage after successful migration
      localStorage.removeItem('financial_entries');
      alert('Dados migrados com sucesso!');
      fetchEntries();
    } catch (err: any) {
      console.error('Error migrating data:', err);
      setError('Erro ao migrar dados para o Supabase. Verifique se a tabela existe.');
    } finally {
      setIsMigrating(false);
    }
  };

  const fetchEntries = async () => {
    if (!supabase) {
      setError('Supabase não está configurado corretamente.');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('financial_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database snake_case to camelCase
      const mappedData: FinancialEntry[] = (data || []).map(item => ({
        id: item.id,
        cpf: item.cpf,
        name: item.name,
        value: item.value,
        depositAccount: item.deposit_account,
        depositDate: item.deposit_date,
        depositReason: item.deposit_reason,
        month: item.month,
        createdAt: new Date(item.created_at).getTime(),
      }));

      setEntries(mappedData);
    } catch (err: any) {
      console.error('Error fetching entries:', err);
      setError('Erro ao carregar dados do Supabase. Verifique a configuração.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async (entryData: Omit<FinancialEntry, 'id' | 'createdAt'>) => {
    if (!isSupabaseConfigured || !supabase) {
      const newEntry: FinancialEntry = {
        ...entryData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('financial_entries', JSON.stringify(updatedEntries));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('financial_entries')
        .insert([{
          cpf: entryData.cpf,
          name: entryData.name,
          value: entryData.value,
          deposit_account: entryData.depositAccount,
          deposit_date: entryData.depositDate,
          deposit_reason: entryData.depositReason,
          month: entryData.month,
        }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const item = data[0];
        const newEntry: FinancialEntry = {
          id: item.id,
          cpf: item.cpf,
          name: item.name,
          value: item.value,
          depositAccount: item.deposit_account,
          depositDate: item.deposit_date,
          depositReason: item.deposit_reason,
          month: item.month,
          createdAt: new Date(item.created_at).getTime(),
        };
        setEntries([newEntry, ...entries]);
      }
    } catch (err: any) {
      console.error('Error adding entry:', err);
      alert('Erro ao salvar no banco de dados.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    if (!isSupabaseConfigured || !supabase) {
      const updatedEntries = entries.filter(e => e.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem('financial_entries', JSON.stringify(updatedEntries));
      return;
    }

    try {
      const { error } = await supabase
        .from('financial_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(entries.filter(e => e.id !== id));
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      alert('Erro ao excluir do banco de dados.');
    }
  };

  const handleUpdateEntry = async (id: string, entryData: Omit<FinancialEntry, 'id' | 'createdAt'>) => {
    if (!isSupabaseConfigured || !supabase) {
      const updatedEntries = entries.map(e => 
        e.id === id ? { ...e, ...entryData } : e
      );
      setEntries(updatedEntries);
      localStorage.setItem('financial_entries', JSON.stringify(updatedEntries));
      setEditingEntry(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('financial_entries')
        .update({
          cpf: entryData.cpf,
          name: entryData.name,
          value: entryData.value,
          deposit_account: entryData.depositAccount,
          deposit_date: entryData.depositDate,
          deposit_reason: entryData.depositReason,
          month: entryData.month,
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const item = data[0];
        const updatedEntry: FinancialEntry = {
          id: item.id,
          cpf: item.cpf,
          name: item.name,
          value: item.value,
          depositAccount: item.deposit_account,
          depositDate: item.deposit_date,
          depositReason: item.deposit_reason,
          month: item.month,
          createdAt: new Date(item.created_at).getTime(),
        };
        setEntries(entries.map(e => e.id === id ? updatedEntry : e));
        setEditingEntry(null);
      }
    } catch (err: any) {
      console.error('Error updating entry:', err);
      alert('Erro ao atualizar no banco de dados.');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.cpf.includes(searchTerm);
    const matchesMonth = selectedMonth === 'Todos' || entry.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const handleExportCSV = () => {
    if (filteredEntries.length === 0) return;

    const headers = ['CPF', 'Nome', 'Valor', 'Conta', 'Data Depósito', 'Motivo', 'Mês', 'Data Criação'];
    const csvRows = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        `"${entry.cpf}"`,
        `"${entry.name}"`,
        entry.value,
        `"${entry.depositAccount}"`,
        `"${entry.depositDate}"`,
        `"${entry.depositReason}"`,
        `"${entry.month}"`,
        `"${new Date(entry.createdAt).toLocaleString('pt-BR')}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financeiro_${selectedMonth.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <PieChart className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Finance.io</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Painel
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-all ${
              activeTab === 'reports' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Relatórios
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-all">
            <Settings className="w-5 h-5" />
            Configurações
          </a>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' ? 'Controle Financeiro' : 'Relatórios Detalhados'}
            </h1>
            <p className="text-sm text-gray-500">
              {activeTab === 'dashboard' 
                ? 'Gerencie suas entradas e saídas de forma simplificada.' 
                : 'Visualize o desempenho financeiro através de gráficos e tabelas.'}
            </p>
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <p>
                <strong>Supabase não configurado:</strong> Os dados estão sendo salvos apenas localmente. 
                Configure as variáveis de ambiente no menu Secrets para usar o banco de dados.
              </p>
            </div>
          )}

          {isSupabaseConfigured && hasLocalData && entries.length === 0 && !isLoading && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between gap-3 text-blue-800 text-sm">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-500" />
                <p>
                  <strong>Migração de Dados:</strong> Você possui dados salvos localmente que não estão no Supabase. 
                  Deseja migrá-los agora?
                </p>
              </div>
              <button 
                onClick={handleMigrateData}
                disabled={isMigrating}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isMigrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Migrar Dados
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-500 font-medium">Carregando seus dados...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isLoading && (
              activeTab === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <SummaryCards entries={entries} />
                  <FinancialForm 
                    onAddEntry={handleAddEntry} 
                    onUpdateEntry={handleUpdateEntry}
                    initialData={editingEntry}
                    onCancel={() => setEditingEntry(null)}
                    entries={entries}
                  />
                  
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-blue-900 font-semibold">Deseja ver os relatórios?</h4>
                      <p className="text-blue-700 text-sm">Acesse a aba de relatórios para ver os gráficos de desempenho.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('reports')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Ver Relatórios
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <FinancialCharts entries={filteredEntries} selectedMonth={selectedMonth} />

                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">Todos os Registros</h3>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                          {filteredEntries.length} {filteredEntries.length === 1 ? 'Registro' : 'Registros'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm appearance-none cursor-pointer min-w-[160px]"
                          >
                            {months.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleExportCSV}
                          disabled={filteredEntries.length === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-100"
                        >
                          <Download className="w-4 h-4" />
                          Exportar CSV
                        </button>
                      </div>
                    </div>
                    
                    <FinancialTable 
                      entries={filteredEntries} 
                      onDelete={handleDeleteEntry} 
                      onEdit={(entry) => {
                        setEditingEntry(entry);
                        setActiveTab('dashboard');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
