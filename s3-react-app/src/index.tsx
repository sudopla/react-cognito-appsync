import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from 'store/auth-context'
import App from './App'

const rootElement = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
rootElement.render(
  <AuthContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthContextProvider>
)
