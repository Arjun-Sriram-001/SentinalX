import { useEffect, useState } from "react"
import axios from "axios"
import Charts from "./components/Charts"
function Dashboard() {

    const [logs, setLogs] = useState([])
    const [selectedThreat, setSelectedThreat] = useState(null)
    const [reasons, setReasons] = useState([])
    const [currentTime, setCurrentTime] = useState(new Date())
    const loadLogs = async () => {
        const res = await axios.get("http://127.0.0.1:8000/logs")
        setLogs(
            res.data.sort((a, b) => new Date(b.time) - new Date(a.time))
        )
    }

    useEffect(() => {
        loadLogs()

        const interval = setInterval(loadLogs, 5000)

        return () => clearInterval(interval)
    }, [])
    useEffect(() => {

        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)

    }, [])
    const totalLogins = logs.length
    const failedAttempts = logs.filter(
        l => l.status && l.status.toLowerCase() === "failed"
    ).length
    const highRisk = logs.filter(l => l.risk >= 50).length
    const suspicious = logs.filter(l => l.risk >= 30).length
    const showThreat = (log) => {

        let reasons = []

        if (log.risk >= 50) {
            reasons.push("Multiple failed login attempts detected")
        }

        if (log.status === "failed") {
            reasons.push("Authentication failure")
        }

        if (log.location.includes("Unknown")) {
            reasons.push("Location could not be verified")
        }

        if (reasons.length === 0) {
            reasons.push("Normal login behaviour detected")
        }

        alert(`
Threat Analysis

User: ${log.user}
IP Address: ${log.ip}
Location: ${log.location}

Risk Score: ${log.risk}

Reasons:
${reasons.join("\n")}
`)
    }

    const analyzeThreat = (log) => {

        if (log.factors && log.factors.length > 0) {
            setReasons(log.factors)
        } else {
            setReasons([{ reason: "No suspicious behaviour detected", score: 0 }])
        }

        setSelectedThreat(log)

    }
    return (

        <div style={{
            background: "#020617",
            color: "#22c55e",
            minHeight: "100vh",
            padding: "40px",
            fontFamily: "monospace"
        }}>

            <h1>🛡 SentinelX Security Dashboard</h1>

            <div className="stats-container">

                <div className="stat-card">
                    <h3>Total Logins</h3>
                    <p>{totalLogins}</p>
                </div>

                <div className="stat-card">
                    <h3>Failed Attempts</h3>
                    <p>{failedAttempts}</p>
                </div>

                <div className="stat-card danger">
                    <h3>High Risk</h3>
                    <p>{highRisk}</p>
                </div>

            </div>
            <div style={{
                position: "absolute",
                top: "20px",
                right: "40px",
                color: "#22c55e",
                fontSize: "14px"
            }}>

                {currentTime.toLocaleString()}

            </div>
            <Charts logs={logs} />
            <button className="refresh-btn" onClick={loadLogs}>
                🔄 Refresh Logs
            </button>
            <div className="stat-card warning">
                <h3>Suspicious Activity</h3>
                <p>{suspicious}</p>
            </div>
            <table className="logs-table">

                <thead>
                    <tr>
                        <th>User</th>
                        <th>IP Address</th>
                        <th>Status</th>
                        <th>Risk Score</th>
                        <th>Location</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>

                <tbody>

                    {logs.map((log, i) => (
                        <tr key={i} onClick={() => analyzeThreat(log)} className="log-row">

                            <td>{log.user}</td>
                            <td>{log.ip}</td>
                            <td>
                                <span className={log.status === "failed" ? "status-failed" : "status-success"}>
                                    {log.status.toUpperCase()}
                                </span>
                            </td>

                            <td
                                className={
                                    log.risk >= 50 ? "risk-high" :
                                        log.risk >= 20 ? "risk-medium" :
                                            "risk-low"
                                }
                            >
                                {log.risk} {log.risk >= 50 && "🚨"}
                            </td>
                            <td>{log.location}</td>

                            <td>{log.time}</td>

                        </tr>
                    ))}

                </tbody>

            </table>

            {selectedThreat && (

                <div className="modal-overlay">

                    <div className="threat-modal">

                        <h2>🚨 Threat Investigation</h2>

                        <p><b>User:</b> {selectedThreat.user}</p>
                        <p><b>IP:</b> {selectedThreat.ip}</p>
                        <p><b>Location:</b> {selectedThreat.location}</p>

                        <p><b>Risk Score:</b> {selectedThreat.risk}</p>

                        <h3>Detection Reasons</h3>

                        <ul>

                            {reasons.map((r, i) => (
                                <li key={i}>
                                    → {r.reason} (+{r.score})
                                </li>
                            ))}

                        </ul>

                        <button onClick={() => setSelectedThreat(null)}>
                            Close
                        </button>

                    </div>

                </div>

            )}

        </div>

    )
}

export default Dashboard