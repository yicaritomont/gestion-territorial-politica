import {NextResponse} from 'next/server';
import {db} from '@/lib/supabase';

export async function POST(request:Request){
  try{
    const body=await request.json();
    const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
    const password=typeof body.password==='string'?body.password:'';
    const role=body.role;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      return NextResponse.json({error:'Ingresa un correo válido.'},{status:400});
    }
    if(password.length<10){
      return NextResponse.json({error:'La contraseña debe tener al menos 10 caracteres.'},{status:400});
    }
    if(role!=='admin'&&role!=='facilitator'){
      return NextResponse.json({error:'Selecciona administrador o facilitador.'},{status:400});
    }

    const supabase=db();
    const {data:userData,error:createError}=await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm:true
    });
    if(createError)throw createError;
    if(!userData.user)throw new Error('Supabase no devolvió el usuario creado.');

    const {error:profileError}=await supabase.from('app_users').insert({
      user_id:userData.user.id,
      role,
      active:true
    });
    if(profileError){
      const {error:cleanupError}=await supabase.auth.admin.deleteUser(userData.user.id);
      if(cleanupError){
        throw new Error(`No se pudo asignar el rol (${profileError.message}) ni limpiar la cuenta creada (${cleanupError.message}).`);
      }
      throw profileError;
    }

    return NextResponse.json({
      user_id:userData.user.id,
      email:userData.user.email,
      role,
      active:true
    },{status:201});
  }catch(error){
    const message=error instanceof Error?error.message:'No se pudo crear el usuario.';
    return NextResponse.json({error:message},{status:400});
  }
}
