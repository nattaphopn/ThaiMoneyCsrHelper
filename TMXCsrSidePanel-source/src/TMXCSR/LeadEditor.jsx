import { useState, useEffect } from 'react'
import * as c from '@chakra-ui/react'
import axios from 'axios'
import '../App.css'


export const LeadEditor = (props) => {
  const { data, mode, config, setLeadData } = props

  const handleLead = () => {
    let attribute = {}
    config.attribute.map((item, index) => {
      attribute[item.field] = document.getElementById(item.field).value ?? ""
    })
    let pkg = {
      name: document.getElementById("name").value,
      channel: document.getElementById("channel")?.value,
      url: document.getElementById("url").value,
      note: document.getElementById("note").value,
      attribute
    }
    let path = `${import.meta.env.VITE_SHIPPING_API_PATH}/csr/lead`
    if (mode == "create") {
      axios.post(path, pkg).then(res => { setLeadData(res.data.leads[0]) })
      return
    } if (mode == "edit") {
      axios.patch(path, {lead_id:data.lead_id, items: pkg}).then(res => { setLeadData(res.data.pkg) })
      return
    } 
  }


    const handleLeadDelete = () => {
      let pkg = { deleted_at: new Date().toISOString().slice(0, 19).replace('T', ' ') }
      let path = `${import.meta.env.VITE_SHIPPING_API_PATH}/csr/lead`
      axios.patch(path, {lead_id:data.lead_id, items: pkg}).then(res => { setLeadData(res.data.leads[0]) })
  }

  return (
    Object.keys(data).length &&
    <c.Box>
      <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Lead Name</c.Text>
      <c.Input id="name" defaultValue={data?.name} />

      <c.HStack mt="10px">
        <c.Box w="120px">
          <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Channel</c.Text>
          <c.Select id="channel" defaultValue={data?.channel} key={data?.channel} size="sm">
            {config.channel.map((item, index) => {
              return <option key={index} value={item}>{item}</option>
            })}
          </c.Select>
        </c.Box>

        <c.Box w="100%">
          <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">URL</c.Text>
          <c.Input h="32px" id="url" defaultValue={data?.url} />
        </c.Box>

      </c.HStack>

      {config.attribute.map((item, index) => {
        return (
          <c.Box key={index} mt="10px">
            <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">{item.fieldName}</c.Text>
            {item.type == "text" &&
              <c.Input h="32px" id={item.field} defaultValue={data?.attribute?.[item.field] ?? ""} />
            }
            {item.type == "dropdown" &&
              <c.Select id={item.field} defaultValue={data?.attribute?.[item.field] ?? item.dropdownList[0]} size="sm">
                {item.dropdownList.map((item, index) => {
                  return <option key={index} value={item}>{item}</option>
                })}
              </c.Select>
            }
          </c.Box>
        )
      })}

      <c.Box w="100%" mt="10px">
        <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Note</c.Text>
        <c.Textarea id="note" defaultValue={data?.note} />
      </c.Box>


      <c.VStack mt="20px">
        <c.Button colorScheme="red" w="70%" fontSize="16px" onClick={() => { handleLead() }}>
          {mode == "create" ? "Create New Lead" : "Update"}
        </c.Button>
          {mode == "edit" &&
        <c.Button colorScheme="gray" w="70%" fontSize="16px" onClick={() => { handleLeadDelete() }}>
          Delete
        </c.Button>
}
      </c.VStack>
    </c.Box>

  )
} 
