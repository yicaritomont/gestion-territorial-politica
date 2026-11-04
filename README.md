# Gestión Territorial v1.0

Aplicación Next.js + Supabase/PostgreSQL lista para GitLab y Vercel.

## Funcionalidad
- One-page pública configurable desde administración.
- Identidad: nombre/cargo, logo, colores primario/secundario/acento/fondo.
- Destacados: CRUD, imagen en Supabase Storage, orden, activo/oculto, texto y CTA.
- Perfil candidato: foto, introducción y secciones dinámicas CRUD.
- Redes y sedes CRUD.
- URL configurable de consulta de puesto de votación.
- Política de tratamiento de datos configurable.
- Comunas administrables.
- Personas únicas por documento, líderes declarados/validados e información electoral manual.
- Reuniones persistentes, QR público, autorregistro y registro manual.
- Asistencias sin duplicar persona/reunión.
- Aspirantes desde “Quiero ser parte”.
- Compromisos y estados.
- Dashboard con métricas reales.

## Supabase
1. Crea un proyecto gratuito.
2. En SQL Editor ejecuta, en orden:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_full_admin.sql`
3. Copia `.env.example` a `.env.local` y completa URL y Service Role Key.
4. Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_`.

## Local
```bash
npm install
npm run dev
```

## GitLab
```bash
git init
git add .
git commit -m "feat: gestion territorial v1.0"
git branch -M main
git remote add origin URL_GITLAB
git push -u origin main
```

## Vercel
Importa el repositorio GitLab. Agrega las variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Framework: Next.js. Build: `npm run build`.

## Seguridad antes de datos reales
La Service Role solo se usa en Route Handlers/server. El panel `/admin` debe protegerse con autenticación corporativa o Supabase Auth antes de cargar datos personales reales. Esta entrega prioriza el sistema funcional y administrable; no publiques datos personales reales con `/admin` abierto.

## Autenticación y roles (v1.1)

1. Ejecuta `supabase/migrations/003_auth_roles.sql` después de las dos migraciones anteriores.
2. En **Supabase → Authentication → Users**, crea un usuario con correo y contraseña (no habilites registro público para administradores).
3. En SQL Editor, ejecuta lo siguiente **sustituyendo el correo**:

```sql
insert into public.app_users(user_id,role,active)
select id,'admin',true from auth.users where email='TU_CORREO_ADMIN@EJEMPLO.COM'
on conflict (user_id) do update set role='admin',active=true;
```

4. Abre `/admin/login` e inicia sesión. Para facilitadores crea otro usuario desde Authentication y registra su rol con `role='facilitator'` en `app_users`.
5. Usa `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` **solo en las variables de entorno del servidor**; no pongas la clave secreta en ninguna variable `NEXT_PUBLIC_`. Configura ambas en Vercel para Production y Preview según corresponda.
6. En Vercel importa el repositorio GitLab y selecciona Next.js; ejecuta `npm run build` antes del despliegue.

**Seguridad:** el middleware valida sesión y rol en `/admin` y las APIs administrativas. Las rutas públicas `/api/attendance` y `/api/prospects` permanecen accesibles sin login y deben incorporar limitación de frecuencia, protección antispam y controles adicionales antes de captar datos personales reales. El flujo de autorización de facilitadores aún debe validarse funcionalmente con cuentas de ambos roles. No se ha ejecutado un build completo en este entorno (dependencias npm no disponibles).


## v1.2 - Tema global configurable

Ejecuta `supabase/migrations/004_full_theme.sql` en SQL Editor antes de guardar los nuevos colores.
En **Configuración → Apariencia e identidad** se editan 29 variables de color adicionales, junto con los cuatro colores originales. La paleta se aplica a todo el sitio y al panel administrativo mediante CSS variables desde el layout raíz. No se requiere redespliegue para cambios de paleta; sí para instalar esta versión.

**Seguridad:** conserva las advertencias de la v1.1: valida autenticación/autorización de todas las API antes de exponer información personal en producción.
