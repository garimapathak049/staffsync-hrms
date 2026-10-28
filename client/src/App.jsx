import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store';
import Layout from './components/Layout';
import { Toasts } from './components/ui';
const P = (n) => lazy(() => import(`./pages/${n}.jsx`));
const Home = P('Home'), Login = P('Login'), Dashboard = P('Dashboard'), Employees = P('Employees'), Team = P('Team'), Attendance = P('Attendance'),
  Leaves = P('Leaves'), Announcements = P('Announcements'), Trainings = P('Trainings'), Notifications = P('Notifications'), Profile = P('Profile'), Reports = P('Reports');

function Guard({ roles, children }) {
  const { user, ready } = useSelector((s) => s.auth);
  if (!ready) return <div className="text-center p-5"><div className="spinner-border" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return children;
}
export default function App() {
  const d = useDispatch();
  useEffect(() => { d(fetchMe()); }, [d]);
  return (<><Toasts /><Suspense fallback={<div className="text-center p-5"><div className="spinner-border" /></div>}><Routes>
    <Route path="/" element={<Home />} /><Route path="/login" element={<Login />} />
    <Route path="/app" element={<Guard><Layout /></Guard>}>
      <Route index element={<Dashboard />} />
      <Route path="employees" element={<Guard roles={['HR']}><Employees title="Employees" /></Guard>} />
      <Route path="managers" element={<Guard roles={['HR']}><Employees title="Managers" role="MANAGER" /></Guard>} />
      <Route path="team" element={<Guard roles={['MANAGER']}><Team /></Guard>} />
      <Route path="attendance" element={<Attendance />} /><Route path="leaves" element={<Leaves />} />
      <Route path="announcements" element={<Announcements />} /><Route path="trainings" element={<Trainings />} />
      <Route path="notifications" element={<Notifications />} /><Route path="profile" element={<Profile />} />
      <Route path="reports" element={<Guard roles={['HR']}><Reports /></Guard>} />
    </Route><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></>);
}
