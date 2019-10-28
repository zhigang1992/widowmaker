import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useMessages } from "./api";
import { Ask, AskFile, AskCommand, Answer, AskTable, TableCell } from "./Model";

const Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 42rem;
  height: 100%;
`;

const Content = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AskFileInput = (ask: AskFile) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        return false;
      }}
    >
      <input
        ref={inputRef}
        style={{ display: "none" }}
        type="file"
        onChange={async () => {
          try {
            if (!inputRef.current || !inputRef.current.files) {
              alert("Please select a file");
              return;
            }
            setUploading(true);
            const data = new FormData();
            data.append(ask.id, inputRef.current.files[0]);
            try {
              await fetch("/upload", {
                method: "POST",
                body: data
              });
            } catch (e) {
              alert(e.message);
            }
          } finally {
            setUploading(false);
          }
        }}
      />
      <button
        disabled={uploading}
        style={{ backgroundColor: "#AAAAAA" }}
        onClick={async () => {
          inputRef.current && inputRef.current.click();
        }}
      >
        {uploading ? "Uploading..." : "📁 Choose file to upload"}
      </button>
    </form>
  );
};

const AskInput = (ask: Ask & { onSubmit: (answer: Answer) => void }) => {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        ask.onSubmit({
          id: ask.id,
          content: text
        });
        return false;
      }}
    >
      <input
        style={{ marginRight: 10 }}
        placeholder={ask.placeholder}
        type="text"
        autoFocus={true}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button>{ask.submit || "Submit"}</button>
    </form>
  );
};

const AskCommandComponent = ({
  id,
  commands,
  onSubmit
}: AskCommand & { onSubmit: (answer: Answer) => void }) => {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        return false;
      }}
    >
      {Object.keys(commands).map(command => (
        <button
          key={command}
          onClick={() =>
            onSubmit({
              id,
              content: command
            })
          }
        >
          {commands[command]}
        </button>
      ))}
    </form>
  );
};

const TableCellComponent = ({
  cell,
  onSubmit
}: {
  cell: TableCell;
  onSubmit: (type: string, payload: string) => void;
}) => {
  if (typeof cell === "string") {
    return <span>{cell}</span>;
  }
  if (cell.type === "download") {
    return <a href={cell.url}>{cell.display || "Download"}</a>;
  }
  return (
    <button
      style={{ textDecoration: "none" }}
      onClick={() => {
        onSubmit(cell.action, cell.payload);
      }}
    >
      {cell.display || cell.action}
    </button>
  );
};

const AskTableComponent = ({
  id,
  header,
  rows,
  onSubmit
}: AskTable<any> & { onSubmit: (answer: Answer) => void }) => {
  return (
    <table>
      <thead>
        <tr>
          {Object.keys(header).map(key => (
            <th key={key} align="left">
              {header[key]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {Object.keys(header).map(key => (
              <td key={key}>
                <TableCellComponent
                  cell={row[key]}
                  onSubmit={(type, payload) => {
                    onSubmit({
                      id,
                      content: type,
                      payload
                    });
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const App = () => {
  const { messages, answer } = useMessages();
  return (
    <Container>
      <Content>
        {messages.map((message, index) => {
          switch (message.type) {
            case "show":
              return <code key={String(index)}>{message.content}</code>;
            case "display":
              return (
                <img
                  style={{ maxWidth: "100%", alignSelf: "flex-start" }}
                  key={message.url}
                  src={message.url}
                  alt="Display"
                />
              );
            case "ask":
              return (
                <AskInput key={message.id} {...message} onSubmit={answer} />
              );
            case "askCommand":
              return (
                <AskCommandComponent
                  key={message.id}
                  {...message}
                  onSubmit={answer}
                />
              );
            case "askTable":
              return (
                <AskTableComponent
                  key={message.id}
                  {...message}
                  onSubmit={answer}
                />
              );
            case "askFile":
              return <AskFileInput key={message.id} {...message} />;
            case "download":
              return <a href={message.url}>Click here to download</a>;
            default:
              return null;
          }
        })}
      </Content>
    </Container>
  );
};

export default App;
