// 全局项目列表 Context
// 管理项目列表，支持移交审批通过后更新负责人

import React, { createContext, useContext, useState } from 'react';
import { projects as initialProjects, Project } from '../lib/mockData';

interface ProjectContextType {
  projectList: Project[];
  updateManager: (projectId: string, newManager: string) => void;
  setProjectList: React.Dispatch<React.SetStateAction<Project[]>>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);

  function updateManager(projectId: string, newManager: string) {
    setProjectList(prev =>
      prev.map(p => p.id === projectId ? { ...p, manager: newManager } : p)
    );
  }

  return (
    <ProjectContext.Provider value={{ projectList, updateManager, setProjectList }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
