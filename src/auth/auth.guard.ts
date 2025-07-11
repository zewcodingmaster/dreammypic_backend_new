import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "src/decorator/Public";
import { SessionData } from "src/interface/otpless_responses";
import { constants } from "src/utils/const";
import { handleException } from "src/utils/errorHandler";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    // try {
    const payload = await this.getDataFromSessionToken(token);
    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers

    if (!payload) throw new UnauthorizedException();

    request["user"] = payload;
    // } catch {
    //   handleException(error);
    // }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const token = request.headers.authorization;

    return token;
  }

  private async getDataFromSessionToken(sessionToken: string) {
    try {
      // const response = await axios.post(
      //   "https://user-auth.otpless.app/v1/sessions/get-session-details",
      //   { sessionToken },
      //   {
      //     headers: {
      //       clientId: constants.clientId!,
      //       clientSecret: constants.clientSecret!,
      //     },
      //   },
      // );

      const response = await fetch(
        "https://user-auth.otpless.app/v1/sessions/get-session-details",
        {
          method: "POST",
          headers: {
            clientId: constants.clientId!,
            clientSecret: constants.clientSecret!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionToken,
          }),
        },
      );

      if (!response.ok) {
        return undefined;
      }

      const data: SessionData = await response.json();

      // console.log(data);

      return {
        userId: data.userId,
        identity: data.identities.map((identity) => ({
          identityType: identity.identityType,
          identityValue: identity.identityValue,
        })),
      };
    } catch (error) {
      handleException(error);
    }
  }
}
