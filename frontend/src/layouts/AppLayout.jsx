import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Compass, Sparkles, BookOpen, ClipboardCheck, Users, LogOut, Menu, Award, Bell, ListChecks, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
const NAV = {
  STUDENT: [['/', 'Dashboard', LayoutDashboard], ['/courses', 'Explore courses', Compass], ['/mentor', 'My mentor', UserRound], ['/ai', 'AI learning path', Sparkles], ['/results', 'Quiz results', ListChecks]],
  INSTRUCTOR: [['/manage', 'My courses', BookOpen], ['/analytics', 'Analytics', LayoutDashboard], ['/courses', 'Explore courses', Compass]],
  REVIEWER: [['/reviews', 'Course reviews', ClipboardCheck], ['/review-history', 'Review history', ListChecks]],
  MENTOR: [['/mentor', 'Dashboard', LayoutDashboard]],
  ADMIN: [['/users', 'Users', Users], ['/admin/analytics', 'Analytics', LayoutDashboard], ['/admin/categories', 'Categories', ListChecks], ['/admin/review-history', 'Review history', ClipboardCheck], ['/admin/audit-logs', 'Audit logs', ClipboardCheck], ['/courses', 'Courses', Compass]],
};
export default function AppLayout() {
  const { user, logout } = useAuth(), nav = useNavigate(), [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-[#f4f1ea] text-[#182b2a]">
      <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-[#173431] p-4 text-[#eaf4ee] shadow-2xl transition-transform md:static md:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center gap-2 px-2 text-xl font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4b183] text-[#173431]"><GraduationCap size={20} /></span> LearnHub</div>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fb5a8]">Workspace</p>
        <nav className="space-y-1">{[...NAV[user.role], ...(user.role === 'STUDENT' ? [['/certificates', 'Certificates', Award]] : []), ['/notifications', 'Notifications', Bell]].map(([to, label, Icon]) => (
          <NavLink key={to + label} to={to} end onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isActive ? 'bg-[#f4b183] text-[#173431] shadow-lg' : 'text-[#c2d8ce] hover:bg-[#244a44] hover:text-white'}`}><Icon size={17} />{label}</NavLink>))}</nav>
        <div className="mt-auto hidden rounded-2xl border border-[#315850] bg-[#1d403b] p-3 text-xs text-[#b6d0c4] md:block"><b className="text-[#f4b183]">Keep going.</b><br />Small steps become finished courses.</div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-[#dce4df] bg-[#fbfcfa]/90 px-4 py-3 backdrop-blur md:px-8">
          <button className="btn md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}><Menu size={16} /></button><div className="hidden text-sm font-bold text-[#668079] md:block">Learning workspace</div><span className="flex-1" />
          <NotificationBell /><span className="text-sm">{user.name} <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{user.role}</span></span>
          <button className="btn" onClick={async () => { await logout(); nav('/login'); }}><LogOut size={14} />Sign out</button>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
