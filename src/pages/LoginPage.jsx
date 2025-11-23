import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../apiClient.js";
import { useAuth } from "../authContext.jsx";

export default function LoginPage() {
    const [email, setEmail] = useState("student00128@dkit.ie");
    const [password, setPassword] = useState("Student123!");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { setAuthFromResponse } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await apiPost("/api/auth/login", { email, password });
            setAuthFromResponse(response);

            if (response.role === "Admin") {
                navigate("/admin");
            } else if (response.role === "Student") {
                navigate("/student");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError("Login failed. Check email and password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form">
            <h2>Login</h2>
            <p>
                Test users:
                <br />
                <code>admin@dkit.ie / Admin123!</code>
                <br />
                <code>student00128@dkit.ie / Student123!</code>
                <br />
                <code>student12345@dkit.ie / Student123!</code>
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        autoComplete="username"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-error">{error}</p>}

                <button className="button" type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
