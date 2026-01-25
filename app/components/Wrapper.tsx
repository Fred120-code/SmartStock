import React from "react";
import { ToastContainer } from "react-toastify"; 
import Navbar from "./NavBar"; 

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div className="flex w-full justify-center ">
      <div className="w-1/6">
        <Navbar />
      </div>
      <div className="w-full">
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
        />
        <div className="px-5 md:px-[10%] mt-8 mb-10">{children}</div>
      </div>
    </div>
  );
};

export default Wrapper;
