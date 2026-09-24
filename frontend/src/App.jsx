import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Learn from './pages/Learn';
import Manage from './pages/Manage';
import Reviews from './pages/Reviews';
import Users from './pages/Users';
import AiPath from './pages/AiPath';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import QuizEditor from './pages/QuizEditor';
import Certificates from './pages/Certificates';
import Verify from './pages/Verify';
import Notifications from './pages/Notifications';
import Mentor from './pages/Mentor'; import Analytics from './pages/Analytics'; import Categories from './pages/Categories';
import { StudentAssignments } from './pages/Assignments';
import AuditLogs from './pages/AuditLogs';
import ReviewHistory from './pages/ReviewHistory';
import StudentMentor from './pages/StudentMentor';
export default function App() {
  return (
    <Routes>
      <Route path="/verify-certificate/:certificateId" element={<Verify />} /><Route path="/login" element={<Auth />} /><Route path="/register" element={<Auth register />} />
      <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
        <Route path="/" element={<Home />} /><Route path="/courses" element={<Courses />} /><Route path="/learn/:id" element={<Learn />} /><Route path="/notifications" element={<Notifications />} />
        <Route element={<ProtectedRoute roles={['STUDENT']} />}><Route path="/ai" element={<AiPath />} /><Route path="/quiz/:id" element={<Quiz />} /><Route path="/results" element={<Result />} /><Route path="/results/:id" element={<Result />} /><Route path="/certificates" element={<Certificates />} /><Route path="/courses/:courseId/assignments" element={<StudentAssignments />} /><Route path="/mentor" element={<StudentMentor />} /></Route>
        <Route element={<ProtectedRoute roles={['INSTRUCTOR', 'ADMIN']} />}><Route path="/manage" element={<Manage />} /><Route path="/manage/quiz/:id" element={<QuizEditor />} /></Route>
        <Route element={<ProtectedRoute roles={['REVIEWER']} />}><Route path="/reviews" element={<Reviews />} /><Route path="/review-history" element={<ReviewHistory />} /></Route>
        <Route element={<ProtectedRoute roles={['MENTOR']} />}><Route path="/mentor" element={<Mentor />} /></Route>
        <Route element={<ProtectedRoute roles={['INSTRUCTOR']} />}><Route path="/analytics" element={<Analytics />} /></Route>
        <Route element={<ProtectedRoute roles={['ADMIN']} />}><Route path="/users" element={<Users />} /></Route>
        <Route element={<ProtectedRoute roles={['ADMIN']} />}><Route path="/admin/analytics" element={<Analytics admin />} /><Route path="/admin/categories" element={<Categories />} /><Route path="/admin/audit-logs" element={<AuditLogs />} /><Route path="/admin/review-history" element={<ReviewHistory />} /></Route>
      </Route></Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
