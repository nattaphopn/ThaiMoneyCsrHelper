let selectElement = document.getElementById("category_id");

if (selectElement) {
selectElement.addEventListener("change",async function () {
let response = await fetch("https://service.th.dev.eui.money/api/csr");
let contexts = await response.json();
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
});}