import { Module } from "@nestjs/common";
import { HomeModule } from "./app/home.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { WebhookModule } from "./event/event.module";

@Module({
  imports: [HomeModule, PrismaModule, AuthModule, WebhookModule],
})
export class AppModule {}
