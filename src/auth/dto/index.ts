import { IsNotEmpty, IsString } from "class-validator";

export class revokeUserSession {
  @IsString()
  @IsNotEmpty()
  sessionToken!: string; // session token to be revoked.
}
