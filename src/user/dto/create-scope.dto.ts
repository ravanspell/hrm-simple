import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateScopeDto {
    /**
     * The name of the scope.
     * 
     * @example "create_user"
     */
    @ApiProperty({
        description: 'The name of the scope',
        example: 'create_user',
    })
    @IsString()
    name: string;

    /**
     * An optional description of the scope.
     * 
     * @example "Allows creating new users"
     */
    @ApiProperty({
        description: 'Optional description of the scope',
        example: 'Allows creating new users',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    /**
     * The ID of the category to which the scope belongs.
     * 
     * @example "uuid-category-id"
     */
    @ApiProperty({
        description: 'The ID of the category to which the scope belongs',
        example: 'uuid-category-id',
    })
    @IsString()
    categoryId: string;
}