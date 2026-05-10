import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { HashRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <ChakraProvider>
        <HashRouter>
    <App />
        </HashRouter>
    </ChakraProvider>
)
