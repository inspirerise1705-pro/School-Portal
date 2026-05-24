import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  MoreHorizontal,
  Bell,
  Activity,
  Award,
  BookOpen,
  CalendarDays,
  X,
  PlusCircle,
  Tag,
  AlignLeft,
  CalendarCheck,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { CalendarEvent, ClassInfo } from './types';
import { mockCalendarEvents } from './mockData';

interface TimelineViewProps {
  events?: CalendarEvent[];
  classes?: ClassInfo[];
}

export default function TimelineView({ events = mockCalendarEvents, classes = [] }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Lecture',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const filteredEvents = events.filter(e => 
    selectedType === 'All' || e.type === selectedType
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date.startsWith(todayStr));

  const handleAddEvent = () => {
    if (!newEvent.title) return;
    setIsAddModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setNewEvent({
      title: '',
      type: 'Lecture',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  return (
    <div className="p-4 md:p-8 w-full flex flex-col gap-6 animate-in fade-in duration-500 relative scrollbar-hide">
      {/* Event Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] glass-card bg-neutral-900 flex flex-col items-center justify-center text-white text-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1.1, rotate: 0 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl"
            >
              <CheckCircle2 className="w-12 h-12 text-primary-500" />
            </motion.div>
            <h3 className="text-3xl font-black tracking-tighter mb-2 uppercase">Schedule Updated</h3>
            <p className="text-sm font-bold opacity-60 max-w-sm">New event added to the school calendar.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Engagement Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden border border-white/5"
            >
               <div className="absolute top-0 right-0 w-48 h-48 primary-gradient blur-[100px] opacity-10 -mr-24 -mt-24 rounded-full" />
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-neutral-900 dark:bg-primary-500 rounded-2xl flex items-center justify-center shadow-xl">
                        <PlusCircle className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black tracking-tighter text-neutral-900 dark:text-white leading-none">Add New Event</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-2">New Entry</p>
                     </div>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-2xl transition-all"><X className="w-6 h-6 text-neutral-300 dark:text-neutral-700 hover:text-neutral-900 dark:hover:text-white" /></button>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1 opacity-60">Event Name</label>
                     <div className="relative group">
                        <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-primary-500 transition-colors" />
                        <input 
                           type="text" 
                           placeholder="e.g. History Test"
                           value={newEvent.title}
                           onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                           className="w-full pl-14 pr-6 py-5 glass-panel bg-neutral-50 dark:bg-white/5 border-none text-base font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20 placeholder:text-neutral-300" 
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1 opacity-60">Category</label>
                        <select 
                           value={newEvent.type}
                           onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                           className="w-full px-5 py-5 glass-panel bg-neutral-50 dark:bg-white/5 border-none text-xs font-black text-neutral-900 dark:text-white focus:ring-0"
                        >
                           <option>Lecture</option>
                           <option>Holiday</option>
                           <option>Activity</option>
                           <option>Announcement</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1 opacity-60">Date</label>
                        <input 
                           type="date" 
                           value={newEvent.date}
                           onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                           className="w-full px-5 py-5 glass-panel bg-neutral-50 dark:bg-white/5 border-none text-xs font-black text-neutral-900 dark:text-white focus:ring-0" 
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1 opacity-60">Details</label>
                     <div className="relative group">
                        <AlignLeft className="absolute left-5 top-5 w-4 h-4 text-neutral-300 group-focus-within:text-primary-500 transition-colors" />
                        <textarea 
                           placeholder="Add some details about the event..."
                           rows={4}
                           value={newEvent.description}
                           onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                           className="w-full pl-14 pr-6 py-5 glass-panel bg-neutral-50 dark:bg-white/5 border-none text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 leading-relaxed" 
                        />
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleAddEvent}
                  className="w-full py-6 bg-neutral-900 dark:bg-primary-500 text-white rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3 active:scale-95"
               >
                  Add Event to Calendar
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter flex items-center gap-3">
             <CalendarDays className="w-8 h-8 text-primary-500" /> School Calendar
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-xs md:text-sm font-bold opacity-100">Manage class schedules and upcoming events.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 dark:bg-primary-500 text-white rounded-[1.125rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add New Event
        </button>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-8 min-h-0 items-stretch">
        {/* Left: Calendar Grid */}
        <div className="flex flex-col gap-6 min-h-0 h-full">
          <div className="glass-card p-4 md:p-8 bg-white/95 dark:bg-neutral-950/95 flex-1 flex flex-col min-h-0 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
               <div className="flex items-center gap-6">
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter shrink-0">{monthName} {year}</h3>
                  <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl">
                    <button onClick={prevMonth} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:shadow-sm rounded-xl transition-all text-neutral-900 dark:text-white"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextMonth} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:shadow-sm rounded-xl transition-all text-neutral-900 dark:text-white"><ChevronRight className="w-5 h-5" /></button>
                  </div>
               </div>
               
               {/* Desktop: Horizontal Chips */}
               <div className="hidden sm:flex gap-2 pb-2 sm:pb-0">
                 {['All', 'Lecture', 'Holiday', 'Activity'].map(type => (
                   <button 
                     key={type}
                     onClick={() => setSelectedType(type)}
                     className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all shrink-0 ${
                       selectedType === type 
                        ? 'bg-neutral-900 dark:bg-primary-500 text-white shadow-xl scale-105' 
                        : 'bg-neutral-800 dark:bg-neutral-950 text-neutral-100 dark:text-neutral-300 border border-neutral-800 dark:border-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-900'
                     }`}
                   >
                     {type}
                   </button>
                 ))}
               </div>

               {/* Mobile: Dropdown */}
               <div className="sm:hidden relative w-full max-w-xs">
                 <button 
                   onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                   className="flex items-center justify-between w-full px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all bg-neutral-900 dark:bg-primary-500 text-white shadow-xl"
                 >
                   {selectedType} <ChevronDown className="w-4 h-4" />
                 </button>
                 {isFilterDropdownOpen && (
                   <div className="absolute top-full left-0 mt-2 w-full bg-neutral-900 dark:bg-neutral-800 rounded-2xl shadow-2xl z-50 border border-neutral-800 overflow-hidden">
                     {['All', 'Lecture', 'Holiday', 'Activity'].map(type => (
                       <button
                         key={type}
                         onClick={() => {
                           setSelectedType(type);
                           setIsFilterDropdownOpen(false);
                         }}
                         className={`block w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-[0.15em] transition-all ${
                           selectedType === type
                             ? 'bg-primary-500 text-white'
                             : 'text-neutral-100 hover:bg-neutral-800'
                         }`}
                       >
                         {type}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>

            <div className="min-w-full md:min-w-0">
              <div className="grid grid-cols-4 md:grid-cols-7 gap-px rounded-3xl overflow-hidden bg-neutral-900 dark:bg-neutral-950 shadow-xl auto-rows-[minmax(100px,auto)]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="hidden md:flex py-4 bg-neutral-900 dark:bg-neutral-950 text-center text-[10px] font-black uppercase tracking-widest text-neutral-100 border-b border-neutral-800 dark:border-neutral-800 items-center justify-center">
                    {day}
                  </div>
                ))}
                {/* Mobile day headers */}
                {['S', 'M', 'T', 'W'].map(day => (
                  <div key={`mobile-${day}`} className="md:hidden py-3 bg-neutral-900 dark:bg-neutral-950 text-center text-[9px] font-black uppercase tracking-widest text-neutral-100 border-b border-neutral-800 dark:border-neutral-800 flex items-center justify-center">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-neutral-900 dark:bg-neutral-950 border border-neutral-800 dark:border-neutral-800 hidden md:block" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = new Date(year, currentDate.getMonth(), day).toISOString().split('T')[0];
                  const dayEvents = filteredEvents.filter(e => e.date.startsWith(dateStr));
                  const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

                  return (
                    <div key={day} className={`bg-neutral-900 dark:bg-neutral-950 p-1.5 md:p-3 min-h-[100px] md:min-h-[160px] flex flex-col gap-1.5 md:gap-2 transition-all hover:bg-neutral-800 dark:hover:bg-neutral-900 relative group cursor-pointer border border-neutral-800 dark:border-neutral-800 ${isToday ? 'ring-2 ring-primary-500 z-10 bg-neutral-900 dark:bg-neutral-950' : ''}`}>
                      <div className="flex justify-between items-start">
                         <span className={`text-[10px] md:text-sm font-black ${isToday ? 'text-primary-300' : 'text-neutral-100 group-hover:text-white'}`}>{day}</span>
                         {isToday && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />}
                      </div>
                      <div className="flex flex-col gap-0.5 md:gap-1 overflow-hidden flex-1 min-h-0">
                        {dayEvents.slice(0, 3).map(e => (
                          <div key={e.id} className={`px-1.5 py-1 md:px-2 md:py-1.5 rounded-lg text-[7px] md:text-[10px] font-bold truncate transition-transform hover:scale-[1.02] shadow-sm ${
                            e.type === 'Holiday' ? 'bg-error-500/25 text-error-100 dark:text-error-100 border border-error-500/20' :
                            e.type === 'Activity' ? 'bg-success-500/25 text-success-100 dark:text-success-100 border border-success-500/20' :
                            'bg-primary-500/25 text-primary-100 dark:text-primary-100 border border-primary-500/20'
                          }` } title={e.title}>
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[7px] md:text-[8px] font-black text-neutral-400 dark:text-neutral-500 ml-1 opacity-60">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Institutional Stream */}
        <div className="flex flex-col gap-6 min-h-0 h-full">
           <div className="glass-card p-8 bg-white/70 dark:bg-neutral-900/40 shadow-inner h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-8 flex items-center gap-3 tracking-tighter">
                  <Bell className="w-6 h-6 text-warning-500 animate-bounce" /> Institutional Stream
                </h3>
                <div className="space-y-8">
                  {events.filter(e => e.type === 'Holiday' || e.type === 'Activity').slice(0, 3).map(event => (
                    <div key={event.id} className="flex gap-6 group cursor-pointer">
                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-neutral-100 dark:bg-white/5 min-w-[60px] border border-transparent group-hover:border-primary-500/20 transition-all">
                         <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase leading-none">{new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                         <span className="text-2xl font-black text-neutral-900 dark:text-white leading-none">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0 pb-6 border-b border-neutral-100 dark:border-white/5">
                         <h4 className="text-base font-black text-neutral-900 dark:text-neutral-200 truncate tracking-tight">"{event.title}"</h4>
                         <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-600 mt-2 leading-relaxed opacity-80">{event.description || 'Instructional cycle milestone.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="w-full">
         <div className="glass-card p-6 bg-neutral-900 dark:bg-primary-500 text-white shadow-2xl relative overflow-hidden border-none rounded-[2.5rem]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] opacity-30 -mr-32 -mt-32 rounded-full" />
            <div className="relative z-10 flex-1">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <CalendarCheck className="w-6 h-6 text-primary-400 dark:text-white" />
                     <h3 className="text-xl font-black tracking-tighter uppercase leading-none">Today's Schedule</h3>
                  </div>
                  <span className="px-3 py-1 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
               </div>

               {todayEvents.length > 0 ? (
                  <div className="space-y-4">
                     {todayEvents.map(event => (
                        <div key={event.id} className="p-4 rounded-2xl bg-white/10 dark:bg-white/10 border border-white/10 flex items-center justify-between group hover:bg-white/15 dark:hover:bg-white/15 transition-all cursor-pointer">
                           <div className="flex items-center gap-5">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${event.type === 'Lecture' ? 'bg-primary-500/25' : 'bg-warning-500/25'}`}>
                                 <Clock className={`w-4 h-4 ${event.type === 'Lecture' ? 'text-primary-300' : 'text-warning-300'}`} />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-black tracking-tight truncate text-white">"{event.title}"</p>
                                 <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-1 text-white/80">{event.type} • 09:30 AM</p>
                              </div>
                           </div>
                           <MoreHorizontal className="w-5 h-5 opacity-0 group-hover:opacity-60 transition-opacity text-white" />
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 opacity-30">
                     <div className="w-16 h-16 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center">
                        <BookOpen className="w-8 h-8" />
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Plans</p>
                        <p className="text-[10px] font-bold opacity-60 mt-1">Nothing scheduled for today.</p>
                     </div>
                  </div>
               )}
               
               <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-300 mb-4 flex items-center gap-2">
                     <Activity className="w-3.5 h-3.5" /> Class Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                     {[
                       { sub: 'History', time: '08:00' },
                       { sub: 'Geography', time: '10:30' },
                       { sub: 'Sanskrit', time: '13:00' },
                       { sub: 'Mathematics', time: '14:30' }
                     ].map((s, i) => (
                       <div key={i} className="p-3 bg-white/10 rounded-2xl border border-white/10 flex flex-col">
                          <span className="text-[8px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">{s.time}</span>
                          <span className="text-[10px] font-black truncate text-white">{s.sub}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 w-full py-4 bg-white text-neutral-900 rounded-[1.25rem] text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
               Schedule Event
            </button>
         </div>
      </div>
    </div>
  );
}
