import React, { useEffect, useState, useRef } from 'react'
import './cart.css'
import { useSelector, useDispatch } from 'react-redux'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { FaRupeeSign } from "react-icons/fa";
import { BsPlus } from "react-icons/bs";
import { BiMinus } from 'react-icons/bi'
import api from '../../api/api';
import { toast } from 'react-toastify'
import Cookies from 'universal-cookie'
import { ActionTypes } from '../../model/action-type';
import EmptyCart from '../../utils/zero-state-screens/Empty_Cart.svg'
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../loader/Loader';

const Cart = () => {

    const closeCanvas = useRef();
    const cookies = new Cookies();
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const cart = useSelector(state => (state.cart))
    const city = useSelector(state => (state.city))
    const sizes = useSelector(state => (state.productSizes))
    const setting = useSelector(state => (state.setting))

    const [productSizes, setproductSizes] = useState(null)
    const [iscartEmpty, setiscartEmpty] = useState(false)
    const [isLoader, setisLoader] = useState(false)

    useEffect(() => {
        if (sizes.sizes === null || sizes.status === 'loading') {
            if (city.city !== null && cart.cart !== null) {
                api.getProductbyFilter(city.city.id, city.city.latitude, city.city.longitude)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            setproductSizes(result.sizes)
                            dispatch({ type: ActionTypes.SET_PRODUCT_SIZES, payload: result.sizes })
                        }
                    })
            }
        }
        else {
            setproductSizes(sizes.sizes)
        }



        if (cart.cart === null && cart.status === 'fulfill' ||cart.status === 1 ) {
            setiscartEmpty(true)
        }
        else {
            setiscartEmpty(false)
        }

    }, [cart])




    

    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty) => {
        setisLoader(true)
        await api.addToCart(cookies.get('jwt_token'), product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART, payload: res })
                        })
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude, 1)
                        .then(resp => resp.json())
                        .then(res => {
                            setisLoader(false)
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART_CHECKOUT, payload: res.data })

                        })
                        .catch(error => console.log(error))
                }
                else {
                    setisLoader(false)
                    toast.error(result.message)
                }
            })
    }

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        setisLoader(true)
        await api.removeFromCart(cookies.get('jwt_token'), product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {

                            if (res.status === 1){
                                dispatch({ type: ActionTypes.SET_CART, payload: res })
                        }
                            else{
                                dispatch({ type: ActionTypes.SET_CART, payload: null })
                            }
                        })
                        .catch(error => console.log(error))
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude, 1)
                        .then(resp => resp.json())
                        .then(res => {
                            setisLoader(false)
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART_CHECKOUT, payload: res.data })


                        })
                        .catch(error => console.log(error))
                }
                else {
                    setisLoader(false)
                    toast.error(result.message)
                }
            })
            .catch(error => console.log(error))
    }

    return (
        <div tabIndex="-1" className={`cart-sidebar-container offcanvas offcanvas-end`} id="cartoffcanvasExample" aria-labelledby="cartoffcanvasExampleLabel">

            <div className='cart-sidebar-header'>
                <h5>your cart</h5>
                <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeCanvas}><AiOutlineCloseCircle /></button>
            </div>

            {iscartEmpty ? (
                <div className='empty-cart'>
                    <img src={EmptyCart} alt='empty-cart'></img>
                    <p>Your Cart is empty</p>
                    <span>You have no items in your shopping cart.</span>
                    <span>Let's go buy something!</span>
                    <button type='button' className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => {
                        navigate('/products')
                    }}>start shopping</button>
                </div>) : (
                <>
                    {cart.cart === null || productSizes === null
                        ? (
                            <Loader width='100%' height='100%' />
                        )
                        : (
                            <>
                                {isLoader ? <Loader screen='full' background='none' /> : null}
                                <div className='cart-sidebar-product'>
                                    <div className='products-header'>
                                        <span>Product</span>
                                        <span>Price</span>
                                    </div>

                                    <div className='products-container'>


                                        {cart.cart.data.cart.map((product, index) => (
                                            <div key={index} className='cart-card'>
                                                <div className='left-wrapper'>
                                                    <div className='image-container'>
                                                        <img src={product.image_url} alt='product'></img>
                                                    </div>

                                                    <div className='product-details'>

                                                        <span>{product.name}</span>

                                                        <div id={`selectedVariant${index}-wrapper-cartsidebar`} className='selected-variant-cart' >
                                                            {product.measurement} {product.unit}
                                                        </div>


                                                        <div className='counter'>
                                                            <button type='button' onClick={() => {
                                                                if (product.qty > 1) {
                                                                    addtoCart(product.product_id, product.product_variant_id, product.qty-1)

                                                                }

                                                            }}><BiMinus fill='#fff' /></button>
                                                            <span id={`input-cart-sidebar${index}`} >{product.qty}</span>
                                                            <button type='button' onClick={() => {
                                                                
                                                                // if (val < product.total_allowed_quantity) {
                                                                //     document.getElementById(`input-cart-sidebar${index}`).innerHTML = val + 1;
                                                                //     addtoCart(product.product_id, product.product_variant_id, document.getElementById(`input-cart-sidebar${index}`).innerHTML)
                                                                // }
                                                                if (product.is_unlimited_stock == 1) {
                                                                    if (Number(product.qty) < Number(setting.setting.max_cart_items_count)) {
                                                                        addtoCart(product.product_id, product.product_variant_id, product.qty + 1)
                                                                    } else {
                                                                        toast.error('Apologies, maximum product quantity limit reached!')
                                                                    }
                                                                } else {
                                                                    if (Number(product.qty) >= Number(product.stock)) {
                                                                        toast.error('Oops, limited stock available!!')

                                                                    } else if (Number(product.qty) >= Number(setting.setting.max_cart_items_count)) {
                                                                        toast.error('Apologies, maximum product quantity limit reached!')
                                                                    }
                                                                    else {
                                                                        addtoCart(product.product_id, product.product_variant_id, product.qty + 1)
                                                                    }
                                                                }
                                                            }}><BsPlus fill='#fff' /></button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='cart-card-end'>
                                                    <div className='d-flex align-items-center' style={{ fontSize: "14px", color:"var(--secondary-color)"}}>
                                                        {setting.setting && setting.setting.currency} <span id={`price${index}-cart-sidebar`}> {parseFloat(product.discounted_price ==0 ? (product.price * Number(product.qty))  : product.discounted_price * Number(product.qty))}</span>
                                                    </div>

                                                    <button type='button' className='remove-product' onClick={() => removefromCart(product.product_id, product.product_variant_id)}>delete</button>

                                                </div>
                                            </div>
                                        ))}


                                    </div>
                                </div>

                                <div className='cart-sidebar-footer'>
                                    <div className='heading'>
                                        <span >order summary</span>
                                    </div>

                                    {cart.checkout === null
                                        ? (
                                            <Loader width='100%' height='90vh' />
                                        )
                                        : (
                                            <>
                                                <div className='summary'>
                                                    <div className='d-flex justify-content-between'>
                                                        <span>Subtotal</span>
                                                        <div className='d-flex align-items-center' style={{ fontSize: "14px"}}>
                                                            {setting.setting && setting.setting.currency}
                                                            <span>{parseFloat(cart.checkout.sub_total)}</span>
                                                        </div>
                                                    </div>

                                                    <div className='d-flex justify-content-between'>
                                                        <span>Delivery Charges</span>
                                                        <div className='d-flex align-items-center' style={{ fontSize: "14px"}}>
                                                        {setting.setting && setting.setting.currency}
                                                            <span>{parseFloat(cart.checkout.delivery_charge.total_delivery_charge)}</span>
                                                        </div>
                                                    </div>

                                                </div>

                                                <div className='d-flex justify-content-between'>
                                                    <span>Total</span>
                                                    <div className='d-flex align-items-center total-amount' style={{ fontSize: "14px", color: "var(--secondary-color)" }}>
                                                    {setting.setting && setting.setting.currency}
                                                        <span>{parseFloat(cart.checkout.total_amount)}</span>
                                                    </div>
                                                </div>


                                                <div className='button-container'>
                                                    <button type='button' className='view-cart' onClick={() => {
                                                        closeCanvas.current.click()
                                                        navigate('/cart')
                                                    }}>view cart</button>
                                                    <button type='button' className='checkout' onClick={() => {
                                                        closeCanvas.current.click()
                                                        navigate('/checkout')
                                                    }}>go to checkout</button>
                                                </div>
                                            </>)}


                                </div>
                            </>
                        )}
                </>
            )
            }
        </div >

    )
}

export default Cart
