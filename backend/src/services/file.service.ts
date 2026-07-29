import fs from 'node:fs/promises';

export class FileService {
  /**
   * Deletes a temporary file if it exists.
   * Catches and ignores ENOENT errors gracefully, and logs a warning for other errors.
   */
  static async deleteTemporaryFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        // File already deleted or missing, this is fine
        return;
      }
      console.warn(`[FileService] Failed to delete temporary file at ${filePath}:`, error);
    }
  }

  /**
   * Checks if a file exists
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
