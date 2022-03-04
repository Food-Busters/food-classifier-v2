import "./app.css";
import "./segoe.css";
import App from "./App.svelte";

const app = new App({
  // @ts-ignore
  target: document.getElementById("app"),
});

export default app;
