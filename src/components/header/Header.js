import React, { useState, useEffect, useRef } from 'react'
import './header.css'
import { BsShopWindow } from 'react-icons/bs'
import { BiUserCircle } from 'react-icons/bi'
import { MdSearch, MdGTranslate, MdOutlineAccountCircle } from "react-icons/md";
import { IoContrast, IoNotificationsOutline, IoHeartOutline, IoCartOutline, IoPersonOutline } from 'react-icons/io5';
import { IoMdArrowDropdown, IoIosArrowDown } from "react-icons/io"
import { GoLocation } from 'react-icons/go'
import { FiMenu, FiFilter } from 'react-icons/fi'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Location from '../location/Location';
import logoPath from '../../utils/logo_egrocer.svg'
import { getLocation } from '../../utils/manageLocalStorage';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import { ActionTypes } from '../../model/action-type';
import Login from '../login/Login';
import Category from '../category/Category';
import Cookies from 'universal-cookie'
import Cart from '../cart/Cart';
import { toast } from 'react-toastify';
import Favorite from '../favorite/Favorite';
// import $ from 'jquery';
// import { FaRegUserCircle } from 'react-icons/fa';



// import 'bootstrap/dist/js/bootstrap.bundle.js'
// import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.js';


const Header = () => {

    // const [islocationclick, setislocationclick] = useState(false);
    // const [issearchClick, setissearchClick] = useState(false);
    const [isLocationPresent, setisLocationPresent] = useState(false);
    const [totalNotification, settotalNotification] = useState(null)
    const [search, setsearch] = useState("")


    const locationModalTrigger = useRef();
    const closeSidebarRef = useRef();
    const searchNavTrigger = useRef();

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const city = useSelector(state => (state.city))
    const cssmode = useSelector(state => (state.cssmode))
    const user = useSelector(state => (state.user))
    const cart = useSelector(state => (state.cart))
    const favorite = useSelector(state => (state.favorite))
    const setting = useSelector(state => (state.setting))
    const [isSticky, setIsSticky] = useState(false);
    // const categories = useSelector(state => (state.category))

    //initialize cookies
    const cookies = new Cookies();

    const curr_url = useLocation();


    useEffect(() => {

        let location = getLocation();
        if (location !== null) {

            if (Object.keys(location).length !== 0) {
                api.getCity(location.city, location.lat, location.lng)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            dispatch({ type: ActionTypes.SET_CITY, payload: result.data });
                        }
                    })
                setisLocationPresent(true);
            }
        }
        else {
            locationModalTrigger.current.click();
        }
    }, [dispatch])


    const fetchCart = async (token, latitude, longitude) => {
        await api.getCart(token, latitude, longitude)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch({ type: ActionTypes.SET_CART, payload: result })
                }
                else {
                    dispatch({ type: ActionTypes.SET_CART, payload: null })
                }
            })
            .catch(error => console.log(error))
        await api.getCart(token, latitude, longitude, 1)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch({ type: ActionTypes.SET_CART_CHECKOUT, payload: result.data })
                }

            })
            .catch(error => console.log(error))


    }

    const fetchFavorite = async (token, latitude, longitude) => {
        await api.getFavorite(token, latitude, longitude)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch({ type: ActionTypes.SET_FAVORITE, payload: result })
                }
                else {
                    dispatch({ type: ActionTypes.SET_FAVORITE, payload: null })
                }
            })
            .catch(error => console.log(error))
    }

    const fetchNotification = async (token) => {
        await api.getNotification(token)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch({ type: ActionTypes.SET_NOTIFICATION, payload: result.data });
                    settotalNotification(result.total)
                }
            })
            .catch(error => console.log(error))
    }

    useEffect(() => {
        if (city.city !== null && cookies.get('jwt_token') !== undefined && user.user !== null) {
            fetchCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
            fetchFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
            fetchNotification(cookies.get('jwt_token'))
        }

    }, [city, user])


    const fetchPaymentSetting = async () => {
        await api.getPaymentSettings(cookies.get('jwt_token'))
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    // window.razorpay_key = result.data.razorpay_key
                    // window.stripe_publishable_key = result.data.stripe_publishable_key
                    // window.paystack_public_key = result.data.paystack_public_key

                    dispatch({ type: ActionTypes.SET_PAYMENT_SETTING, payload: result.data })
                }
            })
            .catch(error => console.log(error))
    }


    useEffect(() => {
        fetchPaymentSetting()
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };


    }, []);
    const handleScroll = () => {
        if (window.pageYOffset > 0) {
            setIsSticky(true);
        } else {
            setIsSticky(false);
        }
    };


    const handleCssModeChange = (e) => {
        dispatch({ type: ActionTypes.SET_CSSMODE, payload: e.target.value });
    }

    const handleLanguageChange = (e) => {
        dispatch({ type: ActionTypes.SET_LANGUAGE, payload: e.target.value });
    }




    return (
        <>
            {/* sidebar */}
            <div className="hide-desktop offcanvas offcanvas-start" tabIndex="-1" id="sidebaroffcanvasExample" aria-labelledby="sidebaroffcanvasExampleLabel">
                <div className='site-scroll ps'>

                    <div className="canvas-header">
                        <div className='site-brand'>
                            <img src={setting.setting && setting.setting.web_settings.web_logo} height="70px" alt="logo"></img>
                        </div>

                        <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeSidebarRef}><AiOutlineCloseCircle /></button>
                    </div>
                    <div className="canvas-main">
                        <div className='site-location'>
                            <button whileTap={{ scale: 0.8 }} type='buton' data-bs-toggle="modal" data-bs-target="#locationModal" ref={locationModalTrigger}>
                                <div className='d-flex flex-row gap-2'>
                                    <div className='icon location p-1 m-auto'>
                                        <GoLocation />
                                    </div>
                                    <div className='d-flex flex-column flex-grow-1'>
                                        <span className='location-description'>Deliver to <IoMdArrowDropdown /></span>
                                        <span className='current-location'>{isLocationPresent
                                            ? (
                                                <>
                                                    {city.status === 'fulfill'
                                                        ? city.city.formatted_address
                                                        : (
                                                            <div className="d-flex justify-content-center">
                                                                <div className="spinner-border" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                </>)
                                            : "Please select location"
                                        }</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <div className='canvas-title'>
                            <h6 className='entry-title'>Site Navigation</h6>
                        </div>

                        <nav className='canvas-menu canvas-primary vertical'>
                            <ul id='menu-menu-1' className='menu'>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click()
                                        navigate('/')
                                    }}>Home</button>
                                </li>

                                <li className='dropdown mega-menu menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children' >
                                    <button type="button" >
                                        Shop
                                    </button>
                                    <ul className="sub-menu dropdown-menu" aria-labelledby="ShopDropDown">
                                        <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button' onClick={() => {
                                                closeSidebarRef.current.click()
                                                navigate('/cart')
                                            }}>Cart</button>
                                        </li>

                                        <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button' onClick={() => {
                                                closeSidebarRef.current.click()
                                                navigate('/checkout')
                                            }}>Checkout</button>
                                        </li>

                                        <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button' onClick={() => {
                                                closeSidebarRef.current.click()
                                                navigate('/profile')
                                            }}>My Account</button>
                                        </li>

                                        <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button' onClick={() => {
                                                closeSidebarRef.current.click()
                                                navigate('/wishlist')
                                            }}>wishlist</button>
                                        </li>

                                        {/* <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button'>Order Tracking</button>
                                        </li> */}
                                    </ul>
                                    <button className='menu-dropdown' id="ShopDropDown" type='button' data-bs-toggle="dropdown" aria-expanded="false">
                                        <IoIosArrowDown />
                                    </button>
                                </li>

                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click()
                                        navigate('/about')
                                    }}>About Us</button>
                                </li>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click()
                                        navigate('/contact')
                                    }}>Contact Us</button>
                                </li>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click()
                                        navigate('/faq')
                                    }}>FAQ</button>
                                </li>
                                <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click()
                                        navigate('/notification')
                                    }}>Notification</button>
                                </li>

                            </ul>


                            {/* <div className='lang-mode-utils'>
                                <div className='util'>
                                    <span>Select Language</span>
                                    <select className='' onChange={handleLanguageChange}>
                                        <option value="english">English</option>
                                        <option value="gujarati">Gujarati</option>
                                        <option value="hindi">Hindi</option>
                                    </select>
                                </div>
                                <div className='util'>
                                    <span>Select Mode</span>
                                    <select className='' onChange={handleCssModeChange}>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>

                            </div> */}
                        </nav>
                    </div>
                </div>

            </div>

            {/* header */}
            <header className='site-header  desktop-shadow-disable mobile-shadow-enable bg-white  mobile-nav-enable border-bottom'>


                {/* top header */}
                <div className={`header-top  hide-mobile ${(cssmode.cssmode === "dark") ? "dark-header-top" : ''}`}>
                    <div className="container">
                        <div className={`row justify-content-between`}>
                            <div className='col-md-6 d-flex justify-content-start align-items-center'>
                                <Link to='/about' className={`borderPad ${(cssmode.cssmode === "dark") ? "dark-header-1" : ''}`} > About us</Link>
                                <Link to='/contact' className={`borderPad`} > Contact us</Link>
                                <Link to='/faq' className={`borderPad`} > faq</Link>
                            </div>
                            <div className='col-md-6 d-flex justify-content-end'>
                                {/* 2nd Phase feature */}
                                {/* <div className='d-flex px-2 border-start'>
                                    <div>
                                        <IoContrast className='fs-3' />
                                    </div>
                                    <select className='p-2' onChange={handleCssModeChange}>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div> */}

                                {/* <div className='d-flex'>
                                    <div className='p-4 bg-white' >
                                        <MdGTranslate className='fs-3' />
                                        <select className='bg-white' onChange={handleLanguageChange}>
                                            <option value="english">English</option>
                                            <option value="gujarati">Gujarati</option>
                                            <option value="hindi">Hindi</option>
                                        </select>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>


                {/* bottom header */}
                <div className={isSticky ? "sticky header-main  w-100" : "header-main  w-100"}>
                    <div className="container">
                        <div className='d-flex row-reverse justify-content-lg-between justify-content-center'>

                            <div className='d-flex w-auto align-items-center justify-content-start col-md-2 order-1 column-left '>

                                <div className='header-buttons hide-desktop' style={curr_url.pathname === '/profile' ? { display: "none" } : null}>

                                    <button className='header-canvas button-item' type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebaroffcanvasExample" aria-controls="sidebaroffcanvasExample">
                                        <div className='button-menu'>
                                            <FiMenu />
                                        </div>
                                    </button>


                                </div>


                                <Link to='/' className='site-brand' style={curr_url.pathname === '/profile' ? { marginLeft: '4px' } : null}>
                                    <img src={setting.setting && setting.setting.web_settings.web_logo} height="70px" alt="logo" className='desktop-logo hide-mobile' />
                                    <img src={setting.setting && setting.setting.web_settings.web_logo} height="70px" alt="logo" className='mobile-logo hide-desktop' />

                                </Link>
                            </div>


                            <div className='d-flex  w-lg-100 col-md-6 order-2 justify-content-center align-items-center '>

                                {/* location modal trigger button */}
                                <button whileTap={{ scale: 0.6 }} type='buton' className='header-location site-location hide-mobile' data-bs-toggle="modal" data-bs-target="#locationModal" ref={locationModalTrigger}>
                                    <div className='d-flex flex-row gap-2'>
                                        <div className='icon location p-1 m-auto'>
                                            <GoLocation />
                                        </div>
                                        <div className='d-flex flex-column flex-grow-1 align-items-start' >
                                            <span className='location-description'>Deliver to <IoMdArrowDropdown /></span>
                                            <span className='current-location'>{isLocationPresent
                                                ? (
                                                    <>
                                                        {city.status === 'fulfill'
                                                            ? city.city.formatted_address
                                                            : (
                                                                <div className="d-flex justify-content-center">
                                                                    <div className="spinner-border" role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </>)
                                                : "Please select location"
                                            }</span>
                                        </div>
                                    </div>
                                </button>

                                <></>
                                <div className='header-search rounded-3 '>
                                    <form onSubmit={(e) => {
                                        e.preventDefault()

                                        if (search !== "") {
                                            dispatch({ type: ActionTypes.SET_FILTER_SEARCH, payload: search });
                                            if (curr_url.pathname !== '/products') {
                                                navigate('/products')
                                            }
                                            searchNavTrigger.current.click()
                                        }

                                    }} className='search-form'>
                                        <input type="search" id="search-box" placeholder="What are you looking for..." className='rounded-5' onChange={(e) => {
                                            if (e.target.value === '') {
                                                dispatch({ type: ActionTypes.SET_FILTER_SEARCH, payload: null })
                                            }
                                            setsearch(e.target.value)
                                        }} />

                                        <button type='submit'>
                                            <MdSearch fill='white' />
                                        </button>
                                    </form>
                                </div>


                            </div>


                            <div className='d-flex col-md-3 w-auto order-3  justify-content-end align-items-center'>
                                <button type='button' whileTap={{ scale: 0.6 }} className='icon position-relative hide-mobile mx-sm-4' onClick={() => {
                                    if (cookies.get('jwt_token') === undefined) {
                                        toast.error("OOPS!You have to login first to see notification!")
                                    }
                                    else {
                                        navigate('/notification')
                                    }
                                }}>
                                    <IoNotificationsOutline />
                                    {totalNotification === null ? null
                                        : <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5 ">
                                            {totalNotification}
                                            <span className="visually-hidden">unread messages</span>
                                        </span>}

                                </button>

                                {city.city === null || cookies.get('jwt_token') === undefined
                                    ? <button whileTap={{ scale: 0.6 }} className='icon mx-sm-4 position-relative hide-mobile-screen'
                                        onClick={() => {
                                            if (cookies.get('jwt_token') === undefined) {
                                                toast.error("OOPS!You have to login first to see your cart!")
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!")
                                            }
                                        }}>
                                        <IoHeartOutline className='' />
                                    </button>
                                    : <button whileTap={{ scale: 0.6 }} className='icon mx-4 position-relative hide-mobile-screen' data-bs-toggle="offcanvas" data-bs-target="#favoriteoffcanvasExample" aria-controls="favoriteoffcanvasExample"
                                        onClick={() => {
                                            if (cookies.get('jwt_token') === undefined) {
                                                toast.error("OOPS!You have to login first to see your cart!")
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!")
                                            }
                                        }}>
                                        <IoHeartOutline className='' />

                                        {favorite.favorite !== null ?
                                            <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5 ">
                                                {favorite.favorite.total}
                                                <span className="visually-hidden">unread messages</span>
                                            </span>
                                            : null}

                                    </button>
                                }

                                {city.city === null || cookies.get('jwt_token') === undefined
                                    ? <button type='button' whileTap={{ scale: 0.6 }} className='icon mx-4 me-sm-5 position-relative'

                                        onClick={() => {
                                            if (cookies.get('jwt_token') === undefined) {
                                                toast.error("OOPS!You have to login first to see your cart!")
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!")
                                            }
                                        }}>
                                        <IoCartOutline />
                                    </button>

                                    : <button type='button' whileTap={{ scale: 0.6 }} className='icon mx-4 me-sm-5 position-relative' data-bs-toggle="offcanvas" data-bs-target="#cartoffcanvasExample" aria-controls="cartoffcanvasExample"

                                        onClick={() => {
                                            if (cookies.get('jwt_token') === undefined) {
                                                toast.error("OOPS!You have to login first to see your cart!")
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!")
                                            }
                                        }}>
                                        <IoCartOutline />

                                        {cart.cart !== null ?
                                            <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5">
                                                {cart.cart.total}
                                                <span className="visually-hidden">unread messages</span>
                                            </span>
                                            : null}
                                    </button>
                                }

                                {user.status === 'loading'
                                    ? (
                                        <div className='hide-mobile-screen px-3'>
                                            <div whileTap={{ scale: 0.6 }} className='d-flex flex-row user-profile gap-1' data-bs-toggle="modal" data-bs-target="#loginModal">
                                                <div className='d-flex align-items-center user-info my-auto'>
                                                    <span className='btn-success'><IoPersonOutline className='user_icon' /></span>
                                                    <span className='pe-3'>Login</span>
                                                </div>
                                            </div>

                                        </div>
                                    )
                                    : (
                                        <div className='hide-mobile-screen ms-5'>
                                            <Link to='/profile' className='d-flex align-items-center flex-row user-profile gap-1' >
                                                <div className='d-flex flex-column user-info my-auto'>
                                                    <span className='number'> Welcome</span>
                                                    <span className='name'> {user.user.name}</span>
                                                </div>
                                                <img src={user.user.profile} alt="user"></img>
                                            </Link>
                                        </div>
                                    )}

                            </div>

                        </div>
                    </div>
                </div>


                {/* Mobile bottom Nav */}
                <nav className='header-mobile-nav'>
                    <div className='mobile-nav-wrapper'>
                        <ul>
                            <li className='menu-item'>
                                <Link to='/products' className={`shop ${curr_url.pathname === '/products' ? 'active' : ''}`} onClick={() => {
                                    document.getElementsByClassName('shop')[0].classList.add('active')
                                    if (curr_url.pathname !== '/products') {
                                        if (curr_url.pathname === '/products') {
                                            document.getElementsByClassName('filter')[0].classList.remove('active')
                                        }
                                        if (curr_url.pathname === '/profile') {
                                            document.getElementsByClassName('profile-account')[0].classList.remove('active')
                                        }
                                        document.getElementsByClassName('wishlist')[0].classList.remove('active')
                                        document.getElementsByClassName('search')[0].classList.remove('active')
                                        document.getElementsByClassName('header-search')[0].classList.remove('active')
                                    }
                                }}>
                                    <div>
                                        <BsShopWindow />
                                    </div>
                                    <span>Shop</span>
                                </Link>
                            </li>

                            <li className='menu-item'>
                                <button type='button' className='search' ref={searchNavTrigger} onClick={() => {

                                    document.getElementsByClassName('search')[0].classList.toggle('active')
                                    if (curr_url.pathname === '/products') {
                                        document.getElementsByClassName('filter')[0].classList.remove('active')
                                    }
                                    if (curr_url.pathname === '/profile') {
                                        document.getElementsByClassName('profile-account')[0].classList.remove('active')
                                    }
                                    document.getElementsByClassName('wishlist')[0].classList.remove('active')
                                    if (curr_url.pathname !== '/products') {
                                        document.getElementsByClassName('shop')[0].classList.remove('active')
                                    }
                                    document.getElementsByClassName('header-search')[0].classList.toggle('active')
                                }}>
                                    <div>
                                        <MdSearch />
                                    </div>
                                    <span>Search</span>
                                </button>
                            </li>

                            {curr_url.pathname === '/products' ? (
                                <li className='menu-item'>
                                    <button type='button' className='filter' data-bs-toggle="offcanvas" data-bs-target="#filteroffcanvasExample" aria-controls="filteroffcanvasExample" onClick={() => {
                                        if (curr_url.pathname === '/profile') {
                                            document.getElementsByClassName('profile-account')[0].classList.remove('active')
                                        }
                                        document.getElementsByClassName('filter')[0].classList.toggle('active')
                                        document.getElementsByClassName('search')[0].classList.remove('active')
                                        document.getElementsByClassName('wishlist')[0].classList.remove('active')
                                        if (curr_url.pathname !== '/products') {
                                            document.getElementsByClassName('shop')[0].classList.remove('active')
                                        }
                                        document.getElementsByClassName('header-search')[0].classList.remove('active')
                                    }}>
                                        <div>
                                            <FiFilter />
                                        </div>
                                        <span>Filter</span>
                                    </button>
                                </li>
                            ) : ""}

                            <li className='menu-item'>
                                {city.city === null || cookies.get('jwt_token') === undefined
                                    ? <button type='button' className='wishlist' onClick={() => {

                                        if (cookies.get('jwt_token') === undefined) {
                                            toast.error("OOPS!You have to login first to see your cart!")
                                        }
                                        else if (city.city === null) {
                                            toast.error("Please Select you delivery location first!")
                                        }
                                        else {
                                            document.getElementsByClassName('wishlist')[0].classList.toggle('active')
                                            if (curr_url.pathname === '/products') {
                                                document.getElementsByClassName('filter')[0].classList.remove('active')
                                            }
                                            if (curr_url.pathname === '/profile') {
                                                document.getElementsByClassName('profile-account')[0].classList.remove('active')
                                            }
                                            if (curr_url.pathname !== '/products') {
                                                document.getElementsByClassName('shop')[0].classList.remove('active')
                                            }
                                            document.getElementsByClassName('search')[0].classList.remove('active')
                                            document.getElementsByClassName('header-search')[0].classList.remove('active')
                                        }


                                    }}>
                                        <div>
                                            <IoHeartOutline />

                                        </div>
                                        <span>Wishlist</span>
                                    </button>
                                    : <button type='button' className='wishlist' onClick={() => {

                                        if (cookies.get('jwt_token') === undefined) {
                                            toast.error("OOPS!You have to login first to see your cart!")
                                        }
                                        else if (city.city === null) {
                                            toast.error("Please Select you delivery location first!")
                                        }
                                        else {
                                            document.getElementsByClassName('wishlist')[0].classList.toggle('active')
                                            if (curr_url.pathname === '/products') {
                                                document.getElementsByClassName('filter')[0].classList.remove('active')
                                            }
                                            if (curr_url.pathname === '/profile') {
                                                document.getElementsByClassName('profile-account')[0].classList.remove('active')
                                            }
                                            if (curr_url.pathname !== '/products') {
                                                document.getElementsByClassName('shop')[0].classList.remove('active')
                                            }
                                            document.getElementsByClassName('search')[0].classList.remove('active')
                                            document.getElementsByClassName('header-search')[0].classList.remove('active')
                                        }


                                    }} data-bs-toggle="offcanvas" data-bs-target="#favoriteoffcanvasExample" aria-controls="favoriteoffcanvasExample">
                                        <div>
                                            <IoHeartOutline />

                                            {favorite.favorite !== null ?
                                                <span className="translate-middle badge rounded-pill fs-5" style={{ background: "var(--secondary-color)", borderRadius: "50%", color: "#fff", top: "1px", right: "-9px" }}>
                                                    {favorite.favorite.total}
                                                    <span className="visually-hidden">unread messages</span>
                                                </span>
                                                : null}
                                        </div>
                                        <span>Wishlist</span>
                                    </button>}

                            </li>

                            {curr_url.pathname === '/profile' ? (
                                <li className='menu-item'>
                                    <button type='button' className='profile-account' onClick={() => {

                                        document.getElementsByClassName('profile-account')[0].classList.toggle('active')
                                        document.getElementsByClassName('wishlist')[0].classList.remove('active')
                                        if (curr_url.pathname === '/products') {
                                            document.getElementsByClassName('filter')[0].classList.remove('active')
                                        }
                                        if (curr_url.pathname !== '/products') {
                                            document.getElementsByClassName('shop')[0].classList.remove('active')
                                        }
                                        document.getElementsByClassName('search')[0].classList.remove('active')
                                        document.getElementsByClassName('header-search')[0].classList.remove('active')

                                    }} data-bs-toggle="offcanvas" data-bs-target="#profilenavoffcanvasExample" aria-controls="profilenavoffcanvasExample">
                                        <div>
                                            <MdOutlineAccountCircle />

                                        </div>
                                        <span>Account</span>
                                    </button>
                                </li>
                            ) :
                                (
                                    <li className='menu-item'>
                                        {user.status === 'loading'
                                            ? (
                                                <>
                                                    <button type='button' className='account' data-bs-toggle="modal" data-bs-target="#loginModal" onClick={() => {

                                                        document.getElementsByClassName('wishlist')[0].classList.remove('active')
                                                        if (curr_url.pathname === '/products') {
                                                            document.getElementsByClassName('filter')[0].classList.remove('active')
                                                        }
                                                        if (curr_url.pathname !== '/products') {
                                                            document.getElementsByClassName('shop')[0].classList.remove('active')
                                                        }
                                                        document.getElementsByClassName('search')[0].classList.remove('active')
                                                        document.getElementsByClassName('header-search')[0].classList.remove('active')

                                                    }}>
                                                        <div>
                                                            <BiUserCircle />
                                                        </div>
                                                        <span>Login</span>

                                                    </button>

                                                </>
                                            )
                                            : (
                                                <>
                                                    <Link to='/profile' className='d-flex user-profile gap-1 account' onClick={() => {

                                                        document.getElementsByClassName('wishlist')[0].classList.remove('active')
                                                        if (curr_url.pathname === '/products') {
                                                            document.getElementsByClassName('filter')[0].classList.remove('active')
                                                        }
                                                        if (curr_url.pathname !== '/products') {
                                                            document.getElementsByClassName('shop')[0].classList.remove('active')
                                                        }
                                                        document.getElementsByClassName('search')[0].classList.remove('active')
                                                        document.getElementsByClassName('header-search')[0].classList.remove('active')

                                                    }}>
                                                        <div className='d-flex flex-column user-info my-auto'>
                                                            <span className='name'> {user.user.name}</span>
                                                        </div>
                                                        <img src={user.user.profile} alt="user"></img>
                                                        <span>Profile</span>
                                                    </Link>
                                                </>
                                            )}


                                    </li>
                                )}


                        </ul>
                    </div>
                </nav>




                {/* login modal */}
                <Login modal_id='loginModal' />


                {/* location modal */}
                <div className="modal fade location" id="locationModal" data-bs-backdrop="static" aria-labelledby="locationModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: "10px" }}>
                            <Location isLocationPresent={isLocationPresent} setisLocationPresent={setisLocationPresent} />
                        </div>
                    </div>
                </div>


                {/* Cart Sidebar */}
                <Cart />

                {/* favorite sidebar */}
                <Favorite />

            </header>

        </>
    )
}

export default Header
