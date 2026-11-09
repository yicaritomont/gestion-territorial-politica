import Link from 'next/link';
import {cookies} from 'next/headers';
import {db,configured} from '@/lib/supabase';
import MeetingRegistration from '@/components/forms/MeetingRegistration';

export const dynamic='force-dynamic';

async function getAdminBackHref(meetingToken:string){
  if(!configured())return '/';

  const cookieStore=await cookies();
  const accessToken=cookieStore.get('gt_access')?.value;
  const refreshToken=cookieStore.get('gt_refresh')?.value;
  const supabase=db();

  let user=accessToken?(await supabase.auth.getUser(accessToken)).data.user:null;
  if(!user&&refreshToken){
    const {data,error}=await supabase.auth.refreshSession({refresh_token:refreshToken});
    if(!error)user=data.user;
  }
  if(!user)return '/';

  const {data:profile,error}=await supabase.from('app_users')
    .select('role,active')
    .eq('user_id',user.id)
    .maybeSingle();
  if(error)throw error;

  return profile?.active&&(profile.role==='admin'||profile.role==='superuser')
    ?`/admin/reuniones/${meetingToken}`
    :'/';
}

export default async function PublicMeeting({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const backHref=await getAdminBackHref(id);
  const backLabel=backHref==='/'?'Volver al inicio':'Volver a la reunión';

  if(!configured())return <main style={{maxWidth:650,margin:'30px auto',padding:20}}>
    <div className="card">
      <p><Link className="btn alt" href="/">← Volver al inicio</Link></p>
      <h1>Base de datos pendiente</h1>
      <p>Configura las variables de Supabase indicadas en .env.example.</p>
    </div>
  </main>;

  const s=db();
  const [{data:m},{data:communes}]=await Promise.all([
    s.from('meetings').select('*,communes(name)').eq('public_token',id).maybeSingle(),
    s.from('communes').select('id,name').eq('active',true).order('name')
  ]);
  if(!m)return <main style={{maxWidth:650,margin:'30px auto',padding:20}}>
    <div className="card">
      <p><Link className="btn alt" href={backHref}>← {backLabel}</Link></p>
      <h1>Reunión no encontrada</h1>
    </div>
  </main>;

  return <main style={{maxWidth:650,margin:'30px auto',padding:20}}>
    <div className="card">
      <p><Link className="btn alt" href={backHref}>← {backLabel}</Link></p>
      <span className="badge">{m.status==='ABIERTA'?'REGISTRO ABIERTO':m.status}</span>
      <h1>{m.name}</h1>
      <p>{m.meeting_date} · {m.place||''}</p>
      {m.status==='ABIERTA'&&m.allow_qr
        ?<MeetingRegistration token={id} communes={communes||[]}/>
        :<p>El registro público de esta reunión no está disponible.</p>}
    </div>
  </main>;
}
