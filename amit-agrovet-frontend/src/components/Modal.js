import React from 'react'

const Modal = (props) => {

  return (
    <div className={props.displayed===true ? 'modal' : 'd-none'}>
        <div className='modalContent'>
            <div className='container'>
                <div className='row' >
                    <div className='col-lg-9 col-md-9 col-9' >
                        <span className='float-start' style={{fontWeight: "bolder", fontSize: "1.2em"}}> {props.title ? props.title : "Confirmation"} </span>
                    </div>
                    <div className='col-lg-3 col-md-3 col-3' >
                        <span onClick={()=>props.onCancel()} className='btn-outline-danger float-end text-center' style={{cursor: "pointer"}}>&nbsp; x &nbsp;</span>
                    </div>
                </div>
                <hr/>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-12' style={{paddingLeft: "2rem"}}>
                       <h6> {props.message ? props.message : "Are you sure ? "} </h6>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-12 modalBtnArea'>
                       <button className='btn btn-outline-success' onClick={()=>props.onConfirm()}>Confirm</button> &emsp;
                       <button className='btn btn-outline-danger' onClick={()=>props.onCancel()}>Cancel</button> 
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Modal