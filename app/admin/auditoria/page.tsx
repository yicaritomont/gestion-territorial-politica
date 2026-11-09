import {db,configured} from '@/lib/supabase';

export const dynamic='force-dynamic';

export default async function DeleteAuditPage(){
  if(!configured())return <p>Configura Supabase para consultar el registro.</p>;

  const {data:entries,error}=await db()
    .from('admin_delete_audit')
    .select('id,table_name,record_id,record_data,actor_user_id,actor_email,deleted_at')
    .order('deleted_at',{ascending:false})
    .limit(100);
  if(error)throw error;

  return <>
    <div className="top">
      <div><h1>Registro de borrados</h1><p>Últimas 100 eliminaciones, con el usuario y una copia de los datos borrados.</p></div>
    </div>
    <div className="card tableWrap">
      <table className="table">
        <thead><tr><th>Fecha</th><th>Usuario</th><th>Tipo</th><th>Datos eliminados</th></tr></thead>
        <tbody>
          {(entries||[]).map(entry=><tr key={entry.id}>
            <td>{new Date(entry.deleted_at).toLocaleString('es-CO',{timeZone:'America/Bogota'})}</td>
            <td>{entry.actor_email}<br/><small>{entry.actor_user_id||'Cuenta eliminada'}</small></td>
            <td>{entry.table_name}<br/><small>{entry.record_id}</small></td>
            <td><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxWidth:560,margin:0}}>{JSON.stringify(entry.record_data,null,2)}</pre></td>
          </tr>)}
          {!entries?.length&&<tr><td colSpan={4}>Todavía no hay eliminaciones registradas.</td></tr>}
        </tbody>
      </table>
    </div>
  </>;
}
