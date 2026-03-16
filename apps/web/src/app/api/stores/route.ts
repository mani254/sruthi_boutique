import { connectToDatabase, Store } from "@shruthi-boutique/database";
import { NextResponse } from "next/server";
import { isAdminSuperAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await isAdminSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Superadmin access required." }, { status: 403 });
  }

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  try {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const stores = await Store.find(query).lean();
    return NextResponse.json(stores);
  } catch {
    return NextResponse.json({ error: "Could not fetch stores" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Superadmin access required." }, { status: 403 });
  }

  await connectToDatabase();
  try {
    const body = await request.json();
    const newStore = new Store(body);
    await newStore.save();
    return NextResponse.json(newStore, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not add store";
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
    const { _id, ...updateData } = body;
    
    if (!_id) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    const updatedStore = await Store.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!updatedStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStore);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not update store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
