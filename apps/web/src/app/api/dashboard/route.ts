import { getAuthAdmin } from "@/lib/auth";
import { connectToDatabase, Order } from "@shruthi-boutique/database";
import { Order as IOrder } from "@shruthi-boutique/types";
import mongoose, { FilterQuery } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await connectToDatabase();
  const auth = await getAuthAdmin();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  let storeId = searchParams.get("storeId");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  try {
    const matchConditions: FilterQuery<IOrder> = {};

    // RBAC: Non-superadmins are restricted to their assigned store
    if (!auth.superAdmin) {
      if (!auth.store) {
        return NextResponse.json({ error: "Admin not assigned to a store" }, { status: 403 });
      }
      storeId = auth.store;
    }

    if (storeId && storeId !== "all" && mongoose.Types.ObjectId.isValid(storeId)) {
      matchConditions.store = new mongoose.Types.ObjectId(storeId);
    }

    // Stats Date Range match (applied only to summary stats)
    const statsMatch: FilterQuery<IOrder> = { ...matchConditions };
    if (fromDate || toDate) {
      statsMatch.createdAt = {};
      if (fromDate) statsMatch.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const d = new Date(toDate);
        d.setHours(23, 59, 59, 999);
        statsMatch.createdAt.$lte = d;
      }
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfUpcoming = new Date(startOfToday);
    endOfUpcoming.setDate(startOfToday.getDate() + 3);
    endOfUpcoming.setHours(23, 59, 59, 999);

    const results = await Order.aggregate([
      {
        $facet: {
          totalIncome: [
            { $match: statsMatch },
            { $group: { _id: null, total: { $sum: "$price" } } }
          ],
          totalOrders: [
            { $match: statsMatch },
            { $count: "count" }
          ],
          totalDeliveries: [
            { $match: { ...statsMatch, status: 'delivered' } },
            { $count: "count" }
          ],
          pendingAmount: [
            { $match: { ...statsMatch, status: { $ne: 'delivered' } } },
            { $group: { _id: null, total: { $sum: { $subtract: ["$price", "$advance"] } } } }
          ],
          pendingDeliveriesCount: [
            { $match: { ...matchConditions, status: { $ne: 'delivered' } } },
            { $count: "count" }
          ],
          overDueCount: [
            { 
              $match: { 
                ...matchConditions,
                status: { $ne: 'delivered' }, 
                deliveryDate: { $lt: startOfToday } 
              } 
            },
            { $count: "count" }
          ],
          upcomingDeliveries: [
            {
              $match: {
                ...matchConditions,
                status: { $ne: 'delivered' },
                deliveryDate: { $gte: startOfToday, $lte: endOfUpcoming }
              }
            },
            { $sort: { deliveryDate: 1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "customers",
                localField: "customer",
                foreignField: "_id",
                as: "customerInfo"
              }
            },
            { $unwind: "$customerInfo" }
          ],
          overdueDeliveries: [
            {
              $match: {
                ...matchConditions,
                status: { $ne: 'delivered' },
                deliveryDate: { $lt: startOfToday }
              }
            },
            { $sort: { deliveryDate: 1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "customers",
                localField: "customer",
                foreignField: "_id",
                as: "customerInfo"
              }
            },
            { $unwind: "$customerInfo" }
          ]
        }
      }
    ]);

    const data = results[0];

    return NextResponse.json({
      totalIncome: data.totalIncome[0]?.total || 0,
      totalOrders: data.totalOrders[0]?.count || 0,
      totalDeliveries: data.totalDeliveries[0]?.count || 0,
      pendingAmount: data.pendingAmount[0]?.total || 0,
      pendingDeliveries: data.pendingDeliveriesCount[0]?.count || 0,
      overDue: data.overDueCount[0]?.count || 0,
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
