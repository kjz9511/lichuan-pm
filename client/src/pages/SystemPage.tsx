// 厉川外包项目管理平台 — 系统管理
// 设计风格：深色专业管理台风，Tab 切换：人员管理 / 部门管理 / 岗位管理 / 角色权限
import { useState } from 'react';
import {
  Users, Building2, Briefcase, Shield,
  Plus, Search, Edit2, Trash2, MoreHorizontal,
  CheckCircle2, XCircle, UserCheck, UserX,
  ChevronDown, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── 数据类型 ──────────────────────────────────────────────
type UserType = 'internal' | 'external';
type UserStatus = 'active' | 'disabled';
type RoleId = 'boss' | 'pm' | 'finance' | 'vendor';

interface SystemUser {
  id: string;
  name: string;
  username: string;       // 登录账号
  password: string;       // 密码（演示用明文）
  type: UserType;
  status: UserStatus;
  role: RoleId;
  department?: string;
  position?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  manager: string;
  memberCount: number;
  createdAt: string;
}

interface Position {
  id: string;
  name: string;
  department: string;
  level: string;
  createdAt: string;
}

interface RolePermission {
  id: RoleId;
  name: string;
  color: string;
  bgColor: string;
  description: string;
  permissions: string[];
}

// ── Mock 数据 ──────────────────────────────────────────────
const INIT_USERS: SystemUser[] = [
  { id: 'u1', name: '何家劲', username: 'hejj', password: 'boss123', type: 'internal', status: 'active', role: 'boss', department: '管理层', position: '总经理', phone: '13800000001', email: 'hejj@lichuan.com', createdAt: '2025-01-01' },
  { id: 'u2', name: '张伟', username: 'zhangwei', password: 'pm123', type: 'internal', status: 'active', role: 'pm', department: '项目部', position: '高级项目经理', phone: '13800000002', email: 'zhangwei@lichuan.com', createdAt: '2025-01-05' },
  { id: 'u3', name: '刘芳', username: 'liufang', password: 'pm123', type: 'internal', status: 'active', role: 'pm', department: '项目部', position: '项目经理', phone: '13800000003', email: 'liufang@lichuan.com', createdAt: '2025-01-05' },
  { id: 'u4', name: '陈建国', username: 'chenjg', password: 'pm123', type: 'internal', status: 'active', role: 'pm', department: '项目部', position: '项目经理', phone: '13800000004', email: 'chenjg@lichuan.com', createdAt: '2025-02-01' },
  { id: 'u5', name: '李财务', username: 'licw', password: 'fin123', type: 'internal', status: 'active', role: 'finance', department: '财务部', position: '财务专员', phone: '13800000005', email: 'licw@lichuan.com', createdAt: '2025-01-10' },
  { id: 'u6', name: '星辰前端工作室', username: 'xingchen', password: 'vendor123', type: 'external', status: 'active', role: 'vendor', phone: '13900000001', email: 'contact@xingchen.com', createdAt: '2025-03-01' },
  { id: 'u7', name: '大稳科技团队', username: 'dawen', password: 'vendor123', type: 'external', status: 'active', role: 'vendor', phone: '13900000002', email: 'contact@dawen.com', createdAt: '2025-03-15' },
];

const INIT_DEPARTMENTS: Department[] = [
  { id: 'd1', name: '管理层', manager: '何家劲', memberCount: 1, createdAt: '2025-01-01' },
  { id: 'd2', name: '项目部', manager: '张伟', memberCount: 3, createdAt: '2025-01-01' },
  { id: 'd3', name: '财务部', manager: '李财务', memberCount: 1, createdAt: '2025-01-01' },
  { id: 'd4', name: '技术部', manager: '陈建国', memberCount: 2, createdAt: '2025-02-01' },
];

const INIT_POSITIONS: Position[] = [
  { id: 'p1', name: '总经理', department: '管理层', level: 'L5', createdAt: '2025-01-01' },
  { id: 'p2', name: '高级项目经理', department: '项目部', level: 'L4', createdAt: '2025-01-01' },
  { id: 'p3', name: '项目经理', department: '项目部', level: 'L3', createdAt: '2025-01-01' },
  { id: 'p4', name: '财务专员', department: '财务部', level: 'L2', createdAt: '2025-01-01' },
  { id: 'p5', name: '前端工程师', department: '技术部', level: 'L2', createdAt: '2025-02-01' },
  { id: 'p6', name: '后端工程师', department: '技术部', level: 'L2', createdAt: '2025-02-01' },
];

const ROLE_PERMISSIONS: RolePermission[] = [
  {
    id: 'boss', name: '老板 / 管理层', color: 'text-purple-400', bgColor: 'bg-purple-500/15 border-purple-500/30',
    description: '最高权限，可查看所有数据，接收立项通知，审阅项目健康度。',
    permissions: ['查看所有项目', '查看所有合同', '查看所有发票', '接收立项通知', '查看数据报表', '系统管理', '查看操作日志', '查看供应商信息'],
  },
  {
    id: 'pm', name: '项目经理（PM）', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30',
    description: '负责项目全流程管理，可新建预立项/立项，发起合同付款申请，管理里程碑。',
    permissions: ['新建预立项', '发起正式立项', '管理所负责项目', '发起付款/收款申请', '上传交付物', '管理里程碑', '查看供应商', '发起外协合同'],
  },
  {
    id: 'finance', name: '财务 / 结算', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30',
    description: '负责发票审核与收付款管理，可查看所有合同收付款状态，OCR 识别发票。',
    permissions: ['查看所有合同收付款', '审核付款申请', 'OCR 识别发票', '标记已收款/已付款', '查看发票列表', '导出财务数据'],
  },
  {
    id: 'vendor', name: '外部供应商', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30',
    description: '外部合作团队账号，仅可查看与自己相关的项目和合同，提交交付物和发票。',
    permissions: ['查看承接项目', '查看外协合同', '提交交付物', '提交发票申请', '查看里程碑状态', '查看付款进度'],
  },
];

const ROLE_LABELS: Record<RoleId, string> = { boss: '老板', pm: '项目经理', finance: '财务', vendor: '供应商' };
const ROLE_COLORS: Record<RoleId, string> = {
  boss: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  pm: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  finance: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  vendor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

// ── 子组件：人员管理 ──────────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>(INIT_USERS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | UserType>('all');
  const [filterRole, setFilterRole] = useState<'all' | RoleId>('all');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});

  const filtered = users.filter(u => {
    const matchSearch = u.name.includes(search) || u.username.includes(search) || (u.email || '').includes(search);
    const matchType = filterType === 'all' || u.type === filterType;
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchType && matchRole;
  });

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u));
    toast.success('账号状态已更新');
  }

  function deleteUser(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('账号已删除');
  }

  function handleSave(data: Partial<SystemUser>) {
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...data } : u));
      toast.success('账号信息已更新');
    } else {
      const newUser: SystemUser = {
        id: `u${Date.now()}`,
        name: data.name || '',
        username: data.username || '',
        password: data.password || '123456',
        type: data.type || 'internal',
        status: 'active',
        role: data.role || 'pm',
        department: data.department,
        position: data.position,
        phone: data.phone,
        email: data.email,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('账号已创建');
    }
    setShowForm(false);
    setEditUser(null);
  }

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索姓名、账号、邮箱..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
          <option value="all">全部类型</option>
          <option value="internal">内部人员</option>
          <option value="external">外部供应商</option>
        </select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as typeof filterRole)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
          <option value="all">全部角色</option>
          <option value="boss">老板</option>
          <option value="pm">项目经理</option>
          <option value="finance">财务</option>
          <option value="vendor">供应商</option>
        </select>
        <button onClick={() => { setEditUser(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> 新建账号
        </button>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '全部账号', value: users.length, color: 'text-foreground' },
          { label: '内部人员', value: users.filter(u => u.type === 'internal').length, color: 'text-blue-400' },
          { label: '外部供应商', value: users.filter(u => u.type === 'external').length, color: 'text-amber-400' },
          { label: '已停用', value: users.filter(u => u.status === 'disabled').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
            <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 账号列表 */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-800/50">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">姓名 / 账号</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">类型</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">角色</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">部门 / 岗位</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">登录密码</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">状态</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">@{u.username}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border',
                    u.type === 'internal' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')}>
                    {u.type === 'internal' ? '内部' : '外部'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', ROLE_COLORS[u.role])}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {u.department && <div>{u.department}</div>}
                  {u.position && <div className="text-slate-500">{u.position}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-mono">
                      {showPwd[u.id] ? u.password : '••••••'}
                    </span>
                    <button onClick={() => setShowPwd(p => ({ ...p, [u.id]: !p[u.id] }))}
                      className="text-slate-500 hover:text-slate-300 transition-colors">
                      {showPwd[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit',
                    u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30')}>
                    {u.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {u.status === 'active' ? '正常' : '已停用'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditUser(u); setShowForm(true); }}
                      className="text-slate-400 hover:text-blue-400 transition-colors" title="编辑">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleStatus(u.id)}
                      className="text-slate-400 hover:text-amber-400 transition-colors"
                      title={u.status === 'active' ? '停用' : '启用'}>
                      {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteUser(u.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">暂无匹配账号</div>
        )}
      </div>

      {/* 新建/编辑弹窗 */}
      {showForm && (
        <UserFormModal
          user={editUser}
          departments={INIT_DEPARTMENTS.map(d => d.name)}
          positions={INIT_POSITIONS.map(p => p.name)}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditUser(null); }}
        />
      )}
    </div>
  );
}

// ── 账号表单弹窗 ──────────────────────────────────────────
function UserFormModal({ user, departments, positions, onSave, onClose }: {
  user: SystemUser | null;
  departments: string[];
  positions: string[];
  onSave: (data: Partial<SystemUser>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: user?.password || '',
    type: user?.type || 'internal' as UserType,
    role: user?.role || 'pm' as RoleId,
    department: user?.department || '',
    position: user?.position || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim()) { toast.error('姓名和账号不能为空'); return; }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="font-semibold text-foreground">{user ? '编辑账号' : '新建账号'}</div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">姓名 / 公司名 *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">登录账号 *</label>
              <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">登录密码</label>
            <input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="默认 123456"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">账号类型</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as UserType }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
                <option value="internal">内部人员</option>
                <option value="external">外部供应商</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">系统角色</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as RoleId }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
                <option value="boss">老板</option>
                <option value="pm">项目经理</option>
                <option value="finance">财务</option>
                <option value="vendor">供应商</option>
              </select>
            </div>
          </div>
          {form.type === 'internal' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">所属部门</label>
                <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
                  <option value="">请选择</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">岗位</label>
                <select value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
                  <option value="">请选择</option>
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">手机号</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">邮箱</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors">取消</button>
            <button type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              {user ? '保存修改' : '创建账号'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 子组件：部门管理 ──────────────────────────────────────
function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>(INIT_DEPARTMENTS);
  const [showForm, setShowForm] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', manager: '' });

  function handleSave() {
    if (!formData.name.trim()) { toast.error('部门名称不能为空'); return; }
    if (editDept) {
      setDepartments(prev => prev.map(d => d.id === editDept.id ? { ...d, ...formData } : d));
      toast.success('部门信息已更新');
    } else {
      setDepartments(prev => [...prev, { id: `d${Date.now()}`, name: formData.name, manager: formData.manager, memberCount: 0, createdAt: new Date().toISOString().slice(0, 10) }]);
      toast.success('部门已创建');
    }
    setShowForm(false); setEditDept(null); setFormData({ name: '', manager: '' });
  }

  function deleteDept(id: string) {
    setDepartments(prev => prev.filter(d => d.id !== id));
    toast.success('部门已删除');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">共 {departments.length} 个部门</div>
        <button onClick={() => { setEditDept(null); setFormData({ name: '', manager: '' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> 新建部门
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {departments.map(d => (
          <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">{d.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">负责人：{d.manager} · {d.memberCount} 人</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditDept(d); setFormData({ name: d.name, manager: d.manager }); setShowForm(true); }}
                className="text-slate-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => deleteDept(d.id)}
                className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 space-y-4">
            <div className="font-semibold">{editDept ? '编辑部门' : '新建部门'}</div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">部门名称 *</label>
              <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">负责人</label>
              <input value={formData.manager} onChange={e => setFormData(p => ({ ...p, manager: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors">取消</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 子组件：岗位管理 ──────────────────────────────────────
function PositionManagement() {
  const [positions, setPositions] = useState<Position[]>(INIT_POSITIONS);
  const [showForm, setShowForm] = useState(false);
  const [editPos, setEditPos] = useState<Position | null>(null);
  const [formData, setFormData] = useState({ name: '', department: '', level: 'L2' });

  function handleSave() {
    if (!formData.name.trim()) { toast.error('岗位名称不能为空'); return; }
    if (editPos) {
      setPositions(prev => prev.map(p => p.id === editPos.id ? { ...p, ...formData } : p));
      toast.success('岗位信息已更新');
    } else {
      setPositions(prev => [...prev, { id: `p${Date.now()}`, name: formData.name, department: formData.department, level: formData.level, createdAt: new Date().toISOString().slice(0, 10) }]);
      toast.success('岗位已创建');
    }
    setShowForm(false); setEditPos(null); setFormData({ name: '', department: '', level: 'L2' });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">共 {positions.length} 个岗位</div>
        <button onClick={() => { setEditPos(null); setFormData({ name: '', department: '', level: 'L2' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> 新建岗位
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-800/50">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">岗位名称</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">所属部门</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">级别</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">创建时间</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.department || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">{p.level}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditPos(p); setFormData({ name: p.name, department: p.department, level: p.level }); setShowForm(true); }}
                      className="text-slate-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { setPositions(prev => prev.filter(x => x.id !== p.id)); toast.success('岗位已删除'); }}
                      className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 space-y-4">
            <div className="font-semibold">{editPos ? '编辑岗位' : '新建岗位'}</div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">岗位名称 *</label>
              <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">所属部门</label>
                <select value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
                  <option value="">请选择</option>
                  {INIT_DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">级别</label>
                <select value={formData.level} onChange={e => setFormData(p => ({ ...p, level: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500">
                  {['L1','L2','L3','L4','L5'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors">取消</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 子组件：角色权限 ──────────────────────────────────────
function RolePermissions() {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">系统内置四种角色，权限由系统统一管理，不支持自定义修改（如需调整请联系技术团队）。</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLE_PERMISSIONS.map(r => (
          <div key={r.id} className={cn('border rounded-xl p-5 space-y-3', r.bgColor)}>
            <div className="flex items-center gap-3">
              <Shield className={cn('w-5 h-5', r.color)} />
              <div>
                <div className={cn('font-semibold', r.color)}>{r.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {r.permissions.map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────
const TABS = [
  { id: 'users',       label: '人员管理',   icon: Users },
  { id: 'departments', label: '部门管理',   icon: Building2 },
  { id: 'positions',   label: '岗位管理',   icon: Briefcase },
  { id: 'roles',       label: '角色权限',   icon: Shield },
];

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="p-6 space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-xl font-bold text-foreground">系统管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理内外部人员账号、部门架构、岗位配置与角色权限</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex items-center gap-1 bg-slate-800/50 border border-border rounded-xl p-1 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'users'       && <UserManagement />}
      {activeTab === 'departments' && <DepartmentManagement />}
      {activeTab === 'positions'   && <PositionManagement />}
      {activeTab === 'roles'       && <RolePermissions />}
    </div>
  );
}

// 导出 INIT_USERS 供登录页使用
export { INIT_USERS };
export type { SystemUser, RoleId };
