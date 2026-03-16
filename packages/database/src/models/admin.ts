import { Admin as IAdmin } from "@shruthi-boutique/types";
import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 40,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v: string) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: (props: { value: string }) => `${props.value} is not a valid email address!`,
    },
  },
  superAdmin: {
    type: Boolean,
    default: false,
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: "Stores",
  },
  otp: {
    type: Number,
  },
}, { timestamps: true });

adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ store: 1 });

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password as string, salt);
    this.password = hashedPassword;
    return next();
  } catch (error: unknown) {
    return next(error as Error);
  }
});

adminSchema.pre("save", function (next) {
  if (this.isNew) {
    this.otp = Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

export const Admin = mongoose.models.Admins || mongoose.model('Admins', adminSchema, 'admins');
