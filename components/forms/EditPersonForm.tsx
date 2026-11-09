'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type Commune={id:string;name:string};
type Person={
  id:string;
  document_type:string|null;
  document_number:string;
  first_name:string;
  last_name:string;
  phone:string;
  email:string|null;
  address:string|null;
  residence_commune_id:string|null;
  residence_neighborhood:string|null;
};

export default function EditPersonForm({person,communes}:{person:Person;communes:Commune[]}){
  const router=useRouter();
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError('');
    setSaving(true);
    const form=new FormData(event.currentTarget);
    try{
      const response=await fetch(`/api/people/${person.id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(Object.fromEntries(form.entries()))
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo actualizar la persona.');
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:'No se pudo actualizar la persona.');
    }finally{
      setSaving(false);
    }
  }

  return <form className="form" onSubmit={submit}>
    <label>Tipo de documento<select name="document_type" defaultValue={person.document_type||'CC'}><option>CC</option><option>CE</option><option>TI</option><option>PA</option></select></label>
    <label>Número de documento<input name="document_number" required maxLength={50} defaultValue={person.document_number}/></label>
    <label>Nombres<input name="first_name" required maxLength={150} defaultValue={person.first_name}/></label>
    <label>Apellidos<input name="last_name" required maxLength={150} defaultValue={person.last_name}/></label>
    <label>Teléfono<input name="phone" required maxLength={50} defaultValue={person.phone}/></label>
    <label>Correo<input name="email" type="email" maxLength={254} defaultValue={person.email||''}/></label>
    <label>Comuna de residencia<select name="residence_commune_id" defaultValue={person.residence_commune_id||''}><option value="">Sin comuna</option>{communes.map(commune=><option key={commune.id} value={commune.id}>{commune.name}</option>)}</select></label>
    <label>Barrio<input name="residence_neighborhood" maxLength={200} defaultValue={person.residence_neighborhood||''}/></label>
    <label className="full">Dirección<input name="address" maxLength={300} defaultValue={person.address||''}/></label>
    {error&&<p className="full" role="alert">{error}</p>}
    <button className="btn" type="submit" disabled={saving}>{saving?'Guardando...':'Guardar cambios'}</button>
  </form>;
}
