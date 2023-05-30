import React, { useEffect, useState } from 'react'
import './transaction.css'
import api from '../../api/api'
import Cookies from 'universal-cookie';
import { FaRupeeSign } from "react-icons/fa";
import Loader from '../loader/Loader';
import Pagination from 'react-js-pagination';
import No_Transactions from '../../utils/zero-state-screens/No_Transaction.svg'


const Transaction = () => {

    //initialize cookies
    const cookies = new Cookies();

    const total_transactions_per_page = 10;


    const [transactions, settransactions] = useState(null)
    const [totalTransactions, settotalTransactions] = useState(null)
    const [offset, setoffset] = useState(0)
    const [currPage, setcurrPage] = useState(1)
    const [isLoader, setisLoader] = useState(false)


    const fetchTransactions = () => {
        api.getTransactions(cookies.get('jwt_token'), total_transactions_per_page, offset)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setisLoader(false)
                    settransactions(result.data)
                    settotalTransactions(result.total)
                }
            })
    }

    useEffect(() => {
        setisLoader(true)
        fetchTransactions()
        // eslint-disable-next-line
    }, [offset])

    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_transactions_per_page - total_transactions_per_page)
    }

    return (
        <div className='transaction-list'>
            <div className='heading'>
                transaction
            </div>
            {transactions === null
                ? (
                    <div className='my-5'><Loader width='100%' height='350px' /></div>
                )
                : (
                    <>
                        {isLoader ? <div className='my-5'><Loader width='100%' height='350px' /></div>
                            : (
                                <table className='transaction-list-table'>
                                    <thead>
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>Payment method</th>
                                            <th>Transaction Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {transactions.length === 0
                                            ? <><tr><td><div className='d-flex align-items-center p-4 no-transaction'>
                                                <img src={No_Transactions} alt='no-orders'></img>
                                                <p>No Transactions Found!!</p>
                                            </div></td></tr></>
                                            : <>
                                                {transactions.map((transaction, index) => (
                                                    <tr key={index} className={index === transactions.length - 1 ? 'last-column' : ''}>
                                                        <th>{transaction.id}</th>
                                                        <th>{transaction.type}</th>
                                                        <th>{`${new Date(transaction.created_at).getDate()}-${new Date(transaction.created_at).getMonth() + 1}-${new Date(transaction.created_at).getFullYear()}`}</th>
                                                        <th className='amount'><FaRupeeSign fill='var(--secondary-color)' />{transaction.amount}</th>
                                                        <th className={transaction.status === 'failed' ? 'failed' : 'success'}><p>{transaction.status}</p></th>
                                                    </tr>
                                                ))}
                                            </>
                                        }
                                    </tbody>
                                </table>
                            )}

                        {transactions.length !== 0 ?
                            <Pagination
                                activePage={currPage}
                                itemsCountPerPage={total_transactions_per_page}
                                totalItemsCount={totalTransactions}
                                pageRangeDisplayed={5}
                                onChange={handlePageChange.bind(this)}
                            />
                            : null}

                    </>

                )}
        </div>
    )
}

export default Transaction