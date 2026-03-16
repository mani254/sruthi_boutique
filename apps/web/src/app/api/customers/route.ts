import { NextResponse } from "next/server";
import { connectToDatabase, Customer } from "@shruthi-boutique/database";
import { isAdminSuperAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await isAdminSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Superadmin access required." }, { status: 403 });
  }

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  try {
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } }
      ]
    } : {};
    
    const [customers, totalCustomersCount] = await Promise.all([
      Customer.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Customer.countDocuments(query)
    ]);

    return NextResponse.json({ customers, totalCustomersCount });
  } catch {
    return NextResponse.json({ error: "Could not fetch customers" }, { status: 500 });
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
    if (!_id) return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });

    const updatedCustomer = await Customer.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(updatedCustomer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not update customer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
