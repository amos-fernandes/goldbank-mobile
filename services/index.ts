import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

// --- Interfaces ---

export interface WalletBalance {
  balance: number;
  availableBalance: number;
  totalTransferValue: number;
  isDemo?: boolean;
  message?: string;
}

export interface PixDepositResponse {
  qrCodeBase64: string;
  qrCodePayload: string;
  value: number;
  chargeId: string;
}

export interface CryptoPrice {
  coin: string;
  last: number;
  open: number;
}

export interface BinancePrice {
  symbol: string;
  price: number;
}

export interface DashboardSummary {
  totalBalanceBRL: number;
  bankBalanceBRL: number;
  cryptoBalanceBRL: number;
  accountsCount: number;
  monthlyInflow: number;
  monthlyOutflow: number;
}

export interface Transaction {
  id: string;
  type: 'INFLOW' | 'OUTFLOW';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

// --- Hooks ---

export const useGetDashboardSummary = () => {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard/summary');
      return data;
    },
  });
};

export const useGetRecentTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const { data } = await api.get('/api/wallet/transactions');
      return data;
    },
  });
};

export const useGetWalletBalance = () => {
  return useQuery<WalletBalance>({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const { data } = await api.get('/api/wallet/balance');
      return data;
    },
  });
};

export const useCreatePixDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { data: { amount: number; description: string } }) => {
      const { data } = await api.post('/api/pix/deposit', payload.data);
      return data as PixDepositResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
  });
};

export const useGetMbPrices = () => {
  return useQuery<CryptoPrice[]>({
    queryKey: ['mb-prices'],
    queryFn: async () => {
      const { data } = await api.get('/api/crypto/mb/prices');
      return data;
    },
    refetchInterval: 30000,
  });
};

export const useGetBinancePrices = () => {
  return useQuery<BinancePrice[]>({
    queryKey: ['binance-prices'],
    queryFn: async () => {
      const { data } = await api.get('/api/crypto/binance/prices');
      return data;
    },
    refetchInterval: 30000,
  });
};

export const useBuyCrypto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { data: { coin: string; amountBRL: number } }) => {
      const { data } = await api.post('/api/crypto/buy', payload.data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
  });
};

export const useSaveMbCredentials = () => {
  return useMutation({
    mutationFn: async (payload: { data: { mbApiKey: string; mbApiSecret: string; mbAccountId: string } }) => {
      const { data } = await api.post('/api/user/mb-credentials', payload.data);
      return data;
    },
  });
};
