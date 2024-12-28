import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RenameFileDto {
  /**
   * ID of the file to rename.
   */
  @IsString()
  readonly id: string;

  /**
   * New name for the file.
   * - Must be between 1 and 255 characters.
   * - Should not contain special characters like `\/:*?"<>|`.
   */
  @IsString()
  @MinLength(1, { message: 'File name must be at least 1 character long.' })
  @MaxLength(255, { message: 'File name must be less than 255 characters.' })
  @Matches(/^[^\\/:*?"<>|]+$/, {
    message: 'File name contains invalid characters.',
  })
  readonly fileName: string;
}
