import { Bell, ShieldCheck, Mail, Zap } from 'lucide-react';

interface NotificationsTileProps {
  onExpand?: () => void;
}

const notifications = [
  { id: 1, type: 'critical', icon: ShieldCheck, title: 'Term Assessment Rules Updated', time: '2h ago', color: 'text-error-500' },
  { id: 2, type: 'info', icon: Zap, title: 'Social Science Quiz Results: 6A', time: '5h ago', color: 'text-primary-500' },
  { id: 3, type: 'message', icon: Mail, title: 'Meeting Invitation: Board Delegate', time: '1d ago', color: 'text-neutral-500' },
];

export default function NotificationsTile({ onExpand }: NotificationsTileProps) {
  return (
    <div className="glass-card p-8 h-full bg-warning-100/90 dark:bg-warning-500/20 border-warning-200/50 dark:border-warning-500/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tighter flex items-center gap-2">
            Notifications
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-xs font-bold">Priority stream for your attention.</p>
        </div>
        {onExpand ? (
          <button
            type="button"
            onClick={onExpand}
            className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 dark:text-white bg-white/90 dark:bg-neutral-900/80 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          >
            View all
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="p-4 glass-panel bg-white/95 dark:bg-neutral-950/90 hover:bg-white dark:hover:bg-neutral-900 transition-all cursor-pointer group flex items-start gap-4 border-neutral-200 dark:border-white/10">
            <div className={`p-3 rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${notif.type === 'critical' ? 'bg-error-100 text-error-700' : notif.type === 'info' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 dark:text-neutral-300'}`}>
              <notif.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-neutral-900 dark:text-white tracking-tight leading-tight">{notif.title}</p>
              <p className="text-[10px] font-black text-neutral-600 dark:text-neutral-300 uppercase tracking-widest mt-1">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onExpand}
        className="w-full mt-8 py-3 glass-panel border-2 border-dashed border-warning-400 dark:border-warning-500/30 text-warning-800 dark:text-warning-200 text-[10px] font-black uppercase tracking-widest hover:bg-warning-100 dark:hover:bg-warning-500/20 transition-all"
      >
        {onExpand ? 'View all notifications' : 'Expand Notifications'}
      </button>
    </div>
  );
}
