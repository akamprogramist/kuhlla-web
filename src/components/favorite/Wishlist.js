import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import coverImg from '../../utils/cover-img.jpg'
import '../cart/cart.css'
import './favorite.css'
import EmptyCart from '../../utils/zero-state-screens/Empty_Cart.svg'
import { useNavigate, Link } from 'react-router-dom';
import { FaRupeeSign } from "react-icons/fa";
import { BsPlus } from "react-icons/bs";
import { BiMinus } from 'react-icons/bi'
import api from '../../api/api';
import { toast } from 'react-toastify'
import Cookies from 'universal-cookie'
import { ActionTypes } from '../../model/action-type';
import { RiDeleteBinLine } from 'react-icons/ri'
import Loader from '../loader/Loader';
import { IoIosArrowDown } from 'react-icons/io';
import QuickViewModal from '../product/QuickViewModal';


const Wishlist = () => {

    const closeCanvas = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cookies = new Cookies();

    const favorite = useSelector(state => (state.favorite))
    const city = useSelector(state => (state.city))
    const sizes = useSelector(state => (state.productSizes))
    const cart = useSelector((state) => state.cart)
    const setting = useSelector((state) => state.setting)

    const [productSizes, setproductSizes] = useState(null)
    const [isfavoriteEmpty, setisfavoriteEmpty] = useState(false)
    const [isLoader, setisLoader] = useState(false)
    const [selectedProduct, setselectedProduct] = useState({})

    useEffect(() => {
        if (sizes.sizes === null || sizes.status === 'loading') {
            if (city.city !== null && favorite.favorite !== null) {
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

        if (favorite.favorite === null && favorite.status === 'fulfill') {
            setisfavoriteEmpty(true)
        }
        else {
            setisfavoriteEmpty(false)
        }

    }, [favorite])

    useEffect(() => {
        api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
            .then(response => response.json())
            .then((result) => {
                dispatch({ type: ActionTypes.SET_FAVORITE, payload: result })
            })
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
                            setisLoader(false)

                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART, payload: res })
                        })
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
                            setisLoader(false)
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART, payload: res })
                            else
                                dispatch({ type: ActionTypes.SET_CART, payload: null })
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

    //remove from favorite
    const removefromFavorite = async (product_id) => {
        setisLoader(true)
        await api.removeFromFavorite(cookies.get('jwt_token'), product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            setisLoader(false)
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_FAVORITE, payload: res })
                            else
                                dispatch({ type: ActionTypes.SET_FAVORITE, payload: null })
                        })
                }
                else {
                    setisLoader(false)
                    toast.error(result.message)
                }
            })

    }

    return (
        <section id='wishlist' className='wishlist'>
            <div className='cover'>
                <img src={coverImg} className='img-fluid' alt="cover"></img>
                <div className='title'>
                    <h3>Wishlist</h3>
                    <span><Link to='/' className='text-light text-decoration-none'>Home / </Link></span><span className='active'>Wishlist</span>
                </div>
            </div>

            <div className='view-cart-container container'>
                {isfavoriteEmpty ? (
                    <div className='empty-cart'>
                        <img src={EmptyCart} alt='empty-cart'></img>
                        <p>Your Wishlist is empty</p>
                        <span>You have no items in your Wishlist.</span>
                        <span>Let's go Add something!</span>
                        <button type='button' className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => {
                            navigate('/products')
                        }}>start shopping</button>
                    </div>
                ) : (
                    <>
                        {favorite.favorite === null || productSizes === null
                            ? (
                                <Loader screen='full' />
                            )
                            : (
                                <>
                                    {isLoader ? <Loader screen='full' background='none' /> : null}
                                    <div className='viewcart-product-wrapper'>
                                        <div className='product-heading'>
                                            <h3>your wishlist</h3>
                                            <span>There are </span><span className='title'>{favorite.favorite.total}</span> <span> product in this list</span>
                                        </div>

                                        <table className='products-table table'>
                                            <thead>
                                                <tr>
                                                    <th className='first-column'>Product</th>
                                                    <th>price</th>
                                                    <th>Add to cart</th>
                                                    <th className='last-column'>remove</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {favorite.favorite.data.map((product, index) => (
                                                    <tr key={index} className=''>
                                                        <th className='products-image-container first-column'>
                                                            <div className='image-container'>
                                                                <img src={product.image_url} alt='product'></img>
                                                            </div>

                                                            <div className=''>
                                                                <span>{product.name}</span>
                                                                <div className='variant-section' onClick={() => { setselectedProduct(product) }} data-bs-toggle="modal" data-bs-target="#quickviewModal">{product.variants[0].measurement} {product.variants[0].stock_unit_name} <IoIosArrowDown /></div>
                                                            </div>
                                                        </th>

                                                        <th className='price'>
                                                            <FaRupeeSign fill='var(--secondary-color)' />
                                                            <span id={`price-wishlist${index}`}>{parseFloat(product.variants.length > 0 ? product.variants[0].price : 0)}</span>
                                                        </th>

                                                        <th className='quantity'>
                                                            {product && product.variants[0].cart_count > 0 ?
                                                                <>
                                                                    <div className='counter' id={`input-cart-wishlist${index}`}>
                                                                        <button type='button' onClick={() => {
                                                                            if (product.variants[0].cart_count > 1) {
                                                                                addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count - 1)
                                                                            } else {
                                                                                removefromCart(product.id, product.variants[0].id)

                                                                            }
                                                                        }}><BiMinus fill='#fff' /></button>
                                                                        <span id={`input-cart-sidebar${index}`} >{product.variants[0].cart_count}</span>
                                                                        <button type='button' onClick={() => {

                                                                            if (product.is_unlimited_stock == 1) {
                                                                                if (Number(product.variants[0].cart_count) < Number(setting.setting.max_cart_items_count)) {
                                                                                    addtoCart(product.id, product.variants[0].id, Number(product.variants[0].cart_count) + 1)
                                                                                    document.getElementById(`input-cart-sidebar${index}`).innerHTML = product.variants[0].cart_count + 1;
                                                                                } else {
                                                                                    toast.error('Apologies, maximum product quantity limit reached!')
                                                                                }
                                                                            } else {
                                                                                if (Number(product.variants[0].cart_count) >= Number(product.stock)) {
                                                                                    toast.error('Oops, limited stock available!!')
                                                                                } else if (Number(product.variants[0].cart_count) >= Number(setting.setting.max_cart_items_count)) {
                                                                                    toast.error('Apologies, maximum product quantity limit reached!')
                                                                                } else {
                                                                                    addtoCart(product.id, product.variants[0].id, Number(product.variants[0].cart_count) + 1)
                                                                                    document.getElementById(`input-cart-sidebar${index}`).innerHTML = product.variants[0].cart_count + 1;
                                                                                }
                                                                            }
                                                                        }}><BsPlus fill='#fff' /></button>
                                                                    </div>
                                                                </>

                                                                :
                                                                <>
                                                                    <button type='button' id={`Add-to-cart-wishlist${index}`} className='add-to-cart active'
                                                                        onClick={() => {
                                                                            if (cookies.get('jwt_token') !== undefined) {

                                                                                addtoCart(product.id, product.variants[0].id, 1)
                                                                            }
                                                                            else {
                                                                                toast.error("Oops! Login to Access the Cart")
                                                                            }

                                                                        }}
                                                                    >add to cart</button></>}






                                                        </th>

                                                        <th className='remove last-column'>
                                                            <button type='button' onClick={() => removefromFavorite(product.id)}>
                                                                <RiDeleteBinLine fill='red' fontSize={'2.985rem'} />
                                                            </button>
                                                        </th>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                    </>
                )}
            </div>
            <QuickViewModal selectedProduct={selectedProduct} setselectedProduct={setselectedProduct} />

        </section>
    )
}

export default Wishlist
