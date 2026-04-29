import { useState, useEffect } from 'react'
import * as c from '@chakra-ui/react'
import axios from 'axios'
import '../App.css'
import { v4 } from 'uuid';
import { Menu, MenuItem, MenuButton, SubMenu } from '@szhsin/react-menu';

export const Opportunity = (props) => {
  const { lead } = props
  const [opportunities, setOpportunities] = useState([]);
  const [config, setConfig] = useState({});
  const [editOpportunity, setEditOpportunity] = useState({});
  const [reload, setReload] = useState("");
  const [screen, setScreen] = useState("listOpportunity");

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome?.runtime?.onMessage) {
      const handler = (message) => {
        if (message.type === "TMX_CSR_DATA") {
          setScreen("listOpportunity");
        }
      };
      chrome.runtime.onMessage.addListener(handler);
      return () => {
        chrome.runtime.onMessage.removeListener(handler);
      };
    }
  }, []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity/config`).then(res => {
      setConfig(res.data)
    })
  }, [])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunities?lead_id=${lead.lead_id}`).then(res => {
      setOpportunities(res.data.opportunities)
    })
  }, [lead, reload])

  const handleEditOpportunity = (item) => {
    setEditOpportunity(item)
    setScreen("viewOpportunity")
  }

  return (
    <c.Box>
      {(opportunities.length == 0 && screen == "listOpportunity") &&
        <c.VStack h="100px" alignItems="center" justifyContent="center" p="20px">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#929292"><path d="M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120Zm273-407q47-47 47-113v-120H320v120q0 66 47 113t113 47q66 0 113-47ZM160-80v-80h80v-120q0-61 28.5-114.5T348-480q-51-32-79.5-85.5T240-680v-120h-80v-80h640v80h-80v120q0 61-28.5 114.5T612-480q51 32 79.5 85.5T720-280v120h80v80H160Z" /></svg>
          <c.Text fontFamily="Noto Sans" fontSize="14px" fontWeight="600" textAlign="center">No Opportunity Created</c.Text>
        </c.VStack>
      }
      {(screen == "editOpportunity") &&
        <OpportunityEditor lead={lead} editOpportunity={editOpportunity} mode="create" config={config} setReload={setReload} setScreen={setScreen} setEditOpportunity={setEditOpportunity} />
      }

      {(screen == "listOpportunity") &&
        <c.VStack>
          {opportunities.map((item, index) => {
            return (
              <c.Box w="100%" onClick={() => { handleEditOpportunity(item) }} style={{ cursor: 'pointer' }} key={index}>
                <c.HStack p="5px" pb="10px">
                  <c.Box fontFamily="Noto Sans">
                    <c.Text fontSize="12px" fontWeight="500">{item.created_at.substring(0, 16)}</c.Text>
                    <c.Text fontSize="14px" fontWeight="600" lineHeight="12px">{`${item.deal_detail?.route} ${item.deal_detail?.mode}`}</c.Text>
                    <c.Text fontSize="12px">{`${item.deal_detail?.goods}`}</c.Text>
                  </c.Box>
                  <c.Spacer />
                              <c.VStack alignItems={"right"}>
                    <c.Text textAlign="right" fontSize="10px" fontWeight="600">{item.current_stage}</c.Text>
                    <c.Badge textAlign="right">{item.current_status}</c.Badge>
                  </c.VStack>
                </c.HStack>
                <c.Divider />
              </c.Box>
            )
          })}
          <c.Button colorScheme="red" w="70%" fontSize="16px" onClick={() => { setScreen("editOpportunity") }}>
            New Opportunity
          </c.Button>
        </c.VStack>
      }

      {(screen == "viewOpportunity") &&
        <c.Box w="100%">
          <OpportunityEditor lead={lead} editOpportunity={editOpportunity} mode="view" config={config} setReload={setReload} setScreen={setScreen} setEditOpportunity={setEditOpportunity} />
        </c.Box>
      }

    </c.Box>
  )
}

const OpportunityEditor = (props) => {

  const { lead, editOpportunity, mode, config, setReload, setScreen, setEditOpportunity } = props
  const [opportunity, setOpportunity] = useState({});
  const [journal, setJournal] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [opReload, setOpReload] = useState('');

  useEffect(() => {
    if (editOpportunity?.opportunity_id?.length) {
      axios.get(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity?opportunity_id=${editOpportunity.opportunity_id}`).then(res => {
        setOpportunity(res.data.opportunity)
        setJournal(res.data.journal)
        setSelectedStatus(res.data.opportunity.current_status)
      })
    }
  }, [editOpportunity,opReload])

  const handleOpportunity = () => {
    let deal_detail = {}
    config.deal_detail.map((item, index) => {
      deal_detail[item.field] = document.getElementById(item.field).value ?? ""
    })
    let update = {}
    const updateFields = ['stage', 'status', 'close_reason', 'note']
    updateFields.map((item, index) => {
      update[item] = document?.getElementById(item)?.value ?? ""
    })
    update['activity'] = selectedActivity
    let pkg = { lead_id: lead.lead_id, deal_detail, update }

    if (mode == "create") {
      axios.post(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity`, pkg).then(res => {
        setReload(v4())
        setOpReload(v4())
        setEditOpportunity(res.data.opportunity)
       setScreen("viewOpportunity")
      ///  setEditOpportunity({})
      })
      return
    } if (mode == "view") {
      pkg['opportunity_id'] = opportunity.opportunity_id
      axios.post(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity/update`, pkg).then(res => {
        setOpReload(v4())
        setReload(v4())
      })
      return
    }
  }
const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    handleOpportunity()
  }
};

  const acitvity = [{"title":'INQUIRY', "color":"blue"}, {"title":'COMPLAINT', "color":"red"} ]

  return (
    Object.keys(config).length &&
    <c.Box>
      <c.HStack>
        <c.Button w="50px" mx="-16px" mt="10px" size="sm" variant="ghosted" onClick={() => { setScreen("listOpportunity"); setEditOpportunity({}) }}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#f04040"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
        </c.Button>
        <c.Text fontFamily="Noto Sans" fontSize="16px" fontWeight="600" mt="10px">{mode == "create" ? "New Opportunity" : "Edit Opportunity"}</c.Text>
      </c.HStack>

      {config?.deal_detail?.map((item, index) => {
        return (
          <c.Box key={index} mt="10px">
            <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">{item.fieldName}</c.Text>
            {item.type == "text" &&
              <c.Input h="32px" id={item.field} defaultValue={opportunity?.deal_detail?.[item.field] ?? ""} />
            }
            {item.type == "dropdown" &&
              <c.Select id={item.field} size="sm" defaultValue={opportunity?.deal_detail?.[item.field] ?? item.dropdownList[0]} key={opportunity?.opportunity_id}>
                {item.dropdownList.map((item, index) => {
                  return <option key={index} value={item}>{item}</option>
                })}
              </c.Select>
            }
          </c.Box>
        )
      })}

      <JournalList journal={journal} config={config} setOpReload={setOpReload} />

      {mode == "view" &&
      <c.Box bgColor='#f9f9f9' p="10px" borderRadius={'8px'} mt="10px" boxShadow="md">

        <c.Box mt="10px">
          <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Stage</c.Text>
          <c.Select id='stage' size="sm" defaultValue={opportunity?.current_stage ?? config?.stage?.[0]} key={opportunity?.opportunity_id}>
            {config?.stage?.map((item, index) => {
              return ( <option key={index} value={item}> {item} </option> );
            })}
          </c.Select>
        </c.Box>

        <c.Box mt="10px">
          <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Activity</c.Text>
          {selectedActivity.length > 0 &&
            <c.Text fontFamily="roboto" fontSize="16px" fontWeight="600" bgColor="#e9e9e9" p="5px" borderRadius="xl">{selectedActivity}</c.Text>
          }
          {config?.activity.length > 0 &&
          <c.HStack mt="10px">
              {acitvity.map(a => {
                return(
                <c.Menu>
                <c.MenuButton w="50%" as={c.Button} colorScheme={a.color} >
                  {a.title}
                </c.MenuButton>
                <c.MenuList maxH="300px" overflowY="auto">
                  {config?.activity?.filter(item => item?.includes(a.title)).map((item, index) => {
                    return ( <c.MenuItem key={index} value={item.replace(item.replace(a.title+':', ''))}
                    onClick={()=>{setSelectedActivity(item)}}
                    > {item.replace(a.title+':', '').trim()} </c.MenuItem> );
                  }) }
                </c.MenuList>
              </c.Menu>
                )
              })}
          </c.HStack>
          }
        </c.Box>

        <c.Box mt="10px">
          <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Status</c.Text>
          <c.Select id='status' size="sm" defaultValue={opportunity?.current_status ?? config?.status?.[0]} key={opportunity?.opportunity_id} onChange={(e) => { setSelectedStatus(e.target.value) }}>
            {config?.status?.map((item, index) => {
              return ( <option key={index} value={item}> {item} </option> );
            })}
          </c.Select>
        </c.Box>

        {selectedStatus?.includes("LOST") &&
        <c.Box mt="10px">
          <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Close Reason</c.Text>
          <c.Select id='close_reason' size="sm" defaultValue={opportunity?.close_reason ?? config?.close_reason?.[0]} key={opportunity?.opportunity_id}>
            {config?.close_reason?.map((item, index) => {
              return ( <option key={index} value={item}> {item} </option> );
            })}
          </c.Select>
        </c.Box>
        }

        <c.Box mt="10px">
          <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Note</c.Text>
          <c.Input h="32px" id='note' defaultValue='' onKeyDown={handleKeyDown} />
        </c.Box>
      </c.Box>
      }

      <c.VStack mt="20px">
        <c.Button colorScheme="red" w="70%" fontSize="16px" onClick={() => { handleOpportunity() }}>
          {mode == "create" ? "Create New Opportunity" : "Update"}
        </c.Button>
      </c.VStack>


    </c.Box>

  )
}



const JournalList = (props) => {

  const { journal, config, setOpReload } = props

  const handleJournalDelete = (item) => {
     if(!window.confirm("Are you sure you want to delete this journal?")) {
      return
     }
    let pkg = { journal_id: item.journal_id, opportunity_id: item.opportunity_id }
      axios.post(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/journal/delete`, pkg).then(res => {
        setOpReload(v4())
      })
  }


  return (
    Object.keys(config).length &&
    <c.Box mt="20px">
      {journal.map((item, index) => {
        return (
          <c.Box w="100%" style={{ cursor: 'pointer' }} key={index} bgColor={index == journal.length - 1 && "#eaf8f0"} 
          onClick={()=>{handleJournalDelete(item)}}
          onContextMenu={(e) => {
            e.preventDefault();
            handleJournalDelete(item);
          }}
          >
            <c.HStack p="5px" pb="10px">
              <c.Box fontFamily="Noto Sans">
                <c.Text fontSize="10px"> {`${item.created_at.substring(0, 16)} - ${item.admin_name}`} </c.Text>
                <c.Text fontSize="12px" fontWeight="600"> {item.activity} </c.Text>
                <c.Text fontSize="12px">{item.note.length > 0 && `📝 ${item.note}`} </c.Text>
              </c.Box>
              <c.Spacer />
              <c.VStack alignItems={"right"}>
                <c.Text textAlign="right" fontSize="10px" fontWeight="600"> {item.stage} </c.Text>
                <c.Badge textAlign="right" mt="-8px"> {item.status} </c.Badge>
              </c.VStack>

            </c.HStack>
            <c.Divider />
          </c.Box>
        )
      })}
    </c.Box>

  )
} 
