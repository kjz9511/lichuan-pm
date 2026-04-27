// 厉川外包项目管理平台 — 项目台账页面
// 设计风格：深色专业管理台风，项目列表 + 详情弹窗

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { projects, Project } from '../lib/mockData';
import { toast } from 'sonner';
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

const STAGES = ['项目启动', '需求确认', '项目执行', '项目验收', '项目结项'];

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

interface ProjectsPageProps {
  onNewProject?: () => void;
}

export default function ProjectsPage({ onNewProject }: ProjectsPageProps) {
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stageProjectId, setStageProjectId] = useState<string | null>(null);

  // 进入阶段子流程页面
  if (stageProjectId) {
    return <ProjectStagePage projectId={stageProjectId} onBack={() => setStageProjectId(null)} canApprove={true} />;
  }

  const filtered = projects.filter(p => {
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
                <div className="flex items-center gap-3">
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
              </div>

              {/* 右侧信息 */}
              <div className="shrink-0 text-right space-y-1">
                <div className="text-xs text-muted-foreground">当前阶段</div>
                <div className="text-xs font-medium text-blue-400">{p.stage}</div>
                <div className="text-xs text-muted-foreground mt-2">合同金额</div>
                <div className="text-xs font-bold text-foreground">¥{(p.contractAmount / 10000).toFixed(0)}万</div>
                <div className="text-[10px] text-emerald-400">已回 ¥{(p.paidAmount / 10000).toFixed(0)}万</div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={e => { e.stopPropagation(); setStageProjectId(p.id); }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 rounded text-[10px] font-medium transition-colors"
                >
                  <GitBranch className="w-2.5 h-2.5" />
                  阶段流程
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
    </div>
  );
}
