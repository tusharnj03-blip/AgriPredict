import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, trackActivity } from '../services/api'

// Simple UUID-like generator (avoids needing the uuid package)
const generateSessionId = () => {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const initSession = () => {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = generateSessionId()
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await authAPI.me()
      setUser(data)
      setIsAuthenticated(true)
      initSession()
    } catch (err) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })
    
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || 'Login failed')
    }
    
    const data = await response.json()
    localStorage.setItem('access_token', data.access_token)
    
    const { data: userData } = await authAPI.me()
    setUser(userData)
    setIsAuthenticated(true)
    initSession()
    trackActivity('/login', 'login', 'authentication')
    return userData
  }

  const register = async (formData) => {
    const { data } = await authAPI.register(formData)
    return data
  }

  const logout = async () => {
    try {
      trackActivity('/logout', 'logout', 'authentication')
    } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('session_id')
    setUser(null)
    setIsAuthenticated(false)
  }

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.me()
      setUser(data)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
