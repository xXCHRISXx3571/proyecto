# Cafecom API

API REST construida con NestJS, MongoDB y Mongoose. La organización sigue el flujo habitual de Nest:

```text
HTTP -> Controller -> DTO/guards -> Service -> Model de Mongoose -> MongoDB
```

## Responsabilidades

- `auth/`: firma y valida tokens, identifica al usuario y controla roles.
- `users/`: registro e inicio de sesión; el servicio normaliza correos y cifra contraseñas con bcrypt.
- `products/`: catálogo público; crear, editar y eliminar requiere rol `admin`.
- `orders/`: pedidos autenticados. El servidor consulta productos y calcula el total; nunca acepta precios o identidad desde el cliente.
- `common/`: piezas reutilizables, como la validación de ObjectId.
- `config/`: validación temprana de variables de entorno.

Los controllers solo manejan HTTP. Las reglas de negocio están en services, los contratos de entrada en DTOs y la persistencia en schemas.

## Ejecutar

```bash
cp .env.example .env
npm ci
npm run start:dev
```

- Salud: `GET http://localhost:3001/health`
- Swagger: `http://localhost:3001/api`

## Pruebas y calidad

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

## Primer administrador

El registro público siempre crea clientes. Registra el usuario normalmente y cambia su rol una sola vez en MongoDB Atlas:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Esto evita que cualquier visitante pueda autoconcederse permisos administrativos.

## Endpoints

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| GET | `/health` | Público | Estado del proceso |
| POST | `/users/register` | Público | Crear cliente |
| POST | `/users/login` | Público | Obtener `accessToken` |
| GET | `/products` | Público | Listar catálogo |
| GET | `/products/:id` | Público | Ver producto |
| POST/PATCH/DELETE | `/products` | Admin | Gestionar catálogo |
| POST | `/orders` | Usuario | Crear pedido propio |
| GET | `/orders/me` | Usuario | Consultar pedidos propios |
| GET | `/orders` | Admin | Consultar todos los pedidos |

Las rutas protegidas reciben `Authorization: Bearer <accessToken>`.
