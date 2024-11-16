// dto/delete-files.dto.ts
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class DeleteFilesDto {
  /**
   * Array of file IDs to delete.
   * - Must be a non-empty array of strings.
   */
  @IsArray()
  @ArrayNotEmpty({ message: 'File IDs array must not be empty.' })
  @IsString({ each: true, message: 'Each file ID must be a string.' })
  readonly ids: string[];
}
