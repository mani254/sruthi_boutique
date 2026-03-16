import { NextResponse } from "next/server";
import { connectToDatabase, Admin } from "@shruthi-boutique/database";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Safety check: Only allow creation if no admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Setup already completed. An admin already exists." },
        { status: 403 }
      );
    }

    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    const newAdmin = new Admin({
      username,
      email,
      password,
      superAdmin: true,
    });

    await newAdmin.save();

    return NextResponse.json(
      { message: "Super Admin created successfully. Please delete this setup route immediately." },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Setup Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
