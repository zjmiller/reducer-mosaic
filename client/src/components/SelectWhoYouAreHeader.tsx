import { Checkbox, FormControlLabel } from "@material-ui/core";
import React from "react";

export const SelectWhoYouAreHeader: React.FC<any> = ({ email, setEmail }) => {
  const checkboxes = [];

  for (let i = 1; i <= 50; i++) {
    checkboxes.push(
      <FormControlLabel
        control={
          <Checkbox
            checked={email === `${i}@email.com`}
            onChange={() => {
              setEmail(`${i}@email.com`);
            }}
            value={i}
            color="primary"
          />
        }
        key={i}
        label={`${i}@email.com`}
        style={{ width: "160px" }}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ddd",
        height: "400px",
        marginBottom: "20px",
        marginTop: "10px",
        padding: "10px"
      }}
    >
      {checkboxes}
    </div>
  );
};
