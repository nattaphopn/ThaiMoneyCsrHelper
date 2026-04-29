import { useState, useEffect } from 'react'
import useStore from '../../useStore.jsx';
import * as c from '@chakra-ui/react'
import axios from 'axios'
import '../App.css'

function User() {
  const { user } = useStore();

    const handleSignOut = () => {
    localStorage.clear();
    window.location.href = `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}/oauth2/v2.0/logout`
  }


  return (
    <c.HStack w="100%" p="15px" position="absolute">
      <c.Spacer />
      <c.Box>
        <c.Text fontFamily="Noto Sans" fontSize="14px" fontWeight="600" textAlign="right">
          {user.user?.displayName}
        </c.Text>
        <c.Text fontFamily="Noto Sans" fontSize="12px" textAlign="right" lineHeight="8px" color="#4b4949">
          {user.user?.email.toLowerCase()}
        </c.Text>
      </c.Box>
      <c.Button w="50px" mx="-16px" size="sm" variant="ghosted" onClick={()=>{handleSignOut()}}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7e7e7e"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
      </c.Button>
    </c.HStack>
  )
}

export default User
