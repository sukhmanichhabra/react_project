import React from "react";
import "./Transactions.css"; // <-- Import new CSS

// 1. Mock data added
const mockTransaction = {
  _id: "tx-mock-123456",
  date: new Date().toISOString(), // Use today's date
  propertyTitle: "Downtown Condo Sale (Mock)",
  amount: 250000,
  type: "sale",
  status: "completed",
};

const Transactions = ({ transactions = [] }) => {
  // 2. Combined mock data with prop data
  const allTransactions = [mockTransaction, ...transactions];

  const getStatusClass = (status) => {
    if (status === "completed") return "completed";
    if (status === "pending") return "pending";
    if (status === "cancelled") return "cancelled";
    return "";
  };

  // CSV Export function
  const exportToCSV = () => {
    if (allTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    // Define CSV headers
    const headers = ["Transaction ID", "Date", "Property", "Amount", "Type", "Status"];
    
    // Map transactions to CSV rows
    const rows = allTransactions.map((tx) => [
      tx._id,
      new Date(tx.date).toLocaleDateString(),
      tx.propertyTitle,
      `$${tx.amount.toLocaleString()}`,
      tx.type,
      tx.status,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma or quotes
            const escaped = String(cell).replace(/"/g, '""');
            return escaped.includes(",") || escaped.includes('"') || escaped.includes("\n")
              ? `"${escaped}"`
              : escaped;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="transactions" className="transactions-section">
      <div className="transactions-header">
        <div>
          <h2>Past Transactions</h2>
          <p>A history of all your sales and purchases.</p>
        </div>
        <button className="export-csv-btn" onClick={exportToCSV} title="Export transactions as CSV">
          <i className="fas fa-download"></i> Export as CSV
        </button>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Property</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.length > 0 ? (
                allTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{tx._id.slice(0, 10)}...</td>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.propertyTitle}</td>
                    <td>${tx.amount.toLocaleString()}</td>
                    <td>{tx.type}</td>
                    <td>
                      <span
                        className={`dash-status-badge ${getStatusClass(
                          tx.status
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
                    You have no transactions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Transactions;