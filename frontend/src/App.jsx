import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { LandingPage }       from "./pages/LandingPage";
import DashboardPage         from "./pages/DashboardPage";
import AssignmentDetailPage  from "./pages/AssignmentDetailPage";
import AssignmentFormPage    from "./pages/AssignmentFormPage";
import { RegisterPage }      from "./pages/RegisterPage";
import { LoginPage }         from "./pages/LoginPage";
import ResetPasswordPage     from "./pages/ResetPasswordPage";
import { ProfilePage }       from "./pages/ProfilePage";
import { FocusZonePage }     from "./pages/FocusZonePage";
import { StatisticsPage }    from "./pages/StatisticsPage";
import Chat from './components/Chat';
import AdminLogs from './components/AdminLogs';
import UsersList from './components/UsersList';
import { useSessionTimer }   from "./cookies/useCookieMonitor"; // ← NEW
import { authStore }         from "./store/authStore";
import { connectAssignmentSocket } from "./services/assignmentSocket";

function DashboardWrapper() {
  const navigate = useNavigate();
  return <DashboardPage onNavigate={(path) => navigate(path)} />;
}

export default function App() {
  useSessionTimer(); 

  useEffect(() => {
    const unsubscribe = authStore.subscribe((user) => {
      if (user?.id) connectAssignmentSocket(user.id);
    });
    return unsubscribe;
  }, []);

  return (
    <Routes>
      <Route path="/"                     element={<LandingPage />} />
      <Route path="/dashboard"            element={<DashboardWrapper />} />
      <Route path="/assignments/new"      element={<AssignmentFormPage />} />
      <Route path="/assignments/:id"      element={<AssignmentDetailPage />} />
      <Route path="/assignments/:id/edit" element={<AssignmentFormPage />} />
      <Route path="/register"             element={<RegisterPage />} />
      <Route path="/login"                element={<LoginPage />} />
      <Route path="/reset-password"       element={<ResetPasswordPage />} />
      <Route path="/profile"              element={<ProfilePage />} />
      <Route path="/focus"                element={<FocusZonePage />} />
      <Route path="/statistics"           element={<StatisticsPage />} />
      <Route path="/chat"                 element={<Chat />} />
      <Route path="/users"                element={<UsersList />} />
      <Route path="/admin/logs"           element={<AdminLogs />} />
    </Routes>
  );
}