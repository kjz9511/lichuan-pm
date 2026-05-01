// 全局发票 Context
// 供供应商提交发票和财务审核共享数据
import React, { createContext, useContext, useState } from 'react';
import { invoices as initialInvoices, Invoice } from '../lib/mockData';

interface InvoiceContextType {
  invoiceList: Invoice[];
  addInvoice: (inv: Invoice) => void;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
}

const InvoiceContext = createContext<InvoiceContextType | null>(null);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(initialInvoices);

  function addInvoice(inv: Invoice) {
    setInvoiceList(prev => [inv, ...prev]);
  }

  function updateInvoice(id: string, patch: Partial<Invoice>) {
    setInvoiceList(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  return (
    <InvoiceContext.Provider value={{ invoiceList, addInvoice, updateInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoices must be used within InvoiceProvider');
  return ctx;
}
