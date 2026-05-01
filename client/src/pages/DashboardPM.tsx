// 厉川外包项目管理平台 — 项目经理仪表盘
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Bot, CheckCircle2, ClipboardList, FolderOpen, Plus, TrendingUp,
  Bell, DollarSign, ArrowUpRight,
} from 'lucide-react';
import { milestones } from '../lib/mockData';
import { toast } from 'sonner';
import { useProject } from '../contexts/ProjectContext';
import { usePaymentRequests } from '../contexts/PaymentRequestContext';

const STAGES = ['项目启动', '需求确认', '项目执行', '项目验收', '项目结项'];

interface DashboardPMProps {
  onNewProject?: () => void;
}

export default function DashboardPM({ onNewProject }: DashboardPMProps) {
  const { projectList } = useProject();
  const { requests } = usePaymentRequests();
  const myProjects = projectList.filter(p => p.manager === '张伟');
  const pendingMilestones = milestones.filter(m => ['待提交', '审核中'].includes(m.status));

  // 已完成的收付款申请（财务已完成，通知 PM）
  const completedRequests = requests.filter(r => r.status === '已完成');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const visibleCompleted = completedRequests.filter(r => !dismissedIds.includes(r.id));

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
              您负责 <span className="text-blue-400 font-medium">{myProjects.length}个项目</span>，
              {myProjects.filter(p => p.health === 'red').length > 0 && (
                <>其中「{myProjects.filter(p => p.health === 'red')[0]?.name}」存在逾期风险，建议今日跟进。</>
              )}
              有 <span className="text-amber-400 font-medium">{pendingMilestones.length}个里程碑</span> 待处理。
              {visibleCompleted.length > 0 && (
                <span className="text-emerald-400 font-medium"> {visibleCompleted.length}笔收付款已由财务处理完成。</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 收付款完成通知 */}
      {visibleCompleted.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-foreground">收付款完成通知</span>
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] inline-flex items-center justify-center font-bold">{visibleCompleted.length}</span>
            </div>
            <button
              onClick={() => setDismissedIds(prev => [...prev, ...visibleCompleted.map(r => r.id)])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >全部清除</button>
          </div>
          <div className="divide-y divide-border/50">
            {visibleCompleted.map(r => (
              <div key={r.id} className="px-4 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      r.type === '收款' ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                    )}>
                      <DollarSign className={cn('w-3.5 h-3.5', r.type === '收款' ? 'text-emerald-400' : 'text-amber-400')} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-medium',
                          r.type === '收款' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        )}>
                          {r.type === '收款' ? '↑ 收款完成' : '↓ 付款完成'}
                        </span>
                        <span className="text-xs font-medium text-foreground">{r.contractName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{r.stageName} · ¥{r.amount.toLocaleString()}</div>
                      {r.completedAt && <div className="text-[10px] text-muted-foreground mt-0.5">完成时间：{r.completedAt}</div>}
                      {r.voucher && <div className="text-[10px] text-emerald-400 mt-0.5">凭证：{r.voucher}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <button
                      onClick={() => setDismissedIds(prev => [...prev, r.id])}
                      className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-400 hover:border-slate-400 transition-colors"
                    >清除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 我的项目 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-400" />
            我负责的项目
            <span className="text-xs text-muted-foreground font-normal">（{myProjects.length}个）</span>
          </div>
          <button
            onClick={() => {
              if (onNewProject) onNewProject();
              else toast.info('请通过侧边栏「新建项目」入口发起立项');
            }}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg hover:bg-blue-500/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            新建项目
          </button>
        </div>
        <div className="space-y-3">
          {myProjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border/40 rounded-xl">
              暂无负责的项目，点击「新建项目」发起立项
            </div>
          )}
          {myProjects.map(p => {
            const stageIndex = STAGES.indexOf(p.stage);
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.id} · {p.client}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      p.health === 'green' ? 'badge-green' : p.health === 'yellow' ? 'badge-yellow' : 'badge-red'
                    )}>
                      {p.health === 'green' ? '健康' : p.health === 'yellow' ? '预警' : '风险'}
                    </span>
                    <button className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                      详情 <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
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
            const project = projectList.find(p => p.id === m.projectId);
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
