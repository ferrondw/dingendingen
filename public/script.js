document.addEventListener("DOMContentLoaded", () => {
    const itemsContainer = document.querySelector(".dingendingen");
    let itemsData = [];

    loadItems();

    async function loadItems() {
        try {
            const data = await getItems();
            console.log("Data structure:", data);

            if (!data || !Array.isArray(data.items)) {
                console.error("Items data is missing or is not an array", data);
                return;
            }

            data.items = data.items.map(item => ({
                text: item.text || item,
                hidden: item.hidden || false,
                checked: item.checked || false
            }));

            itemsData = data.items;
            renderItems();
        } catch (error) {
            console.error("Error loading items:", error);
        }
    }


    function renderItems() {
        itemsContainer.innerHTML = ""; itemsData.forEach((item, index) => {
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

    function toggleActive(itemDiv, index) {
        if (itemDiv.classList.contains("active")) {
            itemDiv.classList.remove("active");
            setValue(index, false);
        } else {
            itemDiv.classList.add("active");
            setValue(index, true);
        }

    }

    function hideItem(index) {
        fetch(`/api/items/${index}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(deletedItem => {
                itemsData[index].hidden = true;
                renderItems();
            })
            .catch(err => console.error('Error deleting item:', err));
    }

    function isItemActive(index) {
        return itemsData[index].checked;
    }

    function addNewItem() {
        const input = document.querySelector('.add-item input');
        const text = input.value.trim();
        if (!text) return;
        fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        })
            .then(response => response.json())
            .then(newItem => {
                itemsData.push(newItem);
                renderItems();
                input.value = '';
            })
            .catch(err => console.error('Error adding item:', err));
    }


    async function getItems() {
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            console.log("Fetched data:", data); return data;
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    }

    async function setValue(index, checked) {
        try {
            fetch(`/api/items/${index}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ checked: checked })
            })
                .catch(err => console.error('Error adding item:', err));
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    }
});
