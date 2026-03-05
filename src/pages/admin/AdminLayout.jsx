import Sidebar from "../../components/admin/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout(){

return(

<div style={{
display:"flex",
minHeight:"100vh",
background:"linear-gradient(135deg, #f8fafc 0%, #ecfeff 45%, #f0f9ff 100%)"
}}>

<Sidebar/>

<div style={{flex:1,padding:"30px 24px"}}>

<Outlet/>

</div>

</div>

)

}
