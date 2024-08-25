import { Prisma } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsString, maxLength } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    @IsEmail()
    email: Prisma.UserCreateInput['email']

    @IsString()
    name: Prisma.UserCreateInput['name']

    posts: Prisma.PostCreateNestedManyWithoutAuthorInput
    profile: Prisma.ProfileCreateNestedOneWithoutUserInput
}
