import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../apiClient.js";

export default function DepartmentDetailsPage() {
    const { id } = useParams();
    const [department, setDepartment] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiGet(`/api/departments/${id}`)
            .then((data) => {
                setDepartment(data);
                setError(null);
            })
            .catch((err) => {
                setError(err.message || "Failed to load department");
            });
    }, [id]);

    if (error) return <p className="text-error">{error}</p>;
    if (!department) return <p>Loading department...</p>;

    return (
        <div>
            <h2>Department details</h2>
            <p>
                <strong>Id:</strong> {department.id}
            </p>
            <p>
                <strong>Name:</strong> {department.name}
            </p>
            <p>
                <Link to="/departments">Back to departments</Link>
            </p>
        </div>
    );
}
