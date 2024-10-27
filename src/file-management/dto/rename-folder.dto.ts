import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RenameFolderDto {
  /**
   * ID of the folder to rename.
   */
  @IsString()
  readonly id: string;

  /**
   * New name for the folder.
   * - Must be between 1 and 100 characters.
   * - Should not contain special characters like `\/:*?"<>|`.
   */
  @IsString()
  @MinLength(1, { message: 'Folder name must be at least 1 character long.' })
  @MaxLength(100, { message: 'Folder name must be less than 100 characters.' })
  @Matches(/^[^\\/:*?"<>|]+$/, { message: 'Folder name contains invalid characters.' })
  readonly folderName: string;
}
