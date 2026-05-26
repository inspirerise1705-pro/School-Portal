'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Loader2, ChevronLeft, ChevronRight, BookOpen, Edit3, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { StudentProfile, SchoolCalendarEvent, TimetableSlot, TimetableOverride } from '../types';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
}

type TabType = 'timetable' | 'events';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const EVENT_COLORS: Record<string, string> = {
  Holiday:      'bg-red-500/20 text-red-400 border-red-500/25',
  Exam:         'bg-violet-500/20 text-violet-400 border-violet-500/25',
  Activity:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/25',
  Announcement: 'bg-blue-500/20 text-blue-400 border-blue-500/25',
  Meeting:      'bg-amber-500/20 text-amber-400 border-amber-500/25',
  Lecture:      'bg-white/10 text-white/60 border-white/10',
};

export default function StudentCalendarView({ student }: Props) {
  const [tab, setTab]           = useState<TabType>('timetable');
  const [slots, setSlots]       = useState<TimetableSlot[]>([]);
  const [events, setEvents]     = useState<SchoolCalendarEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear,  setCurrentYear]  = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!student?.class_id) return;
    setLoading(true);
    const [slotsRes, eventsRes] = await Promise.all([
      supabase
        .from('timetable_slots')
        .select('*, subjects(name, color), teachers(name)')
        .eq('class_id', student.class_id)
        .order('period_number'),
      supabase
        .from('calendar_events')
        .select('*')
        .eq('school_id', student.school_id)
        .or(`class_id.eq.${student.class_id},is_global.eq.true`)
        .order('date'),
    ]);
    setSlots((slotsRes.data ?? []) as TimetableSlot[]);
    setEvents((eventsRes.data ?? []) as SchoolCalendarEvent[]);
    setLoading(false);
  }, [student]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Group slots by day
  const slotsByDay = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week === day).sort((a, b) => a.period_number - b.period_number);
    return acc;
  }, {} as Record<string, TimetableSlot[]>);

  // Events for selected month
  const monthEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Build calendar
  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const eventDateMap = new Map<string, SchoolCalendarEvent[]>();
  monthEvents.forEach(e => {
    const key = e.date.split('T')[0];
    if (!eventDateMap.has(key)) eventDateMap.set(key, []);
    eventDateMap.get(key)!.push(e);
  });

  const selectedEvents = selectedDate ? (eventDateMap.get(selectedDate) ?? []) : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
  };

  const fmt = (t: string) => {
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Calendar</h1>
        <p className="text-sm text-white/40 mt-1">Timetable and school events</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1 w-full sm:w-72">
        {([
          { key: 'timetable', label: 'Timetable', icon: Clock },
          { key: 'events',    label: 'Events',    icon: Calendar },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-black transition ${
              tab === key ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-white/30" /></div>
      ) : (
        <>
          {/* ── TIMETABLE ── */}
          {tab === 'timetable' && (
            <>
              {slots.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 text-white/30">
                  <Clock className="h-12 w-12 opacity-40" />
                  <p className="text-sm">Timetable not set up yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {DAYS.map(day => {
                    const daySlots = slotsByDay[day];
                    if (daySlots.length === 0) return null;
                    return (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl border border-white/10 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">{day}</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                          {daySlots.map(slot => (
                            <div key={slot.id} className="flex items-center gap-3 px-4 py-3">
                              <div
                                className="w-1 h-8 rounded-full shrink-0"
                                style={{ background: slot.subjects?.color ?? '#3B82F6' }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">
                                  {slot.subjects?.name ?? 'Free Period'}
                                </p>
                                <p className="text-xs text-white/40 truncate">
                                  {slot.teachers?.name ?? '—'}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-semibold text-white/60">{fmt(slot.start_time)}</p>
                                <p className="text-[10px] text-white/30">{fmt(slot.end_time)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── EVENTS ── */}
          {tab === 'events' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Calendar grid */}
              <div className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="text-sm font-black">{MONTHS[currentMonth]} {currentYear}</h3>
                  <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="text-center text-[10px] text-white/30 font-bold py-1">{d}</div>
                  ))}
                </div>

                {/* Date cells */}
                <div className="grid grid-cols-7 gap-1">
                  {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day  = i + 1;
                    const key  = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const evts = eventDateMap.get(key) ?? [];
                    const isToday = key === new Date().toISOString().split('T')[0];
                    const isSel  = key === selectedDate;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSel ? null : key)}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition relative ${
                          isSel  ? 'bg-blue-500 text-white'
                          : isToday ? 'bg-blue-500/20 text-blue-300'
                          : evts.length > 0 ? 'bg-white/10 text-white hover:bg-white/15'
                          : 'text-white/30 hover:bg-white/5'
                        }`}
                      >
                        {day}
                        {evts.length > 0 && !isSel && (
                          <div className="flex gap-0.5">
                            {evts.slice(0, 3).map((e, j) => (
                              <div key={j} className="h-1 w-1 rounded-full bg-blue-400" />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event detail panel */}
              <div className="space-y-3">
                {selectedDate ? (
                  <>
                    <h3 className="text-sm font-black text-white/60">
                      {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    {selectedEvents.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-12 text-white/30 glass-card rounded-2xl border border-white/10">
                        <Calendar className="h-8 w-8 opacity-40" />
                        <p className="text-sm">No events on this day</p>
                      </div>
                    ) : (
                      selectedEvents.map(e => (
                        <motion.div
                          key={e.id}
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                          className={`glass-card rounded-2xl border p-4 ${EVENT_COLORS[e.type] ?? EVENT_COLORS.Lecture}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{e.type}</span>
                              <p className="text-sm font-black mt-0.5">{e.title}</p>
                              {e.description && <p className="text-xs opacity-60 mt-1 leading-relaxed">{e.description}</p>}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-black text-white/60">Upcoming Events</h3>
                    {monthEvents.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-12 text-white/30 glass-card rounded-2xl border border-white/10">
                        <Calendar className="h-8 w-8 opacity-40" />
                        <p className="text-sm">No events this month</p>
                      </div>
                    ) : (
                      monthEvents.slice(0, 6).map(e => (
                        <div key={e.id} className={`glass-card rounded-2xl border p-3 flex items-center gap-3 ${EVENT_COLORS[e.type] ?? EVENT_COLORS.Lecture}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{e.title}</p>
                            <p className="text-[11px] opacity-60">
                              {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {e.type}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
