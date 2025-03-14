import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './Dasbaord';
import Login from './components/authentication/login';
import Create_Account from './components/authentication/singup';
import Overview from './components/clients/overview';
import Account_Settings from './components/authentication/account_settings';
import { useState } from 'react';


function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (token) => {
      setToken(token);
  };
  return (
  <Router>
    <Routes>
      <Route path="/" index element={<Login/>}></Route>
      <Route path="/login" element={<Login />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/singup" element={<Create_Account />} />
      <Route path="/Dashbaord" element={<Layout><Dashboard token={token} /></Layout>} />
      <Route path="/components/clients/overview" element={<Layout><Overview token={token} /></Layout>} />
      <Route path="/components/authentication/account_settings" element={<Layout><Account_Settings token={token} /></Layout>} />
    </Routes>
     </Router>
  );
}

export default App;
