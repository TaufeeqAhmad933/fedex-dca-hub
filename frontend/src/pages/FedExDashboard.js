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
import { useNavigate } from 'react-router-dom';  // For navigation

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const FedExDashboard = () => {
  const [dcaData, setDcaData] = useState({ labels: [], datasets: [] });
  const [ageingData, setAgeingData] = useState({ labels: [], datasets: [] });
  const [slaData, setSlaData] = useState({});
  const [kpis, setKpis] = useState({});
  const [dcaDetails, setDcaDetails] = useState([]);  // For Per DCA master view
  const [loyalCases, setLoyalCases] = useState([]);  // For Loyal Forgetters
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = () => {
      // DCA performance
      axios.get('http://localhost:8000/dcas').then(res => {
        setDcaDetails(res.data);  // For master view
        const chartData = {
          labels: res.data.map(d => d.name || 'Unknown'),
          datasets: [{
            label: 'Recovery %',
            data: res.data.map(d => (d.recovery_rate * 100) || 0),
            backgroundColor: 'rgba(75,192,192,0.6)'
          }]
        };
        setDcaData(chartData);
      }).catch(err => alert('DCA data error: ' + err.message));

      // Ageing buckets and SLA breaches from cases
      axios.get('http://localhost:8000/cases').then(res => {
        const ageingCounts = { "0-30 days": 0, "31-60 days": 0, "60+ days": 0 };
        let breaches = 0;
        res.data.forEach(c => {
          ageingCounts[c.ageing_bucket] = (ageingCounts[c.ageing_bucket] || 0) + 1;
          if (c.sla_breach) breaches++;
        });
        setAgeingData({
          labels: Object.keys(ageingCounts),
          datasets: [{
            label: 'Cases by Ageing',
            data: Object.values(ageingCounts),
            backgroundColor: ['green', 'yellow', 'red']
          }]
        });
        setSlaData({
          labels: ['Breached', 'On Track'],
          datasets: [{
            data: [breaches, res.data.length - breaches],
            backgroundColor: ['red', 'green']
          }]
        });
        // Load Loyal Forgetters
        const loyal = res.data.filter(c => c.tier === "Loyal Forgetter");
        setLoyalCases(loyal);
      }).catch(err => alert('Cases data error: ' + err.message));

      // KPIs
      axios.get('http://localhost:8000/kpis').then(res => setKpis(res.data))
        .catch(err => alert('KPIs error: ' + err.message));
    };

    loadData();  // Initial load

    // WebSocket for real-time updates and notifications
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        loadData();
        alert('Dashboard updated in real-time!');
      } else if (data.type === 'notification') {
        if (Notification.permission === 'granted') {
          new Notification('FedEx DCA Alert', { body: data.message });
        } else {
          alert(data.message);
        }
      }
    };
    ws.onclose = () => console.log('WebSocket closed');

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => ws.close();  // Cleanup
  }, []);

  const downloadCSV = () => {
    window.open('http://localhost:8000/export-csv', '_blank');
  };

  const sendLoyalEmail = async (caseId) => {
    try {
      const res = await axios.post('http://localhost:8000/send-loyal-email', { case_id: caseId });
      alert(res.data.message);
      // Update local state with sent date and email (matching backend response)
      setLoyalCases(prev => prev.map(c => c.id === caseId ? { ...c, email_sent_date: res.data.sent_date, email: res.data.email } : c));
    } catch (err) {
      alert('Error: ' + err.response?.data?.detail || err.message);
    }
  };

  const assignToAgent = async (caseId) => {
    const res = await axios.post('http://localhost:8000/assign-loyal-to-agent', { case_id: caseId });
    alert(res.data.message);
    setLoyalCases(prev => prev.filter(c => c.id !== caseId));  // Remove from list
  };

  const getDaysSinceEmail = (sentDate) => {
    if (!sentDate) return 0;
    const sent = new Date(sentDate);
    const now = new Date();
    return Math.floor((now - sent) / (1000 * 60 * 60 * 24));
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
      }}>FedEx DCA Performance Dashboard</h1>
      
      {/* KPI Cards */}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Total Cases</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{kpis.total_cases}</p>
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
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Average PPS</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{kpis.average_pps}%</p>
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
          <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>SLA Compliance</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{kpis.sla_compliance_percent}%</p>
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
          <h3 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>Estimated Recoveries</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{kpis.estimated_recoveries}</p>
        </div>
      </div>
      
      {/* Download Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button onClick={downloadCSV} style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>Download Cases CSV</button>
      </div>
      
      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333' }}>DCA Recovery %</h2>
          {dcaData.labels.length > 0 ? (
            <Bar data={dcaData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          ) : (
            <p>Loading DCA data...</p>
          )}
        </div>
        
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333' }}>Ageing Buckets</h2>
          {ageingData.labels.length > 0 ? (
            <Bar data={ageingData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          ) : (
            <p>Loading ageing data...</p>
          )}
        </div>
        
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333' }}>SLA Breaches</h2>
          {slaData.labels ? (
            <Pie data={slaData} />
          ) : (
            <p>Loading SLA data...</p>
          )}
        </div>
      </div>
      
      {/* Loyal Forgetters Section */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Loyal Forgetters</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Days Since Email</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loyalCases.map(c => (
              <React.Fragment key={c.id}>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.id}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{getDaysSinceEmail(c.email_sent_date)}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {!c.email_sent_date && (
                      <button onClick={() => sendLoyalEmail(c.id)} style={{
                        padding: '5px 10px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}>Send Email</button>
                    )}
                    {c.email_sent_date && getDaysSinceEmail(c.email_sent_date) >= 7 && (
                      <button onClick={() => assignToAgent(c.id)} style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}>Assign to Agent</button>
                    )}
                  </td>
                </tr>
                {c.email && (
                  <tr>
                    <td colSpan="4" style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
                      <strong>Email Draft:</strong><br />
                      <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{c.email}</pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Per DCA Master View */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Per DCA Master View</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Recovery Rate</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>SLA Compliance</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Agent Count</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>DPS</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tier Distribution</th>
            </tr>
          </thead>
          <tbody>
            {dcaDetails.map(d => (
              <tr key={d.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{d.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(d.recovery_rate * 100).toFixed(2)}%</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(d.sla_compliance * 100).toFixed(2)}%</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>10</td>  {/* Placeholder */}
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{d.dps}%</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{d.tier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Navigation Buttons */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => navigate('/predictive-analysis')} style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          marginRight: '10px'
        }}>Predictive Analysis</button>
        <button onClick={() => navigate('/per-dca-analysis')} style={{
          padding: '10px 20px',
          backgroundColor: '#ffc107',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>Per DCA Analysis</button>
      </div>
    </div>
  );
};

export default FedExDashboard;