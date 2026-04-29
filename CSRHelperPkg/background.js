const menuItems = [
  { id: "TMX_CSR", title: "ThaiExpress CSR", contexts: ["selection", "page"] },
];

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items dynamically
  menuItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: item.contexts
    });
  });
})

// Handle click on context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedItem = menuItems.find(item => item.id === info.menuItemId);
  if (selectedItem && selectedItem.id == "TMX_CSR") {
    let name = ""
    let channel = ""
    const url = tab.url
    // Auto Detect Name from LINE
    if (tab.url.includes("chat.line.biz")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const el = document.querySelector('h4.mb-0.text-truncate');
          return el ? el.innerText.trim() : null;
        }
      }, (results) => {
        name = results[0].result
        channel = "LINE"
      })
    }
    if (tab.url.includes("facebook")) {
      channel = "FB"
    }
    // Handle manual selected name
    if (info.selectionText && name == "") {
      name = info.selectionText
    }
    chrome.sidePanel.open({ tabId: tab.id });
    const sendMsg = () => {
      try {
        chrome.runtime.sendMessage({
        type: "TMX_CSR_DATA",
        payload: { name, url, channel }
      });
      } catch(err) {sendMsg()}}

    setTimeout(() => {sendMsg()}, 500)
  }
});


function pasteText(text) {
  console.log("initPaste")
  const activeElement = document.activeElement;
  if (activeElement) {
    console.log("found Element")
    for (const char of text) {
      const event = new InputEvent("input", { bubbles: true });
      activeElement.value += char;
      activeElement.dispatchEvent(event);
    }
  }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { url: message.url });
      }
    });
  }
});

//mgm
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendMessageToEuiService') {
    chrome.tabs.query({ currentWindow: true }, (allTabs) => {
      const currentTabId = sender.tab.id;
      const currentTabIndex = allTabs.findIndex(tab => tab.id === currentTabId);
      const previousTab = allTabs[currentTabIndex - 1];

      if (previousTab) {
        chrome.scripting.executeScript({
          target: { tabId: previousTab.id },
          function: autofillFields,
          args: [request.data]
        });
      }
      sendResponse({ success: true });
    });
    return true;
  }
});

function autofillFields(pkg) {
  window.postMessage({ type: "FROM_EXTENSION", data: pkg }, ["http://localhost:5173", "https://euith-service.web.app/"]);
}

// Listen to Data From Website
// For receiving service_admin_token
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    // Check the action type to handle different requests
    if (request.action === "service_admin_token") {
      chrome.storage.local.set({ service_admin_token: request.data }, () => {

      const sendMsg = () => {
        try {
          chrome.runtime.sendMessage({
          type: "TMX_CSR_REFETCHAUTH",
          payload: {"command":"TMX_CSR_REFETCHAUTH"}
        });
        } catch(err) {sendMsg()}}
        
        sendMsg()

      });
    }
    return true;
  }
);