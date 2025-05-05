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
import Add_employee from './components/employees/add_employee';
import Payroll from './components/payroll/payroll';
import Pay_salary from './components/payroll/pay_salary';
import ActivityLogs from './components/cases/activity_logs';
import Statement from './components/payroll/statement';
import Passpots_info from './components/passport/passports';
import Request from './components/passport/request';
import Passport_overview from './components/passport/passport_overview';
import Payment from './components/payment/payment';
import Transactions from './components/payment/transactions';
import Appointment from './components/appointment/appointment';

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
      <Route path="/Reset_password" element={<Reset_Password />} />
      <Route path="/account_settings" element={<Layout><Account_Settings token={token} /></Layout>} />
      <Route path="/users_profile" element={<Layout><UsersProfile token={token} /></Layout>} />

      <Route path="/Dashbaord" element={<Layout><Dashboard token={token} /></Layout>} />

      <Route path="/overview" element={<Layout><Overview token={token} /></Layout>} />
      <Route path="/customers" element={<Layout><Customers token={token} /></Layout>} />
      <Route path="/customer_info" element={<Layout><Customer_info token={token} /></Layout>} />

      <Route path="/assign_case" element={<Layout><Assign_case token={token} /></Layout>} />
      <Route path="/add_employee" element={<Layout><Add_employee token={token} /></Layout>} />
      <Route path="/employee_list" element={<Layout><Employees token={token} /></Layout>} />
      <Route path="/payroll" element={<Layout><Payroll token={token} /></Layout>} />

      <Route path="/pay_salary" element={<Layout><Pay_salary token={token}/></Layout>} />
      <Route path="/statement" element={<Layout><Statement token={token}/></Layout>} />

      <Route path="/activity_logs" element={<Layout><ActivityLogs token={token}/></Layout>} />

      <Route path="/passports_info" element={<Layout><Passpots_info token={token}/></Layout>} />
      <Route path="/passport_overview" element={<Layout><Passport_overview token={token}/></Layout>} />
      <Route path="/request" element={<Layout><Request token={token}/></Layout>} />
      
      <Route path="/payment" element={<Layout><Payment token={token}/></Layout>} />
      <Route path="/transactions" element={<Layout><Transactions token={token}/></Layout>} />
      <Route path="/appointment" element={<Layout><Appointment token={token}/></Layout>} />


     

     
     
    </Routes>
     </Router>
  );
}

export default App;
