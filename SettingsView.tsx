import { useState } from 'react';
import { 
  User, 
  Users,
  Lock, 
  Camera,
  LogOut,
  Shield,
  Settings,
  Zap,
  Check,
  GraduationCap,
  School
} from 'lucide-react';
import { Teacher } from './types';
import { WALLPAPERS, WallpaperType } from './constants';
import { mockStudents, mockClasses } from './mockData';

type PermissionSet = {
  allowDownloads: boolean;
  allowSubmissions: boolean;
  allowReview: boolean;
  allowExamAccess: boolean;
};

interface SettingsViewProps {
  teacher: Teacher;
  onLogout: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  currentWallpaper: WallpaperType;
  setWallpaper: (wp: WallpaperType) => void;
}

export default function SettingsView({ 
  teacher, 
  onLogout, 
  isDark, 
  setIsDark, 
  currentWallpaper, 
  setWallpaper 
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'themes' | 'permissions' | 'students'>('profile');
  const [generalPermissions, setGeneralPermissions] = useState<PermissionSet>({
    allowDownloads: true,
    allowSubmissions: true,
    allowReview: false,
    allowExamAccess: true,
  });

  const [managedStudents, setManagedStudents] = useState(
    mockStudents.slice(0, 4).map((student, index) => ({
      ...student,
      classId: mockClasses[index % mockClasses.length].id,
      useGeneral: true,
      permissions: {
        allowDownloads: true,
        allowSubmissions: true,
        allowReview: false,
        allowExamAccess: true,
      },
    }))
  );

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentNameDraft, setStudentNameDraft] = useState('');
  const [editingPermissionStudentId, setEditingPermissionStudentId] = useState<string | null>(null);
  const [permissionDrafts, setPermissionDrafts] = useState<Record<string, PermissionSet>>({});

  const handleToggleGeneralPermission = (key: keyof typeof generalPermissions) => {
    setGeneralPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startEditingStudentPermissions = (studentId: string) => {
    const student = managedStudents.find((item) => item.id === studentId);
    if (!student) return;
    setEditingPermissionStudentId(studentId);
    setPermissionDrafts(prev => ({ ...prev, [studentId]: { ...student.permissions } }));
  };

  const handleTogglePermissionDraft = (studentId: string, key: keyof PermissionSet) => {
    setPermissionDrafts(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [key]: !prev[studentId][key],
      },
    }));
  };

  const handleSavePermissionDraft = (studentId: string) => {
    const draft = permissionDrafts[studentId];
    if (!draft) return;
    setManagedStudents(prev => prev.map(s => s.id === studentId ? { ...s, permissions: draft, useGeneral: false } : s));
    setEditingPermissionStudentId(null);
  };

  const handleCancelPermissionDraft = () => {
    setEditingPermissionStudentId(null);
  };

  const handleToggleUseGeneral = (studentId: string) => {
    setManagedStudents(prev => prev.map(s => s.id === studentId ? { ...s, useGeneral: !s.useGeneral } : s));
    setEditingPermissionStudentId((current) => current === studentId ? null : current);
  };

  const applyGeneralToAll = () => {
    setManagedStudents(prev => prev.map(s => ({ ...s, permissions: { ...generalPermissions }, useGeneral: true })));
  };

  const copyGeneralToAllAsOverrides = () => {
    setManagedStudents(prev => prev.map(s => ({ ...s, permissions: { ...generalPermissions }, useGeneral: false })));
  };

  const handleEditStudent = (studentId: string) => {
    const student = managedStudents.find((item) => item.id === studentId);
    if (!student) return;
    setEditingStudentId(studentId);
    setStudentNameDraft(student.name);
  };

  const handleSaveStudent = () => {
    if (!editingStudentId) return;
    setManagedStudents((prev) => prev.map((item) => item.id === editingStudentId ? { ...item, name: studentNameDraft } : item));
    setEditingStudentId(null);
    setStudentNameDraft('');
  };

  const handleRemoveStudent = (studentId: string) => {
    setManagedStudents((prev) => prev.filter((item) => item.id !== studentId));
  };

  const handleMoveStudent = (studentId: string) => {
    const current = managedStudents.find((item) => item.id === studentId);
    if (!current) return;
    const targetIndex = (mockClasses.findIndex((c) => c.id === current.classId) + 1) % mockClasses.length;
    setManagedStudents((prev) => prev.map((item) => item.id === studentId ? { ...item, classId: mockClasses[targetIndex].id } : item));
  };

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 h-full pb-20 scrollbar-hide">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter flex items-center gap-6">
             <Settings className="w-10 h-10 md:w-14 md:h-14 text-neutral-900 dark:text-primary-500 animate-spin-slow" /> Settings
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-lg font-semibold ml-1 opacity-80 mt-2">Manage your profile and application preferences.</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center justify-center gap-3 px-10 py-5 bg-neutral-900 dark:bg-error-500 text-white rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black dark:hover:bg-error-600 transition-all shadow-2xl active:scale-95"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          {['profile', 'themes', 'permissions', 'students'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as any)}
              className={`rounded-full px-5 py-3 text-sm font-black transition-all ${activeTab === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-white/10 text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300 hover:bg-white/20'}`}
            >
              {tab === 'profile' ? 'Profile' : tab === 'themes' ? 'Themes' : tab === 'permissions' ? 'Permissions' : 'Students'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-8">
          <div className="space-y-6">
            <div className="glass-card p-8 bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-white/10 shadow-xl rounded-[2.5rem]">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2.25rem] bg-primary-500/10 text-primary-500 shadow-2xl">
                  <School className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white">Scrolls School</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-primary-500 mt-2">Institution Portal</p>
              </div>
              <div className="mt-8 grid gap-4">
                <ProfilePill label="School ID" value="#SS-2026-001" />
                <ProfilePill label="District" value="Silver Valley Education" />
                <ProfilePill label="Campus" value="Central Learning Hub" />
              </div>
            </div>
            <div className="glass-card p-8 bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-white/10 shadow-xl rounded-[2.5rem]">
              <h4 className="text-xl font-black mb-3">Teacher Info</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{teacher.name} • {teacher.role}</p>
              <div className="mt-6 grid gap-4">
                <ProfilePill label="Institutional ID" value="#PR-2026-912" />
                <ProfilePill label="Department" value="Senior Humanities" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="glass-card p-8 bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-white/10 shadow-xl rounded-[2.5rem]">
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Profile</h3>
                  <div className="grid gap-5">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Your Name</label>
                      <input type="text" defaultValue={teacher.name} className="w-full rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-950 p-4 text-sm font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Role</label>
                      <input type="text" defaultValue={teacher.role} className="w-full rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-950 p-4 text-sm font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20" />
                    </div>
                    <button className="w-full rounded-3xl bg-primary-500 py-4 text-sm font-black uppercase tracking-[0.3em] text-white hover:bg-primary-600 transition-all">Save profile</button>
                  </div>
                </div>
                <div className="glass-card p-8 bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-white/10 shadow-xl rounded-[2.5rem]">
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Password management</h3>
                  <div className="grid gap-5">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-950 p-4 text-sm font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Confirm Password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-950 p-4 text-sm font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20" />
                    </div>
                    <button className="w-full rounded-3xl bg-neutral-900 text-white py-4 text-sm font-black uppercase tracking-[0.3em] hover:bg-black transition-all">Update password</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="glass-card p-8 bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-white/10 shadow-xl rounded-[2.5rem]">
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Themes</h3>
                <div className="space-y-6">
                  <button onClick={() => setIsDark(!isDark)} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-950 p-5 text-left shadow-sm hover:border-primary-500 transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-neutral-900 dark:text-white">Dark mode</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Toggle the classwork and dashboard theme.</p>
                      </div>
                      <div className={`h-8 w-16 rounded-full p-1 ${isDark ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-800'}`}>
                        <div className={`h-6 w-6 rounded-full bg-white shadow-xl transition-transform duration-300 ${isDark ? 'translate-x-8' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    {WALLPAPERS.map((wp) => (
                      <button key={wp.id} onClick={() => setWallpaper(wp)} className={`overflow-hidden rounded-3xl border ${currentWallpaper.id === wp.id ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-neutral-200 dark:border-white/10'} transition-all`}> 
                        <img src={wp.url} alt={wp.name} className="h-24 w-full object-cover" referrerPolicy="no-referrer" />
                        <div className="p-3 text-xs font-black uppercase tracking-[0.25em] text-neutral-900 dark:text-white bg-white/80 dark:bg-black/60">{wp.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="glass-card p-8 bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-white/10 shadow-xl rounded-[2.5rem]">
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Permissions</h3>
                <div className="grid gap-4">
                  {Object.entries(generalPermissions).map(([key, value]) => (
                    <button key={key} onClick={() => handleToggleGeneralPermission(key as keyof typeof generalPermissions)} className={`rounded-3xl border p-5 text-left transition-all flex items-center justify-between ${value ? 'border-primary-500 bg-primary-500/10 shadow-sm' : 'border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950'}`}>
                      <div>
                        <p className="font-black text-neutral-900 dark:text-white">{key === 'allowDownloads' ? 'Downloads' : key === 'allowSubmissions' ? 'Submissions' : key === 'allowReview' ? 'Teacher review' : 'Exam access'}</p>
                        <p className="text-xs mt-2 text-neutral-500 dark:text-neutral-400">{value ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <span className={`inline-flex h-8 min-w-[3rem] items-center justify-center rounded-full px-3 text-[10px] font-black uppercase ${value ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>{value ? 'On' : 'Off'}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-8 rounded-3xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 p-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">General permissions apply across the platform. Use them to control downloads, submissions, review access, and exam distribution rights.</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={applyGeneralToAll} className="rounded-2xl bg-primary-500 text-white px-4 py-3 text-[10px] font-black uppercase">Use common for all students</button>
                  <button onClick={copyGeneralToAllAsOverrides} className="rounded-2xl bg-neutral-900 text-white px-4 py-3 text-[10px] font-black uppercase">Copy general to all (create overrides)</button>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="glass-card p-8 bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-white/10 shadow-xl rounded-[2.5rem]">
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Student permissions</h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-2xl bg-white/10 dark:bg-neutral-900/60">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Students inherit the general permissions by default. Customize per student below or use the buttons to apply/copy general settings to everyone.</p>
                    <div className="mt-3 flex gap-3">
                      <button onClick={applyGeneralToAll} className="rounded-2xl bg-primary-500 text-white px-4 py-2 text-[10px] font-black uppercase">Use common for all</button>
                      <button onClick={copyGeneralToAllAsOverrides} className="rounded-2xl bg-neutral-900 text-white px-4 py-2 text-[10px] font-black uppercase">Copy general to all</button>
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {managedStudents.map((student) => (
                    <div key={student.id} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-950 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="font-black text-neutral-900 dark:text-white">{student.name}</p>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Class {student.classId} • {student.grade}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleEditStudent(student.id)} className="rounded-2xl bg-neutral-900 text-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all">Edit</button>
                          <button type="button" onClick={() => handleMoveStudent(student.id)} className="rounded-2xl bg-primary-500 text-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition-all">Move</button>
                          <button type="button" onClick={() => handleRemoveStudent(student.id)} className="rounded-2xl bg-error-500 text-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-error-600 transition-all">Remove</button>
                        </div>
                      </div>
                      <div className="mt-4">
                        {editingPermissionStudentId === student.id ? (
                          <div className="grid gap-3">
                            <PermissionToggle label="Allow downloads" active={permissionDrafts[student.id]?.allowDownloads ?? student.permissions.allowDownloads} onClick={() => handleTogglePermissionDraft(student.id, 'allowDownloads')} />
                            <PermissionToggle label="Allow submissions" active={permissionDrafts[student.id]?.allowSubmissions ?? student.permissions.allowSubmissions} onClick={() => handleTogglePermissionDraft(student.id, 'allowSubmissions')} />
                            <PermissionToggle label="Allow review access" active={permissionDrafts[student.id]?.allowReview ?? student.permissions.allowReview} onClick={() => handleTogglePermissionDraft(student.id, 'allowReview')} />
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => handleSavePermissionDraft(student.id)} className="rounded-2xl bg-primary-500 text-white px-4 py-3 text-[10px] font-black uppercase">Save permissions</button>
                              <button onClick={handleCancelPermissionDraft} className="rounded-2xl bg-neutral-900 text-white px-4 py-3 text-[10px] font-black uppercase">Cancel</button>
                              {!student.useGeneral && (
                                <button onClick={() => handleToggleUseGeneral(student.id)} className="rounded-2xl bg-neutral-600 text-white px-4 py-3 text-[10px] font-black uppercase">Reset to common</button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 items-center justify-end">
                            <button onClick={() => startEditingStudentPermissions(student.id)} className="rounded-2xl bg-primary-500 text-white px-4 py-3 text-[10px] font-black uppercase">Customize permissions</button>
                          </div>
                        )}
                      </div>

                      {editingStudentId === student.id && (
                        <div className="mt-4 grid gap-3">
                          <input value={studentNameDraft} onChange={(e) => setStudentNameDraft(e.target.value)} className="w-full rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-950 p-4 text-sm font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20" placeholder="Update student name" />
                          <button type="button" onClick={handleSaveStudent} className="w-full rounded-3xl bg-neutral-900 text-white py-4 text-sm font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all">Save student</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePill({ label, value }: { label: string; value: string }) {
  const displayLabel = 
    label === 'Institutional ID' ? 'ID Number' : 
    label === 'Academic Unit' ? 'Department' : 
    label === 'Clearance Path' ? 'Access Level' : 
    label;

  return (
    <div className="p-5 glass-panel bg-white/40 dark:bg-white/5 flex flex-col items-start gap-1 text-left border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-800 transition-all cursor-default w-full overflow-hidden">
      <span className="text-[9px] font-black uppercase text-neutral-500 dark:text-neutral-400 tracking-[0.2em] leading-none mb-1 opacity-70">{displayLabel}</span>
      <span className="text-base font-black text-neutral-900 dark:text-white tracking-tighter leading-tight break-words w-full">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, description, children }: any) {
  return (
    <div className="glass-card p-10 md:p-12 bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-white/10 shadow-xl rounded-[2.5rem]">
       <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-[2rem] bg-primary-500/10 flex items-center justify-center text-primary-500">
             <Icon className="w-7 h-7" />
          </div>
          <div>
             <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{title}</h3>
             <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{description}</p>
          </div>
       </div>
       {children}
    </div>
  );
}

function PermissionToggle({ label, active, onClick }: { label: string; active: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-6 glass-panel bg-white/40 dark:bg-white/5 border-none rounded-3xl transition-all shadow-sm text-left w-full flex items-center justify-between gap-4 ${active ? 'ring-2 ring-primary-500/20 bg-primary-500/10' : 'hover:bg-white dark:hover:bg-neutral-800'}`}
    >
      <div>
        <p className="text-sm font-black text-neutral-900 dark:text-white">{label}</p>
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400 mt-2">{active ? 'Enabled' : 'Disabled'}</p>
      </div>
      <span className={`inline-flex h-8 min-w-[3rem] items-center justify-center rounded-full px-3 text-[10px] font-black uppercase ${active ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>{active ? 'On' : 'Off'}</span>
    </button>
  );
}

function ToggleItem({ label, active, onClick }: { label: string; active: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-6 glass-panel bg-white/40 dark:bg-white/5 border-none hover:bg-white dark:hover:bg-neutral-800 transition-all group cursor-pointer ${active ? 'ring-2 ring-primary-500/20' : ''}`}
    >
      <div className="flex items-center gap-5">
         <div className={`w-3 h-3 rounded-full transition-all ${active ? 'bg-primary-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
         <span className="text-[11px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">{label}</span>
      </div>
      <div className={`w-16 h-8 rounded-full p-1.5 transition-all relative ${active ? 'bg-primary-500 shadow-lg shadow-primary-500/20' : 'bg-neutral-200 dark:bg-black/40 shadow-inner'}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-xl transition-all duration-500 transform ${active ? 'translate-x-[32px]' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}
