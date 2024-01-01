// src/app.ts
import express from "express";
import bodyParser from "body-parser";
import loadRoutes from "../../../packages/router/src";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dynamically load routes
loadRoutes(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
