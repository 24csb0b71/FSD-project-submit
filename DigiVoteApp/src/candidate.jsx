import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStudentId, getIsAdmin, removeToken } from "./utils/auth";

function Candidates(){
    const [positionId, setPositionId] = useState("");
    const [imageSrc, setImageSrc] = useState("");
    const [manifesto, setManifesto] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [positions, setPositions] = useState([]);

    const isAdmin = getIsAdmin();

    const submit = async (event) => {
        event.preventDefault();
        setStatusMessage("");

        if (!positionId || !manifesto) {
            setStatusMessage("Please select a position and enter your manifesto.");
            setIsSuccess(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/candidate/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: getStudentId()?.toUpperCase(),
                    positionId: parseInt(positionId),
                    manifesto: manifesto,
                    img_src: imageSrc || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
                })    
            });

            const data = await response.text();

            if (response.ok) {
                setStatusMessage("Application submitted! Your candidacy is now pending admin approval.");
                setIsSuccess(true);
                setPositionId("");
                setManifesto("");
                setImageSrc("");
            } else {
                setStatusMessage(data || "Error submitting candidacy.");
                setIsSuccess(false);
            }
        } catch (err) {
            console.error(err);
            setStatusMessage("Could not connect to server.");
            setIsSuccess(false);
        }
    };

    useEffect(() => {
        fetch("http://localhost:8080/api/position/all")
            .then(response => response.json())
            .then(data => setPositions(data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
            <div className="headers">
                <div className="logo" style={{ fontWeight: "700", fontSize: "18px", color: "var(--brand-primary)" }}>DigiVote</div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/voting">Voting</Link>
                    <Link to="/candidate" style={{ color: "var(--brand-primary)", fontWeight: "600" }}>Apply as Candidate</Link>
                    <Link to="/results">Results</Link>
                    {isAdmin && <Link to="/admin">Admin Panel</Link>}
                    {isAdmin && <Link to="/admin/analytics">Analytics</Link>}
                    <Link to="/">
                        <button onClick={removeToken}>Log Out</button>
                    </Link>
                </div>
            </div>

            <div className="loginPage">
                <div className="loginContainer">
                    <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", color: "var(--text-primary)" }}>Candidate Application</h2>
                    <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--text-muted)" }}>
                        Running as student: <strong>{getStudentId()?.toUpperCase()}</strong>
                    </p>

                    {statusMessage && (
                        <div style={{
                            padding: "10px 14px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginBottom: "18px",
                            background: isSuccess ? "#f0fdf4" : "#fef2f2",
                            border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
                            color: isSuccess ? "#166534" : "#991b1b"
                        }}>
                            {statusMessage}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <p>Select Position</p>
                        <select
                            value={positionId}
                            onChange={(e) => setPositionId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose Position --</option>
                            {positions.map(position => (
                                <option key={position.positionId} value={position.positionId}>
                                    {position.positionName}
                                </option>
                            ))}
                        </select>
                    
                        <p>Campaign Manifesto</p>
                        <textarea 
                            rows={4}
                            placeholder="State your campaign vision and key initiatives..."
                            value={manifesto}
                            onChange={(e) => setManifesto(e.target.value)}
                            required
                        />

                        <p>Profile Image URL (Optional)</p>
                        <input 
                            placeholder="https://example.com/photo.jpg"
                            value={imageSrc}
                            onChange={(e) => setImageSrc(e.target.value)}
                        />

                        <button type="submit" className="submit">
                            Submit Nomination
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Candidates;
