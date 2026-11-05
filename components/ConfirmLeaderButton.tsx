'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

export default function ConfirmLeaderButton({personId}:{personId:string}){
  const router=useRouter();
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function confirm(){
    setLoading(true);
    setError('');
    try{
      const response=await fetch('/api/admin/status',{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({type:'person',id:personId,patch:{validated_leader:true}})
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo confirmar el liderazgo.');
      router.refresh();
    }catch(e){
      setError(e instanceof Error?e.message:'No se pudo confirmar el liderazgo.');
    }finally{
      setLoading(false);
    }
  }

  return <div>
    <button className="btn alt" type="button" onClick={confirm} disabled={loading}>
      {loading?'Confirmando...':'Confirmar líder'}
    </button>
    {error&&<p role="alert">{error}</p>}
  </div>;
}
