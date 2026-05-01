// 厉川外包项目管理平台 — 预立项模块
// 设计风格：深色专业管理台风
// 功能：新建预立项 → 上传前置资料（按阶段分类）→ 发起正式立项（携带预立项ID）
import { useState } from 'react';
import {
  Plus, Search, FolderOpen, Upload, FileText, Trash2, Edit2,
  ChevronRight, ArrowRight, Clock, CheckCircle2, Archive,
  BookOpen, BarChart2, ClipboardList, Layers, FileCheck,
  X, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── 数据类型 ──────────────────────────────────────────────
type PreProjectStatus = '草稿' | '进行中' | '已转立项';

type DocumentStage =
  | '预研阶段'
  | '调研阶段'
  | '可研阶段'
  | '需求阶段'
  | '方案阶段'
  | '立项申请';

interface PreDocument {
  id: string;
  name: string;
  stage: DocumentStage;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  size: string;
  type: string; // 文件类型后缀
}

interface PreProject {
  id: string;
  name: string;
  client: string;
  manager: string;
  status: PreProjectStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  documents: PreDocument[];
  estimatedAmount?: number;
}

// ── Mock 数据 ──────────────────────────────────────────────
const STAGE_ICONS: Record<DocumentStage, React.ElementType> = {
  '预研阶段': BookOpen,
  '调研阶段': Search,
  '可研阶段': BarChart2,
  '需求阶段': ClipboardList,
  '方案阶段': Layers,
  '立项申请': FileCheck,
};

const STAGE_COLORS: Record<DocumentStage, string> = {
  '预研阶段': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  '调研阶段': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  '可研阶段': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  '需求阶段': 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  '方案阶段': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  '立项申请': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const ALL_STAGES: DocumentStage[] = ['预研阶段', '调研阶段', '可研阶段', '需求阶段', '方案阶段', '立项申请'];

const INIT_PRE_PROJECTS: PreProject[] = [
  {
    id: 'PRE-2026-001',
    name: '智慧园区管理平台',
    client: '绿城集团',
    manager: '张伟',
    status: '进行中',
    description: '为绿城集团旗下多个园区提供统一的智慧管理平台，涵盖访客、停车、能耗、安防等模块。',
    createdAt: '2026-04-10',
    updatedAt: '2026-04-28',
    estimatedAmount: 850000,
    documents: [
      { id: 'doc1', name: '智慧园区需求调研报告.docx', stage: '调研阶段', uploadedBy: '张伟', uploadedAt: '2026-04-12', version: 'v1.0', size: '2.3MB', type: 'docx' },
      { id: 'doc2', name: '竞品分析与技术预研.pdf', stage: '预研阶段', uploadedBy: '张伟', uploadedAt: '2026-04-15', version: 'v1.0', size: '4.1MB', type: 'pdf' },
      { id: 'doc3', name: '可行性研究报告.pdf', stage: '可研阶段', uploadedBy: '张伟', uploadedAt: '2026-04-20', version: 'v1.1', size: '3.8MB', type: 'pdf' },
      { id: 'doc4', name: '产品需求规格说明书.docx', stage: '需求阶段', uploadedBy: '张伟', uploadedAt: '2026-04-25', version: 'v2.0', size: '5.2MB', type: 'docx' },
    ],
  },
  {
    id: 'PRE-2026-002',
    name: 'AI 客服机器人升级',
    client: '厉川科技',
    manager: '刘芳',
    status: '草稿',
    description: '对现有 AI 客服系统进行大模型升级，接入 RAG 知识库，提升响应准确率至 95% 以上。',
    createdAt: '2026-04-22',
    updatedAt: '2026-04-22',
    estimatedAmount: 320000,
    documents: [
      { id: 'doc5', name: '现有系统评估报告.pdf', stage: '预研阶段', uploadedBy: '刘芳', uploadedAt: '2026-04-22', version: 'v1.0', size: '1.8MB', type: 'pdf' },
    ],
  },
  {
    id: 'PRE-2026-003',
    name: '数字化仓储管理系统',
    client: '厉川物流',
    manager: '陈建国',
    status: '已转立项',
    description: '为厉川物流仓储中心提供全流程数字化管理，包括入库、出库、盘点、调拨等核心业务。',
    createdAt: '2026-03-15',
    updatedAt: '2026-04-01',
    estimatedAmount: 480000,
    documents: [
      { id: 'doc6', name: '仓储业务调研报告.docx', stage: '调研阶段', uploadedBy: '陈建国', uploadedAt: '2026-03-18', version: 'v1.0', size: '3.1MB', type: 'docx' },
      { id: 'doc7', name: '系统可行性分析.pdf', stage: '可研阶段', uploadedBy: '陈建国', uploadedAt: '2026-03-22', version: 'v1.0', size: '2.7MB', type: 'pdf' },
      { id: 'doc8', name: '需求规格说明书.docx', stage: '需求阶段', uploadedBy: '陈建国', uploadedAt: '2026-03-28', version: 'v1.2', size: '6.4MB', type: 'docx' },
      { id: 'doc9', name: '技术方案设计.pptx', stage: '方案阶段', uploadedBy: '陈建国', uploadedAt: '2026-04-01', version: 'v1.0', size: '8.9MB', type: 'pptx' },
      { id: 'doc10', name: '立项申请书.docx', stage: '立项申请', uploadedBy: '陈建国', uploadedAt: '2026-04-01', version: 'v1.0', size: '1.2MB', type: 'docx' },
    ],
  },
];

const STATUS_CONFIG: Record<PreProjectStatus, { color: string; icon: React.ElementType }> = {
  '草稿':    { color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', icon: Clock },
  '进行中':  { color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: FolderOpen },
  '已转立项': { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
};

// ── 文件类型图标颜色 ──────────────────────────────────────
function FileTypeTag({ type }: { type: string }) {
  const colors: Record<string, string> = {
    pdf: 'bg-red-500/15 text-red-400', docx: 'bg-blue-500/15 text-blue-400',
    pptx: 'bg-orange-500/15 text-orange-400', xlsx: 'bg-emerald-500/15 text-emerald-400',
    png: 'bg-purple-500/15 text-purple-400', jpg: 'bg-purple-500/15 text-purple-400',
  };
  return (
    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-mono uppercase', colors[type] || 'bg-slate-500/15 text-slate-400')}>
      {type}
    </span>
  );
}

// ── 预立项详情面板 ────────────────────────────────────────
function PreProjectDetail({
  project,
  onClose,
  onUpdate,
  onStartProject,
}: {
  project: PreProject;
  onClose: () => void;
  onUpdate: (p: PreProject) => void;
  onStartProject: (preProjectId: string) => void;
}) {
  const [activeStage, setActiveStage] = useState<DocumentStage | 'all'>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', stage: '需求阶段' as DocumentStage, version: 'v1.0' });

  const filteredDocs = activeStage === 'all'
    ? project.documents
    : project.documents.filter(d => d.stage === activeStage);

  function handleUpload() {
    if (!uploadForm.name.trim()) { toast.error('请输入文件名'); return; }
    const newDoc: PreDocument = {
      id: `doc${Date.now()}`,
      name: uploadForm.name.endsWith('.pdf') || uploadForm.name.includes('.') ? uploadForm.name : uploadForm.name + '.pdf',
      stage: uploadForm.stage,
      uploadedBy: '张伟',
      uploadedAt: new Date().toISOString().slice(0, 10),
      version: uploadForm.version,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)}MB`,
      type: uploadForm.name.split('.').pop() || 'pdf',
    };
    onUpdate({ ...project, documents: [...project.documents, newDoc] });
    setShowUpload(false);
    setUploadForm({ name: '', stage: '需求阶段', version: 'v1.0' });
    toast.success('文件已上传到资料库');
  }

  function handleDeleteDoc(id: string) {
    onUpdate({ ...project, documents: project.documents.filter(d => d.id !== id) });
    toast.success('文件已删除');
  }

  const stageCounts = ALL_STAGES.reduce((acc, s) => {
    acc[s] = project.documents.filter(d => d.stage === s).length;
    return acc;
  }, {} as Record<DocumentStage, number>);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-foreground">{project.name}</h2>
              <span className={cn('text-xs px-2 py-0.5 rounded-full border flex items-center gap-1', STATUS_CONFIG[project.status].color)}>
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span>客户：{project.client}</span>
              <span>负责人：{project.manager}</span>
              {project.estimatedAmount && <span>预估金额：¥{(project.estimatedAmount / 10000).toFixed(0)}万</span>}
              <span>更新：{project.updatedAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {project.status !== '已转立项' && (
              <button
                onClick={() => onStartProject(project.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                发起正式立项 <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧阶段导航 */}
          <div className="w-44 border-r border-border p-3 space-y-1 shrink-0">
            <button
              onClick={() => setActiveStage('all')}
              className={cn('w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                activeStage === 'all' ? 'bg-blue-600/20 text-blue-400' : 'text-muted-foreground hover:bg-slate-800/50')}
            >
              <span>全部文件</span>
              <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{project.documents.length}</span>
            </button>
            {ALL_STAGES.map(stage => {
              const Icon = STAGE_ICONS[stage];
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={cn('w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                    activeStage === stage ? 'bg-blue-600/20 text-blue-400' : 'text-muted-foreground hover:bg-slate-800/50')}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{stage.replace('阶段', '').replace('申请', '')}</span>
                  </div>
                  {stageCounts[stage] > 0 && (
                    <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{stageCounts[stage]}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 右侧文件列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                {activeStage === 'all' ? '全部文件' : activeStage} · {filteredDocs.length} 个文件
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> 上传文件
              </button>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <div className="text-sm">暂无文件，点击「上传文件」添加</div>
              </div>
            ) : (
              filteredDocs.map(doc => {
                const StageIcon = STAGE_ICONS[doc.stage];
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-colors group">
                    <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', STAGE_COLORS[doc.stage])}>
                      <StageIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground font-medium truncate">{doc.name}</span>
                        <FileTypeTag type={doc.type} />
                        <span className="text-xs text-slate-500">{doc.version}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className={cn('px-1.5 py-0.5 rounded border text-[10px]', STAGE_COLORS[doc.stage])}>{doc.stage}</span>
                        <span>{doc.uploadedBy}</span>
                        <span>{doc.uploadedAt}</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-400 hover:text-blue-400 transition-colors p-1" title="预览">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteDoc(doc.id)} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="删除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 上传弹窗 */}
        {showUpload && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-xl">
            <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 space-y-4 m-4">
              <div className="font-semibold text-foreground">上传前置资料</div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">文件名（含后缀）*</label>
                <input value={uploadForm.name} onChange={e => setUploadForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="例：需求规格说明书.docx"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">所属阶段</label>
                  <select value={uploadForm.stage} onChange={e => setUploadForm(p => ({ ...p, stage: e.target.value as DocumentStage }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
                    {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">版本号</label>
                  <input value={uploadForm.version} onChange={e => setUploadForm(p => ({ ...p, version: e.target.value }))}
                    placeholder="v1.0"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              {/* 模拟上传区 */}
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center text-sm text-muted-foreground hover:border-blue-500/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <div>点击或拖拽文件到此处</div>
                <div className="text-xs mt-1 text-slate-500">支持 PDF、Word、PPT、Excel、图片等格式</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowUpload(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors">取消</button>
                <button onClick={handleUpload} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">确认上传</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 新建预立项弹窗 ────────────────────────────────────────
function NewPreProjectModal({ onSave, onClose }: {
  onSave: (p: PreProject) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: '', client: '', manager: '张伟', description: '', estimatedAmount: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.client.trim()) { toast.error('项目名称和客户不能为空'); return; }
    const now = new Date().toISOString().slice(0, 10);
    onSave({
      id: `PRE-${Date.now()}`,
      name: form.name,
      client: form.client,
      manager: form.manager,
      status: '草稿',
      description: form.description,
      createdAt: now,
      updatedAt: now,
      documents: [],
      estimatedAmount: form.estimatedAmount ? Number(form.estimatedAmount) * 10000 : undefined,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="font-semibold text-foreground">新建预立项</div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">项目名称 *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="例：智慧园区管理平台"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">客户 / 甲方 *</label>
              <input value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))}
                placeholder="例：绿城集团"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">负责人</label>
              <select value={form.manager} onChange={e => setForm(p => ({ ...p, manager: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
                {['张伟', '刘芳', '陈建国'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">预估金额（万元）</label>
            <input type="number" value={form.estimatedAmount} onChange={e => setForm(p => ({ ...p, estimatedAmount: e.target.value }))}
              placeholder="例：85"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">项目描述</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="简要描述项目背景和目标..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors">取消</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">创建预立项</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────
interface PreProjectPageProps {
  onStartProject?: (preProjectId: string, preProjectName: string) => void;
}

export default function PreProjectPage({ onStartProject }: PreProjectPageProps) {
  const [projects, setProjects] = useState<PreProject[]>(INIT_PRE_PROJECTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PreProjectStatus>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PreProject | null>(null);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.includes(search) || p.client.includes(search) || p.manager.includes(search);
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleCreate(p: PreProject) {
    setProjects(prev => [p, ...prev]);
    setShowNewModal(false);
    toast.success('预立项已创建，请上传前置资料');
    setSelectedProject(p);
  }

  function handleUpdate(p: PreProject) {
    setProjects(prev => prev.map(x => x.id === p.id ? p : x));
    setSelectedProject(p);
  }

  function handleStartProject(preProjectId: string) {
    const p = projects.find(x => x.id === preProjectId);
    if (!p) return;
    setProjects(prev => prev.map(x => x.id === preProjectId ? { ...x, status: '已转立项' } : x));
    setSelectedProject(null);
    toast.success(`「${p.name}」已发起正式立项`);
    onStartProject?.(preProjectId, p.name);
  }

  const stats = {
    total: projects.length,
    draft: projects.filter(p => p.status === '草稿').length,
    active: projects.filter(p => p.status === '进行中').length,
    converted: projects.filter(p => p.status === '已转立项').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">预立项管理</h1>
          <p className="text-sm text-muted-foreground mt-1">正式立项前的前置资料库，按阶段上传调研、需求、方案等文件</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> 新建预立项
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '全部', value: stats.total, color: 'text-foreground', bg: 'bg-slate-800/50 border-slate-700' },
          { label: '草稿', value: stats.draft, color: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-700' },
          { label: '进行中', value: stats.active, color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/20' },
          { label: '已转立项', value: stats.converted, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={cn('border rounded-xl p-4 text-center', s.bg)}>
            <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索项目名称、客户、负责人..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex items-center gap-1 bg-slate-800/50 border border-border rounded-lg p-1">
          {(['all', '草稿', '进行中', '已转立项'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-3 py-1.5 rounded text-xs font-medium transition-colors',
                filterStatus === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {s === 'all' ? '全部' : s}
            </button>
          ))}
        </div>
      </div>

      {/* 预立项列表 */}
      <div className="space-y-3">
        {filtered.map(p => {
          const docsByStage = ALL_STAGES.filter(s => p.documents.some(d => d.stage === s));
          return (
            <div key={p.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-slate-500 transition-colors cursor-pointer group"
              onClick={() => setSelectedProject(p)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs text-muted-foreground font-mono">{p.id}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border', STATUS_CONFIG[p.status].color)}>
                      {p.status}
                    </span>
                  </div>
                  <div className="font-semibold text-foreground text-base mb-1">{p.name}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>客户：{p.client}</span>
                    <span>负责人：{p.manager}</span>
                    {p.estimatedAmount && <span>预估：¥{(p.estimatedAmount / 10000).toFixed(0)}万</span>}
                    <span>更新：{p.updatedAt}</span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{p.description}</p>
                  )}
                  {/* 阶段完成度 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {ALL_STAGES.map(stage => {
                      const Icon = STAGE_ICONS[stage];
                      const hasDoc = p.documents.some(d => d.stage === stage);
                      return (
                        <div key={stage} className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-lg border',
                          hasDoc ? STAGE_COLORS[stage] : 'text-slate-600 bg-slate-800/30 border-slate-700/50')}>
                          <Icon className="w-3 h-3" />
                          <span>{stage.replace('阶段', '').replace('申请', '')}</span>
                          {hasDoc && <span className="text-[10px]">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{p.documents.length} 个文件</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{docsByStage.length}/{ALL_STAGES.length} 阶段</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <div>暂无预立项，点击「新建预立项」开始</div>
          </div>
        )}
      </div>

      {/* 弹窗 */}
      {showNewModal && <NewPreProjectModal onSave={handleCreate} onClose={() => setShowNewModal(false)} />}
      {selectedProject && (
        <PreProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={handleUpdate}
          onStartProject={handleStartProject}
        />
      )}
    </div>
  );
}

// 导出供其他模块引用
export type { PreProject, PreDocument };
