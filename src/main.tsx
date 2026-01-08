
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./app/App.tsx";
import BibleTranscription from "./app/BibleTranscription.tsx";
import "./styles/index.css";

// Firebase 초기화
import "./lib/firebase";

// 다국어 지원
import { LanguageProvider } from "./lib/i18n";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/bible" element={<BibleTranscription />} />
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);
  