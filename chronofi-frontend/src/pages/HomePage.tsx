import React from "react";

const HomePage = () => {
  return (
    <div className=" w-full h-screen flex flex-col items-center    mt-20  gap-4 ">
      <h1 className="text-3xl md:text-4xl lg:text-6xl  font-bold  tracking-tighter   text-center  w-full md:w-[40%] ">
        Get Images on the go
      </h1>

      <p className="text-xl  text-gray-500  w-[95%]  md:w-[45%] lg:[32%] ">
        Image Generator transforms your text prompts into high-quality images.
        Simply enter a description, and get instant, visually stunning results
        tailored to your input.
      </p>
    </div>
  );
};

export default HomePage;
