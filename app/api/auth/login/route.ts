import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export async function POST(req:Request){
 try{const {email,password}=await req.json();if(typeof email!=='string'||typeof password!=='string')return NextResponse.json({error:'Datos inválidos'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL!,secret=process.env.SUPABASE_SERVICE_ROLE_KEY!;
 const client=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.signInWithPassword({email,password});
 if(error||!data.user||!data.session)return NextResponse.json({error:'Credenciales incorrectas'},{status:401});
 const {data:profile}=await client.from('app_users').select('role,active').eq('user_id',data.user.id).maybeSingle();
 if(!profile?.active||!['admin','facilitator','superuser'].includes(profile.role))return NextResponse.json({error:'Cuenta sin permiso de acceso'},{status:403});
 const res=NextResponse.json({ok:true,role:profile.role});
 const opt={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/'};
 res.cookies.set('gt_access',data.session.access_token,{...opt,maxAge:data.session.expires_in});
 res.cookies.set('gt_refresh',data.session.refresh_token,{...opt,maxAge:60*60*24*30});return res;
 }catch{return NextResponse.json({error:'No se pudo iniciar sesión'},{status:400});}
}
