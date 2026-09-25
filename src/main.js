import { createApp } from "vue";
import App from "./App.vue";
import { initSession } from "./stores/session.js";
import "./styles/base.css";
import "./styles/sheet.css";
import "./styles/rules.css";
import "./styles/print.css";

createApp(App).mount("#app");
initSession();
