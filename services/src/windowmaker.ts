import { Socket } from "socket.io";
import events from "events";
import { Answer, Message, AskTable, TableCell } from "./Model";
import * as fs from "fs";
import * as path from "path";

export function randomString(length: number = 10) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz".split(
    ""
  );
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

class Widowmaker {
  private socket: Socket;
  public id: string;
  public downloadDir: string;

  constructor(socket: Socket, id: string, downloadDir: string) {
    this.socket = socket;
    this.id = id;
    this.setupAnswerBinding();
    this.downloadDir = downloadDir;
    this.latestMessages = [];
  }

  static uploadEvent = new events.EventEmitter();
  static answerEvent = new events.EventEmitter();

  private setupAnswerBinding() {
    this.socket.on("answer", (answer: Answer) => {
      Widowmaker.answerEvent.emit(answer.id, answer.content, answer.payload);
    });
  }

  public update(socket: Socket) {
    this.socket = socket;
    if (this.latestMessages.length > 0) {
      this.latestMessages.forEach(message => {
        this.socket.emit("message", message);
      });
    }
    this.setupAnswerBinding();
  }

  latestMessages: Message[];

  private send(message: Message) {
    if (message.type === "clear") {
      this.latestMessages = [];
    } else {
      this.latestMessages.push(message);
    }
    this.socket.emit("message", message);
  }

  clear() {
    this.send({
      type: "clear"
    });
  }

  show(content: string, id?: string) {
    this.send({
      type: "show",
      content,
      id
    });
  }

  showTable<T extends { [K in keyof T]: TableCell }>(
    header: { [K in keyof T]: string },
    rows: T[],
    id: string = randomString()
  ): Promise<{ action: string; payload?: string }> {
    this.send({
      id,
      type: "askTable",
      header,
      rows
    });
    return this.waitForActionAnswer(id);
  }

  download(url: string) {
    this.send({
      type: "download",
      url
    });
  }

  async downloadLocal(file: string) {
    const link = await new Promise<string>((resolve, reject) => {
      const downloadFileName = `${randomString()}.${path.extname(file)}`;
      fs.copyFile(
        file,
        path.resolve(this.downloadDir, downloadFileName),
        err => {
          if (err != null) {
            reject(err);
          } else {
            resolve(`/download/${downloadFileName}`);
          }
        }
      );
    });
    this.download(link);
  }

  display(image: string) {
    this.send({
      type: "display",
      url: image
    });
  }

  askCommands<T extends { [key: string]: string }>(
    commands: T,
    id: string = randomString()
  ): Promise<keyof T> {
    this.send({
      type: "askCommand",
      id,
      commands
    });
    return this.waitForAnswer(id);
  }

  ask(placeholder?: string, submit?: string): Promise<string> {
    const id = randomString();
    this.send({
      type: "ask",
      id,
      placeholder,
      submit
    });
    return this.waitForAnswer(id);
  }

  waitForActionAnswer(
    id: string
  ): Promise<{ action: string; payload?: string }> {
    return new Promise((ful, rej) => {
      const onAnswer = (content: string, payload?: string) => {
        ful({ action: content, payload });
        clearTimeout(timeout);
      };
      const timeout = setTimeout(() => {
        Widowmaker.answerEvent.off("answer", onAnswer);
        rej(new Error("Timeout waiting for answer"));
      }, 1000 * 60 * 30);
      Widowmaker.answerEvent.once(id, onAnswer);
    });
  }

  async waitForAnswer(id: string): Promise<string> {
    const answer = await this.waitForActionAnswer(id);
    return answer.action;
  }

  askFile(): Promise<string> {
    return new Promise((ful, rej) => {
      const askId = randomString();
      this.send({
        type: "askFile",
        id: askId
      });
      const timeout = setTimeout(() => {
        rej(new Error("Timeout waiting for answer"));
      }, 1000 * 60 * 5);
      Widowmaker.uploadEvent.once(askId, (path: string) => {
        ful(path);
        clearTimeout(timeout);
      });
    });
  }
}

Widowmaker.uploadEvent.setMaxListeners(1000);
Widowmaker.answerEvent.setMaxListeners(1000);

export default Widowmaker;
