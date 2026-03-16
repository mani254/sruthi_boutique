import mongoose, { Schema } from "mongoose";
import { Category as ICategory } from "@shruthi-boutique/types";

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export const Category = mongoose.models.Categories || mongoose.model('Categories', categorySchema, 'categories');
