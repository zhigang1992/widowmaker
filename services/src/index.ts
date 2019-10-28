import W, { randomString as rS } from "./windowmaker";
import express from "express";
// @ts-ignore
import fileUpload from "express-fileupload";
import http from "http";
import SocketIO from "socket.io";
import tmp from "tmp";
import path from "path";

export type Widowmaker = W;
export const randomString = rS;

const start = (startFlow: (widow: Widowmaker) => Promise<void>) => {
  const app = express();
  app.use(fileUpload());

  app.use(express.static(path.join(__dirname, "../../client/build")));

  const downloadDir = tmp.dirSync().name;
  app.use("/download", express.static(downloadDir));

  const server = new http.Server(app);
  const io = SocketIO(server);

  const widowmakers: { [key: string]: Widowmaker } = {};

  io.on("connection", socket => {
    socket.on("start", msg => {
      const prevousWidowmaker = widowmakers[msg];
      if (prevousWidowmaker) {
        prevousWidowmaker.update(socket);
        return;
      }
      const widowmaker = new W(socket, msg, downloadDir);
      widowmakers[msg] = widowmaker;
      startFlow(widowmaker).catch(error => {
        delete widowmakers[msg];
        console.error(error);
      });
    });
  });

  app.post("/upload", (req, res) => {
    if (Object.keys((req as any).files).length == 0) {
      return res.status(400).send("No files were uploaded.");
    }
    const files = (req as any).files;
    const answerId = Object.keys(files)[0];
    const { name } = tmp.fileSync();
    files[answerId].mv(name, () => {
      W.uploadEvent.emit(answerId, name);
    });
    return res.send("File uploaded");
  });

  server.listen(
    process.env.PORT ? parseInt(process.env.PORT) : 8000,
    "0.0.0.0"
  );
};

export default start;
