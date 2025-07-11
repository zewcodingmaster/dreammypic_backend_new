import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { GeneratePaymentOrderRequest, GeneratePulidImageDto } from "./dto";
import { PaymentOrderInterface, UploadedImages } from "./entities/home.entity";
import { constants } from "src/utils/const";
import { Runpod_Image_generation_request_response } from "src/interface";
import { PrismaService } from "src/prisma/prisma.service";
import { GetUserInfoFromRequest } from "src/interface/GetUser";
import { handleException } from "src/utils/errorHandler";
const Razorpay = require("razorpay");

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    // @Inject("Rpay") private readonly razorpay: Razorpay,
  ) {}
  async generateImageRequest(
    dto: GeneratePulidImageDto,
    images: UploadedImages,
    userInfo: GetUserInfoFromRequest,
  ) {
    const { prompt } = dto;
    const { image1, image2, image3, image4 } = images;

    if (!image1?.[0]) throw new NotFoundException("Image file is required");

    let numberofImageGenerations: number = 0;

    const isImage1IsValidFile = this.validateImageFile(image1[0]);
    const isImage2IsValidFile = this.validateImageFile(image2?.[0]);
    const isImage3IsValidFile = this.validateImageFile(image3?.[0]);
    const isImage4IsValidFile = this.validateImageFile(image4?.[0]);

    if (isImage1IsValidFile) numberofImageGenerations++;

    const isBalanceIsSufficient = this.checkUserBalance(
      userInfo.currentAccountBalance!,
      numberofImageGenerations,
    );

    if (!isBalanceIsSufficient)
      throw new ForbiddenException("In sufficient balance");

    try {
      const isAnyPendingRequest =
        await this.checkForAnyPendingRequestWithInOneMinute(userInfo);

      if (isAnyPendingRequest)
        throw new ConflictException("Process is already pending");

      const data = await this.sendRunpodImageGenerationRequest(
        prompt,
        image1[0].buffer.toString("base64"),
      );
      if (constants.isDevelopment) console.log(data);

      // const userLogData =
      await this.prisma.userImageGenerationRequestLogs.create({
        data: {
          generationStatus: "PENDING",
          runpodRequestId: data.id,
          userOtplessUserId: userInfo.otplessUserId,
          userId: userInfo.id,
        },
      });

      if (data.id) return data;
      else throw Error(JSON.stringify(data) ?? data);
    } catch (error) {
      handleException(error);
    }
  }

  private async sendRunpodImageGenerationRequest(
    prompt: string,
    image1: string,
  ) {
    const response = await fetch(constants.runpod_api_run!, {
      method: "POST",
      body: JSON.stringify({
        input: {
          prompt,
          image1,
        },
        webhook: constants.isDevelopment
          ? constants.development_runpod_webhook
          : constants.production_runpod_webhook,
      }),
      headers: {
        Authorization: constants.runpod_secret_key!,
        "Content-Type": "application/json", // Specify JSON format
      },
    }); // Make the GET request
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data: Runpod_Image_generation_request_response =
      await response.json(); // Parse JSON response

    return data;
  }

  private validateImageFile(imageFile: Express.Multer.File | undefined) {
    if (imageFile) {
      const imageMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ];

      if (!imageMimeTypes.includes(imageFile.mimetype)) {
        throw new UnprocessableEntityException(
          "Invalid file type. Only JPEG and PNG are allowed.",
        );
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new PayloadTooLargeException(
          "File size is too large. Max size is 5MB.",
        );
      }

      return true;
    } else return false;
  }

  private checkUserBalance(
    currentBalance: number,
    numberofImageGeneration: number,
  ) {
    if (numberofImageGeneration === 1 && currentBalance) {
      return currentBalance >= constants.imageGenerationrateRate;
    } else if (numberofImageGeneration > 1 && currentBalance) {
      return (
        currentBalance >=
        constants.imageGenerationrateRate +
          (constants.additionalImageGeneration * numberofImageGeneration - 1)
      );
    } else
      throw new Error(
        "Please provide currentBalance and numberOfImageGeneration",
      );
  }

  async userLogs(userInfo: GetUserInfoFromRequest) {
    try {
      const userLogs = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: userInfo.id,
        },
        select: {
          UserImageGenerationRequestLogs: {
            orderBy: {
              requestedAt: "desc",
            },
          },
        },
      });
      return userLogs.UserImageGenerationRequestLogs;
    } catch (error) {
      handleException(error);
    }
  }

  async paymentRequest(
    body: GeneratePaymentOrderRequest,
    userInfo: GetUserInfoFromRequest,
  ) {
    // console.log(body);

    // var instance = new Razorpay({
    //   key_id: constants.razorpay_key_id,
    //   key_secret: constants.razorpay_key_secret,
    // });

    try {
      const { amount } = body;

      // const options = {
      //   amount: amount * 100, // Convert amount to paise
      //   currency,
      //   receipt,
      //   notes,
      // };

      const orderInfo: PaymentOrderInterface =
        await constants.razorpay.orders.create({
          amount: amount * 100, // convert amount to paise
          currency: "INR",
          // receipt: "receipt#1",
          partial_payment: false,
          // notes: {
          //   key1: "value3",
          //   key2: "value2",
          // },
        });

      await this.prisma.userPaymendLogs.create({
        data: {
          amount: amount,
          createdAt: new Date(orderInfo.created_at * 1000),
          orderId: orderInfo.id,
          userId: userInfo.id,
        },
      });

      // const order =
      // Read current orders, add new order, and write back to the file

      return orderInfo;
    } catch (error) {
      handleException(error);
    }
  }

  async getUserInfo(userInfo: GetUserInfoFromRequest) {
    try {
      const data = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: userInfo.id,
        },
        select: {
          email: true,
          phoneNumber: true,
          currentAccountBalance: true,
        },
      });

      return data;
    } catch (error) {
      handleException(error);
    }
  }

  private async checkForAnyPendingRequestWithInOneMinute(
    userInfo: GetUserInfoFromRequest,
  ) {
    const oneMinuteAgo = new Date(Date.now() - 60000); // Calculate the timestamp for 1 minute ago

    const pendingRequest =
      await this.prisma.userImageGenerationRequestLogs.findFirst({
        where: {
          userId: userInfo.id,
          generationStatus: "PENDING",
          requestedAt: { gte: oneMinuteAgo },
        },
      });

    if (pendingRequest) return true;
    else return false;
  }
}
