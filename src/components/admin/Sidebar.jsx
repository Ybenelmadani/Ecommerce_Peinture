import { NavLink } from "react-router-dom";

export default function Sidebar(){

    const linkBaseStyle = {
    display: "block",
    padding: "8px 10px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "13px",
    transition: "all .2s ease"
    };

    return(

    <div style={{
    width:"210px",
    background:"linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    color:"#fff",
    padding:"18px 12px",
    minHeight:"100vh"
    }}>

    <h2 style={{margin:"0 8px 14px",fontSize:"21px",fontWeight:900,letterSpacing:"0.01em"}}>Admin</h2>

        <nav style={{display:"flex",flexDirection:"column",gap:"4px"}}>

            <NavLink to="/admin" style={({isActive})=>({
            ...linkBaseStyle,
            color:isActive ? "#0f172a" : "#e2e8f0",
            background:isActive ? "#e2e8f0" : "transparent"
            })}>Dashboard</NavLink>

            <NavLink to="/admin/categories" style={({isActive})=>({
            ...linkBaseStyle,
            color:isActive ? "#0f172a" : "#e2e8f0",
            background:isActive ? "#e2e8f0" : "transparent"
            })}>Categories</NavLink>

            <NavLink to="/admin/brands" style={({isActive})=>({
            ...linkBaseStyle,
            color:isActive ? "#0f172a" : "#e2e8f0",
            background:isActive ? "#e2e8f0" : "transparent"
            })}>Brands</NavLink>

            <NavLink to="/admin/products" style={({isActive})=>({
            ...linkBaseStyle,
            color:isActive ? "#0f172a" : "#e2e8f0",
            background:isActive ? "#e2e8f0" : "transparent"
            })}>Products</NavLink>

            <NavLink to="/admin/orders" style={({isActive})=>({
            ...linkBaseStyle,
            color:isActive ? "#0f172a" : "#e2e8f0",
            background:isActive ? "#e2e8f0" : "transparent"
            })}>Orders</NavLink>

            <NavLink to="/admin/users" style={({isActive})=>({
            ...linkBaseStyle,
            color:isActive ? "#0f172a" : "#e2e8f0",
            background:isActive ? "#e2e8f0" : "transparent"
            })}>Users</NavLink>

            <NavLink to="/admin/reviews" style={({isActive})=>({
            ...linkBaseStyle,
            color:isActive ? "#0f172a" : "#e2e8f0",
            background:isActive ? "#e2e8f0" : "transparent"
            })}>Reviews</NavLink>

        </nav>

    </div>

    )

}
