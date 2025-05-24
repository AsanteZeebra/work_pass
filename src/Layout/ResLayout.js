import React from "react";

import Header from "../Partials/header";
import Recep_Sidebar from "../Partials/reception_sidebar";
import Footer from "../Partials/footer";
import { motion,AnimatePresence } from "framer-motion";



const Res_Layout = ({children}) => {
    return(
       
        <>
        <AnimatePresence >

            
        <Header />
       <Recep_Sidebar/>
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


export default Res_Layout;