// 厉川外包项目管理平台 — 财务人员仪表盘
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { AlertCircle, Bot, CheckCircle, DollarSign, FileText, RefreshCw, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { contracts, invoices, monthlyRevenue } from '../lib/mockData';
import { toast } from 'sonner';
import { useAI } from '@/hooks/useAI';

export default function DashboardFinance() {
  const pendingInvoices = invoices.filter(i => i.status === '待审批');
  const paidInvoices = invoices.filter(i => i.status === '已付款');
  const totalContractAmount = contracts.reduce((s, c) => s + c.amount, 0);
  const totalPaid = contracts.reduce((s, c) => s + c.paidAmount, 0);

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
        <div className="bg-card border border-border rounded-xl p-4 card-accent-yellow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">待审批发票</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">{pendingInvoices.length} 张</div>
          <div className="text-xs text-muted-foreground mt-1">¥{pendingInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-blue">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">本月已付款</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-foreground">{paidInvoices.length} 张</div>
          <div className="text-xs text-muted-foreground mt-1">¥{paidInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}</div>
        </div>
      </div>

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

      {/* 待审批发票 */}
      <div>
        <div className="text-sm font-semibold text-foreground mb-3">待审批发票（需老板审批后出纳付款）</div>
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
                  <span className="badge-yellow px-2 py-0.5 rounded text-xs font-medium">等待老板审批</span>
                  <button
                    onClick={() => toast.info('请提醒老板审批后再出纳付款')}
                    className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-600/30 transition-colors"
                  >
                    通知老板
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
