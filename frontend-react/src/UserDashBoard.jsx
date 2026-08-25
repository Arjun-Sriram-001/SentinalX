import { useEffect, useState } from "react"
import axios from "axios"
import { Bar } from "react-chartjs-2"

function UserDashboard({ username, onBack }){

const [logs,setLogs] = useState([])

const loadLogs = async ()=>{

const res = await axios.get(
`http://127.0.0.1:8000/user_logs/${username}`
)

setLogs(res.data)

}

useEffect(()=>{
loadLogs()
},[])

const success = logs.filter(l=>l.status==="success").length
const failed = logs.filter(l=>l.status==="failed").length

const activityChart = {
labels:["Success","Failed"],
datasets:[{
label:"Login Activity",
data:[success,failed],
backgroundColor:["#22c55e","#ef4444"]
}]
}

return(

<div style={{
background:"#020617",
color:"#22c55e",
minHeight:"100vh",
padding:"40px"
}}>

<button
onClick={onBack}
style={{
marginBottom:"20px",
padding:"10px",
background:"#334155",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
⬅ Back
</button>

<h1>User Security Dashboard</h1>

<h3>User: {username}</h3>

<div style={{width:"400px",marginBottom:"30px"}}>
<Bar data={activityChart}/>
</div>

<table className="logs-table">

<thead>
<tr>
<th>Time</th>
<th>IP</th>
<th>Location</th>
<th>Status</th>
<th>Risk</th>
</tr>
</thead>

<tbody>

{logs.map((log,i)=>(
<tr key={i}>

<td>{log.time}</td>
<td>{log.ip}</td>
<td>{log.location}</td>
<td>{log.status}</td>
<td>{log.risk}</td>

</tr>
))}

</tbody>

</table>

</div>

)

}

export default UserDashboard