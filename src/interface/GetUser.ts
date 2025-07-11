export interface GetUserInfoFromRequest {
  id: number;
  email: string | null;
  phoneNumber: string | null;
  currentAccountBalance: number | null;
  otplessUserId: string | null;
}

//   data.identities.map((identity) => ({
//     identityType: identity.identityType,
//     identityValue: identity.identityValue,
//   })),
