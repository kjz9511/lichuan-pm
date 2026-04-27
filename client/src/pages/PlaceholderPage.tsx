// 通用占位页面 — 二期功能
import { Rocket } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-4">
        <Rocket className="w-8 h-8 text-purple-400" />
      </div>
      <div className="text-lg font-semibold text-foreground mb-2">{title}</div>
      <div className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {description || '此功能模块已规划，将在二期版本中正式上线，敬请期待。'}
      </div>
      <div className="mt-4 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-lg text-xs text-purple-400">
        二期迭代上线
      </div>
    </div>
  );
}
