import {NextResponse} from 'next/server';
export async function POST(){const res=NextResponse.json({ok:true});res.cookies.set('gt_access','',{path:'/',maxAge:0});res.cookies.set('gt_refresh','',{path:'/',maxAge:0});return res;}
