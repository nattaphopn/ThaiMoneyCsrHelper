import { useState, useEffect } from 'react'
import * as c from '@chakra-ui/react'
import axios from 'axios'
import '../App.css'

import { LeadEditor } from './LeadEditor'
import { Opportunity } from './Opportunity'


function TmxCsr() {

  const [lead, setLead] = useState({});
  const [leads, setLeads] = useState([]);
  const [preLead, setPreLead] = useState({});
  const [config, setConfig] = useState({});
  const [leadData, setLeadData] = useState({});

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/lead/config`).then(res => {
      setConfig(res.data)
    })
  }, [])

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome?.runtime?.onMessage) {
      const handler = (message) => {
        if (message.type === "TMX_CSR_DATA") {
          setLeadData({
            name: message?.payload?.name,
            channel: message?.payload?.channel,
            url: message?.payload?.url
          });
        }
      };
      chrome.runtime.onMessage.addListener(handler);
      return () => {
        chrome.runtime.onMessage.removeListener(handler);
      };
    } else {
      // Handle Local development
      setLeadData({
        name: "golf",
        channel: "LINE",
        url: "https://chat.line.biz/U4da632b96e8ab68a5311fee63eca48a1/chat/Uf25ccd1905d8cf8a4d52163d40f165e0"
      })
    }
  }, []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/leads?name=${leadData?.name}&channel=${leadData?.channel}`).then(res => {
      if (res.data.leads.length == 0) {
        setPreLead({
          "name": leadData?.name,
          "channel": leadData?.channel,
          "url": leadData?.url
        })
        return
      }
      if (res.data.leads.length == 1) {
        setLead(res.data.leads[0])
        setPreLead({})
        return
      }
      if (res.data.leads.length > 1) {
        setLeads(res.data.leads)
      }
    })
  }, [leadData]);

  const leadchannel = {
    "LINE": {"color": "#4bd784","backgroundColor": "#e5f1ea"},
    "FB": {"color": "#74addb","backgroundColor": "#a4cde9"}
  }

  return (
    <c.Box bgColor="#f7f7f7" w="100%" h={window.innerHeight} p='20px'>
      <c.HStack mt="-15px">
        <c.Image w="60px" src="./kitty.png" />
      <c.Text fontFamily="roboto" fontSize="20px" fontWeight="700">ThaiExpress CSR</c.Text>
      </c.HStack>


      {(Object.keys(lead).length > 0 && Object.keys(config).length) &&
        <c.Box p="8px" my="5px" fontFamily="Noto Sans Thai" backgroundColor={leadchannel[lead?.channel]?.backgroundColor} borderRadius="5px">
          <c.HStack>
            <c.Image src={`./${lead?.channel}.png`} w="30px" style={{ cursor: 'pointer' }} onClick={() => { window.open(lead?.url, '_blank') }} />
            <c.Box>
              <c.Text fontSize="15px" fontWeight="600">{lead?.name}</c.Text>
              <c.Text fontSize="12px" color="#7e7c7c" lineHeight="10px">{lead?.created_at.substring(0, 16)}</c.Text>
            </c.Box>
            <c.Spacer />
            <c.Button w="50px" mx="-16px" size="sm" variant="ghosted" onClick={() => { setPreLead(lead) }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7e7e7e"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
            </c.Button>
          </c.HStack>
        </c.Box>
      }

      {(Object.keys(preLead).length > 0 && Object.keys(config).length && Object.keys(lead).length == 0) && 
        <LeadEditor mode="create" data={preLead} config={config} setLeadData={setLeadData} />
      }

      {(Object.keys(lead).length > 0 && lead.lead_id == preLead.lead_id && Object.keys(config).length) &&
        <LeadEditor mode="edit" data={preLead} config={config} setLeadData={setLeadData} />
      }

      {(Object.keys(lead).length > 0) &&
        <Opportunity lead={lead}/>
      }

    </c.Box>
  )
}

export default TmxCsr