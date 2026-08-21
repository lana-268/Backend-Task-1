import { createApp } from "./app.ts";
import { config } from "./config.ts";

const port = config.PORT;
const app = createApp();
app.listen(port, () => console.log(`Eventify on :${port}`));
