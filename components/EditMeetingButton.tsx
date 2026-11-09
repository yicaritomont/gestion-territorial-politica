'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type Commune={id:string;name:string};
type Meeting={id:string;name:string;meeting_date:string;meeting_time:string|null;commune_id:string|null;neighborhood:string|null;place:string|null;notes:string|null};

export default function EditMeetingButton({meeting,communes}:{meeting:Meeting;communes:Commune[]}){
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
      const response=await fetch('/api/meetings',{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id:meeting.id,patch:Object.fromEntries(form.entries())})
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo actualizar la reunión.');
      setOpen(false);
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:'No se pudo actualizar la reunión.');
    }finally{
      setSaving(false);
    }
  }

  return <>
    <button className="btn alt" type="button" onClick={()=>{setError('');setOpen(true)}}>Editar</button>
    {open&&<div className="modal" onClick={()=>setOpen(false)}>
      <div className="modalBox" onClick={event=>event.stopPropagation()}>
        <div className="sectionHead"><h2>Editar reunión</h2><button className="mini" type="button" onClick={()=>setOpen(false)}>Cerrar</button></div>
        <form className="form" onSubmit={submit}>
          <label className="full">Nombre de reunión<input name="name" required maxLength={200} defaultValue={meeting.name}/></label>
          <label>Fecha<input name="meeting_date" type="date" required defaultValue={meeting.meeting_date}/></label>
          <label>Hora<input name="meeting_time" type="time" defaultValue={meeting.meeting_time?.slice(0,5)||''}/></label>
          <label>Comuna<select name="commune_id" defaultValue={meeting.commune_id||''}><option value="">Sin comuna</option>{communes.map(commune=><option key={commune.id} value={commune.id}>{commune.name}</option>)}</select></label>
          <label>Lugar<input name="place" maxLength={300} defaultValue={meeting.place||''}/></label>
          <label>Barrio<input name="neighborhood" maxLength={200} defaultValue={meeting.neighborhood||''}/></label>
          <label className="full">Notas<textarea name="notes" rows={3} maxLength={2000} defaultValue={meeting.notes||''}/></label>
          {error&&<p className="full" role="alert">{error}</p>}
          <button className="btn" type="submit" disabled={saving}>{saving?'Guardando...':'Guardar cambios'}</button>
        </form>
      </div>
    </div>}
  </>;
}
