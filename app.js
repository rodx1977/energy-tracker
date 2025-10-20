//constants and variables
const { dbName: DB_NAME, dbVersion: DB_VERSION, storeName: STORE_NAME} = CONFIG;
// months of the year array
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const genSettings = JSON.parse(localStorage.getItem("energyTrackerSettings"));
const ENERGY_COST_PER_KWH = genSettings?.costperkwh ? parseFloat(genSettings.costperkwh) : 0.099166; // default cost if not set in settings
let db;
//paginate entries
let currentPage = 1;
let itemsPerPageSelectedValue = 3;
let lastMonthEnergyInput = "";
let editMode = false;
let energyChart = null;
let chartTypeSelected = "kw-hour"; // default chart type


//FUNCTIONS

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
    
    displayEntries();
    document.getElementById("items-per-page").value = itemsPerPageSelectedValue;
    document.getElementById("chart-data-selector").value = chartTypeSelected;
    
  }

  request.onupgradeneeded = (event) => { 
    db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      console.log("Object store created");
    }       

    
  }

  // get the user first name
  getGreetingName();

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

//function to create paginator buttons
function createPaginator(totalPages){
  console.log("Creating paginator for total pages:", totalPages); 
  const paginatorSection = document.getElementById("paginator-section");
  paginatorSection.innerHTML = "";
  //si la cantidad de paginas es 1 o menor, el paginador no se muestra
  if(totalPages <= 1){
    paginatorSection.style.display = "none";
    return;
  }
  paginatorSection.style.display = "block";
  const paginatorTextLine = document.createElement("span");
  paginatorTextLine.className = "paginator-text";
  paginatorTextLine.textContent = "Page "+currentPage+" of "+totalPages+": ";
  paginatorSection.appendChild(paginatorTextLine);
  
  // create button for each page
  for(let i=1; i<= totalPages; i++){
    const button = document.createElement("button");
    button.textContent = i;
    button.className = "paginator-btn";
    if(i === currentPage) button.disabled = true; // disable current page button
    button.addEventListener("click", () => {
      currentPage = i;
      displayEntries();
    });    
    paginatorSection.appendChild(button);
  }
}

//Display entries in the table
function displayEntries() {
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  

  request.onsuccess = () => {    
    const entries = request.result;
    console.log("number of entries:", entries.length);
    //sort the entries by month, date and time
    entries.sort((a, b) => {
      let dateA = new Date(`${a.date} ${a.time}`);
      let dateB = new Date(`${b.date} ${b.time}`);
      return dateB-dateA; // Sort in descending order
    });

    //pagination logic
    const totalPages = Math.ceil(entries.length / itemsPerPageSelectedValue);
    if (currentPage > totalPages) currentPage = totalPages; // Adjust current page if out of bounds
    if (currentPage < 1) currentPage = 1;
    const startIndex = (currentPage - 1) * itemsPerPageSelectedValue;
    const paginatedEntries = entries.slice(startIndex, startIndex + itemsPerPageSelectedValue);
    console.log(`Displaying page ${currentPage} of ${totalPages}`);

    createPaginator(totalPages); // Create or update paginator buttons

    const entryCounter = document.getElementById("saved-energy-entry-counter");
    entryCounter.textContent = entries.length > 0 ? entries.length : "";
  
    
    const tbody = document.getElementById("entry-list");
    tbody.innerHTML = "";

    lastMonthEnergyInput = entries.length > 0 ? entries[0].energy : "";
    console.log("Last month energy input set to:", lastMonthEnergyInput);

    paginatedEntries.forEach((entry) => {
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
      editMode = true;
      
    } else {
      console.error("Entry not found");
    }
  };
}

function deleteEntry(id){
  const msg="Are you sure you want to delete this entry? ";
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

//function render charts
function renderCharts(){
  // Placeholder for chart rendering logic
  console.log("Render charts function called");

  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();

  request.onsuccess = () => {
    let entries = request.result;

    entries.forEach((entry) => {
      const delta = entry.energy - entry.last_energy;
      const energyCost = delta * ENERGY_COST_PER_KWH; // example rate: $0.12/kWh
      entry.delta = delta;
      entry.energyCost = energyCost.toFixed(2).toLocaleString("en-US",{style: "currency", currency:"USD"});
    });
    //sort the entries by month, date and time
    entries.sort((a, b) => {
      let dateA = new Date(`${a.date} ${a.time}`);
      let dateB = new Date(`${b.date} ${b.time}`);
      return dateB-dateA; // Sort in descending order
    });
    if(entries.length > 12){
      console.log("Limiting entries to last 12 for chart display");
      entries = entries.slice(0,12); // Show only the last 12 entries
    }
    // renderCharts(entries);
    const labels = entries.map(e => e.date);
    const energyValue = entries.map(e => e.delta);
    const costValue = entries.map(e => e.energyCost);
    let chartValue;
    let labelText;
    switch(chartTypeSelected){
    
    case "kw-hour":
      console.log("Rendering Kw/H chart");
      chartValue = energyValue;
      labelText = "Kilowatts";
      displayText = "Monthly energy usage";
      break;
    case "cost":
      console.log("Rendering Cost chart");
      chartValue = costValue;
      labelText = "Energy Cost in USD";
      displayText = "Monthly energy costs";
      break;
    default:
      console.log("Unknown chart type, defaulting to Kw/H");
      chartTypeSelected = "kw-hour";
      chartValue = energyValue;
      displayText = "Monthly energy usage";
  }
    const ctx = document.getElementById("energyChart").getContext("2d");
    if(energyChart){
    console.log("canvas existe, se destruye");
    energyChart.destroy(); // Destroy previous chart instance if it exists    
  };
  energyChart = new Chart(ctx,{
    type:"bar",
    data:{
      labels: labels,
      datasets:[{
        label: labelText,
        data: chartValue,
        borderColor: "rgba(75, 192, 192, 1)",
        fill: true,
        tension: 0.2
      }]
    },
    options:{
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: displayText }
      }

    }
  });


  };  
}

// render months checkboxes in settings
function renderMonthsCheckBoxes(){
  console.log("Rendering months checkboxes");
  ["hottest-months","coolest-months"].forEach(Id => {
    const container = document.getElementById(Id);
    container.innerHTML = MONTHS.map(month => `<label><input type="checkbox" name="${month}" />${month}</label>`).join("");
    
  });
}

function makeCoolestMonthsReadOnly(containerId){
  document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
    cb.disabled = true;  
  });
}

// get selected months from checkboxes
function getSelectedMonths(containerId){
  return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`)).map(cb => cb.name);
}

//get non selected months that represent coolest months
function getCoolestSelectedMonths(containerId){
  return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:not(:checked)`)).map(cb => cb.name);
  
}

function setSelectedMonths(containerId, selectedMonths=[]){
  document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
    cb.checked = selectedMonths.includes(cb.name);  
  });
  
}

// get settings data from localstorage
function getSettingsData(){
  console.log("Getting settings data from localStorage");
  const settings = JSON.parse(localStorage.getItem("energyTrackerSettings"));
  if(!settings) return;
  document.getElementById("username").value = settings.username || "";
  document.getElementById("mygoalchoice").value = settings?.mygoalchoice || "";
  document.getElementById("cost-per-kilowatt").value = settings?.costperkwh || "";
  document.getElementById("mygoal-hottest-months").value = settings.mygoalhottestmonths || "";
  document.getElementById("mygoal-coolest-months").value = settings.mygoalcoolestmonths || "";

  // get hottest months checkboxes here
  // get coolest months checkboxes here
  setSelectedMonths("hottest-months", settings.hottestmonths);
  setSelectedMonths("coolest-months", settings.coolestmonths);
  
  document.getElementById("measure-date").value = settings.measuredate || 15;
  document.getElementById("measure-date-value").textContent = settings.measuredate || 15;
  document.getElementById("enable-notifications").value = settings.enablenotifications || "";
  document.getElementById(settings?.exportoption).checked = true;
}

function getGreetingName(){
  const settings = JSON.parse(localStorage.getItem("energyTrackerSettings"));
  const greetingFirstName = document.querySelector(".greetings");
  if(settings?.username){
    const justName = settings.username.split(" ")[0]; // Get first name only
    console.log("User first name for greeting:", justName);
    greetingFirstName.textContent = " "+justName+"!";
    // return justName;
  }else{
  greetingFirstName.textContent =  " Dear User!";
  }   
  
}

//handle last month energy input auto fill
document.getElementById("energy").addEventListener("input", (e) => {
  console.log("Energy input changed:", e.target.value);
  if(!editMode){
    document.getElementById("last_energy").value = lastMonthEnergyInput || 0;
  }
  
});


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
    e.target.reset(); // Reset the form
    editMode = false; // exit edit mode
    displayEntries(); // Refresh the entries display    
    //console.log("Id after reset is ", e.target.dataset.editId);
  }else {
    console.log("se esta ingresando nuevo registro:");
    const entry = {
      energy: parseFloat(document.getElementById("energy").value),
      last_energy: parseFloat(document.getElementById("last_energy").value),
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString()
    };
    addEntry(entry); 
    e.target.reset(); // Reset the form 
  }
  // tx.oncomplete= () => displayEntries();
  console.log("edit mode is ", editMode);
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
  const msgImportAlert = "Are you sure you want to import this energy data? This will overwrite existing data."

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

// menu toggling when mobile view
function toggleNavMenu(){
  const nav = document.querySelector("#nav-menu");
  if(nav.style.display === "flex"){
    nav.style.display = "none";
  }else{
    nav.style.display = "flex";
  } 
}

// highlight the curent menu where the page is at the moment
function selectActiveMenu(currentMenu){
  const menuItem = document.querySelectorAll(".m-navitem");
  menuItem.forEach(mItem => mItem.classList.remove("m-active"));
  currentMenu.classList.add("m-active");
  
}

document.getElementById("menu-home").addEventListener("click", () => {
  const currentMenu = document.getElementById("menu-home");
  showSection("entries");
  selectActiveMenu(currentMenu);
  document.getElementById("energy-form").style.display = "grid";
});

document.getElementById("menu-charts").addEventListener("click", () => {
  const currentMenu = document.getElementById("menu-charts")
  showSection("charts-section");
  selectActiveMenu(currentMenu);
  document.getElementById("energy-form").style.display = "none";

  // const tx = db.transaction(STORE_NAME, "readonly");
  // const store = tx.objectStore(STORE_NAME);
  // const request = store.getAll();

  // request.onsuccess = () => {
  //   let entries = request.result;

  //   entries.forEach((entry) => {
  //     const delta = entry.energy - entry.last_energy;
  //     const energyCost = delta * ENERGY_COST_PER_KWH; // example rate: $0.12/kWh
  //     entry.delta = delta;
  //     entry.energyCost = energyCost;
  //   });
  //   //sort the entries by month, date and time
  //   entries.sort((a, b) => {
  //     let dateA = new Date(`${a.date} ${a.time}`);
  //     let dateB = new Date(`${b.date} ${b.time}`);
  //     return dateB-dateA; // Sort in descending order
  //   });
  //   if(entries.length > 12){
  //     console.log("Limiting entries to last 12 for chart display");
  //     entries = entries.slice(0,12); // Show only the last 12 entries
  //   }
  //   renderCharts(entries);
  // };
  renderCharts();
});

document.getElementById("menu-datamanage").addEventListener("click", () => {
  const currentMenu = document.getElementById("menu-datamanage");
  selectActiveMenu(currentMenu);
  //showSection("export-section");
  document.getElementById("energy-form").style.display = "none";
});

document.getElementById("export-data").addEventListener("click", () => {
  const currentMenu = document.getElementById("menu-datamanage");
  selectActiveMenu(currentMenu);
  showSection("export-section");
  document.getElementById("energy-form").style.display = "none";
});

document.getElementById("import-data").addEventListener("click", () => {
  const currentMenu = document.getElementById("menu-datamanage");
  showSection("import-section");
  selectActiveMenu(currentMenu);
  document.getElementById("energy-form").style.display = "none";
});

document.getElementById("menu-settings").addEventListener("click", () => {
  const currentMenu = document.getElementById("menu-settings");
  showSection("settings-section");
  selectActiveMenu(currentMenu);
  renderMonthsCheckBoxes();  
  makeCoolestMonthsReadOnly("coolest-months");
  document.getElementById("energy-form").style.display = "none";
  getSettingsData();
});

document.getElementById("items-per-page").addEventListener("change", () => {
  console.log("Items per page changed");
  let selectedValue = parseInt(document.getElementById("items-per-page").value);
  itemsPerPageSelectedValue = selectedValue;
  displayEntries();

});

document.getElementById("chart-data-selector").addEventListener("change", () => {
  console.log("Chart selector changed");
  let selectedValue = document.getElementById("chart-data-selector").value;
  chartTypeSelected = selectedValue;
  console.log("Chart type selected is:", chartTypeSelected);


  // const tx = db.transaction(STORE_NAME, "readonly");
  // const store = tx.objectStore(STORE_NAME);
  // const request = store.getAll();

  // request.onsuccess = () => {
  //   let entries = request.result;

  //   entries.forEach((entry) => {
  //     const delta = entry.energy - entry.last_energy;
  //     const energyCost = delta * ENERGY_COST_PER_KWH; // example rate: $0.12/kWh
  //     entry.delta = delta;
  //     entry.energyCost = energyCost.toFixed(2).toLocaleString("en-US",{style: "currency", currency:"USD"});
  //   });
  //   //sort the entries by month, date and time
  //   entries.sort((a, b) => {
  //     let dateA = new Date(`${a.date} ${a.time}`);
  //     let dateB = new Date(`${b.date} ${b.time}`);
  //     return dateB-dateA; // Sort in descending order
  //   });

  //   if(entries.length > 12){
  //     console.log("Limiting entries to last 12 for chart display");
  //     entries = entries.slice(0,12); // Show only the last 12 entries
  //   }
  //   renderCharts(entries);
  //   // document.getElementById("chart-data-selector").value = "kw-hour"; // Ensure the selector reflects the current chart type
  // };
  renderCharts();
  
});

// Mobile menu toggle
document.getElementById("menu-opener-mobile").addEventListener("click", (e) => {
  // e.preventDefault();
  console.log("Mobile menu toggled");
  toggleNavMenu();
});

showSection("entries"); // Show entries section by default

//get the day selected when using range input
document.getElementById("measure-date").addEventListener("input", (e) => {
  const dayValue = e.target.value;
  document.getElementById("measure-date-value").textContent = dayValue;
});

// set settings on submit
document.getElementById("settings-form").addEventListener("submit", (e) => {
  console.log("Settings form submitted");
  e.preventDefault();
  const settings = {
    username: document.getElementById("username").value,
    mygoalchoice: document.getElementById("mygoalchoice").value,
    costperkwh: document.getElementById("cost-per-kilowatt").value,
    mygoalhottestmonths: document.getElementById("mygoal-hottest-months").value,
    mygoalcoolestmonths: document.getElementById("mygoal-coolest-months").value,
    measuredate: document.getElementById("measure-date").value,
    enablenotifications: document.getElementById("enable-notifications").value,
    exportoption: document.querySelector('input[name="export-option"]:checked')?.value || "local",
    hottestmonths: getSelectedMonths("hottest-months"),
    coolestmonths: getCoolestSelectedMonths("hottest-months"),
  };
  console.log("coolest months selected are:", settings.coolestmonths);
  console.log("hottest months selected are:", settings.hottestmonths);
  localStorage.setItem("energyTrackerSettings", JSON.stringify(settings));
  alert("Settings saved successfully");
  setSelectedMonths("coolest-months", settings.coolestmonths); // update coolest months checkboxes

});
//Initialize everything
openDB();
setFooterText();





