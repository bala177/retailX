import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  category: string;
  subcategory?: string;
  images: string[];
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
  };
  attributes?: {
    key: string;
    value: string;
  }[];
  variants?: {
    name: string;
    options: string[];
    price?: number;
    sku?: string;
    inventory?: number;
  }[];
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    inventory: {
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
      trackInventory: {
        type: Boolean,
        default: true,
      },
    },
    attributes: [
      {
        key: String,
        value: String,
      },
    ],
    variants: [
      {
        name: String,
        options: [String],
        price: Number,
        sku: String,
        inventory: Number,
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant-specific queries
ProductSchema.index({ tenantId: 1, status: 1 });
ProductSchema.index({ tenantId: 1, category: 1 });
ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
