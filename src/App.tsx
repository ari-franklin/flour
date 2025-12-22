import React from 'react';
import KPIDashboard from './KPIDashboard';
import PasswordGate from './PasswordGate';
import './styles.css';

const App: React.FC = () => {
  return (
    <PasswordGate>
      <KPIDashboard />
    </PasswordGate>
  );
};

export default App;
