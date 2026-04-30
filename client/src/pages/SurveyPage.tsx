// 厉川外包项目管理平台 — 系统调研问卷
// 风格：深色专业管理台风，与主系统一致
import { useState } from 'react';
import { CheckCircle2, ChevronRight, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = ['老板 / 管理层', '项目经理（PM）', '财务 / 结算', '外包供应商 / 合作团队', '其他'];

const FEATURES = [
  { id: 'project', label: '项目立项与台账' },
  { id: 'stage', label: '项目阶段推进' },
  { id: 'contract', label: '合同管理（甲方 & 外协）' },
  { id: 'invoice', label: '发票与结算审批' },
  { id: 'milestone', label: '里程碑 & 交付物' },
  { id: 'vendor', label: '供应商管理' },
  { id: 'dashboard', label: '各角色仪表盘' },
];

const RATINGS = [1, 2, 3, 4, 5];

interface FormData {
  name: string;
  role: string;
  roleOther: string;
  ratings: Record<string, number>;
  missing: string;
  redundant: string;
  pain: string;
  overall: number;
  suggestion: string;
}

const INIT: FormData = {
  name: '',
  role: '',
  roleOther: '',
  ratings: {},
  missing: '',
  redundant: '',
  pain: '',
  overall: 0,
  suggestion: '',
};

function RatingBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const labels = ['很差', '较差', '一般', '较好', '很好'];
  return (
    <div className="flex items-center gap-2">
      {RATINGS.map(r => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${
            value === r
              ? 'bg-blue-600 border-blue-500 text-white scale-110'
              : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-blue-500/60 hover:text-blue-400'
          }`}
        >
          {r}
        </button>
      ))}
      {value > 0 && (
        <span className="text-xs text-muted-foreground ml-1">{labels[value - 1]}</span>
      )}
    </div>
  );
}

export default function SurveyPage() {
  const [form, setForm] = useState<FormData>(INIT);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1); // 1: 基本信息, 2: 功能评分, 3: 开放问题

  const set = (key: keyof FormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const setRating = (id: string, value: number) =>
    setForm(prev => ({ ...prev, ratings: { ...prev.ratings, [id]: value } }));

  const canNext1 = form.role !== '' && (form.role !== '其他' || form.roleOther.trim() !== '');
  const canNext2 = FEATURES.every(f => (form.ratings[f.id] ?? 0) > 0);

  const handleSubmit = () => {
    if (form.overall === 0) { toast.error('请为系统整体打分'); return; }
    setSubmitted(true);
    toast.success('感谢您的反馈！');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground mb-2">感谢您的参与！</div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              您的反馈已记录，将作为系统优化和开发排期的重要依据。<br />
              如有补充，欢迎随时联系项目负责人。
            </div>
          </div>
          <button
            onClick={() => { setForm(INIT); setSubmitted(false); setStep(1); }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
          >
            重新填写
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">厉川外包项目管理系统 · 调研问卷</div>
            <div className="text-xs text-muted-foreground">预计填写时间 3～5 分钟，感谢您的参与</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 h-1 rounded-full transition-all ${step >= s ? 'bg-blue-500' : 'bg-slate-700'}`} />
            </div>
          ))}
          <span className="text-xs text-muted-foreground shrink-0">{step}/3</span>
        </div>

        {/* Step 1: 基本信息 */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="text-sm font-semibold text-foreground">第一步：基本信息</div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">您的姓名（选填）</label>
              <input
                type="text"
                placeholder="方便后续跟进反馈"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">您在公司的角色 <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set('role', r)}
                    className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                      form.role === r
                        ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {form.role === '其他' && (
                <input
                  type="text"
                  placeholder="请说明您的角色"
                  value={form.roleOther}
                  onChange={e => set('roleOther', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors mt-2"
                />
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canNext1}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              下一步 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: 功能评分 */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="text-sm font-semibold text-foreground">第二步：功能模块评分</div>
            <div className="text-xs text-muted-foreground">请对以下功能模块的实用性打分（1～5 分）</div>

            <div className="space-y-4">
              {FEATURES.map(f => (
                <div key={f.id} className="space-y-2">
                  <div className="text-xs font-medium text-foreground">{f.label}</div>
                  <RatingBar value={form.ratings[f.id] ?? 0} onChange={v => setRating(f.id, v)} />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
              >
                上一步
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canNext2}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                下一步 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 开放问题 */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="text-sm font-semibold text-foreground">第三步：开放反馈</div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">您觉得系统缺少哪些功能？（选填）</label>
              <textarea
                rows={3}
                placeholder="例如：缺少工时统计、缺少微信通知提醒..."
                value={form.missing}
                onChange={e => set('missing', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">您觉得哪些功能用不上或过于复杂？（选填）</label>
              <textarea
                rows={3}
                placeholder="例如：供应商评分用不上、立项步骤太多..."
                value={form.redundant}
                onChange={e => set('redundant', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">目前工作中最痛的管理问题是什么？（选填）</label>
              <textarea
                rows={3}
                placeholder="例如：合同找不到、不知道回款进度、外包商交付物乱..."
                value={form.pain}
                onChange={e => set('pain', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">系统整体评分 <span className="text-red-400">*</span></label>
              <RatingBar value={form.overall} onChange={v => set('overall', v)} />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">其他建议（选填）</label>
              <textarea
                rows={3}
                placeholder="任何想说的都可以写..."
                value={form.suggestion}
                onChange={e => set('suggestion', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                提交反馈
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground pb-4">
          厉川外包项目管理平台 · 内部调研专用
        </div>
      </div>
    </div>
  );
}
