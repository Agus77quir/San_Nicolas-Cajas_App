# San Nicolas Cajas App

Sistema interno de cajas para controlar movimientos, cobros, tickets devueltos y cierres de caja de las sucursales y areas de la empresa.

La aplicacion esta migrada desde el HTML original a Next.js para poder desplegarse en Vercel y conectarse luego con Supabase.

## Estado Actual

- Dashboard con indicadores principales.
- Graficos de distribucion, cobros por mes y acumulado.
- Carga de cobros.
- Carga de tickets devueltos.
- Carga de movimientos de caja.
- Listados con filtros.
- Exportacion CSV.
- Persistencia temporal en `localStorage`.
- Cliente Supabase preparado para la siguiente etapa.

El HTML original quedo guardado en `backup/san_nicolas_app.html`.

## Estructura

```txt
app/
  layout.js
  page.js
  globals.css
src/
  features/
    agency-dashboard/
      AgencyDashboard.jsx
      data.js
      utils.js
  lib/
    supabase/
      client.js
backup/
  san_nicolas_app.html
```

## Requisitos

- Node.js 20.9 o superior.
- npm.
- Proyecto Supabase creado para la etapa de base de datos.

## Variables De Entorno

Crear un archivo `.env.local` a partir del ejemplo:

```bash
cp .env.example .env.local
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Completar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_publica
```

La clave `SUPABASE_SERVICE_ROLE_KEY`, si se usa, debe quedar solo para operaciones de servidor. No debe usarse en componentes cliente.

## Levantar En Local

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abrir:

```txt
http://127.0.0.1:3000
```

Tambien puede funcionar con `http://localhost:3000`, pero en esta maquina se verifico correctamente con `127.0.0.1`.

## Comandos Utiles

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Despliegue En Vercel

1. Subir el repositorio a GitHub.
2. Importar el proyecto desde Vercel.
3. Configurar las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Ejecutar deploy.

## Proximas Etapas

- Incorporar login con Supabase Auth.
- Crear tablas reales para sucursales, areas, cobros, tickets y movimientos de caja.
- Reemplazar `localStorage` por consultas y mutaciones a Supabase.
- Agregar permisos por usuario, sucursal o area.
- Agregar reportes por rango de fechas y cierre diario.
