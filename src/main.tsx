import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/atom-one-dark.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalStateProvider } from "./contexts/GlobalStateContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <GlobalStateProvider>
      <App />
    </GlobalStateProvider>
  </QueryClientProvider>
);
