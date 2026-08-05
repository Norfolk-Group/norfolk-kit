import { createHttpServer } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const server = createHttpServer();
server.listen(port, "0.0.0.0", () => console.log(`Norfolk Kit reference server listening on ${port}`));
