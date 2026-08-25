import { useState } from "react"
import axios from "axios"

function Login({ onLogin }) {

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [error,setError] = useState("")

const login = async () => {

try{

const res = await axios.post("http://127.0.0.1:8000/login",{
username:username.trim(),
password:password.trim()
})
console.log("LOGIN RESPONSE:", res.data)
if(res.data.status === "success"){
   onLogin(res.data.role,username)
}else{
   setError(res.data.message || "Invalid credentials")
}

}catch{
setError("Server error")
}

}

return (

<div className="login-container">

<div className="login-card">

<h1>🛡 SentinelX</h1>
<p className="subtitle">Security Monitoring System</p>

<input
placeholder="Username"
value={username}
onChange={(e)=>setUsername(e.target.value)}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button onClick={login}>
Login
</button>

<p className="error">{error}</p>

</div>

</div>

)

}

export default Login