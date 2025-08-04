chrome.runtime.onInstalled.addListener(() => {
  const menuItems = [
      { id: "pasteSampleText", title: "ลิงค์ MGM" },
  ];

  // Create context menu items dynamically
  menuItems.forEach(item => {
      chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["editable"]
      });
  });

  // Function to generate random code
function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

  // Handle click on context menu
  chrome.contextMenus.onClicked.addListener((info, tab) => {
      const selectedItem = menuItems.find(item => item.id === info.menuItemId);
      console.log("yetselected")
      if (selectedItem) {
          const randomCode = generateRandomCode(); // Generate new random code on click
          const textToPaste = "https://euith-mgm.web.app/?ref=" + randomCode; // Add the code to the link
          console.log("toExxecute")
          chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: pasteText,
              args: [textToPaste]
          });
      }
  });
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
  window.postMessage({ type: "FROM_EXTENSION", data: pkg }, ["http://localhost:5173","https://euith-service.web.app/"]);
  
}
