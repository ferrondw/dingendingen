document.addEventListener("DOMContentLoaded", () => {
    const itemsContainer = document.querySelector(".dingendingen");
    const localStorageKey = "dingendingenValue";
    let itemsData = [];
    
    async function loadItems() {
        try {
            const data = await getItems(); // Wait for the data to be fetched
            console.log("Data structure:", data);  // Inspect the structure of data
    
            // Check if 'items' exists and is an array before proceeding
            if (!data || !Array.isArray(data.items)) {
                console.error("Items data is missing or is not an array", data);
                return; // Exit early if the structure is incorrect
            }
    
            // Ensure all items have the "hidden" property
            data.items = data.items.map(item => ({
                text: item.text || item, // Handle old structure.
                hidden: item.hidden || false,
            }));
    
            itemsData = data.items;
            renderItems();
        } catch (error) {
            console.error("Error loading items:", error);
        }
    }
    

    // Render items on the page
    function renderItems() {
        itemsContainer.innerHTML = ""; // Clear existing items
        itemsData.forEach((item, index) => {
            if (!item.hidden) {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("item");
                itemDiv.innerHTML = `
                    <div class="checkmark">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                            <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                        </svg>
                    </div>
                    <p>${item.text}</p>
                    <button class="delete">×</button>
                `;
                itemDiv.addEventListener("click", () => toggleActive(itemDiv, index));
                itemDiv.querySelector(".delete").addEventListener("click", () => hideItem(index));
                itemsContainer.appendChild(itemDiv);

                // Restore active state
                if (isItemActive(index)) {
                    itemDiv.classList.add("active");
                }
            }
        });

        const addDiv = document.createElement("div");
        addDiv.classList.add("add-item");
        addDiv.innerHTML = `
            <input type="text" class="add-input" placeholder="Add new item..." />
            <button class="add">+</button>
        `;
        addDiv.querySelector(".add").addEventListener("click", () => addNewItem());
        itemsContainer.appendChild(addDiv);
    }

    // Toggle active state
    function toggleActive(itemDiv, index) {
        const nSquared = Math.pow(2, index + 1);
        if (itemDiv.classList.contains("active")) {
            itemDiv.classList.remove("active");
            updateLocalStorage(-nSquared);
        } else {
            itemDiv.classList.add("active");
            updateLocalStorage(nSquared);
        }
    }

    // Append a new item
    function appendItem(text) {
        if (!text.trim()) return; // Ignore empty input
        itemsData.push({ text: text, hidden: false });
        saveItems();
        renderItems();
    }

    function hideItem(index) {
        fetch(`/api/items/${index}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(deletedItem => {
                // Set the item's "hidden" property to true
                itemsData[index].hidden = true;
                renderItems();  // Re-render the items to reflect the deletion
            })
            .catch(err => console.error('Error deleting item:', err));
    }
    

    // Save items to JSON file (simulated via POST request)
    async function saveItems() {
        try {
            await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: itemsData }),
            });
        } catch (error) {
            console.error("Failed to save items:", error);
        }
    }

    // Update localStorage with cumulative value
    function updateLocalStorage(delta) {
        let cumulativeValue = parseInt(localStorage.getItem(localStorageKey), 10) || 0;
        cumulativeValue += delta;
        localStorage.setItem(localStorageKey, cumulativeValue);
    }

    // Check if an item is active
    function isItemActive(index) {
        const cumulativeValue = parseInt(localStorage.getItem(localStorageKey), 10) || 0;
        const nSquared = Math.pow(2, index + 1);
        return !!(cumulativeValue & nSquared);
    }

    // Load items on page load
    loadItems();


    function addNewItem() {
        const input = document.querySelector('.add-item input');
        const text = input.value.trim(); // Get the value from the input field and trim any excess spaces
    
        if (!text) return; // If the input is empty, return early
    
        fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text }) // Send the text inside an object
        })
        .then(response => response.json())
        .then(newItem => {
            // Add the new item to the array and re-render the list
            itemsData.push(newItem);  
            renderItems();
            input.value = ''; // Clear the input field after adding
        })
        .catch(err => console.error('Error adding item:', err));
    }
    

    async function getItems() {
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            console.log("Fetched data:", data);  // Log the entire response for inspection
            return data;  // Return the parsed data
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    }
    
});
