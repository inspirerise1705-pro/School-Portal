'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Calendar, Clock, Loader2, ChevronLeft, ChevronRight,
  MapPin, AlertCircle, Megaphone, PartyPopper, BookOpen,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { StudentProfile, SchoolCalendarEvent, TimetableSlot } from '../types';
import { DUMMY_TIMETABLE, DUMMY_EVENTS } from './dummyStudentData';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
}

type TabType = 'timetable' | 'events';

const WEEKDAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const ALL_DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const EVENT_STYLE: Record<string, { cls: string; icon: React.ElementType }> = {
  Exam:         { cls: 'bg-violet-500/20 text-violet-300 border-violet-500/30',  icon: BookOpen     },
  Holiday:      { cls: 'bg-red-500/20 text-red-300 border-red-500/30',          icon: MapPin       },
  Activity:     { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: PartyPopper },
  Announcement: { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30',       icon: Megaphone    },
  Meeting:      { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30',    icon: AlertCircle  },
  Lecture:      { cls: 'bg-white/10 text-white/60 border-white/10',             icon: BookOpen     },
};
const DOT_COLOR: Record<string, string> = {
  Exam: 'bg-violet-400', Holiday: 'bg-red-400', Activity: 'bg-emerald-400',
  Announcement: 'bg-blue-400', Meeting: 'bg-amber-400', Lecture: 'bg-white/40',
};

function fmt12(t: string) {
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

export default function StudentCalendarView({ student }: Props) {
  const [tab, setTab]         = useState<TabType>('timetable');
  const [slots, setSlots]     = useState<TimetableSlot[]>([]);
  const [events, setEvents]   = useState<SchoolCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear,  setCurrentYear]  = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!student?.class_id) return;
    setLoading(true);
    const [slotsRes, eventsRes] = await Promise.all([
      supabase.from('timetable_slots')
        .select('*, subjects(name, color), teachers(name)')
        .eq('class_id', student.class_id).order('period_number'),
      supabase.from('calendar_events').select('*')
        .eq('school_id', student.school_id)
        .or(`class_id.eq.${student.class_id},is_global.eq.true`)
        .order('date'),
    ]);
    setSlots(slotsRes.data?.length ? (slotsRes.data as TimetableSlot[]) : DUMMY_TIMETABLE);
    setEvents(eventsRes.data?.length ? (eventsRes.data as SchoolCalendarEvent[]) : DUMMY_EVENTS);
    setLoading(false);
  }, [student]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived data ──────────────────────────────────────────────
  const slotsByDay = WEEKDAYS.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week === day).sort((a, b) => a.period_number - b.period_number);
    return acc;
  }, {} as Record<string, TimetableSlot[]>);

  // Today's day name
  const todayDow    = ALL_DAYS[new Date().getDay()];
  const todaySlots  = slotsByDay[todayDow] ?? [];
  const isTodayOpen = WEEKDAYS.includes(todayDow);

  // Calendar events map for current month
  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayKey    = new Date().toISOString().split('T')[0];

  const eventDateMap = new Map<string, SchoolCalendarEvent[]>();
  events.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const k = e.date.split('T')[0];
      if (!eventDateMap.has(k)) eventDateMap.set(k, []);
      eventDateMap.get(k)!.push(e);
    }
  });

  const selectedEvents = selectedDate ? (eventDateMap.get(selectedDate) ?? []) : [];

  // All upcoming events (from today forward, sorted)
  const upcoming = events
    .filter(e => e.date.split('T')[0] >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const prevMonth = () => {
    setCurrentMonth(m => { if (m === 0) { setCurrentYear(y => y - 1); return 11; } return m - 1; });
    setSelectedDate(null);
  };
  const nextMonth = () => {
    setCurrentMonth(m => { if (m === 11) { setCurrentYear(y => y + 1); return 0; } return m + 1; });
    setSelectedDate(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Calendar</h1>
        <p className="text-sm text-white/40 mt-1">Weekly timetable &amp; school events</p>
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
            <div className="space-y-4">
              {/* Today's schedule callout */}
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden"
              >
                <div className={`px-4 py-3 border-b border-white/10 flex items-center justify-between ${
                  isTodayOpen ? 'bg-blue-500/10' : 'bg-red-500/10'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isTodayOpen ? 'bg-blue-400 animate-pulse' : 'bg-red-400'}`} />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/80">
                      Today — {todayDow}
                    </h3>
                  </div>
                  {!isTodayOpen && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/15 border border-red-500/25 px-2.5 py-0.5 rounded-full">
                      School Closed
                    </span>
                  )}
                </div>
                {isTodayOpen ? (
                  <div className="divide-y divide-white/5">
                    {todaySlots.length > 0 ? todaySlots.map(slot => (
                      <div key={slot.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-1 h-8 rounded-full shrink-0" style={{ background: slot.subjects?.color ?? '#3B82F6' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold">{slot.subjects?.name ?? 'Free Period'}</p>
                          <p className="text-xs text-white/40">{slot.teachers?.name ?? '—'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-white/60">{fmt12(slot.start_time)}</p>
                          <p className="text-[10px] text-white/30">{fmt12(slot.end_time)}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="px-4 py-4 text-sm text-white/30">No periods scheduled today.</p>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm text-white/40">
                    Enjoy your weekend! School resumes on Monday.
                  </div>
                )}
              </motion.div>

              {/* Full weekly timetable */}
              <div className="space-y-3">
                {WEEKDAYS.map((day, dayIdx) => {
                  const daySlots = slotsByDay[day];
                  const isToday = day === todayDow;
                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dayIdx * 0.04 }}
                      className={`glass-card rounded-2xl border overflow-hidden ${isToday ? 'border-blue-500/30' : 'border-white/10'}`}
                    >
                      <div className={`px-4 py-2.5 border-b border-white/10 flex items-center justify-between ${isToday ? 'bg-blue-500/10' : 'bg-white/5'}`}>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">{day}</h3>
                        {isToday && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">Today</span>
                        )}
                        {day === 'Saturday' && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded-full">Half Day</span>
                        )}
                      </div>
                      <div className="divide-y divide-white/5">
                        {daySlots.length > 0 ? daySlots.map(slot => (
                          <div key={slot.id} className="flex items-center gap-3 px-4 py-2.5">
                            <div className="w-0.5 h-7 rounded-full shrink-0" style={{ background: slot.subjects?.color ?? '#3B82F6' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{slot.subjects?.name ?? 'Free Period'}</p>
                              <p className="text-[11px] text-white/35 truncate">{slot.teachers?.name ?? '—'}</p>
                            </div>
                            <p className="text-[11px] font-semibold text-white/50 shrink-0">{fmt12(slot.start_time)}</p>
                          </div>
                        )) : (
                          <p className="px-4 py-3 text-xs text-white/25">No periods</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Sunday — always closed */}
                <div className="glass-card rounded-2xl border border-red-500/15 overflow-hidden opacity-50">
                  <div className="px-4 py-2.5 bg-red-500/10 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-400/70">Sunday</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">School Closed</span>
                  </div>
                  <p className="px-4 py-3 text-xs text-white/25">No classes — rest day.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── EVENTS ── */}
          {tab === 'events' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Calendar grid */}
              <div className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="text-sm font-black">{MONTHS[currentMonth]} {currentYear}</h3>
                  <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {SHORT_DAY.map(d => (
                    <div key={d} className={`text-center text-[10px] font-bold py-1 ${d === 'Sun' ? 'text-red-400/60' : 'text-white/30'}`}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day  = i + 1;
                    const dow  = new Date(currentYear, currentMonth, day).getDay();
                    const isSun = dow === 0;
                    const key  = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const evts = eventDateMap.get(key) ?? [];
                    const isToday = key === todayKey;
                    const isSel   = key === selectedDate;
                    const isHoliday = evts.some(e => e.type === 'Holiday');
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSel ? null : key)}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition relative ${
                          isSel     ? 'bg-blue-500 text-white'
                          : isToday ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/40'
                          : isHoliday ? 'bg-red-500/15 text-red-300'
                          : isSun   ? 'text-red-400/40 bg-red-500/5'
                          : evts.length > 0 ? 'bg-white/10 text-white hover:bg-white/15'
                          : 'text-white/30 hover:bg-white/5'
                        }`}
                      >
                        {day}
                        {evts.length > 0 && !isSel && (
                          <div className="flex gap-0.5">
                            {evts.slice(0, 3).map((e, j) => (
                              <div key={j} className={`h-1 w-1 rounded-full ${DOT_COLOR[e.type] ?? 'bg-white/40'}`} />
                            ))}
                          </div>
                        )}
                        {isSun && evts.length === 0 && (
                          <div className="h-0.5 w-3 rounded-full bg-red-400/20 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 pt-3 border-t border-white/10">
                  {[
                    { color: 'bg-violet-400', label: 'Exam' },
                    { color: 'bg-red-400',    label: 'Holiday' },
                    { color: 'bg-emerald-400',label: 'Activity' },
                    { color: 'bg-blue-400',   label: 'Notice' },
                    { color: 'bg-amber-400',  label: 'Meeting' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${color}`} />
                      <span className="text-[10px] text-white/35">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events detail / upcoming panel */}
              <div className="space-y-3 min-h-0">
                {selectedDate ? (
                  <>
                    <h3 className="text-sm font-black text-white/60">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {new Date(selectedDate + 'T12:00:00').getDay() === 0 && (
                        <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">School Closed</span>
                      )}
                    </h3>
                    {selectedEvents.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-10 text-white/30 glass-card rounded-2xl border border-white/10">
                        <Calendar className="h-8 w-8 opacity-40" />
                        <p className="text-sm">No events on this day</p>
                      </div>
                    ) : (
                      selectedEvents.map(e => {
                        const { cls, icon: Icon } = EVENT_STYLE[e.type] ?? EVENT_STYLE.Lecture;
                        return (
                          <motion.div
                            key={e.id}
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                            className={`glass-card rounded-2xl border p-4 ${cls}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{e.type}</span>
                                <p className="text-sm font-black mt-0.5">{e.title}</p>
                                {e.description && <p className="text-xs opacity-60 mt-1 leading-relaxed">{e.description}</p>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <button onClick={() => setSelectedDate(null)} className="text-xs text-white/30 hover:text-white/60 transition mt-1">
                      ← Back to upcoming
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-black text-white/60">Upcoming Events</h3>
                    {upcoming.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-10 text-white/30 glass-card rounded-2xl border border-white/10">
                        <Calendar className="h-8 w-8 opacity-40" />
                        <p className="text-sm">No upcoming events</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcoming.map((e, idx) => {
                          const { cls, icon: Icon } = EVENT_STYLE[e.type] ?? EVENT_STYLE.Lecture;
                          const d = new Date(e.date + 'T12:00:00');
                          const daysAway = Math.ceil((d.getTime() - Date.now()) / 86400000);
                          return (
                            <motion.div
                              key={e.id}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className={`glass-card rounded-2xl border p-3 flex items-start gap-3 ${cls}`}
                            >
                              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{e.title}</p>
                                <p className="text-[11px] opacity-60 mt-0.5">
                                  {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {' · '}
                                  {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `in ${daysAway} days`}
                                </p>
                              </div>
                              <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10`}>
                                {e.type}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
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
