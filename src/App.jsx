import { Routes, Route, Link, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import DepartmentsPage from "./pages/DepartmentsPage.jsx";
import DepartmentDetailsPage from "./pages/DepartmentDetailsPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import CourseDetailsPage from "./pages/CourseDetailsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";
import AdminStudentsPage from "./pages/AdminStudentsPage.jsx";
import AdminStudentDetailsPage from "./pages/AdminStudentDetailsPage.jsx";
import { useAuth } from "./authContext.jsx";

function NavBar() {
  const { token, role, studentId, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/departments">Departments</Link>
        <Link to="/courses">Courses</Link>
        {role === "Student" && <Link to="/student">Student</Link>}
        {role === "Admin" && <Link to="/admin">Admin</Link>}
      </div>

      <div className="navbar-right">
        {token ? (
          <>
            <span className="text-muted">
              Logged in as{" "}
              <strong>
                {role}
                {role === "Student" && studentId != null
                  ? ` #${studentId}`
                  : ""}
              </strong>
            </span>
            <button className="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const { token, role } = useAuth();

  const requireRole = (allowedRoles, element) => {
    if (!token) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return element;
  };

  return (
    <div>
      <NavBar />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/departments/:id" element={<DepartmentDetailsPage />} />

          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/student"
            element={requireRole(["Student"], <StudentDashboardPage />)}
          />

          <Route
            path="/admin"
            element={requireRole(["Admin"], <AdminStudentsPage />)}
          />
          <Route
            path="/admin/students/:id"
            element={requireRole(["Admin"], <AdminStudentDetailsPage />)}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
