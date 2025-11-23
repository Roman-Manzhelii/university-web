import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../apiClient.js";

export default function CourseDetailsPage() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiGet(`/api/courses/${id}`)
            .then((data) => {
                setCourse(data);
                setError(null);
            })
            .catch((err) => {
                setError(err.message || "Failed to load course");
            });
    }, [id]);

    if (error) return <p className="text-error">{error}</p>;
    if (!course) return <p>Loading course...</p>;

    return (
        <div>
            <h2>Course details</h2>
            <p>
                <strong>Code:</strong> {course.code}
            </p>
            <p>
                <strong>Title:</strong> {course.title}
            </p>
            <p>
                <strong>Credits:</strong> {course.credits}
            </p>
            {course.department && (
                <p>
                    <strong>Department:</strong>{" "}
                    <Link to={`/departments/${course.department.id}`}>
                        {course.department.name}
                    </Link>
                </p>
            )}
            <p>
                <Link to="/courses">Back to courses</Link>
            </p>
        </div>
    );
}
