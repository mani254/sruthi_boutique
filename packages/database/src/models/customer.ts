import { Customer as ICustomer } from "@shruthi-boutique/types";
import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema<ICustomer>({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

customerSchema.index({ name: 1 });
customerSchema.index({ number: 1 });

export const Customer = mongoose.models.Customers || mongoose.model('Customers', customerSchema, 'Customers');
