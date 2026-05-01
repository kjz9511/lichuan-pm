// 厉川外包项目管理平台 — 财务人员仪表盘
// 设计：深色专业风格，数据驱动，收付款流程闭环
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle, DollarSign, FileText, Receipt, ScanLine } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { contracts, invoices, monthlyRevenue } from '../lib/mockData';
import { usePaymentRequests } from '@/contexts/PaymentRequestContext';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function DashboardFinance() {
  const [, navigate] = useLocation();
  const { requests: paymentRequests, updateRequest } = usePaymentRequests();
  const [localInvoices, setLocalInvoices] = useState(invoices);

  const pendingInvoices = localInvoices.filter(i => i.status === '待审批');
  const paidInvoices = localInvoices.filter(i => i.status === '已付款');
  const totalContractAmount = contracts.reduce((s, c) => s + c.amount, 0);
  const totalPaid = contracts.reduce((s, c) => s + c.paidAmount, 0);

  const pendingPaymentRequests = paymentRequests.filter(r => r.status === '待财务审核');
  const completedRequests = paymentRequests.filter(r => r.status === '已完成');

  const handleApproveInvoice = (id: string) => {
    setLocalInvoices(prev => prev.map(i => i.id === id ? { ...i, status: '已付款' } : i));
    toast.success(`发票 ${id} 已审批通过`);
  };

  const handleRejectInvoice = (id: string) => {
    setLocalInvoices(prev => prev.map(i => i.id === id ? { ...i, status: '已驳回' } : i));
    toast.error(`发票 ${id} 已驳回`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 财务结算看板 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 card-accent-blue">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">合同总金额</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-foreground">¥{(totalContractAmount / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">{contracts.length} 份合同</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-green">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">已回款</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">¥{(totalPaid / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">{((totalPaid / totalContractAmount) * 100).toFixed(0)}% 完成率</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-yellow cursor-pointer hover:border-amber-400/50 transition-colors" onClick={() => navigate('/invoices')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">待处理申请</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">{pendingPaymentRequests.length + pendingInvoices.length}</div>
          <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">前往处理 <ArrowRight className="w-3 h-3" /></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-blue">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">本月已完成</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-foreground">{paidInvoices.length + completedRequests.length}</div>
          <div className="text-xs text-muted-foreground mt-1">发票 + 收付款</div>
        </div>
      </div>

      {/* 收付款申请快速处理 */}
      {pendingPaymentRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-400" />
              待处理收付款申请
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded font-medium">{pendingPaymentRequests.length}</span>
            </div>
            <button onClick={() => navigate('/invoices')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              全部处理 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {pendingPaymentRequests.slice(0, 3).map(req => (
              <div key={req.id} className="bg-card border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', req.type === '收款' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400')}>
                        {req.type === '收款' ? '↑ 收款申请' : '↓ 付款申请'}
                      </span>
                      <span className="text-xs font-medium text-foreground">{req.contractName}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">{req.projectName} · PM: {req.initiator} · 申请日: {req.initiatedAt}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">¥{req.amount.toLocaleString()}</span>
                    <button
                      onClick={() => navigate('/invoices')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-600/30 transition-colors"
                    >
                      <ScanLine className="w-3 h-3" /> OCR 审核
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 待审批发票 */}
      {pendingInvoices.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            待审批发票
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded font-medium">{pendingInvoices.length}</span>
          </div>
          <div className="space-y-2">
            {pendingInvoices.map(inv => (
              <div key={inv.id} className="bg-card border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-foreground">{inv.id} · {inv.vendor}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{inv.projectName} · 提交：{inv.submitDate}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-amber-400">¥{inv.amount.toLocaleString()}</span>
                    <button
                      onClick={() => handleApproveInvoice(inv.id)}
                      className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] hover:bg-emerald-600/30 transition-colors"
                    >
                      同意
                    </button>
                    <button
                      onClick={() => handleRejectInvoice(inv.id)}
                      className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-[10px] hover:bg-red-600/30 transition-colors"
                    >
                      驳回
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingInvoices.length === 0 && pendingPaymentRequests.length === 0 && (
        <div className="bg-card border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-sm font-medium text-foreground">当前无待处理事项</div>
            <div className="text-xs text-muted-foreground mt-0.5">所有收付款申请和发票均已处理完毕</div>
          </div>
        </div>
      )}

      {/* 月度收款趋势 */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-sm font-semibold text-foreground mb-4">月度收款趋势（万元）</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyRevenue} barSize={32}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 10000}万`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`¥${(v / 10000).toFixed(0)}万`, '收款']}
            />
            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 合同到期预警 */}
      <div>
        <div className="text-sm font-semibold text-foreground mb-3">协议到期检查（30天内）</div>
        <div className="bg-card border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-foreground">CON-2026-004 · AI客服机器人接入外包协议</div>
              <div className="text-xs text-muted-foreground mt-0.5">智能云科技 · 到期日：2026-04-30 · 距今 <span className="text-red-400 font-medium">3天</span></div>
              <div className="text-xs text-amber-400 mt-1">⚠ 尾款 ¥36,000 已逾期，请及时催款</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
