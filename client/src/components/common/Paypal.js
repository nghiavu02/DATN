import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { apiCreateOrder } from "apis";
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

  console.log(payload);
  const handleSaveOrder = async () => {
    const response = await apiCreateOrder({
      total: total1,
      ...rest,
      status: "Processing",
    });
    if (response.success) {
      setIsSuccess(true);
      setTimeout(() => {
        Swal.fire("Cangrat!", "Order was created", "success").then(() => {
          navigate("/");
        });
      }, 1500);
    }
  };

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
