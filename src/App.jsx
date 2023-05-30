import { useEffect, useState } from 'react'
import { Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import MainContainer from "./components/MainContainer";
import { AnimatePresence } from "framer-motion";
import { Footer } from "./components/footer/Footer";
import ProfileDashboard from './components/profile/ProfileDashboard'
import Cookies from 'universal-cookie'
import { useDispatch, useSelector } from 'react-redux';
import { ActionTypes } from './model/action-type';
import api from './api/api';
import { BsArrowUpSquareFill } from 'react-icons/bs'

//react-toast
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


import ShowAllCategories from './components/category/ShowAllCategories';
import ProductList from './components/product/ProductList';
import ProductDetails from './components/product/ProductDetails';
import ViewCart from './components/cart/ViewCart';
import Wishlist from './components/favorite/Wishlist';
import Checkout from './components/checkout/Checkout';
import Transaction from './components/transaction/Transaction';
import Notification from './components/notification/Notification';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import FAQ from './components/faq/FAQ';
import Loader from './components/loader/Loader';
import Terms from './components/terms/Terms';
import Policy from './components/policy/Policy';
import NotFound from './components/404/NotFound';
import FirebaseData, { fcmToken, onMessageListener } from './utils/firebase/FirebaseData';
import { Toast } from 'react-bootstrap';
import Address from './components/address/Address';


function App() {
  //initialize cookies
  const cookies = new Cookies();

  const [token, setTokenFound] = useState(null)
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ title: '', body: '' });

  const dispatch = useDispatch();

  const city = useSelector(state => (state.city))
  const user = useSelector(state => (state.user))
  const shop = useSelector(state => (state.shop))
  const cart = useSelector(state => (state.cart))
  const setting = useSelector(state => (state.setting))
  const set_notification = useSelector(state => (state.notification))

  const getCurrentUser = (token) => {
    api.getUser(token)
      .then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
        }
      })
  }
  //fetching app-settings
  const getSetting = async () => {
    await api.getSettings().then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          dispatch({ type: ActionTypes.SET_SETTING, payload: result.data })
        }
      })
      .catch(error => console.log(error))
  }




  useEffect(() => {
    const fetchShop = (city_id, latitude, longitude) => {
      api.getShop(city_id, latitude, longitude, cookies.get('jwt_token'))
        .then(response => response.json())
        .then(result => {
          if (result.status === 1) {

            dispatch({ type: ActionTypes.SET_SHOP, payload: result.data })
          }
        })

    }
    if (city.city !== null) {
      fetchShop(city.city.id, city.city.latitude, city.city.longitude);
    }
  }, [city, cart, user])

  //authenticate current user
  useEffect(() => {
    if (cookies.get('jwt_token') !== undefined) {
      getCurrentUser(cookies.get('jwt_token'));
    }
    getSetting()
  }, [])




  useEffect(() => {
    document.title = setting.setting ? setting.setting.web_settings.site_title : "Loading..."
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = setting.setting && setting.setting.web_settings.favicon;
  });


  fcmToken(setTokenFound);
  // onMessageListener(set_notification.notification).then(set_notification => {
  //   setShow(true);
  //   setNotification({ title: set_notification.notification[0].title, body: set_notification.notification[0].message })
  //   console.log(set_notification);
  // }).catch(err => console.log('failed: ', err));

  // onMessageListener().then(payload => {
  //   setShow(true);
  //   setNotification({ title: payload.notification.title, body: payload.notification.body })

  //   // console.log(notification)
  // })


  return (
    <>
        

      <AnimatePresence>
        <div className="h-auto">

          <Header />

          {city.city === null || shop.shop === null || setting.setting === null
            ? (
              <>
                <Loader screen='full' />
              </>
            )
            : (
              <>

                <main id='main' className="main-app">
                  <Routes >
                    {/* {user.user && user.user} */}
                    {user.user ?
                      <>
                        <Route exact={true} path="/cart" element={<ViewCart />}></Route>
                        <Route exact={true} path="/checkout" element={<Checkout />}></Route>
                        <Route exact={true} path='/wishlist' element={<Wishlist />}></Route>
                        <Route exact={true} path="/profile" element={<ProfileDashboard />}></Route>
                        <Route exact={true} path="/notification" element={<Notification />}></Route>
                        <Route exact={true} path='/transactions' element={<Transaction />}></Route>
                        <Route exact={true} path='/categories' element={<ShowAllCategories />}></Route>
                        <Route exact={true} path='/products' element={<ProductList />}></Route>
                        <Route exact={true} path='/product' element={<ProductDetails />}></Route>
                        <Route exact={true} path='/product/:slug' element={<ProductDetails />}></Route>
                        <Route exact={true} path='/about' element={<About />}></Route>
                        <Route exact={true} path='/contact' element={<Contact />}></Route>
                        <Route exact={true} path='/faq' element={<FAQ />}></Route>
                        <Route exact={true} path='/terms' element={<Terms />}></Route>
                        <Route exact={true} path='/policy/:policy_type' element={<Policy />}></Route>
                        <Route exact={true} path="" element={<MainContainer />}></Route>
                      </>
                      :
                      <>

                        <Route exact={true} path='/categories' element={<ShowAllCategories />}></Route>
                        <Route exact={true} path='/products' element={<ProductList />}></Route>
                        <Route exact={true} path='/product' element={<ProductDetails />}></Route>
                        <Route exact={true} path='/product/:slug' element={<ProductDetails />}></Route>
                        <Route exact={true} path='/about' element={<About />}></Route>
                        <Route exact={true} path='/contact' element={<Contact />}></Route>
                        <Route exact={true} path='/faq' element={<FAQ />}></Route>
                        <Route exact={true} path='/terms' element={<Terms />}></Route>
                        <Route exact={true} path='/policy/:policy_type' element={<Policy />}></Route>
                        <Route exact={true} path="" element={<MainContainer />}></Route>
                      </>
                    }

                    <Route exact={true} path='*' element={<NotFound />}></Route>

                  </Routes>

                  <button type='button' id="toTop" onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}>
                    <BsArrowUpSquareFill fontSize={"6rem"} fill='var(--secondary-color)' />
                  </button>


                </main>
              </>
            )}
          <Footer />


          <ToastContainer toastClassName='toast-container-class' />
        </div>
      </AnimatePresence>
    </>
  );
}

export default App;