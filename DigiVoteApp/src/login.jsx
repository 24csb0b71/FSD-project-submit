import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "./utils/auth";

function Login(){
    const navigate = useNavigate();

    const [user_id, setUserId] = useState("");
    const [pass_id, setPassword] = useState("");
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        setShowError(false);
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:8080/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studentId: user_id,
                    password: pass_id
                })
            });

            if (response.ok){
                const data = await response.json();
                setToken(data.token);
                navigate("/dashboard");
            } else {
                const text = await response.text();
                setShowError(true);
                setErrorMessage(text || "Invalid roll number or password.");
            }
        } catch (err) {
            console.error(err);
            setShowError(true);
            setErrorMessage("Cannot connect to server. Ensure backend is running.");
        }
    };

    return (
        <div className="loginPage">
            <div className="loginContainer">
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <h1 style={{ fontSize: "24px", margin: "0 0 6px 0", color: "var(--text-primary)" }}>DigiVote</h1>
                    <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Secure University Voting System</p>
                </div>

                {showError && (
                    <div style={{ 
                        background: "#fef2f2", 
                        border: "1px solid #fecaca", 
                        color: "#991b1b",
                        borderRadius: "6px", 
                        padding: "10px", 
                        fontSize: "13px",
                        textAlign: "center",
                        marginBottom: "16px" 
                    }}>
                        {errorMessage || "Invalid Student Roll Number or Password."}
                    </div>
                )}

                <form onSubmit={submit}>
                    <p>Roll Number</p>
                    <input 
                        placeholder="e.g. 22CSB0A01" 
                        value={user_id}
                        onChange={(e) => setUserId(e.target.value.toUpperCase())}
                        required
                    />
                
                    <p>Password</p>
                    <input 
                        placeholder="Enter your password" 
                        type="password"
                        value={pass_id}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button className="submit" type="submit" style={{ marginTop: "4px" }}>
                        Sign In
                    </button>

                    <div style={{ textAlign: "center", marginTop: "18px" }}>
                        <Link to="/register" style={{ color: "var(--brand-primary)", textDecoration: "none", fontSize: "13px" }}>
                            Not registered yet? Create account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
