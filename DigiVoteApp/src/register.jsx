import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register(){
    const [user_id, setUserId] = useState("");
    const [pass_id, setPassword] = useState("");
    const [pass_id2, setPassword2] = useState("");
    const [email, setEmailId] = useState("");
    const [rollno, setRollNo] = useState("");
    
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const submit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        localStorage.setItem('email', email);

        if (!user_id || !pass_id || !pass_id2 || !email || !rollno) {
            setErrorMessage("All fields are required.");
            return;
        }

        try {
            // 1. Call check_register to validate inputs
            const checkResponse = await fetch("http://localhost:8080/api/users/check_register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pass_id: pass_id,
                    pass_id2: pass_id2,
                    email: email,
                    rollno: rollno
                })
            });

            if (!checkResponse.ok) {
                const errorText = await checkResponse.text();
                setErrorMessage(errorText || "Validation failed.");
                return;
            }

            // 2. Call register to complete registration
            const registerResponse = await fetch("http://localhost:8080/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_id: rollno.toUpperCase(),
                    email_id: email.toLowerCase(),
                    s_name: user_id,
                    password: pass_id
                })
            });

            if (!registerResponse.ok) {
                const errorText = await registerResponse.text();
                setErrorMessage(errorText || "Registration failed.");
                return;
            }
            
            const otpResponse = await fetch("http://localhost:8080/api/users/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_id: rollno.toUpperCase(), email_id: email.toLowerCase() })
            });

            if (!otpResponse.ok) {
                const errorText = await otpResponse.text();
                setErrorMessage(errorText || "Failed to send OTP.");
                return;
            }

            setSuccessMessage("OTP sent to your email! Redirecting...");
            setTimeout(() => {
                navigate("/otp");   
            }, 1200);

        } catch (error) {
            setErrorMessage("Network error connecting to backend.");
            console.error("Registration error:", error);
        }
    };

    return (
        <div className="loginPage">
            <div className="loginContainer">
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h1 style={{ fontSize: "24px", margin: "0 0 6px 0", color: "var(--text-primary)" }}>Student Registration</h1>
                    <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Create your DigiVote voting account</p>
                </div>

                {errorMessage && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={submit}>
                    <p>Full Name</p>
                    <input 
                        placeholder="e.g. John Doe" 
                        value={user_id}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    />

                    <p>Roll Number (Student ID)</p>
                    <input 
                        placeholder="e.g. 22CSB0A01" 
                        value={rollno}
                        onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                        required
                    />

                    <p>College Email ID</p>
                    <input 
                        placeholder="e.g. 22csb0a01@student.nitw.ac.in" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmailId(e.target.value)}
                        required
                    />
                
                    <p>Password (min 10 chars, 1 number, 1 special char !@$&*)</p>
                    <input 
                        placeholder="Create strong password" 
                        type="password"
                        value={pass_id}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <p>Confirm Password</p>
                    <input 
                        placeholder="Re-enter password" 
                        type="password"
                        value={pass_id2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                    />

                    <button className="submit" type="submit" style={{ marginTop: "4px" }}>
                        Register & Send OTP
                    </button>

                    <div style={{ textAlign: "center", marginTop: "16px" }}>
                        <Link to="/" style={{ color: "var(--brand-primary)", textDecoration: "none", fontSize: "13px" }}>
                            Already registered? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
