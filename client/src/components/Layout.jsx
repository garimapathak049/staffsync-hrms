import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarCheck,
  FileText,
  Megaphone,
  GraduationCap,
  BarChart3,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { logout } from '../store';
import api from '../services/api';
import { Logo } from './ui';

const NAV = {
  HR: [
    ['', 'Overview', LayoutDashboard],
    ['employees', 'Employees', Users],
    ['managers', 'Managers', UserCog],
    ['attendance', 'Attendance', CalendarCheck],
    ['leaves', 'Leave Requests', FileText],
    ['announcements', 'Announcements', Megaphone],
    ['trainings', 'Training Programs', GraduationCap],
    ['reports', 'Reports & Analytics', BarChart3],
    ['notifications', 'Notifications', Bell],
    ['profile', 'Settings', User],
  ],
  MANAGER: [
    ['', 'Overview', LayoutDashboard],
    ['team', 'My Team', Users],
    ['attendance', 'Team Attendance', CalendarCheck],
    ['leaves', 'Leave Approvals', FileText],
    ['trainings', 'Trainings', GraduationCap],
    ['announcements', 'Announcements', Megaphone],
    ['notifications', 'Notifications', Bell],
    ['profile', 'Profile', User],
  ],
  EMPLOYEE: [
    ['', 'Overview', LayoutDashboard],
    ['profile', 'My Profile', User],
    ['attendance', 'Attendance', CalendarCheck],
    ['leaves', 'Leaves', FileText],
    ['announcements', 'Announcements', Megaphone],
    ['trainings', 'Trainings', GraduationCap],
    ['notifications', 'Notifications', Bell],
  ],
};

export default function Layout() {
  const { user } = useSelector((s) => s.auth);
  const d = useDispatch();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const f = () =>
      api
        .get('/notifications', { params: { limit: 1 } })
        .then((r) => setUnread(r.data.unread))
        .catch(() => {});
    f();
    const t = setInterval(f, 30000);
    return () => clearInterval(t);
  }, []);

  const out = async () => {
    await d(logout());
    nav('/login');
  };

  const navList = NAV[user?.role] || [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black flex">
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-zinc-200 flex flex-col justify-between p-6 z-50 transition-transform duration-300 ease-out shadow-sm ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close button */}
          <div className="flex items-center justify-between pb-8 border-b border-zinc-100">
            <Logo size={24} />
            <button
              className="lg:hidden text-zinc-400 hover:text-black p-1"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick role pill */}
          <div className="my-5 p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-white font-black flex items-center justify-center text-sm shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold truncate text-black">{user.name}</div>
              <div className="text-[11px] font-mono tracking-wider text-zinc-600 uppercase font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {user.role} · {user.employeeId}
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-2">
            {navList.map(([p, l, Icon]) => (
              <NavLink
                key={p}
                end={p === ''}
                to={`/app/${p}`}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all group ${
                    isActive
                      ? 'bg-black text-white shadow-md translate-x-1'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? 'text-white stroke-[2.5]' : 'text-zinc-500 group-hover:text-black'}
                      />
                      <span>{l}</span>
                    </div>
                    {p === 'notifications' && unread > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                        {unread}
                      </span>
                    ) : (
                      <ChevronRight
                        size={14}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive ? 'text-white opacity-100' : ''
                        }`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout & Footer */}
          <div className="pt-4 border-t border-zinc-100 mt-auto">
            <button
              onClick={out}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-black uppercase tracking-wider transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-18 py-4 px-6 md:px-10 glass-nav flex items-center justify-between bg-white/80 border-b border-zinc-200">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-black hover:bg-zinc-200"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <span className="text-black font-black">StaffSync Portal</span>
              <span>/</span>
              <span className="text-zinc-600">Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Enterprise Node Online
            </div>

            <button
              onClick={() => nav('/app/notifications')}
              className="relative p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-black text-black transition-colors shadow-sm"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <div
              onClick={() => nav('/app/profile')}
              className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet with smooth padding */}
        <main className="flex-1 p-6 md:p-10 max-w-[1700px] w-full mx-auto animate-slide-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
