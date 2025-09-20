import React from 'react';

const TestReceipt = () => {
  const sampleData = [
    { type: 'Expense', amount: '2,499', description: 'Swiggy Order', category: 'Food & Dining', paymentMethod: 'UPI', date: '25-07-2025' },
    { type: 'Income', amount: '15,000', description: 'Freelance Logo Design', category: 'Freelancing', paymentMethod: 'Bank Transfer', date: '20-07-2025' },
    { type: 'Expense', amount: '999', description: 'Netflix Subscription', category: 'Entertainment', paymentMethod: 'Credit Card', date: '22-07-2025' },
    { type: 'Expense', amount: '3,600', description: 'Electricity Bill', category: 'Utilities', paymentMethod: 'Debit Card', date: '15-07-2025' },
    { type: 'Income', amount: '50,000', description: 'Monthly Salary', category: 'Salary', paymentMethod: 'Bank Transfer', date: '01-07-2025' },
  ];

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <div className="mb-6 flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold">Test Receipt Generator</h1>
        <button 
          onClick={printPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save as PDF
        </button>
      </div>
      
      <div className="receipt-content">
        <h2 className="text-xl font-bold mb-4 text-center">Transaction Receipt</h2>
        <p className="text-center text-gray-600 mb-6">July 2025 - Financial Summary</p>
        
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Amount (₹)</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Payment Method</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{row.type}</td>
                <td className="border border-gray-300 px-4 py-2">{row.amount}</td>
                <td className="border border-gray-300 px-4 py-2">{row.description}</td>
                <td className="border border-gray-300 px-4 py-2">{row.category}</td>
                <td className="border border-gray-300 px-4 py-2">{row.paymentMethod}</td>
                <td className="border border-gray-300 px-4 py-2">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>This is a sample receipt format for testing PDF upload functionality.</p>
          <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </div>
      
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            font-size: 12px;
          }
          .receipt-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default TestReceipt;
