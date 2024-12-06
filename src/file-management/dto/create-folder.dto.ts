import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateFolderDto {
  /**
   * Name of the new folder.
   * - Must be between 1 and 100 characters.
   * - Should not contain special characters like `\/:*?"<>|`.
   */
  @IsString()
  @MinLength(1, { message: 'Folder name must be at least 1 character long.' })
  @MaxLength(100, { message: 'Folder name must be less than 100 characters.' })
  @Matches(/^[^\\/:*?"<>|]+$/, {
    message: 'Folder name contains invalid characters.',
  })
  readonly name: string;
  /**
   * Optional ID of the parent folder for nested folders.
   * If null, it indicates that this is a root folder.
   */
  @IsOptional()
  @IsString()
  readonly parentId?: string | null;
}
