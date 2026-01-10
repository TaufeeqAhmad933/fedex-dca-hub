import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CaseList = () => {
    const [cases, setCases] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/cases').then(res => setCases(res.data));
    }, []);

    return (
        <div>
            <h2>Cases</h2>
            <ul>
                {cases.map(c => (
                    <li key={c.id}>ID: {c.id}, PPS: {c.pps}%, Tier: {c.tier}</li>
                ))}
            </ul>
        </div>
    );
};

export default CaseList;