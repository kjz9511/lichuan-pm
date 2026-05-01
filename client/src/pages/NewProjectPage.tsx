// 设计风格：深色专业管理台风 - 新建项目立项单
// 四步立项流程：1.填写基本信息 2.填写公司合同 3.AI风险审核 4.PM确认并通知老板

import { useState } from 'react';
import { useAI } from '../hooks/useAI';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, FileText, Users,
  UserCheck, Bot, Plus, Trash2, Building2, DollarSign, Lock,
  AlertTriangle, ShieldCheck, RefreshCw, Bell, Loader2,
  Paperclip, Link2, Sparkles, X
} from 'lucide-react';



// ── 预立项导入 Banner 组件 ──────────────────────────────────────────────
function PreImportBanner({
  mode,
  onFill,
}: {
  mode: 'project' | 'contract';
  onFill: (data: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const { run } = useAI({ model: 'gpt-4o-mini', temperature: 0.3, stream: false });

  const handleImport = async () => {
    const pp = MOCK_PRE_PROJECTS.find(p => p.id === selected);
    if (!pp) return;
    setLoading(true);
    const docList = pp.docs.map(d => `- ${d.name}（${d.stage || ''}）`).join('\n') || '（暂无上传文件）';
    const prompt = mode === 'project'
      ? `你是一个项目管理助手。根据以下预立项资料，帮我回填正式立项表单字段，以 JSON 格式返回，字段包括：name（项目名称）、type（项目类型，从以下选择：软件开发/UI/UX设计/系统集成/数据分析/AI/算法/运维服务/其他）、budget（预算，纯数字）、startDate（计划开始日期，格式YYYY-MM-DD）、endDate（计划结束日期，格式YYYY-MM-DD）、description（项目描述，100字以内）。
预立项名称：${pp.name}
客户：${pp.client}
预算：${pp.budget}
时间：${pp.startDate} ~ ${pp.endDate}
描述：${pp.description}
已上传资料：
${docList}
只返回 JSON，不要其他文字。`
      : `你是一个合同管理助手。根据以下预立项资料，帮我回填甲方合同表单字段，以 JSON 格式返回，字段包括：contractName（合同名称）、client（甲方/客户名称）、amount（合同金额，纯数字）、signDate（签订日期，格式YYYY-MM-DD）、startDate（合同开始日期，格式YYYY-MM-DD）、endDate（合同结束日期，格式YYYY-MM-DD）、contractInfo（合同说明，50字以内）。
预立项名称：${pp.name}
客户：${pp.client}
预算：${pp.budget}
时间：${pp.startDate} ~ ${pp.endDate}
描述：${pp.description}
已上传资料：
${docList}
只返回 JSON，不要其他文字。`;

    try {
      const result = await run([{ role: 'user' as const, content: prompt }]);
      const jsonStr = (result || '').replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      onFill(parsed);
      toast.success('AI 已根据预立项资料回填表单，请核对后继续');
      setOpen(false);
    } catch {
      toast.error('AI 回填失败，请手动填写');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 transition-colors text-sm text-blue-400 hover:text-blue-300"
        >
          <Link2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">从预立项资料库导入</span>
          <span className="text-xs text-slate-500 ml-1">— 选择预立项后 AI 自动回填表单字段</span>
        </button>
      ) : (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
              <Link2 className="w-4 h-4" />
              从预立项资料库导入
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">选择预立项（支持模糊搜索）</Label>
            <PreProjectCombobox value={selected} onChange={setSelected} />
            {selected && (
              <div className="text-xs text-slate-500 bg-slate-800/60 rounded-lg p-2.5">
                {(() => {
                  const pp = MOCK_PRE_PROJECTS.find(p => p.id === selected)!;
                  return (
                    <div className="space-y-1">
                      <div className="flex gap-4">
                        <span>客户：<span className="text-slate-300">{pp.client}</span></span>
                        <span>预算：<span className="text-emerald-400">¥{Number(pp.budget).toLocaleString()}</span></span>
                      </div>
                      <div>时间：<span className="text-slate-300">{pp.startDate} ~ {pp.endDate}</span></div>
                      <div>资料：<span className="text-slate-300">{pp.docs.length > 0 ? pp.docs.map(d => d.name).join('、') : '暂无上传文件'}</span></div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={!selected || loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-8 text-xs gap-1.5"
          >
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> AI 回填中...</> : <><Sparkles className="w-3.5 h-3.5" /> AI 智能回填表单</>}
          </Button>
        </div>
      )}
    </div>
  );
}

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
interface ContractMember { name: string; role: string; days: string; rate: string; }
// 单份甲方合同数据
interface SingleContractData {
  contractName: string; contractNo: string; client: string;
  amount: string; signDate: string; startDate: string; endDate: string;
  contractInfo: string; remark: string;
  contractSubtype: '主合同' | '补充协议' | '变更协议';
  stages: ContractStage[];
  members: ContractMember[];
}

// ── 步骤配置 ────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: '项目信息', icon: FileText, desc: '填写项目基本信息与成员' },
  { id: 2, label: '公司合同', icon: Building2, desc: '录入甲方合同信息' },
  { id: 3, label: 'AI 风险审核', icon: Bot, desc: 'AI 自动分析项目风险并给出建议' },
  { id: 4, label: 'PM确认 & 通知', icon: UserCheck, desc: 'PM 确认立项信息，系统自动通知老板' },
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


// ── 附件区块（三种来源：上传/引用预立项/AI生成）────────────────────
interface Attachment {
  id: string;
  name: string;
  source: 'upload' | 'preproject' | 'ai';
  size?: string;
  type?: string;
  preProjectId?: string;
  preProjectName?: string;
}

const MOCK_PRE_PROJECTS = [
  {
    id: 'pp1', name: '智慧园区数字化平台', status: '进行中',
    client: '厉川科技', budget: '800000', startDate: '2026-03-01', endDate: '2026-09-30',
    description: '基于 IoT 与大数据的智慧园区综合管理平台，覆盖能耗、安防、访客、停车等模块。',
    docs: [
      { id: 'd1', name: '需求调研报告.docx', type: 'docx', size: '2.3MB', stage: '需求阶段' },
      { id: 'd2', name: '技术预研报告.pdf', type: 'pdf', size: '4.1MB', stage: '预研阶段' },
      { id: 'd3', name: '可行性研究报告.pdf', type: 'pdf', size: '3.8MB', stage: '可研阶段' },
    ],
  },
  {
    id: 'pp2', name: '供应链协同管理系统', status: '草稿',
    client: '厉川物流', budget: '560000', startDate: '2026-04-01', endDate: '2026-07-30',
    description: '整合采购、仓储、配送全链路，提升供应链透明度与协同效率。',
    docs: [
      { id: 'd4', name: '现有系统评估报告.pdf', type: 'pdf', size: '1.8MB', stage: '预研阶段' },
      { id: 'd5', name: '需求规格说明书.docx', type: 'docx', size: '5.2MB', stage: '需求阶段' },
    ],
  },
  {
    id: 'pp3', name: 'AI 客服机器人接入', status: '进行中',
    client: '厉川零零', budget: '120000', startDate: '2026-01-10', endDate: '2026-04-30',
    description: '基于大模型的智能客服系统，支持多渠道接入，自动处理常见问题。',
    docs: [],
  },
];

// ── 可搜索预立项 Combobox ──────────────────────────────────────────────
function PreProjectCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = MOCK_PRE_PROJECTS.filter(p =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.client.toLowerCase().includes(query.toLowerCase())
  );
  const selected = MOCK_PRE_PROJECTS.find(p => p.id === value);
  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {selected ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-slate-100 text-sm truncate">{selected.name}</span>
            <span className="text-xs text-slate-500 shrink-0">· {selected.client}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${selected.status === '进行中' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>{selected.status}</span>
          </div>
        ) : (
          <span className="text-slate-500 text-sm flex-1">搜索或选择预立项...</span>
        )}
        <span className="text-slate-500 text-xs">▾</span>
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="输入项目名称或客户名搜索..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-500 text-center">未找到匹配的预立项</div>
            ) : filtered.map(p => (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); setOpen(false); setQuery(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-700 transition-colors text-left ${value === p.id ? 'bg-blue-600/20' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-100 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{p.client} · ¥{Number(p.budget).toLocaleString()} · {p.docs.length} 份资料</div>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${p.status === '进行中' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>{p.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
const AI_DOC_TEMPLATES = [
  { id: 'ai1', name: '项目立项申请书（AI生成）', desc: '包含项目背景、目标、范围、风险分析' },
  { id: 'ai2', name: '需求规格说明书模板（AI生成）', desc: '标准化需求文档框架，含功能清单' },
  { id: 'ai3', name: '项目计划书（AI生成）', desc: '里程碑计划、资源分配、风险管控' },
  { id: 'ai4', name: '合同附件清单（AI生成）', desc: '合同配套文件标准清单' },
];

function AttachmentBlock({
  attachments,
  onChange,
  context,
}: {
  attachments: Attachment[];
  onChange: (list: Attachment[]) => void;
  context: string;
}) {
  const [tab, setTab] = useState<'upload' | 'preproject' | 'ai'>('upload');
  const [selectedPP, setSelectedPP] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const add = (a: Attachment) => {
    if (attachments.find(x => x.id === a.id)) { toast.info('该文件已添加'); return; }
    onChange([...attachments, a]);
    toast.success(`已添加：${a.name}`);
  };

  const remove = (id: string) => onChange(attachments.filter(a => a.id !== id));

  const handleUpload = () => {
    if (!uploadName.trim()) { toast.error('请输入文件名'); return; }
    const name = uploadName.includes('.') ? uploadName : uploadName + '.pdf';
    add({ id: 'up-' + Date.now(), name, source: 'upload', size: '—', type: name.split('.').pop() });
    setUploadName('');
  };

  const handleGenerate = async (tpl: typeof AI_DOC_TEMPLATES[0]) => {
    setGeneratingId(tpl.id);
    await new Promise(r => setTimeout(r, 1200));
    add({ id: tpl.id + '-' + Date.now(), name: tpl.name, source: 'ai', type: 'docx', size: 'AI生成' });
    setGeneratingId(null);
  };

  const pp = MOCK_PRE_PROJECTS.find(p => p.id === selectedPP);

  return (
    <div className="mt-5 border-t border-slate-700/50 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-300">关联附件</span>
        <span className="text-xs text-slate-500 ml-1">（{context}）</span>
        {attachments.length > 0 && (
          <span className="ml-auto text-xs text-blue-400">{attachments.length} 个文件</span>
        )}
      </div>

      {/* 已添加的附件列表 */}
      {attachments.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {attachments.map(a => (
            <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs">
              <span className={`px-1.5 py-0.5 rounded font-mono uppercase text-[10px] ${
                a.source === 'ai' ? 'bg-purple-500/20 text-purple-300' :
                a.source === 'preproject' ? 'bg-blue-500/20 text-blue-300' :
                'bg-slate-600/40 text-slate-400'
              }`}>
                {a.source === 'ai' ? 'AI' : a.source === 'preproject' ? '引用' : a.type || 'file'}
              </span>
              <span className="text-slate-200 flex-1 truncate">{a.name}</span>
              {a.size && <span className="text-slate-500">{a.size}</span>}
              <button onClick={() => remove(a.id)} className="text-slate-600 hover:text-red-400 transition-colors ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 三个 Tab */}
      <div className="flex gap-1 mb-3">
        {([
          { key: 'upload', label: '上传文件', icon: Paperclip },
          { key: 'preproject', label: '引用预立项资料', icon: Link2 },
          { key: 'ai', label: 'AI 生成文档', icon: Sparkles },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              tab === t.key ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <t.icon className="w-3 h-3" /> {t.label}
          </button>
        ))}
      </div>

      {/* 上传文件 */}
      {tab === 'upload' && (
        <div className="flex gap-2">
          <Input value={uploadName} onChange={e => setUploadName(e.target.value)}
            placeholder="输入文件名（如：需求说明书.docx）"
            className="bg-slate-800 border-slate-700 text-slate-100 text-sm h-8 flex-1"
            onKeyDown={e => e.key === 'Enter' && handleUpload()} />
          <Button size="sm" onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs px-3">
            添加
          </Button>
        </div>
      )}

      {/* 引用预立项资料 */}
      {tab === 'preproject' && (
        <div className="space-y-2">
          <PreProjectCombobox value={selectedPP} onChange={setSelectedPP} />
          {pp && (
            <div className="space-y-1">
              {pp.docs.map(d => (
                <div key={d.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded font-mono uppercase text-[10px] bg-slate-600/40 text-slate-400">{d.type}</span>
                    <span className="text-slate-200">{d.name}</span>
                    <span className="text-slate-500">{d.size}</span>
                  </div>
                  <button onClick={() => add({ id: 'pp-' + d.id, name: d.name, source: 'preproject', size: d.size, type: d.type, preProjectId: pp.id, preProjectName: pp.name })}
                    className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-500/30 hover:bg-blue-500/10 transition-colors">
                    引用
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI 生成文档 */}
      {tab === 'ai' && (
        <div className="space-y-1.5">
          {AI_DOC_TEMPLATES.map(tpl => (
            <div key={tpl.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs">
              <div>
                <p className="text-slate-200">{tpl.name}</p>
                <p className="text-slate-500 mt-0.5">{tpl.desc}</p>
              </div>
              <button onClick={() => handleGenerate(tpl)} disabled={generatingId === tpl.id}
                className="shrink-0 ml-3 flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs px-2 py-0.5 rounded border border-purple-500/30 hover:bg-purple-500/10 transition-colors disabled:opacity-50">
                {generatingId === tpl.id ? <><Loader2 className="w-3 h-3 animate-spin" />生成中</> : <><Sparkles className="w-3 h-3" />生成</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 1：项目基本信息 ────────────────────────────────────
interface Step1Data {
  name: string; type: string; manager: string;
  startDate: string; endDate: string; budget: string; description: string;
  members: ProjectMember[];
  attachments: Attachment[];
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

  const handleAIFill = (filled: Record<string, string>) => {
    onChange({
      ...data,
      name: filled.name || data.name,
      type: filled.type || data.type,
      budget: filled.budget || data.budget,
      startDate: filled.startDate || data.startDate,
      endDate: filled.endDate || data.endDate,
      description: filled.description || data.description,
    });
  };

  return (
    <div className="space-y-6">
      {/* 预立项导入入口 */}
      <PreImportBanner mode="project" onFill={handleAIFill} />
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
// Step2 的整体数据：多份合同
interface ContractData {
  contracts: SingleContractData[];
  attachments: Attachment[];
}
const EMPTY_SINGLE_CONTRACT: SingleContractData = {
  contractName: '', contractNo: '', client: '', amount: '', signDate: '',
  startDate: '', endDate: '', contractInfo: '', remark: '',
  contractSubtype: '主合同', stages: [], members: [],
};
function SingleContractForm({
  contract, index, total,
  onChange, onRemove,
}: {
  contract: SingleContractData; index: number; total: number;
  onChange: (c: SingleContractData) => void; onRemove: () => void;
}) {
  const addStage = () => onChange({ ...contract, stages: [...contract.stages, { name: '', amount: '', dueDate: '' }] });
  const updateStage = (i: number, f: keyof ContractStage, v: string) => {
    const ss = [...contract.stages]; ss[i] = { ...ss[i], [f]: v };
    onChange({ ...contract, stages: ss });
  };
  const removeStage = (i: number) => onChange({ ...contract, stages: contract.stages.filter((_, idx) => idx !== i) });

  const addMember = () => onChange({ ...contract, members: [...contract.members, { name: '', role: '', days: '', rate: '' }] });
  const updateMember = (i: number, f: keyof ContractMember, v: string) => {
    const ms = [...contract.members]; ms[i] = { ...ms[i], [f]: v };
    onChange({ ...contract, members: ms });
  };
  const removeMember = (i: number) => onChange({ ...contract, members: contract.members.filter((_, idx) => idx !== i) });
  const totalCost = contract.members.reduce((s, m) => s + (Number(m.days) || 0) * (Number(m.rate) || 0), 0);

  return (
    <div className="border border-slate-700 rounded-xl p-4 space-y-4 bg-slate-900/40">
      {/* 合同头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">合同 {index + 1}</span>
          <select
            value={contract.contractSubtype}
            onChange={e => onChange({ ...contract, contractSubtype: e.target.value as SingleContractData['contractSubtype'] })}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-0.5 focus:outline-none"
          >
            <option value="主合同">主合同</option>
            <option value="补充协议">补充协议</option>
            <option value="变更协议">变更协议</option>
          </select>
        </div>
        {total > 1 && (
          <button onClick={onRemove} className="text-slate-600 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">合同名称<span className="text-red-400">*</span></Label>
          <Input value={contract.contractName} onChange={e => onChange({ ...contract, contractName: e.target.value })}
            placeholder="如：XX系统开发合同" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">合同编号</Label>
          <Input value={contract.contractNo} onChange={e => onChange({ ...contract, contractNo: e.target.value })}
            placeholder="如：HT-2026-001" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">甲方（客户）<span className="text-red-400">*</span></Label>
          <Input value={contract.client} onChange={e => onChange({ ...contract, client: e.target.value })}
            placeholder="客户公司名称" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">合同金额（元）<span className="text-red-400">*</span></Label>
          <Input type="number" value={contract.amount} onChange={e => onChange({ ...contract, amount: e.target.value })}
            placeholder="如 500000" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">签订日期</Label>
          <Input type="date" value={contract.signDate} onChange={e => onChange({ ...contract, signDate: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">合同开始日期</Label>
          <Input type="date" value={contract.startDate} onChange={e => onChange({ ...contract, startDate: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">合同结束日期</Label>
          <Input type="date" value={contract.endDate} onChange={e => onChange({ ...contract, endDate: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">合同信息</Label>
          <Textarea value={contract.contractInfo} onChange={e => onChange({ ...contract, contractInfo: e.target.value })}
            placeholder="合同主要内容描述..." rows={2}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
        </div>
        <div className="col-span-2">
          <Label className="text-slate-300 text-sm">合同备注</Label>
          <Textarea value={contract.remark} onChange={e => onChange({ ...contract, remark: e.target.value })}
            placeholder="特殊条款、注意事项等..." rows={2}
            className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
        </div>
      </div>

      {/* 收款分期节点 */}
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
        {contract.stages.length === 0 ? (
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
            {contract.stages.map((s, idx) => (
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

      {/* 人员人天规划 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-slate-300 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> 人员人天规划
              <span className="text-xs text-slate-500 font-normal">（内部成本核算，不对外）</span>
            </Label>
            {totalCost > 0 && (
              <div className="text-xs text-slate-400 mt-0.5">
                人力成本合计：<span className="text-blue-300 font-medium">¥{totalCost.toLocaleString()}</span>
                {contract.amount && Number(contract.amount) > 0 && (
                  <span className="ml-2 text-slate-500">
                    占合同 {((totalCost / Number(contract.amount)) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={addMember}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 h-7 text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> 添加人员
          </Button>
        </div>
        {contract.members.length === 0 ? (
          <div className="text-center py-3 text-slate-600 text-sm border border-dashed border-slate-700 rounded-lg">
            暂无人员规划，点击「添加人员」
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 px-2 text-xs text-slate-500">
              <div className="col-span-3">姓名</div>
              <div className="col-span-3">角色/工种</div>
              <div className="col-span-2 text-center">人天数</div>
              <div className="col-span-3 text-center">日费率(元)</div>
              <div className="col-span-1"></div>
            </div>
            {contract.members.map((m, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <div className="col-span-3">
                  <Input value={m.name} onChange={e => updateMember(idx, 'name', e.target.value)}
                    placeholder="如：张伟" className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-7" />
                </div>
                <div className="col-span-3">
                  <Input value={m.role} onChange={e => updateMember(idx, 'role', e.target.value)}
                    placeholder="如：前端开发" className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-7" />
                </div>
                <div className="col-span-2">
                  <Input type="number" value={m.days} onChange={e => updateMember(idx, 'days', e.target.value)}
                    placeholder="0" min="0"
                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-7 text-center" />
                </div>
                <div className="col-span-3">
                  <Input type="number" value={m.rate} onChange={e => updateMember(idx, 'rate', e.target.value)}
                    placeholder="0" min="0"
                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-7 text-center" />
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

function Step2({ data, onChange }: { data: ContractData; onChange: (d: ContractData) => void }) {
  const addContract = () => {
    onChange({ contracts: [...data.contracts, { ...EMPTY_SINGLE_CONTRACT }], attachments: data.attachments || [] });
  };
  const updateContract = (i: number, c: SingleContractData) => {
    const cs = [...data.contracts]; cs[i] = c;
    onChange({ contracts: cs, attachments: data.attachments || [] });
  };
  const removeContract = (i: number) => {
    if (data.contracts.length <= 1) return;
    onChange({ contracts: data.contracts.filter((_, idx) => idx !== i), attachments: data.attachments || [] });
  };

  const totalAmount = data.contracts.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const handleAIFillContract = (filled: Record<string, string>) => {
    if (data.contracts.length === 0) return;
    const first = { ...data.contracts[0] };
    if (filled.contractName) first.contractName = filled.contractName;
    if (filled.client) first.client = filled.client;
    if (filled.amount) first.amount = filled.amount;
    if (filled.signDate) first.signDate = filled.signDate;
    if (filled.startDate) first.startDate = filled.startDate;
    if (filled.endDate) first.endDate = filled.endDate;
    if (filled.contractInfo) first.contractInfo = filled.contractInfo;
    const cs = [...data.contracts]; cs[0] = first;
    onChange({ ...data, contracts: cs });
  };

  return (
    <div className="space-y-4">
      {/* 预立项导入入口 */}
      <PreImportBanner mode="contract" onFill={handleAIFillContract} />
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-1">
            <FileText className="w-3.5 h-3.5" />
            甲方合同（收款合同）· 外协合同在项目执行阶段创建
          </div>
          {totalAmount > 0 && (
            <div className="text-xs text-slate-400">
              合同总金额：<span className="text-emerald-400 font-medium">¥{totalAmount.toLocaleString()}</span>
              <span className="text-slate-500 ml-1">（{data.contracts.length} 份）</span>
            </div>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={addContract}
          className="border-slate-600 text-slate-300 hover:bg-slate-800 h-7 text-xs gap-1">
          <Plus className="w-3.5 h-3.5" /> 添加合同
        </Button>
      </div>

      {/* 合同列表 */}
      <div className="space-y-4">
        {data.contracts.map((c, i) => (
          <SingleContractForm
            key={i}
            contract={c}
            index={i}
            total={data.contracts.length}
            onChange={nc => updateContract(i, nc)}
            onRemove={() => removeContract(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Step 3：AI 风险审核 ────────────────────────────────────────
function Step3AI({ projectData, contractData, onAnalysisDone }:
  { projectData: Step1Data; contractData: ContractData; onAnalysisDone: (result: string) => void }) {
  const { run, loading, result, error, reset } = useAI({ model: 'gpt-4o-mini', temperature: 0.4, stream: true });
  const [started, setStarted] = useState(false);

  const totalAmount = contractData.contracts.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const durationDays = projectData.startDate && projectData.endDate
    ? Math.round((new Date(projectData.endDate).getTime() - new Date(projectData.startDate).getTime()) / 86400000)
    : 0;

  const handleAnalyze = async () => {
    setStarted(true);
    reset();
    const prompt = `你是一个资深项目风险顾问，请对以下立项信息进行专业风险分析：

项目名称：${projectData.name}
项目类型：${projectData.type}
项目经理：${projectData.manager}
项目周期：${projectData.startDate} 至 ${projectData.endDate}（${durationDays}天）
项目成员：${projectData.members.length}人（${projectData.members.map(m => m.name + '/' + m.role).join('、') || '未配置'}）
合同份数：${contractData.contracts.length}份
合同总额：￥${totalAmount.toLocaleString()}
甲方：${contractData.contracts[0]?.client || '未填写'}
${projectData.description ? '项目描述：' + projectData.description : ''}

请从以下维度进行分析，输出格式要简洁专业：
1. 风险等级：（低/中/高）并说明理由
2. 合同风险：合同金额、周期、条款方面的潜在风险
3. 资源风险：人员配置、周期合理性分析
4. 商务风险：甲方信用、项目范围变更等风险
5. 建议与对策：针对主要风险给出 3-5 条具体建议`;
    const res = await run([{ role: 'user', content: prompt }]);
    if (res) onAnalysisDone(res);
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-sm text-purple-300">
        <Bot className="w-5 h-5 mb-2" />
        <p>AI 将基于项目信息和合同详情，自动分析项目风险并给出专业建议，帮助项目经理提前识别潜在问题。</p>
      </div>

      {/* 项目摘要 */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-2 text-sm">
        <h3 className="text-slate-300 font-medium mb-2">立项信息摘要</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-slate-500">项目：</span><span className="text-slate-200">{projectData.name}</span></div>
          <div><span className="text-slate-500">类型：</span><span className="text-slate-200">{projectData.type}</span></div>
          <div><span className="text-slate-500">周期：</span><span className="text-slate-200">{durationDays} 天</span></div>
          <div><span className="text-slate-500">合同总额：</span><span className="text-green-400 font-semibold">￥{totalAmount.toLocaleString()}</span></div>
          <div><span className="text-slate-500">甲方：</span><span className="text-slate-200">{contractData.contracts[0]?.client || '—'}</span></div>
          <div><span className="text-slate-500">成员：</span><span className="text-slate-200">{projectData.members.length} 人</span></div>
        </div>
      </div>

      {/* AI 分析结果 */}
      {!started ? (
        <Button onClick={handleAnalyze} className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 py-3">
          <Bot className="w-5 h-5" /> 开始 AI 风险分析
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />分析中，请稍候...</> : <><ShieldCheck className="w-3.5 h-3.5 text-green-400" />分析完成</>}
            </span>
            {!loading && (
              <button onClick={handleAnalyze} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> 重新分析
              </button>
            )}
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>AI 分析失败：{error}，请点击重新分析</span>
            </div>
          )}
          {result && (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Step 4：PM确认 & 通知老板 ────────────────────────────────────
function Step4({ projectData, contractData, aiResult, onConfirm, confirmed }:
  { projectData: Step1Data; contractData: ContractData; aiResult: string; onConfirm: () => void; confirmed: boolean }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
        <UserCheck className="w-5 h-5 mb-2" />
        <p>请项目经理 <span className="font-semibold">{projectData.manager}</span> 核对立项信息和 AI 风险分析意见，确认后系统将自动发送通知给老板，无需额外签字。</p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4 text-sm">
        <div>
          <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">项目基本信息</h4>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">项目名称：</span><span className="text-slate-200">{projectData.name}</span></div>
            <div><span className="text-slate-500">类型：</span><span className="text-slate-200">{projectData.type}</span></div>
            <div><span className="text-slate-500">开始：</span><span className="text-slate-200">{projectData.startDate}</span></div>
            <div><span className="text-slate-500">结束：</span><span className="text-slate-200">{projectData.endDate}</span></div>
            {projectData.budget && <div className="col-span-2"><span className="text-slate-500">预算：</span><span className="text-green-400">￥{Number(projectData.budget).toLocaleString()}</span></div>}
          </div>
        </div>
        <div>
          <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">合同信息</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2"><span className="text-slate-500">合同（{contractData.contracts.length}份）：</span><span className="text-slate-200">{contractData.contracts.map(c=>c.contractName||c.contractSubtype).join('、')}</span></div>
            <div><span className="text-slate-500">甲方：</span><span className="text-slate-200">{contractData.contracts[0]?.client || '—'}</span></div>
            <div><span className="text-slate-500">合同总额：</span><span className="text-green-400 font-semibold">￥{contractData.contracts.reduce((s,c)=>s+(Number(c.amount)||0),0).toLocaleString()}</span></div>
          </div>
        </div>
        {projectData.members.length > 0 && (
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
        )}
        {aiResult && (
          <div>
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">AI 风险分析摘要</h4>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
              {aiResult.slice(0, 400)}{aiResult.length > 400 ? '...' : ''}
            </div>
          </div>
        )}
      </div>

      {!confirmed ? (
        <Button onClick={onConfirm} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <UserCheck className="w-4 h-4" /> 确认立项，自动通知老板
        </Button>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <Bell className="w-5 h-5" />
          <div>
            <p className="font-medium">立项确认成功！</p>
            <p className="text-xs text-green-500/80 mt-0.5">已自动发送通知给老板，项目将正式立项</p>
          </div>
        </div>
      )}
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
    name: '', type: '', manager: '张伟', startDate: '', endDate: '', budget: '', description: '', members: [], attachments: []
  });
  const [step2, setStep2] = useState<ContractData>({
    contracts: [{ ...EMPTY_SINGLE_CONTRACT }],
    attachments: []
  });
  const [aiResult, setAiResult] = useState('');
  const [step3Done, setStep3Done] = useState(false);

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
      const first = step2.contracts[0];
      if (!first || !first.contractName.trim()) { toast.error('请填写合同名称'); return; }
      if (!first.client.trim()) { toast.error('请填写甲方名称'); return; }
      if (!first.amount || Number(first.amount) <= 0) { toast.error('请填写合同金额'); return; }
    }
    if (step === 3) {
      // AI 分析可跳过，直接进入下一步
    }
    if (step < 4) setStep(s => s + 1);
  };

  const handleSign = () => {
    setDone(true);
    toast.success(`项目「${step1.name}」已正式立项！`);
    // 立项完成 → 自动将所有甲方合同写入合同台账
    if (onContractCreated) {
      const now = new Date().toISOString().slice(0, 10);
      const baseUid = String(Date.now()).slice(-4);
      const projectId = `PRJ-NEW-${baseUid}`;
      step2.contracts.forEach((c, idx) => {
        if (!c.contractName || !c.client || !c.amount) return;
        const uid = `${baseUid}-${idx}`;
        const newContract: Contract = {
          id: `CON-NEW-${uid}`,
          contractNo: c.contractNo || `HT-${new Date().getFullYear()}-${uid}`,
          contractName: c.contractName + (c.contractSubtype !== '主合同' ? `（${c.contractSubtype}）` : ''),
          contractInfo: c.contractInfo || '',
          remark: c.remark || '',
          projectId,
          projectName: step1.name,
          type: '甲方合同',
          vendor: c.client,
          amount: Number(c.amount),
          signDate: c.signDate || now,
          startDate: c.startDate || step1.startDate,
          endDate: c.endDate || step1.endDate,
          status: '待签署',
          paidAmount: 0,
          pendingAmount: Number(c.amount),
          stages: c.stages.map(s => ({
            name: s.name,
            amount: Number(s.amount) || 0,
            dueDate: s.dueDate,
            status: '未回款' as const,
          })),
        };
        onContractCreated(newContract);
      });
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
        <p className="text-sm text-slate-400 mt-0.5">完成四步立项流程，正式创建项目</p>
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
        {step === 3 && <Step3AI projectData={step1} contractData={step2} onAnalysisDone={(r) => { setAiResult(r); setStep3Done(true); }} />}
        {step === 4 && (
          <Step4 projectData={step1} contractData={step2} aiResult={aiResult}
            onConfirm={() => { setPmConfirmed(true); }} confirmed={pmConfirmed} />
        )}

      </div>

      {/* 底部按钮 */}
      {step !== 4 && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
            {step === 3 ? (step3Done ? '下一步（已完成分析）' : '跳过，直接下一步') : '下一步'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
      {step === 4 && pmConfirmed && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleSign} className="bg-green-600 hover:bg-green-700 text-white gap-2 px-6">
            正式立项 <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
