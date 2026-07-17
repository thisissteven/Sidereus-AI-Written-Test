import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

import App from "./App"
import { ThemeProvider } from "@/components/theme-provider"
import { AppStoreProvider } from "@/lib/use-app-store"
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppStoreProvider>
        <App />
        <Toaster />
      </AppStoreProvider>
    </ThemeProvider>
  </StrictMode>
)
