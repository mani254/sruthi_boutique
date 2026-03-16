import { NextResponse } from "next/server";
import { connectToDatabase, Admin } from "@shruthi-boutique/database";
import { isAdminSuperAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await isAdminSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Superadmin access required." }, { status: 403 });
  }

  await connectToDatabase();
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const admins = await Admin.find(query)
      .populate("store")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalAdminsCount = await Admin.countDocuments(query);

    return NextResponse.json({ admins, totalAdminsCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not fetch admins";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Superadmin access required." }, { status: 403 });
  }

  await connectToDatabase();
  try {
    const body = await request.json();
    const { username, email, password, superAdmin, store } = body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin with this email already exists" }, { status: 400 });
    }

    const newAdmin = new Admin({
      username,
      email,
      password,
      superAdmin: !!superAdmin,
      store: store || undefined,
    });

    await newAdmin.save();
    return NextResponse.json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not create admin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Superadmin access required." }, { status: 403 });
  }

  await connectToDatabase();
  try {
    const body = await request.json();
    const { _id, username, email, password, superAdmin, store } = body;

    if (!_id) return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });

    const updateData: any = {
      username,
      email,
      superAdmin: !!superAdmin,
      store: store || undefined,
    };

    if (password) {
      updateData.password = password;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updatedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not update admin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Superadmin access required." }, { status: 403 });
  }

  await connectToDatabase();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });

    await Admin.findByIdAndDelete(id);
    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not delete admin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
