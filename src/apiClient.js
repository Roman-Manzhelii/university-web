const API_BASE_URL = "https://university-api.runasp.net";

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
            `API error ${response.status} ${response.statusText}${text ? `: ${text}` : ""
            }`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export function apiGet(path, token) {
    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return request(path, { method: "GET", headers });
}

export function apiPost(path, body, token) {
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return request(path, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
}

export function apiPut(path, body, token) {
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return request(path, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });
}

export function apiDelete(path, token) {
    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return request(path, {
        method: "DELETE",
        headers,
    });
}
