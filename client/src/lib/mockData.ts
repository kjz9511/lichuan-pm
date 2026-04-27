// 厉川外包项目管理平台 — 模拟数据
// 设计风格：深色专业管理台风，数据仅用于原型演示

export type HealthStatus = 'green' | 'yellow' | 'red';
export type ProjectStage = '项目启动' | '需求确认' | '项目执行' | '项目验收' | '项目结项';
export type ProjectStatus = '进行中' | '已完成' | '已逾期' | '待启动';

export interface Project {
  id: string;
  name: string;
  manager: string;
  client: string;
  stage: ProjectStage;
  status: ProjectStatus;
  health: HealthStatus;
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  vendor: string;
  contractAmount: number;
  paidAmount: number;
  members: string[];
  description: string;
}

export interface Contract {
  id: string;
  projectId: string;
  projectName: string;
  type: '甲方合同' | '外包协议';
  vendor: string;
  amount: number;
  signDate: string;
  endDate: string;
  status: '已签署' | '待签署' | '已到期';
  paidAmount: number;
  pendingAmount: number;
  stages: PaymentStage[];
}

export interface PaymentStage {
  name: string;
  amount: number;
  dueDate: string;
  status: '已回款' | '未回款' | '已逾期';
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  type: '设计稿' | '开发文档' | '测试报告' | '验收材料' | '代码交付';
  dueDate: string;
  status: '待提交' | '已提交' | '审核中' | '已通过' | '已驳回';
  submitter: string;
  aiScore?: number;
  issues?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  phone: string;
  type: string;
  activeProjects: number;
  totalAmount: number;
  rating: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  vendor: string;
  amount: number;
  submitDate: string;
  status: '待审批' | '已审批' | '已付款' | '已驳回';
  approver?: string;
  payDate?: string;
}

// ===== 项目数据 =====
export const projects: Project[] = [
  {
    id: 'PRJ-2026-001',
    name: '厉川官网重构项目',
    manager: '张伟',
    client: '厉川科技',
    stage: '项目执行',
    status: '进行中',
    health: 'green',
    progress: 65,
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    budget: 280000,
    spent: 182000,
    vendor: '星辰前端工作室',
    contractAmount: 280000,
    paidAmount: 140000,
    members: ['张伟', '李小白', '王六子', '陈东阳'],
    description: '厉川科技官方网站全面重构，包含响应式设计、SEO优化、内容管理系统接入。',
  },
  {
    id: 'PRJ-2026-002',
    name: '供应链管理系统开发',
    manager: '刘芳',
    client: '厉川物流',
    stage: '需求确认',
    status: '进行中',
    health: 'yellow',
    progress: 25,
    startDate: '2026-04-01',
    endDate: '2026-07-30',
    budget: 560000,
    spent: 140000,
    vendor: '大锤科技团队',
    contractAmount: 560000,
    paidAmount: 112000,
    members: ['刘芳', '赵大锤', '孙小白'],
    description: '供应链全链路数字化管理系统，含采购、库存、物流、结算四大模块。',
  },
  {
    id: 'PRJ-2026-003',
    name: 'AI客服机器人接入',
    manager: '张伟',
    client: '厉川零售',
    stage: '项目验收',
    status: '进行中',
    health: 'red',
    progress: 88,
    startDate: '2026-01-15',
    endDate: '2026-04-30',
    budget: 180000,
    spent: 175000,
    vendor: '智能云科技',
    contractAmount: 180000,
    paidAmount: 162000,
    members: ['张伟', '周小明', '吴测试'],
    description: 'AI智能客服机器人接入，支持多渠道、多语言、知识库自动更新。',
  },
  {
    id: 'PRJ-2026-004',
    name: '数据中台建设一期',
    manager: '陈建国',
    client: '厉川集团',
    stage: '项目启动',
    status: '待启动',
    health: 'green',
    progress: 5,
    startDate: '2026-05-01',
    endDate: '2026-09-30',
    budget: 1200000,
    spent: 60000,
    vendor: '待定',
    contractAmount: 1200000,
    paidAmount: 0,
    members: ['陈建国', '张伟'],
    description: '集团数据中台建设，统一数据标准、数据治理、数据服务能力。',
  },
  {
    id: 'PRJ-2026-005',
    name: '移动端APP 2.0升级',
    manager: '刘芳',
    client: '厉川零售',
    stage: '项目结项',
    status: '已完成',
    health: 'green',
    progress: 100,
    startDate: '2025-11-01',
    endDate: '2026-02-28',
    budget: 320000,
    spent: 308000,
    vendor: '飞翔移动科技',
    contractAmount: 320000,
    paidAmount: 320000,
    members: ['刘芳', '李小白', '王六子', '陈东阳', '周小明'],
    description: '移动端APP全面升级，新增会员体系、积分商城、直播带货功能。',
  },
];

// ===== 合同数据 =====
export const contracts: Contract[] = [
  {
    id: 'CON-2026-001',
    projectId: 'PRJ-2026-001',
    projectName: '厉川官网重构项目',
    type: '甲方合同',
    vendor: '厉川科技',
    amount: 280000,
    signDate: '2026-02-28',
    endDate: '2026-05-31',
    status: '已签署',
    paidAmount: 140000,
    pendingAmount: 140000,
    stages: [
      { name: '首付款（签约）', amount: 84000, dueDate: '2026-03-01', status: '已回款' },
      { name: '中期款（验收）', amount: 112000, dueDate: '2026-04-30', status: '已回款' },
      { name: '尾款（上线）', amount: 84000, dueDate: '2026-05-31', status: '未回款' },
    ],
  },
  {
    id: 'CON-2026-002',
    projectId: 'PRJ-2026-001',
    projectName: '厉川官网重构项目',
    type: '外包协议',
    vendor: '星辰前端工作室',
    amount: 180000,
    signDate: '2026-03-01',
    endDate: '2026-05-31',
    status: '已签署',
    paidAmount: 90000,
    pendingAmount: 90000,
    stages: [
      { name: '预付款', amount: 54000, dueDate: '2026-03-05', status: '已回款' },
      { name: '中期款', amount: 72000, dueDate: '2026-04-30', status: '已回款' },
      { name: '尾款', amount: 54000, dueDate: '2026-05-31', status: '未回款' },
    ],
  },
  {
    id: 'CON-2026-003',
    projectId: 'PRJ-2026-002',
    projectName: '供应链管理系统开发',
    type: '甲方合同',
    vendor: '厉川物流',
    amount: 560000,
    signDate: '2026-03-28',
    endDate: '2026-07-30',
    status: '已签署',
    paidAmount: 112000,
    pendingAmount: 448000,
    stages: [
      { name: '首付款', amount: 112000, dueDate: '2026-04-01', status: '已回款' },
      { name: '里程碑款1', amount: 168000, dueDate: '2026-05-30', status: '未回款' },
      { name: '里程碑款2', amount: 168000, dueDate: '2026-07-01', status: '未回款' },
      { name: '尾款', amount: 112000, dueDate: '2026-07-30', status: '未回款' },
    ],
  },
  {
    id: 'CON-2026-004',
    projectId: 'PRJ-2026-003',
    projectName: 'AI客服机器人接入',
    type: '外包协议',
    vendor: '智能云科技',
    amount: 120000,
    signDate: '2026-01-10',
    endDate: '2026-04-30',
    status: '已签署',
    paidAmount: 108000,
    pendingAmount: 12000,
    stages: [
      { name: '预付款', amount: 36000, dueDate: '2026-01-15', status: '已回款' },
      { name: '中期款', amount: 48000, dueDate: '2026-03-15', status: '已回款' },
      { name: '尾款', amount: 36000, dueDate: '2026-04-30', status: '已逾期' },
    ],
  },
];

// ===== 里程碑/交付物数据 =====
export const milestones: Milestone[] = [
  {
    id: 'MS-001',
    projectId: 'PRJ-2026-001',
    name: '官网设计稿终稿',
    type: '设计稿',
    dueDate: '2026-03-20',
    status: '已通过',
    submitter: '王六子',
    aiScore: 92,
    issues: [],
  },
  {
    id: 'MS-002',
    projectId: 'PRJ-2026-001',
    name: '前端页面开发完成',
    type: '代码交付',
    dueDate: '2026-04-30',
    status: '审核中',
    submitter: '星辰前端工作室',
    aiScore: 78,
    issues: ['部分页面缺少移动端适配', '图片未压缩优化'],
  },
  {
    id: 'MS-003',
    projectId: 'PRJ-2026-002',
    name: '需求规格说明书',
    type: '开发文档',
    dueDate: '2026-04-20',
    status: '已通过',
    submitter: '李小白',
    aiScore: 88,
    issues: [],
  },
  {
    id: 'MS-004',
    projectId: 'PRJ-2026-003',
    name: '系统测试报告',
    type: '测试报告',
    dueDate: '2026-04-25',
    status: '已驳回',
    submitter: '吴测试',
    aiScore: 55,
    issues: ['测试用例覆盖率不足60%', '缺少性能测试数据', '未包含异常场景测试'],
  },
  {
    id: 'MS-005',
    projectId: 'PRJ-2026-003',
    name: '验收材料包',
    type: '验收材料',
    dueDate: '2026-04-28',
    status: '待提交',
    submitter: '智能云科技',
  },
];

// ===== 供应商数据 =====
export const vendors: Vendor[] = [
  { id: 'V-001', name: '星辰前端工作室', contact: '陈星', phone: '138-0001-0001', type: '前端开发', activeProjects: 1, totalAmount: 180000, rating: 4.5 },
  { id: 'V-002', name: '大锤科技团队', contact: '赵大锤', phone: '139-0002-0002', type: '全栈开发', activeProjects: 1, totalAmount: 420000, rating: 4.8 },
  { id: 'V-003', name: '智能云科技', contact: '周智', phone: '137-0003-0003', type: 'AI/算法', activeProjects: 1, totalAmount: 120000, rating: 3.8 },
  { id: 'V-004', name: '飞翔移动科技', contact: '李飞', phone: '136-0004-0004', type: '移动端开发', activeProjects: 0, totalAmount: 260000, rating: 4.6 },
];

// ===== 发票/结算数据 =====
export const invoices: Invoice[] = [
  { id: 'INV-001', projectId: 'PRJ-2026-001', projectName: '厉川官网重构项目', vendor: '星辰前端工作室', amount: 90000, submitDate: '2026-04-20', status: '已付款', approver: '老板', payDate: '2026-04-22' },
  { id: 'INV-002', projectId: 'PRJ-2026-003', projectName: 'AI客服机器人接入', vendor: '智能云科技', amount: 36000, submitDate: '2026-04-25', status: '待审批' },
  { id: 'INV-003', projectId: 'PRJ-2026-002', projectName: '供应链管理系统开发', vendor: '大锤科技团队', amount: 84000, submitDate: '2026-04-26', status: '待审批' },
  { id: 'INV-004', projectId: 'PRJ-2026-005', projectName: '移动端APP 2.0升级', vendor: '飞翔移动科技', amount: 52000, submitDate: '2026-03-10', status: '已付款', approver: '老板', payDate: '2026-03-12' },
];

// ===== 操作日志 =====
export const operationLogs = [
  { id: 1, user: '张伟', action: '提交了里程碑「前端页面开发完成」', project: 'PRJ-2026-001', time: '2026-04-27 14:32' },
  { id: 2, user: '智能云科技', action: '提交了发票 INV-002（¥36,000）', project: 'PRJ-2026-003', time: '2026-04-27 11:15' },
  { id: 3, user: '大锤科技团队', action: '提交了发票 INV-003（¥84,000）', project: 'PRJ-2026-002', time: '2026-04-26 17:08' },
  { id: 4, user: '刘芳', action: '更新了项目进度至 25%', project: 'PRJ-2026-002', time: '2026-04-26 10:30' },
  { id: 5, user: '吴测试', action: '提交了测试报告（被驳回）', project: 'PRJ-2026-003', time: '2026-04-25 16:45' },
  { id: 6, user: '老板', action: '审批通过发票 INV-001（¥90,000）', project: 'PRJ-2026-001', time: '2026-04-22 09:20' },
];

// ===== 通知数据 =====
export const notifications = [
  { id: 1, type: 'warning', title: 'AI客服机器人接入 进度预警', content: '项目逾期风险，当前进度88%，距截止日期仅剩3天', time: '1小时前', read: false },
  { id: 2, type: 'info', title: '新发票待审批', content: '智能云科技提交了¥36,000发票，请及时审批', time: '3小时前', read: false },
  { id: 3, type: 'info', title: '大锤科技团队提交发票', content: '供应链管理系统开发 ¥84,000发票待审批', time: '昨天', read: false },
  { id: 4, type: 'success', title: '官网重构项目里程碑通过', content: '设计稿终稿已通过AI审核，评分92分', time: '昨天', read: true },
  { id: 5, type: 'warning', title: '合同到期预警', content: 'AI客服机器人接入外包协议将于4月30日到期', time: '2天前', read: true },
];

// ===== 统计数据 =====
export const dashboardStats = {
  totalProjects: 5,
  activeProjects: 3,
  completedProjects: 1,
  overdueProjects: 1,
  totalContractAmount: 2340000,
  totalPaidAmount: 724000,
  pendingPayment: 1616000,
  healthGreen: 3,
  healthYellow: 1,
  healthRed: 1,
  pendingApprovals: 2,
};

// 月度收款趋势
export const monthlyRevenue = [
  { month: '11月', amount: 320000 },
  { month: '12月', amount: 180000 },
  { month: '1月', amount: 112000 },
  { month: '2月', amount: 84000 },
  { month: '3月', amount: 90000 },
  { month: '4月', amount: 140000 },
];

// 项目阶段分布
export const stageDistribution = [
  { stage: '项目启动', count: 1 },
  { stage: '需求确认', count: 1 },
  { stage: '项目执行', count: 1 },
  { stage: '项目验收', count: 1 },
  { stage: '项目结项', count: 1 },
];
