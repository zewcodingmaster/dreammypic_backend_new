import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { constants } from "./utils/const";
import { type NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const PORT = constants.port;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.enableCors();

  if (constants.isDevelopment) app.setGlobalPrefix("api");

  app.useBodyParser("json", { limit: "10mb" });

  await app.listen(PORT, () =>
    console.log(`${constants.enviornment} Server listening on port ${PORT}`),
  );
}
bootstrap();
