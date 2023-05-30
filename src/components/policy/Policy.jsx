import React from 'react'
import { useSelector } from 'react-redux'
import coverImg from '../../utils/cover-img.jpg'
import './policy.css'
import Loader from '../loader/Loader';
import { useParams } from 'react-router-dom';

const Policy = () => {

    const setting = useSelector(state => (state.setting))
    const { policy_type } = useParams()
    return (
        <section id='policy' className='policy'>
            {setting.setting === null ? <Loader screen='full' />
                : (
                    <>
                        <div className='cover'>
                            <img src={coverImg} className='img-fluid' alt="cover"></img>
                            <div className='title'>
                                <h3>{policy_type}</h3>
                                <span>home / </span>{policy_type === 'Privacy_Policy'
                                    ? <span className='active'>Privacy Policy</span>
                                    : policy_type === 'Returns_&_Exchanges_Policy'
                                        ? <span className='active'>Returns & Exchanges Policy</span>
                                        : policy_type === 'Shipping_Policy'
                                            ? <span className='active'>Shipping Policy</span>
                                            : policy_type === 'Cancellation_Policy'
                                                ? <span className='active'>Cancellation Policy</span>
                                                : null}
                            </div>
                        </div >
                        <div className='container'>
                            {policy_type === 'Privacy_Policy'
                                ? <div className='policy-container' dangerouslySetInnerHTML={{ __html: setting.setting.privacy_policy }}></div>
                                : policy_type === 'Returns_&_Exchanges_Policy'
                                    ? <div className='policy-container' dangerouslySetInnerHTML={{ __html: setting.setting.returns_and_exchanges_policy }}></div>
                                    : policy_type === 'Shipping_Policy'
                                        ? <div className='policy-container' dangerouslySetInnerHTML={{ __html: setting.setting.shipping_policy }}></div>
                                        : policy_type === 'Cancellation_Policy'
                                            ? <div className='policy-container' dangerouslySetInnerHTML={{ __html: setting.setting.cancellation_policy }}></div>
                                            : null}

                        </div>
                    </>
                )}
        </section>
    )
}

export default Policy
