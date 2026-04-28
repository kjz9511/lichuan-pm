// 设计风格：深色专业管理台风 - 新建项目立项单
// 五步立项流程：1.填写基本信息 2.填写公司合同 3.提交审核 4.项目经理确认 5.老板签字

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, FileText, Users, ClipboardCheck,
  UserCheck, PenLine, Plus, Trash2, Building2, Calendar, DollarSign, Lock
} from 'lucide-react';

// ── 人员池 ──────────────────────────────────────────────────
const MEMBER_POOL = [
  { name: '张伟', dept: '产品部' }, { name: '刘芳', dept: '产品部' },
  { name: '陈建国', dept: '技术部' }, { name: '李小白', dept: '产品部' },
  { name: '王六子', dept: '设计部' }, { name: '陈东阳', dept: '测试部' },
  { name: '周小明', dept: '技术部' }, { name: '赵大锤', dept: '技术部' },
  { name: '吴测试', dept: '测试部' }, { name: '孙小白', dept: '产品部' },
];

const MEMBER_ROLES = ['项目经理', '产品经理', '前端开发', '后端开发', '全栈开发', 'UI设计', '测试工程师', '运维工程师', '架构师', '其他'];
const PROJECT_TYPES = ['软件开发', 'UI/UX设计', '系统集成', '数据分析', 'AI/算法', '运维服务', '其他'];

interface ProjectMember { name: string; dept: string; role: string; remark: string; }
interface ContractStage { name: string; amount: string; dueDate: string; }

// ── 步骤配置 ────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: '项目信息', icon: FileText, desc: '填写项目基本信息与成员' },
  { id: 2, label: '公司合同', icon: Building2, desc: '录入甲方合同信息' },
  { id: 3, label: '提交审核', icon: ClipboardCheck, desc: '指定审核人并提交' },
  { id: 4, label: 'PM确认', icon: UserCheck, desc: '项目经理确认立项信息' },
  { id: 5, label: '老板签字', icon: PenLine, desc: '老板最终审批签字' },
];

// ── 步骤指示器 ──────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                ${done ? 'bg-green-500/20 border-green-500 text-green-400' :
                  active ? 'bg-blue-600 border-blue-500 text-white' :
                  'bg-slate-800 border-slate-700 text-slate-600'}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${active ? 'text-blue-400' : done ? 'text-green-400' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mx-1 mb-5 ${done ? 'bg-green-500/50' : 'bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1：项目基本信息 ────────────────────────────────────
interface Step1Data {
  name: string; type: string; manager: string;
  startDate: string; endDate: string; budget: string; description: string;
  members: ProjectMember[];
}
function Step1({ data, onChange }: { data: Step1Data; onChange: (d: Step1Data) => void }) {
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);

  const addMember = (person: { name: string; dept: string }) => {
    if (data.members.find(m => m.name === person.name)) {
      toast.info(`${person.name} 已在成员列表中`); return;
    }
    onChange({ ...data, members: [...data.members, { ...person, role: '前端开发', remark: '' }] });
  };

  const updateMember = (idx: number, field: keyof ProjectMember, value: string) => {
    const ms = [...data.members]; ms[idx] = { ...ms[idx], [field]: value };
    onChange({ ...data, members: ms });
  };

  const removeMember = (idx: number) => {
    onChange({ ...data, members: data.members.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">项目名称 <span className="text-red-400">*</span></Label>
          <Input value={data.name} onChange={e => onChange({ ...data, name: e.target.value })}
            placeholder="请输入项目名称" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">项目类型 <span className="text-red-400">*</span></Label>
          <Select value={data.type} onValueChange={v => onChange({ ...data, type: v })}>
            <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-100">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {PROJECT_TYPES.map(t => <SelectItem key={t} value={t} className="text-slate-200">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-300 text-sm">项目经理 <span className="text-red-400">*</span></Label>
          <Select value={data.manager} onValueChange={v => onChange({ ...data, manager: v })}>
            <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {MEMBER_POOL.map(p => <SelectItem key={p.name} value={p.name} className="text-slate-200">{p.name}（{p.dept}）</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-300 text-sm">计划开始日期 <span className="text-red-400">*</span></Label>
          <Input type="date" value={data.startDate} onChange={e => onChange({ ...data, startDate: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">计划结束日期 <span className="text-red-400">*</span></Label>
          <Input type="date" value={data.endDate} onChange={e => onChange({ ...data, endDate: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">项目预算（元）</Label>
          <Input type="number" value={data.budget} onChange={e => onChange({ ...data, budget: e.target.value })}
            placeholder="如 500000" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">项目描述</Label>
          <Textarea value={data.description} onChange={e => onChange({ ...data, description: e.target.value })}
            placeholder="简要描述项目背景、目标和范围..." rows={3}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
        </div>
      </div>

      {/* 项目成员 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-slate-300 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> 项目成员
          </Label>
          <div className="relative">
            <Button size="sm" variant="outline" onClick={() => setMemberPickerOpen(!memberPickerOpen)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 h-7 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> 添加成员
            </Button>
            {memberPickerOpen && (
              <div className="absolute right-0 top-8 z-50 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                {MEMBER_POOL.map(p => (
                  <button key={p.name} onClick={() => { addMember(p); setMemberPickerOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 text-sm text-slate-200 transition-colors">
                    <span>{p.name}</span>
                    <span className="text-xs text-slate-500">{p.dept}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {data.members.length === 0 ? (
          <div className="text-center py-4 text-slate-600 text-sm border border-dashed border-slate-700 rounded-lg">
            暂无成员，点击「添加成员」选择
          </div>
        ) : (
          <div className="space-y-2">
            {data.members.map((m, idx) => (
              <div key={m.name} className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">{m.name.charAt(0)}</div>
                  <span className="text-sm text-slate-200">{m.name}</span>
                </div>
                <div className="col-span-3">
                  <Select value={m.role} onValueChange={v => updateMember(idx, 'role', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {MEMBER_ROLES.map(r => <SelectItem key={r} value={r} className="text-slate-200 text-xs">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-5">
                  <Input value={m.remark} onChange={e => updateMember(idx, 'remark', e.target.value)}
                    placeholder="负责内容备注" className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-7" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button onClick={() => removeMember(idx)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 2：公司合同 ────────────────────────────────────────
interface ContractData {
  contractName: string; contractNo: string; client: string;
  amount: string; signDate: string; startDate: string; endDate: string;
  contractInfo: string; remark: string; stages: ContractStage[];
}
function Step2({ data, onChange }: { data: ContractData; onChange: (d: ContractData) => void }) {
  const addStage = () => {
    onChange({ ...data, stages: [...data.stages, { name: '', amount: '', dueDate: '' }] });
  };
  const updateStage = (idx: number, field: keyof ContractStage, value: string) => {
    const ss = [...data.stages]; ss[idx] = { ...ss[idx], [field]: value };
    onChange({ ...data, stages: ss });
  };
  const removeStage = (idx: number) => {
    onChange({ ...data, stages: data.stages.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-blue-400">甲方合同（主合同）</span>
        <span className="text-xs text-slate-500">· 外协合同在项目执行阶段创建</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">合同名称 <span className="text-red-400">*</span></Label>
          <Input value={data.contractName} onChange={e => onChange({ ...data, contractName: e.target.value })}
            placeholder="如：XX系统开发合同" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">合同编号</Label>
          <Input value={data.contractNo} onChange={e => onChange({ ...data, contractNo: e.target.value })}
            placeholder="如：HT-2026-001" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">甲方（客户）<span className="text-red-400">*</span></Label>
          <Input value={data.client} onChange={e => onChange({ ...data, client: e.target.value })}
            placeholder="客户公司名称" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">合同金额（元）<span className="text-red-400">*</span></Label>
          <Input type="number" value={data.amount} onChange={e => onChange({ ...data, amount: e.target.value })}
            placeholder="如 500000" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">签订日期</Label>
          <Input type="date" value={data.signDate} onChange={e => onChange({ ...data, signDate: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">合同开始日期</Label>
          <Input type="date" value={data.startDate} onChange={e => onChange({ ...data, startDate: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">合同结束日期</Label>
          <Input type="date" value={data.endDate} onChange={e => onChange({ ...data, endDate: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">合同信息</Label>
          <Textarea value={data.contractInfo} onChange={e => onChange({ ...data, contractInfo: e.target.value })}
            placeholder="合同主要内容描述..." rows={2}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
        </div>
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">合同备注</Label>
          <Textarea value={data.remark} onChange={e => onChange({ ...data, remark: e.target.value })}
            placeholder="特殊条款、注意事项等..." rows={2}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
        </div>
      </div>

      {/* 分期节点 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-slate-300 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" /> 收款分期节点
          </Label>
          <Button size="sm" variant="outline" onClick={addStage}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 h-7 text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> 添加节点
          </Button>
        </div>
        {data.stages.length === 0 ? (
          <div className="text-center py-3 text-slate-600 text-sm border border-dashed border-slate-700 rounded-lg">
            暂无分期节点，点击「添加节点」
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 px-2 text-xs text-slate-500">
              <div className="col-span-4">节点名称</div>
              <div className="col-span-4">金额（元）</div>
              <div className="col-span-3">到期日</div>
              <div className="col-span-1"></div>
            </div>
            {data.stages.map((s, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <div className="col-span-4">
                  <Input value={s.name} onChange={e => updateStage(idx, 'name', e.target.value)}
                    placeholder="如：首付款" className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-7" />
                </div>
                <div className="col-span-4">
                  <Input type="number" value={s.amount} onChange={e => updateStage(idx, 'amount', e.target.value)}
                    placeholder="金额" className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-7" />
                </div>
                <div className="col-span-3">
                  <Input type="date" value={s.dueDate} onChange={e => updateStage(idx, 'dueDate', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-7" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button onClick={() => removeStage(idx)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 3：提交审核 ────────────────────────────────────────
interface Step3Data { reviewer: string; reviewNote: string; }
function Step3({ data, onChange, projectData, contractData }:
  { data: Step3Data; onChange: (d: Step3Data) => void; projectData: Step1Data; contractData: ContractData }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3 text-sm">
        <h3 className="text-slate-300 font-medium mb-2">立项信息预览</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-slate-500">项目名称：</span><span className="text-slate-200">{projectData.name || '—'}</span></div>
          <div><span className="text-slate-500">项目类型：</span><span className="text-slate-200">{projectData.type || '—'}</span></div>
          <div><span className="text-slate-500">项目经理：</span><span className="text-slate-200">{projectData.manager}</span></div>
          <div><span className="text-slate-500">成员数量：</span><span className="text-slate-200">{projectData.members.length} 人</span></div>
          <div><span className="text-slate-500">合同名称：</span><span className="text-slate-200">{contractData.contractName || '—'}</span></div>
          <div><span className="text-slate-500">合同金额：</span><span className="text-green-400 font-semibold">¥{Number(contractData.amount || 0).toLocaleString()}</span></div>
        </div>
      </div>
      <div>
        <Label className="text-slate-300 text-sm">指定审核人 <span className="text-red-400">*</span></Label>
        <Select value={data.reviewer} onValueChange={v => onChange({ ...data, reviewer: v })}>
          <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-100">
            <SelectValue placeholder="选择审核人" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {MEMBER_POOL.map(p => <SelectItem key={p.name} value={p.name} className="text-slate-200">{p.name}（{p.dept}）</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-slate-300 text-sm">审核说明</Label>
        <Textarea value={data.reviewNote} onChange={e => onChange({ ...data, reviewNote: e.target.value })}
          placeholder="向审核人说明立项背景、重点关注事项等..." rows={3}
          className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
      </div>
    </div>
  );
}

// ── Step 4：PM确认 ──────────────────────────────────────────
function Step4({ projectData, contractData, reviewData, onConfirm, confirmed }:
  { projectData: Step1Data; contractData: ContractData; reviewData: Step3Data; onConfirm: () => void; confirmed: boolean }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
        <UserCheck className="w-5 h-5 mb-2" />
        <p>请项目经理 <span className="font-semibold">{projectData.manager}</span> 仔细核对以下立项信息，确认无误后点击「确认立项信息」。</p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4 text-sm">
        <div>
          <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">项目基本信息</h4>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">项目名称：</span><span className="text-slate-200">{projectData.name}</span></div>
            <div><span className="text-slate-500">类型：</span><span className="text-slate-200">{projectData.type}</span></div>
            <div><span className="text-slate-500">开始：</span><span className="text-slate-200">{projectData.startDate}</span></div>
            <div><span className="text-slate-500">结束：</span><span className="text-slate-200">{projectData.endDate}</span></div>
            {projectData.budget && <div className="col-span-2"><span className="text-slate-500">预算：</span><span className="text-green-400">¥{Number(projectData.budget).toLocaleString()}</span></div>}
          </div>
        </div>
        <div>
          <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">合同信息</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2"><span className="text-slate-500">合同名称：</span><span className="text-slate-200">{contractData.contractName}</span></div>
            <div><span className="text-slate-500">甲方：</span><span className="text-slate-200">{contractData.client}</span></div>
            <div><span className="text-slate-500">金额：</span><span className="text-green-400 font-semibold">¥{Number(contractData.amount || 0).toLocaleString()}</span></div>
          </div>
        </div>
        <div>
          <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">项目成员（{projectData.members.length} 人）</h4>
          <div className="flex flex-wrap gap-2">
            {projectData.members.map(m => (
              <span key={m.name} className="text-xs px-2 py-1 rounded-full bg-slate-700/60 text-slate-300">
                {m.name} · {m.role}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">审核信息</h4>
          <div><span className="text-slate-500">审核人：</span><span className="text-slate-200">{reviewData.reviewer}</span></div>
        </div>
      </div>

      {!confirmed ? (
        <Button onClick={onConfirm} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <UserCheck className="w-4 h-4" /> 确认立项信息
        </Button>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>项目经理已确认，等待老板签字</span>
        </div>
      )}
    </div>
  );
}

// ── Step 5：老板签字 ────────────────────────────────────────
function Step5({ projectData, contractData, onSign }:
  { projectData: Step1Data; contractData: ContractData; onSign: () => void }) {
  const [signNote, setSignNote] = useState('');

  return (
    <div className="space-y-4">
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-300">
        <PenLine className="w-5 h-5 mb-2" />
        <p>老板最终审批。签字后项目将正式立项，系统将自动创建项目台账和合同记录。</p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium">{projectData.name}</span>
          <Badge className="bg-blue-500/20 text-blue-300 border-0">{projectData.type}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-slate-500">甲方：</span><span className="text-slate-300">{contractData.client}</span></div>
          <div><span className="text-slate-500">合同金额：</span><span className="text-green-400 font-semibold">¥{Number(contractData.amount || 0).toLocaleString()}</span></div>
          <div><span className="text-slate-500">PM：</span><span className="text-slate-300">{projectData.manager}</span></div>
          <div><span className="text-slate-500">成员：</span><span className="text-slate-300">{projectData.members.length} 人</span></div>
          <div><span className="text-slate-500">周期：</span><span className="text-slate-300">{projectData.startDate} ~ {projectData.endDate}</span></div>
        </div>
      </div>

      <div>
        <Label className="text-slate-300 text-sm">签字说明（可选）</Label>
        <Textarea value={signNote} onChange={e => setSignNote(e.target.value)}
          placeholder="如有特殊要求或批示，请在此填写..." rows={3}
          className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
      </div>

      <Button onClick={onSign} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 py-3 text-base">
        <PenLine className="w-5 h-5" /> 老板签字确认，正式立项
      </Button>
    </div>
  );
}

// ── 主页面 ──────────────────────────────────────────────────
import type { Contract } from '../lib/mockData';
interface NewProjectPageProps {
  onBack?: () => void;
  onContractCreated?: (c: Contract) => void;
}

export default function NewProjectPage({ onBack, onContractCreated }: NewProjectPageProps) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [pmConfirmed, setPmConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [jumpTimer, setJumpTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [step1, setStep1] = useState<Step1Data>({
    name: '', type: '', manager: '张伟', startDate: '', endDate: '', budget: '', description: '', members: []
  });
  const [step2, setStep2] = useState<ContractData>({
    contractName: '', contractNo: '', client: '', amount: '', signDate: '', startDate: '', endDate: '',
    contractInfo: '', remark: '', stages: []
  });
  const [step3, setStep3] = useState<Step3Data>({ reviewer: '', reviewNote: '' });

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else { onBack ? onBack() : navigate('/projects'); }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!step1.name.trim()) { toast.error('请填写项目名称'); return; }
      if (!step1.type) { toast.error('请选择项目类型'); return; }
      if (!step1.startDate || !step1.endDate) { toast.error('请填写项目计划时间'); return; }
    }
    if (step === 2) {
      if (!step2.contractName.trim()) { toast.error('请填写合同名称'); return; }
      if (!step2.client.trim()) { toast.error('请填写甲方名称'); return; }
      if (!step2.amount || Number(step2.amount) <= 0) { toast.error('请填写合同金额'); return; }
    }
    if (step === 3) {
      if (!step3.reviewer) { toast.error('请指定审核人'); return; }
      toast.success(`已提交审核，审核人：${step3.reviewer}`);
    }
    if (step < 5) setStep(s => s + 1);
  };

  const handleSign = () => {
    setDone(true);
    toast.success(`项目「${step1.name}」已正式立项！`);
    // 立项完成 → 自动将甲方合同写入合同台账
    if (onContractCreated && step2.contractName && step2.client && step2.amount) {
      const now = new Date().toISOString().slice(0, 10);
      const uid = String(Date.now()).slice(-4);
      const newContract: Contract = {
        id: `CON-NEW-${uid}`,
        contractNo: step2.contractNo || `HT-${new Date().getFullYear()}-${uid}`,
        contractName: step2.contractName,
        contractInfo: step2.contractInfo || '',
        remark: step2.remark || '',
        projectId: `PRJ-NEW-${uid}`,
        projectName: step1.name,
        type: '甲方合同',
        vendor: step2.client,
        amount: Number(step2.amount),
        signDate: step2.signDate || now,
        startDate: step2.startDate || step1.startDate,
        endDate: step2.endDate || step1.endDate,
        status: '待签署',
        paidAmount: 0,
        pendingAmount: Number(step2.amount),
        stages: step2.stages.map(s => ({
          name: s.name,
          amount: Number(s.amount) || 0,
          dueDate: s.dueDate,
          status: '未回款' as const,
        })),
      };
      onContractCreated(newContract);
    }
    const t = setTimeout(() => navigate('/projects'), 4000);
    setJumpTimer(t);
  };

  const handleGoNow = () => {
    if (jumpTimer) clearTimeout(jumpTimer);
    navigate('/projects');
  };

  if (done) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">立项成功！</h2>
        <p className="text-slate-400 text-sm mb-1">项目「{step1.name}」已正式立项</p>
        <p className="text-slate-500 text-xs mb-6">4 秒后自动跳转至项目台账</p>
        <div className="flex gap-3">
          <Button
            onClick={handleGoNow}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> 立即前往项目台账
          </Button>
          <Button
            variant="outline"
            onClick={() => { if (jumpTimer) { clearTimeout(jumpTimer); setJumpTimer(null); } }}
            className="border-slate-600 text-slate-400 hover:bg-slate-800"
          >
            留在此页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* 页头 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}
          className="text-slate-400 hover:text-slate-200 gap-1 -ml-2">
          <ArrowLeft className="w-4 h-4" /> {step === 1 ? '返回项目台账' : '上一步'}
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-100">新建项目立项单</h1>
        <p className="text-sm text-slate-400 mt-0.5">完成五步立项流程，正式创建项目</p>
      </div>

      <StepIndicator current={step} />

      {/* 步骤内容 */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          {(() => {
            const s = STEPS[step - 1];
            return (
              <>
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">{s.label}</h2>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </>
            );
          })()}
        </div>

        {step === 1 && <Step1 data={step1} onChange={setStep1} />}
        {step === 2 && <Step2 data={step2} onChange={setStep2} />}
        {step === 3 && <Step3 data={step3} onChange={setStep3} projectData={step1} contractData={step2} />}
        {step === 4 && (
          <Step4 projectData={step1} contractData={step2} reviewData={step3}
            onConfirm={() => setPmConfirmed(true)} confirmed={pmConfirmed} />
        )}
        {step === 5 && <Step5 projectData={step1} contractData={step2} onSign={handleSign} />}
      </div>

      {/* 底部按钮 */}
      {step !== 5 && !(step === 4 && !pmConfirmed) && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
            {step === 3 ? '提交审核' : step === 4 ? '进入老板签字' : '下一步'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
      {step === 4 && pmConfirmed && (
        <div className="flex justify-end mt-4">
          <Button onClick={() => setStep(5)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
            进入老板签字 <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
