import {NextResponse} from 'next/server';import {db} from '@/lib/supabase';
const tables:any={prospect:'prospects',commitment:'commitments',meeting:'meetings',person:'people'};
export async function PUT(req:Request){try{const b=await req.json();const table=tables[b.type];if(!table)throw Error('Tipo inválido');const patch=b.patch||{};const {error}=await db().from(table).update(patch).eq('id',b.id);if(error)throw error;return NextResponse.json({ok:true})}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
