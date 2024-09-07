import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeLeafDto } from './create-employee-leaf.dto';

export class UpdateEmployeeLeafDto extends PartialType(CreateEmployeeLeafDto) {}
