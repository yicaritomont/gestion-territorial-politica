import Link from 'next/link';
import StatusSelect from '@/components/StatusSelect';
import ElectoralForm from '@/components/forms/ElectoralForm';
import EditPersonForm from '@/components/forms/EditPersonForm';
import DeleteAdminRecordButton from '@/components/DeleteAdminRecordButton';
import {currentRole} from '@/lib/current-role';
import {db,configured} from '@/lib/supabase';

export const dynamic='force-dynamic';

export default async function Person({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!configured())return <p>Configura Supabase.</p>;

  const supabase=db();
  const [{data:person,error:personError},{data:communes,error:communesError},{data:electoral,error:electoralError},{data:attendances,error:attendanceError}]=await Promise.all([
    supabase.from('people').select('*,communes(name)').eq('id',id).maybeSingle(),
    supabase.from('communes').select('id,name').order('name'),
    supabase.from('electoral_information').select('*').eq('person_id',id).maybeSingle(),
    supabase.from('attendances').select('created_at,source,meetings(name,meeting_date,communes(name))').eq('person_id',id).order('created_at',{ascending:false})
  ]);
  if(personError)throw personError;
  if(communesError)throw communesError;
  if(electoralError)throw electoralError;
  if(attendanceError)throw attendanceError;
  if(!person)return <p>Persona no encontrada.</p>;

  const role=await currentRole();
  const canEdit=role==='superuser';

  return <>
    <div className="top">
      <div>
        <Link className="textLink" href="/admin/personas">← Personas</Link>
        <h1>{person.first_name} {person.last_name}</h1>
        <p>{person.document_type} {person.document_number} · {person.phone}</p>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <StatusSelect type="person" id={person.id} field="validated_leader" value={String(person.validated_leader)} options={["false","true"]}/>
        {canEdit&&<DeleteAdminRecordButton
          type="person"
          recordId={person.id}
          label={`${person.first_name} ${person.last_name} (${person.document_number})`}
          redirectTo="/admin/personas"
        />}
      </div>
    </div>
    <div className="detailGrid">
      <section className="card">
        <h2>Información personal</h2>
        {canEdit
          ?<EditPersonForm person={person} communes={communes||[]}/>
          :<div className="kv">
            <b>Nombre</b><span>{person.first_name} {person.last_name}</span>
            <b>Documento</b><span>{person.document_number}</span>
            <b>Teléfono</b><span>{person.phone}</span>
            <b>Comuna residencia</b><span>{person.communes?.name||'—'}</span>
            <b>Barrio residencia</b><span>{person.residence_neighborhood||'—'}</span>
          </div>}
      </section>
      <section className="card">
        <h2>Información electoral</h2>
        <p className="muted">Solo el administrador registra o actualiza estos datos.</p>
        <ElectoralForm personId={id} communes={communes||[]} electoral={electoral}/>
      </section>
    </div>
    <section className="card mt">
      <h2>Asistencias</h2>
      <table className="table">
        <thead><tr><th>Fecha</th><th>Reunión</th><th>Comuna</th><th>Origen</th></tr></thead>
        <tbody>
          {(attendances||[]).map((attendance:any,index:number)=><tr key={`${attendance.created_at}-${index}`}>
            <td>{attendance.meetings?.meeting_date}</td>
            <td>{attendance.meetings?.name}</td>
            <td>{attendance.meetings?.communes?.name||'—'}</td>
            <td>{attendance.source}</td>
          </tr>)}
          {!attendances?.length&&<tr><td colSpan={4}>No hay asistencias registradas.</td></tr>}
        </tbody>
      </table>
    </section>
  </>;
}
