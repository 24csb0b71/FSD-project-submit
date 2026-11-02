import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStudentId, getIsAdmin, removeToken } from "./utils/auth";

function HomePage(){
    const [election, setElection] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/api/election/config")
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => setElection(data))
            .catch(err => console.error(err));
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString();
    };

    const isAdmin = getIsAdmin();

    return(
        <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
            <div className="headers">
                <div className="logo" style={{ fontWeight: "700", fontSize: "18px", color: "var(--brand-primary)" }}>DigiVote</div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Link to="/dashboard" style={{ color: "var(--brand-primary)", fontWeight: "600" }}>Dashboard</Link>
                    <Link to="/voting">Voting</Link>
                    <Link to="/candidate">Apply as Candidate</Link>
                    <Link to="/results">Results</Link>
                    {isAdmin && <Link to="/admin">Admin Panel</Link>}
                    {isAdmin && <Link to="/admin/analytics">Analytics</Link>}
                    <Link to="/">
                        <button onClick={removeToken}>Log Out</button>
                    </Link>
                </div>
            </div>

            <div style={{ padding: "32px 24px", maxWidth: "960px", margin: "0 auto" }}>
                <div style={{ marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "28px", margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                        Voter Dashboard
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>
                        Welcome back! Student ID: <strong style={{ color: "var(--text-primary)" }}>{getStudentId()?.toUpperCase()}</strong>
                        {isAdmin && <span style={{ marginLeft: "8px", background: "#dbeafe", color: "#1e40af", fontSize: "12px", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>Admin</span>}
                    </p>
                </div>

                {/* Election Schedule Status Card */}
                <div className="analytics-section" style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                        <h2 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>
                            Election Status
                        </h2>
                        {election && (
                            <span style={{ 
                                fontWeight: "600", 
                                padding: "4px 10px", 
                                borderRadius: "14px",
                                fontSize: "12px",
                                background: election.status === "ACTIVE" ? "#ecfdf5" : election.status === "CLOSED" ? "#fef2f2" : "#f1f5f9",
                                color: election.status === "ACTIVE" ? "#065f46" : election.status === "CLOSED" ? "#991b1b" : "#475569"
                            }}>
                                ● {election.status}
                            </span>
                        )}
                    </div>
                    {election ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Voting Opens:</span>
                                <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{formatDate(election.start_time)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Voting Closes:</span>
                                <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{formatDate(election.end_time)}</span>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>No active election schedule configured by admin yet.</p>
                    )}
                </div>

                {/* Dashboard Action Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
                    <Link to="/voting" style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="analytics-card" style={{ cursor: "pointer", transition: "border-color 0.15s ease" }}
                             onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; }}
                             onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "var(--brand-primary)", fontSize: "17px" }}>Cast Vote</h3>
                            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>Browse registered candidates and cast your ballot securely.</p>
                        </div>
                    </Link>

                    <Link to="/candidate" style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="analytics-card" style={{ cursor: "pointer", transition: "border-color 0.15s ease" }}
                             onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; }}
                             onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: "17px" }}>Apply as Candidate</h3>
                            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>Nominate yourself and submit your manifesto for an open role.</p>
                        </div>
                    </Link>

                    <Link to="/results" style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="analytics-card" style={{ cursor: "pointer", transition: "border-color 0.15s ease" }}
                             onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; }}
                             onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: "17px" }}>Election Results</h3>
                            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>Check the live election countdown and finalized results tally.</p>
                        </div>
                    </Link>

                    {isAdmin && (
                        <Link to="/admin/analytics" style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="analytics-card" style={{ cursor: "pointer", border: "1px dashed var(--brand-primary)", transition: "all 0.15s ease" }}
                                 onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-subtle)"; }}
                                 onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-card)"; }}>
                                <h3 style={{ margin: "0 0 8px 0", color: "var(--brand-primary)", fontSize: "17px" }}>Admin Analytics</h3>
                                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>Review turnout %, department participation, and export audit reports.</p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HomePage;
