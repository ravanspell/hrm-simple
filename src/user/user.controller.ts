import { Controller, Get, Post, Body, Patch, Param, Delete, Version } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';


@Controller('user')
export class UserController {
  
  constructor(private readonly userService: UserService) {}

  @Post()
  @Version('1')
  create(@Body() createUserDto: CreateUserDto) {
    console.log("this is test log");
    return this.userService.create(createUserDto);
  }

  @Get()
  @Version('1')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
