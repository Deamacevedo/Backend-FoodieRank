# FoodieRank - Backend API REST

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)
![Status](https://img.shields.io/badge/Status-Production-success.svg)

**Sistema de ranking de restaurantes y platos con arquitectura REST, autenticación JWT y algoritmo de ranking ponderado**

[Demo en Vivo](https://foodierank.vercel.app/) | [Frontend Repo](https://github.com/Jefersonlopezr/foodierank) | [Documentación SCRUM](https://drive.google.com/drive/folders/1w35Q70M9_Qv3Pf34q71ufHeIOb0o8nAH?usp=sharing) | [Video Demo](https://drive.google.com/drive/folders/1w35Q70M9_Qv3Pf34q71ufHeIOb0o8nAH?usp=sharing)

</div>

---

## 📋 Descripción del Proyecto

**FoodieRank** es una plataforma completa de ranking de restaurantes que permite a los usuarios descubrir, calificar y compartir experiencias gastronómicas. El backend está construido con una arquitectura RESTful robusta utilizando Node.js, Express y MongoDB, implementando las mejores prácticas de desarrollo, seguridad y escalabilidad.

### 🎯 Características Principales

- **Sistema de Autenticación JWT** con roles de usuario (user/admin)
- **CRUD Completo** para restaurantes, platos, categorías y reseñas
- **Sistema de Aprobación** de restaurantes por administradores
- **Rating Automático** que se actualiza dinámicamente con cada reseña
- **Sistema de Likes/Dislikes** en reseñas con contadores
- **Ranking Ponderado** con algoritmo personalizado basado en:
  - Calificación promedio
  - Número de reseñas
  - Antigüedad del restaurante
  - Interacciones de la comunidad
- **Transacciones MongoDB** para garantizar consistencia de datos
- **Rate Limiting** para prevenir abuso del API
- **Validación Robusta** en todos los endpoints
- **CORS Configurado** para desarrollo y producción
- **Documentación Completa** de endpoints y modelos

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** v18 o superior
- **MongoDB Atlas** (cuenta gratuita)
- **npm** o **yarn**
- **Git** para clonar el repositorio

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Deamacevedo/Backend-FoodieRank
cd foodierank-backend

# 2. Navegar a la carpeta backend
cd backend

# 3. Instalar dependencias
npm install

# 4. Crear archivo .env
cp .env.example .env

# 5. Configurar variables de entorno (ver sección Variables de Entorno)
# Editar .env con tus credenciales

# 6. Iniciar servidor en modo desarrollo
npm run dev

# El servidor estará disponible en: http://localhost:3000
```

### Instalación en Producción (Render)

El backend está desplegado en **Render** en la siguiente URL:

**API Base URL**: `https://backend-foodierank.onrender.com`

**Health Check**: `https://backend-foodierank.onrender.com/health`

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del directorio `backend` con las siguientes variables:

```env
# Servidor
PORT=3000
NODE_ENV=development
API_VERSION=1.0.0

# Base de Datos MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/
DB_NAME=foodierank

# JWT (JSON Web Tokens)
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=24h

# CORS (Configuración de orígenes permitidos)
CORS_ORIGIN=http://localhost:5500,https://foodierank.vercel.app

# Rate Limiting (Límite de peticiones)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 🔐 Seguridad de Variables

- **NUNCA** commitear el archivo `.env` al repositorio
- Cambiar `JWT_SECRET` por un valor único y seguro (mínimo 32 caracteres)
- En producción, usar variables de entorno del hosting (Render, Heroku, etc.)

---

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/               # Configuraciones
│   │   ├── database.js       # Conexión a MongoDB
│   │   └── passport.js       # Estrategia JWT
│   │
│   ├── controllers/          # Controladores HTTP
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   ├── dishController.js
│   │   ├── reviewController.js
│   │   ├── categoryController.js
│   │   └── userController.js
│   │
│   ├── middlewares/          # Middlewares
│   │   ├── authMiddleware.js       # Autenticación JWT
│   │   ├── roleMiddleware.js       # Verificación de roles
│   │   ├── errorHandler.js         # Manejo de errores
│   │   └── rateLimiter.js          # Rate limiting
│   │
│   ├── models/               # Modelos de MongoDB
│   │   ├── userModel.js
│   │   ├── restaurantModel.js
│   │   ├── dishModel.js
│   │   ├── reviewModel.js
│   │   └── categoryModel.js
│   │
│   ├── routes/               # Rutas de la API
│   │   ├── authRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── dishRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/             # Lógica de negocio
│   │   ├── authService.js
│   │   ├── restaurantService.js
│   │   ├── reviewService.js
│   │   └── rankingService.js      # Algoritmo de ranking
│   │
│   ├── utils/                # Utilidades
│   │   ├── responseHandler.js
│   │   ├── validators.js
│   │   └── transactionHelper.js
│   │
│   └── app.js                # Punto de entrada
│
├── .env                      # Variables de entorno (NO COMMITEAR)
├── .env.example              # Ejemplo de variables
├── .gitignore
├── package.json
└── README.md                 # Este archivo
```

### 📂 Descripción de Carpetas

| Carpeta | Descripción |
|---------|-------------|
| `config/` | Configuraciones de base de datos, autenticación y servicios externos |
| `controllers/` | Lógica de manejo de peticiones HTTP (recibir request, enviar response) |
| `middlewares/` | Funciones intermedias (autenticación, validación, manejo de errores) |
| `models/` | Esquemas de Mongoose para MongoDB |
| `routes/` | Definición de endpoints y asignación a controladores |
| `services/` | Lógica de negocio compleja (ranking, transacciones, cálculos) |
| `utils/` | Funciones auxiliares reutilizables |

---

## 📡 Endpoints de la API

### Base URL

- **Desarrollo**: `http://localhost:3000/api/v1`
- **Producción**: `https://backend-foodierank.onrender.com/api/v1`

### 🔓 Autenticación

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/profile` | Obtener perfil del usuario | Sí |
| PUT | `/auth/profile` | Actualizar perfil | Sí |

### 🍽️ Restaurantes

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| GET | `/restaurants` | Listar todos los restaurantes | No |
| GET | `/restaurants/:id` | Obtener detalles de un restaurante | No |
| POST | `/restaurants` | Crear nuevo restaurante | Sí |
| PUT | `/restaurants/:id` | Actualizar restaurante | Sí (Owner) |
| DELETE | `/restaurants/:id` | Eliminar restaurante | Sí (Owner/Admin) |
| GET | `/restaurants/ranking` | Obtener ranking ponderado | No |
| PATCH | `/restaurants/:id/approve` | Aprobar restaurante | Sí (Admin) |

### 🍕 Platos

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| GET | `/restaurants/:restaurantId/dishes` | Listar platos de un restaurante | No |
| POST | `/restaurants/:restaurantId/dishes` | Agregar plato a restaurante | Sí (Owner) |
| PUT | `/dishes/:id` | Actualizar plato | Sí (Owner) |
| DELETE | `/dishes/:id` | Eliminar plato | Sí (Owner) |

### ⭐ Reseñas

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| GET | `/restaurants/:restaurantId/reviews` | Listar reseñas de un restaurante | No |
| POST | `/restaurants/:restaurantId/reviews` | Crear reseña | Sí |
| PUT | `/reviews/:id` | Actualizar reseña | Sí (Owner) |
| DELETE | `/reviews/:id` | Eliminar reseña | Sí (Owner) |
| POST | `/reviews/:id/like` | Dar like a una reseña | Sí |
| POST | `/reviews/:id/dislike` | Dar dislike a una reseña | Sí |

### 📂 Categorías

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| GET | `/categories` | Listar todas las categorías | No |
| POST | `/categories` | Crear nueva categoría | Sí (Admin) |
| PUT | `/categories/:id` | Actualizar categoría | Sí (Admin) |
| DELETE | `/categories/:id` | Eliminar categoría | Sí (Admin) |

### 👤 Usuarios

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| GET | `/users/:id` | Obtener perfil público de usuario | No |
| GET | `/users/:id/restaurants` | Restaurantes del usuario | No |
| GET | `/users/:id/reviews` | Reseñas del usuario | No |

---

## 🔑 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación.

### Flujo de Autenticación

1. **Registro de Usuario**
   ```bash
   POST /api/v1/auth/register
   Content-Type: application/json

   {
     "username": "johndoe",
     "email": "john@example.com",
     "password": "SecurePass123"
   }
   ```

2. **Iniciar Sesión**
   ```bash
   POST /api/v1/auth/login
   Content-Type: application/json

   {
     "email": "john@example.com",
     "password": "SecurePass123"
   }
   ```

   **Respuesta:**
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "507f1f77bcf86cd799439011",
       "username": "johndoe",
       "email": "john@example.com",
       "role": "user"
     }
   }
   ```

3. **Usar Token en Peticiones Protegidas**
   ```bash
   GET /api/v1/auth/profile
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Roles de Usuario

| Rol | Permisos |
|-----|----------|
| `user` | Crear restaurantes, platos, reseñas, likes |
| `admin` | Todos los permisos de `user` + aprobar restaurantes, gestionar categorías |

---

## 🧮 Algoritmo de Ranking Ponderado

El sistema implementa un algoritmo de ranking sofisticado que considera múltiples factores:

```javascript
Score = (avgRating × 0.4) + (reviewCount × 0.3) + (ageBonus × 0.2) + (engagement × 0.1)
```

### Factores del Ranking

| Factor | Peso | Descripción |
|--------|------|-------------|
| **Rating Promedio** | 40% | Promedio de todas las calificaciones (1-5 estrellas) |
| **Número de Reseñas** | 30% | Cantidad de reseñas (normalizado) |
| **Antigüedad** | 20% | Bonus para restaurantes establecidos |
| **Engagement** | 10% | Likes, comentarios, interacciones |

Este algoritmo está implementado en `src/services/rankingService.js`

---

## 🛡️ Seguridad

### Medidas Implementadas

- **Contraseñas Hasheadas**: bcrypt con 10 salt rounds
- **JWT con Expiración**: Tokens válidos por 24 horas
- **Rate Limiting**:
  - General: 100 requests por 15 minutos
  - Likes: 50 requests por 15 minutos
- **Validación de Inputs**: express-validator en todos los endpoints
- **CORS Configurado**: Solo orígenes permitidos
- **Headers de Seguridad**: Helmet.js (recomendado para producción)
- **Variables de Entorno**: Credenciales fuera del código

### Recomendaciones de Producción

```bash
# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🧪 Pruebas de la API

### Usando cURL

```bash
# Health Check
curl https://backend-foodierank.onrender.com/health

# Registrar Usuario
curl -X POST https://backend-foodierank.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234"
  }'

# Listar Restaurantes
curl https://backend-foodierank.onrender.com/api/v1/restaurants

# Obtener Ranking
curl https://backend-foodierank.onrender.com/api/v1/restaurants/ranking
```

### Usando Postman/Thunder Client

1. **Importar Base URL**: `https://backend-foodierank.onrender.com/api/v1`
2. **Crear Entorno** con variables:
   - `base_url`: URL de la API
   - `token`: Token JWT (después del login)
3. **Configurar Authorization**: Bearer Token usando `{{token}}`

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor con nodemon (auto-reload)

# Producción
npm start            # Inicia servidor en modo producción

# Otros
npm install          # Instala dependencias
```

---

## 🎨 Principios Aplicados

Este proyecto implementa las siguientes buenas prácticas y principios de desarrollo:

### 1. **Arquitectura MVC (Modelo-Vista-Controlador)**
   - Separación clara entre modelos, controladores y rutas
   - Lógica de negocio en servicios independientes

### 2. **RESTful API Design**
   - Uso correcto de verbos HTTP (GET, POST, PUT, DELETE, PATCH)
   - Endpoints semánticos y consistentes
   - Códigos de estado HTTP apropiados (200, 201, 400, 401, 404, 500)

### 3. **SOLID Principles**
   - **S**ingle Responsibility: Cada módulo tiene una responsabilidad única
   - **O**pen/Closed: Código abierto a extensión, cerrado a modificación
   - **D**ependency Inversion: Uso de servicios e inyección de dependencias

### 4. **DRY (Don't Repeat Yourself)**
   - Reutilización de código mediante utilidades y helpers
   - Middlewares compartidos

### 5. **KISS (Keep It Simple, Stupid)**
   - Código legible y fácil de mantener
   - Funciones pequeñas y enfocadas

### 6. **Error Handling Centralizado**
   - Manejo global de errores con middleware
   - Respuestas de error consistentes

### 7. **Security Best Practices**
   - Autenticación y autorización robustas
   - Validación de inputs
   - Rate limiting
   - Variables de entorno para credenciales

---

## 💡 Consideraciones Técnicas

### Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **Express** | 4.18+ | Framework web |
| **MongoDB** | Atlas | Base de datos NoSQL |
| **Mongoose** | 8.x | ODM para MongoDB |
| **JWT** | 9.x | Autenticación |
| **bcryptjs** | 2.x | Hash de contraseñas |
| **express-validator** | 7.x | Validación de datos |
| **cors** | 2.x | CORS middleware |
| **dotenv** | 16.x | Variables de entorno |

### Base de Datos MongoDB

#### Colecciones Principales

1. **users**: Usuarios del sistema
2. **restaurants**: Restaurantes registrados
3. **dishes**: Platos de cada restaurante
4. **reviews**: Reseñas y calificaciones
5. **categories**: Categorías de restaurantes

#### Índices Optimizados

- `users`: `email` (único), `username` (único)
- `restaurants`: `name`, `category`, `rating`, `approved`
- `reviews`: `restaurant`, `user`, `createdAt`
- `categories`: `name` (único)

### Transacciones MongoDB

El sistema utiliza transacciones para operaciones críticas:
- Creación de reseñas (actualiza rating del restaurante)
- Eliminación de restaurantes (elimina platos y reseñas asociadas)
- Sistema de likes (actualiza contadores)

**Ejemplo**: Ver `src/utils/transactionHelper.js`

### Despliegue

#### Desarrollo Local
```bash
npm run dev  # http://localhost:3000
```

#### Producción (Render)
- **URL**: https://backend-foodierank.onrender.com
- **Auto-deploy**: Conectado a GitHub
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Variables de Entorno**: Configuradas en Render Dashboard

**Nota**: El plan gratuito de Render "duerme" el servicio después de 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos.

---

## 🐛 Solución de Problemas Comunes

### El servidor no inicia

**Problema**: `Error: listen EADDRINUSE :::3000`

**Solución**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# O cambiar el puerto en .env
PORT=3001
```

### Error de conexión a MongoDB

**Problema**: `MongoNetworkError: failed to connect`

**Soluciones**:
1. Verificar `MONGODB_URI` en `.env`
2. Comprobar conexión a internet
3. En MongoDB Atlas → Network Access → Allow Access from Anywhere (`0.0.0.0/0`)
4. Verificar credenciales de usuario de base de datos

### Error CORS en Frontend

**Problema**: `Access-Control-Allow-Origin header is missing`

**Solución**:
1. Verificar que el origen del frontend esté en `allowedOrigins` en `app.js`
2. Actualizar variable `CORS_ORIGIN` en Render
3. Asegurarse de que no haya barra `/` al final de la URL

### Token inválido o expirado

**Problema**: `401 Unauthorized - Token expired`

**Solución**:
- Los tokens JWT expiran en 24 horas
- Volver a hacer login para obtener un nuevo token
- Verificar que `JWT_SECRET` sea el mismo en desarrollo y producción

---

## 📊 Metodología SCRUM

Este proyecto fue desarrollado siguiendo la metodología ágil SCRUM:

### Roles del Equipo

| Rol | Responsable | Responsabilidades |
|-----|-------------|-------------------|
| **Scrum Master** | Jeferson Lopez | Facilitar procesos, eliminar impedimentos |
| **Product Owner** | Dylan Acevedo | Definir prioridades, gestionar backlog |
| **Developer** | Jeferson Lopez | Desarrollo backend, base de datos |
| **Developer** | Dylan Acevedo | Desarrollo frontend, integración |

### Sprints Realizados

El proyecto se dividió en 4 sprints de 1 semana cada uno:

1. **Sprint 1**: Configuración inicial, modelos de datos, autenticación
2. **Sprint 2**: CRUD de restaurantes y platos, sistema de roles
3. **Sprint 3**: Sistema de reseñas, likes, algoritmo de ranking
4. **Sprint 4**: Integración frontend-backend, despliegue, pruebas finales

### Documentación SCRUM Completa

Para ver el documento SCRUM completo en PDF con:
- Historias de usuario detalladas
- Backlog de producto
- Burndown charts
- Retrospectivas de sprint
- Evidencias de reuniones

**Acceder a**: [Carpeta de Documentación SCRUM](https://drive.google.com/drive/folders/1w35Q70M9_Qv3Pf34q71ufHeIOb0o8nAH?usp=sharing)

---

## 🎥 Video Demostración

Accede al video completo donde se muestra:

- **Explicación Técnica**: Arquitectura del sistema, flujo de datos, decisiones de diseño
- **Ejemplos de Código**: Walkthrough de funciones clave (autenticación, ranking, transacciones)
- **Demo Funcional**: Demostración completa de la aplicación en producción

**Ver Video**: [Video Demo en Google Drive](https://drive.google.com/drive/folders/1w35Q70M9_Qv3Pf34q71ufHeIOb0o8nAH?usp=sharing)

---

## 🔗 Enlaces Importantes

| Recurso | URL |
|---------|-----|
| **Aplicación en Vivo** | https://foodierank.vercel.app/ |
| **API Backend (Producción)** | https://backend-foodierank.onrender.com |
| **Frontend Repository** | https://github.com/Jefersonlopezr/foodierank |
| **Documentación SCRUM** | https://drive.google.com/drive/folders/1w35Q70M9_Qv3Pf34q71ufHeIOb0o8nAH?usp=sharing |
| **Video Demo** | https://drive.google.com/drive/folders/1w35Q70M9_Qv3Pf34q71ufHeIOb0o8nAH?usp=sharing |

---

## 👨‍💻 Créditos

### Equipo de Desarrollo

**Jeferson Lopez**
- Rol: Scrum Master & Backend Developer
- GitHub: [@Jefersonlopezr](https://github.com/Jefersonlopezr)
- Responsabilidades: Arquitectura backend, API REST, base de datos, autenticación

**Dylan Acevedo**
- Rol: Product Owner & Full-Stack Developer
- Responsabilidades: Desarrollo frontend, diseño UI/UX, integración, testing

### Agradecimientos

- Instructores y mentores del curso
- Comunidad de desarrolladores de Stack Overflow
- Documentación oficial de Node.js, Express y MongoDB

---

## 📄 Licencia

Este proyecto está bajo la licencia **ISC**.

```
ISC License

Copyright (c) 2025 Jeferson Lopez & Dylan Acevedo

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```

---

## 📞 Contacto

Para preguntas, sugerencias o colaboraciones:

- **Email**: jefersonlopezr99@gmail.com
- **GitHub Issues**: [Reportar un problema](https://github.com/Jefersonlopezr/foodierank/issues)

---

<div align="center">

**Desarrollado con ❤️ por Jeferson Lopez & Dylan Acevedo**

⭐ Si te gustó este proyecto, considera darle una estrella en GitHub

[⬆ Volver arriba](#foodierank---backend-api-rest)

</div>
