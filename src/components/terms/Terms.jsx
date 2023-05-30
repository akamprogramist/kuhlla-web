import React from 'react'
import { useSelector } from 'react-redux'
import coverImg from '../../utils/cover-img.jpg'
import './terms.css'
import Loader from '../loader/Loader';

const Terms = () => {
    const setting = useSelector(state => (state.setting))

    return (
        <section id='terms' className='terms'>
            {setting.setting === null ? <Loader screen='full' />
                : (
                    <>
                        <div className='cover'>
                            <img src={coverImg} className='img-fluid' alt="cover"></img>
                            <div className='title'>
                                <h3>Terms & Condition</h3>
                                <span>home / </span><span className='active'>terms & condition</span>
                            </div>
                        </div >
                        <div className='container'>
                            <div className='terms-container' dangerouslySetInnerHTML={{ __html: setting.setting.terms_conditions }}></div>
                        </div>
                    </>
                )}
        </section>
    )
}

export default Terms
