import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

const Header = () => {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  useEffect(() => {
    setUsername(localStorage.getItem("username")); // Ensure username updates when component mounts
  }, []);

  useEffect(() => {
    const toggleSidebar = () => {
      document.body.classList.toggle("toggle-sidebar");
    };

    const toggleButton = document.querySelector(".toggle-sidebar-btn");
    if (toggleButton) {
      toggleButton.addEventListener("click", toggleSidebar);
    }

    return () => {
      if (toggleButton) {
        toggleButton.removeEventListener("click", toggleSidebar);
      }
    };
  }, []);

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
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("uid");

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
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        <Link to="index.html" className="logo d-flex align-items-center">
          <img src="assets/img/logo.png" alt="" />
          <span className="d-none d-lg-block">WorkPass</span>
        </Link>
        <i className="bi bi-list toggle-sidebar-btn"></i>
      </div>

      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          <li className="nav-item dropdown pe-3">
            <Link className="nav-link nav-profile d-flex align-items-center pe-0" to="#" data-bs-toggle="dropdown">
              <img src="assets/img/profile-img.jpg" alt="Profile" className="rounded-circle" />
              <span className="d-none d-md-block dropdown-toggle ps-2">
                {username || "Guest"}
              </span>
            </Link>

            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              <li className="dropdown-header">
                <h6>{username || "Guest"}</h6>
                <span>Web Designer</span>
              </li>
              <li><hr className="dropdown-divider" /></li>

              <li>
                <Link className="dropdown-item d-flex align-items-center" to="users-profile.html">
                  <i className="bi bi-person"></i>
                  <span>My Profile</span>
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>

              <li>
              <Link className="dropdown-item d-flex align-items-center" to="/components/authentication/account_settings">
                <i className="bi bi-gear"></i>
                <span>Account Settings</span>
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>

              <li>
                <Link className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;