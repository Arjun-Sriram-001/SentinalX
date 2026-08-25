import { useState } from "react"
import UserPage from "./UserPage"
import Dashboard from "./Dashboard"
import Login from "./Login"

function App(){

const [role,setRole] = useState(null)
const [username,setUsername] = useState("")

if(!role){
return <Login onLogin={(r,u)=>{
setRole(r)
setUsername(u)
}} />
}

if(role === "admin"){
return <Dashboard />
}

return <UserPage username={username} />

}

export default App