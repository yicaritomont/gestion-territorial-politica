import StatusSelect from '@/components/StatusSelect';
import CreateCommitment from '@/components/forms/CreateCommitment';
import EditCommitmentButton from '@/components/EditCommitmentButton';
import DeleteAdminRecordButton from '@/components/DeleteAdminRecordButton';
import {currentRole} from '@/lib/current-role';
import {db,configured} from '@/lib/supabase';

export const dynamic='force-dynamic';

export default async function C(){
  if(!configured())return <p>Configura Supabase.</p>;

  const s=db();
  const role=await currentRole();
  const canEdit=role==='superuser';
  const canManageStatus=role==='admin'||role==='superuser';
  const [{data:commitments,error:commitmentsError},{data:leaders,error:leadersError},{data:allLeaders,error:allLeadersError},{data:meetings,error:meetingsError}]=await Promise.all([
    s.from('commitments').select('*,people(first_name,last_name),meetings(name)').order('created_at',{ascending:false}),
    s.from('people').select('id,first_name,last_name').eq('validated_leader',true).order('first_name'),
    s.from('people').select('id,first_name,last_name').order('first_name'),
    s.from('meetings').select('id,name').order('meeting_date',{ascending:false})
  ]);
  if(commitmentsError)throw commitmentsError;
  if(leadersError)throw leadersError;
  if(allLeadersError)throw allLeadersError;
  if(meetingsError)throw meetingsError;

  return <>
    <div className="top">
      <div>
        <h1>Compromisos</h1>
        <p>Seguimiento persistente asociado a líderes.</p>
        {!canEdit&&<p className="muted">La opción Eliminar solo aparece para cuentas con rol superuser.</p>}
      </div>
      <CreateCommitment
        leaders={(leaders||[]).map(leader=>({id:leader.id,name:`${leader.first_name} ${leader.last_name}`}))}
        meetings={meetings||[]}
      />
    </div>
    <div className="card tableWrap">
      <table className="table">
        <thead><tr><th>Líder</th><th>Compromiso</th><th>Reunión</th><th>Estado</th>{canEdit&&<th>Acción</th>}</tr></thead>
        <tbody>
          {(commitments||[]).map((c:any)=><tr key={c.id}>
            <td>{c.people?`${c.people.first_name} ${c.people.last_name}`:'—'}</td>
            <td>{c.description}</td>
            <td>{c.meetings?.name||'—'}</td>
            <td>{canManageStatus?<StatusSelect type="commitment" id={c.id} value={c.status} options={["ABIERTO","EN_PROCESO","ATENDIDO","CANCELADO"]}/>:c.status}</td>
            {canEdit&&<td>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <EditCommitmentButton
                  commitment={c}
                  leaders={(allLeaders||[]).map((leader:any)=>({id:leader.id,name:`${leader.first_name} ${leader.last_name}`}))}
                  meetings={meetings||[]}
                />
                <DeleteAdminRecordButton type="commitment" recordId={c.id} label={c.description}/>
              </div>
            </td>}
          </tr>)}
          {!commitments?.length&&<tr><td colSpan={canEdit?5:4}>Todavía no hay compromisos registrados.</td></tr>}
        </tbody>
      </table>
    </div>
  </>;
}
