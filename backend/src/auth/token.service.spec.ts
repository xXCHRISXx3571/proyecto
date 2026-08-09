import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

describe('TokenService', () => {
  const config = {
    getOrThrow: jest.fn(() => 'a-development-secret-with-32-characters'),
  } as unknown as ConfigService;
  const service = new TokenService(config);

  it('firma y verifica la identidad del usuario', () => {
    const user = {
      sub: 'user-1',
      email: 'cliente@example.com',
      role: 'customer' as const,
    };
    expect(service.verify(service.sign(user))).toEqual(user);
  });

  it('rechaza tokens manipulados', () => {
    const token = service.sign({
      sub: 'user-1',
      email: 'cliente@example.com',
      role: 'customer',
    });
    expect(() => service.verify(`${token.slice(0, -1)}x`)).toThrow(
      UnauthorizedException,
    );
  });
});
