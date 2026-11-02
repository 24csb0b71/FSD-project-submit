import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getIsAdmin, removeToken } from "./utils/auth";

function Admin(){
    const [candidates, setCandidates] = useState([]);
    const [message, setMessage] = useState(""); 
    const [positionName, setPositionName] = useState({});
    const [candidateName, setCandidateName] = useState({});
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [scheduleStatus, setScheduleStatus] = useState("NOT_SCHEDULED");

    const isAdmin = getIsAdmin();

    useEffect(() => {
        if (!isAdmin) return;

        // Fetch pending candidates
        fetch("http://localhost:8080/api/candidate/allpending")
            .then(response => response.json())
            .then(data => {
                setCandidates(data);
                data.forEach(candidate => {
                    fetch(`http://localhost:8080/api/position/${candidate.positionId}/name`)
                        .then(res => res.text())
                        .then(name => {
                            setPositionName(prev => ({
                                ...prev,
                                [candidate.positionId]: name
                            }));
                        });
                });
            })
            .catch(error => console.error(error));

        // Fetch student names to resolve Candidate names
        fetch("http://localhost:8080/api/users/all")
            .then(response => response.json())
            .then(data => {
                const nameMap = {};
                data.forEach(student => {
                    const id = (student.studentId || student.student_id || "").toUpperCase();
                    if (id) {
                        nameMap[id] = student.sName || student.sname || student.s_name || "Unknown Student";
                    }
                });
                setCandidateName(nameMap);
            })
            .catch(error => console.error(error));

        // Fetch current schedule
        fetch("http://localhost:8080/api/election/config")
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data) {
                    setStartTime(data.start_time || "");
                    setEndTime(data.end_time || "");
                    setScheduleStatus(data.status || "NOT_STARTED");
                }
            })
            .catch(err => console.error(err));
    }, [isAdmin]);

    const handleSaveSchedule = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setMessage("");

        if (!startTime || !endTime) {
            setMessage("Error: Start time and End time are required.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/election/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    start_time: startTime,
                    end_time: endTime
                })
            });

            if (response.ok) {
                const data = await response.json();
                setScheduleStatus(data.status);
                setMessage("Election schedule updated successfully!");
            } else {
                setMessage("Failed to update election schedule.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Error connecting to server.");
        }
    };

    // Quick presets for convenience
    const handleSetQuickSchedule = async (type) => {
        const now = new Date();
        let start, end;
        if (type === "ACTIVE_2H") {
            const startDate = new Date(now.getTime() - 60000); // 1 min ago
            const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
            start = startDate.toISOString().slice(0, 16);
            end = endDate.toISOString().slice(0, 16);
        } else if (type === "CLOSE_NOW") {
            const startDate = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            const endDate = new Date(now.getTime() - 60000); // 1 min ago
            start = startDate.toISOString().slice(0, 16);
            end = endDate.toISOString().slice(0, 16);
        }

        setStartTime(start);
        setEndTime(end);

        try {
            const response = await fetch("http://localhost:8080/api/election/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ start_time: start, end_time: end })
            });
            if (response.ok) {
                const data = await response.json();
                setScheduleStatus(data.status);
                setMessage(type === "ACTIVE_2H" ? "Election is now ACTIVE for the next 2 hours." : "Election is now CLOSED.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error updating schedule preset.");
        }
    };

    const handleApprove = async (candidateId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/candidate/${candidateId}/approve`, {
                method: "POST"
            });
            if (response.ok) {
                setCandidates(prev => prev.filter(c => c.candidateId !== candidateId));
                setMessage("Candidate approved successfully!");
            } else {
                setMessage("Failed to approve candidate.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Error connecting to server.");
        }
    };

    const handleDisapprove = async (candidateId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/candidate/${candidateId}/disapprove`, {
                method: "POST"
            });
            if (response.ok) {
                setCandidates(prev => prev.filter(c => c.candidateId !== candidateId));
                setMessage("Candidate disapproved.");
            } else {
                setMessage("Failed to disapprove candidate.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Error connecting to server.");
        }
    };

    if (!isAdmin) {
        return (
            <div className="loginPage">
                <div className="loginContainer" style={{ textAlign: "center" }}>
                    <h2 style={{ color: "var(--red-accent)" }}>Access Restricted</h2>
                    <p style={{ color: "var(--text-muted)" }}>Admin privileges are required to view this page.</p>
                    <Link to="/dashboard">
                        <button className="submit" style={{ marginTop: "16px" }}>Back to Dashboard</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
            <div className="headers">
                <div className="logo" style={{ fontWeight: "700", fontSize: "18px", color: "var(--brand-primary)" }}>
                    DigiVote <span style={{ fontSize: "13px", fontWeight: "normal", color: "var(--text-muted)", marginLeft: "8px" }}>Admin Portal</span>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/voting">Voting</Link>
                    <Link to="/candidate">Apply as Candidate</Link>
                    <Link to="/results">Results</Link>
                    <Link to="/admin" style={{ color: "var(--brand-primary)", fontWeight: "600" }}>Admin Panel</Link>
                    <Link to="/admin/analytics">Analytics</Link>
                    <Link to="/">
                        <button onClick={removeToken} style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "6px 14px", cursor: "pointer" }}>
                            Log Out
                        </button>
                    </Link>
                </div>
            </div>

            <div style={{ padding: "32px 24px", maxWidth: "960px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", margin: "0 0 6px 0", color: "var(--text-primary)" }}>Admin Control Panel</h1>
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
                            Configure election schedules, approve candidate applications, and monitor turnout.
                        </p>
                    </div>
                    <Link to="/admin/analytics" style={{ textDecoration: "none" }}>
                        <button className="submit" style={{ width: "auto", padding: "10px 20px", fontSize: "14px", cursor: "pointer" }}>
                            📊 View Live Turnout & Analytics →
                        </button>
                    </Link>
                </div>

                {message && (
                    <div style={{ 
                        background: message.includes("Failed") || message.includes("Error") ? "#fef2f2" : "#f0fdf4",
                        border: `1px solid ${message.includes("Failed") || message.includes("Error") ? "#fecaca" : "#bbf7d0"}`,
                        color: message.includes("Failed") || message.includes("Error") ? "#991b1b" : "#166534",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        textAlign: "center",
                        fontWeight: "500",
                        marginBottom: "24px"
                    }}>
                        {message}
                    </div>
                )}

                {/* Election Scheduler Form */}
                <div className="analytics-section" style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "20px" }}>
                        <h2 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>Election Scheduler</h2>
                        <span style={{ 
                            fontSize: "12px", 
                            fontWeight: "600",
                            padding: "4px 10px", 
                            borderRadius: "16px",
                            background: scheduleStatus === "ACTIVE" ? "#ecfdf5" : scheduleStatus === "CLOSED" ? "#fef2f2" : "#f1f5f9",
                            color: scheduleStatus === "ACTIVE" ? "#065f46" : scheduleStatus === "CLOSED" ? "#991b1b" : "#475569"
                        }}>
                            Status: {scheduleStatus}
                        </span>
                    </div>

                    <form onSubmit={handleSaveSchedule}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                                    Voting Opens (Start Time)
                                </label>
                                <input 
                                    type="datetime-local" 
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)} 
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                                    Voting Closes (End Time)
                                </label>
                                <input 
                                    type="datetime-local" 
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button 
                                    type="button" 
                                    onClick={() => handleSetQuickSchedule("ACTIVE_2H")}
                                    className="btn-secondary"
                                    style={{ fontSize: "13px", padding: "8px 14px" }}
                                >
                                    ▶ Start 2-Hr Election Now
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleSetQuickSchedule("CLOSE_NOW")}
                                    className="btn-secondary"
                                    style={{ fontSize: "13px", padding: "8px 14px", color: "var(--red-accent)" }}
                                >
                                    ⏹ End Election Now
                                </button>
                            </div>
                            <button className="submit" type="submit" style={{ width: "auto", padding: "9px 24px" }}>
                                Save Schedule
                            </button>
                        </div>
                    </form>
                </div>

                {/* Pending Candidate Approvals */}
                <h2 style={{ fontSize: "20px", marginBottom: "16px", color: "var(--text-primary)" }}>Pending Candidate Applications</h2>
                {candidates.length === 0 ? (
                    <div className="analytics-section" style={{ textAlign: "center", color: "var(--text-muted)", padding: "36px" }}>
                        ✓ No pending candidate applications to review.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                        {candidates.map(candidate => (
                            <div key={candidate.candidateId} className="analytics-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <img 
                                    src={candidate.img_src || "https://placehold.co/150x150?text=Candidate"} 
                                    style={{ width: "120px", height: "120px", borderRadius: "8px", objectFit: "cover", marginBottom: "14px", border: "1px solid var(--border-color)" }} 
                                    alt="candidate" 
                                />
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", color: "var(--text-primary)" }}>
                                    {candidateName[(candidate.studentId || candidate.student_id || "").toUpperCase()] || "Student Candidate"}
                                </h3>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--brand-primary)", marginBottom: "4px" }}>
                                    {positionName[candidate.positionId] || "Loading Position..."}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                                    Roll No: {(candidate.studentId || candidate.student_id || "").toUpperCase()}
                                </div>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", flexGrow: 1, margin: "0 0 16px 0", lineHeight: "1.4" }}>
                                    "{candidate.manifesto}"
                                </p>
                                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                                    <button 
                                        onClick={() => handleApprove(candidate.candidateId)}
                                        className="submit"
                                        style={{ background: "#10b981", padding: "8px", fontSize: "14px" }}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleDisapprove(candidate.candidateId)}
                                        style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "8px", fontWeight: "600", width: "100%", cursor: "pointer", fontSize: "14px" }}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Admin;
