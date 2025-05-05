import React from "react";
import { Link } from "react-router-dom";


const Sidebar = () => {
  return (
    <>
      <aside id="sidebar" className="sidebar">
        <ul className="sidebar-nav" id="sidebar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/dashbaord">
              <i className="bi bi-grid"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link collapsed" data-bs-target="#clients-nav" data-bs-toggle="collapse" to="#">
              <i className="bi bi-person"></i><span>Clients</span><i className="bi bi-chevron-down ms-auto"></i>
            </Link>
            <ul id="clients-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
              <li>
                <Link to="/overview">
                  <i className="bi bi-circle"></i><span>Overview</span>
                </Link>
              </li>
             
              <li>
                <Link to="/customers">
                  <i className="bi bi-circle"></i><span>Manage Client</span>
                </Link>
              </li>
             
              
            </ul>
          </li>

          <li className="nav-item">
            <Link className="nav-link collapsed" data-bs-target="#employees-nav" data-bs-toggle="collapse" to="#">
              <i className="bi bi-person-vcard"></i><span>Employees</span><i className="bi bi-chevron-down ms-auto"></i>
            </Link>
            <ul id="employees-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
              <li>
                <Link to="/employee_list">
                  <i className="bi bi-circle"></i><span>Employees List</span>
                </Link>
              </li>
              <li>
                <Link to="/payroll">
                  <i className="bi bi-circle"></i><span>Payroll</span>
                </Link>
              </li>
              <li>
                <Link to="">
                  <i className="bi bi-circle"></i><span>Timesheet</span>
                </Link>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <Link className="nav-link collapsed" data-bs-target="#applications-nav" data-bs-toggle="collapse" to="#">
              <i className="bi bi-file-earmark-text"></i><span>Cases</span><i className="bi bi-chevron-down ms-auto"></i>
            </Link>
            <ul id="applications-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
              <li>
                <Link to="/assign_case">
                  <i className="bi bi-circle"></i><span>Case List</span>
                </Link>
              </li>
              <li>
                <Link to="/activity_logs">
                  <i className="bi bi-circle"></i><span>Activity logs</span>
                </Link>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <Link className="nav-link collapsed" data-bs-target="#passports-nav" data-bs-toggle="collapse" to="#">
              <i className="bi bi-passport"></i><span>Passports</span><i className="bi bi-chevron-down ms-auto"></i>
            </Link>
            <ul id="passports-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
            <li>
                <Link to="/passport_overview">
                  <i className="bi bi-circle"></i><span>Overview</span>
                </Link>
              </li>
              <li>
                <Link to="/passports_info">
                  <i className="bi bi-circle"></i><span>Search passport</span>
                </Link>
              </li>
            
            </ul>
          </li>

          <li className="nav-item">
            <Link className="nav-link collapsed" data-bs-target="#payment-nav" data-bs-toggle="collapse" to="#">
              <i className="bi bi-wallet2"></i><span>Payment</span><i className="bi bi-chevron-down ms-auto"></i>
            </Link>
            <ul id="payment-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
              <li>
                <Link to="/payment">
                  <i className="bi bi-circle"></i><span>overview</span>
                </Link>
              </li>
              <li>
                <Link to="/transactions">
                  <i className="bi bi-circle"></i><span>Transactions</span>
                </Link>
              </li>
             
            </ul>
          </li>

          <li className="nav-item">
            <Link className="nav-link collapsed" data-bs-target="#appointment-nav" data-bs-toggle="collapse" to="#">
              <i className="bi bi-calendar2-week"></i><span>Appointment</span><i className="bi bi-chevron-down ms-auto"></i>
            </Link>
            <ul id="appointment-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
             
              <li>
                <Link to="/appointment">
                  <i className="bi bi-circle"></i><span>Manage Appointments</span>
                </Link>
              </li>
             
            </ul>
          </li>

          <li className="nav-item">
            <Link className="nav-link collapsed" data-bs-target="#access-control-nav" data-bs-toggle="collapse" to="#">
              <i className="bi bi-shield-lock"></i><span>Access control</span><i className="bi bi-chevron-down ms-auto"></i>
            </Link>
            <ul id="access-control-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
              <li>
                <Link to="icons-bootstrap.html">
                  <i className="bi bi-circle"></i><span> User Accounts</span>
                </Link>
              </li>
              <li>
                <Link to="icons-bootstrap.html">
                  <i className="bi bi-circle"></i><span>Roles</span>
                </Link>
              </li>
             
              <li>
                <Link to="icons-bootstrap.html">
                  <i className="bi bi-circle"></i><span>Audit Logs</span>
                </Link>
              </li>
            </ul>


          </li>

          <li class="nav-item">
        <Link class="nav-link collapsed" to="pages-faq.html">
          <i class="bi bi-power"></i>
          <span>Logout</span>
        </Link>
      </li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;