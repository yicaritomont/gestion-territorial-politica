import Link from "next/link";
import { db, configured } from "@/lib/supabase";
import CreateMeeting from "@/components/forms/CreateMeeting";
import FinishMeetingButton from "@/components/FinishMeetingButton";
import EditMeetingButton from "@/components/EditMeetingButton";
import DeleteAdminRecordButton from "@/components/DeleteAdminRecordButton";
import {currentRole} from "@/lib/current-role";
export const dynamic = "force-dynamic";
export default async function R() {
  const role=await currentRole();
  const canEdit=role==="superuser";
  const canManageStatus=role==="admin"||role==="superuser";
  if (!configured())
    return (
      <div className="card">
        <h1>Reuniones</h1>
        <p>Configura Supabase para activar persistencia.</p>
      </div>
    );
  const s = db();
  const [{ data: meetings }, { data: communes }] = await Promise.all([
    s
      .from("meetings")
      .select("*,communes(name),attendances(count)")
      .order("meeting_date", { ascending: false }),
    s.from("communes").select("id,name").eq("active", true).order("name"),
  ]);
  return (
    <>
      <div className="top">
        <div>
          <h1>Reuniones</h1>
          <p>Cada reunión genera un QR persistente de autorregistro.</p>
          {!canEdit&&<p className="muted">La opción Eliminar solo aparece para cuentas con rol superuser.</p>}
        </div>
        <CreateMeeting communes={communes || []} />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Reunión</th>
            <th>Fecha</th>
            <th>Comuna</th>
            <th>Asistentes</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(meetings || []).map((m: any) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>
                {m.meeting_date} · {m.meeting_time?.slice(0, 5)}
              </td>
              <td>{m.communes?.name || "—"}</td>
              <td>{m.attendances?.[0]?.count || 0}</td>
              <td>
                <span className="badge">{m.status}</span>
              </td>
              <td>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {m.status === "ABIERTA" && (
                    <Link
                      className="btn alt"
                      href={`/admin/reuniones/${m.public_token}`}
                    >
                      Abrir
                    </Link>
                  )}
                  {canManageStatus&&m.status==="ABIERTA"&&<FinishMeetingButton meetingId={m.id}/>}
                  {canEdit&&<EditMeetingButton meeting={m} communes={communes||[]}/>}
                  {canEdit&&<DeleteAdminRecordButton
                    type="meeting"
                    recordId={m.id}
                    label={m.name}
                  />}
                  <Link
                    className="btn alt"
                    href={`/admin/reuniones/${m.public_token}/asistencia`}
                  >
                    Ver asistencia
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
