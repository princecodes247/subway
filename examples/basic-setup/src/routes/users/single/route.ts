// src/routes/index.ts
import express from "express";

export function getSingleUser(req: express.Request, res: express.Response) {
  res.send(`Hello from thesingle user route`);
}
