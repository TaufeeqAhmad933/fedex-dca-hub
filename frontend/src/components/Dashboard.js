import React from 'react';
import { Bar } from 'react-chartjs-2';

const Dashboard = ({ data, title }) => {
    return (
        <div>
            <h2>{title}</h2>
            <Bar data={data} />
        </div>
    );
};

export default Dashboard;