import LogoutButton from './LogoutButton';
import Link from 'next/link';
export default function AdminShell({children}:{children:React.ReactNode}){
 const items=[['/admin','Dashboard'],['/admin/personas','Personas'],['/admin/reuniones','Reuniones'],['/admin/compromisos','Compromisos'],['/admin/aspirantes','Aspirantes'],['/admin/contenido-publico','Contenido público'],['/admin/configuracion','Configuración'],['/','← Sitio público']];
 return <div className="layout"><aside className="side"><h2>Territorio</h2>{items.map(x=><Link key={x[0]} href={x[0]}>{x[1]}</Link>)}<LogoutButton /></aside><main className="main">{children}</main></div>
}
