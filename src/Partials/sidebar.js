import React from "react";

import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <>
 <aside id="sidebar" className="sidebar">

<ul className="sidebar-nav" id="sidebar-nav">

  <li className="nav-item">
    <Link className="nav-link " to="index.html">
      <i className="bi bi-grid"></i>
      <span>Dashboard</span>
  </Link>
  </li> 

  <li className="nav-item">
    <Link className="nav-link collapsed" data-bs-target="#components-nav" data-bs-toggle="collapse" to="#">
      <i className="bi bi-menu-button-wide"></i><span>Clients</span><i className="bi bi-chevron-down ms-auto"></i>
  </Link>
    <ul id="components-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
    <li>
       <Link to="components-alerts.html">
          <i className="bi bi-circle"></i><span>Overview</span>
      </Link>
      </li>
      <li>
       <Link to="components-alerts.html">
          <i className="bi bi-circle"></i><span>Add Client</span>
      </Link>
      </li>
      <li>
       <Link to="components-accordion.html">
          <i className="bi bi-circle"></i><span>Manage Client</span>
      </Link>
      </li>
      <li>
       <Link to="components-accordion.html">
          <i className="bi bi-circle"></i><span>Blacklist</span>
      </Link>
      </li>
      <li>
       <Link to="components-accordion.html">
          <i className="bi bi-circle"></i><span>Support</span>
      </Link>
      </li>
     
    
    </ul>
  </li>

  <li className="nav-item">
   <Link className="nav-link collapsed" data-bs-target="#forms-nav" data-bs-toggle="collapse" to="#">
      <i className="bi bi-journal-text"></i><span>Applications</span><i className="bi bi-chevron-down ms-auto"></i>
  </Link>
    <ul id="forms-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li>
       <Link to="forms-elements.html">
          <i className="bi bi-circle"></i><span>Applications List</span>
      </Link>
      </li>
      <li>
       <Link to="forms-layouts.html">
          <i className="bi bi-circle"></i><span>Manage Applications</span>
      </Link>
      </li>
     
    </ul>
  </li>

  <li className="nav-item">
   <Link className="nav-link collapsed" data-bs-target="#tables-nav" data-bs-toggle="collapse" to="#">
      <i className="bi bi-layout-text-window-reverse"></i><span>Passports</span><i className="bi bi-chevron-down ms-auto"></i>
  </Link>
    <ul id="tables-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li>
       <Link to="tables-general.html">
          <i className="bi bi-circle"></i><span>All Passports</span>
      </Link>
      </li>
      <li>
       <Link to="tables-data.html">
          <i className="bi bi-circle"></i><span>Collect Passport</span>
      </Link>
      </li>

      <li>
       <Link to="tables-data.html">
          <i className="bi bi-circle"></i><span>Return Passport</span>
      </Link>
      </li>
    </ul>
  </li>

  <li className="nav-item">
   <Link className="nav-link collapsed" data-bs-target="#charts-nav" data-bs-toggle="collapse" to="#">
      <i className="bi bi-bar-chart"></i><span>Payment</span><i className="bi bi-chevron-down ms-auto"></i>
  </Link>
    <ul id="charts-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li>
       <Link to="charts-chartjs.html">
          <i className="bi bi-circle"></i><span>Record Payment</span>
      </Link>
      </li>
      <li>
       <Link to="charts-apexcharts.html">
          <i className="bi bi-circle"></i><span>Process Refund</span>
      </Link>
      </li>
      <li>
       <Link to="charts-echarts.html">
          <i className="bi bi-circle"></i><span>Transactions</span>
      </Link>
      </li>
    </ul>
  </li>

  <li className="nav-item">
   <Link className="nav-link collapsed" data-bs-target="#icons-nav" data-bs-toggle="collapse" to="#">
      <i className="bi bi-gem"></i><span>Appointment</span><i className="bi bi-chevron-down ms-auto"></i>
  </Link>
    <ul id="icons-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li>
       <Link to="icons-bootstrap.html">
          <i className="bi bi-circle"></i><span>Add Appointment</span>
      </Link>
      </li>
      <li>
       <Link to="icons-remix.html">
          <i className="bi bi-circle"></i><span>Manage Appointments</span>
      </Link>
      </li>
      <li>
       <Link to="icons-boxicons.html">
          <i className="bi bi-circle"></i><span>Overview</span>
      </Link>
      </li>
    </ul>
  </li>

  <li className="nav-item">
   <Link className="nav-link collapsed" data-bs-target="#icons-nav" data-bs-toggle="collapse" to="#">
      <i className="bi bi-gem"></i><span>Access control</span><i className="bi bi-chevron-down ms-auto"></i>
  </Link>
    <ul id="icons-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li>
       <Link to="icons-bootstrap.html">
          <i className="bi bi-circle"></i><span>Add User</span>
      </Link>
      </li>
      <li>
       <Link to="icons-remix.html">
          <i className="bi bi-circle"></i><span>Assign Role</span>
      </Link>
      </li>
      <li>
       <Link to="icons-boxicons.html">
          <i className="bi bi-circle"></i><span>Change Password</span>
      </Link>
      </li>
    </ul>
  </li>

</ul>

</aside>
        
       </> 
    ); 
}

export default Sidebar;