// 通用占位页面
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-blue-400" />
      </div>
      <div className="text-lg font-semibold text-foreground mb-2">{title}</div>
      <div className="text-sm text-muted-foreground max-w-xs">
        此功能模块正在开发中，将在一期上线时完整呈现。
      </div>
      <div className="mt-4 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
        预计 5.10 上线
      </div>
    </div>
  );
}
