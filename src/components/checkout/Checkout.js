import React, { memo, useRef, useEffect, useState, useCallback } from "react";
import { Calendar } from "react-calendar";
import coverImg from "../../utils/cover-img.jpg";
import Address from "../address/Address";
import "./checkout.css";
import "react-calendar/dist/Calendar.css";
import api from "../../api/api";
import rozerpay from "../../utils/payments/rozerpay.png";
import paystack from "../../utils/payments/paystack.png";
import Stripe from "../../utils/payments/Stripe.png";
import cod from "../../utils/payments/cod.png";
import { useDispatch, useSelector } from "react-redux";
import { FaRupeeSign } from "react-icons/fa";
import Cookies from "universal-cookie";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Modal from "react-bootstrap/Modal";

//lottie animation JSONs
import Lottie, { useLottie } from "lottie-react";
import animate1 from "../../utils/order_placed_back_animation.json";
import animate2 from "../../utils/order_success_tick_animation.json";

//payment methods
import useRazorpay from "react-razorpay";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
// import CheckoutForm from './CheckoutForm'
import InjectCheckout from "./StripeModal";
import PaystackPop from "@paystack/inline-js";
import Loader from "../loader/Loader";
import { Button } from "react-bootstrap";
import { ActionTypes } from "../../model/action-type";
const stripePromise = loadStripe(
  "pk_test_51MKxDESEKxefYE6MZCHxEw4cFKiiLn2mV3Ek4Nx1UfcuNfE1Z6jgQrZrKpqTLju3n5SBjYJcwt1Jkw1bEoPXWRHB00XZ7D2f2F"
);

const Checkout = () => {
  const dispatch = useDispatch();
  const city = useSelector((state) => state.city);
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user);
  const setting = useSelector((state) => state.setting);

  const cookies = new Cookies();
  const navigate = useNavigate();

  const fetchTimeSlot = () => {
    api
      .fetchTimeSlot()
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 1) {
          settimeslots(result.data);
          setexpectedTime(result.data.time_slots[0]);
        }
      })
      .catch((error) => console.log(error));
  };

  const fetchOrders = () => {
    api
      .getOrders(cookies.get("jwt_token"))
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 1) {
          setOrderID(result.data[0].id);
        }
      });
  };

  useEffect(() => {
    if (cookies.get("jwt_token") === undefined) {
      toast.error("You are unauthorized!!");
      navigate("/");
    } else {
      fetchTimeSlot();
      fetchOrders();
    }
    // fetchPaymentSetting()
  }, []);

  const [timeslots, settimeslots] = useState(null);
  const [selectedAddress, setselectedAddress] = useState(null);
  const [expectedDate, setexpectedDate] = useState(new Date());
  const [expectedTime, setexpectedTime] = useState(null);
  const [paymentMethod, setpaymentMethod] = useState("COD");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [orderID, setOrderID] = useState(null);
  const [loadingPlaceOrder, setloadingPlaceOrder] = useState(false);
  const [stripeOrderId, setstripeOrderId] = useState(null);
  const [stripeClientSecret, setstripeClientSecret] = useState(null);
  const [stripeTransactionId, setstripeTransactionId] = useState(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [show, setShow] = useState(false);
  // const [paymentSettings, setpaymentSettings] = useState(null)
  const [isLoader, setisLoader] = useState(false);

  const Razorpay = useRazorpay();
  const handleRozarpayPayment = useCallback(
    (
      order_id,
      razorpay_transaction_id,
      amount,
      name,
      email,
      mobile,
      app_name
    ) => {
      // const amount = total_amount
      // const name = user.user.name
      // const email = user.user.email
      // const mobile = user.user.mobile
      const key = "rzp_test_nrzk0huxwp56ro";
      const options = {
        key: key,
        amount: amount * 100,
        // currency: "INR",
        name: name,
        description: app_name,
        image: "https://egrocer.wrteam.in/storage/logo/1669957448_21176.png",
        order_id: razorpay_transaction_id,
        handler: async (res) => {
          if (res.razorpay_payment_id) {
            setloadingPlaceOrder(true);
            await api
              .addRazorpayTransaction(
                cookies.get("jwt_token"),
                order_id,
                res.razorpay_payment_id,
                res.razorpay_order_id,
                res.razorpay_payment_id,
                res.razorpay_signature
              )
              .then((response) => response.json())
              .then((result) => {
                setloadingPlaceOrder(false);
                if (result.status === 1) {
                  toast.success(result.message);
                  setIsOrderPlaced(true);
                  setShow(true);
                } else {
                  toast.error(result.message);
                }
              })
              .catch((error) => console.log(error));
            //Add Transaction
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: mobile,
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#51BD88",
        },
      };

      const rzpay = new Razorpay(options);
      rzpay.on("payment.failed", function (response) {
        console.log(response.error);
      });
      rzpay.open();
    },
    [Razorpay]
  );

  const handlePayStackPayment = (email, amount, currency, support_email) => {
    let handler = PaystackPop.setup({
      key: "pk_test_05ee04d1597f21a3b1a2f8fe3b59ec657454c1c0",
      email: email,
      amount: parseFloat(amount) * 100,
      currency: currency === "ZAR" ? currency : "ZAR",
      ref: new Date().getTime().toString(),
      label: support_email,
      onClose: function () {
        alert("Window closed.");
      },
      callback: async function (response) {
        setloadingPlaceOrder(true);
        await api
          .addTransaction(
            cookies.get("jwt_token"),
            orderID,
            response.reference,
            paymentMethod
          )
          .then((response) => response.json())
          .then((result) => {
            setloadingPlaceOrder(false);
            if (result.status === 1) {
              toast.success(result.message);
              setIsOrderPlaced(true);
              setShow(true);
            } else {
              toast.error(result.message);
            }
          })
          .catch((error) => console.log(error));
      },
    });

    handler.openIframe();
  };

  const HandlePlaceOrder = async (e) => {
    // e.preventDefault();

    setDeliveryTime(
      `${expectedDate.getDate()}-${
        expectedDate.getMonth() + 1
      }-${expectedDate.getFullYear()} ${expectedTime.title}`
    );
    const delivery_time = `${expectedDate.getDate()}-${
      expectedDate.getMonth() + 1
    }-${expectedDate.getFullYear()} ${expectedTime.title}`;

    //place order

    if (selectedAddress === null) {
      toast.error("Please Select Delivery Address");
    } else if (delivery_time === null) {
      toast.error("Please Select Preffered Delivery Time");
    } else {
      setloadingPlaceOrder(true);

      if (paymentMethod === "COD") {
        // place order

        await api
          .placeOrder(
            cookies.get("jwt_token"),
            cart.checkout.product_variant_id,
            cart.checkout.quantity,
            cart.checkout.sub_total,
            cart.checkout.delivery_charge.total_delivery_charge,
            cart.checkout.total_amount,
            paymentMethod,
            selectedAddress.id,
            delivery_time
          )
          .then((response) => response.json())
          .then(async (result) => {
            setisLoader(false);
            if (result.status === 1) {
              toast.success("Order Successfully Placed!");
              setloadingPlaceOrder(false);

              setIsOrderPlaced(true);
              setShow(true);
            } else {
              toast.error(result.message);
              setloadingPlaceOrder(false);
            }
          })
          .catch((error) => {
            setisLoader(false);
            setloadingPlaceOrder(false);
            console.log(error);
          });
      } else if (paymentMethod === "Razorpay") {
        await api
          .placeOrder(
            cookies.get("jwt_token"),
            cart.checkout.product_variant_id,
            cart.checkout.quantity,
            cart.checkout.sub_total,
            cart.checkout.delivery_charge.total_delivery_charge,
            cart.checkout.total_amount,
            paymentMethod,
            selectedAddress.id,
            delivery_time
          )
          .then((response) => response.json())
          .then(async (result) => {
            // fetchOrders();
            if (result.status === 1) {
              await api
                .initiate_transaction(
                  cookies.get("jwt_token"),
                  result.data.order_id,
                  "Razorpay"
                )
                .then((resp) => resp.json())
                .then((res) => {
                  setisLoader(false);

                  if (res.status === 1) {
                    setloadingPlaceOrder(false);
                    handleRozarpayPayment(
                      result.data.order_id,
                      res.data.transaction_id,
                      cart.checkout.total_amount,
                      user.user.name,
                      user.user.email,
                      user.user.mobile,
                      setting.setting.app_name
                    );
                  } else {
                    toast.error(res.message);
                    setloadingPlaceOrder(false);
                  }
                })
                .catch((error) => console.error(error));
            } else {
              toast.error(result.message);
              setloadingPlaceOrder(false);
            }
          })
          .catch((error) => console.log(error));
      } else if (paymentMethod === "Paystack") {
        await api
          .placeOrder(
            cookies.get("jwt_token"),
            cart.checkout.product_variant_id,
            cart.checkout.quantity,
            cart.checkout.sub_total,
            cart.checkout.delivery_charge.total_delivery_charge,
            cart.checkout.total_amount,
            paymentMethod,
            selectedAddress.id,
            delivery_time
          )
          .then((response) => response.json())
          .then((result) => {
            // fetchOrders();
            if (result.status === 1) {
              setloadingPlaceOrder(false);

              handlePayStackPayment(
                user.user.email,
                cart.checkout.total_amount,
                setting.payment_setting.paystack_currency_code,
                setting.setting.support_email
              );
            } else {
              toast.error(result.message);
              setloadingPlaceOrder(false);
            }
          })
          .catch((error) => console.log(error));
      } else if (paymentMethod === "Stripe") {
        await api
          .placeOrder(
            cookies.get("jwt_token"),
            cart.checkout.product_variant_id,
            cart.checkout.quantity,
            cart.checkout.sub_total,
            cart.checkout.delivery_charge.total_delivery_charge,
            cart.checkout.total_amount,
            paymentMethod,
            selectedAddress.id,
            delivery_time
          )
          .then((response) => response.json())
          .then(async (result) => {
            if (result.status === 1) {
              const order_id = result.data.order_id;

              await api
                .initiate_transaction(
                  cookies.get("jwt_token"),
                  result.data.order_id,
                  "Stripe"
                )
                .then((resp) => resp.json())
                .then((res) => {
                  setloadingPlaceOrder(false);
                  setstripeOrderId(result.data.order_id);
                  setstripeClientSecret(res.data.client_secret);
                  setstripeTransactionId(res.data.id);
                })
                .catch((error) => console.log(error));
              // fetchOrders();
            } else {
              toast.error(result.message);
              setloadingPlaceOrder(false);
            }
          })
          .catch((error) => console.log(error));

        // setstripeOrderId(400)

        setloadingPlaceOrder(false);
      }
      // else if (paymentMethod === "Paytm") {
      //     await api.placeOrder(cookies.get('jwt_token'), cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.checkout.total_amount, paymentMethod, selectedAddress.id, delivery_time)
      //         .then(response => response.json())
      //         .then(async result => {
      //             if (result.status === 1) {

      //             }

      //         })
      //         .catch(error => console.error(error))
      // }
    }
  };

  const handleClose = () => {
    setisLoader(true);
    api
      .removeCart(cookies.get("jwt_token"))
      .then((response) => response.json())
      .then(async (result) => {
        if (result.status === 1) {
          dispatch({ type: ActionTypes.SET_CART, payload: null });
          dispatch({ type: ActionTypes.SET_CART_CHECKOUT, payload: null });
        }
      });
    setShow(false);
    navigate("/");
  };
  useEffect(() => {
    if (isOrderPlaced) {
      setShow(true);
      setTimeout(async () => {
        handleClose();
      }, 5000);
    }
  }, [isOrderPlaced]);

  return (
    <>
      <section id="checkout">
        {isOrderPlaced ? (
          <>
            <Modal
              show={show}
              onHide={handleClose}
              backdrop="static"
              keyboard={true}
              className="success_modal"
            >
              <Lottie
                className="lottie-content"
                animationData={animate1}
                loop={true}
              ></Lottie>
              <Modal.Header
                closeButton
                className="flex-column-reverse success_header"
              >
                <Modal.Title>
                  <Lottie animationData={animate2} loop={false}></Lottie>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="success_body">
                Order Placed Successfully
              </Modal.Body>
              <Modal.Footer className="success_footer">
                <Button
                  variant="primary"
                  onClick={handleClose}
                  className="checkout_btn"
                >
                  Go to Home Page
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        ) : null}
        {/* //     {stripepayment ? <PaymentElement /> : null} */}
        <div className="cover">
          <img src={coverImg} className="img-fluid" alt="cover"></img>
          <div className="title">
            <h3>Checkout</h3>
            <span>home / </span>
            <span className="active">checkout</span>
          </div>
        </div>

        {setting.payment_setting === null ? (
          <Loader screen="full" />
        ) : (
          <>
            <div className="checkout-container container">
              <div className="checkout-util-container">
                <div className="billibg-address-wrapper checkout-component">
                  <span className="heading">billing address</span>

                  <Address
                    setselectedAddress={setselectedAddress}
                    selectedAddress={selectedAddress}
                  />
                </div>
                {timeslots && timeslots.time_slots_is_enabled === "true" ? (
                  <>
                    <div className="delivery-day-wrapper checkout-component">
                      <span className="heading">preferred delivery day</span>
                      <div className="d-flex justify-content-center p-3">
                        <Calendar
                          value={expectedDate}
                          onChange={(e) => {
                            if (new Date(e) >= new Date()) {
                              setexpectedDate(new Date(e));
                            } else if (
                              new Date(e).getDate() === new Date().getDate() &&
                              new Date(e).getMonth() ===
                                new Date().getMonth() &&
                              new Date(e).getFullYear() ===
                                new Date().getFullYear()
                            ) {
                              setexpectedDate(new Date(e));
                            } else {
                              toast.info("Please Select Valid Delivery Day");
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="delivery-time-wrapper checkout-component">
                      <span className="heading">preferred delivery time</span>
                      <div className="d-flex p-3" style={{ flexWrap: "wrap" }}>
                        {timeslots === null ? (
                          <Loader screen="full" />
                        ) : (
                          <>
                            {timeslots.time_slots.map((timeslot, index) => (
                              <div key={index} className="time-slot-container">
                                <div>
                                  <input
                                    type="radio"
                                    name="TimeSlotRadio"
                                    id={`TimeSlotRadioId${index}`}
                                    defaultChecked={index === 0 ? true : false}
                                    onChange={() => {
                                      setexpectedTime(timeslot);
                                    }}
                                  />
                                </div>
                                <div>{timeslot.title}</div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>

              <div className="order-container">
                <div className="payment-wrapper checkout-component">
                  <span className="heading">payment-method</span>

                  {setting.payment_setting.cod_payment_method === "1" ? (
                    <div>
                      <label className="form-check-label" htmlFor="cod">
                        <img src={cod} alt="cod" />
                        <span>Cash On Delivery</span>
                      </label>
                      <input
                        type="radio"
                        name="payment-method"
                        id="cod"
                        defaultChecked={true}
                        onChange={() => {
                          setpaymentMethod("COD");
                        }}
                      />
                    </div>
                  ) : null}

                  {setting.payment_setting.razorpay_payment_method === "1" ? (
                    <div>
                      <label className="form-check-label" htmlFor="razorpay">
                        <img src={rozerpay} alt="cod" />
                        <span>Razorpay</span>
                      </label>
                      <input
                        type="radio"
                        name="payment-method"
                        id="razorpay"
                        onChange={() => {
                          setpaymentMethod("Razorpay");
                        }}
                      />
                    </div>
                  ) : null}

                  {setting.payment_setting.paystack_payment_method === "1" ? (
                    <div>
                      <label className="form-check-label" htmlFor="paystack">
                        <img src={paystack} alt="cod" />
                        <span>Paystack</span>
                      </label>
                      <input
                        type="radio"
                        name="payment-method"
                        id="paystack"
                        onChange={() => {
                          setpaymentMethod("Paystack");
                        }}
                      />
                    </div>
                  ) : null}

                  {setting.payment_setting.stripe_payment_method === "1" ? (
                    <div>
                      <label className="form-check-label" htmlFor="stripe">
                        <img src={Stripe} alt="stripe" />
                        <span>Stripe</span>
                      </label>
                      <input
                        type="radio"
                        name="payment-method"
                        id="stripe"
                        onChange={() => {
                          setpaymentMethod("Stripe");
                        }}
                      />
                    </div>
                  ) : null}

                  {/* {setting.payment_setting.paytm_payment_method === "1"
                                            ? (<div>
                                                <label className="form-check-label" htmlFor='paytm'>
                                                    <img src={Paytm} alt='paytm' />
                                                    <span>Paytm</span>
                                                </label>
                                                <input type="radio" name="payment-method" id='paytm' onChange={() => {
                                                    setpaymentMethod("Paytm")
                                                }} />
                                            </div>) : null} */}
                </div>

                <div className="order-summary-wrapper checkout-component">
                  <span className="heading">order summary</span>

                  <div className="order-details">
                    {cart.checkout === null || user.user === null ? (
                      <Loader screen="full" />
                    ) : (
                      <div className="summary">
                        <div className="d-flex justify-content-between">
                          <span>Subtotal</span>
                          <div className="d-flex align-items-center">
                            <FaRupeeSign />
                            <span>{parseFloat(cart.checkout.sub_total)}</span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span>Delivery Charges</span>
                          <div className="d-flex align-items-center">
                            <FaRupeeSign />
                            <span>
                              {parseFloat(
                                cart.checkout.delivery_charge
                                  .total_delivery_charge
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between total">
                          <span>Total</span>
                          <div className="d-flex align-items-center total-amount">
                            <FaRupeeSign fill="var(--secondary-color)" />
                            <span>
                              {parseFloat(cart.checkout.total_amount)}
                            </span>
                          </div>
                        </div>

                        {loadingPlaceOrder ? (
                          <Loader screen="full" background="none" />
                        ) : (
                          <>
                            <div className="button-container">
                              {paymentMethod === "Stripe" ? (
                                <motion.button
                                  whileTap={{ scale: 0.8 }}
                                  type="button"
                                  className="checkout"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    HandlePlaceOrder();
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#stripeModal"
                                >
                                  place order
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileTap={{ scale: 0.8 }}
                                  type="button"
                                  className="checkout"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    HandlePlaceOrder();
                                  }}
                                >
                                  place order
                                </motion.button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <div
        className="modal fade"
        id="stripeModal"
        data-bs-backdrop="static"
        tabIndex="-1"
        aria-labelledby="stripeModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ minWidth: "100%" }}>
            {stripeOrderId === null ||
            stripeClientSecret === null ||
            stripeTransactionId === null ? (
              <Loader width="100%" height="100%" />
            ) : (
              <Elements
                stripe={stripePromise}
                orderID={stripeOrderId}
                client_secret={stripeClientSecret}
                transaction_id={stripeTransactionId}
                amount={cart.checkout.total_amount}
              >
                <InjectCheckout
                  orderID={stripeOrderId}
                  client_secret={stripeClientSecret}
                  transaction_id={stripeTransactionId}
                  amount={cart.checkout.total_amount}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Checkout;
