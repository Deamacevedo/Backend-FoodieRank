# FoodieRank - Backend API

Sistema de ranking de restaurantes y platos con Node.js, Express y MongoDB.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js v18 o superior
- MongoDB Atlas (ya configurado)
- npm o yarn

### Instalación

```bash
# 1. Navegar a la carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (copiar desde .env.example)
cp .env.example .env

# 4. Iniciar servidor en modo desarrollo
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

## 📋 Variables de Entorno

El archivo `.env` debe contener:

```env
PORT=3000
NODE_ENV=development
API_VERSION=1.0.0

MONGODB_URI=mongodb+srv://jefersonlopezr99_db_user:lghUcvIzB2MDOl1x@cluster0.2daxdau.mongodb.net/
DB_NAME=foodierank

JWT_SECRET=foodierank-dylan-jeferson
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5500

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔑 Autenticación

La API usa JWT (JSON Web Tokens). Para usar endpoints protegidos:

1. **Registrarse o hacer login:**
```bash
POST http://localhost:3000/api/v1/auth/register
POST http://localhost:3000/api/v1/auth/login
```

2. **Usar el token en las peticiones:**
```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE'
}
```

## 📡 Endpoints Principales

### Autenticación
```
POST   /api/v1/auth/register       - Registrar usuario
POST   /api/v1/auth/login          - Iniciar sesión
GET    /api/v1/auth/profile        - Ver perfil (requiere auth)
```

### Restaurantes
```
GET    /api/v1/restaurants         - Listar restaurantes
GET    /api/v1/restaurants/:id     - Ver detalle
POST   /api/v1/restaurants         - Crear (requiere auth)
GET    /api/v1/restaurants/ranking - Ver ranking ponderado
```

### Categorías
```
GET    /api/v1/categories          - Listar categorías
POST   /api/v1/categories          - Crear (solo admin)
```

### Platos
```
GET    /api/v1/restaurants/:id/dishes  - Platos de un restaurante
POST   /api/v1/restaurants/:id/dishes  - Agregar plato (requiere auth)
```

### Reseñas
```
GET    /api/v1/restaurants/:id/reviews  - Reseñas de un restaurante
POST   /api/v1/restaurants/:id/reviews  - Crear reseña (requiere auth)
POST   /api/v1/reviews/:id/like         - Dar like (requiere auth)
```

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, Passport)
│   ├── controllers/     # Controladores HTTP
│   ├── middlewares/     # Middlewares (auth, errors, rate limit)
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de la API
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades y helpers
│   └── app.js           # Punto de entrada
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables
├── package.json         # Dependencias
└── README.md           # Este archivo
```

## 👥 Roles de Usuario

- **user**: Usuario normal (puede crear restaurantes, reseñas, likes)
- **admin**: Administrador (puede aprobar restaurantes, gestionar categorías)

### Crear un usuario admin:
Por defecto, todos los usuarios son "user". Para crear un admin, usa:
```bash
POST /api/v1/auth/register
{
  "username": "admin",
  "email": "admin@foodierank.com",
  "password": "Admin123",
  "role": "admin"
}
```

## 🧪 Probar la API

### Con curl:
```bash
# Registrarse
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"Password123"}'

# Listar restaurantes
curl http://localhost:3000/api/v1/restaurants
```

### Con Postman o Thunder Client:
1. Importa la URL base: `http://localhost:3000/api/v1`
2. Crea las peticiones según los endpoints
3. Para rutas protegidas, agrega el header `Authorization: Bearer {token}`

## 📊 Características Principales

✅ **Autenticación JWT** con roles (user/admin)
✅ **CRUD completo** de restaurantes, platos, categorías y reseñas
✅ **Sistema de aprobación** de restaurantes por admin
✅ **Rating automático** que se actualiza con cada reseña
✅ **Sistema de likes/dislikes** en reseñas
✅ **Ranking ponderado** con algoritmo personalizado
✅ **Transacciones MongoDB** para consistencia de datos
✅ **Rate limiting** para seguridad
✅ **Validación de datos** en todos los endpoints

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración de 24 horas
- Rate limiting: 100 requests/15min (general), 50/15min (likes)
- Validación de inputs con express-validator
- CORS configurado
- Headers de seguridad

## 📝 Scripts Disponibles

```bash
npm start       # Inicia el servidor en producción
npm run dev     # Inicia el servidor en desarrollo (con nodemon)
```

## 🐛 Solución de Problemas

### El servidor no inicia:
- Verifica que el puerto 3000 esté libre
- Revisa que las variables de entorno estén correctas
- Asegúrate de tener Node.js v18+

### Error de conexión a MongoDB:
- Verifica que el MONGODB_URI esté correcto
- Comprueba tu conexión a internet
- Revisa que la IP esté en la whitelist de MongoDB Atlas

### Token inválido o expirado:
- Los tokens JWT expiran en 24 horas
- Vuelve a hacer login para obtener un nuevo token

## 👨‍💻 Equipo de Desarrollo

- **Scrum Master:** Jeferson Lopez
- **Product Owner:** Dylan Acevedo
- **Developers:** Dylan Acevedo y Jeferson Lopez

## 📄 Licencia

ISC

---