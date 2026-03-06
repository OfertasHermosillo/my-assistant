// Updated app.js
// Fix budget expense store selector functionality

const storeSelect = document.getElementById('store-selector');

function updateStoreSelector(expense) {
    // Logic to update store selector based on expense
    if (expense) {
        storeSelect.value = expense.storeId;
    } else {
        storeSelect.value = '';
    }
}

function addEventHandlers() {
    const addExpenseButton = document.getElementById('add-expense');
    addExpenseButton.addEventListener('click', function() {
        const selectedStoreId = storeSelect.value;
        // Logic to handle adding the expense
        if (selectedStoreId) {
            console.log(`Store selected: ${selectedStoreId}`);
            // Call function to add the expense
        } else {
            console.error('No store selected.');
        }
    });
}

// Initialize event handlers
addEventHandlers();

// Other existing code...