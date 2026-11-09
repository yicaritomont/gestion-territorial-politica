import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const accessName='gt_access';
const refreshName='gt_refresh';
export async function middleware(req:NextRequest){
 const path=req.nextUrl.pathname;
 if(path==='/admin/login'||path.startsWith('/api/auth/'))return NextResponse.next();
 const isAdminPage=path==='/admin'||path.startsWith('/admin/');
 const isProtectedApi=path.startsWith('/api/admin/')||path.startsWith('/api/people')||path.startsWith('/api/commitments')||path==='/api/meetings';
 if(!isAdminPage&&!isProtectedApi)return NextResponse.next();
 if(isProtectedApi&&!['GET','HEAD','OPTIONS'].includes(req.method)){const origin=req.headers.get('origin');if(origin&&origin!==req.nextUrl.origin)return NextResponse.json({error:'Origen no autorizado'},{status:403});}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!secret)return NextResponse.json({error:'Servidor sin configurar'},{status:503});
 const s=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 let token=req.cookies.get(accessName)?.value;
 let user=token?(await s.auth.getUser(token)).data.user:null;
 let rotated:{access_token:string;refresh_token:string;expires_in:number}|null=null;
 if(!user){const refresh=req.cookies.get(refreshName)?.value;
  if(refresh){const {data,error}=await s.auth.refreshSession({refresh_token:refresh});if(!error&&data.session&&data.user){user=data.user;token=data.session.access_token;rotated=data.session;}}
 }
 if(!user){if(isAdminPage)return NextResponse.redirect(new URL('/admin/login',req.url));return NextResponse.json({error:'Inicia sesión'},{status:401});}
 const {data:profile,error}=await s.from('app_users').select('role,active').eq('user_id',user.id).maybeSingle();
 if(error||!profile?.active){return NextResponse.json({error:'Usuario sin acceso habilitado'},{status:403});}
 const role=profile.role;
 const isPrivileged=role==='admin'||role==='superuser';
 const adminOnly=isProtectedApi&&(path.startsWith('/api/admin/')||path.startsWith('/api/people/')||req.method==='PUT'||req.method==='DELETE');
 const adminOnlyAttendance=/^\/admin\/reuniones\/[^/]+\/asistencia$/.test(path);
 const usersOnly=path==='/admin/usuarios'||path.startsWith('/api/admin/users');
 const auditOnly=path==='/admin/auditoria'||path.startsWith('/api/admin/audit');
 const superuserOnly=(path==='/api/meetings'&&req.method==='PUT')
  ||(path==='/api/commitments'&&req.method==='PUT')
  ||(/^\/api\/people\/[^/]+$/.test(path)&&req.method==='PUT')
  ||auditOnly;
 const adminPageRestricted=isAdminPage&&!isPrivileged&&(adminOnlyAttendance||!(path==='/admin'||path.startsWith('/admin/reuniones')||path.startsWith('/admin/compromisos')));
 const deleteOnly=isProtectedApi&&req.method==='DELETE';
 if((adminOnly&&!isPrivileged)||(adminPageRestricted)||((usersOnly||superuserOnly||deleteOnly)&&role!=='superuser')){return NextResponse.json({error:'Acceso exclusivo de superusuario'},{status:403});}
 const forwardedHeaders=new Headers(req.headers);
 forwardedHeaders.set('x-app-role',role);
 forwardedHeaders.set('x-app-user-id',user.id);
 forwardedHeaders.set('x-app-user-email',user.email||'');
 const metadataName=user.user_metadata?.full_name||user.user_metadata?.name;
 forwardedHeaders.set('x-app-user-name',typeof metadataName==='string'&&metadataName.trim()?metadataName.trim():user.email||'Usuario');
 const res=NextResponse.next({request:{headers:forwardedHeaders}});
 if(rotated){res.cookies.set(accessName,rotated.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:rotated.expires_in});res.cookies.set(refreshName,rotated.refresh_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30});}
 return res;
}
export const config={matcher:['/admin/:path*','/api/admin/:path*','/api/people/:path*','/api/commitments/:path*','/api/meetings']};
