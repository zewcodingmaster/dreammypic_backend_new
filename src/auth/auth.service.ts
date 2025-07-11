import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { revokeUserSession } from "./dto";
import { constants } from "src/utils/const";
import { handleException } from "src/utils/errorHandler";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userInfo: {
    email: string | null;
    phoneNumber: string | null;
    otplessUserId: string;
  }) {
    const { email, otplessUserId, phoneNumber } = userInfo;
    try {
      const data = await this.prisma.user.create({
        data: {
          otplessUserId,
          email,
          phoneNumber,
        },
      });

      return data;
    } catch (error) {
      handleException(error);
    }
  }

  async getUserInfo(otplessUserId: string) {
    try {
      const data = await this.prisma.user.findUnique({
        where: {
          otplessUserId,
        },
      });

      return data;
    } catch (error) {
      handleException(error);
    }
  }

  async revokeUserSession(dto: revokeUserSession) {
    try {
      const response = await fetch(
        "https://user-auth.otpless.app/v1/sessions/revoke-session",
        {
          headers: {
            "Content-Type": "application/json",
            clientId: constants.clientId,
            clientSecret: constants.clientSecret,
          },

          body: JSON.stringify({
            sessionToken: dto.sessionToken,
          }),
          method: "post",
        },
      );

      if (!response.ok) {
        if (response.status === 401) return constants.ok_response;
        else throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return constants.ok_response;
    } catch (error) {
      handleException(error);
    }
  }
}
