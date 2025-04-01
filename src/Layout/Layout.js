import React from "react";

import Header from "../Partials/header";
import Sidebar from "../Partials/sidebar";
import Footer from "../Partials/footer";
import { motion,AnimatePresence } from "framer-motion";



const Layout = ({children}) => {
    return(
       
        <>
        <AnimatePresence >

            
        <Header />
       <Sidebar/>
        <motion.div id="main" className="main"  initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}> 
        <section class="section dashboard">

        {children}
       
            </section>
          
        </motion.div>
        <Footer />
        </AnimatePresence>
        </>
    );
}


export default Layout;