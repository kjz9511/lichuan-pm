// 厉川外包项目管理平台 — 发票 & 结算页面
import { cn } from '@/lib/utils';
import { Plus, Upload } from 'lucide-react';
import { invoices } from '../lib/mockData';
import { toast } from 'sonner';

function InvoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    '待审批': 'badge-yellow',
    '已审批': 'badge-blue',
    '已付款': 'badge-green',
    '已驳回': 'badge-red',
  };
  return <span className={cn(map[status] || 'badge-gray', 'px-2 py-0.5 rounded text-xs font-medium')}>{status}</span>;
}

export default function InvoicesPage() {
  const pending = invoices.filter(i => i.status === '待审批');
  const paid = invoices.filter(i => i.status === '已付款');

  return (
    <div className="p-6 space-y-4">
      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 card-accent-yellow">
          <div className="text-xs text-muted-foreground mb-1">待审批</div>
          <div className="text-xl font-bold text-amber-400">{pending.length} 张</div>
          <div className="text-xs text-muted-foreground mt-1">¥{pending.reduce((s, i) => s + i.amount, 0).toLocaleString()}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-green">
          <div className="text-xs text-muted-foreground mb-1">已付款</div>
          <div className="text-xl font-bold text-emerald-400">{paid.length} 张</div>
          <div className="text-xs text-muted-foreground mt-1">¥{paid.reduce((s, i) => s + i.amount, 0).toLocaleString()}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-blue">
          <div className="text-xs text-muted-foreground mb-1">本月结算总额</div>
          <div className="text-xl font-bold text-foreground">¥{(invoices.reduce((s, i) => s + i.amount, 0) / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">{invoices.length} 张发票</div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">全部发票记录</div>
        <button
          onClick={() => toast.info('提交发票功能即将上线')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          提交发票
        </button>
      </div>

      {/* 发票列表 */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">发票编号</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">所属项目</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">供应商</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">金额</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">提交日期</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">状态</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{inv.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.projectName}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.vendor}</td>
                <td className="px-4 py-3 font-bold text-foreground">¥{inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.submitDate}</td>
                <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                <td className="px-4 py-3">
                  {inv.status === '待审批' && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toast.success(`已审批通过 ${inv.id}`)}
                        className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] hover:bg-emerald-600/30 transition-colors"
                      >
                        审批
                      </button>
                      <button
                        onClick={() => toast.info('付款功能即将上线')}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-[10px] hover:bg-blue-600/30 transition-colors"
                      >
                        出纳付款
                      </button>
                    </div>
                  )}
                  {inv.status === '已付款' && (
                    <span className="text-[10px] text-muted-foreground">付款日：{inv.payDate}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
