import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  console.error('Root element not found!')
  document.body.innerHTML = '<h1>Error: Root element not found</h1>'
} else {
  console.log('Root element found, mounting React app...')
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('React app mounted successfully')
}
