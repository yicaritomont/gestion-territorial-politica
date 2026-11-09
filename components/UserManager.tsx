'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type UserProfile={user_id:string;email:string;role:string;active:boolean;created_at:string};

export default function UserManager({users}:{users:UserProfile[]}){
  const router=useRouter();
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  const [success,setSuccess]=useState('');

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    const formElement=event.currentTarget;
    const form=new FormData(formElement);
    try{
      const response=await fetch('/api/admin/users',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(Object.fromEntries(form.entries()))
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'No se pudo crear el usuario.');
      formElement.reset();
      setSuccess(`Usuario ${result.email} creado como ${result.role==='admin'?'administrador':'facilitador'}.`);
      router.refresh();
    }catch(error){
      setError(error instanceof Error?error.message:'No se pudo crear el usuario.');
    }finally{
      setSaving(false);
    }
  }

  return <>
    <section className="card">
      <h2>Crear usuario</h2>
      <p className="muted">Las cuentas se crean activas y pueden iniciar sesión de inmediato.</p>
      <form className="form" onSubmit={submit}>
        <label>Correo electrónico<input name="email" type="email" autoComplete="email" required/></label>
        <label>Contraseña inicial<input name="password" type="password" autoComplete="new-password" minLength={10} required/></label>
        <label>Rol
          <select name="role" defaultValue="facilitator">
            <option value="facilitator">Facilitador</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        {error&&<p className="full" role="alert">{error}</p>}
        {success&&<p className="full" role="status">{success}</p>}
        <button className="btn" type="submit" disabled={saving}>{saving?'Creando...':'Crear usuario'}</button>
      </form>
    </section>
    <section className="card mt tableWrap">
      <h2>Usuarios del panel</h2>
      <table className="table">
        <thead><tr><th>Correo</th><th>Rol</th><th>Estado</th><th>Creación</th></tr></thead>
        <tbody>
          {users.map(user=><tr key={user.user_id}>
            <td>{user.email||'Correo no disponible'}</td>
            <td>{user.role==='superuser'?'Superusuario':user.role==='admin'?'Administrador':'Facilitador'}</td>
            <td>{user.active?'Activo':'Desactivado'}</td>
            <td>{new Date(user.created_at).toLocaleDateString('es-CO')}</td>
          </tr>)}
          {!users.length&&<tr><td colSpan={4}>No hay usuarios registrados.</td></tr>}
        </tbody>
      </table>
    </section>
  </>;
}
