'use client'

import { useApp } from '@/context/AppContext'
import LandingScreen from '@/components/screens/LandingScreen'
import LoadingScreen from '@/components/screens/LoadingScreen'
import ResultScreen from '@/components/screens/ResultScreen'
import LibraryScreen from '@/components/screens/LibraryScreen'
import ProfileScreen from '@/components/screens/ProfileScreen'
import AuthScreen from '@/components/screens/AuthScreen'
import BottomNav from '@/components/ui/BottomNav'
import Toast from '@/components/ui/Toast'
import KnowledgeLens from '@/components/ui/KnowledgeLens'
import MindMapModal from '@/components/ui/MindMapModal'

export default function AppShell() {
  const { screen } = useApp()

  return (
    <>
      {screen === 'landing'  && <LandingScreen />}
      {screen === 'loading'  && <LoadingScreen />}
      {screen === 'result'   && <ResultScreen />}
      {screen === 'library'  && <LibraryScreen />}
      {screen === 'profile'  && <ProfileScreen />}
      {screen === 'signin'   && <AuthScreen mode="signin" />}
      {screen === 'signup'   && <AuthScreen mode="signup" />}

      {/* Global overlays */}
      <BottomNav />
      <Toast />
      <KnowledgeLens />
      <MindMapModal />
    </>
  )
}
