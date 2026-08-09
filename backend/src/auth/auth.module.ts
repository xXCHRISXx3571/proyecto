import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { TokenService } from './token.service';

@Module({
  providers: [TokenService, AuthGuard, RolesGuard],
  exports: [TokenService, AuthGuard, RolesGuard],
})
export class AuthModule {}
