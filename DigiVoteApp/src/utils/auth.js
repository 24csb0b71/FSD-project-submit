export function decodeToken(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token:", e);
        return null;
    }
}

export function getToken() {
    return localStorage.getItem("token");
}

export function setToken(token) {
    if (token) {
        localStorage.setItem("token", token);
    }
}

export function removeToken() {
    localStorage.removeItem("token");
}

export function getCurrentUser() {
    const token = getToken();
    return decodeToken(token);
}

export function getStudentId() {
    const user = getCurrentUser();
    return user ? user.sub : null;
}

export function getIsAdmin() {
    const user = getCurrentUser();
    return user ? user.isAdmin === true : false;
}

export function isTokenExpired() {
    const user = getCurrentUser();
    if (!user || !user.exp) return true; // If no token or no expiry, treat as expired
    const currentTime = Math.floor(Date.now() / 1000);
    return user.exp < currentTime;
}
