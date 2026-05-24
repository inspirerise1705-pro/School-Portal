import { ArrowLeft, ShieldCheck, Mail, Zap } from 'lucide-react';

interface NotificationItem {
  id: number;
  type: 'critical' | 'info' | 'message';
  icon: typeof ShieldCheck | typeof Zap | typeof Mail;
  title: string;
  details: string;
  time: string;
  color: string;
}

const notifications: NotificationItem[] = [
  { id: 1, type: 'critical', icon: ShieldCheck, title: 'Term Assessment Rules Updated', details: 'New grading policy has been applied to Class 8A and related sessions.', time: '2h ago', color: 'text-error-500' },
  { id: 2, type: 'info', icon: Zap, title: 'Social Science Quiz Results', details: '6A has a 92% submission rate in the latest quiz update.', time: '5h ago', color: 'text-primary-500' },
  { id: 3, type: 'message', icon: Mail, title: 'Meeting Invitation', details: 'Board delegate review scheduled for 11:00 AM in the staff lounge.', time: '1d ago', color: 'text-neutral-500' },
];

interface NotificationsPageProps {
  onBack: () => void;
}

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-white/10 text-sm font-black text-neutral-900 dark:text-white shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400 font-black">Notifications</p>
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tighter">Priority notice stream</h1>
          <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl">Review all important updates, announcements and actions in one full-screen view designed for mobile-first navigation.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div key={notification.id} className="glass-card p-6 md:p-8 bg-white/80 dark:bg-neutral-950/80 border border-neutral-200 dark:border-white/10 shadow-xl transition-all hover:shadow-2xl rounded-3xl">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-3xl shrink-0 ${notification.type === 'critical' ? 'bg-error-100 text-error-700' : notification.type === 'info' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 dark:text-neutral-300'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <h2 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">{notification.title}</h2>
                    <span className={`text-[10px] uppercase tracking-[0.3em] font-black ${notification.color}`}>{notification.time}</span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{notification.details}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
