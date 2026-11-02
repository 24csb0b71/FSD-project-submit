import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getIsAdmin, removeToken } from "./utils/auth";

function AdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("ALL");

    const isAdmin = getIsAdmin();

    const fetchAnalytics = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("http://localhost:8080/api/voting/analytics");
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            } else {
                setError("Failed to load analytics data from server.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not connect to the backend server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchAnalytics();
        }
    }, [isAdmin]);

    // Export CSV Feature
    const handleExportCSV = () => {
        if (!analytics || !analytics.positions) return;

        const rows = [
            ["Position", "Candidate ID", "Candidate Name", "Student Roll No", "Votes Received", "Vote Share (%)"]
        ];

        analytics.positions.forEach(pos => {
            if (pos.candidates && pos.candidates.length > 0) {
                pos.candidates.forEach(cand => {
                    rows.push([
                        pos.positionName,
                        cand.candidateId,
                        cand.name,
                        cand.studentId,
                        cand.votes,
                        cand.percentage + "%"
                    ]);
                });
            } else {
                rows.push([pos.positionName, "N/A", "No Candidates", "-", "0", "0%"]);
            }
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + rows.map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `digivote_election_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isAdmin) {
        return (
            <div className="loginPage">
                <div className="loginContainer" style={{ textAlign: "center" }}>
                    <h2 style={{ color: "var(--red-accent)" }}>Access Restricted</h2>
                    <p style={{ color: "var(--text-muted)" }}>You need administrator privileges to view election analytics.</p>
                    <Link to="/dashboard">
                        <button className="submit" style={{ marginTop: "16px" }}>Return to Dashboard</button>
                    </Link>
                </div>
            </div>
        );
    }

    const filteredPositions = analytics?.positions?.filter(pos => {
        if (selectedPosition === "ALL") return true;
        return String(pos.positionId) === String(selectedPosition);
    }) || [];

    return (
        <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
            {/* Top Navbar */}
            <div className="headers">
                <div className="logo" style={{ fontWeight: "700", fontSize: "18px", color: "var(--brand-primary)" }}>
                    DigiVote <span style={{ fontSize: "13px", fontWeight: "normal", color: "var(--text-muted)", marginLeft: "8px" }}>Admin Portal</span>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/voting">Voting</Link>
                    <Link to="/candidate">Apply as Candidate</Link>
                    <Link to="/results">Results</Link>
                    <Link to="/admin">Admin Panel</Link>
                    <Link to="/admin/analytics" style={{ color: "var(--brand-primary)", fontWeight: "600" }}>Analytics</Link>
                    <Link to="/">
                        <button onClick={removeToken} style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "6px 14px", cursor: "pointer" }}>
                            Log Out
                        </button>
                    </Link>
                </div>
            </div>

            <div style={{ maxWidth: "1100px", margin: "32px auto", padding: "0 24px" }}>
                {/* Header & Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", margin: "0 0 6px 0", color: "var(--text-primary)" }}>Election Turnout & Analytics</h1>
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
                            Real-time participation metrics, candidate standings, and demographic breakdowns.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                            onClick={fetchAnalytics}
                            className="btn-secondary"
                            style={{ padding: "8px 16px", cursor: "pointer" }}
                        >
                            ↻ Refresh
                        </button>
                        <button 
                            onClick={handleExportCSV}
                            className="submit"
                            style={{ width: "auto", padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}
                            disabled={loading || !analytics}
                        >
                            ↓ Export Audit CSV
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: "8px", marginBottom: "24px" }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                        Loading analytics data...
                    </div>
                ) : analytics ? (
                    <>
                        {/* KPI Cards Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "32px" }}>
                            <div className="analytics-card">
                                <div className="card-label">Overall Voter Turnout</div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "8px 0" }}>
                                    <span style={{ fontSize: "32px", fontWeight: "700", color: "var(--brand-primary)" }}>
                                        {analytics.turnoutPercentage}%
                                    </span>
                                    <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                                        ({analytics.totalVoters} of {analytics.totalStudents})
                                    </span>
                                </div>
                                <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ 
                                        height: "100%", 
                                        width: `${Math.min(analytics.turnoutPercentage, 100)}%`, 
                                        background: "var(--brand-primary)",
                                        borderRadius: "4px"
                                    }} />
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-label">Total Ballots Cast</div>
                                <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-primary)", margin: "8px 0" }}>
                                    {analytics.totalVotesCast}
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                    Across all contested positions
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-label">Election Status</div>
                                <div style={{ margin: "10px 0" }}>
                                    <span style={{
                                        display: "inline-block",
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        background: analytics.electionStatus === "ACTIVE" ? "#ecfdf5" : analytics.electionStatus === "CLOSED" ? "#fef2f2" : "#f1f5f9",
                                        color: analytics.electionStatus === "ACTIVE" ? "#065f46" : analytics.electionStatus === "CLOSED" ? "#991b1b" : "#475569",
                                        border: `1px solid ${analytics.electionStatus === "ACTIVE" ? "#a7f3d0" : analytics.electionStatus === "CLOSED" ? "#fecaca" : "#cbd5e1"}`
                                    }}>
                                        ● {analytics.electionStatus}
                                    </span>
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                    {analytics.endTime ? `Ends: ${new Date(analytics.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}` : "No schedule set"}
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-label">Contested Positions</div>
                                <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-primary)", margin: "8px 0" }}>
                                    {analytics.positions?.length || 0}
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                    {analytics.positions?.reduce((sum, p) => sum + (p.candidates?.length || 0), 0)} approved candidates
                                </div>
                            </div>
                        </div>

                        {/* Demographics Row (Branch & Year Breakdown) */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "36px" }}>
                            {/* Branch Turnout */}
                            <div className="analytics-section">
                                <h3 style={{ fontSize: "16px", margin: "0 0 16px 0", color: "var(--text-primary)", fontWeight: "600" }}>
                                    Turnout by Department / Branch
                                </h3>
                                {analytics.branchTurnout?.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No student data available.</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {analytics.branchTurnout?.map(b => (
                                            <div key={b.branch}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                                                    <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{b.branch}</span>
                                                    <span style={{ color: "var(--text-muted)" }}>{b.voted} / {b.total} voted ({b.turnout}%)</span>
                                                </div>
                                                <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${Math.min(b.turnout, 100)}%`, background: "#3b82f6", borderRadius: "3px" }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Batch / Year Turnout */}
                            <div className="analytics-section">
                                <h3 style={{ fontSize: "16px", margin: "0 0 16px 0", color: "var(--text-primary)", fontWeight: "600" }}>
                                    Turnout by Academic Batch
                                </h3>
                                {analytics.yearTurnout?.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No student data available.</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {analytics.yearTurnout?.map(y => (
                                            <div key={y.year}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                                                    <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{y.year}</span>
                                                    <span style={{ color: "var(--text-muted)" }}>{y.voted} / {y.total} voted ({y.turnout}%)</span>
                                                </div>
                                                <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${Math.min(y.turnout, 100)}%`, background: "#10b981", borderRadius: "3px" }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Position Results Section */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                                <h2 style={{ fontSize: "20px", margin: 0, color: "var(--text-primary)" }}>Position Vote Breakdown</h2>
                                
                                {/* Position Filter Pills */}
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <button 
                                        onClick={() => setSelectedPosition("ALL")}
                                        className={selectedPosition === "ALL" ? "filter-pill-active" : "filter-pill"}
                                    >
                                        All Positions
                                    </button>
                                    {analytics.positions?.map(p => (
                                        <button 
                                            key={p.positionId}
                                            onClick={() => setSelectedPosition(p.positionId)}
                                            className={String(selectedPosition) === String(p.positionId) ? "filter-pill-active" : "filter-pill"}
                                        >
                                            {p.positionName}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Position Cards */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {filteredPositions.map(pos => (
                                    <div key={pos.positionId} className="analytics-section">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: "17px", color: "var(--text-primary)" }}>{pos.positionName}</h3>
                                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total Votes: {pos.totalVotes}</span>
                                            </div>
                                            <span style={{ fontSize: "12px", background: "var(--bg-subtle)", padding: "4px 8px", borderRadius: "6px", color: "var(--text-muted)" }}>
                                                {pos.candidates?.length || 0} Contenders
                                            </span>
                                        </div>

                                        {pos.candidates?.length === 0 ? (
                                            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "12px 0" }}>No approved candidates registered for this position.</p>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                                {pos.candidates.map((cand, idx) => (
                                                    <div key={cand.candidateId} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{cand.name}</span>
                                                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>({cand.studentId})</span>
                                                                {idx === 0 && cand.votes > 0 && (
                                                                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#166534", background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                                                                        Leading
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                                                                {cand.votes} votes <span style={{ color: "var(--text-muted)", fontWeight: "normal", fontSize: "13px" }}>({cand.percentage}%)</span>
                                                            </div>
                                                        </div>

                                                        {/* Vote Share Progress Bar */}
                                                        <div style={{ height: "8px", width: "100%", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                                                            <div style={{ 
                                                                height: "100%", 
                                                                width: `${cand.percentage}%`, 
                                                                background: idx === 0 ? "var(--brand-primary)" : "#64748b",
                                                                borderRadius: "4px",
                                                                transition: "width 0.4s ease"
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default AdminAnalytics;
