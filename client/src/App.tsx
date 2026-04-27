// 厉川外包项目管理平台 — 主应用入口
// 设计风格：深色专业管理台风，左侧侧边栏 + 顶部 Header + 主内容区

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { RoleProvider, useRole, Role } from "./contexts/RoleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

// 页面组件
import LoginPage from "./pages/LoginPage";
import DashboardBoss from "./pages/DashboardBoss";
import DashboardPM from "./pages/DashboardPM";
import DashboardVendor from "./pages/DashboardVendor";
import DashboardFinance from "./pages/DashboardFinance";
import ProjectsPage from "./pages/ProjectsPage";
import ContractsPage from "./pages/ContractsPage";
import MilestonesPage from "./pages/MilestonesPage";
import VendorsPage from "./pages/VendorsPage";
import InvoicesPage from "./pages/InvoicesPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NewProjectPage from "./pages/NewProjectPage";

function MainApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [showNewProject, setShowNewProject] = useState(false);
  const { role, setRole } = useRole();

  function handleLogin(selectedRole: Role) {
    setRole(selectedRole);
    setIsLoggedIn(true);
    setActivePage('dashboard');
  }

  function handleLogout() {
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  function renderPage() {
    if (showNewProject) {
      return <NewProjectPage onBack={() => setShowNewProject(false)} />;
    }
    switch (activePage) {
      case 'dashboard':
        if (role === 'boss') return <DashboardBoss />;
        if (role === 'pm') return <DashboardPM />;
        if (role === 'vendor') return <DashboardVendor />;
        if (role === 'finance') return <DashboardFinance />;
        return <DashboardBoss />;
      case 'projects':
        return <ProjectsPage onNewProject={() => setShowNewProject(true)} />;
      case 'milestones':
        return <MilestonesPage />;
      case 'contracts':
        return <ContractsPage />;
      case 'vendors':
        return <VendorsPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'documents':
        return <PlaceholderPage title="我的文档" description="支持新建/编辑 Markdown 文档、设置权限（私有/项目成员/公开分享）、使用范本库，将在二期上线。" />;
      case 'reports':
        return <PlaceholderPage title="数据报表" description="项目汇总、合同收支对比、外包商绩效、月度趋势等可视化报表，将在二期上线。" />;
      case 'users':
        return <PlaceholderPage title="用户管理" description="新建/编辑/启停内外部账号，分配角色权限，管理合作商账号，将在二期上线。" />;
      case 'logs':
        return <PlaceholderPage title="操作日志" description="全平台操作追溯，记录所有用户的关键操作行为，支持按人员/项目/时间筛选，将在二期上线。" />;
      case 'notifications':
        return <PlaceholderPage title="通知设置" description="配置关键事件提醒规则（里程碑截止、合同到期、发票待审批等），将在二期上线。" />;
      case 'settings':
        return <PlaceholderPage title="系统设置" description="平台基础配置，包括公司信息、审批流程、通知模板等，将在二期上线。" />;
      default:
        return <DashboardBoss />;
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activePage={activePage} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <RoleProvider>
          <TooltipProvider>
            <Toaster />
            <MainApp />
          </TooltipProvider>
        </RoleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
