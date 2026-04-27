// 厉川外包项目管理平台 — 项目经理仪表盘
import { cn } from '@/lib/utils';
import { Bot, ClipboardList, FolderOpen, Plus, TrendingUp } from 'lucide-react';
import { milestones, projects } from '../lib/mockData';
import { toast } from 'sonner';

const STAGES = ['项目启动', '需求确认', '项目执行', '项目验收', '项目结项'];

export default function DashboardPM() {
  const myProjects = projects.filter(p => p.manager === '张伟');
  const pendingMilestones = milestones.filter(m => ['待提交', '审核中'].includes(m.status));

  return (
    <div className="p-6 space-y-6">
      {/* AI 摘要 */}
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground mb-1">AI 每日摘要 · 项目经理视图</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              您负责 <span className="text-blue-400 font-medium">2个项目</span>，其中「AI客服机器人接入」存在逾期风险，建议今日跟进。
              有 <span className="text-amber-400 font-medium">2个里程碑</span> 待处理，「前端页面开发」AI审核评分78分，发现2个问题需关注。
            </div>
          </div>
        </div>
      </div>

      {/* 我的项目 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-400" />
            我负责的项目
          </div>
          <button
            onClick={() => toast.info('新建项目功能即将上线')}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
          >
            <Plus className="w-3.5 h-3.5" />
            新建项目
          </button>
        </div>
        <div className="space-y-3">
          {myProjects.map(p => {
            const stageIndex = STAGES.indexOf(p.stage);
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.id} · {p.client} · 外包：{p.vendor}</div>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    p.health === 'green' ? 'badge-green' : p.health === 'yellow' ? 'badge-yellow' : 'badge-red'
                  )}>
                    {p.health === 'green' ? '健康' : p.health === 'yellow' ? '预警' : '风险'}
                  </span>
                </div>

                {/* 阶段进度 */}
                <div className="flex items-center mb-3">
                  {STAGES.map((stage, i) => (
                    <div key={stage} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border',
                          i < stageIndex ? 'bg-blue-600 border-blue-600 text-white' :
                          i === stageIndex ? 'bg-blue-600/20 border-blue-500 text-blue-400' :
                          'bg-secondary border-border text-muted-foreground'
                        )}>
                          {i < stageIndex ? '✓' : i + 1}
                        </div>
                        <div className={cn(
                          'text-[9px] mt-0.5 text-center',
                          i === stageIndex ? 'text-blue-400' : 'text-muted-foreground'
                        )}>{stage.replace('项目', '')}</div>
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className={cn('flex-1 h-px mx-0.5 mb-3', i < stageIndex ? 'bg-blue-600' : 'bg-border')} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', p.health === 'green' ? 'bg-emerald-500' : p.health === 'yellow' ? 'bg-amber-500' : 'bg-red-500')}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground font-medium">{p.progress}%</span>
                  <span className="text-xs text-muted-foreground">{p.startDate} ~ {p.endDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 待处理里程碑 */}
      <div>
        <div className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-amber-400" />
          待处理里程碑
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">{pendingMilestones.length}</span>
        </div>
        <div className="space-y-2">
          {pendingMilestones.map(m => {
            const project = projects.find(p => p.id === m.projectId);
            return (
              <div key={m.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{project?.name} · 截止：{m.dueDate}</div>
                  {m.aiScore !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <Bot className="w-3 h-3 text-blue-400" />
                      <span className={cn('text-[10px] font-medium', m.aiScore >= 85 ? 'text-emerald-400' : m.aiScore >= 70 ? 'text-amber-400' : 'text-red-400')}>
                        AI评分 {m.aiScore}分
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    m.status === '待提交' ? 'badge-gray' : 'badge-yellow'
                  )}>{m.status}</span>
                  {m.status === '审核中' && (
                    <div className="flex gap-1">
                      <button onClick={() => toast.success('已通过')} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">通过</button>
                      <button onClick={() => toast.error('已驳回')} className="px-2 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-[10px]">驳回</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
