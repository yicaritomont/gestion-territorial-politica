import UserManager from '@/components/UserManager';
import {configured,db} from '@/lib/supabase';

export const dynamic='force-dynamic';

export default async function UsersPage(){
  if(!configured())return <div className="card"><h1>Usuarios</h1><p>Configura Supabase para administrar usuarios.</p></div>;

  const {data:users,error}=await db().from('app_users')
    .select('user_id,role,active,created_at')
    .order('created_at',{ascending:false});
  if(error)throw error;

  const supabase=db();
  const authUsers=await Promise.all((users||[]).map(async user=>{
    const {data,error:userError}=await supabase.auth.admin.getUserById(user.user_id);
    if(userError)throw userError;
    return {...user,email:data.user?.email||''};
  }));

  return <>
    <div className="top"><div><h1>Usuarios</h1><p>Gestiona el acceso de administradores y facilitadores.</p></div></div>
    <UserManager users={authUsers}/>
  </>;
}
