// 厉川外包项目管理平台 — 侧边栏组件
// 设计风格：深色专业管理台风，左侧固定侧边栏，含角色切换与导航菜单

import { cn } from '@/lib/utils';
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { ROLES, Role, useRole } from '../contexts/RoleContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, roles: ['boss', 'pm', 'vendor', 'finance'] },
  { id: 'projects', label: '项目台账', icon: FolderOpen, roles: ['boss', 'pm', 'finance'] },
  { id: 'milestones', label: '里程碑 & 交付物', icon: ClipboardList, roles: ['boss', 'pm', 'vendor'] },
  { id: 'contracts', label: '合同管理', icon: FileText, roles: ['boss', 'pm', 'finance'] },
  { id: 'vendors', label: '供应商管理', icon: Building2, roles: ['boss', 'pm', 'finance'] },
  { id: 'invoices', label: '发票 & 结算', icon: Receipt, roles: ['boss', 'vendor', 'finance'], badge: 2 },
  { id: 'documents', label: '我的文档', icon: BookOpen, roles: ['pm', 'vendor'] },
  { id: 'reports', label: '数据报表', icon: BarChart3, roles: ['boss', 'finance'] },
  { id: 'users', label: '用户管理', icon: Users, roles: ['boss'] },
  { id: 'logs', label: '操作日志', icon: Shield, roles: ['boss'] },
  { id: 'notifications', label: '通知设置', icon: Bell, roles: ['boss', 'pm'] },
  { id: 'settings', label: '系统设置', icon: Settings, roles: ['boss'] },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { role, roleInfo, setRole } = useRole();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-[220px] min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">厉川项管</div>
            <div className="text-[10px] text-muted-foreground leading-tight">外包项目管理平台</div>
          </div>
        </div>
      </div>

      {/* 角色切换 */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div
          className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-sidebar-accent cursor-pointer transition-colors"
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
        >
          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold', roleInfo.bgColor, roleInfo.color)}>
            {roleInfo.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">{roleInfo.name}</div>
            <div className={cn('text-[10px]', roleInfo.color)}>{roleInfo.label}</div>
          </div>
          <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', roleMenuOpen && 'rotate-180')} />
        </div>

        {roleMenuOpen && (
          <div className="mt-1 rounded-md border border-border bg-popover overflow-hidden">
            {ROLES.map(r => (
              <div
                key={r.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-accent',
                  role === r.id && 'bg-accent'
                )}
                onClick={() => {
                  setRole(r.id);
                  setRoleMenuOpen(false);
                  onNavigate('dashboard');
                }}
              >
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', r.bgColor, r.color)}>
                  {r.avatar}
                </div>
                <div>
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className={cn('text-[10px]', r.color)}>{r.label}</div>
                </div>
                {role === r.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-blue-400' : 'text-muted-foreground')} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 底部版本信息 */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="text-[10px] text-muted-foreground">v1.0.0 · 一期原型</div>
        <div className="text-[10px] text-muted-foreground">5.10 上线计划</div>
      </div>
    </aside>
  );
}
