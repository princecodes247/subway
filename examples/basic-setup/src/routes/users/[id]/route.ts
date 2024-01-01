// src/routes/index.ts
import express from "express";

export function getUser(req: express.Request, res: express.Response) {
  console.log({ params: req.params });
  res.send(`Hello from the user id route! ${req.params.id}`);
}
