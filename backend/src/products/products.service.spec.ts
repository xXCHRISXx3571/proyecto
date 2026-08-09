import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const model = {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };
  const service = new ProductsService(model as never);

  beforeEach(() => jest.clearAllMocks());

  it('devuelve un producto existente', async () => {
    model.findById.mockResolvedValue({ id: 'product-1', name: 'Café' });
    await expect(service.findOne('product-1')).resolves.toMatchObject({
      name: 'Café',
    });
  });

  it('responde 404 cuando el producto no existe', async () => {
    model.findById.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
