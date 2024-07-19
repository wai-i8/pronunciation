import React from "react";
import { useState } from "react";

const ToTopButton = (props) => {
    const [showBotton, setShowBotton] = useState(false);

    const toggleVisible = () => {
        const scrolled = document.documentElement.scrollTop;
        if (scrolled > 1000){
            setShowBotton(true);
        } 
        else{
            setShowBotton(false);
        }
      };
      
      window.addEventListener('scroll', toggleVisible);
    
      const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      };

    return(
        <>
            {showBotton && <div><button className="floatingObj_totopbutton fa-solid fa-arrow-up" style={props.appStyle} onClick={scrollToTop}></button></div>}
        </>
    )
}

export default ToTopButton;