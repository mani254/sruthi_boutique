import { Category, connectToDatabase } from "@shruthi-boutique/database";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  try {
    const categories = await Category.find({}).lean();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Could not fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connectToDatabase();
  try {
    const { name, status } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newCategory = new Category({ name, status: status ?? true });
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not add category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await connectToDatabase();
  try {
    const { id, name, status } = await request.json();
    const category = await Category.findByIdAndUpdate(id, { name, status }, { new: true });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Could not update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  try {
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Could not delete category" }, { status: 500 });
  }
}
