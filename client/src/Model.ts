type Show = {
  type: "show";
  content: string;
  id?: string;
};

type Display = {
  type: "display";
  url: string;
  id?: string;
};

export type Clear = {
  type: "clear";
  id?: string;
};

export type Ask = {
  type: "ask";
  id: string;
  placeholder?: string;
  submit?: string;
};

export type AskFile = {
  type: "askFile";
  id: string;
};

export type AskCommand = {
  type: "askCommand";
  id: string;
  commands: { [key: string]: string };
};

export type TableCell =
  | string
  | {
      type: "action";
      action: string;
      payload: string;
      display?: string;
    }
  | {
      type: "download";
      url: string;
      display?: string;
    };

export type AskTable<T extends { [key: string]: TableCell }> = {
  id: string;
  type: "askTable";
  header: { [K in keyof T]: string };
  rows: T[];
};

export type Download = {
  type: "download";
  url: string;
  id?: string;
};

export type Answer = {
  id: string;
  content: string;
  payload?: string;
};

export type Message =
  | Clear
  | Show
  | Display
  | Ask
  | AskFile
  | AskCommand
  | AskTable<any>
  | Download;
