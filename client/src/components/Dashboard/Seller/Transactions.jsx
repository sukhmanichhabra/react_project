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

  return (
    <section id="transactions" className="transactions-section">
      <div className="transactions-header">
        <h2>Past Transactions</h2>
        <p>A history of all your sales and purchases.</p>
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