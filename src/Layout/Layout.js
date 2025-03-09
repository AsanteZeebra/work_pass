import React from "react";

import Header from "../Partials/header";
import Sidebar from "../Partials/sidebar";
import Footer from "../Partials/footer";



const Layout = ({children}) => {
    return(
       
        <>
        <Header />
       <Sidebar/>
        <div id="main" className="main"> 
        <section class="section dashboard">

        {children}
        <Footer />
            </section>

        </div>
        
        </>
    );
}


export default Layout;