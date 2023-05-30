import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './product.css'
import { AiOutlineEye } from 'react-icons/ai'
import { FaChevronLeft, FaChevronRight, FaRupeeSign } from "react-icons/fa";
import { BsHeart, BsShare, BsPlus, BsHeartFill } from "react-icons/bs";
import { BiMinus, BiLink } from 'react-icons/bi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { setSelectedProductId } from '../../utils/manageLocalStorage';

import Cookies from 'universal-cookie'
import { ActionTypes } from '../../model/action-type';

import QuickViewModal from './QuickViewModal'
import Offers from '../offer/Offers'
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
import { Dropdown } from 'react-bootstrap';
import DropdownToggle from 'react-bootstrap/esm/DropdownToggle';
import { IoIosArrowDown } from 'react-icons/io';
// import Select from 'react-select';




const ProductContainer = () => {

    //initialize cookies
    const cookies = new Cookies();
    const dispatch = useDispatch()
    const curr_url = useLocation()
    const navigate = useNavigate()

    const city = useSelector(state => state.city);
    const shop = useSelector(state => state.shop);
    const setting = useSelector(state => state.setting);
    const cart = useSelector(state => state.cart);
    
    const sizes = useSelector(state => state.productSizes);
    const favorite = useSelector(state => (state.favorite))
    const [quantity, setQuantity] = useState([])
    const [selectedVariant, setSelectedVariant] = useState({});

    // const shop = useSelector(state=>state.shop);

    useEffect(() => {
        if (sizes.sizes === null || sizes.status === 'loading') {
            if (city.city !== null) {
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
    }, [city, sizes])



    const [selectedProduct, setselectedProduct] = useState({})
    const [productSizes, setproductSizes] = useState(null)
    const [offerConatiner, setOfferContainer] = useState(0)
    const [variant_index, setVariantIndex] = useState(null)

    //for product variants dropdown in product card
    const getProductSizeUnit = (variant) => {
        return productSizes.map(psize => {
            if (parseInt(psize.size) === parseInt(variant.measurement) && psize.short_code === variant.stock_unit_name) {
                return psize.unit_id;
            }
        });

    }

    const getProductVariants = (product, index, index0) => {
        return product.variants.map((variant, ind) => {

            return (
                <React.Fragment key={ind}>
                    {

                        variant.stock >= 1 ? (
                            <>
                                <Dropdown.Item
                                    value={JSON.stringify(variant)}
                                    className="options_class"
                                    onClick={() => {
                                        if (cart.cart) {
                                            const cartData = cart.cart.data.cart;
                                            for (let i = 0; i < cartData.length; i++) {
                                                const element = cartData[i];
                                                if (element.product_variant_id === variant.id) {
                                                    setSelectedVariant({ ...variant, pid: product.id });
                                                    break;
                                                } else {

                                                    setSelectedVariant({ ...variant, pid: product.id });
                                                }
                                                // setQuantity({ qty: 0, pid: product.id });
                                            }
                                        }
                                        setVariantIndex({ index: ind, pid: product.id });
                                       
                                        document.getElementById(`price${index}${index0}-section`).innerHTML =
                                            document.getElementById('fa-rupee').innerHTML + variant.discounted_price;
                                        document.getElementById(`select-product${index}${index0}-variant-id`).value = variant.id;
                                    }}
                                >
                                    {variant.measurement} {variant.stock_unit_name} Rs.
                                    <span className="original-price">{variant.price}</span>
                                </Dropdown.Item></>
                        ) : (
                            <Dropdown.Item>Out of Stock</Dropdown.Item>
                        )}
                </React.Fragment>
            );
        });
    };

    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty, is_qty) => {



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
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART_CHECKOUT, payload: res.data })
                        })
                        .catch(error => console.log(error))
                }
                else {
                    toast.error(result.message)
                }
            })
    }

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        await api.removeFromCart(cookies.get('jwt_token'), product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART, payload: res })
                            else
                                dispatch({ type: ActionTypes.SET_CART, payload: null })
                        })
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude, 1)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART_CHECKOUT, payload: res.data })


                        })
                        .catch(error => console.log(error))
                }
                else {
                    toast.error(result.message)
                }
            })
    }

    //Add to favorite
    const addToFavorite = async (product_id) => {
        await api.addToFavotite(cookies.get('jwt_token'), product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_FAVORITE, payload: res })
                        })
                }
                else {
                    toast.error(result.message)
                }
            })
    }
    const removefromFavorite = async (product_id) => {
        await api.removeFromFavorite(cookies.get('jwt_token'), product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_FAVORITE, payload: res })
                            else
                                dispatch({ type: ActionTypes.SET_FAVORITE, payload: null })
                        })
                }
                else {
                    toast.error(result.message)
                }
            })
    }



    const settings = {
        infinite: false,
        slidesToShow: 5.5,
        slidesPerRow: 1,
        initialSlide: 0,
        // centerMode: true,
        centerMargin: "10px",
        margin: "20px", // set the time interval between slides
        // Add custom navigation buttons using Font Awesome icons
        prevArrow: (
            <button type="button" className="slick-prev">
                <FaChevronLeft size={30} className="prev-arrow" />
            </button>
        ),
        nextArrow: (
            <button type="button" className="slick-next">
                <FaChevronRight color='#f7f7f7' size={30} className='next-arrow' />
            </button>
        ),
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 425,
                settings: {
                    slidesToShow: 1.2,

                }
            }
        ]
    };

    const handleValueChange = (index0, newValue) => {
        setOfferContainer(index0);
    };

    return (
        <section id="products">
            <div className="container">
                {shop.shop === null || productSizes === null
                    ? (
                        <>
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </>


                    )
                    : (
                        <>

                            {shop.shop.sections.map((section, index0) => (
                                <div key={index0}>

                                    <div className='product_section row flex-column' value={index0} onChange={(e) => { setOfferContainer(index0) }}>

                                        <div className="d-flex product_title_content justify-content-between align-items-center col-md-12">
                                            <div className="">
                                                <span className='d-none d-md-block'>{section.short_description}</span>
                                                <p>{section.title}</p>
                                            </div>
                                            <div>
                                                {/* <Link to='/products'>see all</Link> */}
                                                <Link to="/products" onClick={() => {
                                                    dispatch({ type: ActionTypes.SET_FILTER_CATEGORY, payload: (section.title == 'All Products' ? section.category_ids : section.products[0].category_id) })
                                                    navigate('/products')
                                                }}>see all</Link>
                                            </div>
                                        </div>

                                        <div className="product_section_content p-0">
                                            <Slider {...settings}>
                                                {section.products.map((product, index) => (
                                                    <div className="row" key={index}>
                                                        {/* {setSelectedVariant({ ...product.variants[0], pid: product.id })} */}

                                                        <div className="col-md-12">

                                                            <div className='product-card'  >

                                                                <div className='image-container' >

                                                                    <span className='border border-light rounded-circle p-2 px-3' id='aiEye'>
                                                                        <AiOutlineEye
                                                                            onClick={() => { setselectedProduct(product) }}
                                                                            data-bs-toggle="modal" data-bs-target="#quickviewModal" />
                                                                    </span>

                                                                    <img src={product.image_url} alt={product.slug} className=
                                                                        {` card-img-top `}
                                                                        onClick={() => {
                                                                            dispatch({ type: ActionTypes.SET_SELECTED_PRODUCT, payload: product.id });
                                                                            setSelectedProductId(product.id)
                                                                            navigate('/product')
                                                                        }} />
                                                                    {!product.is_unlimited_stock && product.variants[0].status === 0 &&
                                                                        <div className="outOfStockOverlay">
                                                                            <p className="outOfStockText">Out of Stock</p>
                                                                        </div>
                                                                    }
                                                                </div>

                                                                <div className="card-body product-card-body p-3" >
                                                                    <h3>{product.name}</h3>
                                                                    <div className='price'>

                                                                        <span id={`price${index}${index0}-section`} className="d-flex align-items-center">
                                                                            <p id='fa-rupee' className='m-0 ' style={{ color: setting.setting && setting.setting.web_settings.color }}>{setting.setting && setting.setting.currency}</p> {product.variants[0].discounted_price == 0?product.variants[0].price : product.variants[0].discounted_price}
                                                                        </span>

                                                                    </div>
                                                                    <div className='product_varients_drop'>
                                                                        <input type="hidden" name={`select-product${index}${index0}-variant-id`} id={`select-product${index}${index0}-variant-id`} value={selectedVariant.pid == product.id ? selectedVariant.id : product.variants[0].id} />
                                                                        {product.variants.length > 1 ? <>
                                                                            <div className='variant_selection' onClick={() => { setselectedProduct(product) }} data-bs-toggle="modal" data-bs-target="#quickviewModal">
                                                                                <span>{<>{product.variants[0].measurement} {product.variants[0].stock_unit_name} </>}</span>
                                                                                <IoIosArrowDown />
                                                                            </div>
                                                                        </>
                                                                            :

                                                                            <>

                                                                                {/* {document.getElementById()} */}
                                                                                <span className={`variant_value select-arrow ${product.variants[0].stock > 0 ? '' : 'text-decoration-line-through'}`}>{product.variants[0].measurement + " " + product.variants[0].stock_unit_name}
                                                                                </span>
                                                                            </>}



                                                                    </div>
                                                                </div>

                                                                <div className='d-flex flex-row border-top product-card-footer'>
                                                                    <div className='border-end'>
                                                                        {

                                                                            favorite.favorite && favorite.favorite.data.some(element => element.id === product.id) ? (
                                                                                <button type="button" className='w-100 h-100' onClick={() => {
                                                                                    if (cookies.get('jwt_token') !== undefined) {
                                                                                        removefromFavorite(product.id)
                                                                                    } else {
                                                                                        toast.error('OOps! You need to login first to add to favourites')
                                                                                    }
                                                                                }}
                                                                                >
                                                                                    <BsHeartFill fill='green' />
                                                                                </button>
                                                                            ) : (
                                                                                <button key={product.id} type="button" className='w-100 h-100' onClick={() => {
                                                                                    if (cookies.get('jwt_token') !== undefined) {
                                                                                        addToFavorite(product.id)
                                                                                    } else {
                                                                                        toast.error('OOps! You need to login First')
                                                                                    }
                                                                                }}>
                                                                                    <BsHeart /></button>
                                                                            )}
                                                                    </div>
                                                                    <div className='border-end' style={{ flexGrow: "1" }} >
                                                                        {product.variants[0].cart_count > 0 ? <>
                                                                            <div id={`input-cart-productdetail`} className="input-to-cart">
                                                                                <button type='button' className="wishlist-button" onClick={() => {

                                                                                    if (product.variants[0].cart_count === 1) {
                                                                                        removefromCart(product.id, product.variants[0].id)

                                                                                    }
                                                                                    else {
                                                                                        addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count - 1)


                                                                                    }

                                                                                }}><BiMinus size={20} fill='#fff' /></button>
                                                                                {/* <span id={`input-productdetail`} >{quantity}</span> */}
                                                                                <div className="quantity-container text-center">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="1"
                                                                                        max={product.variants[0].stock}
                                                                                        className="quantity-input bg-transparent text-center"
                                                                                        value={product.variants[0].cart_count}
                                                                                        // value={cart.cart && cart.cart.data.cart.some(element => element.id == product.variants[0].id ? element.qty : 0)}
                                                                                        onChange={(e) => {
                                                                                            setQuantity(parseInt(e.target.value));
                                                                                        }}
                                                                                        disabled
                                                                                    />
                                                                                </div>
                                                                                <button type='button' className="wishlist-button" onClick={() => {

                                                                                    if (product.is_unlimited_stock) {
                                                                                        
                                                                                        if (product.variants[0].cart_count < Number(product.total_allowed_quantity)) {
                                                                                            addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1)


                                                                                        } else {
                                                                                            toast.error('Apologies, maximum product quantity limit reached!')
                                                                                        }
                                                                                    } else {
                                                                                        
                                                                                        if (product.variants[0].cart_count >= Number(product.variants[0].stock)) {
                                                                                            toast.error('Oops, limited stock available!!')
                                                                                        }
                                                                                        else if (product.variants[0].cart_count >= Number(product.total_allowed_quantity)) {
                                                                                            toast.error('Apologies, maximum product quantity limit reached')
                                                                                        } else {
                                                                                            addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1)


                                                                                        }
                                                                                    }

                                                                                }}><BsPlus size={20} fill='#fff' /> </button>
                                                                            </div>
                                                                        </> : <>
                                                                            <button type="button" id={`Add-to-cart-section${index}${index0}`} className='w-100 h-100 add-to-cart active' onClick={() => {
                                                                                if (cookies.get('jwt_token') !== undefined) {

                                                                                    if (cart.cart && cart.cart.data.cart.some(element => element.product_id === product.id) && cart.cart.data.cart.some(element => element.product_variant_id === product.variants[variant_index.pid == product.id ? variant_index.index : 0].id)) {
                                                                                        toast.info('Product already in Cart')
                                                                                    } else {
                                                                                        if (product.variants[0].status) {

                                                                                            addtoCart(product.id, product.variants[0].id, 1)
                                                                                        } else {
                                                                                            toast.error('OOps ! Limited Stock available')
                                                                                        }
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    toast.error("Oops! Login to Access the Cart")
                                                                                }

                                                                            }} disabled={!product.is_unlimited_stock && product.variants[0].stock <=0}>add to cart</button>
                                                                        </>}
                                                                    </div>

                                                                    <div className='dropup share'>
                                                                        <button type="button" className='w-100 h-100 ' data-bs-toggle="dropdown" aria-expanded="false"><BsShare /></button>

                                                                        <ul className='dropdown-menu'>
                                                                            <li className='dropDownLi'><WhatsappShareButton url={`https://devegrocer.thewrteam.in/product/${product.slug}`}><WhatsappIcon size={32} round={true} /> <span>WhatsApp</span></WhatsappShareButton></li>
                                                                            <li className='dropDownLi'><TelegramShareButton url={`https://devegrocer.thewrteam.in/product/${product.slug}`}><TelegramIcon size={32} round={true} /> <span>Telegram</span></TelegramShareButton></li>
                                                                            <li className='dropDownLi'><FacebookShareButton url={`https://devegrocer.thewrteam.in/product/${product.slug}`}><FacebookIcon size={32} round={true} /> <span>Facebook</span></FacebookShareButton></li>
                                                                            <li>
                                                                                <button type='button' onClick={() => {
                                                                                    navigator.clipboard.writeText(`https://devegrocer.thewrteam.in/product/${product.slug}`)
                                                                                    toast.success("Copied Succesfully!!")
                                                                                }} className="react-share__ShareButton"> <BiLink size={30} /> <span>Copy Link</span></button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Slider>
                                        </div>


                                    </div>

                                    {shop.shop.offers.some((item)=>item.section_position==index0 ) && (
                                        <div className='product_section row flex-column' id='offers'>
                                            <Offers />
                                        </div>
                                    )}
                                </div>
                            )

                            )

                            }
                            <QuickViewModal selectedProduct={selectedProduct} setselectedProduct={setselectedProduct} />
                        </>


                    )
                }
                {offerConatiner === 1 ? <Offers /> : null}
                {/* <div>
                    <div className="product_container">
                    <Offers />
                    </div>
                </div> */}
            </div >

        </section >
    )
}

export default ProductContainer
