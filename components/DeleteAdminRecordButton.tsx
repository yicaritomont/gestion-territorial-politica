'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type RecordType='person'|'meeting'|'prospect'|'commitment';

const effects:Record<RecordType,string>={
  person:'También se eliminarán sus asistencias. Los compromisos asociados se conservarán sin persona responsable.',
  meeting:'También se eliminarán sus asistencias. Los compromisos asociados se conservarán sin reunión vinculada.',
  prospect:'Se eliminará únicamente este registro de aspirante.',
  commitment:'Se eliminará únicamente este compromiso.'
};

export default function DeleteAdminRecordButton({
  type,
  recordId,
  label,
  redirectTo
}:{type:RecordType;recordId:string;label:string;redirectTo?:string}){
  const router=useRouter();
  const [open,setOpen]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function remove(){
    setLoading(true);
    setError('');
    try{
      const response=await fetch('/api/admin/records',{
        method:'DELETE',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({type,id:recordId})
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo eliminar el registro.');
      setOpen(false);
      if(redirectTo)router.push(redirectTo);
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:'No se pudo eliminar el registro.');
    }finally{
      setLoading(false);
    }
  }

  return <>
    <button
      className="btn alt"
      type="button"
      style={{borderColor:'#b42318',color:'#b42318'}}
      onClick={()=>{setError('');setOpen(true)}}
    >
      Eliminar
    </button>
    {open&&<div className="modal" onClick={()=>{if(!loading)setOpen(false)}}>
      <section
        className="modalBox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-record-title"
        aria-describedby="delete-record-description"
        onClick={event=>event.stopPropagation()}
      >
        <div className="sectionHead">
          <h2 id="delete-record-title">Confirmar eliminación</h2>
          <button className="mini" type="button" onClick={()=>setOpen(false)} disabled={loading}>Cancelar</button>
        </div>
        <p id="delete-record-description">
          ¿Eliminar <b>{label}</b>? Esta acción es permanente. {effects[type]}
        </p>
        <p className="muted">La eliminación quedará registrada con tu usuario y una copia del registro en el historial de auditoría.</p>
        {error&&<p role="alert">{error}</p>}
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button
            className="btn"
            type="button"
            onClick={remove}
            disabled={loading}
            style={{background:'#b42318'}}
          >
            {loading?'Eliminando...':'Confirmar eliminación'}
          </button>
          <button className="btn alt" type="button" onClick={()=>setOpen(false)} disabled={loading}>Cancelar</button>
        </div>
      </section>
    </div>}
  </>;
}
