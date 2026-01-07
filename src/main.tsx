
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Firebase 초기화
import "./lib/firebase";

// 다국어 지원
import { LanguageProvider } from "./lib/i18n";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
  