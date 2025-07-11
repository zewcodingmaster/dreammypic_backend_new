// import type { Response } from "express";

import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { revokeUserSession } from "./dto";
import { Public } from "src/decorator/Public";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("logout")
  logout(@Body() dto: revokeUserSession) {
    return this.authService.revokeUserSession(dto);
  }
}
