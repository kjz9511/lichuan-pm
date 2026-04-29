// 厉川外包项目管理平台 — 项目台账页面
// 设计风格：深色专业管理台风，项目列表 + 详情弹窗
// 逻辑：项目卡片支持「阶段流程」和「发起外协合同」两个快捷操作

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  GitBranch,
  History,
  Plus,
  Search,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { projects as initialProjects, Project, Contract } from '../lib/mockData';
import { toast } from 'sonner';
import { useContracts } from '../contexts/ContractContext';
import { useRole } from '../contexts/RoleContext';
import { useTransfer } from '../contexts/TransferContext';
import { useProject } from '../contexts/ProjectContext';
import ProjectStagePage from './ProjectStagePage';

function HealthBadge({ health }: { health: 'green' | 'yellow' | 'red' }) {
  if (health === 'green') return (
    <span className="badge-green px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
      <CheckCircle2 className="w-3 h-3" />健康
    </span>
  );
  if (health === 'yellow') return (
    <span className="badge-yellow px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />预警
    </span>
  );
  return (
    <span className="badge-red px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
      <XCircle className="w-3 h-3" />风险
    </span>
  );
}

const STAGES = ['项目启动', '需求确认', '项目上线', '项目验收', '项目结项'];

function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const stageIndex = STAGES.indexOf(project.stage);
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-foreground">{project.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{project.id}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-5">
          {/* 阶段进度 */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">项目阶段</div>
            <div className="flex items-center">
              {STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                      i < stageIndex ? 'bg-blue-600 border-blue-600 text-white' :
                      i === stageIndex ? 'bg-blue-600/20 border-blue-500 text-blue-400' :
                      'bg-secondary border-border text-muted-foreground'
                    )}>
                      {i < stageIndex ? '✓' : i + 1}
                    </div>
                    <div className={cn(
                      'text-[10px] mt-1 text-center whitespace-nowrap',
                      i === stageIndex ? 'text-blue-400 font-medium' : 'text-muted-foreground'
                    )}>{stage}</div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-1 mb-4',
                      i < stageIndex ? 'bg-blue-600' : 'bg-border'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '项目经理', value: project.manager },
              { label: '客户', value: project.client },
              { label: '外包商', value: project.vendor },
              { label: '计划时间', value: `${project.startDate} ~ ${project.endDate}` },
              { label: '项目预算', value: `¥${project.budget.toLocaleString()}` },
              { label: '已支出', value: `¥${project.spent.toLocaleString()}` },
            ].map(item => (
              <div key={item.label} className="bg-secondary/50 rounded-lg p-3">
                <div className="text-[10px] text-muted-foreground mb-1">{item.label}</div>
                <div className="text-xs font-medium text-foreground">{item.value}</div>
              </div>
            ))}
          </div>
          {/* 进度 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">整体进度</span>
              <span className="text-sm font-bold text-foreground">{project.progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  project.health === 'green' ? 'bg-emerald-500' :
                  project.health === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          {/* 合同回款 */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">合同回款</div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">合同金额</span>
                <span className="text-xs font-bold text-foreground">¥{project.contractAmount.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(project.paidAmount / project.contractAmount) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-emerald-400">已回款 ¥{project.paidAmount.toLocaleString()}</span>
                <span className="text-amber-400">待回款 ¥{(project.contractAmount - project.paidAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>
          {/* 项目成员 */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">项目成员</div>
            <div className="flex flex-wrap gap-2">
              {project.members.map(m => (
                <span key={m} className="px-2.5 py-1 bg-secondary rounded-full text-xs text-foreground">{m}</span>
              ))}
            </div>
          </div>
          {/* 项目简介 */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">项目简介</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{project.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 发起外协合同弹窗（项目内快速录入）────────────────────────────────
function SubContractModal({ project, onClose, onSave }: {
  project: Project;
  onClose: () => void;
  onSave: (c: Contract) => void;
}) {
   const { contracts } = useContracts();
  // 该项目下所有甲方合同（可能多个）
  const mainContracts = contracts.filter(c => c.projectId === project.id && c.type === '甲方合同');
  const [form, setForm] = useState({
    contractName: '',
    vendor: '',
    amount: '',
    signDate: '',
    endDate: '',
    remark: '',
    payMethod: '银行转账',
    payAccount: '',
    // 默认选第一个甲方合同（如果有）
    parentContractId: mainContracts[0]?.id || '',
    stages: [{ name: '预付款', amount: '', dueDate: '' }],
  });

  const PAY_METHODS = [
    { value: '银行转账', icon: '🏦' },
    { value: '支付宝', icon: '💙' },
    { value: '微信', icon: '💚' },
    { value: '直接打账', icon: '💰' },
  ];

  function handleSave() {
    if (!form.contractName || !form.vendor || !form.amount) {
      toast.error('请填写合同名称、外协方和金额');
      return;
    }
    const uid = String(Date.now()).slice(-4);
    const now = new Date().toISOString().slice(0, 10);
    const newContract: Contract = {
      id: `CON-SUB-${uid}`,
      contractNo: `WX-${new Date().getFullYear()}-${uid}`,
      contractName: form.contractName,
      contractInfo: `${project.name} 外协分包合同`,
      remark: form.remark,
      projectId: project.id,
      projectName: project.name,
      type: '外包协议',
      vendor: form.vendor,
      amount: Number(form.amount),
      signDate: form.signDate || now,
      startDate: now,
      endDate: form.endDate || project.endDate,
      status: '待签署',
      paidAmount: 0,
      pendingAmount: Number(form.amount),
      parentContractId: form.parentContractId || undefined,
      stages: form.stages.map(s => ({
        name: s.name,
        amount: Number(s.amount) || 0,
        dueDate: s.dueDate,
        status: '未回款' as const,
      })),
    };
    onSave(newContract);
    toast.success(`外协合同「${form.contractName}」已创建，等待签署`);
    onClose();
  }

  const inputCls = 'w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-base font-bold text-foreground">发起外协合同</div>
            <div className="text-xs text-muted-foreground mt-0.5">{project.name} · {project.id}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 关联甲方合同—支持多个甲方合同选择 */}
          {mainContracts.length > 0 ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 space-y-2">
              <label className="text-xs font-medium text-blue-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                关联甲方合同 <span className="text-red-400">*</span>
              </label>
              {mainContracts.length === 1 ? (
                <div className="text-xs text-blue-300/80 px-1">
                  {mainContracts[0].contractName}（¥{(mainContracts[0].amount / 10000).toFixed(0)}万）
                </div>
              ) : (
                <select
                  value={form.parentContractId}
                  onChange={e => setForm(f => ({ ...f, parentContractId: e.target.value }))}
                  className="w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">请选择关联的甲方合同</option>
                  {mainContracts.map(c => (
                    <option key={c.id} value={c.id}>{c.contractName}（¥{(c.amount / 10000).toFixed(0)}万）</option>
                  ))}
                </select>
              )}
              <div className="text-[10px] text-blue-400/60">外协合同挂靠在甲方合同下，体现分包关系</div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              该项目暂无甲方合同，外协合同将独立存在
            </div>
          )}

          {/* 基本字段 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-foreground mb-1.5 block">外协合同名称 <span className="text-red-400">*</span></label>
              <input value={form.contractName} onChange={e => setForm(f => ({ ...f, contractName: e.target.value }))}
                placeholder="如：XX系统前端开发外协协议"
                className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">外协方 <span className="text-red-400">*</span></label>
              <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                placeholder="供应商名称或个人姓名"
                className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">合同金额（元）<span className="text-red-400">*</span></label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="如 80000"
                className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">签订日期</label>
              <input type="date" value={form.signDate} onChange={e => setForm(f => ({ ...f, signDate: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">结束日期</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className={inputCls} />
            </div>
          </div>

          {/* 付款方式 */}
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">付款方式</label>
            <div className="flex gap-2 flex-wrap">
              {PAY_METHODS.map(m => (
                <button key={m.value} type="button"
                  onClick={() => setForm(f => ({ ...f, payMethod: m.value }))}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all',
                    form.payMethod === m.value
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'text-muted-foreground border-border hover:border-muted-foreground'
                  )}>
                  <span>{m.icon}</span>{m.value}
                </button>
              ))}
            </div>
            {form.payMethod !== '直接打账' && (
              <input value={form.payAccount} onChange={e => setForm(f => ({ ...f, payAccount: e.target.value }))}
                placeholder={form.payMethod === '银行转账' ? '收款账号（银行卡号）' : `${form.payMethod}账号`}
                className="mt-2 w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            )}
          </div>

          {/* 付款节点 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-foreground">付款节点</label>
              <button type="button"
                onClick={() => setForm(f => ({ ...f, stages: [...f.stages, { name: '', amount: '', dueDate: '' }] }))}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus className="w-3 h-3" />添加节点
              </button>
            </div>
            <div className="space-y-2">
              {form.stages.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={s.name}
                    onChange={e => setForm(f => ({ ...f, stages: f.stages.map((st, idx) => idx === i ? { ...st, name: e.target.value } : st) }))}
                    placeholder="节点名称"
                    className="col-span-4 h-8 px-2 bg-input border border-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
                  <input type="number" value={s.amount}
                    onChange={e => setForm(f => ({ ...f, stages: f.stages.map((st, idx) => idx === i ? { ...st, amount: e.target.value } : st) }))}
                    placeholder="金额"
                    className="col-span-3 h-8 px-2 bg-input border border-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
                  <input type="date" value={s.dueDate}
                    onChange={e => setForm(f => ({ ...f, stages: f.stages.map((st, idx) => idx === i ? { ...st, dueDate: e.target.value } : st) }))}
                    className="col-span-4 h-8 px-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none" />
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, stages: f.stages.filter((_, idx) => idx !== i) }))}
                    className="col-span-1 text-muted-foreground hover:text-red-400 flex justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">备注</label>
            <textarea value={form.remark} onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
              placeholder="合同备注、注意事项等..." rows={2}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
        </div>

        <div className="px-5 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors">取消</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors">创建外协合同</button>
        </div>
      </div>
    </div>
  );
}

// ── 主页面
// 可选 PM 列表
const PM_LIST = [
  { name: '张伟' }, { name: '刘芳' }, { name: '陈建国' }, { name: '王小明' },
];

// 移交项目经理弹窗
function TransferPMModal({
  project, onClose, onTransfer,
}: { project: Project; onClose: () => void; onTransfer: (newManager: string, reason: string) => void; }) {
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const available = PM_LIST.filter(p => p.name !== project.manager);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) { toast.error('请选择新的项目经理'); return; }
    onTransfer(selected, reason);
    toast.success(`移交申请已提交，等待老板审批`);
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-foreground">移交项目经理</div>
            <div className="text-xs text-muted-foreground mt-0.5">{project.name}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-3 bg-secondary/40 rounded-lg px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">{project.manager[0]}</div>
            <div>
              <div className="text-xs text-muted-foreground">当前负责人</div>
              <div className="text-sm font-medium text-foreground">{project.manager}</div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">移交给 <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {available.map(pm => (
                <button key={pm.name} type="button" onClick={() => setSelected(pm.name)}
                  className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors',
                    selected === pm.name ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-secondary/30 border-border hover:border-blue-500/30 text-foreground'
                  )}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    selected === pm.name ? 'bg-blue-500/30 text-blue-300' : 'bg-secondary text-muted-foreground'
                  )}>{pm.name[0]}</div>
                  <div>
                    <div className="text-xs font-medium">{pm.name}</div>
                    <div className="text-[10px] text-muted-foreground">项目经理</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">交接备注（选填）</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="如：因出差无法跟进，请接手后续跟进验收阶段…"
              rows={3} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-9 bg-secondary hover:bg-accent text-foreground text-sm rounded-lg transition-colors">取消</button>
            <button type="submit" className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />确认移交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────────
interface ProjectsPageProps {
  onNewProject?: () => void;
}

export default function ProjectsPage({ onNewProject }: ProjectsPageProps) {
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stageProjectId, setStageProjectId] = useState<string | null>(null);
  const [subContractProject, setSubContractProject] = useState<Project | null>(null);
  const [transferProject, setTransferProject] = useState<Project | null>(null);
  const { projectList } = useProject();
  const { addContract } = useContracts();
  const { role, roleInfo } = useRole();
  const { addRequest, requests } = useTransfer();

  // 老板看全部项目，PM 只看自己负责的
  const visibleProjects = (role === 'pm' || role === 'pm2' || role === 'pm3')
    ? projectList.filter(p => p.manager === roleInfo.name)
    : projectList;

  // 进入阶段子流程页面
  if (stageProjectId) {
    return <ProjectStagePage projectId={stageProjectId} onBack={() => setStageProjectId(null)} canApprove={true} />;
  }

  const filtered = visibleProjects.filter(p => {
    const matchSearch = p.name.includes(search) || p.id.includes(search) || p.manager.includes(search);
    const matchHealth = filterHealth === 'all' || p.health === filterHealth;
    return matchSearch && matchHealth;
  });
  return (
    <div className="p-6 space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索项目名称、编号..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { value: 'all', label: '全部' },
            { value: 'green', label: '健康' },
            { value: 'yellow', label: '预警' },
            { value: 'red', label: '风险' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterHealth(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs transition-colors',
                filterHealth === f.value
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-muted-foreground hover:bg-accent border border-transparent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onNewProject?.()}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新建项目
        </button>
      </div>

      {/* 项目卡片列表 */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div
            key={p.id}
            className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/40 transition-colors cursor-pointer"
            onClick={() => setSelectedProject(p)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{p.name}</span>
                  <HealthBadge health={p.health} />
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    p.status === '进行中' ? 'badge-blue' :
                    p.status === '已完成' ? 'badge-green' :
                    p.status === '已逾期' ? 'badge-red' : 'badge-gray'
                  )}>{p.status}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-3">{p.id} · {p.client} · PM: {p.manager} · 外包: {p.vendor}</div>
                {/* 进度条 */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        p.health === 'green' ? 'bg-emerald-500' :
                        p.health === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground font-medium w-8 text-right">{p.progress}%</span>
                </div>
                {/* 移交历史记录 */}
                {(() => {
                  const history = requests.filter(r => r.projectId === p.id);
                  if (history.length === 0) return null;
                  return (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 mb-1.5">
                        <History className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">移交记录</span>
                      </div>
                      <div className="space-y-1">
                        {history.map(r => (
                          <div key={r.id} className="flex items-center gap-2 text-[10px]">
                            <span className={cn(
                              'px-1.5 py-0.5 rounded font-medium shrink-0',
                              r.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                              r.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                              'bg-amber-500/15 text-amber-400'
                            )}>
                              {r.status === 'approved' ? '已通过' : r.status === 'rejected' ? '已驳回' : '待审批'}
                            </span>
                            <span className="text-muted-foreground">{r.fromPM} → {r.toPM}</span>
                            <span className="text-muted-foreground/60 ml-auto shrink-0">{r.createdAt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 右侧信息 */}
              <div className="shrink-0 text-right space-y-1">
                <div className="text-xs text-muted-foreground">当前阶段</div>
                <div className="text-xs font-medium text-blue-400">{p.stage}</div>
                <div className="text-xs text-muted-foreground mt-2">合同金额</div>
                <div className="text-xs font-bold text-foreground">¥{(p.contractAmount / 10000).toFixed(0)}万</div>
                <div className="text-[10px] text-emerald-400">已回 ¥{(p.paidAmount / 10000).toFixed(0)}万</div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={e => { e.stopPropagation(); setStageProjectId(p.id); }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 rounded text-[10px] font-medium transition-colors"
                >
                  <GitBranch className="w-2.5 h-2.5" />
                  阶段流程
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setSubContractProject(p); }}
                  className="flex items-center gap-1 px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded text-[10px] font-medium transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                  外协合同
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setTransferProject(p); }}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30 rounded text-[10px] font-medium transition-colors"
                >
                  <UserCheck className="w-2.5 h-2.5" />
                  移交PM
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            没有找到匹配的项目
          </div>
        )}
      </div>

      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
      {subContractProject && (
        <SubContractModal
          project={subContractProject}
          onClose={() => setSubContractProject(null)}
          onSave={c => { addContract(c); setSubContractProject(null); }}
        />
      )}
      {transferProject && (
        <TransferPMModal
          project={transferProject}
          onClose={() => setTransferProject(null)}
          onTransfer={(newManager, reason) => {
            addRequest({
              projectId: transferProject.id,
              projectName: transferProject.name,
              fromPM: transferProject.manager,
              toPM: newManager,
              reason,
            });
            setTransferProject(null);
          }}
        />
      )}
    </div>
  );
}
