import { NextResponse } from "next/server";
import { connectToDatabase, Admin } from "@shruthi-boutique/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "secret";

export async function POST(request: Request) {
  await connectToDatabase();
  try {
    const { email, password } = await request.json();

    const existingAdmin = await Admin.findOne({ email }).populate('store');

    if (!existingAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const details = { 
      username: existingAdmin.username, 
      _id: existingAdmin._id, 
      email: existingAdmin.email, 
      superAdmin: existingAdmin.superAdmin, 
      store: existingAdmin.store 
    };

    const token = jwt.sign(
      { 
        adminId: existingAdmin._id, 
        superAdmin: existingAdmin.superAdmin,
        store: existingAdmin.store?._id?.toString() || existingAdmin.store?.toString() 
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ 
      message: "Login successful", 
      token, 
      user: details 
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;

  } catch (error: unknown) {
    console.error("Error logging as Admin:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not log in Admin" }, 
      { status: 500 }
    );
  }
}
