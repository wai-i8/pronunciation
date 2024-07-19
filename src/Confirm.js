import React from "react";

const Confirm = (props) => {

    let style;
    if(props.isOnlyConfirm){
        style={
            width : "100%"
        }
    }else{
        style={
            width : "50%"
        }
    }

    return(
        <div className="confirm" onClick={(e) => e.stopPropagation()} style={props.appStyle}>
        <div className="confirm_close">
            <i className="confirm_close_icon fa-solid fa-xmark" onClick={() => props.close()}></i>
        </div>
        <span>{props.children}</span>
        <div className="confirm_form">
            <div className="confirm_form_cancel">
                    <button onClick={() => props.close()}>Cancel</button>
            </div>
            <div className="confirm_form_submit" style={style}>
                <button onClick={() => {props.confirm();props.close()}}>Confirm</button>
            </div>
        </div>
    </div>
    )
}

export default Confirm;