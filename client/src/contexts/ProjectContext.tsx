// 全局项目列表 Context
// 管理项目列表，支持移交审批通过后更新负责人，以及新建立项写入
import React, { createContext, useContext, useState } from 'react';
import { projects as initialProjects, Project } from '../lib/mockData';

export interface NewProjectNotification {
  id: string;
  projectId: string;
  projectName: string;
  manager: string;
  contractAmount: number;
  createdAt: string;
  read: boolean;
}

interface ProjectContextType {
  projectList: Project[];
  updateManager: (projectId: string, newManager: string) => void;
  addProject: (project: Project) => void;
  setProjectList: React.Dispatch<React.SetStateAction<Project[]>>;
  newProjectNotifications: NewProjectNotification[];
  markNotificationRead: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);
  const [newProjectNotifications, setNewProjectNotifications] = useState<NewProjectNotification[]>([]);

  function updateManager(projectId: string, newManager: string) {
    setProjectList(prev =>
      prev.map(p => p.id === projectId ? { ...p, manager: newManager } : p)
    );
  }

  function addProject(project: Project) {
    setProjectList(prev => [project, ...prev]);
    // 同时生成立项通知（老板仪表盘消费）
    const notification: NewProjectNotification = {
      id: `NOTIF-${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      manager: project.manager,
      contractAmount: project.contractAmount,
      createdAt: new Date().toISOString().slice(0, 10),
      read: false,
    };
    setNewProjectNotifications(prev => [notification, ...prev]);
  }

  function markNotificationRead(id: string) {
    setNewProjectNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  return (
    <ProjectContext.Provider value={{ projectList, updateManager, addProject, setProjectList, newProjectNotifications, markNotificationRead }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
