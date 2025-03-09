
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <>
         <footer id="footer" className="footer">
    <div className="copyright">
      &copy; Copyright <strong><span>NiceAdmin</span></strong>. All Rights Reserved
    </div>
    <div className="credits">
     <a href="https://bootstrapmade.com/">BootstrapMade</a>
    </div>
  </footer>

  <Link to="#" className="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></Link>

        </>
 
    );
}

export default Footer;