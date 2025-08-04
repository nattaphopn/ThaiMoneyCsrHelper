
let contexts = {
  "Remittance Service Inquiries":[
    "TXN Full Limit",
    "TXN Limit Regulation",
    "Service fee",
    "Barcodes expire",
    "How to upload new ARC",
    "How to register",
    "Currency exchange rate",
    "How long does a transfer take",
    "Forget password",
    "Create transaction",
    "Download App",
    "Change phone number",
    "How to pay money at convenience stores",
    "ARC verification Issue",
    "How to add bank account",
    "Service hour"
    ],
  "Remittance Promotion/ Event Issues":[
    "Current promotion",
    "Redeem rewards",
    "Offline Event",
    "Coupon Discount Inquiry"
    ],
  "Other Remittance Service Issues":[
      "Bank system maintenance hour/ bank app crash"
    ],
  "Value-Added Services Inquiries":[
    "Sim card/recharge card",
    "Others service Inquiry"
    ],
  "Transaction Status Tracking":[
      "Check transfer status",
      "Delay transfer due to TransactionPending",
      "Delay transfer due to InvalidRequest",
      "Delay transfer due to PendingComplianceReview",
      "Delay transfer due to Incorrect Account Name",
      "Delay transfer due to IncorrectAccountNumber",
      "Delay transfer due to AccountRestriction",
      "Delay transfer due to Accountclosed",
      "Delay transfer due to Others",
      "Delay transfer due to NonKBank Technical Issue",
      "Delay transfer due to Systemerror"],
  "Change Receivers' Info/Refund Request":[
      "Recall case"],
  "Other Transaction Issues":[
      "Delay transfer due to insufficient funds in the EUI account",
      "Delay transfer due to bank system maintenance/bank app crash",
      "Delay transfer due to CVS system",
      "Transaction issue related to the CVS",
      "Duplicate payment"],
    "Remittance System Issues":[
      "App bug report"
    ],
    "Value-Added Services System Issues":[
       "NNB Issues"
    ],
    "NNB Payment Issues":[
      "NNB Inquiry"
   ]                    
}



let selectElement = document.getElementById("category_id");

if (selectElement) {
selectElement.addEventListener("change", function() {

  // Get the selected option
  let selectedOption = selectElement.options[selectElement.selectedIndex];
  let selectedText = selectedOption.textContent;

  Array.from(document.querySelectorAll('select'))
  .forEach(el => {
      if (el.id == "titleSelect") {
           el.innerHTML = ''
           let newOptions = contexts[`${selectedText}`]
    
          newOptions.forEach(option => {
            const newOption = document.createElement('option');
            newOption.value = option
            newOption.textContent = option
            el.appendChild(newOption);
          });

          let titleInput = document.getElementById("title");
          titleInput.value = newOptions[0]

          } 
          })
  //

});}