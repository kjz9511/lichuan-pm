// 厉川外包项目管理平台 — 主应用入口
// 设计风格：深色专业管理台风，左侧侧边栏 + 顶部 Header + 主内容区

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { RoleProvider, useRole, Role } from "./contexts/RoleContext";
import { ContractProvider, useContracts } from "./contexts/ContractContext";
import { TransferProvider } from "./contexts/TransferContext";
import { ProjectProvider, useProject } from "./contexts/ProjectContext";
import { PaymentRequestProvider } from "./contexts/PaymentRequestContext";
import { InvoiceProvider } from "./contexts/InvoiceContext";
import { Contract } from "./lib/mockData";
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
import SystemPage from "./pages/SystemPage";
import PreProjectPage from "./pages/PreProjectPage";
import NewProjectPage from "./pages/NewProjectPage";

function MainApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [showNewProject, setShowNewProject] = useState(false);
  const { role, setRole } = useRole();
  const { addContract } = useContracts();
  const { addProject } = useProject();

  function handleLogin(selectedRole: Role, _name?: string) {
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
      return <NewProjectPage
        onBack={() => setShowNewProject(false)}
        onContractCreated={(c: Contract) => { addContract(c); }}
        onProjectCreated={(p) => { addProject(p); }}
      />;
    }
    switch (activePage) {
      case 'dashboard':
        if (role === 'boss') return <DashboardBoss />;
        if (role === 'pm' || role === 'pm2' || role === 'pm3') return <DashboardPM onNewProject={() => setShowNewProject(true)} />;
        if (role === 'vendor') return <DashboardVendor />;
        if (role === 'finance') return <DashboardFinance />;
        return <DashboardBoss />;
      case 'pre-projects':
        return <PreProjectPage onStartProject={(_id, name) => { setShowNewProject(true); toast.info(`已关联预立项「${name}」，请继续填写立项信息`); }} />;
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
        return <SystemPage />;
      case 'logs':
        return <PlaceholderPage title="操作日志" description="全平台操作追溯，记录所有用户的关键操作行为，支持按人员/项目/时间筛选，将在二期上线。" />;
      case 'notifications':
        return <PlaceholderPage title="通知设置" description="配置关键事件提醒规则（里程碑截止、合同到期、发票待审批等），将在二期上线。" />;
      case 'settings':
        return <SystemPage />;
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
          <ContractProvider>
            <TransferProvider>
            <ProjectProvider>
            <PaymentRequestProvider>
            <InvoiceProvider>
            <TooltipProvider>
              <Toaster />
              <MainApp />
            </TooltipProvider>
            </InvoiceProvider>
            </PaymentRequestProvider>
            </ProjectProvider>
            </TransferProvider>
          </ContractProvider>
        </RoleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
