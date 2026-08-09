import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const orderModel = { create: jest.fn(), find: jest.fn() };
  const productModel = { find: jest.fn() };
  const service = new OrdersService(orderModel as never, productModel as never);

  beforeEach(() => jest.clearAllMocks());

  it('calcula el total usando precios de la base de datos', async () => {
    productModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Café',
          price: 12000,
          tipologia: ['molido'],
        },
      ]),
    });
    orderModel.create.mockImplementation((value: unknown) =>
      Promise.resolve(value),
    );

    const result = await service.create('cliente@example.com', {
      items: [
        {
          productId: '507f1f77bcf86cd799439011',
          quantity: 2,
          tipologia: 'molido',
        },
      ],
    });

    expect(result).toMatchObject({
      userEmail: 'cliente@example.com',
      total: 24000,
    });
    expect(orderModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ total: 24000 }),
    );
  });

  it('rechaza productos inexistentes', async () => {
    productModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    await expect(
      service.create('cliente@example.com', {
        items: [{ productId: '507f1f77bcf86cd799439011', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
