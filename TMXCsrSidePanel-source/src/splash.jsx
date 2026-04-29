import { useState, useEffect } from 'react'
import * as c from '@chakra-ui/react'
import axios from 'axios'
import './App.css'

function Splash(props) {

  const {setState} = props

  const [rate, setRate] = useState(0)
  const [date, setDate] = useState("")

  const [GAPROUNDED, setGAPROUNDED] = useState(0)
  const [UPDATE, setUPDATE] = useState("")

  useEffect(() => {
    axios.get("https://service.th.dev.eui.money/api/rate").then(res => {
      setRate(res.data.gapRounded)
      setDate(res.data.date)
    })
  }, [])

  useEffect(() => {
    fetch("https://www.bbl.com.tw/exrate.asp")
      .then(response => response.text()) // Get response as text (HTML content)
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");

        const rows = doc.querySelectorAll("tr");
        if (rows.length < 5) {
          console.error("Unexpected table structure");
          return;
        }

        const col = rows[4].querySelectorAll("td");
        if (col.length < 2) {
          console.error("Unexpected column structure");
          return;
        }

        let sellPrice = parseFloat(col[1].innerText);
        if (isNaN(sellPrice)) {
          console.error("Invalid sell price");
          return;
        }

        setUPDATE(rows[rows.length - 1].querySelectorAll("td")[0].innerText)
        setGAPROUNDED((Math.round((((1 / (sellPrice - 0.005)) + 0.0013) * 10000) + 0.0000001) / 10000).toFixed(4))
        document.getElementById("sell1").textContent = sellPrice.toFixed(5);
        document.getElementById("sell2").textContent = (sellPrice - 0.005).toFixed(5);
        document.getElementById("1THB2").textContent = (1 / (sellPrice - 0.005)).toFixed(5);
        document.getElementById("GAP RAW2").textContent = ((1 / (sellPrice - 0.005)) + n).toFixed(6);
        document.getElementById("GAP ROUNDED2").textContent = (Math.round((((1 / (sellPrice - 0.005)) + n) * 10000) + 0.0000001) / 10000).toFixed(4);

        document.getElementById("date").textContent = "Updated: " + date
      })
      .catch(error => console.error("Fetch Error:", error));
  }, [])

  return (
    <c.Box bgColor="#f7f7f7" w="100%" h={window.innerHeight}>
      <c.Box m="10px" p="10px" bgColor="#ffffffff" borderRadius="20px">
        <c.HStack>
          <c.Image src="kitty.png" w="80px" />
          <c.Box>
            <c.Text fontFamily="roboto" fontSize="22px" fontWeight="700" lineHeight="5px">Hello Part-Timer!</c.Text>
          </c.Box>
        </c.HStack>

        <c.Text fontFamily="Noto Sans Thai" fontSize="16px" fontWeight="600" align="center" lineHeight="5px">อัตราแลกเปลี่ยน</c.Text>
        <c.HStack mt="20px" maxW={window.innerWidth}>
          <c.Box w="200px">
            <c.Text fontFamily="Noto Sans Thai" fontSize="14px" fontWeight="400" align="center" lineHeight="5px">ก่อนหน้า</c.Text>
            <c.Text mt="20px" fontFamily="roboto" fontSize="20px" fontWeight="500" align="center" lineHeight="5px">{rate}</c.Text>
            <c.Text mt="15px" fontFamily="Noto Sans Thai" fontSize="12px" fontWeight="400" align="center" lineHeight="5px">{date.replace(/\s+/g, ' ')}</c.Text>
          </c.Box>
          <c.Box w="200px">
            <c.Text fontFamily="Noto Sans Thai" fontSize="14px" fontWeight="400" align="center" lineHeight="5px">ปัจจุบัน</c.Text>
            <c.Text mt="20px" fontFamily="roboto" fontSize="20px" fontWeight="500" align="center" lineHeight="5px" color={GAPROUNDED - rate < 0 ? "#be2116ff" : (GAPROUNDED - rate > 0 ? "#4ac573ff" : "")} id="GAP ROUNDED2">{GAPROUNDED} {GAPROUNDED - rate < 0 ? "▼" : (GAPROUNDED - rate > 0 ? "▲" : "")}</c.Text>
            <c.Text mt="15px" fontFamily="Noto Sans Thai" fontSize="12px" fontWeight="400" align="center" lineHeight="5px">{UPDATE.replace(/\s+/g, ' ')}</c.Text>
          </c.Box>
        </c.HStack>

        <c.VStack mt="20px">
          <c.Button colorScheme="red" w="70%" fontSize="16px" onClick={()=>{setState('tmxcsr')}}>📦ThaiExpress CSR</c.Button>
        </c.VStack>

      </c.Box>
    </c.Box>
  )
}

export default Splash
