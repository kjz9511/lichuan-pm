// 厉川外包项目管理平台 — 里程碑 & 交付物页面
// 设计风格：深色专业管理台风，AI审核评分 + 状态管理
// 功能：交付物上传（支持描述/类型）→ AI 自动审查（代码/日报/UI等）→ PM/老板人工通过/驳回
import { cn } from '@/lib/utils';
import { Bot, FileUp, Sparkles, CheckCircle2, XCircle, AlertTriangle, Upload, Archive, FolderOpen, FileText, ChevronDown, ChevronRight, ExternalLink, Search, X as XIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { milestones as initialMilestones, projects, contracts } from '../lib/mockData';
import { toast } from 'sonner';
import { useAI } from '@/hooks/useAI';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

interface MilestoneItem {
  id: string;
  name: string;
  type: string;
  status: string;
  projectId: string;
  submitter: string;
  dueDate: string;
  aiScore?: number;
  aiReport?: string;
  issues?: string[];
  deliverableDesc?: string;
  deliverableType?: string;
  submittedAt?: string;
  previewUrl?: string;
  previewType?: 'image' | 'pdf' | 'code' | 'doc';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    '待提交': 'badge-gray',
    '已提交': 'badge-blue',
    '审核中': 'badge-yellow',
    '已通过': 'badge-green',
    '已驳回': 'badge-red',
  };
  return <span className={cn(map[status] || 'badge-gray', 'px-2 py-0.5 rounded text-xs font-medium')}>{status}</span>;
}

function AIScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn('text-xs font-bold', textColor)}>{score}分</span>
    </div>
  );
}

// ── 交付物上传 + AI 审查弹窗 ─────────────────────────────────
interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  milestone: MilestoneItem | null;
  onSubmit: (id: string, patch: Partial<MilestoneItem>) => void;
}

function UploadDialog({ open, onClose, milestone, onSubmit }: UploadDialogProps) {
  const [desc, setDesc] = useState('');
  const [delivType, setDelivType] = useState('代码提交');
  const [aiReport, setAiReport] = useState('');
  const [aiDone, setAiDone] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { run: runAI } = useAI({ stream: true });
  if (!milestone) return null;;

  const DELIV_TYPES = ['代码提交', 'UI 设计稿', '日报/周报', '测试报告', '需求文档', '其他'];

  const handleAIReview = async () => {
    if (!desc.trim()) { toast.error('请先填写交付物描述'); return; }
    setAiLoading(true);
    setAiReport('');
    const prompt = `你是一位专业的项目交付物审查专家。请对以下交付物进行质量审查，输出4个部分：
1. 【质量评分】给出0-100的整数评分（格式必须为：评分：XX）
2. 【审查摘要】2-3句话概括交付物情况
3. 【问题清单】列出1-3个具体问题或风险（如有），每条以"⚠"开头；如无问题则写"✓ 未发现明显问题"
4. 【改进建议】1-2条具体改进建议

交付物信息：
- 里程碑名称：${milestone.name}
- 交付物类型：${delivType}
- 项目：${projects.find(p => p.id === milestone.projectId)?.name || milestone.projectId}
- 提交人：${milestone.submitter}
- 交付物描述：${desc}

请用中文回答，语言简洁专业。`;
    await runAI(
      [
        { role: 'system', content: '你是厉川外包项目管理平台的AI助手，专注于项目交付物质量审查。' },
        { role: 'user', content: prompt }
      ],
      (chunk) => setAiReport(prev => prev + chunk)
    );
    setAiDone(true);
    setAiLoading(false);
  };

  const extractScore = (report: string): number => {
    const match = report.match(/评分[：:]\s*(\d+)/);
    return match ? Math.min(100, Math.max(0, parseInt(match[1]))) : 75;
  };

  const extractIssues = (report: string): string[] => {
    const lines = report.split('\n');
    return lines
      .filter(l => l.trim().startsWith('⚠'))
      .map(l => l.trim().replace(/^⚠\s*/, ''));
  };

  const handleSubmit = () => {
    if (!aiDone) { toast.error('请先完成 AI 审查'); return; }
    const score = extractScore(aiReport);
    const issues = extractIssues(aiReport);
    const fileExt = uploadedFile ? uploadedFile.name.split('.').pop()?.toLowerCase() : '';
    const previewType: MilestoneItem['previewType'] =
      ['jpg','jpeg','png','gif','webp','svg'].includes(fileExt || '') ? 'image' :
      fileExt === 'pdf' ? 'pdf' :
      ['js','ts','tsx','jsx','py','java','go','css','html','json','md','txt'].includes(fileExt || '') ? 'code' : 'doc';
    const previewUrl = uploadedFile ? URL.createObjectURL(uploadedFile) : undefined;
    onSubmit(milestone.id, {
      status: '审核中',
      deliverableDesc: desc,
      deliverableType: delivType,
      submittedAt: new Date().toISOString().slice(0, 10),
      aiScore: score,
      aiReport,
      issues,
      previewUrl,
      previewType,
    });
    toast.success(`交付物已提交，AI 审查完成（${score}分），等待人工确认`);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setDesc(''); setDelivType('代码提交');
    setAiReport(''); setAiDone(false); setAiLoading(false); setUploadedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); resetForm(); } }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            提交交付物
          </DialogTitle>
        </DialogHeader>

        {/* 里程碑信息 */}
        <div className="bg-slate-800/60 rounded-xl p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">里程碑</span>
            <span className="text-slate-200 font-medium">{milestone.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">项目</span>
            <span className="text-slate-400">{projects.find(p => p.id === milestone.projectId)?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">截止日期</span>
            <span className="text-slate-400">{milestone.dueDate}</span>
          </div>
        </div>

        {/* 交付物信息 */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">交付物类型</label>
            <div className="flex flex-wrap gap-1.5">
              {DELIV_TYPES.map(t => (
                <button key={t} onClick={() => setDelivType(t)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs border transition-colors',
                    delivType === t
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              交付物描述 <span className="text-red-400">*</span>
              <span className="text-slate-600 ml-1">（AI 将基于此内容进行审查）</span>
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={4}
              placeholder={
                delivType === '代码提交' ? '描述本次提交的代码内容、功能点、修改范围...' :
                delivType === 'UI 设计稿' ? '描述设计稿内容、页面数量、设计规范...' :
                delivType === '日报/周报' ? '描述本周/日工作内容、进度、问题...' :
                '描述交付物的具体内容和完成情况...'
              }
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* 文件上传区域 */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">附件上传（可选）</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-600 hover:border-blue-500/50 bg-slate-800/40 cursor-pointer transition-colors"
            >
              <FileUp className="w-4 h-4 text-slate-500 shrink-0" />
              {uploadedFile ? (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 truncate">{uploadedFile.name}</p>
                  <p className="text-[10px] text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <span className="text-xs text-slate-500">点击选择文件（支持 PDF、图片、代码文件等）</span>
              )}
              {uploadedFile && (
                <button
                  onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                  className="ml-auto text-slate-500 hover:text-red-400 transition-colors"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); e.target.value = ''; }}
            />
          </div>
          {/* AI 审查区域 */}
          <div className="border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" /> AI 交付物审查
              </span>
              <button
                onClick={handleAIReview}
                disabled={aiLoading || !desc.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors disabled:opacity-40"
              >
                {aiLoading ? (
                  <><span className="animate-spin inline-block">⟳</span> 审查中...</>
                ) : (
                  <><Sparkles className="w-3 h-3" /> {aiDone ? '重新审查' : '开始 AI 审查'}</>
                )}
              </button>
            </div>
            {(aiReport || aiLoading) && (
              <div className="px-3 py-2.5 bg-slate-900/40">
                {aiDone && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-500">AI 评分：</span>
                    <AIScoreBar score={extractScore(aiReport)} />
                  </div>
                )}
                <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {aiReport || <span className="text-slate-500 animate-pulse">AI 正在审查...</span>}
                </div>
              </div>
            )}
            {!aiReport && !aiLoading && (
              <div className="px-3 py-4 text-center text-xs text-slate-600">
                填写交付物描述后，点击「开始 AI 审查」获取智能分析
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button onClick={() => { onClose(); resetForm(); }}
            className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 text-xs hover:bg-slate-800 transition-colors">
            取消
          </button>
          <button onClick={handleSubmit} disabled={!aiDone}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors disabled:opacity-40 flex items-center gap-1.5">
            <Upload className="w-3 h-3" /> 提交并等待人工确认
           </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 文件预览弹窗 ─────────────────────────────────────────────
interface FilePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  url?: string;
  type?: 'image' | 'pdf' | 'code' | 'doc';
  name?: string;
}
function FilePreviewDialog({ open, onClose, url, type, name }: FilePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-slate-100 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-blue-400" />
            {name || '文件预览'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto rounded-lg">
          {!url ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">该交付物未上传文件，仅有文字描述</p>
            </div>
          ) : type === 'image' ? (
            <img src={url} alt={name} className="w-full h-auto rounded-lg object-contain max-h-[60vh]" />
          ) : type === 'pdf' ? (
            <iframe src={url} className="w-full h-[60vh] rounded-lg border-0" title={name} />
          ) : type === 'code' ? (
            <div className="bg-slate-950 rounded-lg p-4 overflow-auto max-h-[60vh]">
              <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
                <code>文件内容预览（实际部署后可读取文件内容）</code>
              </pre>
              <div className="mt-3 pt-3 border-t border-slate-800">
                <a href={url} download={name} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5">
                  <FileUp className="w-3.5 h-3.5" /> 下载文件
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FileText className="w-12 h-12 text-slate-600" />
              <p className="text-sm text-slate-400">文件类型暂不支持内嵌预览</p>
              <a href={url} download={name} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-600/30 transition-colors">
                <FileUp className="w-4 h-4" /> 下载文件
              </a>
            </div>
          )}
        </div>
        <div className="shrink-0 pt-3 border-t border-slate-700/50 flex justify-between items-center">
          {url && (
            <a href={url} download={name} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
              <FileUp className="w-3 h-3" /> 下载原文件
            </a>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors"
          >
            关闭
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── AI 健康度检查弹窗 ───────────────────────────────────────
interface HealthCheckDialogProps {
  open: boolean;
  onClose: () => void;
  milestones: MilestoneItem[];
  projectName: string;
}
function HealthCheckDialog({ open, onClose, milestones, projectName }: HealthCheckDialogProps) {
  const { run, loading, result, reset } = useAI({ stream: true, temperature: 0.3 });
  const [started, setStarted] = useState(false);

  const handleCheck = async () => {
    setStarted(true);
    reset();
    const submitted = milestones.filter(m => m.aiScore !== undefined);
    const summary = submitted.map(m =>
      `- ${m.name}（${m.type}）| 状态: ${m.status} | AI评分: ${m.aiScore}分${m.issues?.length ? ' | 问题: ' + m.issues.join('；') : ''}`
    ).join('\n');
    const pending = milestones.filter(m => m.status === '待提交').map(m => `- ${m.name}（截止 ${m.dueDate}）`).join('\n');
    await run([
      {
        role: 'system',
        content: '你是一个专业的软件项目交付物健康度分析师。请根据提供的里程碑数据，输出简洁、专业的中文健康度报告。包含：总体健康度评分（100分制）、主要风险点、待提交节点预警、改进建议。使用 Markdown 格式输出。'
      },
      {
        role: 'user',
        content: `项目：${projectName}\n\n已提交交付物（${submitted.length}个）：\n${summary || '暂无'}\n\n待提交节点（${milestones.filter(m => m.status === '待提交').length}个）：\n${pending || '暂无'}\n\n请生成该项目交付物健康度报告。`
      }
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); setStarted(false); reset(); } }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI 交付物健康度检查
            <span className="text-sm font-normal text-slate-400 ml-1">— {projectName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!started ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">将对当前项目的 <span className="text-purple-300">{milestones.length}</span> 个里程碑进行全面健康度评估</p>
                <p className="text-xs text-slate-500 mt-1">包含 AI 评分分析、风险识别、待提交预警和改进建议</p>
              </div>
              <button
                onClick={handleCheck}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                开始 AI 分析
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-2 p-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs text-purple-300">AI 正在分析交付物健康度…</span>
              </div>
              {result ? (
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono text-xs bg-slate-800/50 rounded-lg p-4">
                  {result}
                </div>
              ) : (
                <div className="space-y-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-3 bg-slate-800 rounded animate-pulse`} style={{ width: `${60 + i * 8}%` }} />
                  ))}
                </div>
              )}
            </div>
          ) : result ? (
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-800/50 rounded-lg p-4">
              {result}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 pt-3 border-t border-slate-700/50 flex items-center justify-between">
          {started && !loading && (
            <button
              onClick={() => { setStarted(false); reset(); }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              重新分析
            </button>
          )}
          <button
            onClick={() => { onClose(); setStarted(false); reset(); }}
            className="ml-auto px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors"
          >
            关闭
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── 项目资产库弹窗 ─────────────────────────────────────────────
interface AssetLibraryDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  milestoneList: MilestoneItem[];
}
function AssetLibraryDialog({ open, onClose, projectId, milestoneList }: AssetLibraryDialogProps) {
  const project = projects.find(p => p.id === projectId);
  const allContracts = contracts.filter(c => c.projectId === projectId);
  const allMilestones = milestoneList.filter(m => m.projectId === projectId);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contracts: true, milestones: true, initDocs: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const q = searchQuery.trim().toLowerCase();

  // 立项资料（固定示例）
  const initDocs = [
    { name: '项目立项报告.docx', type: 'DOC', size: '128 KB', date: project?.startDate || '' },
    { name: '需求规格说明书.pdf', type: 'PDF', size: '2.4 MB', date: project?.startDate || '' },
    { name: '项目可行性分析.xlsx', type: 'XLS', size: '86 KB', date: project?.startDate || '' },
  ];

  const projectContracts = q
    ? allContracts.filter(c =>
        c.contractName.toLowerCase().includes(q) ||
        c.contractNo.toLowerCase().includes(q) ||
        c.vendor.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
      )
    : allContracts;

  const projectMilestones = q
    ? allMilestones.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.submitter.toLowerCase().includes(q) ||
        (m.deliverableDesc || '').toLowerCase().includes(q)
      )
    : allMilestones;

  const filteredInitDocs = q
    ? initDocs.filter(d => d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q))
    : initDocs;

  const totalResults = projectContracts.length + projectMilestones.length + filteredInitDocs.length;

  const statusColor: Record<string, string> = {
    '已通过': 'text-emerald-400 bg-emerald-500/10',
    '审核中': 'text-amber-400 bg-amber-500/10',
    '已驳回': 'text-red-400 bg-red-500/10',
    '待提交': 'text-slate-400 bg-slate-500/10',
    '已提交': 'text-blue-400 bg-blue-500/10',
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <Archive className="w-5 h-5 text-blue-400" />
            项目资产库
            {project && (
              <span className="text-sm font-normal text-slate-400 ml-1">— {project.name}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="shrink-0 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索立项名称、合同名称、资料名称…"
            className="w-full pl-8 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="shrink-0 text-xs text-slate-500">
            搜索「{searchQuery}」共找到 <span className="text-blue-400 font-medium">{totalResults}</span> 条结果
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* 合同文件 */}
          <div className="bg-slate-800/50 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('contracts')}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-700/30 transition-colors"
            >
              {expandedSections.contracts
                ? <ChevronDown className="w-4 h-4 text-slate-400" />
                : <ChevronRight className="w-4 h-4 text-slate-400" />}
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">合同文件</span>
              <span className="ml-auto text-xs text-slate-500">{projectContracts.length} 份</span>
            </button>
            {expandedSections.contracts && (
              <div className="px-4 pb-3 space-y-2">
                {projectContracts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">暂无合同</p>
                ) : projectContracts.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800 border border-slate-700/50">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{c.contractName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {c.contractNo} · {c.type} · ¥{c.amount.toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      c.status === '已签署' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>{c.status}</span>
                    <button
                      onClick={() => toast.info(`查看合同：${c.contractName}`)}
                      className="text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 立项资料 */}
          <div className="bg-slate-800/50 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('initDocs')}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-700/30 transition-colors"
            >
              {expandedSections.initDocs
                ? <ChevronDown className="w-4 h-4 text-slate-400" />
                : <ChevronRight className="w-4 h-4 text-slate-400" />}
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-200">立项资料</span>
              <span className="ml-auto text-xs text-slate-500">含需求书、立项报告等</span>
            </button>
            {expandedSections.initDocs && (
              <div className="px-4 pb-3 space-y-2">
                {filteredInitDocs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">无匹配资料</p>
                ) : filteredInitDocs.map(doc => (
                  <div key={doc.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800 border border-slate-700/50">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-amber-400">{doc.type}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{doc.size} · 上传于 {doc.date}</p>
                    </div>
                    <button
                      onClick={() => toast.info(`下载：${doc.name}`)}
                      className="text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 各节点交付物 */}
          <div className="bg-slate-800/50 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('milestones')}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-700/30 transition-colors"
            >
              {expandedSections.milestones
                ? <ChevronDown className="w-4 h-4 text-slate-400" />
                : <ChevronRight className="w-4 h-4 text-slate-400" />}
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-200">节点交付物</span>
              <span className="ml-auto text-xs text-slate-500">{projectMilestones.length} 个节点</span>
            </button>
            {expandedSections.milestones && (
              <div className="px-4 pb-3 space-y-2">
                {projectMilestones.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">暂无节点交付物</p>
                ) : projectMilestones.map(m => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <FileUp className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">{m.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {m.type} · 提交人：{m.submitter} · 截止 {m.dueDate}
                        </p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        statusColor[m.status] || 'text-slate-400 bg-slate-500/10'
                      }`}>{m.status}</span>
                    </div>
                    {m.deliverableDesc && (
                      <p className="mt-1.5 ml-9 text-[10px] text-slate-400 leading-relaxed">{m.deliverableDesc}</p>
                    )}
                    {m.aiScore !== undefined && (
                      <div className="mt-1.5 ml-9 flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">AI评分</span>
                        <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.aiScore >= 85 ? 'bg-emerald-500' : m.aiScore >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${m.aiScore}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${
                          m.aiScore >= 85 ? 'text-emerald-400' : m.aiScore >= 70 ? 'text-amber-400' : 'text-red-400'
                        }`}>{m.aiScore}分</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 pt-3 border-t border-slate-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors"
          >
            关闭
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MilestonesPage() {
  const [milestoneList, setMilestoneList] = useState<MilestoneItem[]>(
    initialMilestones.map(m => ({ ...m }))
  );
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [uploadTarget, setUploadTarget] = useState<MilestoneItem | null>(null);
  const [assetLibProject, setAssetLibProject] = useState<string | null>(null);
  const [showHealthDialog, setShowHealthDialog] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<{ url?: string; type?: MilestoneItem['previewType']; name?: string } | null>(null);
  const [searchName, setSearchName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = milestoneList.filter(m => {
    const matchProject = filterProject === 'all' || m.projectId === filterProject;
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    const q = searchName.trim().toLowerCase();
    const matchName = !q || m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q) || m.submitter.toLowerCase().includes(q);
    return matchProject && matchStatus && matchName;
  });
  const allSelected = filtered.length > 0 && filtered.every(m => selectedIds.has(m.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(m => n.delete(m.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(m => n.add(m.id)); return n; });
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const updateMilestone = (id: string, patch: Partial<MilestoneItem>) => {
    setMilestoneList(list => list.map(m => m.id === id ? { ...m, ...patch } : m));
  };

  const handleApprove = (id: string) => {
    updateMilestone(id, { status: '已通过' });
    toast.success('已通过审核');
  };

  const handleReject = (id: string) => {
    updateMilestone(id, { status: '已驳回' });
    toast.error('已驳回，供应商将收到通知');
  };

  return (
    <div className="p-6 space-y-4">
       {/* 操作栏 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* 全选勾选框 */}
        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded border-border accent-blue-500 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">全选</span>
        </label>
        {/* 项目筛选 */}
        <select
          value={filterProject}
          onChange={e => { setFilterProject(e.target.value); setSelectedIds(new Set()); }}
          className="h-8 px-3 text-xs bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">全部项目</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {/* 名称/材料搜索 */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          <input
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="搜索材料名称、类型、提交人…"
            className="h-8 pl-7 pr-7 text-xs bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-52"
          />
          {searchName && (
            <button onClick={() => setSearchName('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <XIcon className="w-3 h-3" />
            </button>
          )}
        </div>
        {/* 状态筛选 */}
        <div className="flex items-center gap-1.5">
          {['all', '待提交', '审核中', '已通过', '已驳回'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs transition-colors',
                filterStatus === s
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-muted-foreground hover:bg-accent border border-transparent'
              )}
            >
              {s === 'all' ? '全部' : s}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              const pid = filterProject !== 'all' ? filterProject : (projects[0]?.id || '');
              setAssetLibProject(pid);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-md transition-colors border border-slate-600"
          >
            <Archive className="w-3.5 h-3.5 text-blue-400" />
            项目资产库
          </button>
          <button
            onClick={() => setShowHealthDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs rounded-md transition-colors border border-purple-500/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI 检查健康度
          </button>
        </div>
      </div>

      {/* 里程碑列表 */}
      <div className="space-y-3">
        {filtered.map(m => {
          const project = projects.find(p => p.id === m.projectId);
          return (
            <div key={m.id} className={cn("bg-card border rounded-xl p-4 hover:border-blue-500/30 transition-colors", selectedIds.has(m.id) ? "border-blue-500/50 bg-blue-500/5" : "border-border")}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(m.id)}
                  onChange={() => toggleOne(m.id)}
                  className="mt-1 w-3.5 h-3.5 rounded border-border accent-blue-500 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{m.name}</span>
                    <StatusBadge status={m.status} />
                    <span className="badge-gray px-2 py-0.5 rounded text-xs">{m.type}</span>
                    {m.deliverableType && (
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {m.deliverableType}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {project?.name} · 提交人：{m.submitter} · 截止：{m.dueDate}
                    {m.submittedAt && <span className="ml-2 text-blue-400">· 已提交：{m.submittedAt}</span>}
                  </div>

                  {/* 交付物描述 */}
                  {m.deliverableDesc && (
                    <div className="bg-secondary/30 rounded-lg px-3 py-2 mb-2 text-xs text-muted-foreground">
                      {m.deliverableDesc}
                    </div>
                  )}

                  {/* AI 审核结果 */}
                  {m.aiScore !== undefined && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">AI 审查报告</span>
                        <AIScoreBar score={m.aiScore} />
                      </div>
                      {m.issues && m.issues.length > 0 ? (
                        <div className="space-y-1">
                          {m.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-amber-400">
                              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> 未发现明显问题，交付物质量良好
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="shrink-0 flex flex-col gap-2">
                  {(m.status === '审核中' || m.status === '已通过' || m.status === '已驳回') && (
                    <button
                      onClick={() => setPreviewTarget({ url: m.previewUrl, type: m.previewType, name: m.name })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 text-slate-300 border border-slate-600 rounded-md text-xs hover:bg-slate-700 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      预览文件
                    </button>
                  )}
                  {m.status === '待提交' && (
                    <button
                      onClick={() => setUploadTarget(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-md text-xs hover:bg-blue-600/30 transition-colors"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      上传交付物
                    </button>
                  )}

                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">暂无里程碑数据</div>
        )}
      </div>
      {/* 批量操作浮动栏 */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl">
          <span className="text-sm text-slate-300">已选 <span className="text-blue-400 font-semibold">{selectedIds.size}</span> 项</span>
          <div className="w-px h-4 bg-slate-600" />
          <button
            onClick={() => { selectedIds.forEach(id => updateMilestone(id, { status: '已通过' })); setSelectedIds(new Set()); toast.success(`已批量通过 ${selectedIds.size} 项`); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs hover:bg-emerald-600/30 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> 批量通过
          </button>
          <button
            onClick={() => { selectedIds.forEach(id => updateMilestone(id, { status: '已驳回' })); setSelectedIds(new Set()); toast.error(`已批量驳回 ${selectedIds.size} 项`); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-600/30 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" /> 批量驳回
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 交付物上传弹窗 */}
      <UploadDialog
        open={!!uploadTarget}
        onClose={() => setUploadTarget(null)}
        milestone={uploadTarget}
        onSubmit={updateMilestone}
      />
      {/* 项目资产库弹窗 */}
      {assetLibProject && (
        <AssetLibraryDialog
          open={!!assetLibProject}
          onClose={() => setAssetLibProject(null)}
          projectId={assetLibProject}
          milestoneList={milestoneList}
        />
      )}
      {/* AI 健康度检查弹窗 */}
      <HealthCheckDialog
        open={showHealthDialog}
        onClose={() => setShowHealthDialog(false)}
        milestones={filtered}
        projectName={
          filterProject !== 'all'
            ? (projects.find(p => p.id === filterProject)?.name || '全部项目')
            : '全部项目'
        }
      />
      {/* 文件预览弹窗 */}
      <FilePreviewDialog
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        url={previewTarget?.url}
        type={previewTarget?.type}
        name={previewTarget?.name}
      />
    </div>
  );
}
