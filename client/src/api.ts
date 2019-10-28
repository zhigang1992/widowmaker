import { useEffect, useReducer, useRef } from "react";
import { Answer, Message } from "./Model";
import SocketIO from "socket.io-client";

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
export const useMessages = () => {
  const socketRef = useRef<SocketIOClient.Socket>();
  const [messages, dispatch] = useReducer(
    (state: Message[], action: Message) => {
      if (action.type === "clear") {
        return [];
      }
      if (action.id) {
        return [
          ...state.filter(m => m.type !== action.type || m.id !== action.id),
          action
        ];
      }
      return [...state, action];
    },
    []
  );
  useEffect(() => {
    const socket = SocketIO.connect();
    socketRef.current = socket;
    socket.on("message", (message: Message) => {
      dispatch(message);
    });
    if (!window.location.hash) {
      window.location.hash = randomString(6);
    }
    socket.emit("start", window.location.hash);
  }, []);
  return {
    messages,
    answer: (answer: Answer) => {
      if (socketRef.current) {
        socketRef.current.emit("answer", answer);
      }
    }
  };
};
