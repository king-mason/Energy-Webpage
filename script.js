
let energyPrice = 0.1634;


function addRow() {
    const tableBody = document.querySelector('#devicesTable tbody');

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="deviceName" placeholder="E.g., Fridge"></td>
        <td><div class="amount-container">
        <button class="amount-button" onclick="changeAmount(this, -1)">-</button>
        <span class="amount-text">1</span>
        <button class="amount-button" onclick="changeAmount(this, 1)">+</button>
        </div></td>
        <td><input type="number" onblur="if (this.value < 0) this.value = 0" class="powerRating" placeholder="Enter power rating"></td>
        <td><input type="number" onblur="hourConstraints(this)" class="hoursPerDay" placeholder="Enter hours per day"></td>
        <td class="calculation energyUseJ">0</td>
        <td class="calculation energyUsekWh">0.00</td>
        <td class="calculation energyCost">$0.00</td>
        <td><button id="removeButton" onclick="removeRow(this)">Remove</button></td>
    `;

    newRow.querySelectorAll('input').forEach(input => {

        input.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                input.blur();
            }
        });

        input.addEventListener('blur', function (event) {
            updateEnergyCost(event.target);
        });

    });

    tableBody.appendChild(newRow);
}

function removeRow(button) {
    const row = button.parentNode.parentNode;

    if (document.querySelectorAll('#devicesTable tbody tr').length < 2) {
        return;
    }
    row.parentNode.removeChild(row);
    calculateTotal()
}

document.addEventListener('DOMContentLoaded', addRow)

function updateEnergyCost(input) {
    const row = input.closest('tr');
    const amount = parseFloat(row.querySelector('.amount-text').textContent) || 1;
    const powerRating = parseFloat(row.querySelector('.powerRating').value) || 0;
    const hoursPerDay = parseFloat(row.querySelector('.hoursPerDay').value) || 0;
    const energyUseJ = (30 * amount * powerRating * hoursPerDay * 3600).toFixed(0);
    const energyUsekWh = (30 * amount * powerRating * hoursPerDay / 1000).toFixed(2);
    const energyCost = (energyUsekWh * energyPrice).toFixed(2);
    
    row.querySelector('.energyUseJ').textContent = energyUseJ;
    row.querySelector('.energyUsekWh').textContent = energyUsekWh;
    row.querySelector('.energyCost').textContent = '$' + energyCost;
    
    calculateTotal()
}

function calculateTotal() {
    energyUseElements = document.querySelectorAll('.energyUsekWh');
    energyCostElements = document.querySelectorAll('.energyCost');

    let totalEnergyUsage = 0;
    let totalEnergyCost = 0;

    energyUseElements.forEach(useAmount => {
        totalEnergyUsage += parseFloat(useAmount.textContent) || 0;
    });

    energyCostElements.forEach(costAmount => {
        totalEnergyCost += parseFloat(costAmount.textContent.replace(/[^0-9.]/g, '')) || 0;
    });

    document.getElementById('totalEnergyUse').textContent = totalEnergyUsage.toFixed(2);
    document.getElementById('totalEnergyCost').textContent = '$' + totalEnergyCost.toFixed(2);

}

function hourConstraints(input) {
    if(input.value > 24) {
        input.value = 24;
    }
    if (input.value < 0) {
        input.value = 0
    }
}

function sortTable() {
    console.log('Sorting table...');

    const tableBody = document.querySelector('#devicesTable tbody');

    // Get all rows from the table and convert to an array for sorting
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    // Sort the rows based on the selected option
    rows.sort((a, b) => {
        const aValue = parseFloat(a.cells[6].textContent.replace(/[^0-9.]/g, '')) || 0;
        const bValue = parseFloat(b.cells[6].textContent.replace(/[^0-9.]/g, '')) || 0;
        
        return bValue - aValue;
    });

    // Append sorted rows back to the table
    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
};

function changeAmount(input, amount) {
    const row = input.closest('tr');
    const inputElement = row.querySelector('.amount-text');
    let currentValue = parseInt(inputElement.textContent) || 1;
    currentValue += amount;
    if (currentValue < 1) currentValue = 1;
    inputElement.textContent = currentValue;
    updateEnergyCost(input);
}

function toggleEditPrice() {
    const editPriceContainer = document.getElementById('edit-price-container');
    const currentPriceContainer = document.getElementById('price-container');
    const customPriceInput = document.getElementById('custom-price');

    customPriceInput.value = energyPrice * 100;

    if (editPriceContainer.style.display === 'none') {
        // Show the edit price container and hide the current price
        editPriceContainer.style.display = 'inline';
        currentPriceContainer.style.display = 'none';
    } else {
        // Hide the edit price container and show the current price
        editPriceContainer.style.display = 'none';
        currentPriceContainer.style.display = 'inline';
    }
}

function updateCustomPrice() {
    const customPriceInput = document.getElementById('custom-price');
    const currentPrice = document.getElementById('current-price');

    const customPrice = parseFloat(customPriceInput.value).toFixed(2) || 1;

    if (isNaN(customPrice) || customPrice < 1) customPrice = 1;
    currentPrice.textContent = customPrice + ' ¢ per kWh';
    energyPrice = customPrice / 100;

    const rows = document.querySelectorAll('#devicesTable tbody tr');
    rows.forEach(row => updateEnergyCost(row));

    toggleEditPrice();
}
