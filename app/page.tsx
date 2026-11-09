import Link from "next/link";
import JoinModal from "@/components/JoinModal";
import { db, configured } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default async function Home() {
  let settings: any = null,
    features: any[] = [],
    sections: any[] = [],
    offices: any[] = [],
    stats = { communes: 0, leaders: 0, people: 0 };
  if (configured()) {
    const s = db();
    const [st, ft, ps, of, pc, lc] = await Promise.all([
      s.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      s
        .from("featured_content")
        .select("*")
        .eq("active", true)
        .order("sort_order"),
      s
        .from("profile_sections")
        .select("*")
        .eq("active", true)
        .order("sort_order"),
      s.from("offices").select("*").eq("active", true),
      s.from("people").select("*", { count: "exact", head: true }),
      s
        .from("people")
        .select("residence_commune_id", { count: "exact" })
        .eq("validated_leader", true),
    ]);
    settings = st.data;
    features = ft.data || [];
    sections = ps.data || [];
    offices = of.data || [];
    const unique = new Set(
      (lc.data || []).map((x: any) => x.residence_commune_id).filter(Boolean),
    );
    stats = {
      people: pc.count || 0,
      leaders: lc.count || 0,
      communes: unique.size,
    };
  }
  const hero = features[0];
  return (
    <div>
      <nav className="nav">
        <div className="brand">
          {settings?.logo_url ? (
            <img className="logoPublic" src={settings.logo_url} alt="Logo" />
          ) : (
            settings?.candidate_name || "CANDIDATO"
          )}
        </div>
        <div className="links">
          <a href="#perfil">Conóceme</a>
          <a href="#gestion">Gestión</a>
          <a href="#sedes">Sedes</a>
          <JoinModal />
          <Link className="btn alt" href="/admin">
            Admin
          </Link>
        </div>
      </nav>
      <section className="hero">
        <div>
          <span className="badge">{hero?.label || "CERCA DE LA GENTE"}</span>
          <h1>{hero?.title || "Construimos territorio con la comunidad."}</h1>
          <p>
            {hero?.body ||
              "Experiencia, gestión social y presencia real en cada sector."}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <JoinModal />
            <a className="btn alt" href={hero?.button_url || "#perfil"}>
              {hero?.button_text || "Conoce el trabajo"}
            </a>
          </div>
        </div>
        <div className="heroCard">
          {hero?.image_url ? (
            <img className="heroImage" src={hero.image_url} alt={hero.title} />
          ) : settings?.candidate_image_url ? (
            <img
              className="heroImage"
              src={settings.candidate_image_url}
              alt={settings.candidate_name}
            />
          ) : null}
          <div>
            <b>{settings?.profile_label || "Perfil del candidato"}</b>
            <h2>{settings?.profile_title || "Experiencia que transforma"}</h2>
            <p>{settings?.profile_intro}</p>
          </div>
        </div>
      </section>
      <section id="perfil" className="section">
        <h2>{settings?.profile_title || "Conoce al candidato"}</h2>
        <div className="grid3">
          {sections.map((x: any) => (
            <div className="card" key={x.id}>
              <h3>{x.title}</h3>
              <p>{x.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="gestion" className="section alt">
        <h2>Nuestra presencia</h2>
        <div className="grid3">
          <div className="metric">
            <strong>{stats.communes}</strong>comunas con presencia
          </div>
          <div className="metric">
            <strong>{stats.leaders}</strong>líderes validados
          </div>
          <div className="metric">
            <strong>{stats.people}</strong>personas vinculadas
          </div>
        </div>
      </section>
      <footer id="sedes" className="footer">
        <h2>Sedes y redes sociales</h2>
        {offices.map((o: any) => (
          <p key={o.id}>
            📍 <b>{o.name}</b> · {o.address}
            {o.phone ? ` · ${o.phone}` : ""}
            {o.hours ? ` · ${o.hours}` : ""}
          </p>
        ))}
        <div className="socials">
          {settings?.instagram && (
            <a href={settings.instagram} target="_blank">
              Instagram
            </a>
          )}
          {settings?.facebook && (
            <a href={settings.facebook} target="_blank">
              Facebook
            </a>
          )}
          {settings?.tiktok && (
            <a href={settings.tiktok} target="_blank">
              TikTok
            </a>
          )}
          {settings?.x_url && (
            <a href={settings.x_url} target="_blank">
              X
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
