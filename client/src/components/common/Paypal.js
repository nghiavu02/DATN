import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { apiCreateOrder, apiGetProduct, apiUpdateProduct } from "apis";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const style = { layout: "vertical" };

const ButtonWrapper = ({
  currency,
  showSpinner,
  amount,
  payload,
  setIsSuccess,
}) => {
  const [{ isPending, options }, dispatch] = usePayPalScriptReducer();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch({
      type: "resetOptions",
      value: {
        ...options,
        currency: currency,
      },
    });
  }, [currency, showSpinner]);
  const { total, ...rest } = payload;
  let total1 = total * 23500;

  // console.log(payload);
  const handleSaveOrder = async () => {
    const response = await apiCreateOrder({
      total: total1,
      ...rest,
      status: "Chờ xử lý",
    });

    if (response.success) {
      setIsSuccess(true);

      // Cập nhật tồn kho và số lượng đã bán
      // await apiUpdateProduct(
      //   {
      //     inStock: payload. - 1, // Giảm tồn kho đi 1
      //     sold: payload.sold + 1, // Tăng số lượng đã bán lên 1
      //   },
      //   payload.pid
      // );
      await Promise.all(
        payload?.products?.map(async (item) => {
          console.log(item.quantity);
          const { _id } = item.product;
          const rs1 = await apiGetProduct(_id);
          const { productData } = rs1;
          const { quantity, sold } = productData;
          console.log(rs1);
          // let kq1 = quantity - 1;
          // let ks1 = quantity + 1;
          // console.log(kq1, ks1);
          const rs = await apiUpdateProduct(
            {
              quantity: quantity - item.quantity,
              sold: sold + item.quantity,
            },
            _id
          );
        })
      );
      setTimeout(() => {
        Swal.fire("Cangrat!", "Đơn hàng đã được tạo", "success").then(() => {
          navigate("/");
        });
      }, 1500);
    }
  };
  // payload?.products?.map(async (item) => {
  //   console.log(item.quantity);
  // });
  return (
    <>
      {showSpinner && isPending && <div className="spinner" />}
      <PayPalButtons
        style={style}
        disabled={false}
        forceReRender={[style, currency, amount]}
        fundingSource={undefined}
        createOrder={(data, actions) =>
          actions.order
            .create({
              purchase_units: [
                { amount: { currency_code: currency, value: amount } },
              ],
            })
            .then((orderId) => orderId)
        }
        onApprove={(data, actions) =>
          actions.order.capture().then(async (response) => {
            if (response.status === "COMPLETED") {
              handleSaveOrder();
            }
          })
        }
      />
    </>
  );
};

export default function Paypal({ amount, payload, setIsSuccess }) {
  return (
    <div style={{ maxWidth: "750px", minHeight: "200px", margin: "auto" }}>
      <PayPalScriptProvider
        options={{ clientId: "test", components: "buttons", currency: "USD" }}
      >
        <ButtonWrapper
          setIsSuccess={setIsSuccess}
          payload={payload}
          currency={"USD"}
          amount={amount}
          showSpinner={false}
        />
      </PayPalScriptProvider>
    </div>
  );
}
