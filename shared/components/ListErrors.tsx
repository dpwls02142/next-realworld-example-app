import React from "react";

const ListErrors = ({ errors }) => {
  if (!errors || typeof errors !== "object"){
    return null
  }
  else{
    return (
      <ul className="error-messages">
        {Object.keys(errors).map((key) => (
          <li key={key}>
            {key} {errors[key]}
          </li>
        ))}
      </ul>
    );
  }
};


export default ListErrors;
