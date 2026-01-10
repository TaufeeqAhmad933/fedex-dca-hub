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

const PerDcaAnalysis = () => {
  const [dcaData, setDcaData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/dcas').then(res => {
      // Add dummy metrics for demo
      const enriched = res.data.map(d => ({
        ...d,
        cases_assigned: Math.floor(Math.random() * 20) + 5,  // Dummy
        cases_resolved: Math.floor(Math.random() * 15) + 3,
        total_amount: Math.floor(Math.random() * 50000) + 10000,
        recovered_amount: Math.floor(Math.random() * 30000) + 5000,
        avg_days_to_close: Math.floor(Math.random() * 10) + 5
      }));
      setDcaData(enriched);
    }).catch(err => alert('DCA data error: ' + err.message));
  }, []);

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
      }}>Per DCA Analysis</h1>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {dcaData.map(dca => (
          <div key={dca.id} style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>{dca.name} Metrics</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <h3>Cases Assigned vs Resolved</h3>
                <Bar data={{
                  labels: ['Assigned', 'Resolved'],
                  datasets: [{
                    label: 'Count',
                    data: [dca.cases_assigned, dca.cases_resolved],
                    backgroundColor: ['blue', 'green']
                  }]
                }} options={{ responsive: true }} />
              </div>
              <div>
                <h3>Amount: Total vs Recovered</h3>
                <Bar data={{
                  labels: ['Total Amount', 'Recovered Amount'],
                  datasets: [{
                    label: 'Amount ($)',
                    data: [dca.total_amount, dca.recovered_amount],
                    backgroundColor: ['orange', 'purple']
                  }]
                }} options={{ responsive: true }} />
              </div>
              <div>
                <h3>Avg Days to Close</h3>
                <Bar data={{
                  labels: ['Days'],
                  datasets: [{
                    label: 'Avg Days',
                    data: [dca.avg_days_to_close],
                    backgroundColor: 'red'
                  }]
                }} options={{ responsive: true }} />
              </div>
              <div>
                <h3>DPS and SLA Compliance</h3>
                <Pie data={{
                  labels: ['DPS', 'SLA Compliance'],
                  datasets: [{
                    data: [dca.dps, dca.sla_compliance * 100],
                    backgroundColor: ['cyan', 'magenta']
                  }]
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerDcaAnalysis;