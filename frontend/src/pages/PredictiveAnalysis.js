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

const PredictiveAnalysis = () => {
  const [cases, setCases] = useState([]);
  const [recoveryChart, setRecoveryChart] = useState({ labels: [], datasets: [] });
  const [riskChart, setRiskChart] = useState({});
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/cases').then(res => {
      setCases(res.data);
      // Bar chart for recovery %
      const recoveryData = {
        labels: res.data.map(c => `Case ${c.id}`),
        datasets: [{
          label: 'Recovery %',
          data: res.data.map(c => c.pps),
          backgroundColor: 'rgba(75,192,192,0.6)'
        }]
      };
      setRecoveryChart(recoveryData);

      // Pie chart for risk levels (based on PPS: High >=70, Medium 40-69, Low <40)
      const riskCounts = { High: 0, Medium: 0, Low: 0 };
      res.data.forEach(c => {
        if (c.pps >= 70) riskCounts.High++;
        else if (c.pps >= 40) riskCounts.Medium++;
        else riskCounts.Low++;
      });
      setRiskChart({
        labels: Object.keys(riskCounts),
        datasets: [{
          data: Object.values(riskCounts),
          backgroundColor: ['green', 'yellow', 'red']
        }]
      });

      // Dummy predictions for demo (replace with AI call when backend is fixed)
      const dummyPreds = res.data.map(c => ({
        id: c.id,
        prediction: `Case ${c.id}: ${c.pps >= 70 ? 'High chance of recovery in 7 days' : c.pps >= 40 ? 'Medium chance in 14 days' : 'Low chance, monitor closely'}`
      }));
      setPredictions(dummyPreds);
    }).catch(err => alert('Data error: ' + err.message));
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
      }}>Predictive Analysis</h1>
      
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
          <h2 style={{ textAlign: 'center', color: '#333' }}>Recovery % per Case</h2>
          {recoveryChart.labels.length > 0 ? (
            <Bar data={recoveryChart} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          ) : (
            <p>Loading...</p>
          )}
        </div>
        
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333' }}>Risk Levels</h2>
          {riskChart.labels ? (
            <Pie data={riskChart} />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      
      {/* Predictions with Icons/Timelines */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Predicted Timelines</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {predictions.map(p => (
            <div key={p.id} style={{
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              minWidth: '200px',
              textAlign: 'center'
            }}>
              <h3>Case {p.id}</h3>
              <p>{p.prediction}</p>
              <div style={{ fontSize: '24px', marginTop: '10px' }}>📅</div>  {/* Icon for timeline */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis;