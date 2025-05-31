# SaaS Agendador de Citas

Backend para un sistema SaaS de agendamiento de citas con sistema de membresías.

## Características

- Sistema de autenticación y autorización
- Gestión de usuarios (Admin y Clientes)
- Sistema de membresías
- Gestión de citas
- API RESTful
- Preparado para despliegue en Vercel

## Requisitos

- Node.js (v14 o superior)
- MongoDB
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/FrancoGW/backend-sass-agenda-citas.git
cd backend-sass-agenda-citas
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
PORT=3000
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
```

## Desarrollo

Para iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

## Producción

Para iniciar el servidor en modo producción:
```bash
npm start
```

## Estructura del Proyecto

```
src/
├── models/          # Modelos de MongoDB
├── routes/          # Rutas de la API
├── middleware/      # Middleware de autenticación y otros
├── controllers/     # Controladores de la lógica de negocio
└── index.js         # Punto de entrada de la aplicación
```

## API Endpoints

### Autenticación
- POST /api/auth/register - Registro de usuarios
- POST /api/auth/login - Inicio de sesión

### Usuarios
- GET /api/users/profile - Obtener perfil
- PUT /api/users/profile - Actualizar perfil
- GET /api/users (admin) - Listar usuarios

### Membresías
- GET /api/memberships - Listar membresías
- POST /api/memberships (admin) - Crear membresía
- PUT /api/memberships/:id (admin) - Actualizar membresía

### Citas
- POST /api/appointments - Crear cita
- GET /api/appointments - Listar citas
- PUT /api/appointments/:id - Actualizar cita
- DELETE /api/appointments/:id - Cancelar cita

## Despliegue

El proyecto está configurado para ser desplegado en Vercel. Para desplegar:

1. Crear una cuenta en Vercel
2. Conectar el repositorio
3. Configurar las variables de entorno en Vercel
4. Desplegar

## Licencia

MIT 