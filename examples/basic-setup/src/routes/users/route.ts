// src/routes/index.ts
import express from "express";

export function getUsers(req: express.Request, res: express.Response) {
  res.send("Hello from the users route!");
}
