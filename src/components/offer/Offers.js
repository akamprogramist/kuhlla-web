import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import './offer.css'
import Slider from 'react-slick'
import { AiOutlineArrowRight } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
// import offer3 from '../../utils/offers/offer3.jpg'
// import offer4 from '../../utils/offers/offer4.jpg'
// import offer5 from '../../utils/offers/offer5.jpg'


function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={window.innerWidth > 450 ? { ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--secondary-color)", borderRadius: "50%", width: "30px", height: "30px" } : { display: "none" }}
            onClick={onClick}
        />
    );
}

function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={window.innerWidth > 450 ? { ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--secondary-color)", borderRadius: "50%", width: "30px", height: "30px" } : { display: "none" }}
            onClick={onClick}
        />
    );
}


const Offers = () => {

    const shop = useSelector(state => state.shop);
    


   



    const settings = {
        infinite: false,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        direction: 'rtl',
        pauseOnDotsHover: false,
        pauseOnFocus: true,
        slidesToShow: 2,
        slidesPerRow: 1,
        initialSlide: 0,
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
        // Add custom navigation buttons using Font Awesome icons
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },

            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            },
            {
                breakpoint: 425,
                settings: {
                    slidesToShow: 1,

                }
            }
        ]
    };

    return (
        <>
            {shop.shop.offers.length === 0
                ? null
                : (
                    <>
                        <div className="col-md-12">
                            <div className="offer-container">
                                <div className="row">
                                    <div className='col-12 d-flex flex-column offer-container-heading'>
                                        <div className="">
                                            <span>choose your offer</span>
                                            <p>one more offer for you!</p>
                                        </div>
                                    </div>
                                    <div className="offer-container-content">

                                        <Slider {...settings}>
                                            {shop.shop.offers.map((offer, index) => (
                                                <div key={index} >
                                                    <div className="offer-container-body p-2 col-3'">

                                                        <img src={offer.image_url} alt="offers" />
                                                        {/* <button type='button'>shop now <AiOutlineArrowRight fill="#fff" /></button> */}
                                                    </div>
                                                </div>
                                            ))}

                                        </Slider>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </>
                )}
        </>
    )
}

export default Offers
