import { getAuthAdmin } from "@/lib/auth";
import { connectToDatabase, Customer, Order } from "@shruthi-boutique/database";
import { Order as IOrder, OrderItem } from "@shruthi-boutique/types";
import mongoose, { FilterQuery } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await connectToDatabase();
  const auth = await getAuthAdmin();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = parseInt(searchParams.get("skip") || "0");
  const status = searchParams.get("status");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const search = searchParams.get("search");
  let storeId = searchParams.get("storeId");
  const customerId = searchParams.get("customerId");

  try {
    const initialCriteria: FilterQuery<IOrder> = {};
    let afterLookupCriteria: FilterQuery<any> = {};

    // RBAC: Non-superadmins are restricted to their assigned store
    if (!auth.superAdmin) {
      if (!auth.store) {
        return NextResponse.json({ error: "Admin not assigned to a store" }, { status: 403 });
      }
      storeId = auth.store;
    }

    if (storeId && storeId !== "all" && storeId.trim() !== "" && mongoose.Types.ObjectId.isValid(storeId)) {
      initialCriteria.store = new mongoose.Types.ObjectId(storeId);
    }

    if (status && status !== "all" && status.trim() !== "") {
      initialCriteria.status = status;
    }

    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      initialCriteria.customer = new mongoose.Types.ObjectId(customerId);
    }

    if (fromDate || toDate) {
      let startDate, endDate;
      if (fromDate && !toDate) {
        startDate = new Date(fromDate);
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
      } else if (toDate && !fromDate) {
        startDate = new Date("2024-01-01");
        endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
      } else if (fromDate && toDate) {
        startDate = new Date(fromDate);
        endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
      }
      initialCriteria.deliveryDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (search) {
      afterLookupCriteria = {
        $or: [
          { "customer.name": { $regex: search, $options: "i" } },
          { "customer.number": { $regex: search, $options: "i" } },
          { $expr: { $regexMatch: { input: { $toString: "$invoice" }, regex: search, options: "i" } } }
        ],
      };
    }

    const results = await Order.aggregate([
      { $match: initialCriteria },
      {
        $lookup: {
          from: "Customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      { $match: afterLookupCriteria },
      {
        $facet: {
          metadata: [
            { $count: "total" }
          ],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]);

    const orders = results[0].data;
    const totalOrdersCount = results[0].metadata[0]?.total || 0;

    const formattedOrders = orders.map((order: IOrder & { items: OrderItem[] }) => ({
      ...order,
      categories: order.items.map((item) => item.category).join(", "),
    }));

    return NextResponse.json({
      message: "Orders fetched successfully",
      orders: formattedOrders,
      totalOrdersCount,
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connectToDatabase();
  const auth = await getAuthAdmin();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, price, discount, advance, deliveryDate, note, items, invoice } = body;
    let { storeId } = body;

    // RBAC: Store admins can only create orders for their store
    if (!auth.superAdmin) {
      if (!auth.store) {
        return NextResponse.json({ error: "Admin not assigned to a store" }, { status: 403 });
      }
      storeId = auth.store;
    }

    if (!name || !phone || !price || !deliveryDate || !items || !storeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return NextResponse.json({ error: "Invalid Store ID format" }, { status: 400 });
    }

    let customer = await Customer.findOne({ number: phone });

    if (!customer) {
      customer = new Customer({ name, number: phone });
      await customer.save();
    } else {
      customer.name = name;
      await customer.save();
    }

    const order = new Order({
      price: price,
      discount: discount || 0,
      deliveryDate: new Date(deliveryDate),
      advance: advance,
      note: note,
      customer: customer._id,
      items: items,
      store: new mongoose.Types.ObjectId(storeId),
      invoice: invoice,
      timeline: [{ statusTo: 'booked', message: 'Order created', timestamp: new Date() }]
    });

    await order.save();

    return NextResponse.json({ message: "Order created successfully", order }, { status: 201 });
  } catch (error) {
    console.error("Error adding order:", error);
    return NextResponse.json({ error: "Could not add order" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await connectToDatabase();
  const auth = await getAuthAdmin();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

    const existingOrder = await Order.findById(_id);
    if (!existingOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // RBAC: Store admins can only update their own store's orders
    if (!auth.superAdmin) {
      if (!auth.store || existingOrder.store.toString() !== auth.store) {
        return NextResponse.json({ error: "Unauthorized access to this order" }, { status: 403 });
      }
    }

    // Handle timeline if status changed
    if (updateData.status && updateData.status !== existingOrder.status) {
      existingOrder.timeline.push({
        statusFrom: existingOrder.status,
        statusTo: updateData.status,
        message: `Status updated to ${updateData.status}`,
        timestamp: new Date()
      });
    }

    // Apply other updates
    Object.assign(existingOrder, updateData);
    await existingOrder.save();

    return NextResponse.json({ message: "Order updated successfully", order: existingOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }
}
