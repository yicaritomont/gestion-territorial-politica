import Link from 'next/link';
import {db,configured} from '@/lib/supabase';
import {currentRole} from '@/lib/current-role';
import DeleteAdminRecordButton from '@/components/DeleteAdminRecordButton';

export const dynamic='force-dynamic';

export default async function P(){
  if(!configured())return <div className="card"><h1>Personas</h1><p>Configura Supabase para activar persistencia.</p></div>;
  const canDelete=(await currentRole())==='superuser';

  const {data:people,error}=await db().from('people')
    .select('*,communes(name),attendances(count),electoral_information(voting_place,voting_table,verified,communes(name))')
    .order('created_at',{ascending:false});
  if(error)throw error;

  return <>
    <div className="top">
      <div>
        <h1>Personas</h1>
        <p>Registro maestro sin duplicar por documento.</p>
        {!canDelete&&<p className="muted">La opción Eliminar solo aparece para cuentas con rol superuser.</p>}
      </div>
    </div>
    <div className="card tableWrap">
      <table className="table">
        <thead>
          <tr><th>Nombre</th><th>Documento</th><th>Comuna residencia</th><th>Asist.</th><th>Líder</th><th>Electoral</th><th>Puesto / Mesa</th><th></th>{canDelete&&<th>Acción</th>}</tr>
        </thead>
        <tbody>
          {(people||[]).map((p:any)=>{
            const electoral=Array.isArray(p.electoral_information)
              ?p.electoral_information[0]
              :p.electoral_information;
            const votingCommune=Array.isArray(electoral?.communes)
              ?electoral.communes[0]
              :electoral?.communes;
            const location=[
              votingCommune?.name,
              electoral?.voting_place,
              electoral?.voting_table?`Mesa ${electoral.voting_table}`:null
            ].filter(Boolean).join(' · ')||'—';

            return <tr key={p.id}>
              <td><b>{p.first_name} {p.last_name}</b><br/><small>{p.phone}</small></td>
              <td>{p.document_number}</td>
              <td>{p.communes?.name||'—'}</td>
              <td>{p.attendances?.[0]?.count||0}</td>
              <td>{p.validated_leader?'Validado':p.self_declared_leader?'Declarado':'No'}</td>
              <td>
                <span className={`status ${electoral?.verified?'ok':'pending'}`}>
                  {!electoral?'Sin registrar':electoral.verified?'Verificada':'Pendiente de verificación'}
                </span>
              </td>
              <td>{location}</td>
              <td><Link className="textLink" href={`/admin/personas/${p.id}`}>Ver / editar →</Link></td>
              {canDelete&&<td><DeleteAdminRecordButton
                type="person"
                recordId={p.id}
                label={`${p.first_name} ${p.last_name} (${p.document_number})`}
              /></td>}
            </tr>;
          })}
          {!people?.length&&<tr><td colSpan={canDelete?9:8}>Todavía no hay personas registradas.</td></tr>}
        </tbody>
      </table>
    </div>
  </>;
}
