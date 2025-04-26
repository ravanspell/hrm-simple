import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignUserRolesDto {
  @ApiProperty({
    description: 'Array of role IDs to assign to the user',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}
