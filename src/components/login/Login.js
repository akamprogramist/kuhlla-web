import React, { useState, useRef, useEffect } from 'react'
import './login.css'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import api from '../../api/api'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ActionTypes } from '../../model/action-type'
import { toast } from 'react-toastify'
import Loader from '../loader/Loader';


//phone number input
import PhoneInput from 'react-phone-number-input'
import { parsePhoneNumber } from 'react-phone-number-input';
import validator from 'validator'

//otp
import OTPInput from 'otp-input-react';

//firebase
import FirebaseData from '../../utils/firebase/FirebaseData'
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";


import Cookies from 'universal-cookie'
import jwt from 'jwt-decode'
import { setlocalstorageOTP } from '../../utils/manageLocalStorage'
import { useNavigate } from 'react-router-dom'


const Login = (props) => {
    const { auth, firebase } = FirebaseData();
    //initialize Cookies
    const cookies = new Cookies();
    const Navigate = useNavigate();
    const closeModalRef = useRef();

    const dispatch = useDispatch();


    const setting = useSelector(state => (state.setting))

    const [phonenum, setPhonenum] = useState()
    const [checkboxSelected, setcheckboxSelected] = useState(false)
    const [error, setError] = useState("", setTimeout(() => {
        if (error !== "")
            setError("")
    }, 5000))
    const [isOTP, setIsOTP] = useState(false);
    const [Uid, setUid] = useState("");
    const [OTP, setOTP] = useState("");
    const [isLoading, setisLoading] = useState(false)

    // const generateRecaptcha = () => {
    //     if (!window.recaptchaVerifier) {
    //         window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    //             'size': 'invisible',
    //             'callback': (response) => {
    //                 // reCAPTCHA solved, allow signInWithPhoneNumber.
    //             },
    //         }, auth);
    //     }
    // }
    useEffect(() => {
        if (firebase && auth && window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
        firebase && auth && (window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
            size: "invisible",
            // other options
        }))
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
        };
    }, [firebase, auth]);


    const handleLogin = (e) => {
        e.preventDefault();
        if (!checkboxSelected) {
            setError("Accept Terms and Policies!");
        }
        else {
            if (phonenum === undefined) {
                setError("Please enter phone number!")
            }
            else if (validator.isMobilePhone(phonenum)) {
                setIsOTP(true);
                // setOTP("");

                //OTP Generation
                // generateRecaptcha();
                let appVerifier = window.recaptchaVerifier;
                signInWithPhoneNumber(auth, phonenum, appVerifier)
                    .then(confirmationResult => {
                        window.confirmationResult = confirmationResult;
                    }).catch((error) => {
                        setisLoading(false)
                        console.log(error)
                    })
            }
            else {
                setPhonenum()
                setError("Enter a valid phone number")
            }
        }
    }


    const getCurrentUser = (token) => {
        api.getUser(token)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
                    toast.success("You're successfully Logged In")
                }
            })
    }
    //otp verification
    const verifyOTP = async (e) => {
        e.preventDefault();
        setisLoading(true);

        let confirmationResult = window.confirmationResult;


        await confirmationResult.confirm(OTP).then((result) => {
            // User verified successfully.
            setUid(result.user.uid)
            const countrycode = parsePhoneNumber(phonenum).countryCallingCode;
            const num = parsePhoneNumber(phonenum).nationalNumber;


            //login call
            loginApiCall(num, result.user.uid, countrycode)

        }).catch(() => {
            setisLoading(false)
            // User couldn't sign in (bad verification code?)
            setOTP("")
            setError("Invalid Code")

        });


        // const countrycode = parsePhoneNumber(phonenum).countryCallingCode;
        // const num = parsePhoneNumber(phonenum).nationalNumber;


        // //login call
        // loginApiCall(num, OTP, countrycode)
    }
    const loginApiCall = async (num, Uid, countrycode) => {
        await api.login(num, Uid, countrycode)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    const decoded = jwt(result.data.access_token)

                    const tomorrow = new Date()
                    tomorrow.setDate(new Date().getDate() + 1)
                    cookies.set("jwt_token", result.data.access_token, {
                        expire: new Date(tomorrow)
                    })

                    getCurrentUser(result.data.access_token);
                    setlocalstorageOTP(Uid)
                    closeModalRef.current.click()
                }
                else {
                    setError(result.message);
                    setOTP("")

                }

                setisLoading(false);
            })
            .catch(error => console.log("error ", error))

    }

    const handleTerms = () => {
        if (closeModalRef.current) {
            Navigate('/terms')
            closeModalRef.current.click()
        }
    }
    const handlePolicy = () => {
        if (closeModalRef.current) {
            Navigate('/policy/Privacy_Policy')
            closeModalRef.current.click()
        }
    }


    return (
        <>
            <div className="modal fade login" id={props.modal_id} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="loginLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{ borderRadius: "10px" }}>
                        <div className="d-flex flex-row justify-content-between align-items-center header">
                            <h5>Login</h5>
                            <button type="button" className="" data-bs-dismiss="modal" aria-label="Close" ref={closeModalRef} onClick={() => {
                                setError("")
                                setOTP("")
                                setPhonenum("")
                                setcheckboxSelected(false)
                                setisLoading(false);
                                setIsOTP(false)

                            }}><AiOutlineCloseCircle /></button>
                        </div>
                        <div className="modal-body d-flex flex-column gap-3 align-items-center body">
                            <img src={setting.setting && setting.setting.web_settings.web_logo} alt='logo'></img>

                            {isOTP
                                ? (
                                    <>
                                        <h5>enter verification code</h5>
                                        <span>we have sent verification code to <p>{phonenum}</p></span>
                                    </>
                                )
                                : (
                                    <>
                                        <h5>Welcome!</h5>
                                        <span>Enter phone number to continue and we will send a verification code to this number.</span>
                                    </>
                                )}

                            {error === ''
                                ? ""
                                : <span className='error-msg'>{error}</span>}

                            {isOTP
                                ? (
                                    <form className='d-flex flex-column gap-3 form w-100' onSubmit={verifyOTP}>
                                        {isLoading
                                            ? (
                                                <Loader width='100%' height='auto' />
                                            )
                                            : null}
                                        <OTPInput className='otp-container' value={OTP} onChange={setOTP} autoFocus OTPLength={6} otpType="number" disabled={false} secure />
                                        
                                        <button whileTap={{ scale: 0.6 }} type="submit" className='login-btn' >Verify</button>
                                    </form>
                                )
                                : (
                                    <form className='d-flex flex-column gap-3 form' onSubmit={handleLogin}>


                                        <div>
                                            <PhoneInput value={phonenum} defaultCountry='IN' onChange={setPhonenum} />
                                        </div>


                                        <span style={{ alignSelf: "baseline" }}>
                                            <input type="checkbox" className='mx-2' required checked={checkboxSelected} onChange={() => {
                                                setcheckboxSelected(!checkboxSelected)
                                            }} />
                                            I Agree to the <a onClick={handleTerms}>terms & condition</a> and <a onClick={handlePolicy}>Privacy & policy</a>
                                        </span>
                                        <button whileTap={{ scale: 0.6 }} type='submit'> Login to Continue</button>
                                    </form>
                                )}


                        </div>
                    </div>
                    <div id="recaptcha-container" style={{ display: "none" }}></div>
                </div>
            </div >

        </>
    )
}

export default Login