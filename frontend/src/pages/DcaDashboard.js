import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DcaDashboard = () => {
  const [dcaData, setDcaData] = useState([]);
  const [dpsChart, setDpsChart] = useState({ labels: [], datasets: [] });
  const [tierChart, setTierChart] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    axios.get('http://localhost:8000/dcas')
      .then(res => {
        setDcaData(res.data);
        // DPS Chart
        const dpsData = {
          labels: res.data.map(d => d.name || 'Unknown'),
          datasets: [{
            label: 'DPS',
            data: res.data.map(d => d.dps || 0),
            backgroundColor: 'rgba(255,99,132,0.6)'
          }]
        };
        setDpsChart(dpsData);
        
        // Tier Distribution Pie Chart
        const tierCounts = { 'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0 };
        res.data.forEach(d => {
          tierCounts[d.tier] = (tierCounts[d.tier] || 0) + 1;
        });
        setTierChart({
          labels: Object.keys(tierCounts),
          datasets: [{
            data: Object.values(tierCounts),
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
          }]
        });
      })
      .catch(err => {
        alert('Failed to load DCA data: ' + (err.response?.data?.detail || 'Network error'));
        console.log('DCA fetch error:', err);
      });
  }, []);

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      dcaData.map(d => `${d.name},${d.dps},${d.tier}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dca_agents.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#f4f4f4',
      minHeight: '100vh'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px'
      }}>FedEx Recovery AI - DCA Manager Dashboard</h1>
      
      {/* KPIs */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minWidth: '150px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Total Agents</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{dcaData.length}</p>
        </div>
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minWidth: '150px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Avg DPS</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {dcaData.length > 0 ? (dcaData.reduce((sum, d) => sum + (d.dps || 0), 0) / dcaData.length).toFixed(2) : 0}%
          </p>
        </div>
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minWidth: '150px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Last Update</h3>
          <p style={{ fontSize: '16px', margin: 0 }}>{lastUpdate}</p>
        </div>
      </div>
      
      {/* Buttons */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button onClick={exportData} style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          marginRight: '10px'
        }}>Export Agent Data</button>
      </div>
      
      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333' }}>DCA Agent Performance (DPS)</h2>
          {dpsChart.labels.length > 0 ? (
            <Bar data={dpsChart} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          ) : (
            <p>Loading DPS data...</p>
          )}
        </div>
        
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333' }}>Agent Tier Distribution</h2>
          {tierChart.labels ? (
            <Pie data={tierChart} />
          ) : (
            <p>Loading tier data...</p>
          )}
        </div>
      </div>
      
      {/* Agent Table */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Agent Details</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>DPS</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Recovery Rate</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>SLA Compliance</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tier</th>
            </tr>
          </thead>
          <tbody>
            {dcaData.map(d => (
              <tr key={d.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{d.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{d.dps}%</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(d.recovery_rate * 100).toFixed(2)}%</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(d.sla_compliance * 100).toFixed(2)}%</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  color: d.tier === 'Tier 1' ? '#28a745' : d.tier === 'Tier 2' ? '#ffc107' : '#dc3545',
                  fontWeight: 'bold'
                }}>{d.tier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DcaDashboard;