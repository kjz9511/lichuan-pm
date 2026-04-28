// 设计风格：深色专业管理台风 - 项目阶段子流程页
// 五阶段：项目启动/需求确认/项目上线/项目验收/项目结项
// 每阶段弹出填写表单，阶段证明文件必填，其他关键文件选填，提交即保存（无需审批）

import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  CheckCircle2, Circle, Lock, Upload, Download, FileText, ChevronRight,
  ArrowLeft, Rocket, ClipboardList, Code2, BadgeCheck, FolderOpen, AlertCircle,
  Bot, Sparkles, Lightbulb
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';

// ── 阶段配置 ────────────────────────────────────────────────
interface StageConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  proofLabel: string;       // 必填：阶段证明文件
  optionalFiles: string[];  // 选填：关键文件
  description: string;
}

const STAGES: StageConfig[] = [
  {
    id: 'start', name: '项目启动', icon: Rocket,
    color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    proofLabel: '启动阶段证明',
    optionalFiles: ['启动会议纪要', '项目计划书'],
    description: '完成项目启动会议，确认项目范围、团队分工和工作计划',
  },
  {
    id: 'requirement', name: '需求确认', icon: ClipboardList,
    color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    proofLabel: '需求确认阶段证明',
    optionalFiles: ['需求规格说明书', '原型文件'],
    description: '与甲方确认需求，输出需求规格说明书并双方签字确认',
  },
  {
    id: 'execution', name: '项目上线', icon: Code2,
    color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    proofLabel: '上线阶段证明',
    optionalFiles: ['上线部署记录', '测试报告'],
    description: '完成系统开发、测试与上线部署，提交上线证明材料',
  },
  {
    id: 'acceptance', name: '项目验收', icon: BadgeCheck,
    color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
    proofLabel: '验收阶段证明',
    optionalFiles: ['验收测试报告', 'BUG修复清单'],
    description: '甲方组织验收测试，通过后双方签署验收确认书',
  },
  {
    id: 'closure', name: '项目结项', icon: FolderOpen,
    color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30',
    proofLabel: '结项阶段证明',
    optionalFiles: ['项目总结报告', '资产移交清单'],
    description: '完成项目总结、资产移交与归档，正式结项',
  },
];

// ── 精简模式阶段配置（需求确认 + 系统上线）────────────────────
const STAGES_LITE: StageConfig[] = [
  {
    id: 'requirement', name: '需求确认', icon: ClipboardList,
    color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    proofLabel: '需求确认阶段证明',
    optionalFiles: ['需求规格说明书', '原型文件'],
    description: '与甲方确认需求，输出需求规格说明书并双方签字确认',
  },
  {
    id: 'golive', name: '系统上线', icon: Code2,
    color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    proofLabel: '上线阶段证明',
    optionalFiles: ['上线部署记录', '测试报告', '验收确认书'],
    description: '完成系统开发、测试、上线部署及甲方验收，提交上线证明材料',
  },
];

type StageMode = 'standard' | 'lite';

// ── 阶段记录 ────────────────────────────────────────────────
interface StageRecord {
  stageId: string;
  status: 'locked' | 'pending' | 'done';
  proofFile?: string;       // 阶段证明文件名
  optionalFiles: Record<string, string>;  // 选填文件名
  remark?: string;
  submitDate?: string;
}

function initRecords(currentStage: number): StageRecord[] {
  return STAGES.map((s, i) => ({
    stageId: s.id,
    status: i < currentStage ? 'done' : i === currentStage ? 'pending' : 'locked',
    optionalFiles: {},
  }));
}

// ── 阶段表单弹窗 ────────────────────────────────────────────
// 合并上线阶段的文件配置（精简模式「需求确认」合并时使用）
const GOLIVE_EXTRA_FILES = ['上线部署记录', '测试报告', '验收确认书'];

interface StageFormProps {
  open: boolean;
  onClose: () => void;
  stage: StageConfig;
  record: StageRecord;
  onSave: (r: StageRecord, mergeGoLive?: boolean) => void;
  // 是否允许合并上线（精简模式需求确认阶段专用）
  canMergeGoLive?: boolean;
}
function StageFormDialog({ open, onClose, stage, record, onSave, canMergeGoLive }: StageFormProps) {
  const [proofFile, setProofFile] = useState(record.proofFile || '');
  const [optFiles, setOptFiles] = useState<Record<string, string>>(record.optionalFiles || {});
  const [remark, setRemark] = useState(record.remark || '');
  // 合并上线开关
  const [mergeGoLive, setMergeGoLive] = useState(false);
  const [goLiveProof, setGoLiveProof] = useState('');
  const [goLiveOptFiles, setGoLiveOptFiles] = useState<Record<string, string>>({});

  const handleFileUpload = (key: string, required: boolean, isGoLive = false) => {
    const prefix = isGoLive ? '系统上线' : stage.name;
    const fileName = required
      ? `${prefix}_${isGoLive ? '上线阶段证明' : stage.proofLabel}_双方盖章.pdf`
      : `${prefix}_${key}.pdf`;
    if (isGoLive) {
      if (required) setGoLiveProof(fileName);
      else setGoLiveOptFiles(prev => ({ ...prev, [key]: fileName }));
    } else {
      if (required) setProofFile(fileName);
      else setOptFiles(prev => ({ ...prev, [key]: fileName }));
    }
    toast.success(`文件「${fileName}」已上传`);
  };

  const handleSave = () => {
    if (!proofFile) {
      toast.error(`请上传「${stage.proofLabel}」（必填）`);
      return;
    }
    if (mergeGoLive && !goLiveProof) {
      toast.error('已开启合并上线，请上传「上线阶段证明」（必填）');
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    onSave({
      ...record,
      proofFile,
      optionalFiles: optFiles,
      remark,
      status: 'done',
      submitDate: now,
    }, mergeGoLive ? true : false);
    // 如果合并上线，把上线资料也存入 record（通过 onSave 的第二个参数通知父组件）
    if (mergeGoLive) {
      toast.success('需求确认 + 系统上线资料已一并提交，两个阶段同时完成！');
    } else {
      toast.success(`${stage.name}阶段已完成，资料已保存`);
    }
    onClose();
  };

  const handleDownload = (fileName: string) => {
    toast.info(`正在下载模板「${fileName}」...`);
  };

  // 文件上传区块（复用）
  const FileBlock = ({ label, file, onUpload, onRemove, required, isGoLive = false }: {
    label: string; file: string; onUpload: () => void; onRemove: () => void; required: boolean; isGoLive?: boolean;
  }) => (
    <div className={`rounded-lg border p-3 ${required ? (isGoLive ? 'border-green-500/30 bg-green-500/5' : `${stage.borderColor} ${stage.bgColor}`) : 'border-slate-700/50 bg-slate-800/40'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className={`w-3.5 h-3.5 ${required ? (isGoLive ? 'text-green-400' : stage.color) : 'text-slate-500'}`} />
          <span className="text-sm text-slate-300">{label}</span>
          {required && <Badge className="text-xs bg-red-500/20 text-red-300 border-0">必填</Badge>}
        </div>
        <Button size="sm" variant="outline" onClick={() => handleDownload(`${label}模板.docx`)}
          className="border-slate-700 text-slate-500 hover:text-slate-300 h-6 text-xs gap-1">
          <Download className="w-3 h-3" /> 模板
        </Button>
      </div>
      {file ? (
        <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60 border border-slate-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
          <span className="text-xs text-slate-400 flex-1 truncate">{file}</span>
          <button onClick={onRemove} className="text-xs text-slate-500 hover:text-red-400">移除</button>
        </div>
      ) : (
        <button onClick={onUpload}
          className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded border border-dashed border-slate-600 hover:border-slate-500 text-slate-500 hover:text-slate-400 transition-colors text-xs">
          <Upload className="w-3.5 h-3.5" /> 点击上传 {label}
        </button>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${stage.bgColor} ${stage.borderColor} border flex items-center justify-center`}>
              <stage.icon className={`w-5 h-5 ${stage.color}`} />
            </div>
            <div>
              <DialogTitle className="text-slate-100">
                {stage.name}{mergeGoLive ? ' + 系统上线' : ''} — 阶段资料填报
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 合并上线开关（仅精简模式需求确认阶段显示） */}
          {canMergeGoLive && (
            <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              mergeGoLive ? 'border-green-500/40 bg-green-500/8' : 'border-slate-700 bg-slate-800/40'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  mergeGoLive ? 'bg-green-500/20' : 'bg-slate-700'
                }`}>
                  <Code2 className={`w-4 h-4 ${mergeGoLive ? 'text-green-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">合并系统上线资料</p>
                  <p className="text-xs text-slate-500">需求确认与上线一并提交，两个阶段同时完成</p>
                </div>
              </div>
              <button
                onClick={() => setMergeGoLive(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  mergeGoLive ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  mergeGoLive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          )}

          {/* ── 需求确认资料 ── */}
          <div className="space-y-3">
            {(mergeGoLive) && (
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">需求确认资料</p>
            )}
            <FileBlock
              label={stage.proofLabel} file={proofFile} required
              onUpload={() => handleFileUpload(stage.proofLabel, true)}
              onRemove={() => setProofFile('')}
            />
            {stage.optionalFiles.map(fileName => (
              <FileBlock
                key={fileName} label={fileName} file={optFiles[fileName] || ''} required={false}
                onUpload={() => handleFileUpload(fileName, false)}
                onRemove={() => setOptFiles(p => { const n = {...p}; delete n[fileName]; return n; })}
              />
            ))}
          </div>

          {/* ── 系统上线资料（合并模式） ── */}
          {mergeGoLive && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-700" />
                <p className="text-xs font-semibold text-green-400 uppercase tracking-wider px-2">系统上线资料</p>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <FileBlock
                label="上线阶段证明" file={goLiveProof} required isGoLive
                onUpload={() => handleFileUpload('上线阶段证明', true, true)}
                onRemove={() => setGoLiveProof('')}
              />
              {GOLIVE_EXTRA_FILES.map(fileName => (
                <FileBlock
                  key={fileName} label={fileName} file={goLiveOptFiles[fileName] || ''} required={false} isGoLive
                  onUpload={() => handleFileUpload(fileName, false, true)}
                  onRemove={() => setGoLiveOptFiles(p => { const n = {...p}; delete n[fileName]; return n; })}
                />
              ))}
            </div>
          )}

          {/* 备注 */}
          <div>
            <Label className="text-slate-300 text-sm">阶段备注</Label>
            <Textarea value={remark} onChange={e => setRemark(e.target.value)}
              placeholder="填写本阶段的补充说明、注意事项等..."
              rows={3} className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800">取消</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {mergeGoLive ? '保存并完成两个阶段' : '保存并完成本阶段'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 阶段卡片 ────────────────────────────────────────────────
interface StageCardProps {
  stage: StageConfig;
  record: StageRecord;
  index: number;
  isLast: boolean;
  onOpen: () => void;
}
function StageCard({ stage, record, index, isLast, onOpen }: StageCardProps) {
  const isDone = record.status === 'done';
  const isPending = record.status === 'pending';
  const isLocked = record.status === 'locked';
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const { run: runAI, loading: aiLoading } = useAI({ stream: true });

  const handleAIAdvice = async () => {
    setAiOpen(true);
    setAiText('');
    const filesText = record.proofFile
      ? `已上传阶段证明：${record.proofFile}；${Object.entries(record.optionalFiles).map(([k, v]) => `${k}：${v}`).join('；')}`
      : '尚未上传任何文件';
    const prompt = `你是一位经验丰富的外包项目管理顾问。当前项目正处于"${stage.name}"阶段，该阶段刚刚完成。

阶段信息：
- 阶段名称：${stage.name}
- 阶段描述：${stage.description}
- 完成日期：${record.submitDate || '今日'}
- 已提交文件：${filesText}
- 备注：${record.remark || '无'}

请给出下一步行动建议，包含3个部分：
1. 【阶段小结】用1-2句话总结本阶段完成情况
2. 【下一步重点】列出进入下一阶段前需要重点关注的2-3件事
3. 【风险预警】指出可能影响项目推进的1-2个潜在风险

请用中文回答，语言简洁实用，每部分不超过80字。`;

    await runAI(
      [
        { role: 'system', content: '你是厉川外包项目管理平台的AI项目顾问，专注于外包项目阶段管理和风险预警。' },
        { role: 'user', content: prompt }
      ],
      (chunk) => setAiText(prev => prev + chunk)
    );
  };

  return (
    <div className="flex gap-4">
      {/* 时间轴 */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all
          ${isDone ? 'bg-green-500/20 border-green-500 text-green-400' :
            isPending ? `${stage.bgColor} ${stage.borderColor} ${stage.color}` :
            'bg-slate-800 border-slate-700 text-slate-600'}`}>
          {isDone ? <CheckCircle2 className="w-5 h-5" /> :
           isLocked ? <Lock className="w-4 h-4" /> :
           <stage.icon className="w-5 h-5" />}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-2 ${isDone ? 'bg-green-500/40' : 'bg-slate-700'}`} style={{ minHeight: '2rem' }} />
        )}
      </div>

      {/* 内容卡片 */}
      <div className={`flex-1 mb-6 rounded-xl border p-5 transition-all
        ${isDone ? 'bg-slate-800/40 border-green-500/20' :
          isPending ? `${stage.bgColor} ${stage.borderColor}` :
          'bg-slate-800/20 border-slate-700/50 opacity-60'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">0{index + 1}</span>
            <h3 className={`font-semibold ${isDone ? 'text-slate-200' : isPending ? stage.color : 'text-slate-500'}`}>
              {stage.name}
            </h3>
            {isDone && <Badge className="text-xs bg-green-500/20 text-green-300 border-0">已完成</Badge>}
            {isPending && <Badge className={`text-xs ${stage.bgColor} ${stage.color} border-0`}>进行中</Badge>}
            {isLocked && <Badge className="text-xs bg-slate-700/60 text-slate-500 border-0">待解锁</Badge>}
          </div>
          {!isLocked && (
            <Button size="sm" onClick={onOpen}
              className={isDone
                ? 'border-slate-600 text-slate-400 hover:text-slate-200 bg-transparent border hover:bg-slate-800 h-7 text-xs'
                : `bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs`}>
              {isDone ? '查看/修改' : '填报资料'}
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-500 mt-2">{stage.description}</p>

        {isDone && record.proofFile && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>{record.proofFile}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">{record.submitDate}</span>
            </div>
            {Object.entries(record.optionalFiles).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-xs text-slate-500">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>{v}</span>
              </div>
            ))}
            {record.remark && (
              <p className="text-xs text-slate-500 mt-1 italic">备注：{record.remark}</p>
            )}
          </div>
        )}

        {isPending && !isLocked && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
            <span>需上传「{stage.proofLabel}」（必填）和关键文件（选填）</span>
          </div>
        )}

        {/* 文件清单预览 */}
        {!isLocked && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${isDone ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              {stage.proofLabel} *
            </span>
            {stage.optionalFiles.map(f => (
              <span key={f} className={`text-xs px-2 py-0.5 rounded-full border ${record.optionalFiles[f] ? 'bg-slate-700/60 border-slate-600 text-slate-300' : 'bg-slate-800/40 border-slate-700/50 text-slate-600'}`}>
                {f}
              </span>
            ))}
          </div>
        )}

        {/* AI 行动建议 — 仅已完成阶段显示 */}
        {isDone && (
          <div className="mt-3">
            {!aiOpen ? (
              <button
                onClick={handleAIAdvice}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 生成下一步建议
              </button>
            ) : (
              <div className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-purple-400">
                    <Bot className="w-3.5 h-3.5" />
                    AI 阶段建议
                    {aiLoading && <span className="text-slate-500 animate-pulse">· 生成中...</span>}
                  </div>
                  <button onClick={() => { setAiOpen(false); setAiText(''); }}
                    className="text-xs text-slate-600 hover:text-slate-400">收起</button>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {aiText || (aiLoading ? '正在生成建议...' : '')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 主页面 ──────────────────────────────────────────────────
interface ProjectStagePageProps { projectId?: string; onBack?: () => void; canApprove?: boolean; }
export default function ProjectStagePage({ projectId: propProjectId, onBack, canApprove }: ProjectStagePageProps = {}) {
  const params = useParams<{ projectId: string }>();
  const [, navigate] = useLocation();
  const projectId = propProjectId || params.projectId || 'PRJ-2026-001';

  // 阶段模式：standard（5阶段）/ lite（精简2阶段）
  type StageMode = 'standard' | 'lite';
  const [stageMode, setStageMode] = useState<StageMode>('standard');
  const activeStages = stageMode === 'standard' ? STAGES : STAGES_LITE;

  const [records, setRecords] = useState<StageRecord[]>(() => initRecords(1));
  const [liteRecords, setLiteRecords] = useState<StageRecord[]>(() =>
    STAGES_LITE.map((s, i) => ({
      stageId: s.id,
      status: i === 0 ? 'pending' : 'locked',
      optionalFiles: {},
    } as StageRecord))
  );
  const currentRecords = stageMode === 'standard' ? records : liteRecords;
  const setCurrentRecords = stageMode === 'standard' ? setRecords : setLiteRecords;

  const [activeStage, setActiveStage] = useState<number | null>(null);

  // 标准模式保存（逐阶段解锁）
  const handleSave = (idx: number, r: StageRecord, mergeGoLive?: boolean) => {
    setCurrentRecords(prev => {
      const next = [...prev];
      next[idx] = r;
      if (mergeGoLive && stageMode === 'lite' && idx === 0 && next.length > 1) {
        // 精简模式合并：第二阶段（系统上线）也标记为完成
        next[1] = { ...next[1], status: 'done', submitDate: r.submitDate };
      } else if (idx + 1 < next.length && next[idx + 1].status === 'locked') {
        next[idx + 1] = { ...next[idx + 1], status: 'pending' };
      }
      return next;
    });
  };

  const completedCount = currentRecords.filter(r => r.status === 'done').length;
  const progress = Math.round((completedCount / activeStages.length) * 100);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 页头 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { if (onBack) onBack(); else navigate('/projects'); }}
          className="text-slate-400 hover:text-slate-200 gap-1 -ml-2">
          <ArrowLeft className="w-4 h-4" /> 返回项目台账
        </Button>
      </div>

      {/* 阶段模式切换 */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setStageMode('standard')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
            stageMode === 'standard'
              ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
              : 'text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
          }`}
        >
          标准模式
          <span className="text-xs opacity-60">5 阶段</span>
        </button>
        <button
          onClick={() => setStageMode('lite')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
            stageMode === 'lite'
              ? 'bg-green-600/20 text-green-400 border-green-500/40'
              : 'text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
          }`}
        >
          精简模式
          <span className="text-xs opacity-60">需求确认 + 系统上线</span>
        </button>
        {stageMode === 'lite' && (
          <span className="text-xs text-slate-500 self-center ml-1">· 支持合并提交，适合小项目快速交付</span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">项目阶段流程</h1>
            <p className="text-sm text-slate-400 mt-0.5">项目编号：{projectId} · 共 {activeStages.length} 个阶段</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-100">{progress}%</p>
            <p className="text-xs text-slate-500">已完成 {completedCount}/{activeStages.length} 阶段</p>
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 阶段列表 */}
      <div>
        {activeStages.map((stage, i) => (
          <StageCard
            key={stage.id}
            stage={stage}
            record={currentRecords[i]}
            index={i}
            isLast={i === activeStages.length - 1}
            onOpen={() => setActiveStage(i)}
          />
        ))}
      </div>

      {/* 阶段表单弹窗 */}
      {activeStage !== null && (
        <StageFormDialog
          open={true}
          onClose={() => setActiveStage(null)}
          stage={activeStages[activeStage]}
          record={currentRecords[activeStage]}
          canMergeGoLive={stageMode === 'lite' && activeStage === 0}
          onSave={(r, mergeGoLive) => { handleSave(activeStage, r, mergeGoLive); setActiveStage(null); }}
        />
      )}
    </div>
  );
}
