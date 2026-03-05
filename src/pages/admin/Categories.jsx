import { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function Categories(){

const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {

loadCategories();

}, []);

const loadCategories = async () => {
setLoading(true);
setError("");

try {
const res = await http.get("/admin/categories");

setCategories(Array.isArray(res.data) ? res.data : []);
} catch {
setError("Failed to load categories.");
} finally {
setLoading(false);
}
};

return(

<div style={{maxWidth:"900px",margin:"0 auto"}}>

<h2 style={{fontSize:"28px",fontWeight:900,color:"#0f172a",marginBottom:"14px"}}>Categories</h2>
{error ? <div style={{padding:"10px 12px",borderRadius:"10px",background:"#fee2e2",color:"#991b1b",marginBottom:"12px"}}>{error}</div> : null}

<div style={{background:"#fff",borderRadius:"16px",padding:"16px",boxShadow:"0 8px 24px rgba(15, 23, 42, 0.08)",border:"1px solid #e2e8f0"}}>
{loading ? (
<div style={{padding:"8px 4px",color:"#64748b",fontWeight:600}}>Loading categories...</div>
) : (
<div style={{overflowX:"auto"}}>
<table cellPadding="10" style={{width:"100%",borderCollapse:"collapse"}}>

<thead>

<tr style={{background:"#f8fafc",color:"#334155"}}>
<th style={{textAlign:"left"}}>ID</th>
<th style={{textAlign:"left"}}>Name</th>

</tr>

</thead>

<tbody>

{categories.map(cat=>(
<tr key={cat.id} style={{borderTop:"1px solid #e2e8f0"}}>
<td>{cat.id}</td>
<td>{cat.name}</td>

</tr>
))}

</tbody>

</table>
</div>
)}
</div>

</div>

)

}
