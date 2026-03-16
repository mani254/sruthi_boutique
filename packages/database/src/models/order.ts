import { Order as IOrder } from "@shruthi-boutique/types";
import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema({
  id: String,
  name: String,
  quantity: Number,
  price: Number,
  category: String,
});

const orderSchema = new Schema<IOrder>({
  price: {
    type: Number,
  },
  invoice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  orderDate: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  deliveryDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['booked', 'under MW', 'under stitching', 'finishing work', 'pending', 'delivered'],
    default: 'booked',
  },
  advance: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
  },
  items: {
    type: [orderItemSchema],
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customers',
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Stores',
  },
  timeline: [{
    statusFrom: String,
    statusTo: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

orderSchema.index({ status: 1 });
orderSchema.index({ deliveryDate: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ store: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.models.Orders || mongoose.model('Orders', orderSchema, 'orders');
