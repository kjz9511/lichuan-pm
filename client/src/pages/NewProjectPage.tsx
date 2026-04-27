// 厉川外包项目管理平台 — 新建项目立项单
import { cn } from '@/lib/utils';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NewProjectPageProps {
  onBack: () => void;
}

const PROJECT_TYPES = ['软件开发', 'UI/UX设计', '系统集成', '数据分析', 'AI/算法', '运维服务', '其他'];
const MEMBERS = ['张伟', '刘芳', '陈建国', '李小白', '王六子', '陈东阳', '周小明', '赵大锤'];

export default function NewProjectPage({ onBack }: NewProjectPageProps) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    manager: '张伟',
    members: [] as string[],
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
  });
  const [step, setStep] = useState<'form' | 'review' | 'submitted'>('form');

  function toggleMember(m: string) {
    setForm(f => ({
      ...f,
      members: f.members.includes(m) ? f.members.filter(x => x !== m) : [...f.members, m],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error('请填写必填项');
      return;
    }
    setStep('review');
  }

  if (step === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <div className="text-lg font-bold text-foreground mb-2">立项申请已提交</div>
        <div className="text-sm text-muted-foreground mb-2">项目编号：PRJ-2026-006（系统自动生成）</div>
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
              { label: '项目成员', value: form.members.join('、') || '暂无' },
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

        {/* 审批流程预览 */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <div className="text-xs font-medium text-blue-400 mb-3">立项审批流程</div>
          <div className="flex items-center gap-2 text-xs">
            {['您（发起）', '部门负责人', '公司负责人', '立项通过'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={cn(
                  'px-2.5 py-1 rounded-full text-[10px] font-medium',
                  i === 0 ? 'bg-blue-600/30 text-blue-400' : 'bg-secondary text-muted-foreground'
                )}>{step}</div>
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        返回
      </button>

      <div className="mb-6">
        <div className="text-lg font-bold text-foreground">新建项目立项单</div>
        <div className="text-xs text-muted-foreground mt-1">项目编号将由系统自动生成，立项通过后解锁所有操作权限</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* 项目成员 */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">项目成员（多选）</label>
          <div className="flex flex-wrap gap-2">
            {MEMBERS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMember(m)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs border transition-colors',
                  form.members.includes(m)
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                    : 'bg-secondary text-muted-foreground border-border hover:border-border/80'
                )}
              >
                {m}
              </button>
            ))}
          </div>
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

        {/* 附件 */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">立项附件</label>
          <button
            type="button"
            onClick={() => toast.info('文件上传功能即将上线')}
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
    </div>
  );
}
