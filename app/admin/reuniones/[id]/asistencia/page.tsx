import Link from 'next/link';
import {db,configured} from '@/lib/supabase';
import ConfirmLeaderButton from '@/components/ConfirmLeaderButton';

export const dynamic='force-dynamic';

export default async function Attendance({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!configured())return <div className="card"><h1>Asistencia</h1><p>Configura Supabase para activar persistencia.</p></div>;

  const s=db();
  const {data:meeting,error:meetingError}=await s.from('meetings').select('id,name,meeting_date,meeting_time,public_token').eq('public_token',id).maybeSingle();
  if(meetingError)throw meetingError;
  if(!meeting)return <div className="card"><h1>Reunión no encontrada</h1><Link className="btn alt" href="/admin/reuniones">Volver a reuniones</Link></div>;

  const {data:attendances,error:attendanceError}=await s.from('attendances')
    .select('created_at,source,people(id,first_name,last_name,document_type,document_number,phone,email,self_declared_leader,validated_leader,communes(name))')
    .eq('meeting_id',meeting.id)
    .order('created_at',{ascending:false});
  if(attendanceError)throw attendanceError;

  return <div>
    <div className="top">
      <div>
        <h1>Asistencia: {meeting.name}</h1>
        <p>{meeting.meeting_date} · {meeting.meeting_time?.slice(0,5)} · {(attendances||[]).length} asistentes</p>
      </div>
      <Link className="btn alt" href={`/admin/reuniones/${meeting.public_token}`}>Volver a reunión</Link>
    </div>
    <div className="card tableWrap">
      <table className="table">
        <thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Correo</th><th>Comuna</th><th>Estado de líder</th><th>Acción</th><th>Registro</th></tr></thead>
        <tbody>
          {(attendances||[]).map((attendance:any,index:number)=>{
            const person=Array.isArray(attendance.people)?attendance.people[0]:attendance.people;
            return <tr key={`${attendance.created_at}-${index}`}>
              <td>{person?`${person.first_name} ${person.last_name}`:'Persona no disponible'}</td>
              <td>{person?`${person.document_type||''} ${person.document_number}`:'—'}</td>
              <td>{person?.phone||'—'}</td>
              <td>{person?.email||'—'}</td>
              <td>{person?.communes?.name||'—'}</td>
              <td>{!person?.self_declared_leader?'No se declaró líder':person.validated_leader?'Confirmado':'Pendiente de confirmación'}</td>
              <td>{person?.self_declared_leader&&!person.validated_leader&&person.id?<ConfirmLeaderButton personId={person.id}/>:person?.validated_leader?'Líder confirmado':'—'}</td>
              <td>{attendance.source||'—'}</td>
            </tr>;
          })}
          {!attendances?.length&&<tr><td colSpan={8}>Todavía no hay personas registradas en esta reunión.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>;
}
