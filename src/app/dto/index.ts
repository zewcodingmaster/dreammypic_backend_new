import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GeneratePulidImageDto {
  @IsString()
  @IsNotEmpty({ message: "Prompt is required." })
  prompt!: string;
}

export class GeneratePaymentOrderRequest {
  @IsInt()
  @IsNotEmpty({ message: "Amount is required." })
  amount!: number;
}
