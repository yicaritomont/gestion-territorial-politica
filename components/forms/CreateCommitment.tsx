'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type Option={id:string;name:string};

export default function CreateCommitment({leaders,meetings}:{leaders:Option[];meetings:Option[]}){
  const router=useRouter();
  const [open,setOpen]=useState(false);
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError('');
    setSaving(true);
    const form=new FormData(event.currentTarget);
    try{
      const response=await fetch('/api/commitments',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(Object.fromEntries(form.entries()))
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo crear el compromiso.');
      setOpen(false);
      router.refresh();
    }catch(e){
      setError(e instanceof Error?e.message:'No se pudo crear el compromiso.');
    }finally{
      setSaving(false);
    }
  }

  return <>
    <button className="btn" type="button" onClick={()=>{setError('');setOpen(true)}}>+ Agregar compromiso</button>
    {open&&<div className="modal" onClick={()=>setOpen(false)}>
      <div className="modalBox" onClick={event=>event.stopPropagation()}>
        <div className="sectionHead">
          <h2>Nuevo compromiso</h2>
          <button className="mini" type="button" onClick={()=>setOpen(false)}>Cerrar</button>
        </div>
        <form className="form" onSubmit={submit}>
          <label className="full">Líder responsable
            <select name="leader_id" required defaultValue="">
              <option value="" disabled>Seleccione un líder</option>
              {leaders.map(leader=><option key={leader.id} value={leader.id}>{leader.name}</option>)}
            </select>
          </label>
          <label className="full">Compromiso
            <textarea name="description" rows={3} required maxLength={2000}/>
          </label>
          <label className="full">Reunión (opcional)
            <select name="meeting_id" defaultValue="">
              <option value="">Sin reunión asociada</option>
              {meetings.map(meeting=><option key={meeting.id} value={meeting.id}>{meeting.name}</option>)}
            </select>
          </label>
          <label>Fecha límite (opcional)<input name="due_date" type="date"/></label>
          {error&&<p className="full" role="alert">{error}</p>}
          <button className="btn" type="submit" disabled={saving||leaders.length===0}>
            {saving?'Guardando...':'Crear compromiso'}
          </button>
          {!leaders.length&&<p className="full">No hay líderes confirmados para asignar un compromiso.</p>}
        </form>
      </div>
    </div>}
  </>;
}
