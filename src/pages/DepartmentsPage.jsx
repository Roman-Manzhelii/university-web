import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../apiClient.js";

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiGet("/api/departments")
            .then((data) => {
                setDepartments(data);
                setError(null);
            })
            .catch((err) => {
                setError(err.message || "Failed to load departments");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading departments...</p>;
    if (error) return <p className="text-error">{error}</p>;

    return (
        <div>
            <h2>Departments</h2>
            {departments.length === 0 ? (
                <p>No departments found.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((d) => (
                            <tr key={d.id}>
                                <td>{d.id}</td>
                                <td>
                                    <Link to={`/departments/${d.id}`}>{d.name}</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
