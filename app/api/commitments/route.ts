import {NextResponse} from 'next/server';
import {db} from '@/lib/supabase';

export async function POST(request:Request){
  try{
    const body=await request.json();
    const leaderId=typeof body.leader_id==='string'?body.leader_id.trim():'';
    const description=typeof body.description==='string'?body.description.trim():'';
    const meetingId=typeof body.meeting_id==='string'?body.meeting_id.trim():'';
    const dueDate=typeof body.due_date==='string'?body.due_date.trim():'';
    if(!leaderId)return NextResponse.json({error:'Selecciona el líder responsable.'},{status:400});
    if(!description)return NextResponse.json({error:'Escribe la descripción del compromiso.'},{status:400});

    const supabase=db();
    const {data:leader,error:leaderError}=await supabase.from('people')
      .select('id')
      .eq('id',leaderId)
      .eq('validated_leader',true)
      .maybeSingle();
    if(leaderError)throw leaderError;
    if(!leader)return NextResponse.json({error:'El líder seleccionado no está confirmado.'},{status:400});

    const {data,error}=await supabase.from('commitments').insert({
      leader_id:leaderId,
      meeting_id:meetingId||null,
      description,
      status:'ABIERTO',
      due_date:dueDate||null
    }).select().single();
    if(error)throw error;
    return NextResponse.json(data,{status:201});
  }catch(error){
    const message=error instanceof Error?error.message:'No se pudo crear el compromiso.';
    return NextResponse.json({error:message},{status:500});
  }
}

export async function PUT(request:Request){
  try{
    const body=await request.json();
    if(typeof body.id!=='string'||!body.id)return NextResponse.json({error:'Compromiso inválido.'},{status:400});
    const leaderId=typeof body.leader_id==='string'?body.leader_id.trim():'';
    const description=typeof body.description==='string'?body.description.trim():'';
    const status=body.status;
    if(!leaderId||!description)return NextResponse.json({error:'El líder y la descripción son obligatorios.'},{status:400});
    if(!['ABIERTO','EN_PROCESO','ATENDIDO','CANCELADO'].includes(status)){
      return NextResponse.json({error:'El estado seleccionado no es válido.'},{status:400});
    }

    const supabase=db();
    const {data:leader,error:leaderError}=await supabase.from('people').select('id').eq('id',leaderId).maybeSingle();
    if(leaderError)throw leaderError;
    if(!leader)return NextResponse.json({error:'El líder seleccionado no existe.'},{status:400});

    const meetingId=typeof body.meeting_id==='string'?body.meeting_id.trim():'';
    const {data,error}=await supabase.from('commitments').update({
      leader_id:leaderId,
      description,
      status,
      meeting_id:meetingId||null,
      due_date:typeof body.due_date==='string'&&body.due_date?body.due_date:null,
      notes:typeof body.notes==='string'&&body.notes.trim()?body.notes.trim():null,
      updated_at:new Date().toISOString()
    }).eq('id',body.id).select('id').maybeSingle();
    if(error)throw error;
    if(!data)return NextResponse.json({error:'No se encontró el compromiso.'},{status:404});
    return NextResponse.json({ok:true});
  }catch(error){
    const message=error instanceof Error?error.message:'No se pudo actualizar el compromiso.';
    return NextResponse.json({error:message},{status:400});
  }
}
