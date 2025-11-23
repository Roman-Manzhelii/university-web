import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({
        token: null,
        role: null,
        studentId: null,
    });

    useEffect(() => {
        const storedToken = localStorage.getItem("auth_token");
        const storedRole = localStorage.getItem("auth_role");
        const storedStudentId = localStorage.getItem("auth_studentId");

        if (storedToken && storedRole) {
            setAuth({
                token: storedToken,
                role: storedRole,
                studentId: storedStudentId ? Number(storedStudentId) : null,
            });
        }
    }, []);

    const setAuthFromResponse = (response) => {
        const token = response.accessToken;
        const role = response.role;
        const studentId = response.studentId ?? null;

        setAuth({ token, role, studentId });

        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_role", role);
        if (studentId != null) {
            localStorage.setItem("auth_studentId", String(studentId));
        } else {
            localStorage.removeItem("auth_studentId");
        }
    };

    const logout = () => {
        setAuth({ token: null, role: null, studentId: null });
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_role");
        localStorage.removeItem("auth_studentId");
    };

    const value = {
        token: auth.token,
        role: auth.role,
        studentId: auth.studentId,
        setAuthFromResponse,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}
