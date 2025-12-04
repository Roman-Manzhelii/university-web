import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../authContext.jsx";
import { apiGet, apiPut, apiPost, apiDelete } from "../apiClient.js";

export default function AdminStudentDetailsPage() {
    const { id } = useParams();
    const studentId = Number(id);
    const { token, role } = useAuth();
    const isAdmin = role === "Admin";

    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);

    const [studentForm, setStudentForm] = useState({
        name: "",
        departmentId: "",
    });
    const [savingStudent, setSavingStudent] = useState(false);

    const [enrollCourseId, setEnrollCourseId] = useState("");
    const [savingEnroll, setSavingEnroll] = useState(false);

    const [gradeEdits, setGradeEdits] = useState({});
    const [savingGrade, setSavingGrade] = useState(false);

    const [accountForm, setAccountForm] = useState({
        email: "",
        password: "",
    });
    const [savingAccount, setSavingAccount] = useState(false);
    const [accountMessage, setAccountMessage] = useState(null);

    const reload = async () => {
        if (!token || !isAdmin) return;

        setError(null);
        try {
            const [studentData, coursesData] = await Promise.all([
                apiGet(`/api/students/${studentId}`, token),
                apiGet("/api/courses", token),
            ]);

            setStudent(studentData);
            setCourses(coursesData);

            setStudentForm({
                name: studentData.name,
                departmentId: studentData.department
                    ? String(studentData.department.id)
                    : "",
            });

            const initialGrades = {};
            (studentData.enrollments || []).forEach((e) => {
                initialGrades[e.courseId] = e.grade ?? "";
            });
            setGradeEdits(initialGrades);
        } catch (err) {
            setError(err.message || "Failed to load student data");
        }
    };

    useEffect(() => {
        reload();
    }, [token, isAdmin, studentId]);

    if (!token || !isAdmin) {
        return <p>You must be logged in as admin to view this page.</p>;
    }

    const handleStudentChange = (e) => {
        const { name, value } = e.target;
        setStudentForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStudentSave = async (e) => {
        e.preventDefault();
        setSavingStudent(true);
        setError(null);

        try {
            const payload = {
                name: studentForm.name,
                departmentId: studentForm.departmentId
                    ? Number(studentForm.departmentId)
                    : null,
            };

            await apiPut(`/api/students/${studentId}`, payload, token);
            await reload();
        } catch (err) {
            setError(err.message || "Failed to update student");
        } finally {
            setSavingStudent(false);
        }
    };

    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        if (!enrollCourseId) return;

        setSavingEnroll(true);
        setError(null);

        try {
            await apiPost(
                `/api/students/${studentId}/courses`,
                { courseId: Number(enrollCourseId) },
                token
            );
            setEnrollCourseId("");
            await reload();
        } catch (err) {
            setError(err.message || "Failed to enroll student to course");
        } finally {
            setSavingEnroll(false);
        }
    };

    const handleGradeChange = (courseId, newValue) => {
        setGradeEdits((prev) => ({
            ...prev,
            [courseId]: newValue,
        }));
    };

    const handleGradeSave = async (courseId) => {
        setSavingGrade(true);
        setError(null);

        try {
            const grade = gradeEdits[courseId] || null;
            await apiPut(
                `/api/students/${studentId}/courses/${courseId}`,
                { grade },
                token
            );
            await reload();
        } catch (err) {
            setError(err.message || "Failed to update grade");
        } finally {
            setSavingGrade(false);
        }
    };

    const handleRemoveEnrollment = async (courseId) => {
        const confirmed = window.confirm("Remove this enrollment?");
        if (!confirmed) return;

        setError(null);
        try {
            await apiDelete(
                `/api/students/${studentId}/courses/${courseId}`,
                token
            );
            await reload();
        } catch (err) {
            setError(err.message || "Failed to remove enrollment");
        }
    };

    const handleAccountChange = (e) => {
        const { name, value } = e.target;
        setAccountForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAccountSubmit = async (e) => {
        e.preventDefault();
        if (!token || !isAdmin) return;

        setSavingAccount(true);
        setAccountMessage(null);
        setError(null);

        try {
            await apiPost(
                "/api/auth/register-student",
                {
                    studentId: studentId,
                    email: accountForm.email,
                    password: accountForm.password,
                },
                token
            );

            setAccountForm({ email: "", password: "" });
            setAccountMessage("Student account has been created.");
        } catch (err) {
            setAccountMessage(null);
            setError(err.message || "Failed to register student account");
        } finally {
            setSavingAccount(false);
        }
    };

    if (!student) {
        if (error) {
            return <p className="text-error">{error}</p>;
        }
        return <p>Loading student...</p>;
    }

    const enrolledIds = new Set(
        (student.enrollments || []).map((e) => e.courseId)
    );
    const availableCourses = courses.filter((c) => !enrolledIds.has(c.id));

    return (
        <div>
            <h2>Admin: Student #{student.id}</h2>
            <p>
                <Link to="/admin">Back to students list</Link>
            </p>

            {error && <p className="text-error">{error}</p>}
            {accountMessage && <p>{accountMessage}</p>}

            <section className="section">
                <h3>Student info</h3>
                <p>
                    <strong>Student number:</strong> {student.studentNumber}
                </p>
                <p>
                    <strong>Total credits:</strong> {student.totalCredits}
                </p>
                <p>
                    <strong>Department:</strong>{" "}
                    {student.department ? student.department.name : "Not assigned"}
                </p>

                <form className="form" onSubmit={handleStudentSave}>
                    <div className="form-field">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            name="name"
                            value={studentForm.name}
                            onChange={handleStudentChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="departmentId">Department Id (optional)</label>
                        <input
                            id="departmentId"
                            name="departmentId"
                            type="number"
                            min="1"
                            value={studentForm.departmentId}
                            onChange={handleStudentChange}
                        />
                    </div>
                    <button className="button" type="submit" disabled={savingStudent}>
                        {savingStudent ? "Saving..." : "Save student"}
                    </button>
                </form>
            </section>

            <section className="section">
                <h3>Student login account</h3>
                <form className="form" onSubmit={handleAccountSubmit}>
                    <div className="form-field">
                        <label htmlFor="accountEmail">Email</label>
                        <input
                            id="accountEmail"
                            name="email"
                            type="email"
                            value={accountForm.email}
                            onChange={handleAccountChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="accountPassword">Initial password</label>
                        <input
                            id="accountPassword"
                            name="password"
                            type="password"
                            value={accountForm.password}
                            onChange={handleAccountChange}
                            required
                        />
                    </div>
                    <button className="button" type="submit" disabled={savingAccount}>
                        {savingAccount ? "Creating..." : "Create login account"}
                    </button>
                </form>
            </section>

            <section className="section">
                <h3>Enroll to course</h3>
                {availableCourses.length === 0 ? (
                    <p>No available courses to enroll.</p>
                ) : (
                    <form className="form" onSubmit={handleEnrollSubmit}>
                        <div className="form-field">
                            <label htmlFor="enrollCourse">Course</label>
                            <select
                                id="enrollCourse"
                                value={enrollCourseId}
                                onChange={(e) => setEnrollCourseId(e.target.value)}
                                required
                            >
                                <option value="">Select course...</option>
                                {availableCourses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} - {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="button" type="submit" disabled={savingEnroll}>
                            {savingEnroll ? "Enrolling..." : "Enroll"}
                        </button>
                    </form>
                )}
            </section>

            <section className="section">
                <h3>Enrollments</h3>
                {(student.enrollments || []).length === 0 ? (
                    <p>No enrollments yet.</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Title</th>
                                <th>Credits</th>
                                <th>Grade</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {student.enrollments.map((e) => (
                                <tr key={e.courseId}>
                                    <td>{e.courseCode}</td>
                                    <td>{e.courseTitle}</td>
                                    <td>{e.credits}</td>
                                    <td>
                                        <input
                                            className="table-input"
                                            value={gradeEdits[e.courseId] ?? ""}
                                            onChange={(ev) =>
                                                handleGradeChange(e.courseId, ev.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="button button-sm"
                                            type="button"
                                            disabled={savingGrade}
                                            onClick={() => handleGradeSave(e.courseId)}
                                        >
                                            Save grade
                                        </button>
                                        <button
                                            className="button button-sm"
                                            type="button"
                                            onClick={() => handleRemoveEnrollment(e.courseId)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}
