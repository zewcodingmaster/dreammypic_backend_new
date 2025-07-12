import {
  Controller,
  Post,
  Body,
  HttpCode,
  Sse,
  type MessageEvent,
  Inject,
  Param,
} from "@nestjs/common";
import { Public } from "src/decorator/Public";
import { filter, map, Observable, Subject } from "rxjs";
import { constants } from "src/utils/const";
import { S3 } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";
import { RunpodResponseType } from "src/interface";
import { handleException } from "src/utils/errorHandler";

@Controller()
export class WebhookController {
  constructor(
    @Inject("S3") private readonly s3: S3, // delete this after words
    private readonly prisma: PrismaService,
  ) { }

  private runpodPayloadSubject = new Subject<{
    userId: string | null;
    image_url: string;
  }>();

  // private anyPayloadSubject = new Subject<{
  //   userId: string;
  //   image_url: string;
  // }>();

  @Public()
  @Post("runpod/webhook")
  @HttpCode(200)
  async handleWebhookRunpod(@Body() payload: RunpodResponseType) {
    try {
      // console.log("runpod item received");

      const buffer = Buffer.from(payload.output.output, "base64");

      const randomId = randomUUID();

      const data = await this.s3.putObject({
        Bucket: "dreammypic",
        Key: `${randomId}.png`,
        Body: buffer,
      });

      const imageUrl = `https://readmylove-development.s3.ap-south-1.amazonaws.com/${randomId}.png`;

      const userInfo = await this.prisma.userImageGenerationRequestLogs.update({
        where: {
          runpodRequestId: payload.id,
        },
        data: {
          generationStatus: "COMPLETED",
          imageUrl,
          user: {
            update: {
              currentAccountBalance: {
                decrement: constants.imageGenerationrateRate,
              },
            },
          },
        },
        select: {
          userOtplessUserId: true,
        },
      });

      this.runpodPayloadSubject.next({
        userId: userInfo?.userOtplessUserId,
        image_url: imageUrl,
      });

      return constants.ok_response;
    } catch (error) {
      handleException(error);
    }
  }

  @Public()
  @Post("test/webhook")
  handleHook(@Body() payload: { text: string }) {

    if (payload.text) {
      return {
        message: "Webhook received successfully",
        data: payload.text,
      }
    } else {
      return {
        message: "No text provided in the webhook payload",
      }
    }

  }
  // @Public()
  // @Post("webhook")
  // @HttpCode(200)
  // async handleWebhook(@Body() payload: { text: string }) {
  //   try {
  //     console.log("Received webhook");

  //     const buffer = Buffer.from(payload.text, "base64");

  //     const randomId = randomUUID();

  //     const data = await this.s3.putObject({
  //       Bucket: "dreammypic",
  //       Key: `${randomId}.png`,
  //       Body: buffer,
  //     });

  //     this.anyPayloadSubject.next({
  //       image_url: `https://dreammypic.s3.ap-south-1.amazonaws.com/${randomId}.png`,
  //       userId: "MO-3002e81953c0416b8a45690e3038b395",
  //     });

  //     return constants.ok_response;
  //   } catch (error) {
  //     handleException(error);
  //   }
  // }

  // @Public()
  // @Sse("test")
  // sseTest(): Observable<MessageEvent> {
  //   return this.anyPayloadSubject
  //     .asObservable()
  //     .pipe(map((data) => ({ data: data })));

  //   // return interval(5000).pipe(
  //   //   map((_) => ({ data: { hello: "world", time: new Date().toString() } })),
  //   // );
  // }
  // @Public()
  // @Sse("test2/:id")
  // sseTest2(@Param() param: { id: string }): Observable<MessageEvent> | void {
  //   try {
  //     // if (!param?.id) throw new ForbiddenException();

  //     return this.anyPayloadSubject.asObservable().pipe(
  //       filter((data) => data.userId === param.id),
  //       map((data) => ({ data: data.image_url })),
  //     );

  //     // return interval(5000).pipe(
  //     //   map((_) => ({ data: { hello: param, time: new Date().toString() } })),
  //     // );
  //   } catch (error) {
  //     handleException(error);
  //   }
  // }

  @Public()
  @Sse("sse/:id")
  sse(@Param() param: { id: string }): Observable<MessageEvent> {
    return this.runpodPayloadSubject.asObservable().pipe(
      filter((data) => data.userId === param.id),
      map((data) => ({ data: data.image_url })),
    );
  }

  @Public()
  @Post("payment/webhook")
  @HttpCode(200)
  async handlePaymentWebhook(
    @Body() payload: any,
    // @Headers("x-razorpay-signature") header: any,
  ) {
    try {
      // const paymentLog = await this.prisma.userPaymendLogs.create({
      //   data:{

      //   }
      // })

      // console.log(payload);
      // console.log(payload?.payload?.payment?.entity);

      // console.log(header);
      // const payment_secret = "VhjraNG5PnV@yFW";

      const razorPayOrderId = payload?.payload?.payment?.entity?.order_id;
      const razorPayPaymentId = payload?.payload?.payment?.entity?.id;

      // console.log(razorPayOrderId, razorPayPaymentId);

      const paymentLogUpdateResult = await this.prisma.userPaymendLogs.update({
        where: {
          orderId: razorPayOrderId,
          paymentId: undefined,
        },
        data: {
          paymentId: razorPayPaymentId,
        },
      });

      await this.prisma.user.update({
        where: {
          id: paymentLogUpdateResult.userId,
        },
        data: {
          currentAccountBalance: {
            increment: paymentLogUpdateResult.amount,
          },
        },
      });

      // const orderId_plus_paymentId = payload?.payload?.payment?.entity.

      return constants.ok_response;
    } catch (error) {
      handleException(error);
    }
  }
}
