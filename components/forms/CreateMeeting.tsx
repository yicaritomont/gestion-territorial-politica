'use client';

import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';

type Commune={id:string;name:string};

export default function CreateMeeting({
  communes,
  initialDate,
  open:controlledOpen,
  onOpenChange,
  showTrigger=true
}:{communes:Commune[];initialDate?:string;open?:boolean;onOpenChange?:(open:boolean)=>void;showTrigger?:boolean}){
  const [internalOpen,setInternalOpen]=useState(false);
  const [err,setErr]=useState('');
  const [saving,setSaving]=useState(false);
  const router=useRouter();
  const isControlled=controlledOpen!==undefined;
  const open=isControlled?controlledOpen:internalOpen;

  function setOpen(value:boolean){
    if(!isControlled)setInternalOpen(value);
    onOpenChange?.(value);
    if(value)setErr('');
  }

  useEffect(()=>{
    if(open)setErr('');
  },[open,initialDate]);

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    setErr('');
    setSaving(true);
    try{
      const form=new FormData(event.currentTarget);
      const response=await fetch('/api/meetings',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(Object.fromEntries(form.entries()))
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo crear la reunión.');
      setOpen(false);
      router.refresh();
    }catch(error){
      setErr(error instanceof Error?error.message:'No se pudo crear la reunión.');
    }finally{
      setSaving(false);
    }
  }

  return <>
    {showTrigger&&<button className="btn" type="button" onClick={()=>setOpen(true)}>+ Crear reunión</button>}
    {open&&<div className="modal" onClick={()=>{if(!saving)setOpen(false)}}>
      <div className="modalBox" onClick={event=>event.stopPropagation()}>
        <div className="sectionHead">
          <h2>Nueva reunión</h2>
          <button className="mini" type="button" onClick={()=>setOpen(false)} disabled={saving}>Cerrar</button>
        </div>
        <form className="form" key={initialDate||'new-meeting'} onSubmit={submit}>
          <label className="full">Nombre de reunión<input name="name" required/></label>
          <label>Fecha<input name="date" type="date" required defaultValue={initialDate}/></label>
          <label>Hora<input name="time" type="time"/></label>
          <label>Comuna<select name="commune_id"><option value="">Seleccione</option>{communes.map(commune=><option key={commune.id} value={commune.id}>{commune.name}</option>)}</select></label>
          <label>Lugar<input name="place"/></label>
          <input type="hidden" name="status" value="ABIERTA"/>
          {err&&<p className="full" role="alert">{err}</p>}
          <button className="btn" type="submit" disabled={saving}>{saving?'Creando...':'Crear y habilitar QR'}</button>
        </form>
      </div>
    </div>}
  </>;
}
