let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let medicinesInventory = JSON.parse(localStorage.getItem('medicinesInventory')) || {};

function saveDataToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('medicinesInventory', JSON.stringify(medicinesInventory));
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function displayTransactions(transactionsToShow = transactions) {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    transactionsToShow.forEach((transaction, index) => {
        const profit = (transaction.sellingPrice - transaction.buyingPrice) * transaction.quantity;
        const totalAmount = transaction.quantity * transaction.sellingPrice;
        const amountPaid = transaction.amountPaid || 0;
        const amountPending = totalAmount - amountPaid;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${transaction.date}</td>
            <td>${transaction.customerName}</td>
            <td>${transaction.customerMobile}</td>
            <td>${transaction.medicine}</td>
            <td>${transaction.quantity}</td>
            <td>${transaction.buyingPrice}</td>
            <td>${transaction.sellingPrice}</td>
            <td>${profit}</td>
            <td>${amountPaid}</td>
            <td class="amount-pending" id="amountPending_${transaction.id}">${amountPending}</td>
            <td>${totalAmount}</td>
            <td class="actions">
                <button onclick="editTransaction(${index})">Edit</button>
                <button onclick="deleteTransaction(${index})">Delete</button>
            </td>
        `;

        const amountPendingElement = row.querySelector(`#amountPending_${transaction.id}`);
        if (amountPending > 0) {
            amountPendingElement.style.color = 'red';
        } else {
            amountPendingElement.style.color = 'black';
        }

        tableBody.appendChild(row);
    });
}


function displayInventory() {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    inventoryTableBody.innerHTML = '';

    const sortedMedicines = Object.keys(medicinesInventory).sort((a, b) => a.localeCompare(b));

    sortedMedicines.forEach((medicine, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${medicine}</td>
            <td>${medicinesInventory[medicine].quantity}</td>
            <td>${medicinesInventory[medicine].buyingPrice}</td>
            <td class="actions">
                <button onclick="editMedicine('${medicine}')">Edit</button>
                <button onclick="deleteMedicine('${medicine}')">Delete</button>
            </td>
        `;
        inventoryTableBody.appendChild(row);

        if (medicinesInventory[medicine].quantity === 0) {
            alert(`Alert: ${medicine} is out of stock.`);
        }
    });
}


document.getElementById('addTransactionBtn').addEventListener('click', () => {
    const modal = document.getElementById('transactionModal');
    modal.style.display = 'block';

    const customerNameInput = document.getElementById('customerNameInput');
    const customerMobileInput = document.getElementById('customerMobileInput');
    const medicinesContainer = document.getElementById('medicinesContainer');
    const addMedicineEntryBtn = document.getElementById('addMedicineEntryBtn');
    const saveTransactionBtn = document.getElementById('saveTransactionBtn');

    customerNameInput.value = '';
    customerMobileInput.value = '';
    medicinesContainer.innerHTML = `
        <div class="medicine-entry">
            <label for="medicineNameInput">Medicine Name:</label>
            <input type="text" class="medicineNameInput">
            <label for="medicineQuantityInput">Enter Quantity:</label>
            <input type="number" class="medicineQuantityInput">
            <label for="medicineSellingPriceInput">Selling Price:</label>
            <input type="number" class="medicineSellingPriceInput">
        </div>
    `;

    addMedicineEntryBtn.onclick = () => {
        const newMedicineEntry = document.createElement('div');
        newMedicineEntry.classList.add('medicine-entry');
        newMedicineEntry.innerHTML = `
            <label for="medicineNameInput">Medicine Name:</label>
            <input type="text" class="medicineNameInput">
            <label for="medicineQuantityInput">Enter Quantity:</label>
            <input type="number" class="medicineQuantityInput">
            <label for="medicineSellingPriceInput">Selling Price:</label>
            <input type="number" class="medicineSellingPriceInput">
        `;
        medicinesContainer.appendChild(newMedicineEntry);
    };

    saveTransactionBtn.onclick = () => {
        const customerName = customerNameInput.value;
        const customerMobile = customerMobileInput.value;
        const date = formatDate(new Date());

        let customerTransactions = [];
        const medicineEntries = document.querySelectorAll('.medicine-entry');

        medicineEntries.forEach(entry => {
            const medicine = entry.querySelector('.medicineNameInput').value;
            const quantity = parseInt(entry.querySelector('.medicineQuantityInput').value, 10);
            const sellingPrice = parseFloat(entry.querySelector('.medicineSellingPriceInput').value);

            if (!medicinesInventory[medicine]) {
                alert(`Medicine "${medicine}" not found in inventory.`);
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                alert('Invalid quantity. Please enter a valid number.');
                return;
            }

            if (medicinesInventory[medicine].quantity < quantity) {
                alert(`Insufficient quantity of ${medicine} in inventory.`);
                return;
            }

            const buyingPrice = medicinesInventory[medicine].buyingPrice;

            const transaction = {
                id: Date.now(), // Unique ID for the transaction
                customerName,
                customerMobile,
                medicine,
                quantity,
                buyingPrice,
                sellingPrice,
                amountPaid: 0, // Assuming amount paid needs to be entered separately
                date
            };

            customerTransactions.push(transaction);
            medicinesInventory[medicine].quantity -= quantity;
        });

        // Add all customer transactions to the main transactions array
        transactions.push(...customerTransactions);

        saveDataToLocalStorage();
        displayTransactions();
        displayInventory();

        modal.style.display = 'none'; // Close the modal
    };

    const closeModal = document.querySelector('.close');
    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
    populateMedicineOptions();
});

document.getElementById('addMedicineBtn').addEventListener('click', () => {
    const medicineName = document.getElementById('medicineName').value.trim();
    const medicineQuantity = parseInt(document.getElementById('medicineQuantity').value, 10);
    const medicineBuyingPrice = parseFloat(document.getElementById('medicineBuyingPrice').value);

    if (medicineName && !isNaN(medicineQuantity) && !isNaN(medicineBuyingPrice)) {
        if (medicinesInventory[medicineName]) {
            medicinesInventory[medicineName].quantity += medicineQuantity;
            medicinesInventory[medicineName].buyingPrice = medicineBuyingPrice;
        } else {
            medicinesInventory[medicineName] = {
                quantity: medicineQuantity,
                buyingPrice: medicineBuyingPrice
            };
        }
        saveDataToLocalStorage();
        displayInventory();

        // Clear input fields after adding medicine
        document.getElementById('medicineName').value = '';
        document.getElementById('medicineQuantity').value = '';
        document.getElementById('medicineBuyingPrice').value = '';
    } else {
        alert('Please enter valid medicine name, quantity, and buying price.');
    }
});


function editTransaction(index) {
    const transaction = transactions[index];
    const newCustomerName = prompt('Edit customer name:', transaction.customerName);
    const newCustomerMobile = prompt('Edit customer mobile number:', transaction.customerMobile);
    const newMedicine = prompt('Edit medicine name:', transaction.medicine);
    const newQuantity = parseInt(prompt('Edit quantity sold:', transaction.quantity), 10);
    const newBuyingPrice = parseFloat(prompt('Edit buying price per unit:', transaction.buyingPrice));
    const newSellingPrice = parseFloat(prompt('Edit selling price per unit:', transaction.sellingPrice));
    const newAmountPaid = parseFloat(prompt('Edit amount paid:', transaction.amountPaid));
    const newDate = formatDate(new Date());

    transactions[index] = {
        ...transaction,
        customerName: newCustomerName,
        customerMobile: newCustomerMobile,
        medicine: newMedicine,
        quantity: newQuantity,
        buyingPrice: newBuyingPrice,
        sellingPrice: newSellingPrice,
        amountPaid: newAmountPaid,
        date: newDate
    };
    saveDataToLocalStorage();
    displayTransactions();
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveDataToLocalStorage();
    displayTransactions();
}

function editMedicine(medicine) {
    const newQuantity = parseInt(prompt(`Edit quantity for ${medicine}:`, medicinesInventory[medicine].quantity), 10);
    const newBuyingPrice = parseFloat(prompt(`Edit buying price for ${medicine}:`, medicinesInventory[medicine].buyingPrice));

    if (!isNaN(newQuantity) && !isNaN(newBuyingPrice)) {
        medicinesInventory[medicine].quantity = newQuantity;
        medicinesInventory[medicine].buyingPrice = newBuyingPrice;
        saveDataToLocalStorage();
        displayInventory();
    } else {
        alert('Please enter a valid quantity and buying price.');
    }
}

function deleteMedicine(medicine) {
    if (confirm(`Are you sure you want to delete ${medicine} from inventory?`)) {
        delete medicinesInventory[medicine];
        transactions = transactions.filter(transaction => transaction.medicine !== medicine);
        saveDataToLocalStorage();
        displayTransactions();
        displayInventory();
    }
}


// Adjusted event listener for search input
document.getElementById('searchInput').addEventListener('input', searchTransactions);

// Function to filter transactions by customer name
function searchTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredTransactions = transactions.filter(transaction =>
        transaction.customerName.toLowerCase().includes(searchTerm)
    );
    displayTransactions(filteredTransactions);
}
// Event listener for Sales Report generation
document.getElementById('generateReportBtn').addEventListener('click', generateReportBtn);

// Event listener for Monthly Profit Report generation
document.getElementById('generateMonthlyProfitReportBtn').addEventListener('click', generateMonthlyProfitReportBtn);

function generateReportBtn() {
    const medicineName = document.getElementById('reportMedicineName').value.trim().toLowerCase();
    const filteredTransactions = transactions.filter(transaction => transaction.medicine.toLowerCase() === medicineName);

    const monthlyReport = filteredTransactions.reduce((report, transaction) => {
        const [day, month, year] = transaction.date.split('/');
        const monthYear = `${month}/${year}`;

        if (!report[monthYear]) {
            report[monthYear] = { quantitySold: 0, totalSales: 0, totalProfit: 0 };
        }

        report[monthYear].quantitySold += transaction.quantity;
        report[monthYear].totalSales += transaction.quantity * transaction.sellingPrice;
        report[monthYear].totalProfit += (transaction.sellingPrice - transaction.buyingPrice) * transaction.quantity;

        return report;
    }, {});

    const reportTableBody = document.getElementById('salesReportTableBody');
    reportTableBody.innerHTML = '';

    Object.keys(monthlyReport).forEach(monthYear => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${monthYear}</td>
            <td>${monthlyReport[monthYear].quantitySold}</td>
            <td>${monthlyReport[monthYear].totalSales}</td>
            <td>${monthlyReport[monthYear].totalProfit}</td>
        `;
        reportTableBody.appendChild(row);
    });
}

function generateMonthlyProfitReportBtn() {
    const reportMonth = document.getElementById('reportMonth').value.trim();
    const filteredTransactions = transactions.filter(transaction => {
        const [day, month, year] = transaction.date.split('/');
        return `${month}/${year}` === reportMonth;
    });

    const totalProfit = filteredTransactions.reduce((profit, transaction) => {
        return profit + (transaction.sellingPrice - transaction.buyingPrice) * transaction.quantity;
    }, 0);

    const reportTableBody = document.getElementById('monthlyProfitReportTableBody');
    reportTableBody.innerHTML = '';

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${reportMonth}</td>
        <td>${totalProfit}</td>
    `;
    reportTableBody.appendChild(row);
}




window.onload = () => {
    displayTransactions();
    displayInventory();
};


