// ContractContext — 全局合同状态管理
// 立项时自动写入甲方合同；项目执行中 PM 发起外协合同
// 合同管理页直接消费此 Context，无需独立录入入口
import React, { createContext, useContext, useState } from 'react';
import { contracts as initialContracts, Contract } from '../lib/mockData';

interface ContractContextType {
  contracts: Contract[];
  addContract: (c: Contract) => void;
  updateContract: (id: string, patch: Partial<Contract>) => void;
}

const ContractContext = createContext<ContractContextType | null>(null);

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);

  function addContract(c: Contract) {
    setContracts(prev => [...prev, c]);
  }

  function updateContract(id: string, patch: Partial<Contract>) {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  return (
    <ContractContext.Provider value={{ contracts, addContract, updateContract }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContracts() {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error('useContracts must be used within ContractProvider');
  return ctx;
}
