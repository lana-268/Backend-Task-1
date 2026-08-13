import express, { type Request, type Response } from "express";

import { errorHandler } from "./middleware/errorHandler.ts";
import { venuesRouter } from "./routes/venues.ts";

const port = 3011;
const app = express();

app.use(express.json());

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/v1/venues", venuesRouter);

app.use(errorHandler);

app.listen(port, () => console.log(`Eventify on :${port}`));
