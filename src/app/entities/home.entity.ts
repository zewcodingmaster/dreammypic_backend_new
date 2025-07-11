import { Provider } from "@nestjs/common";
import Razorpay from "razorpay";
import { constants } from "src/utils/const";

export interface UploadedImages {
  image1?: Express.Multer.File[];
  image2?: Express.Multer.File[];
  image3?: Express.Multer.File[];
  image4?: Express.Multer.File[];
}

// export const RazorpayProvider: Provider = {
//   provide: "RAZORPAY",
//   useFactory: () => {
//     return new Razorpay({
//       key_id: constants.razorpay_key_id,
//       key_secret: constants.razorpay_key_secret,
//     });
//   },
// };

export interface PaymentOrderInterface {
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: "INR";
  entity: "order";
  id: string;
  notes: [];
  offer_id: null;
  receipt: null;
  status: "created";
}
