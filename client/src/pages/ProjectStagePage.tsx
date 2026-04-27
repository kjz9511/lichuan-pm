// 厉川外包项目管理平台 — 项目阶段子流程页面
// 逻辑：五个阶段线性流转，每阶段需上传双方盖章的阶段证明文件，老板/PM审批通过后解锁下一阶段
// 模板：每阶段提供固化模板可下载

import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck,
  FileText,
  Lock,
  Upload,
  X,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { projects, Project } from '../lib/mockData';

// ─── 阶段配置 ─────────────────────────────────────────────────
interface StageConfig {
  key: string;
  name: string;
  templateName: string;
  description: string;
  uploadLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STAGE_CONFIGS: StageConfig[] = [
  {
    key: '项目启动',
    name: '项目启动',
    templateName: '启动阶段证明模板.docx',
    description: '项目正式启动，双方确认项目范围、团队成员、启动时间，签署启动阶段证明。',
    uploadLabel: '上传启动阶段证明（双方盖章）',
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/15',
    borderColor: 'border-blue-500/30',
  },
  {
    key: '需求确认',
    name: '需求确认',
    templateName: '需求确认阶段证明模板.docx',
    description: '双方确认需求范围、功能清单、验收标准，签署需求确认阶段证明。',
    uploadLabel: '上传需求确认阶段证明（双方盖章）',
    color: 'text-purple-400',
    bgColor: 'bg-purple-600/15',
    borderColor: 'border-purple-500/30',
  },
  {
    key: '项目执行',
    name: '项目执行',
    templateName: '上线阶段证明模板.docx',
    description: '项目开发完成并完成上线部署，双方确认上线结果，签署上线阶段证明。',
    uploadLabel: '上传上线阶段证明（双方盖章）',
    color: 'text-amber-400',
    bgColor: 'bg-amber-600/15',
    borderColor: 'border-amber-500/30',
  },
  {
    key: '项目验收',
    name: '项目验收',
    templateName: '验收阶段证明模板.docx',
    description: '甲方完成功能验收测试，双方确认验收通过，签署验收阶段证明。',
    uploadLabel: '上传验收阶段证明（双方盖章）',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-600/15',
    borderColor: 'border-emerald-500/30',
  },
  {
    key: '项目结项',
    name: '项目结项',
    templateName: '结项阶段证明模板.docx',
    description: '项目正式结项，资料归档，双方确认项目完成，签署结项阶段证明。',
    uploadLabel: '上传结项阶段证明（双方盖章）',
    color: 'text-slate-400',
    bgColor: 'bg-slate-600/15',
    borderColor: 'border-slate-500/30',
  },
];

// ─── 阶段状态类型 ─────────────────────────────────────────────
type StageStatus = 'locked' | 'pending_upload' | 'pending_approval' | 'approved';

interface StageRecord {
  status: StageStatus;
  uploadedFile?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalNote?: string;
}

// 根据项目当前阶段初始化各阶段状态
function initStageRecords(project: Project): Record<string, StageRecord> {
  const STAGES = ['项目启动', '需求确认', '项目执行', '项目验收', '项目结项'];
  const currentIdx = STAGES.indexOf(project.stage);
  const records: Record<string, StageRecord> = {};
  STAGES.forEach((stage, i) => {
    if (i < currentIdx) {
      records[stage] = {
        status: 'approved',
        uploadedFile: `${stage}阶段证明_${project.id}_已盖章.pdf`,
        uploadedAt: '2026-04-' + String(10 + i * 5).padStart(2, '0'),
        uploadedBy: project.manager,
        approvedBy: '何家劲',
        approvedAt: '2026-04-' + String(11 + i * 5).padStart(2, '0'),
        approvalNote: '文件完整，审批通过。',
      };
    } else if (i === currentIdx) {
      records[stage] = { status: 'pending_upload' };
    } else {
      records[stage] = { status: 'locked' };
    }
  });
  return records;
}

// ─── 审批弹窗 ─────────────────────────────────────────────────
function ApprovalModal({
  stageName,
  fileName,
  onApprove,
  onReject,
  onClose,
}: {
  stageName: string;
  fileName: string;
  onApprove: (note: string) => void;
  onReject: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-foreground">审批阶段证明</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stageName} · {fileName}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 bg-blue-600/10 border border-blue-500/20 rounded-xl p-3">
            <FileCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-300/80 leading-relaxed">
              请确认已查阅上传的阶段证明文件，双方盖章齐全后方可审批通过，审批通过后将自动流转至下一阶段。
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">审批意见（选填）</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="如有补充说明，请在此填写..."
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onReject(note)}
              className="flex-1 h-10 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-lg transition-colors"
            >
              驳回
            </button>
            <button
              onClick={() => onApprove(note)}
              className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              审批通过
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 单个阶段卡片 ─────────────────────────────────────────────
function StageCard({
  config,
  record,
  isActive,
  canApprove,
  onUpload,
  onApprove,
  onReject,
}: {
  config: StageConfig;
  record: StageRecord;
  isActive: boolean;
  canApprove: boolean;
  onUpload: (stageName: string, fileName: string) => void;
  onApprove: (stageName: string) => void;
  onReject: (stageName: string) => void;
}) {
  const [showApproval, setShowApproval] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(config.key, file.name);
    }
  }

  function handleDownloadTemplate() {
    toast.success(`正在下载「${config.templateName}」`);
  }

  const statusIcon = () => {
    if (record.status === 'approved') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (record.status === 'pending_approval') return <Clock className="w-5 h-5 text-amber-400" />;
    if (record.status === 'pending_upload') return <Upload className="w-5 h-5 text-blue-400" />;
    return <Lock className="w-4 h-4 text-muted-foreground" />;
  };

  const statusLabel = () => {
    if (record.status === 'approved') return <span className="badge-green px-2 py-0.5 rounded text-xs font-medium">已审批通过</span>;
    if (record.status === 'pending_approval') return <span className="badge-yellow px-2 py-0.5 rounded text-xs font-medium">待审批</span>;
    if (record.status === 'pending_upload') return <span className="badge-blue px-2 py-0.5 rounded text-xs font-medium">待上传证明</span>;
    return <span className="badge-gray px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"><Lock className="w-2.5 h-2.5" />未解锁</span>;
  };

  return (
    <>
      <div className={cn(
        'border rounded-xl overflow-hidden transition-all',
        record.status === 'locked' ? 'bg-secondary/20 border-border/30 opacity-60' :
        record.status === 'approved' ? 'bg-card border-emerald-500/20' :
        isActive ? `bg-card border-blue-500/30 shadow-lg shadow-blue-500/5` :
        'bg-card border-border'
      )}>
        {/* 阶段标题栏 */}
        <div className={cn('px-4 py-3 flex items-center gap-3', record.status !== 'locked' && config.bgColor)}>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bgColor, `border ${config.borderColor}`)}>
            {statusIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-sm font-bold', record.status === 'locked' ? 'text-muted-foreground' : 'text-foreground')}>
                {config.name}
              </span>
              {statusLabel()}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{config.description}</div>
          </div>
          {/* 下载模板按钮 */}
          {record.status !== 'locked' && (
            <button
              onClick={handleDownloadTemplate}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                config.color, config.bgColor, config.borderColor,
                'hover:opacity-80'
              )}
            >
              <Download className="w-3 h-3" />
              下载模板
            </button>
          )}
        </div>

        {/* 内容区 */}
        {record.status !== 'locked' && (
          <div className="px-4 py-3 space-y-3">
            {/* 已审批：展示记录 */}
            {record.status === 'approved' && (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-foreground font-medium">{record.uploadedFile}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/40 rounded-lg p-2.5">
                    <div className="text-[10px] text-muted-foreground mb-1">上传信息</div>
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <User className="w-3 h-3 text-muted-foreground" />
                      {record.uploadedBy}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {record.uploadedAt}
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                    <div className="text-[10px] text-emerald-400/70 mb-1">审批信息</div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {record.approvedBy} 审批通过
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {record.approvedAt}
                    </div>
                  </div>
                </div>
                {record.approvalNote && (
                  <div className="text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">
                    审批意见：{record.approvalNote}
                  </div>
                )}
              </div>
            )}

            {/* 待上传 */}
            {record.status === 'pending_upload' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-300/80 leading-relaxed">
                    请先下载模板，填写完整后由双方盖章，再将盖章后的 PDF/图片上传至此处，提交后等待审批。
                  </div>
                </div>
                <label className={cn(
                  'flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors',
                  config.borderColor, config.bgColor, 'hover:opacity-80'
                )}>
                  <Upload className={cn('w-6 h-6', config.color)} />
                  <div className="text-center">
                    <div className={cn('text-sm font-medium', config.color)}>{config.uploadLabel}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">支持 PDF、JPG、PNG，文件大小不超过 20MB</div>
                  </div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            )}

            {/* 待审批 */}
            {record.status === 'pending_approval' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-secondary/40 rounded-xl p-3">
                  <FileCheck className="w-8 h-8 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{record.uploadedFile}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      由 {record.uploadedBy} 于 {record.uploadedAt} 上传 · 等待审批
                    </div>
                  </div>
                  <button
                    onClick={() => toast.info('文件预览功能将在二期上线')}
                    className="shrink-0 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    预览
                  </button>
                </div>
                {canApprove && (
                  <button
                    onClick={() => setShowApproval(true)}
                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    审批此阶段证明
                  </button>
                )}
                {!canApprove && (
                  <div className="text-xs text-center text-muted-foreground py-1">
                    等待老板或项目经理审批
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 已锁定提示 */}
        {record.status === 'locked' && (
          <div className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            需完成上一阶段审批后解锁
          </div>
        )}
      </div>

      {/* 审批弹窗 */}
      {showApproval && record.uploadedFile && (
        <ApprovalModal
          stageName={config.name}
          fileName={record.uploadedFile}
          onApprove={(note) => {
            onApprove(config.key);
            setShowApproval(false);
          }}
          onReject={(note) => {
            onReject(config.key);
            setShowApproval(false);
          }}
          onClose={() => setShowApproval(false)}
        />
      )}
    </>
  );
}

// ─── 主页面 ────────────────────────────────────────────────────
interface ProjectStagePageProps {
  projectId: string;
  onBack: () => void;
  canApprove?: boolean; // 老板或PM才能审批
}

export default function ProjectStagePage({ projectId, onBack, canApprove = true }: ProjectStagePageProps) {
  const project = projects.find(p => p.id === projectId) || projects[0];
  const STAGES = ['项目启动', '需求确认', '项目执行', '项目验收', '项目结项'];

  const [stageRecords, setStageRecords] = useState<Record<string, StageRecord>>(
    () => initStageRecords(project)
  );

  function handleUpload(stageName: string, fileName: string) {
    setStageRecords(prev => ({
      ...prev,
      [stageName]: {
        ...prev[stageName],
        status: 'pending_approval',
        uploadedFile: fileName,
        uploadedAt: new Date().toLocaleDateString('zh-CN').replace(/\//g, '-'),
        uploadedBy: '张伟（项目经理）',
      },
    }));
    toast.success(`「${fileName}」上传成功，已提交审批`);
  }

  function handleApprove(stageName: string) {
    const currentIdx = STAGES.indexOf(stageName);
    const nextStage = STAGES[currentIdx + 1];

    setStageRecords(prev => {
      const updated: Record<string, StageRecord> = {
        ...prev,
        [stageName]: {
          ...prev[stageName],
          status: 'approved',
          approvedBy: '何家劲（老板）',
          approvedAt: new Date().toLocaleDateString('zh-CN').replace(/\//g, '-'),
          approvalNote: '文件完整，审批通过。',
        },
      };
      // 解锁下一阶段
      if (nextStage) {
        updated[nextStage] = { status: 'pending_upload' };
      }
      return updated;
    });

    if (nextStage) {
      toast.success(`「${stageName}」审批通过，已自动流转至「${nextStage}」阶段`);
    } else {
      toast.success('项目结项审批通过，项目已完成归档！');
    }
  }

  function handleReject(stageName: string) {
    setStageRecords(prev => ({
      ...prev,
      [stageName]: {
        ...prev[stageName],
        status: 'pending_upload',
        uploadedFile: undefined,
        uploadedAt: undefined,
        uploadedBy: undefined,
      },
    }));
    toast.error(`「${stageName}」阶段证明已驳回，请重新上传`);
  }

  // 计算整体进度
  const approvedCount = STAGES.filter(s => stageRecords[s]?.status === 'approved').length;
  const progressPct = Math.round((approvedCount / STAGES.length) * 100);

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      {/* 返回 + 标题 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回项目列表
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm text-foreground font-medium">{project.name}</span>
        <span className="text-xs text-muted-foreground font-mono">{project.id}</span>
      </div>

      {/* 项目概览卡片 */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-bold text-foreground mb-1">{project.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
              <span>项目经理：{project.manager}</span>
              <span>甲方：{project.client}</span>
              <span>计划：{project.startDate} ~ {project.endDate}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-muted-foreground mb-1">阶段完成进度</div>
            <div className="text-2xl font-bold text-blue-400">{progressPct}%</div>
            <div className="text-xs text-muted-foreground">{approvedCount}/{STAGES.length} 阶段</div>
          </div>
        </div>

        {/* 阶段进度条 */}
        <div className="mt-4">
          <div className="flex items-center">
            {STAGES.map((stage, i) => {
              const rec = stageRecords[stage];
              const isApproved = rec?.status === 'approved';
              const isPending = rec?.status === 'pending_approval';
              const isActive = rec?.status === 'pending_upload';
              return (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                      isApproved ? 'bg-emerald-600 border-emerald-600 text-white' :
                      isPending ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                      isActive ? 'bg-blue-600/20 border-blue-500 text-blue-400' :
                      'bg-secondary border-border text-muted-foreground'
                    )}>
                      {isApproved ? '✓' : i + 1}
                    </div>
                    <div className={cn(
                      'text-[9px] mt-1 text-center whitespace-nowrap',
                      isApproved ? 'text-emerald-400' :
                      isPending ? 'text-amber-400' :
                      isActive ? 'text-blue-400 font-medium' :
                      'text-muted-foreground'
                    )}>{stage}</div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-1 mb-4 transition-colors',
                      isApproved ? 'bg-emerald-600' : 'bg-border'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 各阶段卡片 */}
      <div className="space-y-3">
        {STAGE_CONFIGS.map((config) => (
          <StageCard
            key={config.key}
            config={config}
            record={stageRecords[config.key] || { status: 'locked' }}
            isActive={stageRecords[config.key]?.status === 'pending_upload'}
            canApprove={canApprove}
            onUpload={handleUpload}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>

      {/* 说明提示 */}
      <div className="flex items-start gap-2 bg-secondary/30 border border-border/50 rounded-lg px-3 py-2.5">
        <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          每个阶段均需下载对应模板，填写完整后由双方（厉川 + 甲方/外包方）加盖公章，再由项目经理上传至系统。
          老板或项目经理审批通过后，自动解锁下一阶段。所有文件将作为项目档案永久保存。
        </div>
      </div>
    </div>
  );
}
