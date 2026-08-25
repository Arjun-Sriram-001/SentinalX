import { useState } from "react"
import { Bar, Pie } from "react-chartjs-2"
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
ArcElement,
Tooltip,
Legend
} from "chart.js"

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
ArcElement,
Tooltip,
Legend
)

function Charts({ logs }) {

if(!logs || logs.length === 0){
return null
}

/* ---------------- VALID USERS ---------------- */

const validUsers = [
"admin","alice","bob","charlie","david",
"emma","frank","grace","henry","ivy","jack"
]

/* ---------------- LOGIN ACTIVITY ---------------- */

const successCount = logs.filter(l => l.status === "success").length
const failedCount = logs.filter(l => l.status === "failed").length

const loginChart = {
labels: ["Success", "Failed"],
datasets: [{
label: "Login Attempts",
data: [successCount, failedCount],
backgroundColor: ["#22c55e", "#ef4444"]
}]
}

/* ---------------- RISK DISTRIBUTION ---------------- */

const highRisk = logs.filter(l => l.risk >= 50).length
const mediumRisk = logs.filter(l => l.risk >= 20 && l.risk < 50).length
const lowRisk = logs.filter(l => l.risk < 20).length

const riskChart = {
labels: ["Low Risk", "Medium Risk", "High Risk"],
datasets: [{
data: [lowRisk, mediumRisk, highRisk],
backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"]
}]
}

/* ---------------- USER DROPDOWN ---------------- */

const [selectedUser,setSelectedUser] = useState("")

const users = [
...new Set(
logs
.filter(l => validUsers.includes(l.user))
.map(l => l.user)
)
]

/* ---------------- USER LOGIN TIMELINE ---------------- */

const userLogs = logs.filter(log => log.user === selectedUser)

const labels = userLogs.map(log => {
const d = new Date(log.time)
return d.getHours() + ":" + String(d.getMinutes()).padStart(2,"0")
})

const values = userLogs.map(() => 1)

const colors = userLogs.map(log =>
log.status === "success" ? "#22c55e" : "#ef4444"
)

const userTimelineChart = {
labels: labels,
datasets: [{
label: selectedUser + " Login Attempts",
data: values,
backgroundColor: colors
}]
}

return (

<div style={{display:"flex",flexDirection:"column",gap:"40px",marginBottom:"40px"}}>

{/* -------- FIRST TWO GRAPHS -------- */}

<div style={{display:"flex",gap:"40px"}}>

<div style={{width:"400px"}}>
<h3>Login Activity</h3>
<Bar data={loginChart}/>
</div>

<div style={{width:"400px"}}>
<h3>Risk Distribution</h3>
<Pie data={riskChart}/>
</div>

</div>

{/* -------- USER DROPDOWN -------- */}

<div>

<h3>User Login Timeline</h3>

<select
value={selectedUser}
onChange={(e)=>setSelectedUser(e.target.value)}
style={{
padding:"8px",
borderRadius:"6px",
marginBottom:"20px"
}}
>

<option value="">Select User</option>

{users.map((u,i)=>(
<option key={i} value={u}>{u}</option>
))}

</select>

</div>

{/* -------- USER TIMELINE GRAPH -------- */}

{selectedUser && (

<div style={{width:"900px"}}>

<Bar data={userTimelineChart}/>

</div>

)}

</div>

)

}

export default Charts