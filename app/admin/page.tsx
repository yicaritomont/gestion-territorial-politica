import {db,configured} from '@/lib/supabase';
import AdminMeetingCalendar from '@/components/AdminMeetingCalendar';

export const dynamic='force-dynamic';

function dateInBogota(){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'America/Bogota',
    year:'numeric',
    month:'2-digit',
    day:'2-digit'
  }).formatToParts(new Date());
  const value=(type:Intl.DateTimeFormatPartTypes)=>parts.find(part=>part.type===type)?.value||'';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export default async function Dashboard(){
  if(!configured())return <div className="card"><h1>Dashboard</h1><p>La interfaz está lista. Configura Supabase para mostrar métricas reales.</p></div>;

  const supabase=db();
  const [people,leaders,attendances,commitments,meetingCount,meetings,communes]=await Promise.all([
    supabase.from('people').select('*',{count:'exact',head:true}),
    supabase.from('people').select('*',{count:'exact',head:true}).eq('validated_leader',true),
    supabase.from('attendances').select('*',{count:'exact',head:true}),
    supabase.from('commitments').select('*',{count:'exact',head:true}).eq('status','ABIERTO'),
    supabase.from('meetings').select('*',{count:'exact',head:true}),
    supabase.from('meetings').select('id,name,meeting_date,meeting_time,status,public_token,place,communes(name)').order('meeting_date'),
    supabase.from('communes').select('id,name').eq('active',true).order('name')
  ]);
  if(people.error)throw people.error;
  if(leaders.error)throw leaders.error;
  if(attendances.error)throw attendances.error;
  if(commitments.error)throw commitments.error;
  if(meetingCount.error)throw meetingCount.error;
  if(meetings.error)throw meetings.error;
  if(communes.error)throw communes.error;

  return <>
    <div className="top">
      <div><h1>Dashboard</h1><p>Resumen territorial y agenda de reuniones.</p></div>
    </div>
    <div className="grid3">
      <div className="metric"><strong>{people.count||0}</strong>Personas únicas</div>
      <div className="metric"><strong>{leaders.count||0}</strong>Líderes validados</div>
      <div className="metric"><strong>{commitments.count||0}</strong>Compromisos abiertos</div>
      <div className="metric"><strong>{attendances.count||0}</strong>Asistencias</div>
      <div className="metric"><strong>{meetingCount.count||0}</strong>Reuniones</div>
    </div>
    <AdminMeetingCalendar meetings={meetings.data||[]} communes={communes.data||[]} todayDate={dateInBogota()}/>
  </>;
}
