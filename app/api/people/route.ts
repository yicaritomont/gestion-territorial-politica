import {NextResponse} from 'next/server';import {db} from '@/lib/supabase';
export async function POST(r:Request){try{const b=await r.json();const {data,error}=await db().from('people').insert(b).select().single();if(error)throw error;return NextResponse.json(data);}catch(e:any){return NextResponse.json({error:e.message},{status:500})}}
