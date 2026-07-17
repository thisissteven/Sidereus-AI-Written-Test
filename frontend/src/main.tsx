import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

import App from "./App"
import { ThemeProvider } from "@/components/theme-provider"
import { AppStoreProvider } from "@/lib/use-app-store"
import { I18nProvider } from "@/lib/i18n"
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AppStoreProvider>
          <App />
          <Toaster />
        </AppStoreProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>
)
