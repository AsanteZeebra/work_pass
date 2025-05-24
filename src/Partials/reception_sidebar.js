import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";


const Recep_Sidebar = () => {


  const navigate = useNavigate();
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost/wp_api/authentication/logout.php",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data.message); // Log success message

        // Clear token from local storage
      
        localStorage.clear();

        // Redirect to login page
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error.response ? error.response.data : error.message);
    }
  };
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
                <Link to="/rec_customers">
                  <i className="bi bi-circle"></i><span>Manage Client</span>
                </Link>
              </li>
             
              
            </ul>
          </li>

       

           <li className="nav-item">
            <Link className="nav-link collapsed" data-bs-target="#task-nav" data-bs-toggle="collapse" to="#">
              <i className="bi bi-list-check"></i><span>Tasks</span><i className="bi bi-chevron-down ms-auto"></i>
            </Link>
            <ul id="task-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
           
              <li>
                <Link to="/rec_task_list">
                  <i className="bi bi-circle"></i><span>Tasks List</span>
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
                <Link to="/rec_passport">
                  <i className="bi bi-circle"></i><span>Passports List</span>
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
                <Link to="/rec_appointment">
                  <i className="bi bi-circle"></i><span>Manage Appointments</span>
                </Link>
              </li>
             
            </ul>
          </li>

        

          <li class="nav-item">
        <Link class="nav-link collapsed" onClick={handleLogout}>
          <i class="bi bi-power"></i>
          <span>Logout</span>
        </Link>
      </li>
        </ul>
      </aside>
    </>
  );
};

export default Recep_Sidebar;