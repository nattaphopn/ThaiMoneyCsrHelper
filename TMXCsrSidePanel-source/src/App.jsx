import { useState, useEffect } from 'react'
import * as c from '@chakra-ui/react'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import './App.css'
import TMXCSR_App from './TMXCSR/TMXCSR_App'
import User from './element/User'
import { fetchSession } from './auth/session'

function App() {

  const navigate = useNavigate();

  const [state, setState] = useState("tmxcsr")
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const processServiceAdminToken = async () => {
    const data = await chrome.storage.local.get("service_admin_token");
    if (data.service_admin_token) {
      localStorage.setItem("service_admin_token", data.service_admin_token.token);
     fetchSession(setIsLoading)
    } else {
      fetchSession(setIsLoading)
    }
  }


  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      processServiceAdminToken();
    } else {
      fetchSession(setIsLoading)
    }
  }, []);


  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome?.runtime?.onMessage) {
      const handler = (message) => {
        if (message.type === "TMX_CSR_REFETCHAUTH") {
          if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            processServiceAdminToken();
          }
        }
      };
      chrome.runtime.onMessage.addListener(handler);
      return () => {
        chrome.runtime.onMessage.removeListener(handler);
      };
    } else { }
  }, []);


  return (
    !isLoading &&
    <c.Box bgColor="#f7f7f7" w="100%" h="100%">
      <User />
      <TMXCSR_App />
      {/*
                <Routes>
          <Route path="*" element={<TMXCSR_App />} />
        </Routes>
        */}

    </c.Box>
  )
}

export default App
