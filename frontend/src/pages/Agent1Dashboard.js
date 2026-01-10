import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Agent1Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [emailDraft, setEmailDraft] = useState('');
  const [conversationTip, setConversationTip] = useState('');
  const [callTranscript, setCallTranscript] = useState('');
  const [emailText, setEmailText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);  // Feature 8: User Feedback System
  const [feedbackRating, setFeedbackRating] = useState(0);
  // New state for Voice AI simulation
  const [isCalling, setIsCalling] = useState(false);
  const [callTranscriptAI, setCallTranscriptAI] = useState([]);
  // New states for metrics
  const [casesAssignedToday, setCasesAssignedToday] = useState(0);
  const [casesCompleted, setCasesCompleted] = useState(5);  // Dummy data: 5 completed

  useEffect(() => {
    axios.get('http://localhost:8000/cases/agent1').then(res => {
      setCases(res.data);
      setCasesAssignedToday(res.data.length);  // Count assigned cases
    }).catch(err => alert('Cases error: ' + err.message));
  }, []);

  // Updated sendReminder function to include sending status
  const sendReminder = async (caseData) => {
    try {
      const res = await axios.post('http://localhost:8000/generate-email', caseData);
      setEmailDraft(res.data.email);
      alert(`Email drafted and sent! Status: ${res.data.status}`);
      setShowFeedback(true);  // Trigger feedback after sending
    } catch (err) {
      alert('Error: ' + err.response?.data?.detail || err.message);
    }
  };

  const getConversationTip = async (caseData) => {
    try {
      const res = await axios.post('http://localhost:8000/generate-conversation', caseData);
      setConversationTip(res.data.script);
    } catch (err) {
      alert('Error: ' + err.response?.data?.detail || err.message);
    }
  };

  const analyzeCall = async () => {
    try {
      const res = await axios.post('http://localhost:8000/analyze-call', { transcript: callTranscript });
      setAnalysis(res.data.analysis);
      setShowFeedback(true);  // Trigger feedback after analysis
    } catch (err) {
      alert('Error: ' + err.response?.data?.detail || err.message);
    }
  };

  const analyzeEmail = async () => {
    try {
      const res = await axios.post('http://localhost:8000/analyze-email', { email: emailText });
      setAnalysis(res.data.analysis);
      setShowFeedback(true);  // Trigger feedback after analysis
    } catch (err) {
      alert('Error: ' + err.response?.data?.detail || err.message);
    }
  };

  const submitFeedback = () => {
    alert(`Feedback submitted: ${feedbackRating} stars`);
    setShowFeedback(false);
    setFeedbackRating(0);
  };

  // Updated startAICall function with debug logs
  const startAICall = (caseData) => {
    console.log('Start AI Call clicked for case:', caseData);  // Debug log
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');  // Debug log
      alert('Your browser does not support speech synthesis. Try Chrome.');
      return;
    }
    
    console.log('Speech synthesis supported, starting call');  // Debug log
    setIsCalling(true);
    setCallTranscriptAI([]);
    
    // Pre-scripted AI responses (simulate conversation)
    const responses = [
      `Hello, this is FedEx Recovery AI calling ${caseData.name}. We're reaching out about your outstanding payment of $${caseData.amount_owed}.`,
      'How would you like to proceed with payment? We can discuss options.',
      'Thank you for your time. We will follow up soon. Goodbye.'
    ];
    
    let index = 0;
    const speak = () => {
      if (index < responses.length) {
        console.log('Speaking response:', responses[index]);  // Debug log
        const utterance = new SpeechSynthesisUtterance(responses[index]);
        utterance.rate = 0.9;  // Slightly slower for clarity
        utterance.onend = () => {
          console.log('Speech ended, updating transcript');  // Debug log
          setCallTranscriptAI(prev => [...prev, `AI: ${responses[index]}`]);
          index++;
          setTimeout(speak, 2000);  // Pause between responses
        };
        window.speechSynthesis.speak(utterance);
      } else {
        console.log('Call ended');  // Debug log
        setIsCalling(false);
        alert('AI Call ended. Transcript logged below.');
      }
    };
    
    speak();
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Loyal Forgetter': return '#28a745';
      case 'Tier 1': return '#ffc107';
      case 'Tier 2': return '#17a2b8';
      case 'Tier 3': return '#dc3545';
      default: return '#6c757d';
    }
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
      }}>FedEx Recovery AI - Agent 1 Dashboard</h1>
      
      {/* New Metrics Cards */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <h3 style={{ color: '#333' }}>Cases Assigned Today</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{casesAssignedToday}</p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <h3 style={{ color: '#333' }}>Cases Completed</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{casesCompleted}</p>
        </div>
      </div>
      
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Cases</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>PPS</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tier</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ageing</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>SLA Breach</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Shipment Status</th>  {/* Feature 5: Integration with Real APIs */}
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.pps}%</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  color: getTierColor(c.tier),
                  fontWeight: 'bold'
                }}>{c.tier}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.ageing_bucket}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.sla_breach ? 'Yes' : 'No'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.shipment_status}</td>  {/* Feature 5 */}
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {c.tier === "Loyal Forgetter" && (
                    <button onClick={() => sendReminder(c)} style={{
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>Send Reminder</button>
                  )}
                  <button onClick={() => getConversationTip(c)} style={{
                    padding: '5px 10px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '5px'
                  }}>Get Conversation Tips</button>
                  <button onClick={() => startAICall(c)} style={{
                    padding: '5px 10px',
                    backgroundColor: '#17a2b8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '5px'
                  }}>Start AI Call</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {emailDraft && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e9ecef',
            borderRadius: '5px'
          }}>
            <h3>Email Draft:</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{emailDraft}</pre>
          </div>
        )}
        
        {conversationTip && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#d4edda',
            borderRadius: '5px'
          }}>
            <h3>Conversation Tips:</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{conversationTip}</pre>
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <h3>AI Analysis Tools</h3>
          <textarea placeholder="Paste call transcript" value={callTranscript} onChange={(e) => setCallTranscript(e.target.value)} style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '14px'
          }} />
          <button onClick={analyzeCall} style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}>Analyze Call</button>
          <textarea placeholder="Paste email text" value={emailText} onChange={(e) => setEmailText(e.target.value)} style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '14px'
          }} />
          <button onClick={analyzeEmail} style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>Analyze Email</button>
        </div>
        
        {analysis && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8d7da',
            borderRadius: '5px'
          }}>
            <h3>Analysis:</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{analysis}</pre>
          </div>
        )}
        
        {/* AI Call Transcript Display */}
        {callTranscriptAI.length > 0 && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#cce5ff',
            borderRadius: '5px'
          }}>
            <h3>AI Call Transcript:</h3>
            <ul>
              {callTranscriptAI.map((line, idx) => <li key={idx}>{line}</li>)}
            </ul>
          </div>
        )}
        
        {/* Feature 8: User Feedback System */}
        {showFeedback && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '5px'
          }}>
            <h3>Rate This Interaction:</h3>
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setFeedbackRating(star)} style={{ fontSize: '20px', border: 'none', background: 'none' }}>
                {star <= feedbackRating ? '★' : '☆'}
              </button>
            ))}
            <button onClick={submitFeedback} style={{ marginLeft: '10px', padding: '5px 10px' }}>Submit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agent1Dashboard;