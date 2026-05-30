'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus,
  Edit2, X, Check, Loader2, MapPin, PartyPopper,
  Megaphone, BookOpen, AlertCircle, Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface CalEvent {
  id:          string;
  title:       string;
  date:        string;
  type:        string;
  description: string | null;
  is_global:   boolean;
  class_id:    string | null;
  class_name?: string;
}

interface ClassOption { id: string; name: string; section: string; }

const EVENT_STYLES: Record<string, { bg: string; border: string; text: string; dot: string; icon: React.ElementType }> = {
  Holiday:      { bg: 'bg-red-500/15',     border: 'border-red-500/25',     text: 'text-red-300',     dot: 'bg-red-400',     icon: MapPin      },
  Exam:         { bg: 'bg-primary-500/15',  border: 'border-primary-500/25',  text: 'text-primary-300',  dot: 'bg-primary-400',  icon: BookOpen    },
  Activity:     { bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', text: 'text-emerald-300', dot: 'bg-emerald-400', icon: PartyPopper },
  Announcement: { bg: 'bg-blue-500/15',    border: 'border-blue-500/25',    text: 'text-blue-300',    dot: 'bg-blue-400',    icon: Megaphone   },
  Meeting:      { bg: 'bg-amber-500/15',   border: 'border-amber-500/25',   text: 'text-amber-300',   dot: 'bg-amber-400',   icon: AlertCircle },
  Lecture:      { bg: 'bg-slate-500/15',   border: 'border-slate-500/25',   text: 'text-slate-300',   dot: 'bg-slate-400',   icon: BookOpen    },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const EVENT_TYPES = ['Holiday','Exam','Activity','Announcement','Meeting','Lecture'] as const;

interface FormState {
  title:       string;
  date:        string;
  type:        string;
  description: string;
  is_global:   boolean;
  class_id:    string;
}

const EMPTY_FORM: FormState = { title: '', date: '', type: 'Announcement', description: '', is_global: true, class_id: '' };

export default function AdminCalendarView({ schoolId, adminId }: AdminCtx) {
  const [events,  setEvents]  = useState<CalEvent[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [month,   setMonth]   = useState(new Date().getMonth());
  const [year,    setYear]    = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form,    setForm]    = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [evtRes, clsRes] = await Promise.all([
      supabase.from('calendar_events').select('*')
        .eq('school_id', schoolId).order('date'),
      supabase.from('classes').select('id, name, section').eq('school_id', schoolId).order('name'),
    ]);
    const cls = (clsRes.data ?? []) as ClassOption[];
    setClasses(cls);
    const clsMap = new Map(cls.map(c => [c.id, `${c.name} ${c.section}`]));
    setEvents(((evtRes.data ?? []) as any[]).map(e => ({
      ...e,
      class_name: e.class_id ? clsMap.get(e.class_id) : undefined,
    })));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey    = new Date().toISOString().split('T')[0];

  const eventsInMonth = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const eventMap = new Map<string, CalEvent[]>();
  eventsInMonth.forEach(e => {
    const k = e.date.split('T')[0];
    if (!eventMap.has(k)) eventMap.set(k, []);
    eventMap.get(k)!.push(e);
  });

  const selectedEvents = selectedDate ? (eventMap.get(selectedDate) ?? []) : [];

  const prevMonth = () => { setMonth(m => { if (m === 0) { setYear(y => y-1); return 11; } return m-1; }); setSelectedDate(null); };
  const nextMonth = () => { setMonth(m => { if (m === 11) { setYear(y => y+1); return 0; } return m+1; }); setSelectedDate(null); };

  const openAdd = (date?: string) => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: date ?? '' });
    setShowModal(true);
  };

  const openEdit = (evt: CalEvent) => {
    setEditing(evt.id);
    setForm({
      title:       evt.title,
      date:        evt.date.split('T')[0],
      type:        evt.type,
      description: evt.description ?? '',
      is_global:   evt.is_global,
      class_id:    evt.class_id ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    const payload = {
      school_id:   schoolId,
      teacher_id:  adminId,
      title:       form.title.trim(),
      date:        form.date,
      type:        form.type,
      description: form.description.trim() || null,
      is_global:   form.is_global,
      class_id:    (!form.is_global && form.class_id) ? form.class_id : null,
    };
    if (editing) {
      await supabase.from('calendar_events').update(payload).eq('id', editing);
    } else {
      await supabase.from('calendar_events').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    setEditing(null);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from('calendar_events').delete().eq('id', id);
    setDeleting(null);
    setSelectedDate(null);
    fetchAll();
  };

  const upcomingAll = events
    .filter(e => e.date.split('T')[0] >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">School Calendar</h1>
          <p className="text-sm opacity-75 mt-1">Events here appear in all student and teacher calendars</p>
        </div>
        <button onClick={() => openAdd()}
          className="flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-sm font-black transition">
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* Calendar grid */}
          <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-4 backdrop-blur-sm sm:p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-700/70 hover:bg-slate-700 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-base font-black">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-700/70 hover:bg-slate-700 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {SHORT_DAY.map(d => (
                <div key={d} className={`text-center text-[10px] font-bold py-1 ${d === 'Sun' ? 'text-red-400/60' : 'text-slate-500'}`}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day  = i + 1;
                const dow  = new Date(year, month, day).getDay();
                const key  = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const evts = eventMap.get(key) ?? [];
                const isToday = key === todayKey;
                const isSel   = key === selectedDate;
                return (
                  <button
                    key={day}
                    onClick={() => { setSelectedDate(isSel ? null : key); }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-start gap-0.5 text-[11px] font-semibold transition pt-1.5 relative ${
                      isSel     ? 'bg-primary-600 text-white'
                      : isToday ? 'bg-primary-600/20 text-primary-300 ring-1 ring-primary-500/40'
                      : dow === 0 ? 'text-red-400/50 bg-red-500/5'
                      : evts.length > 0 ? 'bg-white/8 text-white hover:bg-white/12'
                      : 'text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    {day}
                    {evts.length > 0 && !isSel && (
                      <div className="flex gap-0.5 mt-0.5">
                        {evts.slice(0, 3).map((e, j) => (
                          <div key={j} className={`h-1 w-1 rounded-full ${EVENT_STYLES[e.type]?.dot ?? 'bg-slate-400'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 pt-3 border-t border-slate-700/40">
              {EVENT_TYPES.map(t => (
                <div key={t} className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${EVENT_STYLES[t]?.dot}`} />
                  <span className="text-[10px] text-slate-400">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: selected day events + upcoming */}
          <div className="space-y-4">
            {selectedDate ? (
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-black">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                  </p>
                  <button onClick={() => openAdd(selectedDate)}
                    className="h-7 w-7 rounded-lg bg-primary-600/20 border border-primary-500/25 flex items-center justify-center hover:bg-primary-600/30 transition">
                    <Plus className="h-3.5 w-3.5 text-primary-400" />
                  </button>
                </div>
                {selectedEvents.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-slate-500">No events. Click + to add one.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map(e => {
                      const s = EVENT_STYLES[e.type] ?? EVENT_STYLES.Lecture;
                      const Icon = s.icon;
                      return (
                        <div key={e.id} className={`${s.bg} border ${s.border} rounded-xl p-3`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className={`h-3.5 w-3.5 ${s.text} shrink-0`} />
                              <div className="min-w-0">
                                <p className={`text-xs font-bold ${s.text} truncate`}>{e.title}</p>
                                {e.description && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{e.description}</p>}
                                <p className="text-[9px] text-slate-500 mt-0.5">{e.is_global ? 'All classes' : (e.class_name ?? 'Specific class')} · {e.type}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => openEdit(e)} className="h-6 w-6 rounded-lg hover:bg-slate-700 flex items-center justify-center transition">
                                <Edit2 className="h-3 w-3 text-slate-400" />
                              </button>
                              <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id}
                                className="h-6 w-6 rounded-lg hover:bg-red-500/15 flex items-center justify-center transition">
                                {deleting === e.id ? <Loader2 className="h-3 w-3 animate-spin text-slate-400" /> : <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-400" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {/* Upcoming */}
            <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-4 backdrop-blur-sm">
              <p className="text-sm font-black mb-3 text-slate-300">Upcoming Events</p>
              {upcomingAll.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No upcoming events.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingAll.map(e => {
                    const s = EVENT_STYLES[e.type] ?? EVENT_STYLES.Lecture;
                    const d = new Date(e.date + 'T12:00:00');
                    const daysAway = Math.ceil((d.getTime() - Date.now()) / 86400000);
                    return (
                      <div key={e.id} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
                        <div className={`h-2 w-2 rounded-full ${s.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{e.title}</p>
                          <p className="text-[10px] text-slate-500">
                            {d.toLocaleDateString('en-IN', { day:'numeric', month:'short' })} ·{' '}
                            {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d away`}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(e)} className="h-6 w-6 rounded-lg hover:bg-slate-700 flex items-center justify-center transition">
                            <Edit2 className="h-3 w-3 text-slate-500" />
                          </button>
                          <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id}
                            className="h-6 w-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition">
                            <Trash2 className="h-3 w-3 text-slate-500 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0f1629] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black">{editing ? 'Edit Event' : 'Add Event'}</h2>
                <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Diwali Holiday"
                    className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Date *</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition">
                      {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Optional details…"
                    className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition resize-none" />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">Audience</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setForm(f => ({ ...f, is_global: true, class_id: '' }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition ${
                        form.is_global ? 'bg-primary-600/20 border-primary-500/40 text-primary-300' : 'bg-slate-800 border-slate-600/40 text-slate-400'
                      }`}
                    >All classes</button>
                    <button
                      onClick={() => setForm(f => ({ ...f, is_global: false }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition ${
                        !form.is_global ? 'bg-primary-600/20 border-primary-500/40 text-primary-300' : 'bg-slate-800 border-slate-600/40 text-slate-400'
                      }`}
                    >Specific class</button>
                  </div>
                  {!form.is_global && (
                    <select value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
                      className="mt-2 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition">
                      <option value="">-- Select class --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl bg-slate-700/70 py-2.5 text-sm font-bold hover:bg-slate-700 transition">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.date}
                  className="flex-1 rounded-xl bg-primary-600 hover:bg-primary-500 py-2.5 text-sm font-black disabled:opacity-50 flex items-center justify-center gap-2 transition">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editing ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
