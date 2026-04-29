// 项目移交审批 Context
// 管理 PM 发起的移交申请，老板审批后正式生效

import React, { createContext, useContext, useState } from 'react';

export interface TransferRequest {
  id: string;
  projectId: string;
  projectName: string;
  fromPM: string;
  toPM: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

interface TransferContextType {
  requests: TransferRequest[];
  addRequest: (req: Omit<TransferRequest, 'id' | 'status' | 'createdAt'>) => void;
  approveRequest: (id: string, onApproved?: (projectId: string, newManager: string) => void) => void;
  rejectRequest: (id: string) => void;
  pendingCount: number;
}

const TransferContext = createContext<TransferContextType | null>(null);

export function TransferProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<TransferRequest[]>([]);

  function addRequest(req: Omit<TransferRequest, 'id' | 'status' | 'createdAt'>) {
    const newReq: TransferRequest = {
      ...req,
      id: `TR-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRequests(prev => [newReq, ...prev]);
  }

  function approveRequest(id: string, onApproved?: (projectId: string, newManager: string) => void) {
    setRequests(prev => {
      const req = prev.find(r => r.id === id);
      if (req && onApproved) {
        onApproved(req.projectId, req.toPM);
      }
      return prev.map(r => r.id === id ? { ...r, status: 'approved', reviewedAt: new Date().toISOString().slice(0, 10) } : r);
    });
  }

  function rejectRequest(id: string) {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString().slice(0, 10) } : r)
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <TransferContext.Provider value={{ requests, addRequest, approveRequest, rejectRequest, pendingCount }}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  const ctx = useContext(TransferContext);
  if (!ctx) throw new Error('useTransfer must be used within TransferProvider');
  return ctx;
}
