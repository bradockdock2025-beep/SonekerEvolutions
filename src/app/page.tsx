import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/context/AuthContext'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import AppShell from '@/components/AppShell'

export default function Home() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <AppShell />
              </SubscriptionProvider>
            </AuthProvider>
          </AppProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
