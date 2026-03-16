export interface BaseEntity {
  _id?: string;
  id?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Store extends BaseEntity {
  name: string;
  image: string;
  properator: string;
  phone: number;
  landLine: number;
  address: string;
  status: boolean;
}

export interface Category extends BaseEntity {
  name: string;
  status: boolean;
}

export type OrderStatus = 'booked' | 'under MW' | 'under stitching' | 'finishing work' | 'pending' | 'delivered';
export interface TimelineEntry {
  statusFrom?: OrderStatus | string;
  statusTo: OrderStatus | string;
  message: string;
  timestamp: Date | string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  sTotal?: number;
}

export interface Order extends BaseEntity {
  price?: number;
  discount?: number;
  invoice: number;
  orderDate: Date | string;
  deliveryDate?: Date | string;
  status: OrderStatus;
  advance: number;
  note?: string;
  items: OrderItem[];
  customer: string | Customer;
  store: string | Store;
  timeline?: TimelineEntry[];
}

export interface Customer extends BaseEntity {
  number: string;
  name: string;
}

export interface Admin extends BaseEntity {
  username: string;
  email: string;
  password?: string; // Optional because we don't always want to send it to the frontend
  superAdmin: boolean;
  store?: string | Store;
  otp?: number;
}
