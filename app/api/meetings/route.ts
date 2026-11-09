import {NextResponse} from 'next/server';
import {db} from '@/lib/supabase';

export async function POST(request:Request){
  try{
    const body=await request.json();
    const {data,error}=await db().from('meetings').insert({
      name:body.name,
      meeting_date:body.date,
      meeting_time:body.time||null,
      commune_id:body.commune_id||null,
      neighborhood:body.neighborhood||null,
      place:body.place||null,
      status:body.status||'ABIERTA',
      allow_qr:body.allow_qr!==false
    }).select().single();
    if(error)throw error;
    return NextResponse.json(data);
  }catch(error){
    const message=error instanceof Error?error.message:'No se pudo crear la reunión.';
    return NextResponse.json({error:message},{status:500});
  }
}

export async function PUT(request:Request){
  try{
    const body=await request.json();
    if(typeof body.id!=='string'||!body.id)return NextResponse.json({error:'Reunión inválida.'},{status:400});
    const patch=body.patch||{};
    const name=typeof patch.name==='string'?patch.name.trim():'';
    const meetingDate=typeof patch.meeting_date==='string'?patch.meeting_date:'';
    if(!name||!meetingDate)return NextResponse.json({error:'El nombre y la fecha son obligatorios.'},{status:400});

    const update={
      name,
      meeting_date:meetingDate,
      meeting_time:typeof patch.meeting_time==='string'&&patch.meeting_time?patch.meeting_time:null,
      commune_id:typeof patch.commune_id==='string'&&patch.commune_id?patch.commune_id:null,
      place:typeof patch.place==='string'&&patch.place.trim()?patch.place.trim():null,
      neighborhood:typeof patch.neighborhood==='string'&&patch.neighborhood.trim()?patch.neighborhood.trim():null,
      notes:typeof patch.notes==='string'&&patch.notes.trim()?patch.notes.trim():null
    };
    const {data,error}=await db().from('meetings').update(update).eq('id',body.id).select('id').maybeSingle();
    if(error)throw error;
    if(!data)return NextResponse.json({error:'No se encontró la reunión.'},{status:404});
    return NextResponse.json({ok:true});
  }catch(error){
    const message=error instanceof Error?error.message:'No se pudo actualizar la reunión.';
    return NextResponse.json({error:message},{status:400});
  }
}
