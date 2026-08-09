# Despliegue desde cero

## 1. Repositorio propio

1. Crea un repositorio vacío en GitHub.
2. Desde la carpeta `cafecom`, ejecuta `git init`, `git add .`, `git commit -m "Proyecto Cafecom"`.
3. Conecta el remoto de tu repositorio y haz `git push -u origin main`.

El `.gitignore` excluye dependencias, compilados, cachés y archivos `.env`.

## 2. MongoDB Atlas

1. Crea un proyecto, un clúster y un usuario de base de datos.
2. En Network Access permite la conexión desde Railway. Para una entrega puede usarse `0.0.0.0/0` con una contraseña fuerte; en un sistema real conviene restringir la red.
3. Copia la cadena `mongodb+srv://...`, selecciona el nombre de base `Cafe` y guárdala como `MONGO_URI` solo en Railway.

## 3. Backend en Railway

1. Crea un proyecto desde el repositorio de GitHub.
2. Establece **Root Directory** en `backend`.
3. Agrega estas variables:

```text
MONGO_URI=mongodb+srv://...
JWT_SECRET=una-cadena-aleatoria-de-32-o-mas-caracteres
CORS_ORIGIN=https://TU-FRONTEND.vercel.app
NODE_ENV=production
```

No crees `PORT`: Railway lo inyecta. `railway.json` instala, compila, inicia `dist/main` y comprueba `/health`.

4. Genera un dominio público y verifica:

```text
https://TU-BACKEND.up.railway.app/health
https://TU-BACKEND.up.railway.app/api
```

Un 404 en el dominio genérico no significa que el servidor esté roto si `/health` responde. Este proyecto sí expone `/health`, no una página de inicio.

## 4. Frontend en Vercel

1. Importa el mismo repositorio.
2. Establece **Root Directory** en `frontend`; Vercel detectará Next.js.
3. Agrega para Production, Preview y Development:

```text
NEXT_PUBLIC_API_URL=https://TU-BACKEND.up.railway.app
```

4. Despliega y después copia el dominio definitivo a `CORS_ORIGIN` en Railway. Si cambias variables, vuelve a desplegar ambos servicios.

## 5. Expo/EAS

Desde `expo-app`:

```bash
npm ci
npx eas-cli login
npx eas-cli build:configure
```

Crea `EXPO_PUBLIC_API_URL=https://TU-BACKEND.up.railway.app` en los entornos development, preview y production de EAS. Después:

```bash
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform android
```

El perfil preview produce un APK instalable. El de producción está pensado para la tienda.

## 6. Prueba final

1. Abre `/health` y `/api` del backend.
2. Registra un cliente en la web e inicia sesión.
3. Convierte una cuenta separada en admin siguiendo `backend/README.md`.
4. Crea un producto con el token admin desde Swagger.
5. Añade el producto al carrito, crea un pedido y comprueba “Mis pedidos”.
6. Repite la sesión y el pedido desde Expo.

La pantalla de tarjeta es demostrativa: el proyecto no procesa pagos reales ni debe almacenar datos bancarios. Para pagos reales se necesita un proveedor como Stripe o Mercado Pago y validación del lado servidor.
