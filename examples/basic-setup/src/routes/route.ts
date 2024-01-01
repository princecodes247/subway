// src/routes/index.ts
import express from "express";

export function getIndex(req: express.Request, res: express.Response) {
  res.send("Hello from the index route!");
}
