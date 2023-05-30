import React, { useEffect, useRef, useState } from 'react'
import './order.css'
import api from '../../api/api'
import Cookies from 'universal-cookie';
import { FaRupeeSign } from "react-icons/fa";
import { AiOutlineCloseCircle } from 'react-icons/ai';
import Loader from '../loader/Loader';
import Pagination from 'react-js-pagination';
import No_Orders from '../../utils/zero-state-screens/No_Orders.svg'
import ReactToPrint from 'react-to-print';
import { toast } from 'react-toastify';


const Order = () => {


    const [orderId, setOrderId] = useState();
    const [totalOrders, settotalOrders] = useState(null)
    const [offset, setoffset] = useState(0)
    const [currPage, setcurrPage] = useState(1)
    const [isLoader, setisLoader] = useState(false)
    //initialize Cookies
    const cookies = new Cookies();
    const componentRef = useRef();
    const total_orders_per_page = 10;
    const [orderInvoiceId, setOrderinvoiceId] = useState(null)

    const fetchOrders = () => {
        api.getOrders(cookies.get('jwt_token'), total_orders_per_page, offset)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setisLoader(false)
                    setorders(result.data);
                    settotalOrders(result.total)
                }
            })
    }

    useEffect(() => {
        setisLoader(true)
        fetchOrders()
    }, [offset])

    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_orders_per_page - total_orders_per_page)
    }


    const getInvoice = async (Oid) => {

        // var order_id = document.getElementById('invoice').value;
        api.getInvoices(cookies.get('jwt_token'), Oid).then(response => response.json()).then(result => {

            let invoicePage = result.data;
            document.getElementById('mainContent').innerHTML = invoicePage;


        })
    }

    const closeModalRef = useRef();
    const getOrderStatus = (pid) => {
        for (let i = 0; i < orders.length; i++) {
            const element = orders[i];
            // if (element.id == pid) {
            //     let html = `

            //                         `;
            //     document.getElementById('mainContentTrack').innerHTML = html;

            // }
            closeModalRef.current.click()
        }
    }
    const [orders, setorders] = useState([])
    const [element, setElement] = useState({});
    const setHtml = (ID) => {

        orders.map((obj, index) => {
            if (obj.id == ID) {
                setElement(obj)

            }
        })
    }
    const handlePrint = () => {
        if (closeModalRef.current) {
            closeModalRef.current.click();
            toast.success('Invoice Downloaded Successfully')
        }
    };
    return (
        <div className='order-list'>
            <div className='heading'>
                All Orders
            </div>

            {orders === null
                ? <div className='my-5'><Loader width='100%' height='350px' /></div>
                : (<>
                    {isLoader ? <div className='my-5'><Loader width='100%' height='350px' /></div>
                        : (<table className='order-list-table'>
                            <thead>
                                <tr>
                                    <th>order</th>
                                    <th>product name</th>
                                    <th>date</th>
                                    <th>total</th>
                                    <th>action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders && orders.length === 0
                                    ? <div className='d-flex align-items-center p-4 no-orders'>
                                        <img src={No_Orders} alt='no-orders'></img>
                                        <p>No Orders Found!!</p>
                                    </div>
                                    : <>
                                        {orders && orders.map((order, index) => (
                                            <tr key={index} className={index === orders.length - 1 ? 'last-column' : ''}>
                                                <th>{`#${order.order_id} `}</th>
                                                <th className='product-name d-table-cell verticall-center flex-column justify-content-center'>{order.items.map((item, ind) => (
                                                    <div className="column-container">
                                                        <span key={ind}>{item.product_name},</span>
                                                    </div>
                                                ))}
                                                </th>
                                                <th>
                                                    {order.created_at.substring(0, 10)}
                                                </th>
                                                <th className='total'>
                                                    <FaRupeeSign fontSize={'1.7rem'} /> {order.total}
                                                </th>
                                                <th className='button-container'>
                                                    <button type='button' id={`track - ${order.order_id} `} data-bs-toggle="modal" data-bs-target="#trackModal" className='track' value={order.order_id} onClick={(e) => { setHtml(e.target.value); getOrderStatus(e.target.value) }}>track order</button>
                                                    <button type='button' id={`invoice - ${order.order_id} `} data-bs-toggle="modal" data-bs-target="#invoiceModal" className='Invoice' value={order.order_id} onClick={(e) => { setHtml(e.target.value); getInvoice(e.target.value) }}>Get Invoice</button>
                                                </th>
                                            </tr>
                                        ))}
                                    </>}


                            </tbody>
                        </table>)}

                    {orders && orders.length !== 0 ?
                        <Pagination
                            activePage={currPage}
                            itemsCountPerPage={total_orders_per_page}
                            totalItemsCount={totalOrders}
                            pageRangeDisplayed={5}
                            onChange={handlePageChange.bind(this)}
                        />
                        : null}
                </>)


            }
            <div id="invoice">
                <div className="modal fade new-invoice" id="invoiceModal" aria-labelledby="InvoiceModalLabel" aria-hidden="true">
                    <button type="button" className="d-none" ref={closeModalRef} data-bs-dismiss="modal" aria-label="Close">
                    </button>
                    <div className='modal-dialog'>
                        <div className="modal-content" style={{ borderRadius: "10px", maxWidth: "100%", padding: "30px 15px", zIndex: -2 }}>
                            {/* <button type="button" class="bg-white" data-bs-dismiss="modal" aria-label="Close" ref={closeModalRef} style={{ width: '30px' }}><i class="bi bi-x-octagon"></i></button> */}
                            <div id="mainContent" ref={componentRef}>

                            </div>
                            <ReactToPrint
                                trigger={() => <button style={{ alignSelf: 'center', fontSize: '14px' }} className='btn btn-primary w-50'> Print this out!</button>}
                                content={() => componentRef.current}
                                onAfterPrint={handlePrint}

                            />
                        </div>
                    </div>
                </div>
            </div>
            <div id="track">
                <div className="modal fade new-track" id="trackModal" aria-labelledby="TrackModalLabel" aria-hidden="true">
                    <div className='modal-dialog'>
                        <div className="modal-content" style={{ borderRadius: "10px", maxWidth: "100%", padding: "30px 15px", zIndex: -2 }}>
                            <div id="mainContentTrack">

                                <section class="track" id="printMe">
                                    <div class="d-flex justify-content-between align-items-center mx-5">
                                        <h5 class="page-header">eGrocer</h5>
                                        <h5 class="page-header">Mo. +${element && element.mobile}</h5>
                                        <button type="button" class="bg-white" data-bs-dismiss="modal" aria-label="Close" ref={closeModalRef} style={{ width: '30px' }}><i class="bi bi-x-octagon"></i></button>
                                    </div>
                                    <div class="d-flex flex-column">
                                        <div class="d-flex flex-column mx-5 justify-content-around">
                                            <div class="d-flex my-4 align-items-center">
                                                <div class="col-sm-4 bg-white track-col"> <span class="rounded-circle px-3 pt-2 fs-2 border-outline-success bg-subtle btn btn-outline-success"><i class="bi bi-cart "></i></span></div>
                                                <span class=""> Accepted</span>
                                            </div>
                                            <div class="progress flex-column col-sm-3" role="progressbar" aria-label="Basic example" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">

                                                <div
                                                    className="progress-bar bg-success"
                                                    style={{
                                                        height: element && element.active_status === 2 ? "23%" : element.active_status === 5 ? "77%" : element.active_status === 4 ? "57%" : element.active_status === "6" ? "100%" : "0%"
                                                    }}></div>
                                            </div>
                                            <div class="d-flex my-4 align-items-center">
                                                <div class="col-sm-4 bg-white track-col"> <span class="rounded-circle px-3 pt-2 fs-2 btn btn-outline-success"><i class="bi bi-truck "></i></span></div>
                                                <span> shipped</span>
                                            </div>
                                            <div class="d-flex my-4 align-items-center">
                                                <div class="col-sm-4 bg-white track-col"> <span class="rounded-circle px-3 pt-2 fs-2 btn btn-outline-success"><i class="bi bi-bus-front "></i></span></div>
                                                <span> Out For Delivery</span>
                                            </div>
                                            <div class="d-flex my-4 align-items-center">
                                                <div class="col-sm-4 bg-white track-col"> <span class="rounded-circle px-3 pt-2 fs-2 btn btn-outline-success"><i class="bi bi-check "></i></span></div>
                                                <span> Delivered</span>
                                            </div>
                                        </div>
                                    </div>



                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Order
