import {NextResponse} from 'next/server';import {db} from '@/lib/supabase';
const allowed:Record<string,string>={featured:'featured_content',section:'profile_sections',office:'offices',commune:'communes'};
export async function POST(req:Request){try{const b=await req.json();const table=allowed[b.type];if(!table)throw Error('Tipo inválido');const {type,...row}=b;const {data,error}=await db().from(table).insert(row).select().single();if(error)throw error;return NextResponse.json(data)}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
export async function PUT(req:Request){try{const b=await req.json();const table=allowed[b.type];if(!table)throw Error('Tipo inválido');const {type,id,...row}=b;const {data,error}=await db().from(table).update(row).eq('id',id).select().single();if(error)throw error;return NextResponse.json(data)}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
export async function DELETE(req:Request){
 try{
  const b=await req.json();
  const table=allowed[b.type];
  if(!table)throw Error('Tipo inválido');
  if(typeof b.id!=='string')throw Error('Identificador inválido');
  const actorUserId=req.headers.get('x-app-user-id');
  const actorEmail=req.headers.get('x-app-user-email');
  if(!actorUserId||!actorEmail)throw Error('No se pudo identificar al usuario que realiza la eliminación.');
  const {error}=await db().rpc('delete_admin_content',{
   p_table:table,
   p_id:b.id,
   p_actor_user_id:actorUserId,
   p_actor_email:actorEmail
  });
  if(error)throw error;
  return NextResponse.json({ok:true});
 }catch(e:any){
  return NextResponse.json({error:e.message},{status:400});
 }
}
