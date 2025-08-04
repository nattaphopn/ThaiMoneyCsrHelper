function logPreContent() {
  const preElements = document.querySelectorAll("pre");
  const logs = [];

  preElements.forEach((pre) => {
    const text = pre.textContent.trim();
    if (text) {
      let parsedData;
      try {
        parsedData = JSON.parse(text); // Try parsing as JSON
      } catch (error) {
        parsedData = text; // If not JSON, keep as text
      }
      let data = parsedData.data.filter(p => p.accountStatus == "\u003Cspan class=\"label label-success\"\u003EOn\u003C/span\u003E")[0]
      if (data.length !== 0) {
        let pkg = {
          "userId": data.id,
          "name_arc": data.full_name,
          "date_register": data.created_at,
          "date_firstTx": (data.first_transfer_record == null ? "-" : data.first_transfer_record.payTime.slice(0, 10))
        }

        chrome.runtime.sendMessage({
          action: 'sendMessageToEuiService',
          data: pkg
        });

        setTimeout(() => {
          window.location.href = `https://th.admin.eui.money/admin/members/${data.id}`;
        }, 500)
      }
    }
  });
}

setTimeout(() => {
  logPreContent();
}, "100")

