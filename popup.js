let getCoordsBtn = document.getElementById("getCoords");

getCoordsBtn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getCoords,
  });
});


async function getCoords() {
  if(!navigator || !navigator.clipboard) {
    alert('clipboard not enabled')
    return 
  }

  if(window.location.hostname == 'vmus.adu.org.za') {
    const tables = document.querySelectorAll('table')
    if(tables && tables.length >= 6){
      const dataTable = tables[2]
      const rows = dataTable.tBodies[0].rows
      const latRow = Array.from(rows).filter(x => x.innerText.startsWith('Decimal latitude'))
      const longRow = Array.from(rows).filter(x => x.innerText.startsWith('Decimal longitude'))

      if(!latRow || !latRow.length || !longRow || !longRow.length){
        alert('specimen coordinates not available on this page')
        return
      }

      //add the toast, thank you w3 schools...
      let toast = document.getElementById("snackbar");
      if(!toast) {
        toast = document.createElement('div')
        toast.setAttribute('id', 'snackbar') //snackbar/toast, same thing
        toast.innerText = "Coordinates copied!!"
        document.body.appendChild(toast)
      }
      

      let lat = latRow[0].innerText.trim().split(/\s+/)[2]
      let long = longRow[0].innerText.trim().split(/\s+/)[2]

      //fix the decimals...
      let latParts = lat.split('.')
      latParts[1] = latParts[1].substr(0, 5)
      lat = latParts.join('.')

      let longParts = long.split('.')
      longParts[1] = longParts[1].substr(0, 5)
      long = longParts.join('.')

      let coords = `${lat}, ${long}`

      //we can't use navigator.clipboard, so...
      let copyFrom = document.createElement("textarea");
      //copyFrom.hidden = true
      copyFrom.textContent = coords;
      document.body.appendChild(copyFrom);
      copyFrom.select();
      document.execCommand('copy'); //yes, deprecated, but it still works...
      copyFrom.blur();
      document.body.removeChild(copyFrom);

      toast.className = 'show'
      setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 1000);

      console.log('coords written to clipboard')
    }
    else {
      console.log(tables)
      alert('this does not appear to be record page...')
    }
    
  }
}
