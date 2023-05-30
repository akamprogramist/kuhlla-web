import React, { useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import HomeContainer from './homecontainer/HomeContainer'
import Loader from './loader/Loader'
import ProductContainer from './product/ProductContainer'
import api from '../api/api'
import { ActionTypes } from '../model/action-type'
import { AiOutlineClose, AiOutlineCloseCircle } from 'react-icons/ai'

const MainContainer = () => {

    const dispatch = useDispatch()

    const modalRef = useRef()

    const city = useSelector(state => (state.city))
    const shop = useSelector(state => (state.shop))
    const setting = useSelector(state => state.setting)

    const fetchShop = (city_id, latitude, longitude) => {
        api.getShop(city_id, latitude, longitude)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch({ type: ActionTypes.SET_SHOP, payload: result.data })
                }
            })

    }
    useEffect(() => {
        if (city.city !== null && shop.shop === null) {
            fetchShop(city.city.id, city.city.latitude, city.city.longitude);
        }
    }, [city])

    useEffect(() => {

        if (modalRef.current&&setting.setting !== null) {
            modalRef.current.click()
        }
    }, [setting])

    // setTimeout(() => {
    //     modalRef.current.click()
    // }, 6000);
    return (
        <>

            {setting.setting === null 
                ? <Loader screen='full' />
                : (
                    <>
                        <div className='home-page content' style={{ paddingBottom: "5px", minHeight: "75vh" }}>
                            <HomeContainer />
                            <ProductContainer />
                        </div>

                        {parseInt(setting.setting.popup_enabled) === 1 ?
                            (
                                <>
                                    <button type="button" className="d-none" ref={modalRef} data-bs-toggle="modal" data-bs-target="#myModal">
                                    </button>
                                    <div id="myModal" className="modal fade" role="dialog">
                                        <div className="modal-dialog modal-dialog-centered">
                                            <div className="modal-content" style={{ padding: "0", minWidth: "30vw" }}>
                                                <button type='button' className='' data-bs-dismiss="modal" aria-label="Close" style={{position:"absolute",top:"-30px",right:"0",background:"none"}}><AiOutlineClose fill='white' fontSize={"3.5rem"}/></button>
                                                <img src={setting.setting.popup_image} alt='image' onClick={() => {
                                                    window.location = setting.setting.popup_url
                                                }} style={{ width: "100%", height: "100%" }}></img>
                                            </div>

                                        </div>
                                    </div>
                                </>
                            ) : null}
                    </>)}
        </>

    )
}

export default MainContainer
