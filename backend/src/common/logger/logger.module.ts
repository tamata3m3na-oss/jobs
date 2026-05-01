import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  levelFirst: true,
                  translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
                },
              }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
