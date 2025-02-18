import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'The updated list of role IDs for the user.',
    type: [String],
    example: ['roleId1', 'roleId2'],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  roleIds: string[];
}
