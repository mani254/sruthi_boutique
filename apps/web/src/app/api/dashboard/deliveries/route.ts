import { getAuthAdmin } from "@/lib/auth";
import { connectToDatabase, Order } from "@shruthi-boutique/database";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await connectToDatabase();

  const auth = await getAuthAdmin();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");

  try {
    const baseFilter: any = {
      status: { $ne: "delivered" }
    };

    // RBAC
    if (!auth.superAdmin) {
      if (!auth.store) {
        return NextResponse.json(
          { error: "Admin not assigned to a store" },
          { status: 403 }
        );
      }
      baseFilter.store = new mongoose.Types.ObjectId(auth.store);
    } else if (storeId && storeId !== "all" && mongoose.Types.ObjectId.isValid(storeId)) {
      baseFilter.store = new mongoose.Types.ObjectId(storeId);
    }

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfUpcoming = new Date(startOfToday);
    endOfUpcoming.setDate(startOfToday.getDate() + 3);
    endOfUpcoming.setHours(23, 59, 59, 999);

    const upcomingQuery = Order.find({
      ...baseFilter,
      deliveryDate: {
        $gte: startOfToday,
        $lte: endOfUpcoming
      }
    })
      .sort({ deliveryDate: 1 })
      .limit(10)
      .populate("customer")
      .lean();

    const overdueQuery = Order.find({
      ...baseFilter,
      deliveryDate: {
        $lt: startOfToday
      }
    })
      .sort({ deliveryDate: 1 })
      .limit(10)
      .populate("customer")
      .lean();

    const [upcomingDeliveries, overdueDeliveries] = await Promise.all([
      upcomingQuery,
      overdueQuery
    ]);

    return NextResponse.json({
      upcomingDeliveries,
      overdueDeliveries
    });

  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}