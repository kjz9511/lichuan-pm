// 厉川外包项目管理平台 — 里程碑 & 交付物页面
// 设计风格：深色专业管理台风，AI审核评分 + 状态管理
// 功能：交付物上传（支持描述/类型）→ AI 自动审查（代码/日报/UI等）→ PM/老板人工通过/驳回
import { cn } from '@/lib/utils';
import { Bot, FileUp, Plus, Sparkles, CheckCircle2, XCircle, AlertTriangle, Upload } from 'lucide-react';
import { useState } from 'react';
import { milestones as initialMilestones, projects } from '../lib/mockData';
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
  const { run: runAI } = useAI({ stream: true });

  if (!milestone) return null;

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
    onSubmit(milestone.id, {
      status: '审核中',
      deliverableDesc: desc,
      deliverableType: delivType,
      submittedAt: new Date().toISOString().slice(0, 10),
      aiScore: score,
      aiReport,
      issues,
    });
    toast.success(`交付物已提交，AI 审查完成（${score}分），等待人工确认`);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setDesc(''); setDelivType('代码提交');
    setAiReport(''); setAiDone(false); setAiLoading(false);
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

export default function MilestonesPage() {
  const [milestoneList, setMilestoneList] = useState<MilestoneItem[]>(
    initialMilestones.map(m => ({ ...m }))
  );
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [uploadTarget, setUploadTarget] = useState<MilestoneItem | null>(null);

  const filtered = milestoneList.filter(m => {
    const matchProject = filterProject === 'all' || m.projectId === filterProject;
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchProject && matchStatus;
  });

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
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="h-8 px-3 text-xs bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">全部项目</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

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

        <button
          onClick={() => toast.info('新建里程碑功能将在二期上线')}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新建里程碑
        </button>
      </div>

      {/* 里程碑列表 */}
      <div className="space-y-3">
        {filtered.map(m => {
          const project = projects.find(p => p.id === m.projectId);
          return (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/30 transition-colors">
              <div className="flex items-start gap-4">
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
                  {m.status === '待提交' && (
                    <button
                      onClick={() => setUploadTarget(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-md text-xs hover:bg-blue-600/30 transition-colors"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      上传交付物
                    </button>
                  )}
                  {m.status === '审核中' && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleApprove(m.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs hover:bg-emerald-600/30 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" /> 通过
                      </button>
                      <button
                        onClick={() => handleReject(m.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-600/30 transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> 驳回
                      </button>
                    </div>
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

      {/* 交付物上传弹窗 */}
      <UploadDialog
        open={!!uploadTarget}
        onClose={() => setUploadTarget(null)}
        milestone={uploadTarget}
        onSubmit={updateMilestone}
      />
    </div>
  );
}
