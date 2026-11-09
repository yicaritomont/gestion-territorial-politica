import {NextResponse} from 'next/server';
import {db} from '@/lib/supabase';

export async function POST(request:Request){
  try{
    const body=await request.json();
    const supabase=db();
    const {data:meeting,error:meetingError}=await supabase
      .from('meetings')
      .select('id,status,allow_qr')
      .eq('public_token',body.token)
      .single();

    if(meetingError||!meeting)return NextResponse.json({error:'Reunión no encontrada'},{status:404});
    if(meeting.status!=='ABIERTA'||!meeting.allow_qr){
      return NextResponse.json({error:'El registro de esta reunión está cerrado'},{status:409});
    }

    const declaredLeader=body.self_declared_leader===true;
    const {data:person,error:personError}=await supabase
      .from('people')
      .select('id')
      .eq('document_number',body.document_number)
      .maybeSingle();
    if(personError)throw personError;

    let personId=person?.id;
    if(!personId){
      const {data:newPerson,error:insertError}=await supabase
        .from('people')
        .insert({
          document_type:body.document_type||'CC',
          document_number:body.document_number,
          first_name:body.first_name,
          last_name:body.last_name,
          phone:body.phone,
          email:body.email||null,
          address:body.address||null,
          residence_commune_id:body.commune_id||null,
          residence_neighborhood:body.neighborhood||null,
          self_declared_leader:declaredLeader,
          validated_leader:declaredLeader,
          privacy_accepted_at:new Date().toISOString()
        })
        .select('id')
        .single();
      if(insertError)throw insertError;
      personId=newPerson.id;
    }else{
      const personUpdate:{
        phone:unknown;
        email:unknown;
        updated_at:string;
        self_declared_leader?:boolean;
        validated_leader?:boolean;
      }={
        phone:body.phone,
        email:body.email||null,
        updated_at:new Date().toISOString()
      };
      if(declaredLeader){
        personUpdate.self_declared_leader=true;
        personUpdate.validated_leader=true;
      }
      const {error:updateError}=await supabase.from('people').update(personUpdate).eq('id',personId);
      if(updateError)throw updateError;
    }

    const {error:attendanceError}=await supabase
      .from('attendances')
      .insert({meeting_id:meeting.id,person_id:personId,source:'QR'});
    if(attendanceError?.code==='23505')return NextResponse.json({ok:true,duplicate:true});
    if(attendanceError)throw attendanceError;
    return NextResponse.json({ok:true,duplicate:false});
  }catch(error){
    const message=error instanceof Error?error.message:'No se pudo registrar la asistencia.';
    return NextResponse.json({error:message},{status:500});
  }
}
