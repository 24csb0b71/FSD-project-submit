import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Otp() {
    const [otp, setOtp] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const submit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        const studentId = localStorage.getItem('studentId');

        if (!otp) {
            setErrorMessage("Please enter the OTP.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/users/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_id: studentId, otp: otp })
            });

            if (!response.ok) {
                const errorText = await response.text();
                setErrorMessage(errorText || "Invalid or expired OTP.");
                return;
            }

            setSuccessMessage("Account verified! Redirecting to login...");
            localStorage.removeItem('email');
            localStorage.removeItem('studentId');

            setTimeout(() => navigate("/"), 1200);

        } catch (error) {
            setErrorMessage("Network error verifying OTP.");
            console.error("OTP verification error:", error);
        }
    };

    return (
        <div className="loginPage">
            <div className="loginContainer">
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "22px", margin: "0 0 6px 0", color: "var(--text-primary)" }}>Verify Account</h2>
                    <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Enter the 6-digit OTP code sent to your email.</p>
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
                    <p>OTP Code</p>
                    <input
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />

                    <button className="submit" type="submit">
                        Verify & Complete Registration
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Otp;
