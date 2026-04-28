// 设计风格：深色专业管理台风 - 供应商管理页
// 供应商支持「公司/团队」和「个体」两种类型，下挂多个成员，支持新增/编辑/删除
type VendorEntityType = '公司/团队' | '个体';

import { useState } from 'react';
import { vendors as initialVendors, Vendor, VendorMember } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Building2, Phone, Mail, MapPin, Star, Users, Plus, Pencil, Trash2,
  ChevronDown, ChevronUp, Briefcase, UserPlus, X, User
} from 'lucide-react';

const ROLE_OPTIONS: VendorMember['role'][] = [
  '前端开发', '后端开发', '全栈开发', '测试工程师', 'UI设计', 'AI算法', '移动端开发', '产品经理', '项目经理'
];

const TYPE_OPTIONS = ['前端开发', '后端开发', '全栈开发', 'AI/算法', '移动端开发', 'UI/设计', '测试', '综合服务'];

const ROLE_COLOR: Record<string, string> = {
  '前端开发': 'bg-blue-500/20 text-blue-300',
  '后端开发': 'bg-purple-500/20 text-purple-300',
  '全栈开发': 'bg-indigo-500/20 text-indigo-300',
  '测试工程师': 'bg-green-500/20 text-green-300',
  'UI设计': 'bg-pink-500/20 text-pink-300',
  'AI算法': 'bg-orange-500/20 text-orange-300',
  '移动端开发': 'bg-cyan-500/20 text-cyan-300',
  '产品经理': 'bg-yellow-500/20 text-yellow-300',
  '项目经理': 'bg-slate-500/20 text-slate-300',
};

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
      ))}
      <span className="text-xs text-slate-400 ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

interface MemberRowProps {
  member: VendorMember;
  onChange: (m: VendorMember) => void;
  onRemove: () => void;
}
function MemberRow({ member, onChange, onRemove }: MemberRowProps) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
      <div className="col-span-2">
        <Input placeholder="姓名" value={member.name}
          onChange={e => onChange({ ...member, name: e.target.value })}
          className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-8" />
      </div>
      <div className="col-span-3">
        <Select value={member.role} onValueChange={v => onChange({ ...member, role: v as VendorMember['role'] })}>
          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {ROLE_OPTIONS.map(r => (
              <SelectItem key={r} value={r} className="text-slate-200">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-3">
        <Input placeholder="手机号" value={member.phone}
          onChange={e => onChange({ ...member, phone: e.target.value })}
          className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-8" />
      </div>
      <div className="col-span-3">
        <Input placeholder="备注（可选）" value={member.remark || ''}
          onChange={e => onChange({ ...member, remark: e.target.value })}
          className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-8" />
      </div>
      <div className="col-span-1 flex justify-center">
        <button onClick={onRemove} className="text-slate-500 hover:text-red-400 transition-colors mt-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface VendorFormProps {
  open: boolean;
  onClose: () => void;
  initial?: Vendor | null;
  onSave: (v: Vendor) => void;
}
function VendorFormDialog({ open, onClose, initial, onSave }: VendorFormProps) {
  const isEdit = !!initial;
  const makeEmpty = (): Vendor => ({
    id: `V-${Date.now()}`, name: '', contact: '', phone: '', email: '', type: '全栈开发',
    address: '', remark: '', activeProjects: 0, totalAmount: 0, rating: 5, members: []
  });
  const [form, setForm] = useState<Vendor>(() => initial || makeEmpty());
  const [entityType, setEntityType] = useState<VendorEntityType>('公司/团队');

  const handleOpenChange = (v: boolean) => {
    if (!v) { onClose(); return; }
    setForm(initial || makeEmpty());
  };

  const updateField = (k: keyof Vendor, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const addMember = () => {
    const m: VendorMember = { id: `VM-${Date.now()}`, name: '', role: '前端开发', phone: '', remark: '' };
    setForm(f => ({ ...f, members: [...f.members, m] }));
  };

  const updateMember = (idx: number, m: VendorMember) => {
    setForm(f => { const ms = [...f.members]; ms[idx] = m; return { ...f, members: ms }; });
  };

  const removeMember = (idx: number) => {
    setForm(f => ({ ...f, members: f.members.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error(entityType === '个体' ? '请填写姓名' : '请填写供应商名称'); return; }
    if (entityType === '公司/团队' && !form.contact.trim()) { toast.error('请填写主联系人'); return; }
    if (!form.phone.trim()) { toast.error('请填写联系电话'); return; }
    for (const m of form.members) {
      if (!m.name.trim()) { toast.error('成员姓名不能为空'); return; }
      if (!m.phone.trim()) { toast.error(`成员 ${m.name || '?'} 的手机号不能为空`); return; }
    }
    onSave(form);
    toast.success(isEdit ? '供应商信息已更新' : '供应商已添加');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-100">
            {isEdit ? '编辑供应商' : '新增供应商'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div>
            {/* 主体类型切换 */}
            <div className="flex gap-2 mb-4">
              {(['公司/团队', '个体'] as VendorEntityType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEntityType(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    entityType === t
                      ? t === '公司/团队'
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'text-slate-500 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {t === '公司/团队' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  {t}
                </button>
              ))}
              {entityType === '个体' && (
                <span className="text-xs text-amber-400/70 self-center ml-1">· 适用于个人接单、私下转账场景</span>
              )}
            </div>
            <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
              {entityType === '公司/团队' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {entityType === '公司/团队' ? '公司基本信息' : '个体基本信息'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-slate-300 text-sm">
                  {entityType === '公司/团队' ? '供应商名称' : '姓名'} <span className="text-red-400">*</span>
                </Label>
                <Input value={form.name} onChange={e => updateField('name', e.target.value)}
                  placeholder={entityType === '公司/团队' ? '请输入公司/团队名称' : '请输入真实姓名'}
                  className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">擅长领域 <span className="text-red-400">*</span></Label>
                <Select value={form.type} onValueChange={v => updateField('type', v)}>
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {TYPE_OPTIONS.map(t => (
                      <SelectItem key={t} value={t} className="text-slate-200">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {entityType === '公司/团队' && (
                <div>
                  <Label className="text-slate-300 text-sm">主联系人 <span className="text-red-400">*</span></Label>
                  <Input value={form.contact} onChange={e => updateField('contact', e.target.value)}
                    placeholder="姓名" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
                </div>
              )}
              <div>
                <Label className="text-slate-300 text-sm">联系电话 <span className="text-red-400">*</span></Label>
                <Input value={form.phone} onChange={e => updateField('phone', e.target.value)}
                  placeholder="138-xxxx-xxxx" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">邮箱</Label>
                <Input value={form.email || ''} onChange={e => updateField('email', e.target.value)}
                  placeholder="example@company.com" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
              </div>
              {entityType === '公司/团队' && (
                <div className="col-span-2">
                  <Label className="text-slate-300 text-sm">公司地址</Label>
                  <Input value={form.address || ''} onChange={e => updateField('address', e.target.value)}
                    placeholder="省市区详细地址" className="mt-1 bg-slate-800 border-slate-700 text-slate-100" />
                </div>
              )}
              <div className="col-span-2">
                <Label className="text-slate-300 text-sm">备注</Label>
                <Textarea value={form.remark || ''} onChange={e => updateField('remark', e.target.value)}
                  placeholder="合作注意事项、优势特点等" rows={2}
                  className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-blue-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> 成员信息
                <span className="text-slate-500 font-normal text-xs">（可选，可后续维护）</span>
              </h3>
              <Button size="sm" variant="outline" onClick={addMember}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 h-7 text-xs gap-1">
                <UserPlus className="w-3.5 h-3.5" /> 添加成员
              </Button>
            </div>
            {form.members.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-700 rounded-lg">
                暂无成员，点击「添加成员」录入
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 px-3 text-xs text-slate-500">
                  <div className="col-span-2">姓名</div>
                  <div className="col-span-3">角色</div>
                  <div className="col-span-3">手机号</div>
                  <div className="col-span-3">备注</div>
                  <div className="col-span-1"></div>
                </div>
                {form.members.map((m, idx) => (
                  <MemberRow key={m.id} member={m}
                    onChange={updated => updateMember(idx, updated)}
                    onRemove={() => removeMember(idx)} />
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800">取消</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isEdit ? '保存修改' : '确认添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface VendorCardProps {
  vendor: Vendor;
  onEdit: () => void;
  onDelete: () => void;
}
function VendorCard({ vendor, onEdit, onDelete }: VendorCardProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">{vendor.name}</h3>
              <Badge className="mt-0.5 text-xs bg-slate-700/60 text-slate-300 border-0">{vendor.type}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onEdit}
              className="h-7 w-7 p-0 text-slate-400 hover:text-blue-400 hover:bg-slate-700">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}
              className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-700">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <StarRating value={vendor.rating} />
        <div className="mt-3 space-y-1.5 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{vendor.contact} · {vendor.phone}</span>
          </div>
          {vendor.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{vendor.email}</span>
            </div>
          )}
          {vendor.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{vendor.address}</span>
            </div>
          )}
        </div>
        {vendor.remark && (
          <p className="mt-3 text-xs text-slate-500 bg-slate-900/40 rounded-lg px-3 py-2 leading-relaxed">
            {vendor.remark}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-slate-500 text-xs">在执项目</span>
              <p className="font-semibold text-slate-200">{vendor.activeProjects} 个</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">累计合作</span>
              <p className="font-semibold text-slate-200">¥{(vendor.totalAmount / 10000).toFixed(1)}万</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">成员数</span>
              <p className="font-semibold text-slate-200">{vendor.members.length} 人</p>
            </div>
          </div>
          {vendor.members.length > 0 && (
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <Users className="w-3.5 h-3.5" />
              {expanded ? '收起成员' : '查看成员'}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
      {expanded && vendor.members.length > 0 && (
        <div className="border-t border-slate-700/50 bg-slate-900/30 px-5 py-4">
          <div className="space-y-2">
            {vendor.members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{m.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${ROLE_COLOR[m.role] || 'bg-slate-600/30 text-slate-400'}`}>
                      {m.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span>{m.phone}</span>
                    {m.remark && <span className="truncate">· {m.remark}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorsPage() {
  const [vendorList, setVendorList] = useState<Vendor[]>(initialVendors);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');

  const filtered = vendorList.filter(v =>
    v.name.includes(search) || v.type.includes(search) || v.contact.includes(search)
  );

  const handleAdd = () => { setEditTarget(null); setFormOpen(true); };
  const handleEdit = (v: Vendor) => { setEditTarget(v); setFormOpen(true); };
  const handleDelete = (v: Vendor) => setDeleteTarget(v);

  const handleSave = (v: Vendor) => {
    setVendorList(list => {
      const idx = list.findIndex(x => x.id === v.id);
      if (idx >= 0) { const nl = [...list]; nl[idx] = v; return nl; }
      return [...list, v];
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setVendorList(list => list.filter(v => v.id !== deleteTarget.id));
    toast.success(`已删除供应商「${deleteTarget.name}」`);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">供应商管理</h1>
          <p className="text-sm text-slate-400 mt-0.5">管理合作商公司及成员信息，共 {vendorList.length} 家</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> 新增供应商
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '供应商总数', value: vendorList.length + ' 家', icon: Building2, color: 'text-blue-400' },
          { label: '在执项目', value: vendorList.reduce((s, v) => s + v.activeProjects, 0) + ' 个', icon: Briefcase, color: 'text-green-400' },
          { label: '成员总数', value: vendorList.reduce((s, v) => s + v.members.length, 0) + ' 人', icon: Users, color: 'text-purple-400' },
          { label: '累计合作金额', value: '¥' + (vendorList.reduce((s, v) => s + v.totalAmount, 0) / 10000).toFixed(0) + '万', icon: Star, color: 'text-yellow-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              {stat.label}
            </div>
            <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Input placeholder="搜索供应商名称、类型或联系人..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="max-w-sm bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500" />
        {search && <span className="text-sm text-slate-400">找到 {filtered.length} 条结果</span>}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>暂无供应商数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {filtered.map(v => (
            <VendorCard key={v.id} vendor={v}
              onEdit={() => handleEdit(v)}
              onDelete={() => handleDelete(v)} />
          ))}
        </div>
      )}

      <VendorFormDialog open={formOpen} onClose={() => setFormOpen(false)}
        initial={editTarget} onSave={handleSave} />

      <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-100">确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-sm">
            确定要删除供应商「<span className="text-slate-200 font-medium">{deleteTarget?.name}</span>」吗？
            此操作不可撤销，该供应商下的 {deleteTarget?.members.length} 名成员信息也将一并删除。
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800">取消</Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
