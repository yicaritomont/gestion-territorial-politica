import {NextResponse} from 'next/server';
import {db} from '@/lib/supabase';

const allowedTypes:Record<string,string>={
  person:'people',
  meeting:'meetings',
  prospect:'prospects',
  commitment:'commitments'
};

export async function DELETE(request:Request){
  try{
    const body=await request.json();
    const table=typeof body.type==='string'?allowedTypes[body.type]:undefined;
    if(!table)return NextResponse.json({error:'Tipo de registro no permitido.'},{status:400});
    if(typeof body.id!=='string'||!body.id.trim()){
      return NextResponse.json({error:'Identificador inválido.'},{status:400});
    }

    const actorUserId=request.headers.get('x-app-user-id');
    const actorEmail=request.headers.get('x-app-user-email');
    if(!actorUserId||!actorEmail){
      return NextResponse.json({error:'No se pudo identificar al usuario que realiza la eliminación.'},{status:401});
    }

    const {error}=await db().rpc('delete_admin_record',{
      p_table:table,
      p_id:body.id,
      p_actor_user_id:actorUserId,
      p_actor_email:actorEmail
    });
    if(error)throw error;
    return NextResponse.json({ok:true});
  }catch(error){
    const message=error instanceof Error?error.message:'No se pudo eliminar el registro.';
    return NextResponse.json({error:message},{status:400});
  }
}
