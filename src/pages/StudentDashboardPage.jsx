import { useEffect, useState } from "react";
import { useAuth } from "../authContext.jsx";
import { apiGet, apiPost, apiDelete } from "../apiClient.js";

export default function StudentDashboardPage() {
    const { token, studentId } = useAuth();
    const [profile, setProfile] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [changeError, setChangeError] = useState(null);
    const [changeSuccess, setChangeSuccess] = useState(null);
    const [changing, setChanging] = useState(false);

    const loadEnrollments = async () => {
        if (!token || studentId == null) return;
        const data = await apiGet(`/api/students/${studentId}/courses`, token);
        setEnrollments(data);
    };

    useEffect(() => {
        if (!token || studentId == null) return;

        apiGet(`/api/students/${studentId}`, token)
            .then((data) => {
                setProfile(data);
            })
            .catch((err) => {
                setError(err.message || "Failed to load student profile");
            });

        apiGet(`/api/students/${studentId}/courses`, token)
            .then((data) => {
                setEnrollments(data);
            })
            .catch((err) => {
                setError(err.message || "Failed to load student courses");
            });

        apiGet("/api/courses")
            .then((data) => {
                setAllCourses(data);
            })
            .catch((err) => {
                setError(err.message || "Failed to load courses");
            });
    }, [token, studentId]);

    const handleEnroll = async (courseId) => {
        if (!token || studentId == null) return;
        setSaving(true);
        try {
            await apiPost(
                `/api/students/${studentId}/courses`,
                { courseId },
                token
            );
            await loadEnrollments();
        } catch (err) {
            setError(err.message || "Failed to enroll to course");
        } finally {
            setSaving(false);
        }
    };

    const handleUnenroll = async (courseId) => {
        if (!token || studentId == null) return;
        const confirmed = window.confirm("Unenroll from this course?");
        if (!confirmed) return;

        setSaving(true);
        try {
            await apiDelete(
                `/api/students/${studentId}/courses/${courseId}`,
                token
            );
            await loadEnrollments();
        } catch (err) {
            setError(err.message || "Failed to unenroll from course");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault();

        setChangeError(null);
        setChangeSuccess(null);

        if (!token) {
            setChangeError("You must be logged in to change password.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setChangeError("New password and confirmation do not match.");
            return;
        }

        setChanging(true);

        try {
            await apiPost(
                "/api/auth/change-password",
                {
                    currentPassword,
                    newPassword,
                },
                token
            );

            setChangeSuccess("Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            setChangeError(err.message || "Failed to change password.");
        } finally {
            setChanging(false);
        }
    };

    if (!token || studentId == null) {
        return <p>You must be logged in as a student to view this page.</p>;
    }

    if (error) {
        return <p className="text-error">{error}</p>;
    }

    if (!profile) {
        return <p>Loading student data...</p>;
    }

    const enrolledCourseIds = new Set(
        enrollments.map((e) => e.courseId || e.courseID)
    );
    const availableCourses = allCourses.filter(
        (c) => !enrolledCourseIds.has(c.id)
    );

    return (
        <div>
            <h2>Student Dashboard</h2>

            <section className="section">
                <h3>Profile</h3>
                <p>
                    <strong>Student number:</strong> {profile.studentNumber}
                </p>
                <p>
                    <strong>Name:</strong> {profile.name}
                </p>
                <p>
                    <strong>Total credits:</strong> {profile.totalCredits}
                </p>
                <p>
                    <strong>Department:</strong>{" "}
                    {profile.department ? profile.department.name : "Not assigned"}
                </p>
            </section>

            <section className="section">
                <h3>Enrolled courses</h3>
                {enrollments.length === 0 ? (
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
                            {enrollments.map((e) => (
                                <tr key={e.courseId}>
                                    <td>{e.courseCode}</td>
                                    <td>{e.courseTitle}</td>
                                    <td>{e.credits}</td>
                                    <td>{e.grade ?? "-"}</td>
                                    <td>
                                        <button
                                            className="button button-sm"
                                            type="button"
                                            disabled={saving}
                                            onClick={() => handleUnenroll(e.courseId)}
                                        >
                                            Unenroll
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section className="section">
                <h3>Available courses</h3>
                {availableCourses.length === 0 ? (
                    <p>No more courses available to enroll.</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Title</th>
                                <th>Credits</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availableCourses.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.code}</td>
                                    <td>{c.title}</td>
                                    <td>{c.credits}</td>
                                    <td>{c.departmentName}</td>
                                    <td>
                                        <button
                                            className="button button-sm"
                                            type="button"
                                            disabled={saving}
                                            onClick={() => handleEnroll(c.id)}
                                        >
                                            Enroll
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {token && (
                <section className="section" style={{ marginTop: "2rem" }}>
                    <h3>Change password</h3>
                    <form onSubmit={handleChangePasswordSubmit}>
                        <div className="form-field">
                            <label htmlFor="currentPassword">Current password</label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="newPassword">New password</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="confirmNewPassword">
                                Confirm new password
                            </label>
                            <input
                                id="confirmNewPassword"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        {changeError && <p className="text-error">{changeError}</p>}
                        {changeSuccess && <p>{changeSuccess}</p>}

                        <button className="button" type="submit" disabled={changing}>
                            {changing ? "Changing..." : "Change password"}
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
}
