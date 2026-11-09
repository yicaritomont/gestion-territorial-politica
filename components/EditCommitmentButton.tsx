'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type Option={id:string;name:string};
type Commitment={
  id:string;
  leader_id:string;
  description:string;
  meeting_id:string|null;
  due_date:string|null;
  notes:string|null;
  status:string;
};

export default function EditCommitmentButton({commitment,leaders,meetings}:{commitment:Commitment;leaders:Option[];meetings:Option[]}){
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
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id:commitment.id,...Object.fromEntries(form.entries())})
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo actualizar el compromiso.');
      setOpen(false);
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:'No se pudo actualizar el compromiso.');
    }finally{
      setSaving(false);
    }
  }

  return <>
    <button className="btn alt" type="button" onClick={()=>{setError('');setOpen(true)}}>Editar</button>
    {open&&<div className="modal" onClick={()=>setOpen(false)}>
      <div className="modalBox" onClick={event=>event.stopPropagation()}>
        <div className="sectionHead"><h2>Editar compromiso</h2><button className="mini" type="button" onClick={()=>setOpen(false)}>Cerrar</button></div>
        <form className="form" onSubmit={submit}>
          <label className="full">Líder responsable<select name="leader_id" defaultValue={commitment.leader_id} required>{leaders.map(leader=><option key={leader.id} value={leader.id}>{leader.name}</option>)}</select></label>
          <label className="full">Descripción<textarea name="description" rows={3} maxLength={2000} required defaultValue={commitment.description}/></label>
          <label className="full">Reunión<select name="meeting_id" defaultValue={commitment.meeting_id||''}><option value="">Sin reunión asociada</option>{meetings.map(meeting=><option key={meeting.id} value={meeting.id}>{meeting.name}</option>)}</select></label>
          <label>Fecha límite<input name="due_date" type="date" defaultValue={commitment.due_date||''}/></label>
          <label>Estado<select name="status" defaultValue={commitment.status}><option value="ABIERTO">ABIERTO</option><option value="EN_PROCESO">EN_PROCESO</option><option value="ATENDIDO">ATENDIDO</option><option value="CANCELADO">CANCELADO</option></select></label>
          <label className="full">Notas<textarea name="notes" rows={3} maxLength={2000} defaultValue={commitment.notes||''}/></label>
          {error&&<p className="full" role="alert">{error}</p>}
          <button className="btn" type="submit" disabled={saving}>{saving?'Guardando...':'Guardar cambios'}</button>
        </form>
      </div>
    </div>}
  </>;
}
