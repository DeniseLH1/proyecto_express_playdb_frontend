# PlayDB Frontend

Frontend estatico de PlayDB construido con HTML, CSS y JavaScript usando ES Modules. Consume la API Express del proyecto backend y no requiere un framework.

## Requisitos

- El backend PlayDB ejecutandose en `http://localhost:3000`.
- Node.js instalado si deseas usar un servidor estatico desde npm o Python disponible para una alternativa sencilla.

## Configuracion

La URL de la API se define en:

`js/config.js`

```js
export const API_BASE_URL = 'http://localhost:3000/api/v1';
```

Si el backend usa otro host o puerto, actualiza ese valor antes de ejecutar el frontend.

## Ejecucion local

Desde la carpeta `proyecto_express_playdb_frontend`, levanta un servidor estatico. Por ejemplo:

```bash
python -m http.server 5500
```

Abre `http://localhost:5500/index.html`.

No abras las paginas directamente con `file://`: los modulos ES y las peticiones `fetch` necesitan servirse mediante HTTP.

## Vistas

- `index.html`: catalogo publico, busqueda en tiempo real, filtros por categoria, banner de sesion, favoritos y top de peliculas.
- `login.html`: registro e inicio de sesion.
- `programa-detalle.html`: detalle, trailer, reparto, calificacion promedio y opiniones.
- `admin.html`: dashboard protegido para administradores.

## Roles

### Invitado

- Puede explorar el catalogo.
- Puede buscar y filtrar programas.
- Puede consultar detalles y opiniones.
- Ve el top publico de peliculas calificadas.
- No puede guardar favoritos ni publicar opiniones.

### Usuario autenticado

- Conserva las capacidades del invitado.
- Puede guardar y quitar favoritos.
- Puede filtrar la grilla por `Mis favoritos`.
- Puede publicar o actualizar una opinion con calificacion de 1 a 5.

### Administrador

El usuario con rol exacto `administrador` es enviado automaticamente a `admin.html` despues del login. Puede:

- Consultar el catalogo desde `Inicio`.
- Crear, editar y eliminar programas.
- Asignar categorias desde el formulario de programas.
- Crear y eliminar categorias.
- Ver promedios y cantidad de opiniones en las tarjetas.
- Configurar si las tarjetas del panel muestran calificaciones.
- Cerrar sesion desde el sidebar.

## Estructura principal

```text
index.html
login.html
programa-detalle.html
admin.html
css/                 Estilos compartidos, detalle, login y admin
js/app.js            Catalogo publico y estado de sesion
js/admin.js          Dashboard administrativo
js/detalle.js        Detalle y opiniones
js/components/       Tarjetas reutilizables
js/helpers/          Storage, favoritos y utilidades DOM
js/services/         Clientes de los endpoints backend
```

## Persistencia del frontend

- `playdb_user`: usuario autenticado almacenado para controlar la interfaz.
- `playdb_favorites_<usuario>`: favoritos personales del usuario.
- `playdb_admin_preferences`: preferencia visual local del dashboard admin.

Las opiniones y calificaciones no se guardan en `localStorage`; se persisten en el backend mediante la API de calificaciones.

## Flujo de calificaciones

1. El usuario abre `Ver detalle`.
2. El frontend consulta `GET /programas/:id/calificaciones`.
3. Si hay sesion, aparece el formulario de opinion.
4. Al publicar, usa `POST /programas/:id/calificaciones` con cookie de autenticacion.
5. La ficha actualiza el promedio y la lista de opiniones sin recargar la pagina.

## Notas de desarrollo

- Los servicios usan `apiFetch`, que configura JSON y `credentials: 'include'` para cookies.
- Las tarjetas son creadas por `createProgramaCard` y pueden mostrar favorito, promedio y total de calificaciones.
- El frontend mantiene el backend como fuente de verdad para programas, categorias y opiniones.
