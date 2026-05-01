// PaymentRequestContext：管理 PM 发起的付款/收款申请，财务在发票页审核
import { createContext, useContext, useState, ReactNode } from 'react';

export type PaymentRequestStatus = '待财务审核' | '已审核' | '已完成' | '已驳回';

export interface PaymentRequest {
  id: string;
  contractId: string;
  contractName: string;
  projectId: string;
  projectName: string;
  stageIndex: number;
  stageName: string;
  amount: number;
  type: '收款' | '付款';
  initiator: string;        // PM 姓名
  initiatedAt: string;      // 发起日期
  status: PaymentRequestStatus;
  // 财务审核字段
  invoiceNo?: string;       // OCR 识别的发票号
  invoiceTax?: string;      // 税号
  invoiceDate?: string;     // 发票日期
  invoiceAmount?: number;   // 发票金额
  reviewer?: string;        // 财务审核人
  reviewedAt?: string;      // 审核日期
  reviewNote?: string;      // 审核备注
  // 完成字段
  completedAt?: string;     // 实际完成日期
  voucher?: string;         // 付款凭证
}

interface PaymentRequestContextType {
  requests: PaymentRequest[];
  addRequest: (req: PaymentRequest) => void;
  updateRequest: (id: string, patch: Partial<PaymentRequest>) => void;
}

const PaymentRequestContext = createContext<PaymentRequestContextType | null>(null);

// 初始 mock 数据
const INIT_REQUESTS: PaymentRequest[] = [
  {
    id: 'PR-001',
    contractId: 'HY-2026-001',
    contractName: '厉川官网重构项目服务合同',
    projectId: 'PRJ-2026-001',
    projectName: '厉川官网重构项目',
    stageIndex: 1,
    stageName: '第二期款',
    amount: 70000,
    type: '收款',
    initiator: '张伟',
    initiatedAt: '2026-04-28',
    status: '待财务审核',
  },
  {
    id: 'PR-002',
    contractId: 'WX-2026-001',
    contractName: '官网重构前端开发外协协议',
    projectId: 'PRJ-2026-001',
    projectName: '厉川官网重构项目',
    stageIndex: 1,
    stageName: '第二期款',
    amount: 45000,
    type: '付款',
    initiator: '张伟',
    initiatedAt: '2026-04-29',
    status: '待财务审核',
  },
];

export function PaymentRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<PaymentRequest[]>(INIT_REQUESTS);

  const addRequest = (req: PaymentRequest) => {
    setRequests(prev => [req, ...prev]);
  };

  const updateRequest = (id: string, patch: Partial<PaymentRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  return (
    <PaymentRequestContext.Provider value={{ requests, addRequest, updateRequest }}>
      {children}
    </PaymentRequestContext.Provider>
  );
}

export function usePaymentRequests() {
  const ctx = useContext(PaymentRequestContext);
  if (!ctx) throw new Error('usePaymentRequests must be used within PaymentRequestProvider');
  return ctx;
}
