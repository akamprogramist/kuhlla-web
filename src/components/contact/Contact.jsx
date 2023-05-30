import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import coverImg from '../../utils/cover-img.jpg'
import './contact.css'
import { AiOutlineMail } from 'react-icons/ai'
import { BiPhoneCall, BiTimeFive } from 'react-icons/bi'
import { GoLocation } from 'react-icons/go'
import Loader from '../loader/Loader'

const Contact = () => {

    const setting = useSelector(state => (state.setting))
    


    

    return (
        <section id='contact-us' className='contact-us'>
            {setting.setting === null ? <Loader screen='full' />
                : (
                    <>
                        <div className='cover'>
                            <img src={coverImg} className='img-fluid' alt="cover"></img>
                            <div className='title'>
                                <h3>Contact</h3>
                                <span>home / </span><span className='active'>contact</span>
                            </div>
                        </div>
                        <div className='container'>
                            <div className='contact-wrapper'  dangerouslySetInnerHTML={{ __html: setting.setting.contact_us }}>

                                

                            </div>
                        </div>
                    </>
                )}


        </section>
    )
}

export default Contact
