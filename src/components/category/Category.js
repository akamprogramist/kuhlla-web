import React, { useState, useEffect, useRef } from 'react'
import './category.css'
import api from '../../api/api'
import { motion } from 'framer-motion'
import { BsPlusCircle, BsGrid3X3GapFill } from "react-icons/bs";
import CategoryChild from './CategoryChild';
import { AiOutlineArrowRight, AiOutlineDown } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { ActionTypes } from '../../model/action-type';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap'
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';


const Category = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const sliderRef = useRef(null);

    const handlePrevClick = () => {
        sliderRef.current.slickPrev();
    };

    const handleNextClick = () => {
        sliderRef.current.slickNext();
    };


    const shop = useSelector(state => state.shop);

    const selectCategory = (category) => {
        dispatch({ type: ActionTypes.SET_FILTER_CATEGORY, payload: category.id })
        navigate('/products')
    }
    const settings = {
        infinite: false,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        direction: 'rtl',
        pauseOnDotsHover: false,
        pauseOnFocus: true,
        slidesToShow: 5,
        slidesPerRow: 1,
        initialSlide: 0,

        // Add custom navigation buttons using Font Awesome icons
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 4
                }
            },
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
                    slidesToShow: 2,

                }
            }
        ]
    };

    return (
        <>
            {shop.shop === null
                ? (
                    <></>
                    // <Shimmer height={360} width={400}></Shimmer>
                )
                : (
                    <>
                        {/* <div whileTap={{ scale: 0.9 }} type='button' className='expand-category'
                            data-bs-toggle="" data-bs-target="#expandCategory" aria-expanded="false" aria-controls="collapseExample"
                        >
                            <div>
                                <BsGrid3X3GapFill fill='white' fontSize={"3rem"} />
                            </div>
                            <span>browse all categories</span>
                        </div> */}
                        <div className="row category_section_header">
                            <div className="col-md-12 col-12 d-flex justify-content-between align-items-center p-0">
                                <div className="title d-md-flex align-items-center ">
                                    <p>Shop by Category</p>
                                    <Link className='d-none d-md-block' to='/categories'>See all categoriess<AiOutlineArrowRight size={15} /> </Link>
                                </div>
                                <div className=' d-md-none'>
                                    <Link className='category_button' to='/categories'>see all</Link>
                                </div>
                                <div className=" justify-content-end align-items-ceneter d-md-flex d-none">
                                    <button className='prev-arrow-category' onClick={handlePrevClick}><FaChevronLeft size={20} /></button>
                                    <button className='next-arrow-category' onClick={handleNextClick}><FaChevronRight size={20} /></button>
                                </div>
                            </div>
                        </div>
                        <div className="caegory_section_content">

                            <div className='row ' id="expandCategory">
                                {/* <div className="col-md-12"> */}
                                <Slider {...settings} ref={sliderRef}>

                                    {
                                        shop.shop.category.map((ctg, index) => (
                                            <div className="col-md-12" key={index}>

                                                <div className='category-container '>

                                                    {ctg.has_child
                                                        ? (
                                                            <Card onClick={() => selectCategory(ctg)}>
                                                                <Card.Img variant='top' src={ctg.image_url} alt={ctg.subtitle} className='card-img-top category_image' />
                                                                <Card.Body className='card-body'>
                                                                    <Card.Title className="card-title">{ctg.name}</Card.Title>
                                                                </Card.Body>
                                                            </Card>

                                                        )
                                                        : (
                                                           

                                                            <Card onClick={() => selectCategory(ctg)}>
                                                                <Card.Img variant='top' src={ctg.image_url} alt={ctg.subtitle} className='card-img-top category_image' />
                                                                <Card.Body className='card-body'>
                                                                    <Card.Title className="card-title">{ctg.name}</Card.Title>
                                                                </Card.Body>
                                                            </Card>

                                                        )}

                                                </div>

                                            </div>

                                        ))
                                    }

                                    {/* </div> */}

                                </Slider>
                            </div>
                        </div>


                    </>
                )}
        </>
    )
}

export default Category
