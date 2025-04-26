import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'List of items',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: 'Total number of items',
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    type: Number,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    type: Number,
  })
  totalPages: number;
}
