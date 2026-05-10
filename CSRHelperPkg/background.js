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

const sendChatDetailToTmxCsr = (info, tab) => {
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
    const sendMsg = (retries = 3) => {
      if (retries <= 0) return;
      try {
        chrome.runtime.sendMessage({ type: "TMX_CSR_DATA", payload: { name, url, channel } });
      } catch (err) { sendMsg(retries - 1); }
    };
    setTimeout(() => { sendMsg(); }, 500);
}

// Handle click on context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedItem = menuItems.find(item => item.id === info.menuItemId);
  if (selectedItem && selectedItem.id == "TMX_CSR") {
    sendChatDetailToTmxCsr(info, tab)
  }
});



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
  window.postMessage({ type: "FROM_EXTENSION", data: pkg }, ["https://euith-service.web.app/"]);
}

// Track LINE chat path changes
const lineTabPaths = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  try {
    const url = new URL(changeInfo.url);
    if (url.hostname !== "chat.line.biz") return;
    const prev = lineTabPaths[tabId];
    if (prev !== url.pathname) {
      lineTabPaths[tabId] = url.pathname;
      sendChatDetailToTmxCsr({ selectionText: null }, tab);
    }
  } catch (_) {}
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete lineTabPaths[tabId];
});

// Listen to Data From Website
// For receiving service_admin_token
const ALLOWED_EXTERNAL_ORIGINS = [
  "https://service.th.dev.eui.money",
  "https://service.th.eui.money"
];

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (!ALLOWED_EXTERNAL_ORIGINS.some(o => sender.url?.startsWith(o))) return;
    if (request.action === "service_admin_token") {
      chrome.storage.local.set({ service_admin_token: request.data }, () => {
        const sendMsg = (retries = 3) => {
          if (retries <= 0) return;
          try {
            chrome.runtime.sendMessage({ type: "TMX_CSR_REFETCHAUTH", payload: { command: "TMX_CSR_REFETCHAUTH" } });
          } catch (err) { sendMsg(retries - 1); }
        };
        sendMsg();
      });
    }
    return true;
  }
);