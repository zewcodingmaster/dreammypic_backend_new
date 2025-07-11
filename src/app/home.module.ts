import { Module } from "@nestjs/common";
import { HomeService } from "./home.service";
import { HomeController } from "./home.controller";
// import { RazorpayProvider } from "./entities/home.entity";

@Module({
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
