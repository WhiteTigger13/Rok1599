document.addEventListener("DOMContentLoaded", () => {
    const datasetSelect = document.getElementById("dataset-select");
    const searchInput = document.getElementById("table-filter");
    const tableHeaders = document.getElementById("table-headers");
    const tableBody = document.getElementById("table-body");
    const downloadButton = document.getElementById("download-button");

    let tableData = []; // To store the currently loaded table data
    let currentHeaders = []; // To store the headers

    const datasets = [
        { name: "Dataset 1", file: "data/dataset1.csv", uploadDate: "2024-11-20" },
        { name: "Dataset 2", file: "data/dataset2.csv", uploadDate: "2024-11-21" }
    ];

    datasets.forEach((dataset, index) => {
        const option = document.createElement("option");
        option.value = dataset.file;
        option.textContent = `${dataset.name} (Uploaded: ${dataset.uploadDate})`;
        datasetSelect.appendChild(option);

        if (index === 0) loadDataset(dataset.file);
    });

    datasetSelect.addEventListener("change", (event) => {
        const selectedFile = event.target.value;
        loadDataset(selectedFile);
    });

    searchInput.addEventListener("input", (event) => {
        filterTable(event.target.value);
    });

    downloadButton.addEventListener("click", () => {
        downloadTableAsExcel();
    });

    function loadDataset(file) {
        fetch(file)
            .then(response => response.text())
            .then(csvText => {
                const rows = csvText.split("\n").map(row => row.split(","));
                currentHeaders = rows.shift(); // Save headers
                tableData = rows; // Save table data
                renderTable(currentHeaders, tableData); // Render the full table on load
            })
            .catch(err => console.error("Error loading CSV:", err));
    }

    function renderTable(headers, rows) {
        tableHeaders.innerHTML = "";
        headers.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header.trim();
            tableHeaders.appendChild(th);
        });

        renderTableBodyWithHighlight(rows, ""); // Render the table without highlighting initially
    }

    function filterTable(query) {
        if (!query) {
            // If the filter is empty, render the full table without highlights
            renderTableBodyWithHighlight(tableData, "");
            return;
        }

        // Filter rows based on the query
        const filteredRows = tableData.filter(row =>
            row.some(cell => cell.toLowerCase().includes(query.toLowerCase()))
        );

        renderTableBodyWithHighlight(filteredRows, query); // Pass the query for highlighting
    }

    function renderTableBodyWithHighlight(rows, query) {
        tableBody.innerHTML = ""; // Clear the table body before rendering

        rows.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(cell => {
                const td = document.createElement("td");

                // Highlight cells containing the query (case insensitive)
                if (query && cell.toLowerCase().includes(query.toLowerCase())) {
                    td.style.backgroundColor = "yellow"; // Highlight the cell with yellow
                }

                td.textContent = cell.trim();
                tr.appendChild(td);
            });
            tableBody.appendChild(tr); // Add the row to the table body
        });
    }

    function downloadTableAsExcel() {
        const rows = []; // To store the filtered table rows

        // Add headers as the first row
        const headers = Array.from(tableHeaders.children).map(th => th.textContent);
        rows.push(headers);

        // Add visible rows (those in the DOM) to the rows array
        const visibleRows = Array.from(tableBody.querySelectorAll("tr")); // Select only visible rows
        visibleRows.forEach(tr => {
            const row = Array.from(tr.children).map(td => td.textContent);
            rows.push(row);
        });

        // Convert the rows array to CSV format
        const csvContent = rows.map(row => row.join(",")).join("\n");

        // Create a Blob object for the CSV data
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        // Create a temporary link element
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "filtered_table_data.csv");
        document.body.appendChild(link);

        // Trigger the download and remove the link
        link.click();
        document.body.removeChild(link);
    }
});
