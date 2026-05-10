import express from "express";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";

export const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://172.28.48.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

app
  .use(morgan("dev"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

app.use(express.static("public"));

app.get("/", async (req, res) => {
  return res.json({ message: "Hello World" });
});

app.use(routes);

// app.use((error: any, req: Request, res: Response, next: NextFunction) => {
//   const status = error.status || 500;
//   const message = error.message || "Server Error";
//   const errorCode = error.code || "Error_Code";
//   res.status(status).json({ success: false, message, error: errorCode });
// });

app.use(globalErrorHandler);

// cron.schedule("* /2 * * * *", () => {
// cron.schedule("* 5 * * *", async () => {
//   console.log("Running a task every 5am for testing purpose");
//   const setting = await getSettingStatus("maintenance");
//   if (setting?.value === "true") {
//     await createOrUpdateSetting("maintenance", "false");
//     console.log("Now maintenance mode is off");
//   }
// });
// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *
