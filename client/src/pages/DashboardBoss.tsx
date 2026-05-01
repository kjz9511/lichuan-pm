// 厉川外包项目管理平台 — 老板仪表盘
// 设计风格：深色专业管理台风，数据卡片 + 图表 + 项目列表

import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderOpen,
  RefreshCw,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  contracts,
  dashboardStats,
  invoices,
  milestones,
  monthlyRevenue,
  notifications,
  operationLogs,
  projects,
  stageDistribution,
} from '../lib/mockData';
import { useAI } from '@/hooks/useAI';
import { useTransfer } from '../contexts/TransferContext';
import { useProject } from '../contexts/ProjectContext';
import { Bell, FolderPlus } from 'lucide-react';

function HealthBadge({ health }: { health: 'green' | 'yellow' | 'red' }) {
  if (health === 'green') return <span className="badge-green px-2 py-0.5 rounded text-xs font-medium">健康</span>;
  if (health === 'yellow') return <span className="badge-yellow px-2 py-0.5 rounded text-xs font-medium">预警</span>;
  return <span className="badge-red px-2 py-0.5 rounded text-xs font-medium">风险</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    '进行中': 'badge-blue',
    '已完成': 'badge-green',
    '已逾期': 'badge-red',
    '待启动': 'badge-gray',
  };
  return <span className={cn(map[status] || 'badge-gray', 'px-2 py-0.5 rounded text-xs font-medium')}>{status}</span>;
}

const STAGE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280'];

export default function DashboardBoss() {
  const activeProjects = projects.filter(p => p.status === '进行中');
  const { requests, approveRequest, rejectRequest } = useTransfer();
  const { updateManager, newProjectNotifications, markNotificationRead } = useProject();
  const pendingTransfers = requests.filter(r => r.status === 'pending');
  const unreadNotifications = newProjectNotifications.filter(n => !n.read);
  const totalPending = 2 + pendingTransfers.length + unreadNotifications.length;

  return (
    <div className="p-6 space-y-6">
      {/* AI 每日摘要 */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground mb-1">AI 每日智能摘要 · 2026-04-27</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              当前共 <span className="text-blue-400 font-medium">5个项目</span>，其中3个健康、1个预警、1个风险。
              <span className="text-red-400 font-medium">「AI客服机器人接入」</span>距截止仅剩3天，进度88%，建议重点跟进。
              本月已回款 <span className="text-emerald-400 font-medium">¥140,000</span>，待回款 <span className="text-amber-400 font-medium">¥1,616,000</span>。
              有 <span className="text-amber-400 font-medium">2张发票</span> 待您审批，请及时处理。
            </div>
          </div>
        </div>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 card-accent-blue">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">总项目数</span>
            <FolderOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{dashboardStats.totalProjects}</div>
          <div className="text-xs text-muted-foreground mt-1">进行中 {dashboardStats.activeProjects} · 已完成 {dashboardStats.completedProjects}</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 card-accent-green">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">合同总金额</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">¥{(dashboardStats.totalContractAmount / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">已回款 ¥{(dashboardStats.totalPaidAmount / 10000).toFixed(0)}万</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 card-accent-yellow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">待回款</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">¥{(dashboardStats.pendingPayment / 10000).toFixed(0)}万</div>
          <div className="text-xs text-muted-foreground mt-1">待审批发票 {dashboardStats.pendingApprovals} 张</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 card-accent-red">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">健康度概览</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">{dashboardStats.healthGreen}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{dashboardStats.healthYellow}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-sm font-bold text-red-400">{dashboardStats.healthRed}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">绿 · 黄 · 红</div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 月度收款趋势 */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="text-sm font-semibold text-foreground mb-4">月度收款趋势（万元）</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyRevenue} barSize={28}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 10000}万`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`¥${(v / 10000).toFixed(0)}万`, '收款']}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 项目阶段分布 */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-sm font-semibold text-foreground mb-4">项目阶段分布</div>
          <div className="flex justify-center">
            <PieChart width={140} height={140}>
              <Pie data={stageDistribution} dataKey="count" cx={70} cy={70} innerRadius={40} outerRadius={65}>
                {stageDistribution.map((_, i) => (
                  <Cell key={i} fill={STAGE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number, _: string, props: { payload?: { stage: string } }) => [v, props.payload?.stage || '']}
              />
            </PieChart>
          </div>
          <div className="space-y-1 mt-2">
            {stageDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[i] }} />
                  <span className="text-muted-foreground">{item.stage}</span>
                </div>
                <span className="text-foreground font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">项目列表</span>
          <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            查看全部 <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">项目名称</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">项目经理</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">当前阶段</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">进度</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">健康度</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">状态</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">合同金额</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">截止日期</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-muted-foreground text-[10px]">{p.id}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.manager}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.stage}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', p.health === 'green' ? 'bg-emerald-500' : p.health === 'yellow' ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="text-foreground">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><HealthBadge health={p.health} /></td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-foreground">¥{(p.contractAmount / 10000).toFixed(0)}万</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 立项通知区块 */}
      {unreadNotifications.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">新项目立项通知</span>
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] inline-flex items-center justify-center font-bold">{unreadNotifications.length}</span>
            </div>
            <button
              onClick={() => unreadNotifications.forEach(n => markNotificationRead(n.id))}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >全部标读</button>
          </div>
          <div className="divide-y divide-border/50">
            {unreadNotifications.map(n => (
              <div key={n.id} className="px-4 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <FolderPlus className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-1.5 py-0.5 bg-green-500/15 text-green-400 text-[10px] rounded font-medium">新项目立项</span>
                        <span className="text-xs font-medium text-foreground">{n.projectName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">PM: {n.manager} · 合同额: ¥{(n.contractAmount / 10000).toFixed(0)}万</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">立项时间：{n.createdAt}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-400 hover:border-green-500/50 hover:text-green-400 transition-colors ml-2 shrink-0"
                  >已知晓</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部：待审批 + 操作日志 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 待审批 */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">待审批事项</span>
            <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 
text-[10px] inline-flex items-center justify-center font-bold">{totalPending}</span>
          </div>          <div className="divide-y divide-border/50">
            {/* 项目移交申请 */}
            {pendingTransfers.map(req => (
              <div key={req.id} className="px-4 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded font-medium">项目移交</span>
                      <span className="text-xs font-medium text-foreground truncate">{req.projectName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{req.fromPM} → {req.toPM}</div>
                    {req.reason && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">交接原因：{req.reason}</div>}
                    <div className="text-[10px] text-muted-foreground mt-0.5">申请时间：{req.createdAt}</div>
                  </div>
                  <div className="flex gap-1.5 ml-2 shrink-0">
                    <button
                      onClick={() => approveRequest(req.id, (projectId, newManager) => {
                        updateManager(projectId, newManager);
                      })}
                      className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] hover:bg-emerald-600/30 transition-colors"
                    >通过</button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-[10px] hover:bg-red-600/30 transition-colors"
                    >驳回</button>
                  </div>
                </div>
              </div>
            ))}
            {/* 发票审批 */}
            <div className="px-4 py-3 hover:bg-accent/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">发票审批 · INV-002</div>
                  <div className="text-xs text-muted-foreground mt-0.5">智能云科技 · AI客服机器人接入 · ¥36,000</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">提交时间：2026-04-25</div>
                </div>
                <div className="flex gap-1.5 ml-2">
                  <button className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] hover:bg-emerald-600/30 transition-colors">同意</button>
                  <button className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-[10px] hover:bg-red-600/30 transition-colors">拒绝</button>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-accent/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">发票审批 · INV-003</div>
                  <div className="text-xs text-muted-foreground mt-0.5">大锤科技团队 · 供应链管理系统 · ¥84,000</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">提交时间：2026-04-26</div>
                </div>
                <div className="flex gap-1.5 ml-2">
                  <button className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] hover:bg-emerald-600/30 transition-colors">同意</button>
                  <button className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-[10px] hover:bg-red-600/30 transition-colors">拒绝</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作日志 */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">最近操作日志</span>
          </div>
          <div className="divide-y divide-border/50">
            {operationLogs.slice(0, 5).map(log => (
              <div key={log.id} className="px-4 py-2.5 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-blue-400 font-medium">{log.user}</span>
                    <span className="text-xs text-muted-foreground ml-1">{log.action}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{log.time.split(' ')[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
