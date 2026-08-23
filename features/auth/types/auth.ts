export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullname: string;
  phone?: string | null;
  role: string;
  permissions: string[];
}

export type AuthResponse = AuthTokens & AuthUser;

export interface OtpSentResponse {
  message: string;
  email: string;
}
