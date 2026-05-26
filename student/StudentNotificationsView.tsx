'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, CheckCheck, Loader2, BookOpen, CheckCircle2,
  Megaphone, ClipboardList, MessageCircle, Info, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { StudentProfile, NotificationData } from '../types';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
  session:       Session;
  onRead:        () => void;
}

type FilterType = 'all' | 'unread' | 'read';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  quiz_assigned:   { label: 'Quiz',         icon: BookOpen,      cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  grade_published: { label: 'Grade',        icon: CheckCircle2,  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  announcement:    { label: 'Announcement', icon: Megaphone,     cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  task_assigned:   { label: 'Task',         icon: ClipboardList, cls: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  doubt_answered:  { label: 'Doubt',        icon: MessageCircle, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  system:          { label: 'System',       icon: Info,          cls: 'bg-white/10 text-white/50 border-white/10' },
};

const DEFAULT_TYPE = { label: 'Notice', icon: Bell, cls: 'bg-white/10 text-white/50 border-white/10' };

export default function StudentNotificationsView({ session, onRead }: Props) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState<FilterType>('all');
  const [markingAll, setMarkingAll]       = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', session.user.id)
      .order('created_at', { ascending: false });
    setNotifications((data ?? []) as NotificationData[]);
    setLoading(false);
  }, [session.user.id]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    onRead();
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onRead();
    }
    setMarkingAll(false);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read')   return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Notifications</h1>
          <p className="text-sm text-white/40 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <motion.button
            onClick={markAllAsRead}
            disabled={markingAll}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/60 hover:bg-white/10 transition disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            {markingAll
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <CheckCheck className="h-3.5 w-3.5" />
            }
            Mark all as read
          </motion.button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          { key: 'all',    label: 'All',    count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read',   label: 'Read',   count: notifications.length - unreadCount },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              filter === key ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/15'
            }`}
          >
            {label}
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${filter === key ? 'bg-white/20' : 'bg-white/10'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-white/30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-white/30">
          <Bell className="h-12 w-12 opacity-40" />
          <p className="text-sm font-semibold">
            {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_TYPE;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass-card rounded-2xl border p-4 flex gap-4 items-start transition ${
                    n.read ? 'border-white/10 opacity-60' : 'border-white/15 opacity-100'
                  }`}
                >
                  {/* Icon */}
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${cfg.cls}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm font-black truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{n.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-white/30 whitespace-nowrap">{fmtTime(n.created_at)}</span>
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 text-white/40 hover:text-white transition"
                            title="Mark as read"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
