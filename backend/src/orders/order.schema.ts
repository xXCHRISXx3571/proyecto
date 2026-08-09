import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ default: '' })
  tipologia: string;

  @Prop({ required: true, min: 0 })
  subtotal: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, trim: true, lowercase: true, index: true })
  userEmail: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  total: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
