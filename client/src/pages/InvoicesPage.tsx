// 设计风格：深色专业管理台风 - 发票与结算页
// 流程：外包提交发票 → 老板审批 → 财务出纳付款，状态实时更新

import { useState, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { Invoice, projects, contracts } from '@/lib/mockData';
import { useInvoices } from '@/contexts/InvoiceContext';
import { usePaymentRequests, PaymentRequest } from '@/contexts/PaymentRequestContext';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Receipt, Plus, CheckCircle2, XCircle, CreditCard, Clock, AlertCircle, Circle, ChevronRight,
  FileText, Building2, Calendar, ChevronDown, ChevronUp, Eye, Bot, Sparkles, ShieldAlert,
  ScanLine, ArrowRightLeft, CheckCheck, Bell
} from 'lucide-react';

// ── 状态配置 ────────────────────────────────────────────────
const STATUS_CONFIG = {
  '待审批': { color: 'bg-yellow-500/20 text-yellow-300', icon: Clock, label: '待审批' },
  '已审批': { color: 'bg-blue-500/20 text-blue-300', icon: CheckCircle2, label: '已审批' },
  '已付款': { color: 'bg-green-500/20 text-green-300', icon: CheckCircle2, label: '已付款' },
  '已驳回': { color: 'bg-red-500/20 text-red-300', icon: XCircle, label: '已驳回' },
} as const;

// ── 提交发票表单 ────────────────────────────────────────────
interface SubmitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (inv: Invoice) => void;
}
function SubmitInvoiceDialog({ open, onClose, onSubmit }: SubmitFormProps) {
  const [form, setForm] = useState({
    projectId: '', contractId: '', amount: '', remark: ''
  });

  const selectedProject = projects.find(p => p.id === form.projectId);
  const relatedContracts = contracts.filter(c => c.projectId === form.projectId && c.type === '外包协议');

  const handleSubmit = () => {
    if (!form.projectId) { toast.error('请选择关联项目'); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      toast.error('请填写有效的发票金额'); return;
    }
    const now = new Date().toISOString().slice(0, 10);
    const newInv: Invoice = {
      id: `INV-${Date.now()}`,
      projectId: form.projectId,
      projectName: selectedProject?.name || '',
      contractId: form.contractId || undefined,
      vendor: '星辰前端工作室',  // 当前登录供应商
      amount: Number(form.amount),
      submitDate: now,
      status: '待审批',
      remark: form.remark || undefined,
    };
    onSubmit(newInv);
    toast.success('发票已提交，等待老板审批');
    setForm({ projectId: '', contractId: '', amount: '', remark: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" /> 提交发票申请
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-slate-300 text-sm">关联项目 <span className="text-red-400">*</span></Label>
            <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v, contractId: '' }))}>
              <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-slate-200">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {relatedContracts.length > 0 && (
            <div>
              <Label className="text-slate-300 text-sm">关联外协合同（可选）</Label>
              <Select value={form.contractId} onValueChange={v => setForm(f => ({ ...f, contractId: v }))}>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="选择合同（可选）" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {relatedContracts.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-slate-200">
                      {c.contractName}（¥{(c.amount / 10000).toFixed(0)}万）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-slate-300 text-sm">发票金额（元）<span className="text-red-400">*</span></Label>
            <Input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="请输入金额，如 50000"
              className="mt-1 bg-slate-800 border-slate-700 text-slate-100" type="number" />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">备注说明</Label>
            <Textarea value={form.remark} onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
              placeholder="说明本次发票对应的工作内容、里程碑节点等..."
              rows={3} className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800">取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Receipt className="w-4 h-4" /> 提交发票
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ── AI 异常检测面板 ─────────────────────────────────────────
interface AICheckPanelProps {
  invoice: Invoice;
  allInvoices: Invoice[];
}
function AICheckPanel({ invoice, allInvoices }: AICheckPanelProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const { run: runAI, loading } = useAI({ stream: true });

  const handleCheck = async () => {
    setOpen(true);
    setSummary('');
    setRiskLevel(null);

    // 同项目历史发票
    const sameProject = allInvoices.filter(i => i.projectId === invoice.projectId && i.id !== invoice.id);
    const sameVendor = allInvoices.filter(i => i.vendor === invoice.vendor && i.id !== invoice.id);
    const totalPaid = sameVendor.filter(i => i.status === '已付款').reduce((s, i) => s + i.amount, 0);
    const relatedContract = allInvoices.find(i => i.contractId && i.contractId === invoice.contractId);

    const historyText = sameProject.length > 0
      ? sameProject.map(i => `${i.id}：¥${i.amount.toLocaleString()}，${i.status}，${i.submitDate}`).join('；')
      : '无历史发票';

    const prompt = `你是一位专业的财务风险审核员。请对以下发票进行异常检测分析，输出3个部分：
1. 【风险等级】只输出"低风险"、"中风险"或"高风险"之一，后跟一句理由
2. 【异常检测】列出检测到的异常点（如金额异常、重复提交、超出合同范围等），若无异常则说明"未发现异常"
3. 【审批建议】给出1-2条具体的审批建议

待审发票信息：
- 发票编号：${invoice.id}
- 供应商：${invoice.vendor}
- 关联项目：${invoice.projectName}
- 发票金额：¥${invoice.amount.toLocaleString()}
- 提交日期：${invoice.submitDate}
- 备注：${invoice.remark || '无'}

同项目历史发票：${historyText}
该供应商累计已付款：¥${totalPaid.toLocaleString()}
本次发票占供应商累计付款比例：${totalPaid > 0 ? ((invoice.amount / (totalPaid + invoice.amount)) * 100).toFixed(0) + '%' : '首次开票'}

请用中文回答，语言简洁专业。`;

    let fullText = '';
    await runAI(
      [
        { role: 'system', content: '你是厉川外包项目管理平台的AI财务审核助手，专注于发票异常检测与风险识别。' },
        { role: 'user', content: prompt }
      ],
      (chunk) => {
        fullText += chunk;
        setSummary(fullText);
        // 动态识别风险等级
        if (fullText.includes('高风险')) setRiskLevel('high');
        else if (fullText.includes('中风险')) setRiskLevel('medium');
        else if (fullText.includes('低风险')) setRiskLevel('low');
      }
    );
  };

  const riskColors = {
    low: 'bg-green-500/10 border-green-500/20 text-green-400',
    medium: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/10 border-red-500/20 text-red-400',
  };

  return (
    <div className="mt-2">
      {!open ? (
        <button
          onClick={handleCheck}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI 异常检测
        </button>
      ) : (
        <div className={`rounded-lg border p-3 space-y-2 ${riskLevel ? riskColors[riskLevel] : 'bg-blue-950/30 border-blue-500/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Bot className="w-3.5 h-3.5" />
              <span>AI 异常检测</span>
              {loading && <span className="text-slate-500 animate-pulse">· 检测中...</span>}
              {riskLevel && !loading && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  riskLevel === 'high' ? 'bg-red-500/20 text-red-300' :
                  riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {riskLevel === 'high' ? '高风险' : riskLevel === 'medium' ? '中风险' : '低风险'}
                </span>
              )}
            </div>
            <button onClick={() => { setOpen(false); setSummary(''); setRiskLevel(null); }}
              className="text-xs text-slate-600 hover:text-slate-400">收起</button>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {summary || (loading ? '正在检测发票异常...' : '')}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 审批弹窗 ────────────────────────────────────────────────
interface ApproveDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}
function ApproveDialog({ open, onClose, invoice, onApprove, onReject }: ApproveDialogProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [mode, setMode] = useState<'view' | 'reject'>('view');

  if (!invoice) return null;

  const handleApprove = () => {
    onApprove(invoice.id);
    toast.success(`发票 ${invoice.id} 已审批通过`);
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) { toast.error('请填写驳回原因'); return; }
    onReject(invoice.id, rejectReason);
    toast.info(`发票 ${invoice.id} 已驳回`);
    onClose();
    setRejectReason('');
    setMode('view');
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); setMode('view'); setRejectReason(''); } }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">发票审批</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="bg-slate-800/60 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">发票编号</span>
              <span className="text-slate-200 font-mono">{invoice.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">供应商</span>
              <span className="text-slate-200">{invoice.vendor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">关联项目</span>
              <span className="text-slate-200">{invoice.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">发票金额</span>
              <span className="text-green-400 font-semibold text-base">¥{invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">提交日期</span>
              <span className="text-slate-200">{invoice.submitDate}</span>
            </div>
            {invoice.remark && (
              <div className="pt-2 border-t border-slate-700">
                <span className="text-slate-500">备注：</span>
                <span className="text-slate-300">{invoice.remark}</span>
              </div>
            )}
          </div>
          {mode === 'reject' && (
            <div>
              <Label className="text-slate-300 text-sm">驳回原因 <span className="text-red-400">*</span></Label>
              <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="请说明驳回原因..." rows={3}
                className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          {mode === 'view' ? (
            <>
              <Button variant="outline" onClick={() => setMode('reject')}
                className="border-red-800 text-red-400 hover:bg-red-900/20">驳回</Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <CheckCircle2 className="w-4 h-4" /> 审批通过
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setMode('view')}
                className="border-slate-600 text-slate-300 hover:bg-slate-800">返回</Button>
              <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <XCircle className="w-4 h-4" /> 确认驳回
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 付款弹窗 ────────────────────────────────────────────────
interface PayDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPay: (id: string, voucher: string) => void;
}
function PayDialog({ open, onClose, invoice, onPay }: PayDialogProps) {
  const [voucher, setVoucher] = useState('');

  if (!invoice) return null;

  const handlePay = () => {
    if (!voucher.trim()) { toast.error('请填写付款凭证说明'); return; }
    onPay(invoice.id, voucher);
    toast.success(`发票 ${invoice.id} 付款完成，已记录凭证`);
    onClose();
    setVoucher('');
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); setVoucher(''); } }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-400" /> 出纳付款
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="bg-slate-800/60 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">供应商</span>
              <span className="text-slate-200">{invoice.vendor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">付款金额</span>
              <span className="text-green-400 font-bold text-lg">¥{invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">审批人</span>
              <span className="text-slate-200">{invoice.approver || '老板'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">审批日期</span>
              <span className="text-slate-200">{invoice.approveDate}</span>
            </div>
          </div>
          <div>
            <Label className="text-slate-300 text-sm">付款凭证说明 <span className="text-red-400">*</span></Label>
            <Textarea value={voucher} onChange={e => setVoucher(e.target.value)}
              placeholder="填写银行转账流水号、付款时间等凭证信息..."
              rows={3} className="mt-1 bg-slate-800 border-slate-700 text-slate-100 resize-none" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800">取消</Button>
          <Button onClick={handlePay} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <CreditCard className="w-4 h-4" /> 确认付款
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ── OCR 发票识别 + 收付款申请审核弹窗 ─────────────────────────
interface PaymentReviewDialogProps {
  open: boolean;
  onClose: () => void;
  request: PaymentRequest | null;
  onApprove: (id: string, patch: Partial<PaymentRequest>) => void;
  onReject: (id: string, note: string) => void;
  onComplete: (id: string, voucher: string) => void;
}

function PaymentReviewDialog({ open, onClose, request, onApprove, onReject, onComplete }: PaymentReviewDialogProps) {
  const [step, setStep] = useState<'ocr' | 'review' | 'complete'>('ocr');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceTax, setInvoiceTax] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [voucher, setVoucher] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);

  if (!request) return null;

  const handleOCR = async () => {
    setOcrLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    // 模拟 OCR 识别结果
    setInvoiceNo('VAT-2026-' + Math.floor(Math.random() * 90000 + 10000));
    setInvoiceTax('91310000' + Math.floor(Math.random() * 90000000 + 10000000));
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setInvoiceAmount(String(request.amount));
    setOcrDone(true);
    setOcrLoading(false);
    toast.success('OCR 识别完成，请核对信息');
  };

  const handleApprove = () => {
    if (!invoiceNo || !invoiceAmount) { toast.error('请先完成 OCR 识别'); return; }
    onApprove(request.id, {
      status: '已审核',
      invoiceNo,
      invoiceTax,
      invoiceDate,
      invoiceAmount: Number(invoiceAmount),
      reviewer: '财务',
      reviewedAt: new Date().toISOString().slice(0, 10),
      reviewNote,
    });
    toast.success('已审核通过，等待完成付款');
    setStep('complete');
  };

  const handleComplete = () => {
    if (!voucher.trim()) { toast.error('请填写付款凭证'); return; }
    onComplete(request.id, voucher);
    toast.success('已标记完成，PM 将收到通知');
    onClose();
    resetForm();
  };

  const handleReject = () => {
    if (!rejectNote.trim()) { toast.error('请填写驳回原因'); return; }
    onReject(request.id, rejectNote);
    toast.success('已驳回，PM 将收到通知');
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep('ocr'); setOcrDone(false); setInvoiceNo(''); setInvoiceTax('');
    setInvoiceDate(''); setInvoiceAmount(''); setReviewNote(''); setVoucher('');
    setRejectNote(''); setShowReject(false);
  };

  const amountMatch = ocrDone && Number(invoiceAmount) === request.amount;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); resetForm(); } }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            {request.type === '收款' ? '收款' : '付款'}申请审核
          </DialogTitle>
        </DialogHeader>

        {/* 申请信息 */}
        <div className="bg-slate-800/60 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">合同</span>
            <span className="text-slate-200 text-right max-w-[200px] truncate">{request.contractName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">节点</span>
            <span className="text-slate-200">{request.stageName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">申请金额</span>
            <span className={`font-bold text-base ${request.type === '收款' ? 'text-emerald-400' : 'text-amber-400'}`}>
              ¥{request.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">发起人</span>
            <span className="text-slate-200">{request.initiator} · {request.initiatedAt}</span>
          </div>
          {request.pmNote && (
            <div className="flex justify-between items-start pt-1 border-t border-slate-700/50">
              <span className="text-slate-500 shrink-0">PM说明</span>
              <span className="text-slate-300 text-xs text-right max-w-[220px] leading-relaxed">{request.pmNote}</span>
            </div>
          )}
          {(request.acceptanceFile || request.deliveryFile || request.invoiceFile) && (
            <div className="pt-1 border-t border-slate-700/50 space-y-1.5">
              <span className="text-slate-500 text-xs">PM 上传附件</span>
              {request.acceptanceFile && (
                <div className="flex items-center gap-2 bg-slate-700/40 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">验收单</span>
                  <span className="text-xs text-slate-300 flex-1 truncate">{request.acceptanceFile}</span>
                  <button className="text-[10px] text-blue-400 hover:text-blue-300">查看</button>
                </div>
              )}
              {request.deliveryFile && (
                <div className="flex items-center gap-2 bg-slate-700/40 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">交付物确认单</span>
                  <span className="text-xs text-slate-300 flex-1 truncate">{request.deliveryFile}</span>
                  <button className="text-[10px] text-blue-400 hover:text-blue-300">查看</button>
                </div>
              )}
              {request.invoiceFile && (
                <div className="flex items-center gap-2 bg-slate-700/40 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">发票</span>
                  <span className="text-xs text-slate-300 flex-1 truncate">{request.invoiceFile}</span>
                  <button className="text-[10px] text-blue-400 hover:text-blue-300">查看</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 1: OCR */}
        {(step === 'ocr' || step === 'review') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-blue-400" /> 发票 OCR 识别
              </span>
              {!ocrDone && (
                <button onClick={handleOCR} disabled={ocrLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors disabled:opacity-50">
                  {ocrLoading ? <><span className="animate-spin">⟳</span> 识别中...</> : <><ScanLine className="w-3 h-3" /> 上传发票并识别</>}
                </button>
              )}
              {ocrDone && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCheck className="w-3 h-3" /> 识别完成</span>}
            </div>
            {ocrDone && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500">发票号</label>
                  <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)}
                    className="mt-0.5 w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">税号</label>
                  <input value={invoiceTax} onChange={e => setInvoiceTax(e.target.value)}
                    className="mt-0.5 w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">发票日期</label>
                  <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                    className="mt-0.5 w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 flex items-center gap-1">
                    发票金额
                    {ocrDone && (
                      amountMatch
                        ? <span className="text-emerald-400">✓ 与申请一致</span>
                        : <span className="text-red-400">⚠ 与申请不符</span>
                    )}
                  </label>
                  <input type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)}
                    className={`mt-0.5 w-full bg-slate-800 border text-slate-200 text-xs rounded-lg px-2 py-1.5 ${
                      ocrDone && !amountMatch ? 'border-red-500/50' : 'border-slate-700'
                    }`} />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-slate-500">审核备注（选填）</label>
              <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)}
                rows={2} placeholder="填写审核意见..."
                className="mt-0.5 w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 resize-none" />
            </div>
          </div>
        )}

        {/* Step 2: Complete */}
        {step === 'complete' && (
          <div className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm">
              <p className="text-emerald-400 font-medium flex items-center gap-2">
                <CheckCheck className="w-4 h-4" /> 已审核通过，请填写付款凭证后完成
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">付款凭证（银行流水号等）<span className="text-red-400">*</span></label>
              <textarea value={voucher} onChange={e => setVoucher(e.target.value)}
                rows={2} placeholder="填写银行转账流水号、付款时间等..."
                className="mt-0.5 w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 resize-none" />
            </div>
          </div>
        )}

        {/* 驳回表单 */}
        {showReject && (
          <div className="space-y-2 border-t border-red-500/20 pt-3">
            <label className="text-xs text-red-400">驳回原因 <span className="text-red-400">*</span></label>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              rows={2} placeholder="请填写驳回原因..."
              className="w-full bg-slate-800 border border-red-500/30 text-slate-200 text-xs rounded-lg px-2 py-1.5 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowReject(false)}
                className="flex-1 py-1.5 rounded-lg border border-slate-600 text-slate-400 text-xs hover:bg-slate-800 transition-colors">
                取消
              </button>
              <button onClick={handleReject}
                className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs transition-colors">
                确认驳回
              </button>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 flex-wrap">
          {step !== 'complete' && !showReject && (
            <>
              <button onClick={() => setShowReject(true)}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors">
                驳回
              </button>
              <button onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 text-xs hover:bg-slate-800 transition-colors">
                取消
              </button>
              <button onClick={handleApprove} disabled={!ocrDone}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors disabled:opacity-40 flex items-center gap-1.5">
                <CheckCheck className="w-3 h-3" /> 审核通过
              </button>
            </>
          )}
          {step === 'complete' && !showReject && (
            <>
              <button onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 text-xs hover:bg-slate-800 transition-colors">
                取消
              </button>
              <button onClick={handleComplete}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-colors flex items-center gap-1.5">
                <CheckCheck className="w-3 h-3" /> 标记完成并通知 PM
              </button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 发票详情弹窗 ────────────────────────────────────────────
interface DetailDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}
function DetailDialog({ open, onClose, invoice }: DetailDialogProps) {
  if (!invoice) return null;
  const cfg = STATUS_CONFIG[invoice.status];
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">发票详情</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="bg-slate-800/60 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">状态</span>
              <Badge className={`${cfg.color} border-0`}>{cfg.label}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">发票编号</span>
              <span className="text-slate-200 font-mono">{invoice.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">供应商</span>
              <span className="text-slate-200">{invoice.vendor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">关联项目</span>
              <span className="text-slate-200">{invoice.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">发票金额</span>
              <span className="text-green-400 font-bold text-base">¥{invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">提交日期</span>
              <span className="text-slate-200">{invoice.submitDate}</span>
            </div>
            {invoice.remark && (
              <div className="pt-2 border-t border-slate-700">
                <span className="text-slate-500">提交备注：</span>
                <span className="text-slate-300">{invoice.remark}</span>
              </div>
            )}
            {invoice.approver && (
              <div className="pt-2 border-t border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">审批人</span>
                  <span className="text-slate-200">{invoice.approver}</span>
                </div>
                {invoice.approveDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">审批日期</span>
                    <span className="text-slate-200">{invoice.approveDate}</span>
                  </div>
                )}
              </div>
            )}
            {invoice.rejectReason && (
              <div className="pt-2 border-t border-slate-700">
                <span className="text-red-400">驳回原因：</span>
                <span className="text-slate-300">{invoice.rejectReason}</span>
              </div>
            )}
            {invoice.payDate && (
              <div className="pt-2 border-t border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">付款日期</span>
                  <span className="text-slate-200">{invoice.payDate}</span>
                </div>
                {invoice.payVoucher && (
                  <div>
                    <span className="text-slate-500">付款凭证：</span>
                    <span className="text-slate-300">{invoice.payVoucher}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-slate-200">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 主页面 ──────────────────────────────────────────────────
export default function InvoicesPage() {
  const { role } = useRole();
  const { requests: paymentRequests, updateRequest: updatePaymentRequest } = usePaymentRequests();
  const { invoiceList, addInvoice: _addInvoice, updateInvoice: updateInvoiceCtx } = useInvoices();
  const [reviewTarget, setReviewTarget] = useState<PaymentRequest | null>(null);
  const [mainTab, setMainTab] = useState<'invoices' | 'requests'>('invoices');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<Invoice | null>(null);
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [detailTarget, setDetailTarget] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('全部');

  const stats = {
    total: invoiceList.length,
    pending: invoiceList.filter(i => i.status === '待审批').length,
    approved: invoiceList.filter(i => i.status === '已审批').length,
    paid: invoiceList.filter(i => i.status === '已付款').length,
    rejected: invoiceList.filter(i => i.status === '已驳回').length,
    totalPaid: invoiceList.filter(i => i.status === '已付款').reduce((s, i) => s + i.amount, 0),
  };

  const filtered = filterStatus === '全部' ? invoiceList : invoiceList.filter(i => i.status === filterStatus);

  const handleSubmit = (inv: Invoice) => {
    _addInvoice(inv);
  };

  const handleApprove = (id: string) => {
    const now = new Date().toISOString().slice(0, 10);
    updateInvoiceCtx(id, { status: '已审批', approver: '老板', approveDate: now });
  };

  const handleReject = (id: string, reason: string) => {
    updateInvoiceCtx(id, { status: '已驳回', rejectReason: reason });
  };

  const handlePay = (id: string, voucher: string) => {
    const now = new Date().toISOString().slice(0, 10);
    updateInvoiceCtx(id, { status: '已付款', payDate: now, payVoucher: voucher });
  };
  const handlePaymentApprove = (id: string, patch: Partial<PaymentRequest>) => {
    updatePaymentRequest(id, patch);
  };
  const handlePaymentReject = (id: string, note: string) => {
    updatePaymentRequest(id, { status: '已驳回', reviewNote: note, reviewer: '财务', reviewedAt: new Date().toISOString().slice(0, 10) });
    // 通知 PM（toast 模拟）
    toast.info('已通知 PM：申请已被驳回');
  };
  const handlePaymentComplete = (id: string, voucher: string) => {
    updatePaymentRequest(id, { status: '已完成', completedAt: new Date().toISOString().slice(0, 10), voucher });
    // 通知 PM（toast 模拟）
    toast.success('已通知 PM：款项已完成');
  };

  const FILTER_OPTIONS = ['全部', '待审批', '已审批', '已付款', '已驳回'];

  return (
    <div className="p-6 space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">发票与结算</h1>
          <p className="text-sm text-slate-400 mt-0.5">管理外包发票提交、审批与付款全流程</p>
        </div>
        {(role === 'vendor') && (
          <Button onClick={() => setSubmitOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="w-4 h-4" /> 提交发票
          </Button>
        )}
      </div>

      {/* 主 Tab */}
      <div className="flex gap-1 border-b border-slate-700/50 pb-0">
        <button onClick={() => setMainTab('invoices')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mainTab === 'invoices'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}>
          外包发票
        </button>
        <button onClick={() => setMainTab('requests')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            mainTab === 'requests'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}>
          收付款申请
          {paymentRequests.filter(r => r.status === '待财务审核').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {paymentRequests.filter(r => r.status === '待财务审核').length}
            </span>
          )}
        </button>
      </div>

      {/* 收付款申请列表 */}
      {mainTab === 'requests' && (
        <div className="space-y-3">
          {paymentRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ArrowRightLeft className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>暂无收付款申请</p>
            </div>
          ) : (
            paymentRequests.map(req => {
              const statusColor: Record<string, string> = {
                '待财务审核': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                '已审核': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                '已完成': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                '已驳回': 'bg-red-500/20 text-red-300 border-red-500/30',
              };
              return (
                <div key={req.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                          req.type === '收款' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                        }`}>
                          {req.type === '收款' ? '↑ 收款申请' : '↓ 付款申请'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${statusColor[req.status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200 truncate">{req.contractName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{req.stageName} · 发起人：{req.initiator} · {req.initiatedAt}</p>
                      {req.invoiceNo && (
                        <p className="text-xs text-slate-500 mt-0.5">发票号：{req.invoiceNo} · 发票金额：¥{req.invoiceAmount?.toLocaleString()}</p>
                      )}
                      {req.status === '已完成' && req.completedAt && (
                        <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                          <Bell className="w-3 h-3" /> 已通知 PM · 完成于 {req.completedAt}
                        </p>
                      )}
                      {req.status === '已驳回' && req.reviewNote && (
                        <p className="text-xs text-red-400 mt-0.5">驳回原因：{req.reviewNote}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-lg font-bold ${req.type === '收款' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        ¥{req.amount.toLocaleString()}
                      </p>
                      {(req.status === '待财务审核' || req.status === '已审核') && (role === 'finance' || role === 'boss') && (
                        <button
                          onClick={() => setReviewTarget(req)}
                          className="mt-2 text-xs px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          {req.status === '待财务审核' ? '审核' : '完成付款'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {mainTab === 'invoices' && <>
      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: '发票总数', value: stats.total, color: 'text-slate-300', icon: Receipt },
          { label: '待审批', value: stats.pending, color: 'text-yellow-400', icon: Clock },
          { label: '已审批', value: stats.approved, color: 'text-blue-400', icon: CheckCircle2 },
          { label: '已付款', value: stats.paid, color: 'text-green-400', icon: CreditCard },
          { label: '已驳回', value: stats.rejected, color: 'text-red-400', icon: XCircle },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              {stat.label}
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 累计付款 */}
      <div className="bg-gradient-to-r from-green-900/30 to-slate-800/60 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">累计已付款金额</p>
            <p className="text-2xl font-bold text-green-400">¥{stats.totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>共 {stats.paid} 笔已完成付款</p>
          <p className="mt-0.5">流程：提交 → 老板审批 → 出纳付款</p>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-2">
        {FILTER_OPTIONS.map(opt => (
          <button key={opt} onClick={() => setFilterStatus(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filterStatus === opt
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}>
            {opt}
            {opt !== '全部' && (
              <span className="ml-1.5 text-xs opacity-70">
                {invoiceList.filter(i => i.status === opt).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 发票列表 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>暂无发票记录</p>
          </div>
        ) : (
          filtered.map(inv => {
            const cfg = STATUS_CONFIG[inv.status];
            return (
              <div key={inv.id}
                className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-700/60 border border-slate-600/50 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-slate-300">{inv.id}</span>
                        <Badge className={`text-xs ${cfg.color} border-0`}>{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> {inv.vendor}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> {inv.projectName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {inv.submitDate}
                        </span>
                      </div>
                      {inv.remark && (
                        <p className="text-xs text-slate-500 mt-1">备注：{inv.remark}</p>
                      )}
                      {inv.rejectReason && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> 驳回原因：{inv.rejectReason}
                        </p>
                      )}
                      {inv.payVoucher && (
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 凭证：{inv.payVoucher}
                        </p>
                      )}
                      {/* AI 异常检测 — 待审批和已审批状态显示 */}
                      {['待审批', '已审批'].includes(inv.status) && (
                        <AICheckPanel invoice={inv} allInvoices={invoiceList} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-slate-100">¥{inv.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setDetailTarget(inv)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300 hover:bg-slate-700">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {/* 老板审批 */}
                      {role === 'boss' && inv.status === '待审批' && (
                        <Button size="sm" onClick={() => setApproveTarget(inv)}
                          className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-600/30 h-7 text-xs gap-1 transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 审批
                        </Button>
                      )}
                      {/* 财务付款 */}
                      {role === 'finance' && inv.status === '已审批' && (
                        <Button size="sm" onClick={() => setPayTarget(inv)}
                          className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/30 h-7 text-xs gap-1 transition-all">
                          <CreditCard className="w-3.5 h-3.5" /> 付款
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 流程进度条 */}
                <div className="mt-4 flex items-center gap-2">
                  {['提交', '审批', '付款'].map((step, i) => {
                    const done = (i === 0) || (i === 1 && ['已审批', '已付款'].includes(inv.status)) || (i === 2 && inv.status === '已付款');
                    const active = (i === 0 && inv.status === '待审批') || (i === 1 && inv.status === '已审批') || (i === 2 && inv.status === '已付款');
                    const rejected = inv.status === '已驳回' && i === 1;
                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full
                          ${rejected ? 'bg-red-500/20 text-red-400' :
                            done ? 'bg-green-500/20 text-green-400' :
                            active ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-800 text-slate-600'}`}>
                          {rejected ? <XCircle className="w-3 h-3" /> : done ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                          {step}
                        </div>
                        {i < 2 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 弹窗 */}
      </>
      }
      <SubmitInvoiceDialog open={submitOpen} onClose={() => setSubmitOpen(false)} onSubmit={handleSubmit} />
      <ApproveDialog open={!!approveTarget} onClose={() => setApproveTarget(null)}
        invoice={approveTarget} onApprove={handleApprove} onReject={handleReject} />
      <PayDialog open={!!payTarget} onClose={() => setPayTarget(null)}
        invoice={payTarget} onPay={handlePay} />
      <DetailDialog open={!!detailTarget} onClose={() => setDetailTarget(null)} invoice={detailTarget} />
    </div>
  );
}
