import LogoutButton from './LogoutButton';
import Link from 'next/link';
import {currentRole,currentUserName} from '@/lib/current-role';

export default async function AdminShell({children}:{children:React.ReactNode}){
 const role=await currentRole();
 const userName=await currentUserName();
 const roleLabel=role==='superuser'?'Superadministrador':role==='admin'?'Administrador':role==='facilitator'?'Facilitador':'';
 const items:[string,string][]=[['/admin','Dashboard'],['/admin/personas','Personas'],['/admin/lideres','Líderes'],['/admin/reuniones','Reuniones'],['/admin/compromisos','Compromisos'],['/admin/aspirantes','Aspirantes'],['/admin/contenido-publico','Contenido público'],['/admin/configuracion','Configuración']];
 if(role==='superuser')items.push(['/admin/usuarios','Usuarios'],['/admin/auditoria','Registro de borrados']);
 items.push(['/','← Sitio público']);
 return <div className="layout"><aside className="side"><h2>Territorio</h2>{items.map(x=><Link key={x[0]} href={x[0]}>{x[1]}</Link>)}<LogoutButton /><div style={{marginTop:8,padding:'12px',borderTop:'1px solid #ffffff30',fontSize:14}}><strong style={{display:'block',overflowWrap:'anywhere'}}>{userName}</strong><span style={{opacity:.75}}>{roleLabel}</span></div></aside><main className="main">{children}</main></div>
}
