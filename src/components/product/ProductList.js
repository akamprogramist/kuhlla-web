import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BsPlusCircle, BsGrid, BsListUl } from "react-icons/bs";
import { AiOutlineEye, AiOutlineCloseCircle } from 'react-icons/ai'
import { FaRupeeSign } from "react-icons/fa";
import { BsHeart, BsShare, BsPlus, BsHeartFill } from "react-icons/bs";
import { BiMinus, BiLink } from 'react-icons/bi'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/api';
import { motion } from 'framer-motion'
import { ActionTypes } from '../../model/action-type';
import ReactSlider from 'react-slider';
import logoPath from '../../utils/logo_egrocer.svg'
import Pagination from 'react-js-pagination';
import { toast } from 'react-toastify'
import Cookies from 'universal-cookie'
import { setSelectedProductId } from '../../utils/manageLocalStorage';
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
import Loader from '../loader/Loader';
import No_Orders from '../../utils/zero-state-screens/No_Orders.svg'
import CryptoJS from "crypto-js";
import QuickViewModal from './QuickViewModal';
import { Dropdown } from 'react-bootstrap';
import { IoIosArrowDown } from 'react-icons/io';

const ProductList = () => {


    const total_products_per_page = 12;
    const secret_key = 'Xyredg$5g'
    const share_parent_url = 'https://devegrocer.thewrteam.in/product'

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const cookies = new Cookies()

    const closeCanvas = useRef()

    // const navigate = useNavigate();
    // let query = new URLSearchParams(useLocation().search)

    const category = useSelector(state => state.category);
    const city = useSelector(state => state.city);
    const filter = useSelector(state => state.productFilter);
    const favorite = useSelector(state => (state.favorite))
    const setting = useSelector(state => (state.setting))
    const cart = useSelector(state => (state.cart))


    const [brands, setbrands] = useState(null)
    const [productresult, setproductresult] = useState([])
    const [productSizes, setproductSizes] = useState(null)
    const [selectedProduct, setselectedProduct] = useState({})
    const [minmaxTotalPrice, setminmaxTotalPrice] = useState({
        total_min_price: null,
        total_max_price: null,
        min_price: 0,
        max_price: null,
    })
    const [offset, setoffset] = useState(0)
    const [totalProducts, settotalProducts] = useState(0)
    const [currPage, setcurrPage] = useState(1)
    const [pagination, setpagination] = useState(null)
    // const [minPrice, setminPrice] = useState(null)
    // const [maxPrice, setmaxPrice] = useState(null)
    const [isLoader, setisLoader] = useState(false)
    const [variant_index, setVariantIndex] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState({});


    const getBrandsApi = () => {
        api.getBrands()
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {

                    result.data.forEach(brand => {

                        api.getProductbyFilter(city.city.id, city.city.latitude, city.city.longitude, { brand_ids: brand.id }, cookies.get('jwt_token'))
                            .then(resp => resp.json())
                            .then(res => {
                                if (res.status === 1) {
                                    setBrandproductcountmap(new Map(brandproductcountmap.set(`brand${brand.id}`, res.total)))
                                }
                                else {
                                }

                            })
                            .catch(error => console.log("error ", error))
                    });
                    setbrands(result.data)
                }
                else {
                }
            })
            .catch(error => console.log("error ", error))
    }

    const getProductfromApi = () => {
        setproductresult(null)
        api.getProductbyFilter(city.city.id, city.city.latitude, city.city.longitude, {
            sort: filter.sort_filter,
            limit: total_products_per_page,
            offset: offset,
        }, cookies.get('jwt_token'))
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setminmaxTotalPrice({
                        total_min_price: result.total_min_price,
                        total_max_price: result.total_max_price,
                        min_price: result.min_price,
                        max_price: result.max_price,
                    })
                    setproductSizes(result.sizes)
                    setproductresult(result.data)
                    settotalProducts(result.total)
                }
                else {
                    setproductresult([]);
                    settotalProducts(0)

                }
            })
    }
    useEffect(() => {
        if (city.city !== null && !selectedProduct.id) {
            getBrandsApi();

            if (filter.category_id === null && filter.brand_ids.length === 0 && filter.price_filter === null && filter.search === null) {

                getProductfromApi()
            }
            else if (filter.brand_ids.length !== 0 && filter.category_id !== null && filter.price_filter !== null && filter.search !== null) {

                filterProductsFromApi({
                    category_id: filter.category_id,
                    brand_ids: filter.brand_ids.toString(),
                    min_price: filter.price_filter.min_price,
                    max_price: filter.price_filter.max_price,
                    sort: filter.sort_filter,
                    search: filter.search,
                    limit: total_products_per_page,
                    offset: offset,
                })
            }
            else if (filter.brand_ids.length !== 0) {
                filterProductsFromApi({
                    brand_ids: filter.brand_ids.toString(),
                    sort: filter.sort_filter,
                    limit: total_products_per_page,
                    offset: offset,
                })
            }
            else if (filter.category_id !== null) {
                filterProductsFromApi({
                    category_id: filter.category_id,
                    sort: filter.sort_filter,
                    limit: total_products_per_page,
                    offset: offset,
                })
            }
            else if (filter.search !== null) {
                filterProductsFromApi({
                    search: filter.search,
                    sort: filter.sort_filter,
                    limit: total_products_per_page,
                    offset: offset,
                })
            }
            else {
                filterProductsFromApi({
                    min_price: filter.price_filter.min_price,
                    max_price: filter.price_filter.max_price,
                    sort: filter.sort_filter,
                    limit: total_products_per_page,
                    offset: offset,
                })
            }
        }
    }, [city, filter, offset, cart])

    


    //brands and their product count map
    const [brandproductcountmap, setBrandproductcountmap] = useState(new Map())



    //for product variants dropdown in product card
    const getProductSizeUnit = (variant) => {
        return productSizes.map(psize => {
            if (parseInt(psize.size) === parseInt(variant.measurement) && psize.short_code === variant.stock_unit_name) {
                return psize.unit_id;
            }
        });

    }


    const getProductVariants = (product, ind) => {
        return product.variants.map((variant, index) => (
            <>
                {variant.stock > 1 ? <>
                    <Dropdown.Item key={index} value={JSON.stringify(variant)} onClick={
                        () => {
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
                                }
                            }
                            setVariantIndex(index)
                            document.getElementById(`price${ind}-section`).innerHTML = document.getElementById(`fa-rupee${ind}`).outerHTML + variant.discounted_price;
                            // document.getElementById(`dropDown-Toggle${ind}`).innerHTML = variant.price;\

                        }} className="d-flex">
                        {variant.measurement} {variant.stock_unit_name} Rs. <p className="original-price">{variant.price}</p>
                    </Dropdown.Item></> : <>
                    <Dropdown.Item>
                        Sold Out
                    </Dropdown.Item>

                </>}

            </>
        ))
    }



    //filters
    const filterProductsFromApi = async (filter) => {
        setproductresult(null);
        await api.getProductbyFilter(city.city.id, city.city.latitude, city.city.longitude, filter, cookies.get('jwt_token'))
            .then(response => response.json())
            .then(result => {
                if (result.status == 1) {
                    setminmaxTotalPrice({
                        total_min_price: result.total_min_price,
                        total_max_price: result.total_max_price,
                        min_price: result.min_price,
                        max_price: result.max_price,
                    })
                    const filtered_data = result.data;
                    setproductresult(filtered_data)
                    setproductSizes(result.sizes)
                    console.error(result.total)
                    settotalProducts(result.total)
                }
                else {
                    setminmaxTotalPrice({
                        total_min_price: 0,
                        total_max_price: 0,
                        min_price: 0,
                        max_price: 0,
                    })
                    setisLoader(false)
                    setproductresult([]);
                    settotalProducts(0)
                }
            })
            .catch(error => console.log("error ", error))
    }

    //filter by brands
    const sort_unique_brand_ids = (int_brand_ids) => {
        if (int_brand_ids.length === 0) return int_brand_ids;
        int_brand_ids = int_brand_ids.sort(function (a, b) { return a * 1 - b * 1; });
        var ret = [int_brand_ids[0]];
        for (var i = 1; i < int_brand_ids.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
            if (int_brand_ids[i - 1] !== int_brand_ids[i]) {
                ret.push(int_brand_ids[i]);
            }
        }
        return ret;
    }

    //onClick event of brands
    const filterbyBrands = (brand) => {

        setcurrPage(1)
        setoffset(0)
        var brand_ids = [...filter.brand_ids];

        if (brand_ids.includes(brand.id)) {
            brand_ids.splice(brand_ids.indexOf(brand.id), 1)
        }
        else {
            brand_ids.push(parseInt(brand.id));
        }

        const sorted_brand_ids = sort_unique_brand_ids(brand_ids);

        dispatch({ type: ActionTypes.SET_FILTER_BRANDS, payload: sorted_brand_ids })

        
    }


    //filter by category

    //onLClick event of category
    const filterbyCategory = (category) => {

        setcurrPage(1)
        setoffset(0)
        if (filter.category_id === category.id) {
            dispatch({ type: ActionTypes.SET_FILTER_CATEGORY, payload: null })
        }
        else {
            dispatch({ type: ActionTypes.SET_FILTER_CATEGORY, payload: category.id })
        }
    }


    const Filter = () => {
        return (
            <>
                {/* filter section */}

                <div className=' filter-row'>
                    <h5>Product category</h5>
                    {category.status === 'loading'
                        ? (
                            <Loader />
                        )
                        : (
                            <>
                                {category.category.map((ctg, index) => (
                                    <div whileTap={{ scale: 0.8 }} onClick={() => {
                                        filterbyCategory(ctg)
                                        closeCanvas.current.click()
                                    }} className={`d-flex justify-content-between align-items-center filter-bar ${filter.category_id !== null ? filter.category_id === ctg.id ? 'active' : null : null}`} key={index}>
                                        <div className='d-flex gap-3'>
                                            <div className='image-container'>
                                                <img src={ctg.image_url} alt="category"></img>

                                            </div>
                                            <p>{ctg.name}</p>
                                        </div>

                                        <BsPlusCircle />
                                    </div>
                                ))}
                            </>
                        )}
                </div>

                <div className='filter-row '>
                    <h5>Filter by price</h5>
                    {minmaxTotalPrice.total_min_price == null || minmaxTotalPrice.total_max_price == null || minmaxTotalPrice.min_price == null || minmaxTotalPrice.max_price == null
                        ? (
                            <Loader />
                        )
                        : (
                            <>

                                <ReactSlider
                                    className="slider"
                                    thumbClassName="thumb"
                                    trackClassName="track"
                                    min={minmaxTotalPrice.total_min_price}
                                    max={minmaxTotalPrice.total_max_price}
                                    defaultValue={[0, minmaxTotalPrice.total_max_price]}
                                    ariaLabel={['Lower thumb', 'Upper thumb']}
                                    ariaValuetext={state => `Thumb value ${state.valueNow}`}
                                    renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                                    pearling={true}
                                    withTracks={true}
                                    minDistance={100}
                                    onAfterChange={([min, max]) => {
                                        setcurrPage(1)
                                        setoffset(0)
                                        dispatch({ type: ActionTypes.SET_FILTER_MIN_MAX_PRICE, payload: { min_price: min, max_price: max } })
                                        closeCanvas.current.click()
                                    }}
                                />
                            </>
                        )}

                </div>

                <div className='filter-row'>
                    <h5>Brands</h5>
                    {brands === null
                        ? (
                            <Loader />

                        )
                        : (
                            <>
                                {brands.map((brand, index) => (
                                    <div whileTap={{ scale: 0.8 }} onClick={() => {
                                        filterbyBrands(brand)
                                        closeCanvas.current.click()
                                    }} className={`d-flex justify-content-between align-items-center filter-bar ${filter.brand_ids !== [] ? filter.brand_ids.includes(brand.id) ? 'active' : null : null}`} key={index} >
                                        <div className='d-flex gap-3 align-items-baseline'>
                                            <div className='image-container'>
                                                <img src={brand.image_url} alt="category"></img>
                                            </div>
                                            <p>{brand.name}</p>
                                        </div>
                                        <div className='d-flex align-items-baseline justify-content-center brand-count'>
                                            <p className='m-auto'>{brandproductcountmap.get(`brand${brand.id}`) !== undefined
                                                ? brandproductcountmap.get(`brand${brand.id}`)
                                                : 0}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                </div>

            </>
        )
    }



    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_products_per_page - total_products_per_page)
    }



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
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART, payload: res })
                            else
                                dispatch({ type: ActionTypes.SET_CART, payload: null })
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

    //Add to favorite
    const addToFavorite = async (product_id) => {
        setisLoader(true)
        await api.addToFavotite(cookies.get('jwt_token'), product_id)
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
                        })
                }
                else {
                    setisLoader(false)
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



    return (
        <>
            <section id="productlist" className='container' onContextMenu={() => { return false }}>
                <div className='row' id='products'>

                    <div className="hide-desktop col-3 offcanvas offcanvas-start" tabIndex="-1" id="filteroffcanvasExample" aria-labelledby="filteroffcanvasExampleLabel" data-bs-backdrop="false">
                        <div className="canvas-header">
                            <div className='site-brand'>
                                <img src={logoPath} height="50px" alt="logo"></img>
                            </div>

                            <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeCanvas} onClick={() => {
                                document.getElementsByClassName('filter')[0].classList.remove('active')

                            }}><AiOutlineCloseCircle /></button>
                        </div>
                        {Filter()}
                    </div>


                    {/* filter section */}
                    <div className='flex-column col-2 col-md-3 col-md-auto filter-container hide-mobile-screen' style={{ gap: "30px" }}>
                        {Filter()}
                    </div>

                    {/* products according to applied filter */}
                    <div className='d-flex flex-column col-md-9 col-12 h-100 productList_container' style={{ gap: '20px' }}>
                        <div className="row">

                            <div className='d-flex col-12 flex-row justify-content-between align-items-center filter-view'>
                                <div className='d-flex gap-3'>
                                    {/* 3rd Phase feature - List View */}
                                    {/* <div className={`icon ${!filter.grid_view ? 'active' : null}`} onClick={() => {
                                        dispatch({ type: ActionTypes.SET_FILTER_VIEW, payload: false });
                                    }}>
                                        <BsListUl fontSize={"2rem"} />
                                    </div>
                                    <div className={`icon ${filter.grid_view ? 'active' : null}`} onClick={() => {
                                        dispatch({ type: ActionTypes.SET_FILTER_VIEW, payload: true });
                                    }}>
                                        <BsGrid fontSize={"2rem"} />
                                    </div> */}
                                    <span className='total_product_count'>{totalProducts} - Products Found</span>
                                </div>

                                <div className="select">
                                    <select className="form-select" aria-label="Default select example" onChange={(e) => {


                                        dispatch({ type: ActionTypes.SET_FILTER_SORT, payload: e.target.value })
                                    }}>
                                        <option value="new">New Products</option>
                                        <option value="old">Old Products</option>
                                        <option value="high">High to Low Price</option>
                                        <option value="low">Low to High Price</option>
                                        <option value="discount">Discounted Products</option>
                                        <option value="popular">Popular Products</option>
                                    </select>

                                </div>
                            </div>



                            {productresult== null
                                ? (
                                    <Loader background='none' width='100%' height='75vh' />
                                )
                                : (
                                    <>
                                        {isLoader ? <Loader background='none' /> : null}
                                        {productresult.length > 0
                                            ? (
                                                <div className='h-100 productList_content'>
                                                    <div className="row flex-wrap">
                                                        {productresult.map((product, index) => (
                                                            <div key={index} className={`${!filter.grid_view ? 'col-12 list-view ' : 'col-md-6 col-sm-6 col-lg-3 '}`}>
                                                                <div className={`product-card my-3 ${filter.grid_view ? "flex-column " : "my-3"}`}>
                                                                    <div className={`image-container  ${!filter.grid_view ? 'border-end col-3 ' : 'col-12'}`} >
                                                                        <span className='border border-light rounded-circle p-2 px-3' id='aiEye'>
                                                                            <AiOutlineEye
                                                                                onClick={() => { setselectedProduct(product) }}
                                                                                data-bs-toggle="modal" data-bs-target="#quickviewModal" />
                                                                        </span>
                                                                        <img src={product.image_url} alt={product.slug} className='card-img-top' onClick={() => {
                                                                            dispatch({ type: ActionTypes.SET_SELECTED_PRODUCT, payload: product.id });
                                                                            setSelectedProductId(product.id)
                                                                            navigate('/product')
                                                                        }} />
                                                                        {!product.is_unlimited_stock && product.variants[0].status === 0 &&
                                                                            <div className="outOfStockOverlay">
                                                                                <p className="outOfStockText">Out of Stock</p>
                                                                            </div>
                                                                        }
                                                                        {filter.grid_view ? '' : <>
                                                                            <div className='d-flex flex-row border-top product-card-footer'>
                                                                                <div className='border-end '>
                                                                                    {

                                                                                        favorite.favorite && favorite.favorite.data.some(element => element.id === product.id) ? (
                                                                                            <button type="button" className='wishlist-product' onClick={() => {
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
                                                                                            <button key={product.id} type="button" className='wishlist-product' onClick={() => {
                                                                                                if (cookies.get('jwt_token') !== undefined) {
                                                                                                    addToFavorite(product.id)
                                                                                                } else {
                                                                                                    toast.error('OOps! You need to login First')
                                                                                                }
                                                                                            }}>
                                                                                                <BsHeart /></button>
                                                                                        )}
                                                                                </div>

                                                                                <div className='border-end aes' style={{ flexGrow: "1" }} >
                                                                                    {product.variants[0].cart_count > 0 ? <>
                                                                                        <div id={`input-cart-productdetail`} className="input-to-cart">
                                                                                            <button type='button' className="wishlist-button" onClick={() => {

                                                                                                if (product.variants[0].cart_count === 1) {
                                                                                                    removefromCart(product.id, product.variants[0].id)
                                                                                                    selectedVariant.cart_count = 0
                                                                                                }
                                                                                                else {
                                                                                                    addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count - 1)
                                                                                                    selectedVariant.cart_count = selectedVariant.cart_count - 1

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

                                                                                                    disabled
                                                                                                />
                                                                                            </div>
                                                                                            <button type='button' className="wishlist-button" onClick={() => {

                                                                                                if (product.is_unlimited_stock) {

                                                                                                    if (selectedVariant.cart_count < Number(setting.setting.max_cart_items_count)) {
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
                                                                                                        selectedVariant.cart_count = selectedVariant.cart_count + 1

                                                                                                    }
                                                                                                }

                                                                                            }}><BsPlus size={20} fill='#fff' /> </button>
                                                                                        </div>
                                                                                    </> : <>

                                                                                        <button type="button" id={`Add-to-cart-section${index}`} className='w-100 h-100 add-to-cart active' onClick={() => {
                                                                                            if (cookies.get('jwt_token') !== undefined) {



                                                                                                if (product.variants[0].status) {
                                                                                                    addtoCart(product.id, product.variants[0].id, 1)
                                                                                                } else {
                                                                                                    toast.error('oops, limited stock available')
                                                                                                }
                                                                                            }

                                                                                            else {
                                                                                                toast.error("Oops! Login to Access the Cart")
                                                                                            }

                                                                                        }} >add to cart</button>
                                                                                    </>}

                                                                                </div>

                                                                                <div className='dropup share'>
                                                                                    <button type="button" className='w-100 h-100' data-bs-toggle="dropdown" aria-expanded="false"><BsShare /></button>

                                                                                    <ul className='dropdown-menu'>
                                                                                        <li><WhatsappShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><WhatsappIcon size={32} round={true} /> <span>WhatsApp</span></WhatsappShareButton></li>
                                                                                        <li><TelegramShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><TelegramIcon size={32} round={true} /> <span>Telegram</span></TelegramShareButton></li>
                                                                                        <li><FacebookShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><FacebookIcon size={32} round={true} /> <span>Facebook</span></FacebookShareButton></li>
                                                                                        <li>
                                                                                            <button type='button' onClick={() => {
                                                                                                navigator.clipboard.writeText(`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`)
                                                                                                toast.success("Copied Succesfully!!")
                                                                                            }} className='react-share__ShareButton'> <BiLink /> <span>Copy Link</span></button>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div></>}
                                                                    </div>


                                                                    <div className="card-body product-card-body p-3" >
                                                                        {/* {filter.grid_view?
                                                                        <></>:
                                                                         <>
                                                                         <div className="product_name"></div>
                                                                         </>} */}
                                                                        <h3 onClick={() => {
                                                                            dispatch({ type: ActionTypes.SET_SELECTED_PRODUCT, payload: product.id });
                                                                            setSelectedProductId(product.id)
                                                                            navigate('/product')
                                                                        }} >{product.name}</h3>
                                                                        <div className='price'>
                                                                            {filter.grid_view ? <>
                                                                                <span id={`price${index}-section`} className="d-flex align-items-center"><p id={`fa-rupee${index}`}>{setting.setting && setting.setting.currency}</p> {product.variants[0].discounted_price == 0 ? product.variants[0].price: product.variants[0].discounted_price}</span>
                                                                                <div className='product_varients_drop'>
                                                                                    <input type="hidden" name={`default-variant-id`} id={`productlist${index}-variant-id`} />

                                                                                    {product.variants.length > 1 ? <>
                                                                                        <div className='variant_selection' onClick={() => { setselectedProduct(product) }} data-bs-toggle="modal" data-bs-target="#quickviewModal">
                                                                                            <span className='product_list_dropdown_span'>{<>{product.variants[0].measurement} {product.variants[0].stock_unit_name} Rs.<span className="original-price" id={`dropDown-Toggle${index}`}>{product.variants[0].price}</span></>}</span>
                                                                                            <IoIosArrowDown />
                                                                                        </div>
                                                                                    </>
                                                                                        :

                                                                                        <>
                                                                                            <p id={`default-product${index}-variant`} value={product.variants[0].id} className='variant_value select-arrow'>{product.variants[0].measurement + " " + product.variants[0].stock_unit_name}
                                                                                            </p>
                                                                                        </>}
                                                                                </div>
                                                                            </> : <>
                                                                                <div className='product_varients_drop d-flex align-items-center'>
                                                                                    {product.variants.length > 1 ? <>

                                                                                        <Dropdown style={{ fontSize: "8px !important" }} className='variant-section' id={`select-product${index}-variant-section`} onChange={(e) => {


                                                                                            if (document.getElementById(`input-cart-section${index}`).classList.contains('active')) {
                                                                                                document.getElementById(`input-cart-section${index}`).classList.remove('active')
                                                                                                document.getElementById(`Add-to-cart-section${index}`).classList.add('active')

                                                                                            }

                                                                                        }}>
                                                                                            <Dropdown.Toggle className='variant_selection_productList'>
                                                                                                <p className='m-0 d-flex align-items-center'>
                                                                                                    {/* {product.variants[0].measurement} {product.variants[0].stock_unit_name} Rs.<p className="original-price m-0" id={`dropDown-Toggle${index}`}>{product.variants[0].price}</p> */}
                                                                                                    {selectedVariant.pid == product.id ? <>{selectedVariant.measurement} {selectedVariant.stock_unit_name} Rs.<span className="original-price" id={`dropDown-Toggle${index}`}>{product.variants[0].price}</span></> : <>{product.variants[0].measurement} {product.variants[0].stock_unit_name} Rs.<span className="original-price" id={`dropDown-Toggle${index}`}>{product.variants[0].price}</span></>}

                                                                                                </p>
                                                                                            </Dropdown.Toggle>
                                                                                            <Dropdown.Menu>
                                                                                                {getProductVariants(product, index)}

                                                                                            </Dropdown.Menu>

                                                                                        </Dropdown>
                                                                                    </>
                                                                                        :

                                                                                        <>
                                                                                            <p id={`default-product${index}-variant`} value={product.variants[0].id} className='variant_value variant_value_a select-arrow'>{product.variants[0].measurement + " " + product.variants[0].stock_unit_name}
                                                                                            </p>
                                                                                        </>}
                                                                                    <span id={`price${index}-section`} className="d-flex align-items-center"><p id='fa-rupee'>{setting.setting && setting.setting.currency}</p> {product.variants[0].discounted_price == 0 ? product.variants[0].price: product.variants[0].discounted_price}</span>
                                                                                </div>
                                                                                <p className="product_list_description" >

                                                                                </p>
                                                                            </>}
                                                                        </div>

                                                                    </div>
                                                                    {filter.grid_view ? <>

                                                                        <div className='d-flex flex-row border-top product-card-footer'>
                                                                            <div className='border-end '>
                                                                                {

                                                                                    favorite.favorite && favorite.favorite.data.some(element => element.id === product.id) ? (
                                                                                        <button type="button" className='wishlist-product' onClick={() => {
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
                                                                                        <button key={product.id} type="button" className='wishlist-product' onClick={() => {
                                                                                            if (cookies.get('jwt_token') !== undefined) {
                                                                                                addToFavorite(product.id)
                                                                                            } else {
                                                                                                toast.error('OOps! You need to login First')
                                                                                            }
                                                                                        }}>
                                                                                            <BsHeart /></button>
                                                                                    )}
                                                                            </div>

                                                                            <div className='border-end aes' style={{ flexGrow: "1" }} >
                                                                                {product.variants[0].cart_count > 0 ? <>
                                                                                    <div id={`input-cart-productdetail`} className="input-to-cart">
                                                                                        <button type='button' className="wishlist-button" onClick={() => {

                                                                                            if (product.variants[0].cart_count === 1) {
                                                                                                removefromCart(product.id, product.variants[0].id)
                                                                                                selectedVariant.cart_count = 0
                                                                                            }
                                                                                            else {
                                                                                                addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count - 1)
                                                                                                selectedVariant.cart_count = selectedVariant.cart_count - 1

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

                                                                                                disabled
                                                                                            />
                                                                                        </div>
                                                                                        <button type='button' className="wishlist-button" onClick={() => {

                                                                                            if (product.is_unlimited_stock) {

                                                                                                if (product.variants[0].cart_count < Number(setting.setting.max_cart_items_count)) {
                                                                                                    addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1)


                                                                                                } else {
                                                                                                    toast.error('Apologies, maximum product quantity limit reached!')
                                                                                                }
                                                                                            } else {

                                                                                                if (product.variants[0].cart_count >= Number(product.variants[0].stock)) {
                                                                                                    toast.error('Oops, limited stock available!!')
                                                                                                }
                                                                                                else if (Number(product.variants[0].cart_count) >= Number(product.total_allowed_quantity)) {
                                                                                                    toast.error('Apologies, maximum product quantity limit reached')
                                                                                                } else {

                                                                                                    addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1)
                                                                                                }
                                                                                            }

                                                                                        }}><BsPlus size={20} fill='#fff' /> </button>
                                                                                    </div>
                                                                                </> : <>

                                                                                    <button type="button" id={`Add-to-cart-section${index}`} className='w-100 h-100 add-to-cart active' onClick={() => {
                                                                                        if (cookies.get('jwt_token') !== undefined) {



                                                                                            if (product.variants[0].status) {
                                                                                                addtoCart(product.id, product.variants[0].id, 1)
                                                                                            } else {
                                                                                                toast.error('oops, limited stock available')
                                                                                            }
                                                                                        }

                                                                                        else {
                                                                                            toast.error("Oops! Login to Access the Cart")
                                                                                        }

                                                                                    }} >add to cart</button>
                                                                                </>}

                                                                            </div>

                                                                            <div className='dropup share'>
                                                                                <button type="button" className='w-100 h-100' data-bs-toggle="dropdown" aria-expanded="false"><BsShare /></button>

                                                                                <ul className='dropdown-menu'>
                                                                                    <li className='dropDownLi'><WhatsappShareButton url={`${share_parent_url}/${product.slug}`}><WhatsappIcon size={32} round={true} /> <span>WhatsApp</span></WhatsappShareButton></li>
                                                                                    <li className='dropDownLi'><TelegramShareButton url={`${share_parent_url}/${product.slug}`}><TelegramIcon size={32} round={true} /> <span>Telegram</span></TelegramShareButton></li>
                                                                                    <li className='dropDownLi'><FacebookShareButton url={`${share_parent_url}/${product.slug}`}><FacebookIcon size={32} round={true} /> <span>Facebook</span></FacebookShareButton></li>
                                                                                    <li>
                                                                                        <button type='button' onClick={() => {
                                                                                            navigator.clipboard.writeText(`${share_parent_url}/${product.slug}`)
                                                                                            toast.success("Copied Succesfully!!")
                                                                                        }} className='react-share__ShareButton'> <BiLink /> Copy Link</button>
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </> : <></>}
                                                                </div>
                                                            </div>
                                                        ))}



                                                    </div>

                                                    <div>
                                                        <Pagination
                                                            activePage={currPage}
                                                            itemsCountPerPage={total_products_per_page}
                                                            totalItemsCount={totalProducts}
                                                            pageRangeDisplayed={5}
                                                            onChange={handlePageChange.bind(this)}
                                                        />
                                                    </div>
                                                    <QuickViewModal selectedProduct={selectedProduct} setselectedProduct={setselectedProduct} />
                                                </div>


                                            )
                                            : (
                                                <div className='no-product'>
                                                    <img src={No_Orders} alt='no-product' className='img-fluid'></img>
                                                    <p>No Products Found</p>
                                                </div>
                                            )}



                                    </>

                                )}
                        </div>
                    </div>

                </div>

            </section >
        </>

    )
}

export default ProductList
