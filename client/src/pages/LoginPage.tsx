// 厉川外包项目管理平台 — 登录页
// 设计风格：深色专业管理台风，左侧品牌区 + 右侧账号密码登录
// 账号数据来自 SystemPage 的 INIT_USERS，根据账号角色自动进入对应视图
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Role } from '../contexts/RoleContext';
import { INIT_USERS } from './SystemPage';

interface LoginPageProps {
  onLogin: (role: Role, name?: string) => void;
}

const DEMO_ACCOUNTS = [
  { username: 'hejj',     password: 'boss123',   label: '老板',    color: 'text-purple-400' },
  { username: 'zhangwei', password: 'pm123',     label: 'PM 张伟', color: 'text-blue-400' },
  { username: 'licw',     password: 'fin123',    label: '财务',    color: 'text-emerald-400' },
  { username: 'xingchen', password: 'vendor123', label: '供应商',  color: 'text-amber-400' },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError('请输入账号和密码'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = INIT_USERS.find(u => u.username === username.trim());
      if (!user) { setError('账号不存在，请检查输入'); return; }
      if (user.status === 'disabled') { setError('该账号已被停用，请联系管理员'); return; }
      if (user.password !== password) { setError('密码错误，请重新输入'); return; }
      // PM 角色按姓名映射
      let role: Role = user.role as Role;
      if (user.role === 'pm') {
        if (user.name === '刘芳') role = 'pm2';
        else if (user.name === '陈建国') role = 'pm3';
        else role = 'pm';
      }
      onLogin(role, user.name);
    }, 600);
  }

  function quickFill(acc: typeof DEMO_ACCOUNTS[0]) {
    setUsername(acc.username); setPassword(acc.password); setError('');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-indigo-600/15 rounded-full blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">厉川项管平台</div>
            <div className="text-blue-300 text-xs">外包项目管理系统</div>
          </div>
        </div>

        {/* 中间内容 */}
        <div className="relative">
          <div className="text-4xl font-bold text-white leading-tight mb-4">
            统一管理<br />
            <span className="text-blue-400">外包项目</span>全流程
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            从项目立项到结项归档，从合同签署到回款闭环，
            AI辅助审核，让每一个外包项目都清晰可控。
          </p>
          {/* 特性列表 */}
          <div className="space-y-3">
            {[
              { icon: '📊', text: '实时项目健康度监控' },
              { icon: '💰', text: '合同回款全程追踪' },
              { icon: '🤖', text: 'AI智能审核交付物' },
              { icon: '👥', text: '内外部角色权限隔离' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 底部 */}
        <div className="relative text-xs text-slate-500">
          v1.0.0 · 一期原型 · 5.10 上线计划
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* 移动端 Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white font-bold">厉川项管平台</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">欢迎回来</h1>
            <p className="text-sm text-muted-foreground">登录厉川外包项目管理平台</p>
          </div>

          {/* 演示账号快速填入 */}
          <div className="mb-5 p-3 bg-slate-800/60 border border-slate-700 rounded-xl">
            <div className="text-xs text-muted-foreground mb-2 font-medium">演示账号（点击快速填入）</div>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.username} type="button" onClick={() => quickFill(acc)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors text-left">
                  <div className="text-xs">
                    <span className={cn('font-medium', acc.color)}>{acc.label}</span>
                    <span className="text-slate-500 ml-1">@{acc.username}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">账号</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="请输入登录账号"
                  className="w-full h-10 pl-9 pr-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="请输入密码"
                  className="w-full h-10 pl-9 pr-9 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </>
              ) : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            如忘记密码请联系系统管理员重置
          </div>
        </div>
      </div>
    </div>
  );
}
