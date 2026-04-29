import axios from 'axios'
import useStore from '../../useStore.jsx'

export async function fetchSession(setIsLoading) {
  const token = localStorage.getItem('service_admin_token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  setIsLoading(true)
  try {
      const response = await axios.get(`${import.meta.env.VITE_EUITHSERVICE_BACKEND_PATH}/session`, { withCredentials: true });
      if (response.data.message === "user found") {
        useStore.setState({ user: response.data.userPkg });
        setIsLoading(false)
      } else {
         redirectToLogin()
      }
    } catch (error) {
         redirectToLogin()
    }
}

function redirectToLogin() {
  const path = window.location.pathname + window.location.search + window.location.hash;
  const loginUrl = `${import.meta.env.VITE_EUITHSERVICE_BACKEND_PATH}/login?state=${encodeURIComponent(path)}`;

  // Check if the chrome.tabs API is available (Extension context)
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: loginUrl });
    window.close()
  } else {
    // Fallback for standard web development/testing
    window.location.href = loginUrl;
  }
}