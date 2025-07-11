import { Module } from "@nestjs/common";
import { WebhookController } from "./event.controller";
import { S3Provider } from "./entities/webhook.entity";

@Module({
  controllers: [WebhookController],
  providers: [S3Provider],
})
export class WebhookModule {}
