import React from "react";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <div className="w-full">
      <Link to={"/products"}>
        <img
          src="https://digital-world-2.myshopify.com/cdn/shop/files/slideshow3-home2_1920x.jpg?v=1613166679"
          alt="banner"
          className="h-[400px] w-full object-cover"
        />
      </Link>
    </div>
  );
};

export default Banner;
