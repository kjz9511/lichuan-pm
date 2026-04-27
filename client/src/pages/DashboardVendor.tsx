// 厉川外包项目管理平台 — 外包成员仪表盘
import { cn } from '@/lib/utils';
import { Bell, Bot, FileUp, Receipt } from 'lucide-react';
import { invoices, milestones, notifications, projects } from '../lib/mockData';
import { toast } from 'sonner';

export default function DashboardVendor() {
  const myProject = projects[0]; // 星辰前端工作室负责的项目
  const myMilestones = milestones.filter(m => m.projectId === 'PRJ-2026-001');
  const myInvoices = invoices.filter(i => i.vendor === '星辰前端工作室');
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* 个人中心 */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">外</div>
          <div>
            <div className="text-base font-bold text-foreground">星辰前端工作室</div>
            <div className="text-xs text-muted-foreground mt-0.5">外包成员 · 前端开发</div>
          </div>
          <div className="ml-auto grid grid-cols-2 gap-3 text-center">
            <div className="bg-secondary/50 rounded-lg px-4 py-2">
              <div className="text-lg font-bold text-foreground">1</div>
              <div className="text-[10px] text-muted-foreground">承接项目</div>
            </div>
            <div className="bg-secondary/50 rounded-lg px-4 py-2">
              <div className="text-lg font-bold text-emerald-400">¥9万</div>
              <div className="text-[10px] text-muted-foreground">已到账</div>
            </div>
          </div>
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

      {/* 我的里程碑 */}
      <div>
        <div className="text-sm font-semibold text-foreground mb-3">我的交付物</div>
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
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    m.status === '已通过' ? 'badge-green' :
                    m.status === '审核中' ? 'badge-yellow' :
                    m.status === '待提交' ? 'badge-gray' : 'badge-red'
                  )}>{m.status}</span>
                  {m.status === '待提交' && (
                    <button
                      onClick={() => toast.success('文件上传功能即将上线')}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-[10px]"
                    >
                      <FileUp className="w-3 h-3" />
                      上传
                    </button>
                  )}
                </div>
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
            onClick={() => toast.info('提交发票功能即将上线')}
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
    </div>
  );
}
