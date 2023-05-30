import React, { useState, useEffect } from 'react';
import './footer.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api'
import { ActionTypes } from '../../model/action-type';
import Loader from '../loader/Loader';
import paystack_svg from '../../utils/ic_paystack.svg'
import paypal_svg from '../../utils/ic_paypal.svg'
import paytm_svg from '../../utils/ic_paytm.svg'
import cod_svg from '../../utils/ic_cod.svg'
import razorpay_svg from '../../utils/ic_razorpay.svg'
import stripe_svg from '../../utils/ic_stripe.svg'
import { FaFacebook, FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa"
import { AiFillTwitterCircle, AiOutlineInstagram } from 'react-icons/ai';

export const Footer = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const setting = useSelector(state => (state.setting))
    const user = useSelector(state => (state.user))
    const fetchCategory = () => {
        api.getCategory()
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setcategory(result.data)
                    dispatch({ type: ActionTypes.SET_CATEGORY, payload: result.data });
                }
            })
            .catch(error => console.log("error ", error))
    }


    useEffect(() => {
        fetchCategory();
    }, [])

    const [category, setcategory] = useState(null);

    const selectCategory = (ctg) => {
        dispatch({ type: ActionTypes.SET_FILTER_CATEGORY, payload: ctg.id })
        navigate('/products')
    }

    return (
        <section id="footer">
            <div className="container pb-3">
                <div className="row ">
                    <div className="col-xs-3 col-sm-3 col-md-3 col-12" >
                        <h5>CATEGORIES</h5>

                        {category === null
                            ? (

                                <Loader background='none' width='fit-content' height='fit-content' />
                            )
                            : (
                                <ul className='category-list'>
                                    {category.map((ctg, index) => (
                                        <li key={index}>
                                            <button className='link' onClick={() => {
                                                selectCategory(ctg)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}>
                                                {ctg.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                    </div>

                    <div className="col-xs-3 col-sm-3 col-md-3 col-12">
                        <h5>STORE INFO</h5>
                        <ul className="link-list">
                            <li><Link to="">#262-263, Time Square Empire, SH 42 Mirjapar highway, Bhuj - Kutch 370001, Gujarat India.</Link></li>
                            <li><a href={`tel:${setting.setting !== null ? setting.setting.support_number : "number"}`}>{setting.setting !== null ? setting.setting.support_number : "number"}</a></li>
                            <li><a href={`mailto:${setting.setting !== null ? setting.setting.support_email : "email"}`}>{setting.setting !== null ? setting.setting.support_email : "email"}</a></li>

                        </ul>
                    </div>


                    <div className="col-xs-3 col-sm-3 col-md-3 col-12">
                        <h5>COMPANY</h5>
                        <ul className="link-list" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                            <li><Link to={'/about'}>About us</Link></li>
                            <li><Link to={'/faq'}>Faq</Link></li>
                            <li><Link to={'/contact'}>Contact us</Link></li>
                            <li><Link to={'/terms'}>terms & condition</Link></li>
                            <li><Link to={'/policy/Privacy_Policy'}>Privacy & policy</Link></li>
                            <li><Link to={'/policy/Returns_&_Exchanges_Policy'}>Returns & Exchanges Policy</Link></li>
                            <li><Link to={'/policy/Shipping_Policy'}>Shipping Policy</Link></li>
                            <li><Link to={'/policy/Cancellation_Policy'}>Cancellation Policy</Link></li>
                        </ul>
                    </div>



                    <div className="col-xs-3 col-sm-3 col-md-3 col-12">
                        <div className=' gap-3'>
                            <div>
                                <h5>Download apps</h5>
                                {setting.setting ? <>
                                    <div className="download_desc">
                                        <p>{setting.setting.web_settings.app_short_description}</p>
                                    </div>
                                    <div className='gap-3 d-flex'>
                                        {setting.setting.web_settings.is_android_app == 1 ?
                                            <a href={setting.setting.web_settings.android_app_url} className='download-button'>
                                                <img src={setting.setting.web_settings.play_store_logo} alt='google-play'></img>
                                            </a>
                                            : <></>}
                                        {setting.setting.web_settings.is_ios_app == 1 ?
                                            <a href={setting.setting.web_settings.ios_app_url} className='download-button'>
                                                <img src={setting.setting.web_settings.ios_store_logo} alt='google-play'></img>
                                            </a>
                                            : <></>}


                                    </div>
                                </>
                                    : <></>}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div className="footer ">
                <div className="container flex-sm-row flex-column gap-3 bottom-section-footer">
                    {setting.setting && setting.setting.social_media.length>0 &&
                        <div className="social-media-icons order-sm-0">
                            <span>Follow Us: 
                            
                             {setting.setting.social_media.map((icon, index)=>{
                                return (
                                <>
                                    <a key={index} href={icon.link} className='socical-icons'><i className={`${icon.icon} fa-lg`} style={{ color: "#fff" }}></i></a>
                                </>
                                )
                            })}
                            </span>
                        </div>
                    }
                    <div className="copyright order-sm-1 order-2">
                        <div className="col-xs-12 col-sm-12 col-md-12 mt-2 mt-sm-2 text-center text-white">
                            <span className='company_name'>{setting.setting !== null ? setting.setting.web_settings.copyright_details : "App Name"}</span>
                        </div>
                    </div>
                    {setting.payment_setting ?
                        <div className="payment_methods_container order-sm-1">
                            {setting.payment_setting.cod_payment_method == 1 ?
                                <span className='payment_methods'>
                                    <img src={cod_svg} alt="" srcset="" />
                                </span>
                                : <></>}
                            {setting.payment_setting.paystack_payment_method == 1 ?
                                <span className='payment_methods'>
                                    <img src={paystack_svg} alt="" srcset="" />
                                </span>
                                : <></>}
                            {setting.payment_setting.paypal_payment_method == 1 ?
                                <span className='payment_methods'>
                                    <img src={paypal_svg} alt="" srcset="" />
                                </span>
                                : <></>}
                            {setting.payment_setting.stripe_payment_method == 1 ?
                                <span className='payment_methods'>
                                    <img src={stripe_svg} alt="" srcset="" />
                                </span>
                                : <></>}
                            {setting.payment_setting.paytm_payment_method == 1 ?
                                <span className='payment_methods'>
                                    <img src={paytm_svg} alt="" srcset="" />
                                </span>
                                : <></>}
                            {setting.payment_setting.razorpay_payment_method == 1 ?
                                <span className='payment_methods'>
                                    <img src={razorpay_svg} alt="" srcset="" />
                                </span>
                                : <></>}
                        </div>
                        : <></>}
                </div>
            </div>
        </section>
    );
};