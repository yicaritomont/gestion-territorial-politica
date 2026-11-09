import {NextResponse} from 'next/server';
import {db} from '@/lib/supabase';

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const {id}=await params;
    const body=await request.json();
    const documentNumber=typeof body.document_number==='string'?body.document_number.trim():'';
    const firstName=typeof body.first_name==='string'?body.first_name.trim():'';
    const lastName=typeof body.last_name==='string'?body.last_name.trim():'';
    const phone=typeof body.phone==='string'?body.phone.trim():'';
    if(!documentNumber||!firstName||!lastName||!phone){
      return NextResponse.json({error:'Documento, nombre, apellido y teléfono son obligatorios.'},{status:400});
    }
    const {data,error}=await db().from('people').update({
      document_type:typeof body.document_type==='string'?body.document_type:null,
      document_number:documentNumber,
      first_name:firstName,
      last_name:lastName,
      phone,
      email:typeof body.email==='string'&&body.email.trim()?body.email.trim():null,
      address:typeof body.address==='string'&&body.address.trim()?body.address.trim():null,
      residence_commune_id:typeof body.residence_commune_id==='string'&&body.residence_commune_id?body.residence_commune_id:null,
      residence_neighborhood:typeof body.residence_neighborhood==='string'&&body.residence_neighborhood.trim()?body.residence_neighborhood.trim():null,
      updated_at:new Date().toISOString()
    }).eq('id',id).select('id').maybeSingle();
    if(error)throw error;
    if(!data)return NextResponse.json({error:'No se encontró la persona.'},{status:404});
    return NextResponse.json({ok:true});
  }catch(error){
    const message=error instanceof Error?error.message:'No se pudo actualizar la persona.';
    return NextResponse.json({error:message},{status:400});
  }
}
