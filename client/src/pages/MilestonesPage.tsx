// 厉川外包项目管理平台 — 里程碑 & 交付物页面
// 设计风格：深色专业管理台风，AI审核评分 + 状态管理

import { cn } from '@/lib/utils';
import { Bot, FileUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { milestones, projects } from '../lib/mockData';
import { toast } from 'sonner';

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

export default function MilestonesPage() {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = milestones.filter(m => {
    const matchProject = filterProject === 'all' || m.projectId === filterProject;
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchProject && matchStatus;
  });

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
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {project?.name} · 提交人：{m.submitter} · 截止：{m.dueDate}
                  </div>

                  {/* AI 审核结果 */}
                  {m.aiScore !== undefined && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">AI 审核报告</span>
                        <AIScoreBar score={m.aiScore} />
                      </div>
                      {m.issues && m.issues.length > 0 ? (
                        <div className="space-y-1">
                          {m.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-amber-400">
                              <span className="shrink-0 mt-0.5">⚠</span>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-400">✓ 未发现明显问题，交付物质量良好</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="shrink-0 flex flex-col gap-2">
                  {m.status === '待提交' && (
                    <button
                      onClick={() => toast.success('文件上传功能将在二期上线')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-md text-xs hover:bg-blue-600/30 transition-colors"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      上传交付物
                    </button>
                  )}
                  {m.status === '审核中' && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toast.success('已通过审核')}
                        className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs hover:bg-emerald-600/30 transition-colors"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => toast.error('已驳回')}
                        className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-600/30 transition-colors"
                      >
                        驳回
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
    </div>
  );
}
