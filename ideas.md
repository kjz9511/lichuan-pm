# 厉川外包项目管理平台 — 设计方案

## 方案一：专业深蓝企业风
<response>
<text>
**Design Movement**: 现代企业 SaaS（参考 Linear、Notion、飞书）
**Core Principles**:
- 信息密度高但不拥挤，层级清晰
- 深蓝主色调传递专业感与信任感
- 数据可视化优先，图表与状态标签突出
- 左侧固定侧边栏 + 右侧内容区的经典管理后台布局

**Color Philosophy**: 深海蓝 (#1E3A5F) 作为主色，配合白色背景与浅灰卡片，强调状态色（红/黄/绿）用于健康度指示。传递专业、可信、稳重的企业气质。

**Layout Paradigm**: 左侧 240px 固定侧边栏（含角色切换），右侧内容区自适应，顶部 Header 含面包屑与通知。

**Signature Elements**:
- 红黄绿三色健康度徽章
- 数据卡片带微渐变阴影
- 进度条与环形图

**Interaction Philosophy**: 点击即响应，状态变化有过渡动画，表单弹窗覆盖层。

**Animation**: 页面切换 fade-in，卡片 hover 轻微上浮，数字计数动画。

**Typography System**: 标题用 PingFang SC Bold，正文用系统字体栈，数字用等宽字体。
</text>
<probability>0.08</probability>
</response>

## 方案二：清爽白色极简风
<response>
<text>
**Design Movement**: 极简主义 SaaS（参考 Basecamp、Asana）
**Core Principles**:
- 大量留白，内容呼吸感强
- 单色系（白底 + 深灰文字）+ 一个强调色
- 卡片无阴影，用细线分隔
- 信息分层靠字重和字号区分

**Color Philosophy**: 纯白背景，深炭灰文字，蓝绿色 (#0EA5E9) 作为唯一强调色。极简但不冷漠。

**Layout Paradigm**: 顶部导航 + 内容区，无侧边栏，Tab 切换角色视图。

**Signature Elements**:
- 细线边框卡片
- 文字链接式导航
- 极简表格

**Interaction Philosophy**: 减少弹窗，尽量内联编辑，操作反馈用 Toast。

**Animation**: 几乎无动画，仅有 opacity 过渡。

**Typography System**: 全程 Inter，字重 400/600 区分层级。
</text>
<probability>0.05</probability>
</response>

## 方案三：深色专业管理台风（选定）
<response>
<text>
**Design Movement**: 暗色系企业管理后台（参考 Vercel Dashboard、GitHub）
**Core Principles**:
- 深色背景减少视觉疲劳，适合长时间使用
- 高对比度文字与彩色状态标签
- 左侧侧边栏 + 顶部 Header + 主内容区三段式布局
- 数据密度适中，卡片分组清晰

**Color Philosophy**: 深灰背景 (#0F172A slate-900)，卡片用 (#1E293B slate-800)，主色蓝 (#3B82F6)，状态色保持鲜明（绿/黄/红）。传递科技感与专业感。

**Layout Paradigm**: 左侧 220px 侧边栏（含 Logo + 角色切换 + 菜单），顶部 56px Header（含搜索 + 通知 + 用户头像），右侧主内容区。

**Signature Elements**:
- 渐变色角色切换标签
- 数据卡片带彩色左边框
- 状态徽章（红黄绿）

**Interaction Philosophy**: 侧边栏高亮当前页，点击菜单平滑切换内容，弹窗用 Dialog 覆盖层，表单操作有即时反馈。

**Animation**: 侧边栏菜单 hover 背景过渡，页面内容 fade-in，数字滚动动画，进度条加载动画。

**Typography System**: 标题用 Noto Sans SC 700，正文用 Noto Sans SC 400，数字用 tabular-nums，代码用 monospace。
</text>
<probability>0.09</probability>
</response>

## 选定方案：方案三（深色专业管理台风）
选择理由：深色系更适合管理后台长时间使用场景，高对比度数据展示清晰，科技感与专业感兼备，符合厉川项目管理平台的定位。
