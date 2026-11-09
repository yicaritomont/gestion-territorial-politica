import {headers} from 'next/headers';

export async function currentRole(){
  const requestHeaders=await headers();
  return requestHeaders.get('x-app-role')||'';
}

export async function currentUserName(){
  const requestHeaders=await headers();
  return requestHeaders.get('x-app-user-name')||'Usuario';
}
