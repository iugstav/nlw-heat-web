import { useState, createContext, ReactNode, useEffect } from 'react'
import { api } from '../services/api'

type User = {
  id: string;
  name: string;
  avatar_url: string;
  login: string;
}

type AuthContextData = {
  user: User | null
  signInUrl: string,
  signOut: () => void
}

type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

export const AuthContext = createContext({} as AuthContextData)

type AuthProviderProps = {
  children: ReactNode 
}

export function AuthProvider(props: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=e36ac85430f2a28ae853`

  const signIn = async (code: string) => {
    const response = await api.post<AuthResponse>('authenticate', {
      code: code
    })

    const { token, user } = response.data

    localStorage.setItem('@dowhile:token', token)

    api.defaults.headers.common.authorization = `Bearer ${token}`

    setUser(user)
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('@dowhile:token')
  }

  useEffect(() => {
    const url = window.location.href

    const hasGithubCode = url.includes('?code=')
    if(hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split('?code=')

      window.history.pushState({}, '', urlWithoutCode)

      signIn(githubCode)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token')

    if(token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`

      api.get<User>('profile').then(response => {
        setUser(response.data)
      })
    }
  }, [])

  return(
    <AuthContext.Provider value={{
      signInUrl,
      user,
      signOut
    }}>
      { props.children }
    </AuthContext.Provider>
  )
}