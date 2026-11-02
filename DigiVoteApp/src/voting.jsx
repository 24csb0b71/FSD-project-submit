import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStudentId, getIsAdmin, removeToken } from "./utils/auth";

function Voting(){
    const [candidates, setCandidates] = useState([]);
    const [message, setMessage] = useState(""); 
    const [positionName, setPositionName] = useState({});
    const [candidateName, setCandidateName] = useState({});
    const [electionStatus, setElectionStatus] = useState("LOADING");
    const [selectedPosition, setSelectedPosition] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const isAdmin = getIsAdmin();

    const submit = async (candidateId, positionId) => {
        if (electionStatus !== "ACTIVE") {
            setMessage("Voting is not currently active!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/voting/vote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    voter_id: getStudentId()?.toUpperCase(),
                    position_id: positionId,
                    candidate_id: candidateId
                })
            });

            const msg = await response.text();  
            setMessage(msg); 
        } catch (err) {
            console.error(err);
            setMessage("Error connecting to voting service.");
        }
    };

    useEffect(() => {
        fetch("http://localhost:8080/api/election/config")
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data) {
                    setElectionStatus(data.status);
                } else {
                    setElectionStatus("NOT_SCHEDULED");
                }
            })
            .catch(err => {
                console.error(err);
                setElectionStatus("ERROR");
            });
    }, []);

    useEffect(() => {
        fetch("http://localhost:8080/api/candidate/all")
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
    }, []);

    useEffect(() => {
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
    }, []);

    // Filter candidates by Position and Search
    const uniquePositions = Array.from(new Set(candidates.map(c => c.positionId)));

    const filteredCandidates = candidates.filter(candidate => {
        const matchesPosition = selectedPosition === "ALL" || String(candidate.positionId) === String(selectedPosition);
        const name = (candidateName[(candidate.studentId || candidate.student_id || "").toUpperCase()] || "").toLowerCase();
        const pos = (positionName[candidate.positionId] || "").toLowerCase();
        const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || pos.includes(searchTerm.toLowerCase());
        return matchesPosition && matchesSearch;
    });

    return (
        <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
            <div className="headers">
                <div className="logo" style={{ fontWeight: "700", fontSize: "18px", color: "var(--brand-primary)" }}>DigiVote</div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/voting" style={{ color: "var(--brand-primary)", fontWeight: "600" }}>Voting</Link>
                    <Link to="/candidate">Apply as Candidate</Link>
                    <Link to="/results">Results</Link>
                    {isAdmin && <Link to="/admin">Admin Panel</Link>}
                    {isAdmin && <Link to="/admin/analytics">Analytics</Link>}
                    <Link to="/">
                        <button onClick={removeToken}>Log Out</button>
                    </Link>
                </div>
            </div>

            <div style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "28px", margin: "0 0 6px 0", color: "var(--text-primary)" }}>Active Ballot Box</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
                        Select your candidate for each contested position. You may cast one vote per position.
                    </p>
                </div>

                {electionStatus !== "ACTIVE" && (
                    <div style={{ 
                        background: "#fef2f2", 
                        border: "1px solid #fecaca", 
                        color: "#991b1b",
                        borderRadius: "8px", 
                        padding: "12px 16px", 
                        textAlign: "center", 
                        fontWeight: "500",
                        fontSize: "14px",
                        marginBottom: "24px"
                    }}>
                        Voting is currently closed or not started yet. Status: <strong>{electionStatus}</strong>
                    </div>
                )}

                {message && (
                    <div style={{ 
                        background: message.includes("successfully") ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${message.includes("successfully") ? "#bbf7d0" : "#fecaca"}`,
                        color: message.includes("successfully") ? "#166534" : "#991b1b",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: "14px",
                        marginBottom: "24px"
                    }}>
                        {message}
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button 
                            onClick={() => setSelectedPosition("ALL")}
                            className={selectedPosition === "ALL" ? "filter-pill-active" : "filter-pill"}
                        >
                            All Positions ({candidates.length})
                        </button>
                        {uniquePositions.map(posId => (
                            <button 
                                key={posId}
                                onClick={() => setSelectedPosition(posId)}
                                className={String(selectedPosition) === String(posId) ? "filter-pill-active" : "filter-pill"}
                            >
                                {positionName[posId] || `Position #${posId}`}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: "240px" }}>
                        <input 
                            type="text" 
                            placeholder="Search candidate..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ margin: 0, padding: "8px 12px", fontSize: "13px" }}
                        />
                    </div>
                </div>

                {filteredCandidates.length === 0 ? (
                    <div className="analytics-section" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                        No candidates found for the selected filter.
                    </div>
                ) : (
                    <div className="card-grid" style={{ padding: 0 }}>
                        {filteredCandidates.map(candidate => (
                            <div key={candidate.candidateId} className="glass-card">
                                <img 
                                    src={candidate.img_src || "https://placehold.co/150x150?text=Candidate"} 
                                    className="images" 
                                    alt="candidate" 
                                />
                                <h3>{candidateName[(candidate.studentId || candidate.student_id || "").toUpperCase()] || "Candidate"}</h3>
                                <h4>{positionName[candidate.positionId] || "Loading Position..."}</h4>
                                <p>"{candidate.manifesto}"</p>
                                <button
                                    disabled={electionStatus !== "ACTIVE"}
                                    onClick={() => submit(candidate.candidateId, candidate.positionId)}
                                    style={{
                                        opacity: electionStatus !== "ACTIVE" ? 0.5 : 1,
                                        cursor: electionStatus !== "ACTIVE" ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {electionStatus === "ACTIVE" ? "Vote for Candidate" : "Voting Inactive"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Voting;
