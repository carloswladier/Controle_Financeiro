export type DepositAccountType = 'CPF' | 'MEI';

export interface FinancialEntry {
  id: string;
  cpf: string;
  name: string;
  value: number;
  depositAccount: DepositAccountType;
  depositDate: string;
  depositReason: string;
  month: string;
  createdAt: number;
}
