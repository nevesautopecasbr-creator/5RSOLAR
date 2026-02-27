import type { Request, Response } from "express";
import { join } from "path";
import { createRequire } from "module";

const requireMod = createRequire(join(process.cwd(), "package.json"));
let expressHandler: (req: Request, res: Response) => void;

/**
 * Handler serverless para Vercel: encaminha todas as requisições (GET, POST, etc.)
 * para o app NestJS/Express.
 */
export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  if (!expressHandler) {
    const appFactoryPath = join(process.cwd(), "dist", "src", "app-factory.js");
    const { createApp } = requireMod(appFactoryPath);
    const app = await createApp();
    await app.init();
    expressHandler = app.getHttpAdapter().getInstance();
  }
  expressHandler(req, res);
}
