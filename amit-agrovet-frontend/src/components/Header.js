import React from 'react'

const Header = (props) => {
    return (
        <div>
            <div className={props.loading===true ? "loader-container":"d-none"}>
                <div className="spinner"></div>
            </div>
            <h2 className="text-center" >{props.title}</h2>
            <hr/>
        </div>
    )
}

export default Header
