// 厉川外包项目管理平台 — 新建项目立项单
// 项目成员支持：多选人员 + 选择角色（开发/前端/测试等）+ 填写备注

import { cn } from '@/lib/utils';
import { ArrowLeft, ChevronDown, Plus, Trash2, Upload, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NewProjectPageProps {
  onBack: () => void;
}

const PROJECT_TYPES = ['软件开发', 'UI/UX设计', '系统集成', '数据分析', 'AI/算法', '运维服务', '其他'];

// 可选人员池
const MEMBER_POOL = [
  { name: '张伟', dept: '产品部' },
  { name: '刘芳', dept: '产品部' },
  { name: '陈建国', dept: '技术部' },
  { name: '李小白', dept: '产品部' },
  { name: '王六子', dept: '设计部' },
  { name: '陈东阳', dept: '测试部' },
  { name: '周小明', dept: '技术部' },
  { name: '赵大锤', dept: '技术部' },
  { name: '吴测试', dept: '测试部' },
  { name: '孙小白', dept: '产品部' },
];

// 成员角色选项
const MEMBER_ROLES = [
  '项目经理',
  '产品经理',
  '前端开发',
  '后端开发',
  '全栈开发',
  'UI设计',
  '测试工程师',
  '运维工程师',
  '数据分析',
  '架构师',
  '其他',
];

interface ProjectMember {
  name: string;
  dept: string;
  role: string;
  remark: string;
}

export default function NewProjectPage({ onBack }: NewProjectPageProps) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    manager: '张伟',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
  });
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [step, setStep] = useState<'form' | 'review' | 'submitted'>('form');

  // 添加成员
  function addMember(person: { name: string; dept: string }) {
    if (members.find(m => m.name === person.name)) {
      toast.error(`${person.name} 已在成员列表中`);
      return;
    }
    setMembers(prev => [...prev, { name: person.name, dept: person.dept, role: '前端开发', remark: '' }]);
    setShowMemberPicker(false);
  }

  // 移除成员
  function removeMember(name: string) {
    setMembers(prev => prev.filter(m => m.name !== name));
  }

  // 更新成员角色
  function updateMemberRole(name: string, role: string) {
    setMembers(prev => prev.map(m => m.name === name ? { ...m, role } : m));
  }

  // 更新成员备注
  function updateMemberRemark(name: string, remark: string) {
    setMembers(prev => prev.map(m => m.name === name ? { ...m, remark } : m));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error('请填写必填项：项目名称、计划开始时间、计划结束时间');
      return;
    }
    setStep('review');
  }

  // ===== 提交成功页 =====
  if (step === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <div className="text-3xl text-emerald-400">✓</div>
        </div>
        <div className="text-lg font-bold text-foreground mb-2">立项申请已提交</div>
        <div className="text-sm text-muted-foreground mb-2">项目编号：PRJ-2026-006（系统自动生成）</div>
        <div className="text-xs text-muted-foreground mb-1">共 {members.length} 名项目成员已录入</div>
        <div className="text-xs text-muted-foreground mb-6">
          审批流程：<span className="text-blue-400">部门负责人审批</span> → <span className="text-muted-foreground">公司负责人终审</span> → <span className="text-muted-foreground">立项通过</span>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          返回项目台账
        </button>
      </div>
    );
  }

  // ===== 确认信息页 =====
  if (step === 'review') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={() => setStep('form')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          返回修改
        </button>

        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <div className="text-base font-bold text-foreground mb-4">确认立项信息</div>
          <div className="space-y-3">
            {[
              { label: '项目名称', value: form.name },
              { label: '项目类型', value: form.type || '未选择' },
              { label: '项目经理', value: form.manager },
              { label: '计划时间', value: `${form.startDate} ~ ${form.endDate}` },
              { label: '项目预算', value: form.budget ? `¥${Number(form.budget).toLocaleString()}` : '未填写' },
              { label: '项目简介', value: form.description || '未填写' },
            ].map(item => (
              <div key={item.label} className="flex gap-4 py-2 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{item.label}</span>
                <span className="text-xs text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 项目成员确认 */}
        {members.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="text-sm font-semibold text-foreground mb-3">项目成员（{members.length} 人）</div>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.name} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground">{m.dept}</span>
                      <span className="px-1.5 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] rounded">{m.role}</span>
                    </div>
                    {m.remark && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">备注：{m.remark}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 审批流程预览 */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <div className="text-xs font-medium text-blue-400 mb-3">立项审批流程</div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {['您（发起）', '部门负责人', '公司负责人', '立项通过'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'px-2.5 py-1 rounded-full text-[10px] font-medium',
                  i === 0 ? 'bg-blue-600/30 text-blue-400' : 'bg-secondary text-muted-foreground'
                )}>{s}</div>
                {i < 3 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep('submitted')}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          确认提交立项申请
        </button>
      </div>
    );
  }

  // ===== 主表单页 =====
  const availableMembers = MEMBER_POOL.filter(p => !members.find(m => m.name === p.name));

  return (
    <div className="p-6 max-w-2xl mx-auto pb-12">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        返回
      </button>

      <div className="mb-6">
        <div className="text-lg font-bold text-foreground">新建项目立项单</div>
        <div className="text-xs text-muted-foreground mt-1">项目编号将由系统自动生成，立项通过后解锁所有操作权限</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── 基础信息 ── */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">基础信息</div>

          {/* 项目名称 */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              项目名称 <span className="text-red-400">★</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="请输入项目名称"
              className="w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 项目类型 */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">项目类型</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs border transition-colors',
                    form.type === t
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                      : 'bg-secondary text-muted-foreground border-border hover:border-border/80'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 项目经理 */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              项目经理 <span className="text-red-400">★</span>
            </label>
            <select
              value={form.manager}
              onChange={e => setForm(f => ({ ...f, manager: e.target.value }))}
              className="w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {MEMBER_POOL.map(m => <option key={m.name} value={m.name}>{m.name}（{m.dept}）</option>)}
            </select>
          </div>

          {/* 时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                计划开始时间 <span className="text-red-400">★</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                计划结束时间 <span className="text-red-400">★</span>
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* 预算 */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">项目总预算（元）</label>
            <input
              type="number"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="请输入预算金额"
              className="w-full h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 简介 */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">项目简介</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="请简要描述项目背景、目标和范围..."
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </div>

        {/* ── 项目成员 ── */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">项目成员</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">为每位成员选择角色分工，并可填写具体负责内容备注</div>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMemberPicker(!showMemberPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs hover:bg-blue-600/30 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                添加成员
                <ChevronDown className={cn('w-3 h-3 transition-transform', showMemberPicker && 'rotate-180')} />
              </button>

              {/* 人员选择下拉 */}
              {showMemberPicker && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="text-[10px] font-medium text-muted-foreground">选择人员（{availableMembers.length} 人可选）</div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableMembers.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-muted-foreground text-center">所有人员已添加</div>
                    ) : (
                      availableMembers.map(p => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => addMember(p)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                        >
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                            {p.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-foreground">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground">{p.dept}</div>
                          </div>
                          <Plus className="w-3 h-3 text-blue-400 ml-auto" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 已添加成员列表 */}
          {members.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-lg py-6 flex flex-col items-center gap-2">
              <UserPlus className="w-6 h-6 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">点击「添加成员」选择项目参与人员</div>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((m, idx) => (
                <div key={m.name} className="bg-secondary/40 border border-border/60 rounded-xl p-3">
                  {/* 成员头部：头像 + 姓名 + 部门 + 删除 */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                      {m.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-foreground">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.dept}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(m.name)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 角色选择 */}
                  <div className="mb-2">
                    <div className="text-[10px] text-muted-foreground mb-1.5">负责角色</div>
                    <div className="flex flex-wrap gap-1.5">
                      {MEMBER_ROLES.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => updateMemberRole(m.name, r)}
                          className={cn(
                            'px-2 py-1 rounded text-[10px] border transition-colors',
                            m.role === r
                              ? 'bg-blue-600/25 text-blue-400 border-blue-500/40 font-medium'
                              : 'bg-secondary text-muted-foreground border-border/50 hover:border-border'
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 备注 */}
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1">负责内容备注（选填）</div>
                    <input
                      type="text"
                      value={m.remark}
                      onChange={e => updateMemberRemark(m.name, e.target.value)}
                      placeholder={`例：负责${m.role}相关工作，具体包括...`}
                      className="w-full h-8 px-2.5 bg-input border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 立项附件 ── */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">立项附件</div>
          <button
            type="button"
            onClick={() => toast.info('文件上传功能将在二期上线')}
            className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1.5 hover:border-blue-500/50 transition-colors"
          >
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">点击上传附件（支持多文件）</span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          下一步：确认信息
        </button>
      </form>

      {/* 点击空白关闭下拉 */}
      {showMemberPicker && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMemberPicker(false)} />
      )}
    </div>
  );
}
