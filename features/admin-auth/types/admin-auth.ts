export type AdminRole = "ADMIN_NATIONAL" | "CHARGE_COMMUNICATION" | "MODERATEUR";

export interface AdminLoginResponse {
  id: string;
  email: string;
  fullname: string;
  phone: string | null;
  avatar: string | null;
  type: "admin";
  role: AdminRole;
  capabilities: string[];
  permissions: { modules: Record<string, string[]> };
  token: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

export type AdminUser = Omit<AdminLoginResponse, "token" | "refreshToken">;

export interface AdminSession {
  id: string;
  type: "admin";
  role: AdminRole;
  email: string;
  fullname: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
}
