import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext.jsx";
import { apiGet, apiPost } from "../apiClient.js";

export default function AdminStudentsPage() {
    const { token, role } = useAuth();
    const isAdmin = role === "Admin";

    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);

    const [createForm, setCreateForm] = useState({
        studentNumber: "",
        name: "",
        departmentId: "",
    });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    useEffect(() => {
        if (!token || !isAdmin) return;

        apiGet("/api/students", token)
            .then((data) => {
                setStudents(data);
                setError(null);
            })
            .catch((err) => {
                setError(err.message || "Failed to load students");
            });
    }, [token, isAdmin]);

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!token || !isAdmin) return;

        const payload = {
            studentNumber: createForm.studentNumber,
            name: createForm.name,
            departmentId: createForm.departmentId
                ? Number(createForm.departmentId)
                : null,
        };

        setCreating(true);
        setCreateError(null);

        try {
            await apiPost("/api/students", payload, token);
            setCreateForm({ studentNumber: "", name: "", departmentId: "" });

            const refreshed = await apiGet("/api/students", token);
            setStudents(refreshed);
        } catch (err) {
            setCreateError(err.message || "Failed to create student");
        } finally {
            setCreating(false);
        }
    };

    if (!token || !isAdmin) {
        return <p>You must be logged in as admin to view this page.</p>;
    }

    if (error) {
        return <p className="text-error">{error}</p>;
    }

    return (
        <div>
            <h2>Admin: Students</h2>

            {students.length === 0 ? (
                <p>No students found.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Number</th>
                            <th>Name</th>
                            <th>Credits</th>
                            <th>Department</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.studentNumber}</td>
                                <td>{s.name}</td>
                                <td>{s.totalCredits}</td>
                                <td>{s.departmentName ?? "Not assigned"}</td>
                                <td>
                                    <Link to={`/admin/students/${s.id}`}>Open</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <section className="section">
                <h3>Create student</h3>
                <form className="form" onSubmit={handleCreateSubmit}>
                    <div className="form-field">
                        <label htmlFor="studentNumber">Student number</label>
                        <input
                            id="studentNumber"
                            name="studentNumber"
                            value={createForm.studentNumber}
                            onChange={handleCreateChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            name="name"
                            value={createForm.name}
                            onChange={handleCreateChange}
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
                            value={createForm.departmentId}
                            onChange={handleCreateChange}
                        />
                    </div>

                    {createError && <p className="text-error">{createError}</p>}

                    <button className="button" type="submit" disabled={creating}>
                        {creating ? "Creating..." : "Create student"}
                    </button>
                </form>
            </section>
        </div>
    );
}
