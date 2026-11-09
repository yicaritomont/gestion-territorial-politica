'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

export default function FinishMeetingButton({meetingId}:{meetingId:string}){
  const router=useRouter();
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function finish(){
    setLoading(true);
    setError('');
    try{
      const response=await fetch('/api/admin/status',{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          type:'meeting',
          id:meetingId,
          patch:{status:'FINALIZADA',allow_qr:false}
        })
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo terminar la reunión.');
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:'No se pudo terminar la reunión.');
    }finally{
      setLoading(false);
    }
  }

  return <div>
    <button className="btn alt" type="button" onClick={finish} disabled={loading}>
      {loading?'Terminando...':'Terminar reunión'}
    </button>
    {error&&<p role="alert">{error}</p>}
  </div>;
}
