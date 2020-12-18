import * as fs from 'fs';
import * as path from 'path';

export class StructureManager {
  public async registerPath(_path: string): Promise<void> {
    const files = await fs.readdirSync(_path);
    for (const file of files.filter((_path) => _path !== 'Structures.ts')) {
      const filePath = path.join(_path, file);
      if ((await fs.statSync(filePath)).isDirectory()) {
        this.registerPath(filePath);
      } else {
        await import(filePath);
      }
    }
  }
}
