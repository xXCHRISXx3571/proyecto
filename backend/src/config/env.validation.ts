interface Environment {
  MONGO_URI: string;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
  PORT?: string;
  NODE_ENV?: string;
}

export function validateEnvironment(
  values: Record<string, unknown>,
): Environment {
  const readString = (key: string): string =>
    typeof values[key] === 'string' ? values[key].trim() : '';
  const mongoUri = readString('MONGO_URI');
  const jwtSecret = readString('JWT_SECRET');

  if (
    !mongoUri.startsWith('mongodb://') &&
    !mongoUri.startsWith('mongodb+srv://')
  ) {
    throw new Error('MONGO_URI debe ser una URL de MongoDB válida');
  }
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }

  return {
    ...values,
    MONGO_URI: mongoUri,
    JWT_SECRET: jwtSecret,
    CORS_ORIGIN: readString('CORS_ORIGIN') || undefined,
    PORT: readString('PORT') || undefined,
    NODE_ENV: readString('NODE_ENV') || undefined,
  };
}
