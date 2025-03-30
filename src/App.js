import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './Dasbaord';
import Login from './components/authentication/login';
import Create_Account from './components/authentication/singup';
import Overview from './components/clients/overview';
import Account_Settings from './components/authentication/account_settings';
import UsersProfile from './components/authentication/users_profile';
import Reset_Password from './components/authentication/Reset_password';
import Customers from './components/clients/customers';
import Customer_info from './components/clients/customer_info';
import Assign_case from './components/cases/assign_case';
import Employees from './components/employees/employee_list';
import add_employee from './components/employees/add_employee';
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
      <Route path="/components/clients/customers" element={<Layout><Customers token={token} /></Layout>} />
      <Route path="/customer_info" element={<Layout><Customer_info token={token} /></Layout>} />
      <Route path="/components/cases/assign_case" element={<Layout><Assign_case token={token} /></Layout>} />
      <Route path="/components/authentication/account_settings" element={<Layout><Account_Settings token={token} /></Layout>} />
      <Route path="/components/employees/employee_list" element={<Layout><Employees token={token} /></Layout>} />
      <Route path="/components/authentication/users_profile" element={<Layout><UsersProfile token={token} /></Layout>} />
      <Route path="/components/employees/add_employee" element={<Layout><add_employee token={token} /></Layout>} />

      <Route path="/Reset_password" element={<Reset_Password />} />
   
    </Routes>
     </Router>
  );
}

export default App;
