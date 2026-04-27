// 厉川外包项目管理平台 — 供应商管理页面
import { cn } from '@/lib/utils';
import { Plus, Star } from 'lucide-react';
import { vendors } from '../lib/mockData';
import { toast } from 'sonner';

export default function VendorsPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">共 {vendors.length} 家供应商</div>
        <button
          onClick={() => toast.info('新增供应商功能即将上线')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新增供应商
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {vendors.map(v => (
          <div key={v.id} className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-foreground">{v.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{v.type}</div>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={cn('w-3 h-3', i <= Math.floor(v.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')}
                  />
                ))}
                <span className="text-xs text-amber-400 ml-1">{v.rating}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-secondary/50 rounded-lg p-2">
                <div className="text-muted-foreground">联系人</div>
                <div className="font-medium text-foreground mt-0.5">{v.contact}</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <div className="text-muted-foreground">联系电话</div>
                <div className="font-medium text-foreground mt-0.5">{v.phone}</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <div className="text-muted-foreground">在执项目</div>
                <div className="font-medium text-foreground mt-0.5">{v.activeProjects} 个</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <div className="text-muted-foreground">累计合作金额</div>
                <div className="font-medium text-foreground mt-0.5">¥{(v.totalAmount / 10000).toFixed(0)}万</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
