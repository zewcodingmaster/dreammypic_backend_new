import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { SessionData } from "src/interface/otpless_responses";
import { PrismaService } from "src/prisma/prisma.service";

type GetUserInfoFromRequest = {
  userId: SessionData["userId"];
  identity: {
    identityType: "EMAIL" | "MOBILE";
    identityValue: SessionData["identities"][0]["identityValue"];
  }[];
};

export const GetUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const authService = new AuthService(new PrismaService());
    const userInfo = request.user as GetUserInfoFromRequest;

    const findUser = await authService.getUserInfo(userInfo.userId);

    if (findUser) return findUser;

    const userCreatedData = await authService.createUser({
      email:
        userInfo.identity[0].identityType === "EMAIL"
          ? userInfo.identity[0].identityValue
          : null,
      otplessUserId: userInfo.userId,
      phoneNumber:
        userInfo.identity[0].identityType === "MOBILE"
          ? userInfo.identity[0].identityValue
          : null,
    });

    return userCreatedData;
  },
);
