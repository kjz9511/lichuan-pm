import React, { createContext, useContext, useState } from 'react';

export type Role = 'boss' | 'pm' | 'pm2' | 'pm3' | 'vendor' | 'finance';

export interface RoleInfo {
  id: Role;
  label: string;
  name: string;
  avatar: string;
  color: string;
  bgColor: string;
}

export const ROLES: RoleInfo[] = [
  { id: 'boss',    label: '老板',     name: '何家劲',   avatar: 'H',  color: 'text-purple-400',  bgColor: 'bg-purple-500/20' },
  { id: 'pm',      label: '项目经理', name: '张伟',     avatar: '张', color: 'text-blue-400',    bgColor: 'bg-blue-500/20' },
  { id: 'pm2',     label: '项目经理', name: '刘芳',     avatar: '刘', color: 'text-cyan-400',    bgColor: 'bg-cyan-500/20' },
  { id: 'pm3',     label: '项目经理', name: '陈建国',   avatar: '陈', color: 'text-indigo-400',  bgColor: 'bg-indigo-500/20' },
  { id: 'vendor',  label: '合作商',   name: '星辰前端', avatar: '外', color: 'text-amber-400',   bgColor: 'bg-amber-500/20' },
  { id: 'finance', label: '财务人员', name: '李财务',   avatar: '财', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
];

interface RoleContextType {
  role: Role;
  roleInfo: RoleInfo;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('boss');
  const roleInfo = ROLES.find(r => r.id === role)!;

  return (
    <RoleContext.Provider value={{ role, roleInfo, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
