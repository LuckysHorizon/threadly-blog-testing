import { RequestHandler } from "express";
// DemoResponse type is not exported from shared/api, defining locally
interface DemoResponse {
  message: string;
}

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
};
