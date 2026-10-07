import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // Railway's edge is the one proxy in front of the API. Fastify ignores a numeric trustProxy, so the hop count is a function.
  const proxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 1);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: (_address: string, hop: number) => hop < proxyHops })
  );
  const config = app.get(ConfigService);
  const origins = config.getOrThrow<string>('CLIENT_ORIGIN')
    .split(',')
    .map((origin) => origin.trim());

  app.setGlobalPrefix('api');
  app.enableCors({ origin: origins });
  app.enableShutdownHooks();

  const port = config.getOrThrow<number>('PORT');
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
