import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AuthUser } from './auth-user.interface';

interface TokenPayload extends AuthUser {
  exp: number;
  iat: number;
}

@Injectable()
export class TokenService {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret = configService.getOrThrow<string>('JWT_SECRET');
  }

  sign(user: AuthUser): string {
    const now = Math.floor(Date.now() / 1000);
    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const payload = this.encode({ ...user, iat: now, exp: now + 86400 });
    return `${header}.${payload}.${this.signature(`${header}.${payload}`)}`;
  }

  verify(token: string): AuthUser {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature)
      throw new UnauthorizedException('Token inválido');
    const expected = Buffer.from(this.signature(`${header}.${payload}`));
    const received = Buffer.from(signature);
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new UnauthorizedException('Token inválido');
    }
    try {
      const parsed = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as TokenPayload;
      if (parsed.exp <= Math.floor(Date.now() / 1000))
        throw new UnauthorizedException('Token vencido');
      return { sub: parsed.sub, email: parsed.email, role: parsed.role };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Token inválido');
    }
  }

  private encode(value: object): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private signature(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }
}
