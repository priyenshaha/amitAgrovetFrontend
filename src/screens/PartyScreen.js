import React, { createRef, useState } from 'react'
import { useEffect } from 'react';
import Header from '../components/Header'
import { header, partyUrl } from '../components/Request';
import { toast } from 'react-toastify'
import axios from 'axios';
const PartyScreen = (props) => {
  const partyRef = createRef();

  let [dataOrig, setDataOrig] = useState([])
  let [editFlag, setEditFlag] = useState(false);
  let [partyFormFlag, setPartyFormFlag] = useState(false);
  let [loading, setLoading] = useState();
  let [name, setName] = useState("");
  let [partyNameError, setPartyNameError] = useState(null);
  let [address, setAddress] = useState("");
  let [stateCode, setStateCode] = useState("");
  let [gstNumber, setGstNumber] = useState("");
  let [gstNumberError, setGstNumberError] = useState(null);
  let [price, setPrice] = useState("");
  let [type, setType] = useState("");
  let [typeError, setTypeError] = useState(null);
  let [data, setData] = useState([])

  const clearForm = () => {
    document.getElementById('newPartyForm').querySelectorAll('input').forEach(elem => elem.value="")
    document.getElementById('newPartyForm').querySelector('select').value="SELECT TYPE"
  }

  const fetchUsers = () => {
    setLoading(true)
    axios.get(partyUrl+"/all").then(resp => { 
      setDataOrig(resp.data.data.filter(party => party.isDeleted!==true || party.isDeleted==null)
                                .map(party => ({...party, allValues: Object.values(party).flatMap(partyData=>partyData).toString(), edited: false})))
      setData(resp.data.data.filter(party => party.isDeleted!==true || party.isDeleted==null)
                            .map(party => ({...party, allValues: Object.values(party).flatMap(partyData=>partyData).toString(), edited: false})))
      setLoading(false)
    })
    .catch(err => {
      toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchUsers()
  }, [])
  
  useEffect(()=>{
    partyRef.current && partyRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  },[partyFormFlag, partyRef])

  const onSave = (party) => {
    setLoading(true)
    axios.put(partyUrl+"/edit", party, header).then(resp => {
      toast.success("Party " + resp.data.data.name + " edited successfully!", {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
      fetchUsers()
    })
    .catch(err => {
      toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
      setLoading(false)
    })
  }

  const onCancel = (party) => {
    
    let idx = data.findIndex(cParty => cParty.id === party.id)
    let prevPartyData = dataOrig.find(oParty => oParty.id === party.id)
    data[idx] = {...prevPartyData, edited: false}
    setData([...data])
  }

  const onAddParty = () => { setPartyFormFlag(true) }

  const onCancelParty = () => { setPartyFormFlag(false); clearForm() }

  const onConfirmParty = () => { 
    //validation
    name.length<1 ? setPartyNameError("Name should be given") : setPartyNameError("")
    gstNumber.length>0 && gstNumber.length!==15 ? setGstNumberError("GST number should have 15 characters") : setGstNumberError("")
    type.length<1 ? setTypeError("Select type") : setTypeError("")
    
    // make req
    if(!(name.length<1 || (gstNumber.length>0 && gstNumber.length!==15) || type.length<1)){
      setLoading(true)
      axios.post(partyUrl+"/register", {
        name, address, stateCode, gstNumber, price, type
      }, header).then(resp => {
        toast.success("Party " + resp.data.data.name + " added successfully!", {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
        setPartyFormFlag(false)
        fetchUsers()
        clearForm()
        setLoading(false)
      }).catch(err => {
        toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
        setLoading(false)
      })
    }

  }

  const onDelete = (party) => {
    party.isDeleted = 1
    console.table(party)
    axios.put(partyUrl+"/edit", party, header).then(resp => {
      toast.success("Party " + resp.data.data.name + " deleted successfully!", {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
      fetchUsers()
    })
    .catch(err => {
      toast.error(err.message, {autoClose: 2000, position: toast.POSITION.TOP_RIGHT})
    })
  }

  const onSearch = (val) => {
    if(val){
      const reqData = dataOrig.map((party, index) => {
        if(party.allValues.toLowerCase().indexOf(val.toLowerCase()) >= 0)
          return dataOrig[index];
        return null;
      })
      setData(reqData.filter((party) => party ? true : false))
    }else{
      setData(dataOrig)
    }
  }
  return (
    <div className='Screen'>
      <Header loading={loading} title="Party management" />
      
      <button className='btn btn-outline-info float-start' onClick={onAddParty} >Add Party</button><br/><br/>
      <div className="row">
      <div id='newPartyForm' className={partyFormFlag===true ? "col-lg-4 col-md-12" : "d-none"}>
          <h5 className='text-center'style={{padding:"1rem"}} ref={partyRef} >Add New Party</h5>
          
          <div className="row">
            <div className="col-lg-6 col-md-12 mb-3">
                <h6 className="form-label">Name</h6>
                <input onChange={e => {setName(e.target.value); setPartyNameError("")}} type="text" className="form-control" placeholder="Party's Name" />
                <label className={partyNameError!==null ? "text-danger":"d-none"}>{partyNameError}</label>
            </div>
            
            <div className="col-lg-6 col-md-12 mb-3">
              <h6 className="form-label">Address</h6>
              <input onChange={e => {setAddress(e.target.value)}} type="text" className="form-control" placeholder="Short Address" />
            </div>

            <div className="col-lg-6 col-md-12 mb-3">
                <h6 className="form-label">GST Number</h6>
                <input onChange={e => {setGstNumber(e.target.value); setGstNumberError("")}} type="text" className="form-control" placeholder="GST number" />
                <label className={gstNumberError!==null ? "text-danger":"d-none"}>{gstNumberError}</label>
            </div>

            <div className="col-lg-6 col-md-12 mb-3">
                <h6 className="form-label">State Code</h6>
                <input onChange={e => {setStateCode(e.target.value)}} type="text" className="form-control" placeholder="GST State Code" /> 
            </div>

            <div className="col-lg-6 col-md-12 mb-3">
                <h6 className="form-label">Rate</h6>
                <input onChange={e => {setPrice(e.target.value)}} type="text" className="form-control" placeholder="Deal Price" />
            </div>

            <div className="col-lg-6 col-md-12 mb-3">
                <h6 className="form-label">Type</h6>
                <select className='form-control' onChange={e => {setType(e.target.value); setTypeError("")}}>
                  <option disabled selected>SELECT TYPE</option>
                  <option >CUSTOMER</option>
                  <option >PROVIDER</option>
                </select>
                <label className={typeError!==null ? "text-danger" : "d-none"}>{typeError}</label>
            </div>
        </div>
        <div className='float-start' style={{paddingLeft: "10%"}}>
          <button className='btn btn-success' onClick={onConfirmParty}>Confirm</button> 
        </div>
        <div className='float-end' style={{paddingRight: "10%"}}>
          <button className='btn btn-outline-warning' onClick={onCancelParty}>Cancel</button>
        </div>  
        
        </div>
        <div className={ partyFormFlag ? "table-responsive table-body col-lg-8 col-md-12 verticalSeparator":"table-responsive table-body"}><br/>
          <input onChange={e => (onSearch(e.target.value))} style={{border: "1px solid grey"}} type="search" className="form-control" placeholder='Start typing to search party...' />
          <br/>  
          <table className="table table-bordered table-hover text-center">
            <tbody>
            <tr style={{backgroundColor: "lightgrey"}}>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>State Code</th>
              <th>GST Number</th>
              <th>Rate</th>
              <th>Type</th>
              <th style={{width: "10rem"}}>Action</th>
            </tr>
              {
                data.length>0 &&
                data.map(party => {
                  
                  return (
                    <tr key={party.id} onChange={() => {party.edited=true; setEditFlag(!editFlag)}}>
                      <td>{party.id}</td>
                      <td className='text-center'><input className="text-center form-control form-control-sm" style={{margin: "auto", width: "20rem"}} type="text" value={party.name} onChange={e => {party.name = e.target.value}}/></td>
                      <td className='text-center'><input className="text-center form-control form-control-sm" style={{margin: "auto", width: "15rem"}} type="text" value={party.address ? party.address : ""} onChange={e => {party.address = e.target.value}}/></td>
                      <td className='text-center'><input className="text-center form-control form-control-sm" style={{margin: "auto", width: "3rem"}} type="text" value={party.stateCode ? party.stateCode : ""} onChange={e => {party.stateCode = e.target.value}}/></td>
                      <td className='text-center'><input className="text-center form-control form-control-sm" style={{margin: "auto", width: "9rem"}} type="text" value={party.gstNumber ? party.gstNumber : ""} onChange={e => {party.gstNumber = e.target.value}} /></td>
                      <td className='text-center'><input className="text-center form-control form-control-sm" style={{margin: "auto", width: "5rem"}} type="text" value={party.price ? party.price : ""} onChange={e => {party.price = e.target.value}} /></td>
                      <td>
                        <select className='form-control form-control-sm' style={{margin: "auto", width: "8rem"}} value={party.type} onChange={e => {party.type = e.target.value}}>
                          <option disabled>SELECT TYPE</option>
                          <option>CUSTOMER</option>
                          <option>PROVIDER</option>
                        </select>
                      </td>
                      {
                        party.edited===true &&
                        <td >
                          <p style={{width: "9rem"}}>
                            <button className='btn btn-outline-success float-start' onClick={() => onSave(party)} > Save </button><span> </span> 
                            <button className='btn btn-outline-warning float-end' onClick={() => onCancel(party)} > Cancel </button>
                          </p>
                        </td>
                        
                      }
                      {
                        party.edited!==true &&
                        <td>
                          <span style={{width: "9rem"}}>
                            <button className='btn btn-outline-danger' onClick={() => onDelete(party)}>Delete</button>
                          </span>
                        </td>

                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
          {
            data && !data.length>0 &&
            <div className='text-center'>
              -- No data --
            </div>
          }
        </div>
      </div>
      
    </div>
  )
}
export default PartyScreen