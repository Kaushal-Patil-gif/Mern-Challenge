import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);

const TransactionDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/transactions');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearchTerm =
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const transactionDate = new Date(transaction.dateOfSale);
      const transactionMonth = transactionDate.toLocaleString('default', { month: 'long' });
      const matchesMonth = transactionMonth === selectedMonth;

      return matchesSearchTerm && matchesMonth;
    });

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage);

  const totalSales = filteredTransactions.reduce((sum, transaction) => {
    return transaction.sold ? sum + transaction.price : sum;
  }, 0);

  const totalSoldItems = filteredTransactions.filter(transaction => transaction.sold).length;
  const totalNotSoldItems = filteredTransactions.filter(transaction => !transaction.sold).length;

  const priceRanges = [
    { label: '0-100$', min: 0, max: 100 },
    { label: '101$-200$', min: 101, max: 200 },
    { label: '201$-300$', min: 201, max: 300 },
    { label: '301$-400$', min: 301, max: 400 },
    { label: '401$-500$', min: 401, max: 500 },
    { label: '501$-600$', min: 501, max: 600 },
    { label: '601$-700$', min: 601, max: 700 },
    { label: '701$-800$', min: 701, max: 800 },
    { label: '801$-900$', min: 801, max: 900 },
    { label: '901$-Above', min: 901, max: Infinity }
  ];

  const priceRangeCounts = priceRanges.map(range => 
    filteredTransactions.filter(transaction => 
      transaction.sold && transaction.price >= range.min && transaction.price < range.max
    ).length
  );

  const barChartData = {
    labels: priceRanges.map(range => range.label),
    datasets: [{
      label: `Number of Items Sold by Price Range in ${selectedMonth}`,
      data: priceRangeCounts,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="dashboard">
      <h1>Transaction Dashboard</h1>

      {/* ========================
          TRANSACTION TABLE
      ======================== */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search Transaction"
          value={searchTerm}
          onChange={handleSearch}
        />
        <select value={selectedMonth} onChange={handleMonthChange} className="Opt">
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td data-label="ID">{transaction.id}</td>
              <td data-label="Title">{transaction.title}</td>
              <td data-label="Description">{transaction.description}</td>
              <td data-label="Price">${transaction.price.toFixed(2)}</td>
              <td data-label="Category">{transaction.category}</td>
              <td data-label="Sold">{transaction.sold ? 'Yes' : 'No'}</td>
              <td data-label="Image">
                <img src={transaction.image} alt={transaction.title} width="50" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>

      <hr />

      {/* ========================
          STATISTICS SECTION
      ======================== */}
      <div className="statistics">
        <h2>Statistics - {selectedMonth}</h2>
        <p>Total Sale: ${totalSales.toFixed(2)}</p>
        <p>Total Sold Items: {totalSoldItems}</p>
        <p>Total Not Sold Items: {totalNotSoldItems}</p>
      </div>

      <hr />

      {/* ========================
          BAR CHART SECTION
      ======================== */}
      <div>
        <h2 className="bar-chart-title">Bar Chart - {selectedMonth}</h2>

        <Bar
          data={barChartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 10,
                title: {
                  display: true,
                  text: 'Items Sold'
                },
                ticks: {
                  stepSize: 1,
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Total Sale'
                },
              }
            },
          }}
        />
      </div>
    </div>
  );
};

export default TransactionDashboard;
