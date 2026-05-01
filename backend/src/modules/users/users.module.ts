import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaUserRepository } from '../repositories/implementations/prisma-user.repository';
import { IUserRepository } from '../repositories/interfaces/i-user.repository';

@Module({
  providers: [
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
    UsersService,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}