import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import Header from '../components/Header'
import { header, orderUrl, partyUrl } from '../components/Request'

const ReportScreen = (props) => {
    const today = new Date()
    let sumOrder=0
    let sumTotal=0
    let sum25=0
    let sum5=0
    let sumAdjusted=0
    let sumWeight=0
    const [loading, setLoading] = useState(false)
    const [month, setMonth] = useState(today.getFullYear()+"-"+((today.getMonth()+1)<10 ? "0"+(today.getMonth()+1) : (today.getMonth()+1)))
    const [orderType, setOrderType] = useState()
    const [origOrderList, setOrigOrderList] = useState([])
    const [orderList, setOrderList] = useState([])
    const [editFlag, setEditFlag] = useState(false)
    
    const fetchOrders = () => {
        if(orderType){
            setLoading(true) 
            axios.get(orderUrl+`/all/${month}/${orderType}`, header).then(resp => {
                setOrigOrderList(resp.data.data)
                setOrderList(resp.data.data.map(order => ({...order, edited: false})))
                setLoading(false)
            }).catch(err => {
                toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
                setLoading(false)
            })
        }
    }

    useEffect(()=>{
        fetchOrders()
    }, [orderType, month])

    const onSave = (order) => {
        
        if(typeof order.party.price === "string" ){
            setLoading(true)
            axios.put(partyUrl+"/edit", {...order.party, price: order.party.price}, header).then(resp => {
              toast.success("Rate of Party " + resp.data.data.name + " edited successfully!", {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
              fetchOrders()
            })
            .catch(err => {
              toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
              setLoading(false)
            })
          }

        setLoading(true)
        axios.put(orderUrl+"/edit", order, header).then(resp => {
          toast.success("Order edited successfully!", {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
          fetchOrders()
        })
        .catch(err => {
          toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
          setLoading(false)
        })
        
      }
    
      const onCancel = (order) => {
        let idx = orderList.findIndex(cOrder => cOrder.id === order.id)
        let prevOrderData = origOrderList.find(oOrder => oOrder.id === order.id)
        orderList[idx] = {...prevOrderData, edited: false}
        setOrderList([...orderList])
      }

      const generateReport = () => {
        setLoading(true)
        axios.post(orderUrl+`/report/${month}/${orderType}`, {}, header)
            .then(resp => {
                toast.success(resp.data.data, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
                setLoading(false)
            })
            .catch(err => {
                toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
                setLoading(false)
            })
      }

  return (
    <div className='Screen' style={{padding: "2rem"}}>
        <Header loading={loading} title={`Generate Monthly ${orderType ? orderType.toLocaleLowerCase()==="sell"? "Sales" : "Purchase" : ""} Report`}/>
        <div className='row'>
            <div className='col-lg-6 col-md-6 col-12  mb-4'>
                <h6> Select Month :</h6>
                <input className='form-control' type="month" value={month} onChange={e => {setMonth(e.target.value)}} />
            </div>

            <div className='col-lg-6 col-md-6 col-12 mb-4'>
                <h6> Select Order Type : </h6>
                <select className='form-control' onChange={e => {setOrderType(e.target.value)}}>
                    <option disabled selected>SELECT ORDER TYPE</option>
                    <option>SELL</option>
                    <option>PURCHASE</option>
                </select>
            </div>
            {
                orderType &&
                <div className='col-lg-6 col-md-6 col-12 mb-4'>
                    <button className='btn btn-success' onClick={()=>{generateReport()}}>Generate Monthly Report</button>
                </div>
            }
        </div>
        {
            orderType && orderList.length>0 &&
            <div className='table-responsive table-body'>
                <h5 className='text-center'>Orders</h5>
                <hr/>
                <table className='table table-lg table-borderless table-hover text-center mb-4'>
                    <thead style={{fontWeight: "bolder", fontSize: "1.2rem"}}>
                        <tr key="head">
                            <td>Date</td>
                            <td>Bill No</td>
                            <td>Party Name</td>
                            <td>Weight</td>
                            <td>Rate</td>
                            <td>Amount</td>
                            <td>CGST</td>
                            <td>SGST</td>
                            <td>IGST</td>
                            <td>Total</td>
                            <td>Final Value</td>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {
                            orderList.map(order => {
                                //order.adjustedAmount = (order.quantity * order.party.price * 0.5) + (order.quantity * order.party.price)
                                sumWeight += order.quantity
                                sumOrder += order.quantity * order.party.price
                                sumTotal += (order.quantity * order.party.price * 0.05) + (order.quantity * order.party.price)
                                sum25 += order.party.stateCode==="27" ? order.quantity * order.party.price * 0.025 : 0
                                sum5 += order.party.stateCode!=="27" ? order.quantity * order.party.price * 0.05 : 0
                                sumAdjusted += (order.quantity * order.party.price * 0.05) + (order.quantity * order.party.price)

                            return (<tr key={order.id} onChange={() => {order.edited=true; setEditFlag(!editFlag)}}>
                                    <td>{order.date}</td>
                                    <td>{order.billNumber}</td>
                                    <td>{order.party.name}</td>
                                    <td style={{width: "4rem"}}><input type="text" value={order.quantity} onChange={e => {order.quantity = e.target.value}} className="form-control text-center"/></td>
                                    <td style={{width: "7rem"}}><input type="text" value={order.party.price} onChange={e => {order.party.price = e.target.value}} className="form-control text-center"/></td>
                                    <td>{order.quantity * order.party.price}</td>
                                    <td>{order.party.stateCode==="27" ? (order.quantity * order.party.price * 0.025).toLocaleString() : ""}</td>
                                    <td>{order.party.stateCode==="27" ? (order.quantity * order.party.price * 0.025).toLocaleString() : ""}</td>
                                    <td>{order.party.stateCode!=="27" ? (order.quantity * order.party.price * 0.05).toLocaleString() : ""}</td>
                                    <td>{Math.round((order.quantity * order.party.price * 0.05) + (order.quantity * order.party.price)).toLocaleString()}</td>
                                    <td style={{width: "10rem"}}> <input type="text" value={Math.round(order.adjustedAmount ? order.adjustedAmount : (order.quantity * order.party.price * 0.5) + (order.quantity * order.party.price))} onChange={e => {order.adjustedAmount=Math.round(e.target.value)}} className="form-control text-center"/></td>
                                    {
                                        order.edited===true &&
                                        <td>
                                            <p style={{width: "9rem"}}>
                                                <button className='btn btn-outline-success float-start' onClick={ () => {onSave(order)}} > Save </button><span> </span> 
                                                <button className='btn btn-outline-warning float-end' onClick={ () => {onCancel(order)}} > Cancel </button>
                                            </p>
                                        </td>
                                        
                                    }
                                    
                                </tr>)
                        })}
                        <tr key="sums" className='table-success'>
                            <td></td>
                            <td></td>
                            <td><span style={{fontWeight: "bold"}}>Total :</span>  </td>
                            <td>{sumWeight.toLocaleString()}</td>
                            <td></td>
                            <td>{sumOrder.toLocaleString()}</td>
                            <td>{sum25.toLocaleString()}</td>
                            <td>{sum25.toLocaleString()}</td>
                            <td>{sum5.toLocaleString()}</td>
                            <td>{Math.round(sumTotal).toLocaleString()}</td>
                            <td style={{width: "10rem"}}>{Math.round(sumAdjusted).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        }
        {
            orderType && orderList.length===0 &&
            <h5 className='text-center'> -- No Data --</h5>
        }
        {
            !orderType &&
            <h5 className='text-center'>Select Order Type to view data</h5>
        }
            
    </div>
  )
}

export default ReportScreen