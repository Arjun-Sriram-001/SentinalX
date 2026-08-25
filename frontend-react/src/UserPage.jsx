import { useState } from "react"
import UserDashboard from "./UserDashBoard"

function UserPage({ username }){

const [showDashboard,setShowDashboard] = useState(false)

if(showDashboard){
return <UserDashboard username={username} onBack={()=>setShowDashboard(false)} />
}

return (

<div style={{
background:"#020617",
color:"#22c55e",
minHeight:"100vh",
padding:"40px",
textAlign:"center"
}}>

<h1>✅ Login Successful</h1>

<h2>Welcome {username}</h2>

<p>Your account has been authenticated successfully.</p>

<h3>Quick Links</h3>

<ul>
<li><a href="https://news.ycombinator.com">Tech News</a></li>
<li><a href="https://github.com">GitHub</a></li>
<li><a href="https://stackoverflow.com">StackOverflow</a></li>
</ul>

<button
onClick={()=>setShowDashboard(true)}
style={{
padding:"12px 20px",
background:"#22c55e",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontSize:"16px",
marginTop:"20px"
}}
>
View Security Activity
</button>

</div>

)

}

export default UserPage