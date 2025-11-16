
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { VoiceAssistantProvider } from "./context/VoiceAssistantContext.tsx";

createRoot(document.getElementById("root")!).render(
  <VoiceAssistantProvider>
    <App />
  </VoiceAssistantProvider>
);
