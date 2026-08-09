import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/products.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument, OrderItem } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(userEmail: string, dto: CreateOrderDto) {
    const ids = [...new Set(dto.items.map((item) => item.productId))];
    const products = await this.productModel.find({ _id: { $in: ids } }).exec();
    if (products.length !== ids.length)
      throw new BadRequestException('Uno o más productos no existen');

    const byId = new Map(products.map((product) => [product.id, product]));
    const items: OrderItem[] = dto.items.map((requested) => {
      const product = byId.get(requested.productId);
      if (!product) throw new BadRequestException('Producto no encontrado');
      if (
        requested.tipologia &&
        !product.tipologia.includes(requested.tipologia)
      ) {
        throw new BadRequestException(
          `Tipología inválida para ${product.name}`,
        );
      }
      return {
        productId: new Types.ObjectId(product.id),
        name: product.name,
        unitPrice: product.price,
        quantity: requested.quantity,
        tipologia: requested.tipologia ?? '',
        subtotal: product.price * requested.quantity,
      };
    });
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    return this.orderModel.create({ userEmail, items, total });
  }

  findMine(userEmail: string) {
    return this.orderModel
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  findAll() {
    return this.orderModel.find().sort({ createdAt: -1 }).lean().exec();
  }
}
