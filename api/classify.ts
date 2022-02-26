import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMLResult } from "../lib/tf";

export default async (req: VercelRequest, res: VercelResponse) => {
  const { body, headers } = req;

  if (!process.env.VITE_API_TOKEN) {
    res.status(500).json({ message: "Cannot Authorize", error: 500 });
    return;
  }

  if (headers.token != process.env.VITE_API_TOKEN) {
    res.status(403).json({ message: "Unauthorized", error: 403 });
    return;
  }

  if (!body.image) {
    res.status(400).json({ message: "Missing image", error: 400 });
    return;
  }

  if (!(body.image as string).startsWith("data:image/")) {
    res.status(400).json({ message: "Not an image", error: 400 });
    return;
  }

  const result = await getMLResult(body.image);

  res.status(200).json(result);
};
