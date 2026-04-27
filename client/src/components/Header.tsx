// 厉川外包项目管理平台 — 顶部 Header 组件
// 设计风格：深色专业管理台风，含面包屑、通知、用户信息

import { Bell, Search } from 'lucide-react';
import { useState } from 'react';
import { useRole } from '../contexts/RoleContext';
import { notifications } from '../lib/mockData';
import { cn } from '@/lib/utils';

const PAGE_TITLES: Record<string, string> = {
  dashboard: '仪表盘',
  projects: '项目台账',
  milestones: '里程碑 & 交付物',
  contracts: '合同管理',
  vendors: '供应商管理',
  invoices: '发票 & 结算',
  documents: '我的文档',
  reports: '数据报表',
  users: '用户管理',
  logs: '操作日志',
  notifications: '通知设置',
  settings: '系统设置',
  'project-detail': '项目详情',
};

interface HeaderProps {
  activePage: string;
  onLogout?: () => void;
}

export default function Header({ activePage, onLogout }: HeaderProps) {
  const { roleInfo } = useRole();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">厉川项管</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">{PAGE_TITLES[activePage] || activePage}</span>
      </div>

      <div className="flex-1" />

      {/* 搜索框 */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索项目、合同..."
          className="w-52 h-8 pl-8 pr-3 text-xs bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* 通知铃铛 */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-8 h-8 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-10 w-80 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">通知</span>
              <span className="text-xs text-muted-foreground">{unreadCount} 条未读</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    'px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors',
                    !n.read && 'bg-blue-500/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      n.type === 'warning' ? 'bg-amber-400' :
                      n.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
                    )} />
                    <div>
                      <div className="text-xs font-medium text-foreground">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.content}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 text-center">
              <button className="text-xs text-blue-400 hover:text-blue-300">查看全部通知</button>
            </div>
          </div>
        )}
      </div>

      {/* 用户头像 + 退出 */}
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
          roleInfo.bgColor, roleInfo.color
        )}>
          {roleInfo.avatar}
        </div>
        <div className="hidden md:block">
          <div className="text-xs font-medium text-foreground">{roleInfo.name}</div>
          <div className={cn('text-[10px]', roleInfo.color)}>{roleInfo.label}</div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="ml-2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent transition-colors"
          >
            退出
          </button>
        )}
      </div>
    </header>
  );
}
