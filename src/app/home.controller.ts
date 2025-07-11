import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  // Res,
} from "@nestjs/common";
import { HomeService } from "./home.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UploadedImages } from "./entities/home.entity";
import { GetUserInfoFromRequest } from "src/interface/GetUser";
import { GetUser } from "src/decorator/GetUser";
import { GeneratePaymentOrderRequest } from "./dto";
// import type { Response } from "express";

@Controller("home")
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Post("generate-image")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "image1", maxCount: 1 },
      { name: "image2", maxCount: 1 },
      { name: "image3", maxCount: 1 },
      { name: "image4", maxCount: 1 },
    ]),
  )
  async generateImageCreationRequest(
    @Body() dto: { prompt: string },
    @UploadedFiles()
    files: UploadedImages,
    // @Res() res: Response,
    @GetUser() userInfo: GetUserInfoFromRequest,
  ) {
    return this.homeService.generateImageRequest(dto, files, userInfo);
  }

  @Get("image-generation-logs")
  getImageGenerationLogs(@GetUser() userInfo: GetUserInfoFromRequest) {
    return this.homeService.userLogs(userInfo);
  }

  @Post("payment")
  paymentRequest(
    @Body() body: GeneratePaymentOrderRequest,
    @GetUser() userInfo: GetUserInfoFromRequest,
  ) {
    return this.homeService.paymentRequest(body, userInfo);
  }

  @Get("userinfo")
  getUserInfo(@GetUser() userInfo: GetUserInfoFromRequest) {
    return this.homeService.getUserInfo(userInfo);
  }

  // @Get("process")
  // checkForAnyPendingRequestWithInOneMinute(
  //   @GetUser() userInfo: GetUserInfoFromRequest,
  // ) {
  //   return this.homeService.checkForAnyPendingRequestWithInOneMinute(userInfo);
  // }
}
