import React from 'react'
import { useSelector } from 'react-redux'
import coverImg from '../../utils/cover-img.jpg'
import './about.css'
import Loader from '../loader/Loader';

const About = () => {

    const setting = useSelector(state => state.setting);

    return (
        <section id='about-us' className='about-us'>
            {setting.status === 'loading' || setting.setting === null
                ? (
                    <Loader screen='full' />
                )
                : (
                    <>
                        <div className='cover'>
                            <img src={coverImg} className='img-fluid' alt="cover"></img>
                            <div className='title'>
                                <h3>Checkout</h3>
                                <span>home / </span><span className='active'>checkout</span>
                            </div>
                        </div >
                        <div className='container'>
                            <div className='about-container' dangerouslySetInnerHTML={{ __html: setting.setting.about_us }}></div>
                        </div>
                    </>

                )}
        </section >
    )
}

export default About
