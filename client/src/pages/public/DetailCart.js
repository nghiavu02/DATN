import { Breadcrumb, Button, OrderItem } from "components";
import withBaseComponent from "hocs/withBaseComponent";
import { useDispatch, useSelector } from "react-redux";
import { Link, createSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { formatMoney } from "ultils/helpers";
import path from "ultils/path";
import { apiRemoveCart } from "apis";
import { getCurrent } from "store/user/asyncActions";

const DetailCart = ({ location, navigate }) => {
  const { currentCart, current } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const removeFromCart = async (pid, color) => {
    try {
      const response = await apiRemoveCart(pid, color);
      if (response.success) {
        dispatch(getCurrent());
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: response.mes,
        });
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred while removing the product from the cart.",
      });
    }
  };
  const handleSubmit = () => {
    if (!current?.address)
      return Swal.fire({
        icon: "info",
        title: "Almost!",
        text: "Vui lòng nhạp địa chỉ giao hàng",
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "Go update",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed)
          navigate({
            pathname: `/${path.MEMBER}/${path.PERSONAL}`,
            search: createSearchParams({
              redirect: location.pathname,
            }).toString(),
          });
      });
    else window.open(`/${path.CHECKOUT}`, "_blank");
  };
  let tong = 0;
  let phi = 0;
  // Tính tổng tiền
  currentCart?.forEach((el) => {
    tong += +el.price * el.quantity;
  });
  if (tong < 300000) {
    tong += 40000;
    phi = 40000;
  }
  //  const removeCart = async (pid, color) => {
  //    const response = await apiRemoveCart(pid, color);
  //    if (response.success) {
  //      dispatch(getCurrent());
  //    } else toast.error(response.mes);
  //  };
  console.log(currentCart);
  return (
    <div className="w-full">
      <div className="h-[81px] flex items-center justify-center bg-gray-100">
        <div className="w-main">
          <h3 className="font-semibold text-2xl px-4 py-2">My cart</h3>
          {/* <Breadcrumb category={location?.pathname?.replace('/', '')?.split('-')?.join(' ')} /> */}
        </div>
      </div>
      <div className="flex flex-col border w-main mx-auto my-8">
        <div className="w-main mx-auto bg-gray-200 font-bold py-3 grid grid-cols-10">
          <span className="col-span-1 w-full text-center">#</span>
          <span className="col-span-5 w-full text-center">Products</span>
          <span className="col-span-2 w-full text-center">Quantity</span>
          <span className="col-span-1 w-full text-center">Price(VND)</span>
          <span className="col-span-1 w-full text-center">Action</span>
        </div>
        {currentCart?.map((el, index) => (
          <OrderItem
            index={index}
            key={el._id}
            dfQuantity={el.quantity}
            color={el.color}
            title={el.title}
            thumbnail={el.thumbnail}
            price={el.price}
            pid={el.product?._id}
            onClick={removeFromCart}
          />
        ))}
        <div className="py-3 flex  gap-10 text-center justify-center">
          {/* <span>Phí giao hàng: </span> */}

          <span className=" text-center flex-end text-red-500">
            Miễn phí vận chuyển cho đơn hàng có giá trị trên 300.000VND
          </span>
        </div>
      </div>
      <div className="w-main mx-auto flex flex-col mb-12 justify-center items-end gap-3">
        <span className="flex items-center gap-8 text-sm">
          <span>Phí vận chuyển:</span>
          <span className="text-main font-[600]">
            {phi == 0 ? "Miễn phí" : "40.000 VND"}
          </span>
        </span>
        <span className="flex items-center gap-8 text-sm">
          <span>Thành tiền:</span>
          <span className="text-main font-bold">{`${formatMoney(
            tong
          )} VND`}</span>
        </span>
        <span className="text-xs italic">Shipping...</span>
        <Button handleOnClick={handleSubmit}>Thanh toán</Button>
      </div>
    </div>
  );
};

export default withBaseComponent(DetailCart);
