import { NextResponse } from "next/server";
import { getAuthAdmin } from "@/lib/auth";
import { connectToDatabase, Admin } from "@shruthi-boutique/database";

export async function GET() {
  const admin = await getAuthAdmin();
  
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const adminDetails = await Admin.findById(admin.adminId).populate('store').select("-password").lean();
    if (!adminDetails) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    return NextResponse.json(adminDetails);
  } catch {
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
