// 厉川外包项目管理平台 — 合同管理页面
// 设计风格：深色专业管理台风
// 逻辑：公司合同（甲方）= 主合同，立项时绑定；外协合同（分包）= 子合同，执行阶段创建，挂靠主合同
// 展示方式：以项目为分组，主合同在上，外协合同缩进展示在主合同下方

import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Bot,
  Building2,
  ChevronDown,
  ChevronUp,
  FileText,
  GitBranch,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Contract, contracts as mockContracts, projects } from '../lib/mockData';
import { useContracts } from '../contexts/ContractContext';
import { toast } from 'sonner';
import { useAI } from '@/hooks/useAI';

// ─── Badge 组件 ───────────────────────────────────────────────
function ContractTypeBadge({ type }: { type: string }) {
  return type === '甲方合同'
    ? <span className="badge-blue px-2 py-0.5 rounded text-xs font-medium">甲方合同</span>
    : <span className="badge-yellow px-2 py-0.5 rounded text-xs font-medium">外协合同</span>;
}

function ContractStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { '已签署': 'badge-green', '待签署': 'badge-yellow', '已到期': 'badge-red' };
  return <span className={cn(map[status] || 'badge-gray', 'px-2 py-0.5 rounded text-xs font-medium')}>{status}</span>;
}

function PaymentStageBadge({ status }: { status: string }) {
  const map: Record<string, string> = { '已回款': 'badge-green', '未回款': 'badge-gray', '已逾期': 'badge-red' };
  return <span className={cn(map[status] || 'badge-gray', 'px-2 py-0.5 rounded text-[10px] font-medium')}>{status}</span>;
}

// ─── 合同卡片（主合同 or 子合同） ─────────────────────────────
function ContractCard({ contract, isChild = false }: { contract: Contract; isChild?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const { run: runAI, loading: aiLoading } = useAI({ stream: true });
  const paidRatio = contract.amount > 0 ? contract.paidAmount / contract.amount : 0;

  const handleAISummary = async () => {
    setAiOpen(true);
    setAiSummary('');
    const stagesText = contract.stages.map(s =>
      `${s.name}：¥${s.amount.toLocaleString()}，到期${s.dueDate}，状态${s.status}`
    ).join('；');
    const prompt = `你是一位专业的合同风险分析师。请对以下合同信息进行简洁分析，输出3个部分：
1. 【核心摘要】用2-3句话概括合同要点
2. 【风险提示】列出1-3个潜在风险点（如逾期、金额异常、条款缺失等）
3. 【行动建议】给出1-2条具体的跟进建议

合同信息：
- 合同名称：${contract.contractName}
- 合同编号：${contract.contractNo || '未填写'}
- 合同类型：${contract.type}
- 对方主体：${contract.vendor}
- 合同金额：¥${contract.amount.toLocaleString()}
- 已${contract.type === '甲方合同' ? '收' : '付'}：¥${contract.paidAmount.toLocaleString()}（${(paidRatio * 100).toFixed(0)}%）
- 待${contract.type === '甲方合同' ? '收' : '付'}：¥${contract.pendingAmount.toLocaleString()}
- 签订日期：${contract.signDate}
- 合同周期：${contract.startDate} 至 ${contract.endDate}
- 合同状态：${contract.status}
- 合同信息：${contract.contractInfo || '未填写'}
- 分期节点：${stagesText || '无'}

请用中文回答，语言简洁专业，每个部分不超过100字。`;

    await runAI(
      [
        { role: 'system', content: '你是厉川外包项目管理平台的AI助手，专注于合同风险分析与项目管理建议。' },
        { role: 'user', content: prompt }
      ],
      (chunk) => setAiSummary(prev => prev + chunk)
    );
  };

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden transition-all',
      isChild
        ? 'bg-secondary/30 border-border/50 ml-6 border-l-2 border-l-amber-500/40'
        : 'bg-card border-border'
    )}>
      <div
        className="px-4 py-3.5 cursor-pointer hover:bg-accent/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
            isChild ? 'bg-amber-500/15' : 'bg-blue-600/15'
          )}>
            {isChild
              ? <GitBranch className="w-4 h-4 text-amber-400" />
              : <FileText className="w-4 h-4 text-blue-400" />
            }
          </div>

          <div className="flex-1 min-w-0">
            {/* 标题行 */}
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{contract.contractName}</span>
              <ContractTypeBadge type={contract.type} />
              <ContractStatusBadge status={contract.status} />
            </div>
            {/* 副标题 */}
            <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded">{contract.contractNo}</span>
              <span>{contract.type === '甲方合同' ? '甲方：' : '外协方：'}{contract.vendor}</span>
              <span>签约：{contract.signDate}</span>
              <span>计划：{contract.startDate} ~ {contract.endDate}</span>
            </div>
            {/* 回款进度 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[160px]">
                <div
                  className={cn('h-full rounded-full', isChild ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${paidRatio * 100}%` }}
                />
              </div>
              <span className={cn('text-xs font-medium', isChild ? 'text-amber-400' : 'text-emerald-400')}>
                {(paidRatio * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {isChild ? '已付' : '已收'} ¥{contract.paidAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 金额 + 展开 */}
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-foreground">¥{contract.amount.toLocaleString()}</div>
            <div className={cn('text-xs', isChild ? 'text-amber-400' : 'text-emerald-400')}>
              {isChild ? '已付' : '已收'} ¥{contract.paidAmount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              待{isChild ? '付' : '收'} ¥{contract.pendingAmount.toLocaleString()}
            </div>
          </div>
          <div className="shrink-0 self-center ml-1">
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {/* 展开详情 */}
      {expanded && (
        <div className="border-t border-border/50 px-4 py-3 bg-secondary/10 space-y-3">
          {/* 合同信息 & 备注 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">合同信息</div>
              <div className="text-xs text-foreground leading-relaxed">{contract.contractInfo || '—'}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">备注</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{contract.remark || '—'}</div>
            </div>
          </div>

          {/* 分期节点 */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {contract.type === '甲方合同' ? '分期收款节点' : '分期付款节点'}
            </div>
            <div className="space-y-1.5">
              {contract.stages.map((stage, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
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
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium text-foreground">¥{stage.amount.toLocaleString()}</span>
                    <PaymentStageBadge status={stage.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 录入合同弹窗 ──────────────────────────────────────────────
type ContractType = '甲方合同' | '外协合同';

interface ContractFormState {
  contractType: ContractType;
  contractName: string;
  contractNo: string;
  contractInfo: string;
  remark: string;
  vendor: string;
  amount: string;
  signDate: string;
  startDate: string;
  endDate: string;
  projectId: string;
  parentContractId: string;
  payMethod: string;
  payAccount: string;
  stages: { name: string; amount: string; dueDate: string }[];
}

const EMPTY_FORM: ContractFormState = {
  contractType: '甲方合同',
  contractName: '',
  contractNo: '',
  contractInfo: '',
  remark: '',
  vendor: '',
  amount: '',
  signDate: '',
  startDate: '',
  endDate: '',
  projectId: '',
  parentContractId: '',
  payMethod: '银行转账',
  payAccount: '',
  stages: [{ name: '首付款', amount: '', dueDate: '' }],
};

function ContractFormModal({
  onClose,
  defaultType,
}: {
  onClose: () => void;
  defaultType?: ContractType;
}) {
  const [form, setForm] = useState<ContractFormState>({
    ...EMPTY_FORM,
    contractType: defaultType || '甲方合同',
  });

  // 主合同列表（供外协合同关联）
  const mainContracts = mockContracts.filter((c: Contract) => c.type === '甲方合同');

  function addStage() {
    setForm(f => ({ ...f, stages: [...f.stages, { name: '', amount: '', dueDate: '' }] }));
  }
  function removeStage(i: number) {
    setForm(f => ({ ...f, stages: f.stages.filter((_, idx) => idx !== i) }));
  }
  function updateStage(i: number, field: string, value: string) {
    setForm(f => ({
      ...f,
      stages: f.stages.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contractName || !form.vendor || !form.amount || !form.signDate) {
      toast.error('请填写必填项：合同名称、对方单位、合同金额、签订时间');
      return;
    }
    if (form.contractType === '外协合同' && !form.parentContractId) {
      toast.error('外协合同需关联对应的主合同（甲方合同）');
      return;
    }
    toast.success(`合同「${form.contractName}」录入成功，等待签署确认`);
    onClose();
  }

  const inputCls = 'w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';
  const labelCls = 'text-xs font-medium text-foreground mb-1.5 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-base font-bold text-foreground">录入合同</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {form.contractType === '甲方合同'
                ? '公司合同 — 与甲方客户签订，立项时绑定'
                : '外协合同 — 项目执行阶段分包给外部供应商'}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* 合同类型切换 */}
          <div className="flex gap-2 p-1 bg-secondary rounded-xl">
            {(['甲方合同', '外协合同'] as ContractType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, contractType: t }))}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
                  form.contractType === t
                    ? t === '甲方合同'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === '甲方合同' ? <FileText className="w-3.5 h-3.5" /> : <GitBranch className="w-3.5 h-3.5" />}
                {t}
                <span className="text-[10px] opacity-70">
                  {t === '甲方合同' ? '（主合同）' : '（子合同）'}
                </span>
              </button>
            ))}
          </div>

          {/* 外协合同：关联主合同 */}
          {form.contractType === '外协合同' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <label className={cn(labelCls, 'text-amber-400')}>
                关联主合同（甲方合同）<span className="text-red-400 ml-0.5">★</span>
              </label>
              <select
                value={form.parentContractId}
                onChange={e => setForm(f => ({ ...f, parentContractId: e.target.value }))}
                className={inputCls}
              >
                <option value="">请选择关联的甲方合同</option>
                {mainContracts.map(c => (
                  <option key={c.id} value={c.id}>{c.contractName}（{c.projectName}）</option>
                ))}
              </select>
              <div className="text-[10px] text-amber-400/70 mt-1.5">外协合同挂靠在对应的甲方合同下，体现分包关系</div>
            </div>
          )}

          {/* 基础信息 */}
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">基础信息</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>合同名称 <span className="text-red-400">★</span></label>
                <input
                  type="text"
                  value={form.contractName}
                  onChange={e => setForm(f => ({ ...f, contractName: e.target.value }))}
                  placeholder="请输入合同名称"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>合同编号</label>
                <input
                  type="text"
                  value={form.contractNo}
                  onChange={e => setForm(f => ({ ...f, contractNo: e.target.value }))}
                  placeholder="如：HT-2026-004（可留空自动生成）"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                {form.contractType === '甲方合同' ? '甲方单位' : '外协供应商'} <span className="text-red-400">★</span>
              </label>
              <input
                type="text"
                value={form.vendor}
                onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                placeholder={form.contractType === '甲方合同' ? '请输入甲方客户名称' : '请输入外包供应商名称（公司/个人均可）'}
                className={inputCls}
              />
            </div>
            {/* 外协合同：付款方式 */}
            {form.contractType === '外协合同' && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-3">
                <div className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">付款方式</div>
                <div className="grid grid-cols-4 gap-2">
                  {['银行转账', '支付宝', '微信', '直接打账'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, payMethod: m }))}
                      className={`py-2 rounded-lg text-xs font-medium transition-all border ${
                        form.payMethod === m
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {m === '支付宝' ? '💙 支付宝' : m === '微信' ? '💚 微信' : m === '银行转账' ? '🏦 银行转账' : '💰 直接打账'}
                    </button>
                  ))}
                </div>
                <div>
                  <label className={labelCls}>
                    {form.payMethod === '银行转账' ? '银行账号/户名' :
                     form.payMethod === '支付宝' ? '支付宝账号' :
                     form.payMethod === '微信' ? '微信号/收款码备注' : '收款人/账户信息'}
                  </label>
                  <input
                    type="text"
                    value={form.payAccount}
                    onChange={e => setForm(f => ({ ...f, payAccount: e.target.value }))}
                    placeholder={
                      form.payMethod === '银行转账' ? '如：工商银行 6222xxxx / 张三' :
                      form.payMethod === '支付宝' ? '如：138xxxx 或邮箱' :
                      form.payMethod === '微信' ? '如：微信号 wxid_xxx 或手机号' : '收款人姓名 / 账户备注'
                    }
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>合同信息</label>
              <textarea
                value={form.contractInfo}
                onChange={e => setForm(f => ({ ...f, contractInfo: e.target.value }))}
                placeholder="简要描述合同的服务内容、交付范围等..."
                rows={2}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className={labelCls}>合同备注</label>
              <textarea
                value={form.remark}
                onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                placeholder="特殊条款、注意事项、内部备注等..."
                rows={2}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* 金额与时间 */}
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">金额与时间</div>

            <div>
              <label className={labelCls}>合同金额（元）<span className="text-red-400">★</span></label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="请输入合同总金额"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>合同签订时间 <span className="text-red-400">★</span></label>
                <input type="date" value={form.signDate} onChange={e => setForm(f => ({ ...f, signDate: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>项目计划开始</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>项目计划结束</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={inputCls} />
              </div>
            </div>
          </div>

          {/* 分期节点 */}
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {form.contractType === '甲方合同' ? '分期收款节点' : '分期付款节点'}
              </div>
              <button
                type="button"
                onClick={addStage}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                添加节点
              </button>
            </div>
            <div className="space-y-2">
              {form.stages.map((stage, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-bold shrink-0">{i + 1}</div>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={e => updateStage(i, 'name', e.target.value)}
                    placeholder="节点名称（如：首付款）"
                    className="flex-1 h-8 px-2.5 bg-input border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    type="number"
                    value={stage.amount}
                    onChange={e => updateStage(i, 'amount', e.target.value)}
                    placeholder="金额（元）"
                    className="w-28 h-8 px-2.5 bg-input border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    type="date"
                    value={stage.dueDate}
                    onChange={e => updateStage(i, 'dueDate', e.target.value)}
                    className="w-32 h-8 px-2.5 bg-input border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {form.stages.length > 1 && (
                    <button type="button" onClick={() => removeStage(i)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 提交 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 bg-secondary hover:bg-accent text-foreground text-sm font-medium rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              确认录入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────
// 只读汇总视角：老板看全局合同状态，财务看付款情况
// 甲方合同由立项流程自动写入，外协合同由 PM 在项目台账发起
export default function ContractsPage() {
  const [filterType, setFilterType] = useState<string>('all');
  // 从全局 Context 获取合同列表（包含立项自动写入的甲方合同 + PM 发起的外协合同）
  const { contracts } = useContracts();

  // 按项目分组，主合同在前，外协合同挂靠
  const mainContracts = contracts.filter(c => c.type === '甲方合同');
  const subContracts = contracts.filter(c => c.type === '外包协议');

  // 统计
  const totalMain = mainContracts.reduce((s, c) => s + c.amount, 0);
  const totalSub = subContracts.reduce((s, c) => s + c.amount, 0);
  const totalMainPaid = mainContracts.reduce((s, c) => s + c.paidAmount, 0);
  const totalSubPaid = subContracts.reduce((s, c) => s + c.paidAmount, 0);

  // 按项目聚合展示
  const projectGroups = projects.filter(p => {
    const hasMain = mainContracts.some(c => c.projectId === p.id);
    const hasSub = subContracts.some(c => c.projectId === p.id);
    if (filterType === '甲方合同') return hasMain;
    if (filterType === '外协合同') return hasSub;
    return hasMain || hasSub;
  });  return (
    <div className="p-6 space-y-5">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 card-accent-blue">
          <div className="text-xs text-muted-foreground mb-1">甲方合同总额</div>
          <div className="text-xl font-bold text-foreground">¥{(totalMain / 10000).toFixed(0)}万</div>
          <div className="text-xs text-emerald-400 mt-1">已收 ¥{(totalMainPaid / 10000).toFixed(0)}万</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-yellow">
          <div className="text-xs text-muted-foreground mb-1">外协合同总额</div>
          <div className="text-xl font-bold text-foreground">¥{(totalSub / 10000).toFixed(0)}万</div>
          <div className="text-xs text-amber-400 mt-1">已付 ¥{(totalSubPaid / 10000).toFixed(0)}万</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-green">
          <div className="text-xs text-muted-foreground mb-1">甲方待收款</div>
          <div className="text-xl font-bold text-emerald-400">¥{((totalMain - totalMainPaid) / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">需跟进催款</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-accent-red">
          <div className="text-xs text-muted-foreground mb-1">外协待付款</div>
          <div className="text-xl font-bold text-amber-400">¥{((totalSub - totalSubPaid) / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">待财务出纳</div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {[
            { value: 'all', label: '全部' },
            { value: '甲方合同', label: '甲方合同' },
            { value: '外协合同', label: '外协合同' },
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
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="w-3.5 h-3.5" />
          甲方合同由立项自动写入 · 外协合同在项目台账发起
        </div>
      </div>

      {/* 说明提示 */}
      <div className="flex items-start gap-2 bg-blue-600/10 border border-blue-500/20 rounded-lg px-3 py-2">
        <Building2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-300/80 leading-relaxed">
          <span className="font-medium text-blue-400">甲方合同</span>（主合同）在项目立项时绑定，是与客户签订的收款合同；
          <span className="font-medium text-amber-400 ml-1">外协合同</span>（子合同）在项目执行阶段创建，挂靠在对应主合同下，是分包给外部供应商的付款合同。
        </div>
      </div>

      {/* 按项目分组展示 */}
      <div className="space-y-6">
        {projectGroups.map(project => {
          const projectMainContracts = mainContracts.filter(c => c.projectId === project.id && (filterType === 'all' || filterType === '甲方合同'));
          const projectSubContracts = subContracts.filter(c => c.projectId === project.id && (filterType === 'all' || filterType === '外协合同'));
          if (projectMainContracts.length === 0 && projectSubContracts.length === 0) return null;

          return (
            <div key={project.id}>
              {/* 项目标题 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-foreground">{project.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{project.id}</span>
                <span className="text-xs text-muted-foreground">· 项目经理：{project.manager}</span>
              </div>

              <div className="space-y-2">
                {/* 主合同 */}
                {projectMainContracts.map(c => {
                  const children = subContracts.filter(s => s.parentContractId === c.id && (filterType === 'all' || filterType === '外协合同'));
                  return (
                    <div key={c.id} className="space-y-2">
                      <ContractCard contract={c} isChild={false} />
                      {/* 子合同（外协）缩进展示 */}
                      {children.map(sub => (
                        <ContractCard key={sub.id} contract={sub} isChild={true} />
                      ))}
                    </div>
                  );
                })}

                {/* 没有主合同但有外协合同的情况（过滤外协时） */}
                {projectMainContracts.length === 0 && projectSubContracts.map(c => (
                  <ContractCard key={c.id} contract={c} isChild={true} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
