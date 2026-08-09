# Cafecom — Los 3 Pelagatos

Monorepo preparado para desplegar la misma tienda desde cuentas propias.

## Contenido

- `backend/`: API NestJS + MongoDB para Railway.
- `frontend/`: tienda web Next.js para Vercel.
- `expo-app/`: aplicación móvil React Native con Expo/EAS.
- `DEPLOYMENT.md`: guía completa, desde crear la base de datos hasta probar producción.

## Qué se corrigió

- Backend dividido en módulos, controllers, services, DTOs, guards y schemas con responsabilidades claras.
- Contraseñas cifradas con bcrypt y tokens firmados para las rutas privadas.
- Roles `customer` y `admin`; las modificaciones del catálogo están protegidas.
- Pedidos vinculados al usuario autenticado y totales calculados en el servidor usando MongoDB.
- Validación global de datos, ObjectId y variables de entorno.
- API documentada con Swagger en `/api` y comprobable mediante `/health`.
- Frontend y Expo consumen una URL configurable y usan el nuevo contrato autenticado.
- Pruebas unitarias y e2e para la lógica principal.

## Desarrollo local

Copia cada `.env.example` como `.env`, completa los valores y ejecuta `npm ci` en cada proyecto. El backend usa el puerto 3001 y el frontend el 3000.

Nunca subas archivos `.env`, credenciales de MongoDB ni secretos de producción al repositorio.
