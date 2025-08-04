function bbl(n) {
    fetch("https://www.bbl.com.tw/exrate.asp")
        .then(response => response.text()) // Get response as text (HTML content)
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");

            const rows = doc.querySelectorAll("tr");
            if (rows.length < 5) {
                console.error("Unexpected table structure");
                return;
            }

            const col = rows[4].querySelectorAll("td");
            if (col.length < 2) {
                console.error("Unexpected column structure");
                return;
            }

            let sellPrice = parseFloat(col[1].innerText);
            if (isNaN(sellPrice)) {
                console.error("Invalid sell price");
                return;
            }

            const date = rows[rows.length-1].querySelectorAll("td")[0].innerText

            document.getElementById("sell1").textContent = sellPrice.toFixed(5);
            document.getElementById("sell2").textContent = (sellPrice - 0.005).toFixed(5);
            document.getElementById("1THB2").textContent = (1 / (sellPrice - 0.005)).toFixed(5);
            document.getElementById("GAP RAW2").textContent = ((1 / (sellPrice - 0.005)) + n).toFixed(6);
            document.getElementById("GAP ROUNDED2").textContent = (Math.round((((1 / (sellPrice - 0.005)) + n) * 10000) + 0.0000001) / 10000).toFixed(4);

            document.getElementById("date").textContent = "Updated: "+date
        })
        .catch(error => console.error("Fetch Error:", error));
}

// Listen for input changes
document.getElementById("gap").value = 0.0013
document.getElementById("gap").addEventListener("input", (event) => {
    let gapValue = parseFloat(event.target.value) || 0; // Ensure numerical input
    bbl(gapValue);
});

// Initial call with default value
bbl(0.0014);

document.getElementById("copyMgmFb").addEventListener("click", () => {
    function generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    const randomCode = generateRandomCode(); // Generate new random code on click
    const textToPaste = "https://euith-mgm.web.app/?ref=" + randomCode; // Add the code to the link

    navigator.clipboard.writeText(textToPaste)
})

