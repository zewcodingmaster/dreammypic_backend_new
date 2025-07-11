import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

function handlePrismaErrors(error: PrismaClientKnownRequestError) {
  // console.log("Prisma error handler invoked");
  switch (error?.code) {
    case "P2025":
      throw new NotFoundException();
    case "P2002":
      throw new ConflictException();
    case "P2014":
      throw new ConflictException(error?.meta?.relation_name);
    default:
      console.log(error);
      throw new InternalServerErrorException();
  }
}

export function handleException(error: any) {
  if (error?.status) {
    // console.log("Known exception with status");
    throw error;
  } else if (error?.code?.startsWith("P")) {
    handlePrismaErrors(error);
  } else {
    console.log(error);
    throw new InternalServerErrorException();
  }
}
