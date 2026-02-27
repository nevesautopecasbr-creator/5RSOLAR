import type { Request, Response } from "express";
import { createApp } from "./app-factory";

let expressHandler: ((req: Request, res: Response) => void) | null = null;

/**
 * Handler serverless para Vercel: a plataforma usa este export quando detecta NestJS.
 * Assim POST (login, refresh, etc.) é encaminhado corretamente ao Express.
 */
async function getHandler(): Promise<(req: Request, res: Response) => void> {
  if (expressHandler) return expressHandler;
  const app = await createApp();
  await app.init();
  expressHandler = app.getHttpAdapter().getInstance();
  return expressHandler;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  const [pathPart, queryPart] = (req.url ?? "/").split("?");
  if (!pathPart.startsWith("/api")) {
    const newPath =
      "/api" + (pathPart.startsWith("/") ? pathPart : "/" + pathPart);
    req.url = queryPart ? `${newPath}?${queryPart}` : newPath;
  }
  const h = await getHandler();
  h(req, res);
}

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, "0.0.0.0");
}

if (!process.env.VERCEL) {
  bootstrap();
}
