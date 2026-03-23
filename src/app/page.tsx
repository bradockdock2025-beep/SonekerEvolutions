import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/context/AuthContext'
import AppShell from '@/components/AppShell'

export default function Home() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppProvider>
            <AuthProvider>
              <AppShell />
            </AuthProvider>
          </AppProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
