export type Auth = {
  address: string;
  isLoggedIn: boolean;
  email?: string;
  phoneNumber?: string;
};

export type AuthType = "email" | "sms";
