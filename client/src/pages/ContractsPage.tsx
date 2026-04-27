// 厉川外包项目管理平台 — 合同管理页面
// 设计风格：深色专业管理台风，甲方合同 + 外包协议 + 回款节点

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { contracts, Contract } from '../lib/mockData';
import { toast } from 'sonner';

function ContractTypeBadge({ type }: { type: string }) {
  return type === '甲方合同'
    ? <span className="badge-blue px-2 py-0.5 rounded text-xs font-medium">甲方合同</span>
    : <span className="badge-yellow px-2 py-0.5 rounded text-xs font-medium">外包协议</span>;
}

function ContractStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    '已签署': 'badge-green',
    '待签署': 'badge-yellow',
    '已到期': 'badge-red',
  };
  return <span className={cn(map[status] || 'badge-gray', 'px-2 py-0.5 rounded text-xs font-medium')}>{status}</span>;
}

function PaymentStageBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    '已回款': 'badge-green',
    '未回款': 'badge-gray',
    '已逾期': 'badge-red',
  };
  return <span className={cn(map[status] || 'badge-gray', 'px-2 py-0.5 rounded text-[10px] font-medium')}>{status}</span>;
}

function ContractCard({ contract }: { contract: Contract }) {
  const [expanded, setExpanded] = useState(false);
  const paidRatio = contract.paidAmount / contract.amount;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div
        className="px-4 py-4 cursor-pointer hover:bg-accent/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{contract.id}</span>
              <ContractTypeBadge type={contract.type} />
              <ContractStatusBadge status={contract.status} />
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {contract.projectName} · {contract.vendor} · 签约：{contract.signDate} · 截止：{contract.endDate}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidRatio * 100}%` }} />
              </div>
              <span className="text-xs text-emerald-400 font-medium">{(paidRatio * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-foreground">¥{contract.amount.toLocaleString()}</div>
            <div className="text-xs text-emerald-400">已付 ¥{contract.paidAmount.toLocaleString()}</div>
            <div className="text-xs text-amber-400">待付 ¥{contract.pendingAmount.toLocaleString()}</div>
          </div>
          <div className="shrink-0 self-center ml-2">
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-3 bg-secondary/20">
          <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">分期回款节点</div>
          <div className="space-y-2">
            {contract.stages.map((stage, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                    stage.status === '已回款' ? 'bg-emerald-500/20 text-emerald-400' :
                    stage.status === '已逾期' ? 'bg-red-500/20 text-red-400' :
                    'bg-secondary text-muted-foreground'
                  )}>
                    {stage.status === '已回款' ? '✓' : i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground">{stage.name}</div>
                    <div className="text-[10px] text-muted-foreground">到期日：{stage.dueDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-foreground">¥{stage.amount.toLocaleString()}</span>
                  <PaymentStageBadge status={stage.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContractsPage() {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = contracts.filter(c =>
    filterType === 'all' || c.type === filterType
  );

  const totalAmount = contracts.reduce((s, c) => s + c.amount, 0);
  const totalPaid = contracts.reduce((s, c) => s + c.paidAmount, 0);
  const totalPending = contracts.reduce((s, c) => s + c.pendingAmount, 0);

  return (
    <div className="p-6 space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 card-accent-blue">
          <div className="text-xs text-muted-foreground mb-1">合同总金额</div>
          <div className="text-xl font-bold text-foreground">¥{(totalAmount / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">{contracts.length} 份合同</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-green">
          <div className="text-xs text-muted-foreground mb-1">已回款</div>
          <div className="text-xl font-bold text-emerald-400">¥{(totalPaid / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">{((totalPaid / totalAmount) * 100).toFixed(0)}% 完成率</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-yellow">
          <div className="text-xs text-muted-foreground mb-1">待回款</div>
          <div className="text-xl font-bold text-amber-400">¥{(totalPending / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">需跟进催款</div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {[
            { value: 'all', label: '全部' },
            { value: '甲方合同', label: '甲方合同' },
            { value: '外包协议', label: '外包协议' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs transition-colors',
                filterType === f.value
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-muted-foreground hover:bg-accent border border-transparent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => toast.info('新建合同功能即将上线')}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          录入合同
        </button>
      </div>

      {/* 合同列表 */}
      <div className="space-y-3">
        {filtered.map(c => (
          <ContractCard key={c.id} contract={c} />
        ))}
      </div>
    </div>
  );
}
