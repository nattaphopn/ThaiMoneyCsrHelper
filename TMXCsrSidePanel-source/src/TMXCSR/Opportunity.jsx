import { useState, useEffect, useRef } from 'react'
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
      if (res.data.opportunities.length > 0) {
      setOpportunities(res.data.opportunities)
      handleEditOpportunity(res.data.opportunities[res.data.opportunities.length-1]) 
      }
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
                    <c.Text fontSize="12px" fontWeight="500">{item?.updated_at?.substring(0, 16)}</c.Text>
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
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedActivity, setSelectedActivity] = useState({});
  const [opReload, setOpReload] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editOpportunity?.opportunity_id?.length) {
      axios.get(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity?opportunity_id=${editOpportunity.opportunity_id}`).then(res => {
        setOpportunity(res.data.opportunity)
        setJournal(res.data.journal)
        setSelectedStatus(res.data.opportunity.current_status)
        setSelectedStage(res.data.opportunity.current_stage)
      })
    }
  }, [editOpportunity, opReload])


  const handleOpportunity = () => {
    let deal_detail = {}
    config.deal_detail.map((item, index) => {
      deal_detail[item.field] = document.getElementById(item.field).value ?? ""
    })
    let update = {}
    const updateFields = ['status', 'close_reason', 'note']
    updateFields.map((item, index) => {
      update[item] = document?.getElementById(item)?.value ?? ""
    })

    const activityList = [
      ...(selectedActivity?.INQUIRY || []),
      ...(selectedActivity?.COMPLAINT || [])
    ];

    update['stage'] = selectedStage
    let pkg = { lead_id: lead.lead_id, deal_detail, update }

    if (mode == "create") {
      setIsLoading(true)
     if (activityList.length > 0) {
  // Define an async function to handle the sequential execution
  const updateActivitiesSequentially = async () => {
    try {
      let lastRes = null;

      for (const a of activityList) {
        const response = await axios.post(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity`, {
          ...pkg,
          activity: a
        });

        // Verify the specific success status you requested
        if (response.data.status === "success") {
          lastRes = response;
        } else {
          // Optional: Handle cases where the API returns 200 OK but status isn't "success"
          console.warn("Request completed but status was not success:", response.data);
          break; // Stop the loop if a requirement isn't met
        }
      }

      // After all (or the last successful) requests are done
      if (lastRes) {
        setReload(v4());
        setOpReload(v4());
        setEditOpportunity(lastRes.data.opportunity);
        setScreen("viewOpportunity");
        setIsLoading(false)
        chrome.tabs.query({ url: "https://chat.line.biz/*" }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { type: "REFRESH_LINE_BADGES" });
  }
});
      }
    } catch (err) {
      console.error("Failed to update activities during sequential execution:", err);
    }
  };

  updateActivitiesSequentially();
} else {
        axios.post(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity`, pkg).then(res => {
          setReload(v4());
          setOpReload(v4());
          setEditOpportunity(res.data.opportunity);
          setScreen("viewOpportunity");
          chrome.tabs.query({ url: "https://chat.line.biz/*" }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { type: "REFRESH_LINE_BADGES" });
  }
});
        })
      }
      return
    } if (mode == "view") {
      pkg['opportunity_id'] = opportunity.opportunity_id
if (activityList.length > 0) {
  // Helper function to create the delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const processRequests = async () => {
    for (const a of activityList) {
      await axios.post(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity/update`, {
        ...pkg,
        update: { ...pkg.update, activity: a }
      });
      
      // Wait 100ms before starting the next iteration
      await delay(100);
    }

    // These run after all requests in the loop are finished
    setOpReload(v4());
    setReload(v4());
    setSelectedActivity({});
    chrome.tabs.query({ url: "https://chat.line.biz/*" }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "REFRESH_LINE_BADGES" });
    });
  };

  processRequests();
} else {
        axios.post(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/opportunity/update`, pkg).then(res => {
          setOpReload(v4())
          setReload(v4())
          chrome.tabs.query({ url: "https://chat.line.biz/*" }, (tabs) => {
            if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "REFRESH_LINE_BADGES" });
          });
        })
      }
      return
    }
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleOpportunity()
    }
  };

  const handleSelectActivity = (value, title) => {
    setSelectedActivity({
      ...selectedActivity,
      [title]: value
    })
  }

  const activity = [{ "title": 'INQUIRY', "color": "blue" }, { "title": 'COMPLAINT', "color": "red" }]

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
              <c.Select id={item.field} size="sm" key={opportunity.opportunity_id} defaultValue={opportunity?.deal_detail?.[item.field] ?? item.dropdownList[0]}>
                {item.dropdownList.map((item, index) => {
                  return <option key={index} value={item}>{item}</option>
                })}
              </c.Select>
            }
          </c.Box>
        )
      })}

      {opportunity.current_status?.includes('LOST') &&
          <c.Box mt="10px">
            <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">❌LOST REASON {opportunity?.close_reason}</c.Text>
        
          </c.Box>
      }

      <JournalList journal={journal} config={config} setOpReload={setOpReload} />

      {mode == "view" &&
        <c.Box bgColor='#f9f9f9' p="10px" borderRadius={'8px'} mt="10px" boxShadow="md">

          <c.Box mt="10px">
            <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Stage</c.Text>
            <c.HStack alignItems="top" mt="10px">
              {config?.stage?.map((item, index) => {
                return (
                  <c.Box w="20%" style={{ cursor: 'pointer' }} key={index} onClick={() => { setSelectedStage(item) }} >
                    <c.Center>
                      <c.Image src={`./stage/${item}.png`} w="30px" filter={selectedStage == item ? "" : "grayscale(100%)"} className={selectedStage == item ? "pulse-element" : ""} />

                    </c.Center>
                    <c.Text mt="8px" fontSize="14px" lineHeight="13px" textAlign="center">{item}</c.Text>
                  </c.Box>
                );
              })}
            </c.HStack>
          </c.Box>

          <c.Box mt="10px">
            <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Activity</c.Text>
            {selectedActivity['INQUIRY']?.map((item, index) => {
              return (
                <c.Text
                  key={index}
                  fontFamily="roboto"
                  fontSize="14px"
                  fontWeight="600"
                  p="5px"
                  borderRadius="xl"
                >
                  {item}
                </c.Text>
              );
            })}

            {selectedActivity['COMPLAINT']?.map((item, index) => {
              return (
                <c.Text
                  key={index}
                  fontFamily="roboto"
                  fontSize="14px"
                  fontWeight="600"
                  p="5px"
                  borderRadius="xl"
                >
                  {item}
                </c.Text>
              );
            })}

            {config?.activity.length > 0 &&
              <c.HStack mt="10px">
                {activity.map(a => {
                  return (
                    <c.Menu closeOnSelect={false}>
                      <c.MenuButton w="50%" as={c.Button} colorScheme={a.color} >
                        {a.title}
                      </c.MenuButton>
                      <c.MenuList maxH="300px" overflowY="auto">
                        <c.MenuOptionGroup type='checkbox'  key={opReload} onChange={(value) => { handleSelectActivity(value, a.title) }}>
                          {config?.activity?.filter(item => item?.includes(a.title)).map((item, index) => {
                            return (
                              <c.MenuItemOption key={index} value={item.replace(item.replace(a.title + ':', ''))}

                              > {item.replace(a.title + ':', '').trim()} </c.MenuItemOption>);
                          })}
                        </c.MenuOptionGroup>

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
                return (<option key={index} value={item}> {item} </option>);
              })}
            </c.Select>
          </c.Box>

          {selectedStatus?.includes("LOST") &&
            <c.Box mt="10px">
              <c.Text fontFamily="roboto" fontSize="14px" fontWeight="600">Close Reason</c.Text>
              <c.Select id='close_reason' size="sm" defaultValue={opportunity?.close_reason ?? config?.close_reason?.[0]} key={opportunity?.opportunity_id}>
                {config?.close_reason?.map((item, index) => {
                  return (<option key={index} value={item}> {item} </option>);
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
    if (!window.confirm("Are you sure you want to delete this journal?")) {
      return
    }
    let pkg = { journal_id: item.journal_id, opportunity_id: item.opportunity_id }
    axios.post(`${import.meta.env.VITE_SHIPPING_API_PATH}/csr/journal/delete`, pkg).then(res => {
      setOpReload(v4())
    })
  }

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [journal]);


  return (
    Object.keys(config).length &&
    <c.Box mt="20px" maxH="300px" overflowY="auto">
      {journal.map((item, index) => {
        return (
          <c.Box w="100%" style={{ cursor: 'pointer' }} key={index} bgColor={index == journal.length - 1 && "#eaf8f0"}
            onClick={() => { handleJournalDelete(item) }}
            onContextMenu={(e) => {
              e.preventDefault();
              handleJournalDelete(item);
            }}
          >
            <c.HStack p="5px" pb="10px">
              <c.Box fontFamily="Noto Sans">
                <c.Text fontSize="10px"> {`${item?.created_at?.substring(0, 16)} - ${item.admin_name}`} </c.Text>
                <c.Text fontSize="12px" fontWeight="600">
                  {typeof item.activity === 'string'
                    ? item.activity
                    : (item.activity && typeof item.activity === 'object')
                      ? Object.values(item.activity).flat().join(', ')
                      : ''
                  }
                </c.Text>
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
      <div ref={bottomRef} />
    </c.Box>

  )
} 
