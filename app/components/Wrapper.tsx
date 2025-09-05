import React from "react";
import { ToastContainer } from "react-toastify";

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div>
      {/* <Navbar/> */}
      <ToastContainer 
        position="top-center"
        autoClose = {500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
        
      <div className="px-5 md:px-[10%] mt-8 mb-10">{children}</div>
    </div>
  );
};

export default Wrapper;
