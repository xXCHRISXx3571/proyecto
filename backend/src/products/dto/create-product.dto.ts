import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Cafe Premium' })
  @IsString()
  name: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'https://example.com/cafe.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 'Los 3 Pelagatos' })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional({ example: 'Huila' })
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional({ example: 'Chocolate, Citrico, Dulce' })
  @IsOptional()
  @IsString()
  sabores?: string;

  @ApiPropertyOptional({ example: ['grano', 'molido'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tipologia?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  historia?: string;
}
