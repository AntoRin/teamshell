import express, { Application, Response } from "express";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import cookieParser from "cookie-parser";
import path from "path";
import { ApplicationServer, ErrorHandler, Factory, OnServerInit, OnServerStartup, Res, WildcardHandler } from "dipress";
import dotenv from "dotenv";
dotenv.config();
import * as controllers from "./controllers";
import { socketController } from "./socket-connection/SocketController";
import { UserContextSocket } from "./types";
import { Server } from "http";
import errorHandler from "./utils/errorHandler";

@ApplicationServer({
   port: 5000,
   controllers: [
      controllers.AuthController,
      controllers.ProfileController,
      controllers.OrganizationController,
      controllers.ProjectController,
      controllers.IssueController,
      controllers.ChatController,
      controllers.MeetController,
   ],
   verbose: "no",
})
export class Teamshell {
   @OnServerInit
   initializeAppMiddlewares(app: Application) {
      app.use(express.json({ limit: 500000 }));
      app.use(cookieParser());
      app.use(express.static(path.join(__dirname, "../../client/build")));
   }

   @OnServerInit
   async initializeConnections() {
      await mongoose.connect(process.env.MONGO_URI!, {
         useUnifiedTopology: true,
         useNewUrlParser: true,
         useCreateIndex: true,
         useFindAndModify: false,
      });
      console.log("[server] Database connection established");
   }

   @OnServerStartup
   initSocketServer(server: Server) {
      const io = new SocketServer(server);
      io.use(socketController.parseCookies);
      io.use(socketController.verifySocketIntegrity);

      io.on("connection", (socket: UserContextSocket) => socketController.initiateListeners(socket, io));
   }

   @WildcardHandler
   catchAll(@Res() res: Response) {
      res.sendFile(path.join(__dirname, "../../client/build/index.html"));
   }

   @ErrorHandler
   @Factory
   handleErrors() {
      return errorHandler;
   }
}
