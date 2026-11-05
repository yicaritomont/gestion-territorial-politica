import Link from 'next/link';
import {db,configured} from '@/lib/supabase';
import ConfirmLeaderButton from '@/components/ConfirmLeaderButton';

export const dynamic='force-dynamic';

export default async function Leaders(){
  if(!configured())return <div className="card"><h1>Líderes</h1><p>Configura Supabase para activar persistencia.</p></div>;

  const {data:leaders,error}=await db().from('people')
    .select('id,first_name,last_name,document_type,document_number,phone,self_declared_leader,validated_leader,communes(name),attendances(count)')
    .eq('self_declared_leader',true)
    .order('validated_leader',{ascending:true})
    .order('first_name');
  if(error)throw error;

  return <>
    <div className="top">
      <div>
        <h1>Líderes</h1>
        <p>Personas que se declararon líderes y el estado de su validación.</p>
      </div>
    </div>
    <div className="card tableWrap">
      <table className="table">
        <thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Comuna</th><th>Asistencias</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {(leaders||[]).map((leader:any)=>(
            <tr key={leader.id}>
              <td><Link className="textLink" href={`/admin/personas/${leader.id}`}>{leader.first_name} {leader.last_name}</Link></td>
              <td>{leader.document_type||''} {leader.document_number}</td>
              <td>{leader.phone||'—'}</td>
              <td>{leader.communes?.name||'—'}</td>
              <td>{leader.attendances?.[0]?.count||0}</td>
              <td><span className={`status ${leader.validated_leader?'ok':'pending'}`}>{leader.validated_leader?'Confirmado':'Pendiente'}</span></td>
              <td>{leader.validated_leader?'—':<ConfirmLeaderButton personId={leader.id}/>}</td>
            </tr>
          ))}
          {!leaders?.length&&<tr><td colSpan={7}>Todavía no hay personas registradas como líderes.</td></tr>}
        </tbody>
      </table>
    </div>
  </>;
}
