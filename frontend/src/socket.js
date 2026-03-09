import { io } from "socket.io-client";

export const socket = io(
  [
  "https://bursana.com",
  "https://www.bursana.com",
  "http://www.bursana.com",
  "http://localhost:3000",
],
  {
    withCredentials: true,
    autoConnect: false,
  }
);