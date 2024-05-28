import SelectQuantity from "components/common/SelectQuantity";
import React, { useEffect, useState } from "react";
import { formatMoney } from "ultils/helpers";
import { updateCart } from "store/user/userSlice";
import withBaseComponent from "hocs/withBaseComponent";
import { apiGetProduct } from "apis";

const OrderItem = ({
  dispatch,
  color,
  dfQuantity = 1,
  price,
  title,
  thumbnail,
  pid,
  onClick,
  index,
}) => {
  const [quantity, setQuantity] = useState(() => dfQuantity);
  const [sl, setSl] = useState(0);
  const fetchApi = async () => {
    const rs = await apiGetProduct(pid);
    setSl(rs.productData.quantity);
  };
  const handleQuantity = (number) => {
    if (+number > 1) setQuantity(number);
  };
  const handleChangeQuantity = (flag) => {
    if (flag === "minus" && quantity === 1) return;
    if (flag === "minus") setQuantity((prev) => +prev - 1);
    if (flag === "plus") setQuantity((prev) => +prev + 1);
    if (flag === "plus" && quantity >= sl) {
      setQuantity(sl);
      alert(
        `Số lượng tồn kho đã đạt đến giới hạn. Bạn chỉ có thể đặt tối đa ${sl} sản phẩm.`
      );
    }
  };
  // console.log(sl);
  useEffect(() => {
    fetchApi();
    dispatch(updateCart({ pid, quantity, color }));
  }, [quantity]);

  // Set quantity
  return (
    <div className="w-main mx-auto border-b grid grid-cols-10">
      <span className="col-span-1 w-full h-full flex items-center justify-center text-center">
        <span className="text-lg">{index + 1}</span>
      </span>
      <span className="col-span-5 w-full text-center">
        <div className="flex gap-2 px-4 py-3 ">
          <img src={thumbnail} alt="thumb" className="w-28 h-28 object-cover" />
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-main mb-5">{title}</span>
            <span className="text-[10px] font-main">{color}</span>
          </div>
        </div>
      </span>
      <span className="col-span-2 text-center ">
        <div className="flex items-center h-full ml-[65px]">
          <SelectQuantity
            quantity={quantity}
            handleQuantity={handleQuantity}
            handleChangeQuantity={handleChangeQuantity}
          />
        </div>
      </span>
      <span className="col-span-1 w-full h-full flex items-center justify-center text-center">
        <span className="text-lg">{formatMoney(price * quantity)}</span>
      </span>
      <span
        className="col-span-1 w-full h-full flex items-center justify-center text-center"
        onClick={() => onClick(pid, color)}
      >
        <button className="py-2 px-6 bg-red-500 text-white font-[500] rounded-lg hover:opacity-70">
          Xóa
        </button>
      </span>
    </div>
  );
};

export default withBaseComponent(OrderItem);
