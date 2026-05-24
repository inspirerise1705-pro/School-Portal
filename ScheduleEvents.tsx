import { Calendar, Clock, MapPin } from 'lucide-react';

const schedule = [
  { time: '09:00 AM', subject: 'Social Science', class: 'Class 6-A', room: 'Room 102', type: 'Lecture' },
  { time: '11:00 AM', subject: 'Hindi Lit.', class: 'Class 7-B', room: 'Hall B', type: 'Seminar' },
  { time: '01:30 PM', subject: 'Staff Meeting', class: 'Faculty Hub', room: 'Conf. Room', type: 'Administrative' },
  { time: '03:00 PM', subject: 'Mathematics', class: 'Class 6-A', room: 'Room 102', type: 'Workshop' },
];

export default function ScheduleEvents() {
  return (
    <div className="glass-card p-8 h-full bg-white/50 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tighter">Teaching Timeline</h2>
          <p className="text-neutral-500 text-sm font-semibold">Your pedagogical stream for the current session.</p>
        </div>
        <div className="flex gap-2 p-1.5 glass-panel bg-neutral-50 rounded-2xl border-neutral-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
            <button 
              key={day} 
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                day === 'Mon' ? 'bg-primary-500 text-white shadow-lg scale-105' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {schedule.map((session, idx) => (
          <div key={idx} className="glass-panel p-6 bg-white/80 border-t-4 border-primary-500 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{session.time}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                session.type === 'Lecture' ? 'bg-primary-50 text-primary-600' :
                session.type === 'Seminar' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'
              }`}>{session.type}</span>
            </div>
            
            <h3 className="font-extrabold text-neutral-900 text-lg leading-tight mb-2 group-hover:translate-x-1 transition-transform">{session.subject}</h3>
            <p className="text-xs font-bold text-neutral-500 mb-6">{session.class}</p>
            
            <div className="flex items-center gap-2 text-neutral-400">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{session.room}</span>
            </div>
          </div>
        ))}

        <button className="glass-panel p-6 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:bg-white transition-all bg-neutral-50/50">
          <div className="w-10 h-10 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5 text-neutral-300" />
          </div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Add Engagement</p>
        </button>
      </div>
    </div>
  );
}
