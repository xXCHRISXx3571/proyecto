import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../auth/token.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const tokenService = {
    sign: jest.fn(() => 'signed-token'),
  } as unknown as TokenService;
  const model = { exists: jest.fn(), create: jest.fn(), findOne: jest.fn() };
  const service = new UsersService(model as never, tokenService);

  beforeEach(() => jest.clearAllMocks());

  it('rechaza correos duplicados', async () => {
    model.exists.mockResolvedValue({ _id: 'existing' });
    await expect(
      service.register({ email: 'a@b.com', password: '12345678' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza credenciales desconocidas', async () => {
    model.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.login({ email: 'a@b.com', password: '12345678' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
