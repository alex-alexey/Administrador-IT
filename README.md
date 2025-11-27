# Administrador IT

## Requerimientos del proyecto

- Cuando un usuario no ha iniciado sesión, se le redirige a la página de login.
- Cuando un usuario ha iniciado sesión, puede acceder a las demás páginas.
- NUNCA añadir código duplicado.

## Tecnologías y herramientas

- **Backend:** Node.js con Express
- **Frontend:** HTML, CSS, JavaScript
- **Base de datos:** MongoDB

## Estructura de carpetas y archivos base

```
public/
  css/
    estilos.css
  js/
    inventario.js
    ordenador.js
    dominios.js
    dashboard.js
  login.html
  dashboard.html
  inventario.html
  dominios.html
  ordenador.html

server/
  index.js
  .env
  routes/
    inventario.js
    dominios.js
    usuarios.js
    dashboard.js
  models/
    Inventario.js
    Dominio.js
    Usuario.js
    Dashboard.js
  controllers/
    inventarioController.js
    dominioController.js
    usuarioController.js
    dashboardController.js
  middlewares/
    auth.js

README.md
package.json
.gitignore
```

## Instrucciones para configurar y ejecutar el proyecto

1. Instala las dependencias:
   ```
   npm install
   ```
2. Configura el archivo `.env` con tu cadena de conexión a MongoDB.
3. Arranca el backend:
   ```
   npm start --prefix server
   ```
4. Sirve el frontend:
   ```
   npx serve public
   ```
   o usa cualquier servidor estático.

## Listado de páginas y APIs

- **login.html** → Llama a `/api/login`
- **dashboard.html** → Llama a `/api/dashboard`
- **inventario.html** → Llama a `/api/inventario`
- **dominios.html** → Llama a `/api/dominios`
- **ordenador.html** → Llama a `/api/inventario/:id`

## Entornos

- **Producción:** https://it-xqhv.onrender.com
- **Desarrollo local:**  
  - Backend: http://localhost:4000  
  - Frontend: http://localhost:3000

## Mensajes de error

- El backend y el frontend muestran mensajes de error claros al usuario.

## Seguridad y optimización

- Usa `connect-mongo` para sesiones en producción.
- No expongas credenciales en el código, usa variables de entorno.
- Muestra mensajes de error claros al usuario en backend y frontend.

## Preparación para despliegue

- El proyecto está listo para funcionar tanto en local como en producción.
