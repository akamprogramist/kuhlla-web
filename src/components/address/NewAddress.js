import React, { useEffect, useState, useRef, useMemo } from 'react'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import api from '../../api/api';
import './address.css'
import { GoogleMap, MarkerF } from '@react-google-maps/api';

const NewAddress = (props) => {
    const closeModalRef = useRef();

    //initialize cookies
    const cookies = new Cookies();

    const handleAddnewAddress = (e) => {
        e.preventDefault()

        let address = `${addressDetails.address}, ${addressDetails.landmark}, ${addressDetails.city}, ${addressDetails.area}, ${addressDetails.state}, ${addressDetails.country} ,${addressDetails.pincode}`
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({
            'address': address
        })
            .then(result => {


                setlocalLocation({
                    lat: parseFloat(result.results[0].geometry.location.lat()),
                    lng: parseFloat(result.results[0].geometry.location.lng())
                })

                api.getCity(addressDetails.city, result.results[0].geometry.location.lat(), result.results[0].geometry.location.lng())
                    .then(resp => resp.json())
                    .then(res => {
                        if (res.status === 1) {
                            setisconfirmAddress(true)
                        }
                        else {
                            setisconfirmAddress(false)
                            toast.error(res.message)
                        }
                    })
            })
            .catch(error => {
                setisconfirmAddress(false)
                toast.error(`Cann't find address!! Please enter a valid address!`)
            })
    }


    const handleConfirmAddress = () => {
        let lat = center.lat;
        let lng = center.lng;
        if (!props.selectedAddress) {
            props.setisLoader(true)
            api.addAddress(cookies.get('jwt_token'), addressDetails.name, addressDetails.mobile_num, addressDetails.address_type, addressDetails.address, addressDetails.landmark, addressDetails.area, addressDetails.pincode, addressDetails.city, addressDetails.state, addressDetails.country, addressDetails.alternate_mobile_num, lat, lng, addressDetails.is_default)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        toast.success('Succesfully Added Address!')

                        api.getAddress(cookies.get('jwt_token'))
                            .then(resp => resp.json())
                            .then(res => {
                                props.setisLoader(false)
                                if (res.status === 1) {
                                    props.setaddresses(res.data)
                                    props.setselectedAddress(res.data[0])
                                }
                            })
                            .catch(error => console.log(error))

                    }
                })
                .catch(error => console.log(error))
        }
        else {
            props.setisLoader(true)
            api.updateAddress(cookies.get('jwt_token'), props.selectedAddress.id, addressDetails.name, addressDetails.mobile_num, addressDetails.address_type, addressDetails.address, addressDetails.landmark, addressDetails.area, addressDetails.pincode, addressDetails.city, addressDetails.state, addressDetails.country, addressDetails.alternate_mobile_num, lat, lng, addressDetails.is_default)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        toast.success('Succesfully Updated Address!')

                        api.getAddress(cookies.get('jwt_token'))
                            .then(resp => resp.json())
                            .then(res => {
                                props.setisLoader(false)
                                if (res.status === 1) {
                                    props.setaddresses(res.data)
                                }
                            })
                            .catch(error => console.log(error))

                    }
                })
                .catch(error => console.log(error))
        }

        closeModalRef.current.click()
    }

    useEffect(() => {
        if (props.selectedAddress) {
            setaddressDetails({
                name: props.selectedAddress.name,
                mobile_num: props.selectedAddress.mobile,
                alternate_mobile_num: props.selectedAddress.alternate_mobile,
                address: props.selectedAddress.address,
                landmark: props.selectedAddress.landmark,
                city: props.selectedAddress.city,
                area: props.selectedAddress.area,
                pincode: props.selectedAddress.pincode,
                state: props.selectedAddress.country,
                country: props.selectedAddress.country,
                address_type: props.selectedAddress.type,
                is_default: props.selectedAddress.is_default === 1 ? true : false,

            })
        }
    }, [props.selectedAddress])
    const [addressDetails, setaddressDetails] = useState({
        name: '',
        mobile_num: '',
        alternate_mobile_num: '',
        address: '',
        landmark: '',
        city: '',
        area: '',
        pincode: '',
        state: '',
        country: '',
        address_type: 'Home',
        is_default: false,
    })
    const [isconfirmAddress, setisconfirmAddress] = useState(false)
    const [localLocation, setlocalLocation] = useState({
        lat: parseFloat(0),
        lng: parseFloat(0),
    })
    const [addressLoading, setaddressLoading] = useState(false)
    const center = useMemo(() => ({
        lat: localLocation.lat,
        lng: localLocation.lng,
    }), [localLocation.lat, localLocation.lng])





    //get available delivery location city
    const getAvailableCity = async (response) => {
        var results = response.results;
        var c, lc, component;
        var found = false, message = "";
        for (var r = 0, rl = results.length; r < rl; r += 1) {
            var flag = false;
            var result = results[r];
            for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
                component = result.address_components[c];

                //confirm city from server
                const response = await api.getCity(component.long_name, result.geometry.location.lat(), result.geometry.location.lng()).catch(error => console.log("error: ", error));
                const res = await response.json();
                if (res.status === 1) {
                    flag = true;
                    found = true;
                    return res;
                }
                else {
                    found = false;
                    message = res.message
                }
                if (flag === true) {
                    break;
                }
            }
            if (flag === true) {
                break;
            }
        }
        if (found === false) {
            return {
                status: 0,
                message: message
            }
        }
    }

    const onMarkerDragStart = () => {
        setaddressLoading(true)
    }

    const onMarkerDragEnd = (e) => {

        const prev_latlng = {
            lat: localLocation.lat,
            lng: localLocation.lng,
        }
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({
            location: {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            }
        })
            .then(response => {
                if (response.results[0]) {
                    //get city
                    getAvailableCity(response)
                        .then(res => {
                            if (res.status === 1) {
                                setlocalLocation({
                                    lat: parseFloat(res.data.latitude),
                                    lng: parseFloat(res.data.longitude),
                                })

                                let address = '', country = '', pincode = '', landmark = '', area = '';

                                response.results[0].address_components.forEach((res_add) => {
                                    if (res_add.types.includes('premise') || res_add.types.includes('plus_code')) {
                                        address = res_add.long_name
                                    }
                                    if (res_add.types.includes('route') || res_add.types.includes('locality')) {
                                        landmark = res_add.long_name
                                    }
                                    if (res_add.types.includes('administrative_area_level_3')) {
                                        area = res_add.long_name
                                    }
                                    if (res_add.types.includes('country')) {
                                        country = res_add.long_name
                                    }
                                    if (res_add.types.includes('postal_code')) {
                                        pincode = res_add.long_name
                                    }
                                })

                                if (address === '' || country === '' || pincode === '' || landmark === '' || area === '') {
                                    setlocalLocation({
                                        lat: prev_latlng.lat,
                                        lng: prev_latlng.lng
                                    })

                                }
                                else {
                                    setaddressDetails(state => ({
                                        ...state,
                                        address: address,
                                        landmark: landmark,
                                        city: res.data.name,
                                        area: area,
                                        pincode: pincode,
                                        state: res.data.state,
                                    }))
                                }

                                setaddressLoading(false)
                            }
                            else {
                                toast.error(res.message)
                            }
                        })
                        .catch(error => console.log("error " + error))
                }
                else {
                }
            })
            .catch(error => {
                console.log(error)
            })
    }

    return (

        <div className="modal fade new-address" id="addressModal" data-bs-backdrop="static" aria-labelledby="addressModalLabel" aria-hidden="true">

            <div className='modal-dialog'>
                <div className="modal-content" style={{ borderRadius: "10px", maxWidth: "100%", padding: "30px 15px" }}>


                    <div className="d-flex flex-row justify-content-between header">
                        <h5>New Address</h5>
                        <button type="button" className="" data-bs-dismiss="modal" aria-label="Close" ref={closeModalRef} onClick={() => {
                            setaddressDetails({
                                name: '',
                                mobile_num: '',
                                alternate_mobile_num: '',
                                address: '',
                                landmark: '',
                                city: '',
                                area: '',
                                pincode: '',
                                state: '',
                                country: '',
                                address_type: 'Home',
                                is_default: false,
                            })
                            props.setselectedAddress(null)
                            setisconfirmAddress(false)
                        }} style={{ width: "30px" }}><AiOutlineCloseCircle /></button>
                    </div>

                    {isconfirmAddress
                        ? <>
                            <div className='w-100'>

                                <GoogleMap zoom={11} center={center} mapContainerStyle={{ height: "400px" }}>
                                    <MarkerF position={center} draggable={true} onDragStart={onMarkerDragStart} onDragEnd={onMarkerDragEnd}>
                                    </MarkerF>
                                </GoogleMap>
                            </div>

                            {/* {address !== '' ? <p style={{ fontWeight: 'bolder', fontSize: "1.755rem", marginTop: "10px" }}>Address : <span className='text-danger' style={{ fontWeight: "normal" }}>{address}</span></p> : null} */}

                        </>
                        : null}

                    {addressLoading
                        ? <div className="d-flex justify-content-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        : <form onSubmit={(e) => handleAddnewAddress(e)} className='address-details-wrapper'>

                            <div className='contact-detail-container'>
                                <h3>contact details</h3>
                                <div className='contact-details'>
                                    <input type='text' placeholder='Name' value={addressDetails.name} required onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, name: e.target.value }));
                                    }}></input>
                                    <input type='tel' placeholder='Mobile Number' value={addressDetails.mobile_num} required onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, mobile_num: e.target.value }));
                                    }} ></input>
                                    <input type='tel' placeholder='Alternate Mobile Number' value={addressDetails.alternate_mobile_num} onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, alternate_mobile_num: e.target.value }));
                                    }} ></input>
                                </div>
                            </div>

                            <div className='address-detail-container'>
                                <h3>address details</h3>
                                <div className='address-details'>
                                    <input type='text' placeholder='Addres' value={addressDetails.address} onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, address: e.target.value }));
                                    }} required></input>
                                    <input type='text' placeholder='Landmark' value={addressDetails.landmark} onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, landmark: e.target.value }));
                                    }} required></input>
                                    <input type='text' placeholder='City' value={addressDetails.city} onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, city: e.target.value }));
                                    }} required></input>
                                    <input type='text' placeholder='Area' value={addressDetails.area} onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, area: e.target.value }));
                                    }} required></input>
                                    <input type='text' placeholder='PinCode' value={addressDetails.pincode} onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, pincode: e.target.value }));
                                    }} required></input>
                                    <input type='text' placeholder='State' value={addressDetails.state} onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, state: e.target.value }));
                                    }} required></input>
                                    <input type='text' placeholder='Country' value={addressDetails.country} onChange={(e) => {
                                        if (isconfirmAddress) {
                                            setisconfirmAddress(false)
                                        }
                                        setaddressDetails(state => ({ ...state, country: e.target.value }));
                                    }} required></input>
                                </div>
                            </div>

                            <div className='address-type-container'>
                                <h3>address type</h3>
                                <div className='address-type'>
                                    <input type='radio' name='address-type' id='home-address' onChange={() => {
                                        setaddressDetails(state => ({ ...state, address_type: 'Home' }));
                                    }} autoComplete='off' defaultChecked={true} />
                                    <label htmlFor='home-address'>Home</label>


                                    <input type='radio' name='address-type' id='office-address' onChange={() => {
                                        setaddressDetails(state => ({ ...state, address_type: 'Office' }));
                                    }} autoComplete='off' />
                                    <label htmlFor='office-address'>Office</label>


                                    <input type='radio' name='address-type' id='other-address' onChange={() => {
                                        setaddressDetails(state => ({ ...state, address_type: 'Other' }));
                                    }} autoComplete='off' />
                                    <label htmlFor='other-address'>Other</label>
                                </div>
                                <div className='default-address'>
                                    <input type="checkbox" className='mx-2' onChange={() => {
                                        setaddressDetails(state => ({ ...state, is_default: !addressDetails.is_default }));

                                    }} />
                                    Set as a default address
                                </div>
                            </div>

                            {isconfirmAddress
                                ? <button type='button' className='confirm-address' onClick={() => handleConfirmAddress()}>Confirm Address</button>
                                : <button type='submit'>Add New Address</button>}

                        </form>}





                </div>
            </div>
        </div>
    )
}

export default NewAddress
