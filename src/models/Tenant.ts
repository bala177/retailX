import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  domain: string;
  subdomain: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  description?: string;
  category: 'clothing' | 'grocery' | 'cosmetics' | 'electronics' | 'general';
  status: 'active' | 'inactive' | 'suspended';
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentConfig?: {
    stripeKey?: string;
    paypalEmail?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
    },
    primaryColor: {
      type: String,
      default: '#007bff',
    },
    secondaryColor: {
      type: String,
      default: '#6c757d',
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['clothing', 'grocery', 'cosmetics', 'electronics', 'general'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    paymentConfig: {
      stripeKey: String,
      paypalEmail: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
TenantSchema.index({ subdomain: 1 });
TenantSchema.index({ domain: 1 });

export default mongoose.model<ITenant>('Tenant', TenantSchema);
