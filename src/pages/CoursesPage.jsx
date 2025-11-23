import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../apiClient.js";
import { useAuth } from "../authContext.jsx";

export default function CoursesPage() {
    const { token, role } = useAuth();
    const isAdmin = role === "Admin";

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        code: "",
        title: "",
        credits: 3,
        departmentId: "",
    });
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadCourses = () => {
        setLoading(true);
        apiGet("/api/courses")
            .then((data) => {
                setCourses(data);
                setError(null);
            })
            .catch((err) => {
                setError(err.message || "Failed to load courses");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const startCreate = () => {
        setEditingId(null);
        setForm({
            code: "",
            title: "",
            credits: 3,
            departmentId: "",
        });
        setFormError(null);
    };

    const startEdit = (course) => {
        setEditingId(course.id);
        setForm({
            code: course.code,
            title: course.title,
            credits: course.credits,
            departmentId: course.departmentId ?? "",
        });
        setFormError(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const payload = {
            code: form.code,
            title: form.title,
            credits: Number(form.credits),
            departmentId: Number(form.departmentId),
        };

        setSaving(true);
        setFormError(null);

        try {
            if (editingId == null) {
                await apiPost("/api/courses", payload, token);
            } else {
                await apiPut(`/api/courses/${editingId}`, payload, token);
            }

            startCreate();
            loadCourses();
        } catch (err) {
            setFormError(err.message || "Failed to save course");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) return;
        const confirmed = window.confirm("Delete this course?");
        if (!confirmed) return;

        try {
            await apiDelete(`/api/courses/${id}`, token);
            loadCourses();
        } catch (err) {
            alert(err.message || "Failed to delete course");
        }
    };

    if (loading) return <p>Loading courses...</p>;
    if (error) return <p className="text-error">{error}</p>;

    return (
        <div>
            <h2>Courses</h2>
            {courses.length === 0 ? (
                <p>No courses found.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Title</th>
                            <th>Credits</th>
                            <th>Department</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <Link to={`/courses/${c.id}`}>{c.code}</Link>
                                </td>
                                <td>{c.title}</td>
                                <td>{c.credits}</td>
                                <td>{c.departmentName}</td>
                                {isAdmin && (
                                    <td>
                                        <button
                                            className="button button-sm"
                                            type="button"
                                            onClick={() => startEdit(c)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="button button-sm"
                                            type="button"
                                            onClick={() => handleDelete(c.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {isAdmin && (
                <section className="section">
                    <h3>{editingId == null ? "Create course" : "Edit course"}</h3>
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="code">Code</label>
                            <input
                                id="code"
                                name="code"
                                value={form.code}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="credits">Credits</label>
                            <input
                                id="credits"
                                name="credits"
                                type="number"
                                min="1"
                                value={form.credits}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="departmentId">Department Id</label>
                            <input
                                id="departmentId"
                                name="departmentId"
                                type="number"
                                min="1"
                                value={form.departmentId}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        {formError && <p className="text-error">{formError}</p>}

                        <button className="button" type="submit" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId == null
                                    ? "Create course"
                                    : "Save changes"}
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
}
