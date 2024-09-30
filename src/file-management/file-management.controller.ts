import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException
} from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { IsString } from 'class-validator';

class InitUploadDto {
  @IsString()
  fileName: string;
}

@Controller('file-management')
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) { }

  @Post('upload/init')
  async initUpload(@Body() initUploadDto: InitUploadDto) {
    const { fileName } = initUploadDto;
    // get the file extention out of the file name
    const splittedFileName = fileName.split('.');
    const fileType = splittedFileName[splittedFileName.length - 1];
    if (!fileName || !fileType) {
      throw new BadRequestException('Filename and fileType are required');
    }
    const { uploadUrl, key } = await this.fileManagementService.getPresignedUrl(fileName, fileType);
    return { uploadUrl, key };
  }

  @Get()
  findAll() {
    return this.fileManagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileManagementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileManagementDto: UpdateFileManagementDto) {
    return this.fileManagementService.update(+id, updateFileManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileManagementService.remove(+id);
  }
}
