import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { header, orderUrl, partyUrl } from '../components/Request'

const SellingScreen = (props) => {
  const today =  new Date()
  console.log()
  const defaultOrder = { 
                          orderType: "SELL",
                          date: today.getFullYear()+"-"+((today.getMonth()+1)<10 ? "0"+(today.getMonth()+1) : (today.getMonth()+1))+"-"+ ((today.getDate())<10 ? "0"+(today.getDate()) : (today.getDate())),
                          productName: "Limestone Powder", hsnCode: "25219030",
                          quantity: 1
                        }
  const [parties, setParties] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [partyDropdownVisible, setVisibility] = useState(false)
  const [party, setParty] = useState()
  const [order, setOrder] = useState({...defaultOrder})
  const [price, setPrice] = useState(0)
  let [billNumber, setBillNumber] = useState("")
  let [loading, setLoading] = useState()
  let [modalDisplay, setModalDisplay] = useState(false)

  const fetchParties = () => {
    setLoading(true)
    axios.get(partyUrl+"/all").then(resp => { 
      setParties([])
      setParties(resp.data.data.filter(party => (party.isDeleted!==true || party.isDeleted===null) && party.type==="CUSTOMER"))  
      setFilteredData(resp.data.data.filter(party => (party.isDeleted!==true || party.isDeleted===null) && party.type==="CUSTOMER"))  
      setLoading(false)
    })
    .catch(err => {
      toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
      setLoading(false)
    })
  }

  const getBillNumber = () => {
    setLoading(true)
    axios.get(orderUrl+"/number").then(resp => { 
      setBillNumber(Number(resp.data.data)+1)
      setLoading(false)
    })
    .catch(err => {
      toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
      setLoading(false)
    })
  }

  const clearData = () => {
    setParty()
    setOrder({...defaultOrder})
    setPrice(0)
    document.getElementById("search-text").value=""
    document.getElementById("vehicle-input").value=""
    getBillNumber()
  }

  useEffect(() => {
    fetchParties()
    getBillNumber()
    document.getElementById('datePicker').valueAsDate = new Date();
    
  }, [])

  const editPartyPrice = (newPrice) => {
    setPrice(newPrice)
    setOrder({...order, party: {...party, price: newPrice}})
  }

  const onGenerateBill = () => {
    if(party && price>0){
      setModalDisplay(true)
    }
    else{
      toast.error("Please Select Party & Enter Rate.", {autoClose: 3500, position: toast.POSITION.TOP_RIGHT})
    }
  }

  const onConfirmOrder = () => {
    setModalDisplay(false)
    // check modified price
    if(party.price !== price){
      setParty({...party, price: price})
      setLoading(true)
      axios.put(partyUrl+"/edit", {...party, price: price}, header).then(resp => {
        toast.success("Rate of Party " + resp.data.data.name + " edited successfully!", {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
        fetchParties()
      })
      .catch(err => {
        toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
        setLoading(false)
      })
    }
    //save order
    setLoading(true)
    axios.post(orderUrl+"/new", { 
                                  ...order, 
                                  party: {...party, price: price}, 
                                  billNumber: billNumber
                                }, header).then(resp => {
      console.log(resp)
      toast.success(resp.data.data, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
      clearData()
      setLoading(false)
    }).catch(err => {
      toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
      setLoading(false)
    })
  }

  const onCancelOrder = () => {
    setModalDisplay(false)
  }

  const onSearch = (val) => {
    if(val){
      const reqData = parties.map((party, index) => {
        if( party.id.toString().indexOf(val) >= 0 || 
            party.name.indexOf(val) >= 0 ||
            party.name.toLowerCase().indexOf(val) >= 0 ||
            party.gstNumber.toLowerCase().indexOf(val) >= 0 
          )
          return parties[index];
        return null;
      })
      setFilteredData(reqData.filter((party) => party ? true : false))
    }else{
      setFilteredData(parties)
    }
  }

  return (
    <div className='Screen'>
        <Header loading={loading} title='Generate Tax Invoice'/>
        <Modal  displayed={modalDisplay} 
                onConfirm={onConfirmOrder}
                onCancel={onCancelOrder}
                title="Confirm Sell Order"
                message="Do you want to Save order & Generate bill ? "
                />
        <div className='billForm row'>
          <h5 className='form-label text-center'>Buyer Name </h5><hr/>
          <div className="col-lg-12 col-md-12 mb-4 table-responsive table-body ">
            <input id="search-text" type="text" onClick={e => {setVisibility(!partyDropdownVisible)}} onChange={e => {onSearch(e.target.value); setVisibility(true)}} className='form-control text-center compact-display mb-1' placeholder='Click / Type for Name | ID | GST' autoComplete='off' style={{fontWeight: "bold"}}/>
            
              <table style={{backgroundColor: "rgba(120,200,120,0.7)", cursor: "pointer"}} className={partyDropdownVisible ? 'table table-borderless compact-display' : 'd-none'} onClick={e=>{ setVisibility(false)}}>
                <thead className='text-center'>
                  <th>ID</th>
                  <th>Name</th>
                  <th>GST</th>
                </thead>
                <tbody className='text-center'>
                  {
                    filteredData.length>0 &&
                    filteredData.map( data => {
                      return (
                        <tr key={data.id} onClick={() => {setParty(data); document.getElementById('search-text').value=data.name; setOrder({...order, party: data}); editPartyPrice(data.price)}}>
                          <td>{data.id}</td>
                          <td>{data.name}</td>
                          <td>{data.gstNumber}</td> 
                        </tr>
                        )
                    })
                  }
                </tbody>
              </table>
            
          </div>
          <h5 className='text-center'>Product & Order Information </h5><hr/>
          <div className='order-area compact-display mb-4' >

            <div className='row receipt-row'>

              <div className='col-lg-4 col-md-4 col-12 mb-4'>
                <h6>Bill Number</h6>
                <input type="text" value={billNumber ? billNumber : ""} onChange={e=>{setOrder({...order, billNumber: e.target.value})}} className="form-control" placeholder='Enter Bill number' />
              </div>
              
              <div className='col-lg-4 col-md-4 col-12 mb-4'>
                <h6>Vehicle Number</h6>
                <input id="vehicle-input" type="text" value={order.vehicle ? order.vehicle: ""} onChange={e=>{setOrder({...order, vehicle: e.target.value})}} className="form-control" placeholder='Enter vehicle number' />
              </div>

              <div className='col-lg-4 col-md-4 col-12 mb-4'>
                <h6>Sell Date</h6>
                <input id='datePicker' type="date" value={order.date} onChange={e=>{setOrder({...order, date: e.target.value})}} className="form-control" />
              </div>

            </div>

            <div className='row receipt-row'>
              <div className='col-lg-6 col-md-6 col-6 mb-4'>
                <h6>Quantity</h6>
                <input id="quantity-input" type="text" value={order.quantity} onChange={e=>{setOrder({...order, quantity: e.target.value})}} className="form-control" placeholder='Enter quantity / weight' />
              </div>

              <div className='col-lg-6 col-md-6 col-6 mb-5'>
                <h6>Rate</h6>
                <input id="rate-input" type="text" value={price} onChange={e=>{ editPartyPrice(e.target.value)}} className="form-control" placeholder='Enter price' />
              </div>

              <div className='col-lg-12 col-md-12 col-12 mb-3'>
                {
                  party && party.stateCode==="27" &&
                  <table className='table table-borderless'>
                    <thead className='text-center'>
                    <td style={{fontWeight: "bold"}}>Amount &ensp;</td>
                      <td style={{fontWeight: "bold"}}>CGST (2.5%)</td> 
                      <td style={{fontWeight: "bold"}}>SGST (2.5%)</td> 
                      <td style={{fontWeight: "bold"}}>Grand Total</td> 
                    </thead>
                    <tbody className='text-center'>
                      <tr key="c">
                        <td>{Math.round(order.quantity * price).toLocaleString() }/- </td>
                        <td>{Math.round(order.quantity*price*0.025).toLocaleString() }/- </td>
                        <td>{Math.round(order.quantity*price*0.025).toLocaleString() }/- </td>
                        <td>{Math.round((order.quantity*price)+(order.quantity*price*0.05)).toLocaleString() }/- </td>
                      </tr>
                    </tbody>
                  </table>
                }

                {
                  party && party.stateCode!=="27" &&
                  <table className='table table-borderless'>
                    <thead className='text-center'>
                    <td style={{fontWeight: "bold"}}>Amount &ensp;</td>
                      <td style={{fontWeight: "bold"}}>IGST (5.0%)</td> 
                      <td style={{fontWeight: "bold"}}>Grand Total</td> 
                    </thead>
                    <tbody className='text-center'>
                      <tr key="c">
                        <td>{Math.round(order.quantity * price).toLocaleString()}/-</td>
                        <td>{Math.round(order.quantity*price*0.05).toLocaleString()}/-</td>
                        <td>{Math.round((order.quantity*price)+(order.quantity*price*0.05)).toLocaleString()}/-</td>
                      </tr>
                    </tbody>
                  </table>
                }
              </div>

            </div>

            <div className='row receipt-row'>
              <div className='col-lg-12 col-md-12 col-12'>
                <button className='btn btn-success form-btn' style={{width: "100%"}} onClick={onGenerateBill} >Generate Bill</button>
              </div>
            </div>

          </div>
          {
            party &&
            <div>
              <h5 className='text-center'>Buyer Information</h5><hr/>
              <div className='row receipt-row compact-display'>
                
                <div className='col-lg-4 col-md-4 col-12 mb-4'>
                  <h6>Address</h6>
                  <label>{party.address}</label>
                </div>

                <div className='col-lg-4 col-md-4 col-5 mb-4 '>
                  <h6>State Code</h6>
                  <label>{party.stateCode}</label>
                </div>

                <div className='col-lg-4 col-md-4 col-7 mb-4'>
                  <h6>GST Number</h6>
                  <label>{party.gstNumber}</label>
                </div>

              </div>
            </div> 
          }
          
        </div>
    </div>
  )
}

export default SellingScreen