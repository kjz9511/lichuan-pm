// 厉川外包项目管理平台 — 合作商仪表盘
// 角色：合作商（外部供应商），可查看自己承接的项目、上传交付物、提交发票
import { cn } from '@/lib/utils';
import {
  Bell, Bot, FileUp, Receipt, FolderOpen, Upload, X, CheckCircle2,
  FileCode2, FileText, Figma, Package, File, ChevronDown, ChevronUp, Plus,
  Paperclip, Trash2, Clock
} from 'lucide-react';
import { invoices, milestones, notifications, projects } from '../lib/mockData';
import { toast } from 'sonner';
import { useState, useRef } from 'react';

// ── 交付物类型配置 ─────────────────────────────────────────
const DELIVERY_TYPES = [
  { id: 'code', label: '代码包', icon: FileCode2, color: 'text-blue-400', bg: 'bg-blue-500/10', accept: '.zip,.tar.gz,.rar,.7z' },
  { id: 'doc', label: '知识文档', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', accept: '.pdf,.docx,.doc,.md,.txt' },
  { id: 'prototype', label: '原型/设计稿', icon: Figma, color: 'text-pink-400', bg: 'bg-pink-500/10', accept: '.fig,.sketch,.xd,.pdf,.png,.zip' },
  { id: 'package', label: '部署包', icon: Package, color: 'text-green-400', bg: 'bg-green-500/10', accept: '.zip,.tar.gz,.jar,.war' },
  { id: 'other', label: '其他文件', icon: File, color: 'text-slate-400', bg: 'bg-slate-500/10', accept: '*' },
];

interface DeliveryFile {
  id: string;
  typeId: string;
  name: string;
  size: string;
  uploadTime: string;
  remark: string;
  status: '已上传' | '上传中';
}

interface ProjectDelivery {
  projectId: string;
  files: DeliveryFile[];
}

// ── 上传弹窗 ───────────────────────────────────────────────
function UploadDialog({
  open, onClose, projectName, onUpload,
}: {
  open: boolean;
  onClose: () => void;
  projectName: string;
  onUpload: (file: DeliveryFile) => void;
}) {
  const [selectedType, setSelectedType] = useState(DELIVERY_TYPES[0]);
  const [remark, setRemark] = useState('');
  const [dragging, setDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => { setPendingFile(file); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    if (!pendingFile) { toast.error('请先选择文件'); return; }
    const sizeKB = pendingFile.size / 1024;
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;
    onUpload({
      id: `DEL-${Date.now()}`,
      typeId: selectedType.id,
      name: pendingFile.name,
      size: sizeStr,
      uploadTime: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      remark,
      status: '已上传',
    });
    toast.success(`「${pendingFile.name}」上传成功`);
    setPendingFile(null);
    setRemark('');
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              上传交付物
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{projectName}</div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* 文件类型 */}
          <div>
            <div className="text-xs font-medium text-slate-400 mb-2">交付物类型 <span className="text-red-400">*</span></div>
            <div className="grid grid-cols-5 gap-2">
              {DELIVERY_TYPES.map(t => {
                const Icon = t.icon;
                const active = selectedType.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-center',
                      active ? `${t.bg} border-current ${t.color}` : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* 拖拽上传区 */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
              dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={selectedType.accept}
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {pendingFile ? (
              <div className="flex items-center justify-center gap-3">
                <Paperclip className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-medium text-slate-200">{pendingFile.name}</div>
                  <div className="text-xs text-slate-500">{(pendingFile.size / 1024).toFixed(0)} KB</div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setPendingFile(null); }}
                  className="ml-auto text-slate-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-sm text-slate-400">点击选择文件，或拖拽到此处</div>
                <div className="text-xs text-slate-600 mt-1">支持 {selectedType.accept}</div>
              </>
            )}
          </div>
          {/* 备注 */}
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1.5">备注说明</div>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="简要说明交付内容、版本号、注意事项等..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
            取消
          </button>
          <button onClick={handleSubmit} className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            确认上传
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 项目交付物卡片 ─────────────────────────────────────────
type ProjectType = typeof projects[0];
function ProjectDeliveryCard({
  project, files, onUpload, onDelete,
}: {
  project: ProjectType;
  files: DeliveryFile[];
  onUpload: () => void;
  onDelete: (fileId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{project.name}</div>
          <div className="text-xs text-muted-foreground">{project.id} · {project.stage} · {files.length} 个交付物</div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onUpload(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          上传交付物
        </button>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>
      {expanded && (
        <div className="border-t border-border/50">
          {files.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <FolderOpen className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <div className="text-xs text-slate-600">暂无交付物，点击「上传交付物」开始提交</div>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {files.map(file => {
                const typeConfig = DELIVERY_TYPES.find(t => t.id === file.typeId) || DELIVERY_TYPES[4];
                const Icon = typeConfig.icon;
                return (
                  <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors group">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', typeConfig.bg)}>
                      <Icon className={cn('w-4 h-4', typeConfig.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{file.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded', typeConfig.bg, typeConfig.color)}>{typeConfig.label}</span>
                        <span className="text-[10px] text-muted-foreground">{file.size}</span>
                        <span className="text-[10px] text-muted-foreground">{file.uploadTime}</span>
                      </div>
                      {file.remark && <div className="text-[10px] text-slate-500 mt-0.5 truncate">{file.remark}</div>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />{file.status}
                      </span>
                      <button
                        onClick={() => onDelete(file.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 主页面 ─────────────────────────────────────────────────
export default function DashboardVendor() {
  const myProjects = projects.filter(p => p.vendor === '星辰前端工作室');
  const myMilestones = milestones.filter(m => m.projectId === 'PRJ-2026-001');
  const myInvoices = invoices.filter(i => i.vendor === '星辰前端工作室');
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);

  const [deliveries, setDeliveries] = useState<ProjectDelivery[]>(
    myProjects.map(p => ({ projectId: p.id, files: [] }))
  );
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const handleUpload = (projectId: string, file: DeliveryFile) => {
    setDeliveries(prev => prev.map(d =>
      d.projectId === projectId ? { ...d, files: [...d.files, file] } : d
    ));
  };

  const handleDelete = (projectId: string, fileId: string) => {
    setDeliveries(prev => prev.map(d =>
      d.projectId === projectId ? { ...d, files: d.files.filter(f => f.id !== fileId) } : d
    ));
    toast.success('已删除交付物');
  };

  const uploadProject = myProjects.find(p => p.id === uploadTarget);
  const totalFiles = deliveries.reduce((s, d) => s + d.files.length, 0);

  return (
    <div className="p-6 space-y-6">
      {/* 个人中心 */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">外</div>
          <div>
            <div className="text-base font-bold text-foreground">星辰前端工作室</div>
            <div className="text-xs text-muted-foreground mt-0.5">合作商 · 前端开发</div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-3 text-center">
            <div className="bg-secondary/50 rounded-lg px-4 py-2">
              <div className="text-lg font-bold text-foreground">{myProjects.length}</div>
              <div className="text-[10px] text-muted-foreground">承接项目</div>
            </div>
            <div className="bg-secondary/50 rounded-lg px-4 py-2">
              <div className="text-lg font-bold text-blue-400">{totalFiles}</div>
              <div className="text-[10px] text-muted-foreground">已上传交付物</div>
            </div>
            <div className="bg-secondary/50 rounded-lg px-4 py-2">
              <div className="text-lg font-bold text-emerald-400">¥9万</div>
              <div className="text-[10px] text-muted-foreground">已到账</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 我的项目交付物 ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-foreground">我的项目交付物</span>
          <span className="text-xs text-muted-foreground">· 按项目上传代码、文档、原型等文件</span>
        </div>
        <div className="space-y-3">
          {myProjects.map(project => {
            const delivery = deliveries.find(d => d.projectId === project.id);
            return (
              <ProjectDeliveryCard
                key={project.id}
                project={project}
                files={delivery?.files || []}
                onUpload={() => setUploadTarget(project.id)}
                onDelete={(fileId) => handleDelete(project.id, fileId)}
              />
            );
          })}
        </div>
      </div>

      {/* 站内通知 */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-foreground">站内通知</span>
          <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] flex items-center justify-center font-bold">{unreadNotifications.length}</span>
        </div>
        <div className="divide-y divide-border/50">
          {unreadNotifications.map(n => (
            <div key={n.id} className="px-4 py-3 hover:bg-accent/30 transition-colors">
              <div className="flex items-start gap-2">
                <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', n.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400')} />
                <div>
                  <div className="text-xs font-medium text-foreground">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.content}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 里程碑 & 审核状态 */}
      <div>
        <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          里程碑 & 审核状态
        </div>
        <div className="space-y-2">
          {myMilestones.map(m => (
            <div key={m.id} className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">截止：{m.dueDate}</div>
                  {m.aiScore !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <Bot className="w-3 h-3 text-blue-400" />
                      <span className={cn('text-[10px]', m.aiScore >= 85 ? 'text-emerald-400' : m.aiScore >= 70 ? 'text-amber-400' : 'text-red-400')}>
                        AI评分 {m.aiScore}分
                      </span>
                      {m.issues && m.issues.length > 0 && (
                        <span className="text-[10px] text-red-400">{m.issues.length}个问题需修改</span>
                      )}
                    </div>
                  )}
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  m.status === '已通过' ? 'badge-green' :
                  m.status === '审核中' ? 'badge-yellow' :
                  m.status === '待提交' ? 'badge-gray' : 'badge-red'
                )}>{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 发票 & 付款 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            我的发票 & 付款
          </div>
          <button
            onClick={() => toast.info('请前往「发票 & 结算」页面提交发票')}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
          >
            + 提交发票
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">发票编号</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">金额</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">提交日期</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {myInvoices.map(inv => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="px-4 py-3 font-medium text-foreground">{inv.id}</td>
                  <td className="px-4 py-3 font-bold text-foreground">¥{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.submitDate}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      inv.status === '已付款' ? 'badge-green' : inv.status === '待审批' ? 'badge-yellow' : 'badge-blue'
                    )}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 上传弹窗 */}
      {uploadTarget && uploadProject && (
        <UploadDialog
          open={true}
          onClose={() => setUploadTarget(null)}
          projectName={uploadProject.name}
          onUpload={(file) => handleUpload(uploadTarget, file)}
        />
      )}
    </div>
  );
}
