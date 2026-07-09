import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './app/store.js'

// On GitHub Pages the app is served under /AI-Resume-Builder/
// In production (Render/Vercel) it's served from the root /
const basename = import.meta.env.BASE_URL || '/'

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </BrowserRouter>,
)
