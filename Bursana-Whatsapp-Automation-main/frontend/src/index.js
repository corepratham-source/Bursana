import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AlertProvider from "./context/AlertProvider";
import "./index.css"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AlertProvider>
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </AlertProvider>
);
