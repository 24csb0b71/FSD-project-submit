import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getIsAdmin, removeToken } from "./utils/auth";

function Results() {
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState("LOADING"); // LOADING, ACTIVE, CLOSED, ERROR
    const [endTime, setEndTime] = useState(null);
    const [countdown, setCountdown] = useState("");
    const [message, setMessage] = useState("");

    const isAdmin = getIsAdmin();

    useEffect(() => {
        const fetchStatusAndResults = async () => {
            try {
                const configRes = await fetch("http://localhost:8080/api/election/config");
                if (configRes.ok) {
                    const configData = await configRes.json();
                    setStatus(configData.status);
                    if (configData.end_time) {
                        setEndTime(new Date(configData.end_time));
                    }

                    if (configData.status === "CLOSED" || isAdmin) {
                        const resultsRes = await fetch(`http://localhost:8080/api/voting/results?is_admin=${isAdmin}`);
                        if (resultsRes.ok) {
                            const resultsData = await resultsRes.json();
                            setResults(resultsData);
                        } else {
                            const errText = await resultsRes.text();
                            setMessage(errText || "Failed to load results.");
                        }
                    }
                } else {
                    setStatus("NOT_SCHEDULED");
                }
            } catch (error) {
                console.error(error);
                setStatus("ERROR");
            }
        };

        fetchStatusAndResults();
    }, [isAdmin]);

    useEffect(() => {
        if (!endTime || status !== "ACTIVE") return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime.getTime() - now;

            if (distance < 0) {
                setCountdown("Voting closed. Refreshing...");
                clearInterval(interval);
                window.location.reload();
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime, status]);

    const getGroupedResults = () => {
        const groups = {};
        results.forEach(res => {
            const pos = res.positionName || "Unassigned Position";
            if (!groups[pos]) {
                groups[pos] = [];
            }
            groups[pos].push(res);
        });

        Object.keys(groups).forEach(pos => {
            groups[pos].sort((a, b) => b.voteCount - a.voteCount);
        });

        return groups;
    };

    const grouped = getGroupedResults();

    const getTotalVotesForPosition = (candidatesList) => {
        return candidatesList.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    };

    return (
        <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
            <div className="headers">
                <div className="logo" style={{ fontWeight: "700", fontSize: "18px", color: "var(--brand-primary)" }}>DigiVote</div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/voting">Voting</Link>
                    <Link to="/candidate">Apply as Candidate</Link>
                    <Link to="/results" style={{ color: "var(--brand-primary)", fontWeight: "600" }}>Results</Link>
                    {isAdmin && <Link to="/admin">Admin Panel</Link>}
                    {isAdmin && <Link to="/admin/analytics">Analytics</Link>}
                    <Link to="/">
                        <button onClick={removeToken}>Log Out</button>
                    </Link>
                </div>
            </div>

            <div style={{ padding: "32px 24px", maxWidth: "960px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "28px", margin: "0 0 6px 0", color: "var(--text-primary)" }}>Election Standings</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
                        Official vote counts and finalized outcomes per position.
                    </p>
                </div>

                {isAdmin && status !== "CLOSED" && (
                    <div style={{ 
                        background: "#eff6ff", 
                        border: "1px solid #bfdbfe", 
                        color: "#1e40af",
                        borderRadius: "8px", 
                        padding: "10px 16px", 
                        textAlign: "center", 
                        fontWeight: "500",
                        fontSize: "13px",
                        marginBottom: "24px"
                    }}>
                        ADMIN AUDIT: Viewing live interim counts before polls officially conclude.
                    </div>
                )}

                {status === "LOADING" && (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                        Loading election data...
                    </div>
                )}

                {status === "ACTIVE" && !isAdmin && (
                    <div className="analytics-section" style={{ textAlign: "center", padding: "48px 24px" }}>
                        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏱</div>
                        <h2 style={{ fontSize: "22px", margin: "0 0 8px 0", color: "var(--text-primary)" }}>Voting is Currently Live</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px auto" }}>
                            To ensure election integrity, final tally results will automatically be released once the voting window closes.
                        </p>
                        <div style={{ 
                            display: "inline-block", 
                            background: "var(--bg-main)", 
                            border: "1px solid var(--border-color)", 
                            borderRadius: "8px", 
                            padding: "12px 24px",
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "var(--brand-primary)"
                        }}>
                            {countdown || "Calculating remaining time..."}
                        </div>
                    </div>
                )}

                {(status === "CLOSED" || (isAdmin && (status === "ACTIVE" || status === "CLOSED"))) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {Object.keys(grouped).length === 0 ? (
                            <div className="analytics-section" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                                No results recorded yet.
                            </div>
                        ) : (
                            Object.keys(grouped).map(posName => {
                                const posCandidates = grouped[posName];
                                const totalVotes = getTotalVotesForPosition(posCandidates);
                                const winner = posCandidates[0];

                                return (
                                    <div key={posName} className="analytics-section">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "20px" }}>
                                            <div>
                                                <h2 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>{posName}</h2>
                                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total Votes: {totalVotes}</span>
                                            </div>
                                            {status === "CLOSED" && winner && winner.voteCount > 0 && (
                                                <div style={{ fontSize: "12px", fontWeight: "600", color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: "14px" }}>
                                                    Winner: {winner.sname}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                            {posCandidates.map((cand, idx) => {
                                                const pct = totalVotes > 0 ? ((cand.voteCount / totalVotes) * 100).toFixed(1) : 0;
                                                return (
                                                    <div key={cand.candidateId} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                <img 
                                                                    src={cand.imgSrc || "https://placehold.co/100x100?text=Candidate"} 
                                                                    alt={cand.sname} 
                                                                    style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                                                                />
                                                                <div>
                                                                    <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{cand.sname}</span>
                                                                    <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-muted)" }}>({cand.studentId})</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                                                                {cand.voteCount} votes <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "normal" }}>({pct}%)</span>
                                                            </div>
                                                        </div>

                                                        <div style={{ height: "8px", width: "100%", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                                                            <div style={{ 
                                                                height: "100%", 
                                                                width: `${pct}%`, 
                                                                background: idx === 0 ? "var(--brand-primary)" : "#64748b",
                                                                borderRadius: "4px"
                                                            }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Results;
