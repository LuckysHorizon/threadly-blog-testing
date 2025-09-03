import serverless from "serverless-http";
import { createServer } from "../../server";

// Create the Express server instance and wrap it with serverless-http
const app = createServer();
export const handler = serverless(app);
