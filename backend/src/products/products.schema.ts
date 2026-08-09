import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '', trim: true })
  marca: string;

  @Prop({ default: '', trim: true })
  departamento: string;

  @Prop({ default: '', trim: true })
  sabores: string;

  @Prop({ type: [String], default: [] })
  tipologia: string[];

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ default: '' })
  historia: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
