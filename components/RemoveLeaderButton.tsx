'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

export default function RemoveLeaderButton({personId}:{personId:string}){
  const router=useRouter();
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function remove(){
    setLoading(true);
    setError('');
    try{
      const response=await fetch('/api/admin/status',{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          type:'person',
          id:personId,
          patch:{self_declared_leader:false,validated_leader:false}
        })
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo actualizar el estado de líder.');
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:'No se pudo actualizar el estado de líder.');
    }finally{
      setLoading(false);
    }
  }

  return <div>
    <button className="btn alt" type="button" onClick={remove} disabled={loading}>
      {loading?'Actualizando...':'No es líder'}
    </button>
    {error&&<p role="alert">{error}</p>}
  </div>;
}
