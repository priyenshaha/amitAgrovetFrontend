import React from 'react'
import { Link } from 'react-router-dom'

const Navigation = () => {
  return (
    <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark myNav">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/"><b> Amit <span style={{color: "green"}}>Agrovet</span></b> </Link>
                <button id="navbar-btn" className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto mb-2 mb-lg-0 " onClick={()=>{document.getElementById("navbar-btn").click()}}>
            
                        <li className="nav-item">
                            <Link className="nav-link" to="/purchase">Purchase</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/sell">Sell</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/party">Party</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/report">Reports</Link>
                        </li>

                    </ul>

                </div>
            </div>
        </nav>
    </div>
  )
}

export default Navigation