import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "secret";

interface JWTPayload {
  adminId: string;
  superAdmin: boolean;
  store?: string;
  iat: number;
  exp: number;
}

export async function isAdminSuperAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    return decoded.superAdmin === true;
  } catch {
    console.error("Auth verification error");
    return false;
  }
}

export async function getAuthAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
