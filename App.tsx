"use client"

import React, { useEffect, useState } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper"
import AsyncStorage from "@react-native-async-storage/async-storage"

import AuthNavigator from "./src/navigation/AuthNavigator"
import MainNavigator from "./src/navigation/MainNavigator"
import { AuthContext } from "./src/contexts/AuthContext"
import LoadingScreen from "./src/screens/LoadingScreen"
import auth from "@react-native-firebase/auth"

// Custom theme that matches the web app's color scheme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#14b8a6", // teal-500
    accent: "#0d9488", // teal-600
    background: "#f8fafc", // slate-50
    surface: "#ffffff",
    text: "#334155", // slate-700
    error: "#ef4444", // red-500
  },
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const bootstrapAsync = async () => {
      let token = null
      try {
        token = await AsyncStorage.getItem("userToken")
      } catch (e) {
        console.log("Failed to get token from storage")
      }
      setUserToken(token)
      setIsLoading(false)
    }

    // Listen for authentication state changes
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        user.getIdToken().then((token) => {
          AsyncStorage.setItem("userToken", token)
          setUserToken(token)
        })
      } else {
        AsyncStorage.removeItem("userToken")
        setUserToken(null)
      }
      setIsLoading(false)
    })

    bootstrapAsync()
    return unsubscribe
  }, [])

  const authContext = React.useMemo(
    () => ({
      signIn: async (email: string, password: string) => {
        try {
          await auth().signInWithEmailAndPassword(email, password)
          const token = await auth().currentUser?.getIdToken()
          if (token) {
            await AsyncStorage.setItem("userToken", token)
            setUserToken(token)
          }
          return { success: true }
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Authentication failed",
          }
        }
      },
      signUp: async (email: string, password: string, name: string) => {
        try {
          const userCredential = await auth().createUserWithEmailAndPassword(email, password)
          await userCredential.user.updateProfile({ displayName: name })
          const token = await auth().currentUser?.getIdToken()
          if (token) {
            await AsyncStorage.setItem("userToken", token)
            setUserToken(token)
          }
          return { success: true }
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "Registration failed",
          }
        }
      },
      signOut: async () => {
        try {
          await auth().signOut()
          await AsyncStorage.removeItem("userToken")
          setUserToken(null)
        } catch (e) {
          console.log("Sign out error:", e)
        }
      },
    }),
    [],
  )

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <AuthContext.Provider value={authContext}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>{userToken ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </PaperProvider>
    </AuthContext.Provider>
  )
}

