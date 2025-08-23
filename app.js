const { dbName: DB_NAME, dbVersion: DB_VERSION, storeName: STORE_NAME, energy_cost_per_kwh: ENERGY_COST_PER_KWH } = CONFIG;

let db;

function setFooterText(){
  let todayDate = new Date();
  document.getElementById("footer-text").textContent = ` ${todayDate.getFullYear()} Energy Tracker App. By Rodx`;

}




//abrir indexedDB
function openDB() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = (event) => {
    console.error("Error opening database:", event.target.error);
  }
  
  request.onsuccess = (event) => {  
    db = event.target.result;
    console.log("Database opened successfully");
    //console.log("dabatase name "+DB_NAME, DB_VERSION, STORE_NAME,ENERGY_COST_PER_KWH);
    // console.log("dabatase name "+DB_NAME);
    // console.log("dabatase version "+DB_VERSION);
    // console.log("object store name "+STORE_NAME);
    // console.log("energy cost per kwh "+ENERGY_COST_PER_KWH);
    displayEntries();
    setFooterText(); // Set footer text with current year
  }

  request.onupgradeneeded = (event) => { 
    db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      console.log("Object store created");
    }       

    
  }

}

// Add a new entry
function addEntry(entry) {
  console.log("entro al Adding entry:", entry);
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.add(entry);
  tx.oncomplete = () => {
    console.log("Entry added successfully");
    displayEntries();
  };
}

//Display entries in the table
function displayEntries() {
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  

  request.onsuccess = () => {    
    const entries = request.result;
    console.log("before sorting");
    //sort the entries by month, date and time
    entries.sort((a, b) => {
      let dateA = new Date(`${a.date} ${a.time}`);
      let dateB = new Date(`${b.date} ${b.time}`);
      return dateB-dateA; // Sort in descending order
    });
    
    const tbody = document.getElementById("entry-list");
    tbody.innerHTML = "";

    entries.forEach((entry) => {
      const delta = entry.energy - entry.last_energy;
      const rate = delta > 0 ? "+" : "";
      const cost = delta * ENERGY_COST_PER_KWH; // example rate: $0.12/kWh

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.month}</td>
        <td>${entry.date}</td>
        <td>${entry.time}</td>
        <td>${entry.energy.toLocaleString()}</td>
        <td>${entry.last_energy.toLocaleString()}</td>
        <td>${rate}${delta}</td>
        <td>${rate}${(delta / entry.last_energy * 100).toFixed(1)}%</td>
        <td>$${cost.toFixed(2).toLocaleString("en-US",{style: "currency", currency:"USD"})}</td>
        <td><button data-id="${entry.id}" class="edit-btn">Edit</button></td>
        <td><button data-id="${entry.id}" class="delete-btn">Del</button></td>
      `;
      tbody.appendChild(row);
      console.log("Display data grid successfully");
    });
    //add listener for each action button (edit)
    document.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const id = (e.target.dataset.id);
        loadEntryForEdit(id);
      });
    });

    //add listener for each delete button
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        deleteEntry(id);
      });
    });
  };
}


//handle entry for edit the selected entry

function loadEntryForEdit(id) {
  const edit_text = "Update Entry";
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.get(Number(id));
  request.onsuccess = () => {
    const entry = request.result;
    console.log("Entry id loaded for edit:", entry);
    if (entry) {
      
      document.getElementById("energy").value = entry.energy;
      document.getElementById("last_energy").value = entry.last_energy;
      document.getElementById("month").value = entry.month;
      document.getElementById("date").value = entry.date;
      document.getElementById("time").value = entry.time;
      //document.getElementById("entry-id").value = entry.id; // Store the ID for later use
      document.getElementById("energy-form").dataset.editId = id; // Set a flag to indicate editing mode
      document.querySelector("#submit").textContent = edit_text;
      console.log("Entry found");
      
    } else {
      console.error("Entry not found");
    }
  };
}

function deleteEntry(id){
  const msg="Sure you wanna delete this entry id? "+id;
  if(!confirm(msg)) return;

  
  if(id){
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(Number(id));
    console.log("el id para eliminar es",id);
    store.delete(id);

    tx.oncomplete=() => {
      console.log("entry deleted", id);
      displayEntries();
    };

    tx.onerror = (event) =>{
      console.log("An error occurred during deletion", event.target.error);
    };

  }
}

//Handle form submission
document.getElementById("energy-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const now = new Date();
  const id = e.target.dataset.editId ? Number(e.target.dataset.editId) : null;

  const entry = {
    id:id, // Use the ID if editing, otherwise it will be auto-incremented  
    energy: parseFloat(document.getElementById("energy").value),
    last_energy: parseFloat(document.getElementById("last_energy").value),
    month: document.getElementById("month").value || now.toLocaleString("default", { month: "long", year: "numeric" }),
    date: document.getElementById("date").value || now.toLocaleDateString(),
    time: document.getElementById("time").value || now.toLocaleTimeString()
  };

  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  if (id) {
    const edit_text = "Add Entry";
    store.put(entry); // Update existing entry
    console.log("Entry updated successfully");
    document.querySelector("#submit").textContent = edit_text;
    delete e.target.dataset.editId; // Clear the edit ID flag
    displayEntries(); // Refresh the entries display
    e.target.reset(); // Reset the form
    //console.log("Id after reset is ", e.target.dataset.editId);
  }else {
    const entry = {
      energy: parseFloat(document.getElementById("energy").value),
      last_energy: parseFloat(document.getElementById("last_energy").value),
      month: document.getElementById("month").value || now.toLocaleString("default", { month: "long", year: "numeric" }),
      date: document.getElementById("date").value || now.toLocaleDateString(),
      time: document.getElementById("time").value || now.toLocaleTimeString()
    };
    addEntry(entry);  
  }
  // tx.oncomplete= () => displayEntries();
  // console.log("Entry added successfully");
  e.target.reset();

});


//handle export button
document.getElementById("export-button").addEventListener("click", () => {
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();

  request.onsuccess = () => {
    const entries = request.result;
    const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(entries));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    let dateTime = new Date().toISOString().replace(/[:.]/g, "-"); // Replace colons and dots for filename compatibility
    console.log("dato fecha y hora", dateTime);
    dlAnchor.setAttribute("download", "energy_entries_"+dateTime+".json");
    dlAnchor.click();
    console.log("Data exported successfully");
  };
});

//handle import button
document.getElementById("import-file").addEventListener("change",(event) => {
  const msgImportAlert = "Are you sure you want to import entries? This will overwrite existing data."

  if(!confirm(msgImportAlert)){
    document.getElementById("import-file").value = ""; // Clear the file input if import is cancelled
    return; 
  }
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const entries = JSON.parse(e.target.result);
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      entries.forEach(entry => {
        //ensure no duplicate id causes issues
        delete entry.id; // Remove id to let IndexedDB auto-increment
        store.add(entry);
      });

      tx.oncomplete = () => {
        alert("Entries imported successfully");
        displayEntries();
        const fileInput = document.getElementById("import-file");
        fileInput.value = ""; // Clear the file input after import
        document.getElementById("energy-form").style.display = "grid";
        showSection("entries"); // Show entries section after import
      };

      } catch (error) {
        alert("Error importing entries: " + error.message);
      }

    };
    reader.readAsText(file); 

});

function showSection(sectionId){
  document.querySelectorAll("main section").forEach(sec => sec.style.display = "none");
  document.getElementById(sectionId).style.display = "block";
}

document.getElementById("menu-home").addEventListener("click", () => {
  showSection("entries");
  document.getElementById("energy-form").style.display = "grid";
});

document.getElementById("export-data").addEventListener("click", () => {
  showSection("export-section");
  document.getElementById("energy-form").style.display = "none";
});

document.getElementById("import-data").addEventListener("click", () => {
  showSection("import-section");
  document.getElementById("energy-form").style.display = "none";
});

showSection("entries"); // Show entries section by default


//Initialize everything
openDB();



