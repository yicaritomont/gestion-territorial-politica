import StatusSelect from '@/components/StatusSelect';
import DeleteAdminRecordButton from '@/components/DeleteAdminRecordButton';
import {currentRole} from '@/lib/current-role';
import {db,configured} from '@/lib/supabase';

export const dynamic='force-dynamic';

export default async function A(){
  if(!configured())return <div className="card"><h1>Aspirantes</h1><p>Configura Supabase.</p></div>;
  const canDelete=(await currentRole())==='superuser';
  const {data,error}=await db().from('prospects').select('*').order('created_at',{ascending:false});
  if(error)throw error;

  return <>
    <h1>Aspirantes / Quiero ser parte</h1>
    <p>Contactos captados desde la modal pública.</p>
    {!canDelete&&<p className="muted">La opción Eliminar solo aparece para cuentas con rol superuser.</p>}
    <div className="card tableWrap">
      <table className="table">
        <thead><tr><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Comentarios</th><th>Fecha</th><th>Estado</th>{canDelete&&<th>Acción</th>}</tr></thead>
        <tbody>
          {(data||[]).map((x:any)=><tr key={x.id}>
            <td>{x.full_name}</td><td>{x.phone}</td><td>{x.email||'—'}</td><td>{x.comments||'—'}</td>
            <td>{new Date(x.created_at).toLocaleDateString('es-CO')}</td>
            <td><StatusSelect type="prospect" id={x.id} value={x.status} options={["NUEVO","CONTACTADO","CONVERTIDO","DESCARTADO"]}/></td>
            {canDelete&&<td><DeleteAdminRecordButton type="prospect" recordId={x.id} label={x.full_name}/></td>}
          </tr>)}
          {!data?.length&&<tr><td colSpan={canDelete?7:6}>Todavía no hay aspirantes registrados.</td></tr>}
        </tbody>
      </table>
    </div>
  </>;
}
