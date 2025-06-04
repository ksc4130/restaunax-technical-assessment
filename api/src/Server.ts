import "reflect-metadata";
import "@tsed/platform-express"; // Required
import "@tsed/ajv";
import "@tsed/swagger";
import "@tsed/passport";
import "@tsed/socketio";

// import "@tsed/platform-log-request"; // Optional: remove if you don't want logging
import { join } from "node:path";

import { Configuration, Inject } from "@tsed/di";
import { PlatformApplication } from "@tsed/platform-http";
import { Socket, SocketService } from "@tsed/socketio";

import { config } from "./config/index.js";
import * as rest from "./controllers/rest/index.js";
import * as ws from "./controllers/ws/index.js";
import { PrismaService } from "./services/index.js";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8081,
  httpsPort: false,
  mount: {
    "/rest": [...Object.values(rest)],
  },
  statics: {
    "/public": [
      {
        root: join(process.cwd(), "assets") // absolute path is preferred
      }
    ]
  },
  swagger: [
    {
      path: "/doc",
      specVersion: "3.0.1"
    }
  ],
  imports: [PrismaService, SocketService, ...Object.values(ws)],
  socketIO: {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  },
  views: {
    root: join(process.cwd(), "views"),
    extensions: {
      ejs: "ejs"
    }
  },
  middlewares: [
    { use: "cors", options: { origin: "*", credentials: false } },
    "cookie-parser",
    "compression",
    "method-override",
    "json-parser",
    { use: "urlencoded-parser", options: { extended: true } },
    {
      use: "express-session",
      options: {
        secret: process.env.SESSION_SECRET || "changeme",
        resave: false,
        saveUninitialized: false
      }
    }
  ]
})
export class Server {
  @Inject()
  protected app: PlatformApplication;
}
