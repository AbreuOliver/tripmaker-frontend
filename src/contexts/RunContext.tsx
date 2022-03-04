// this will hold details entered by the user on the HomePage

import React, { createContext, useState } from "react";

type IRun = {
  driverName: string,
  vehicleName: string,
  routeName: string,
  driverId: number,
  runId: number,
  onBreak: boolean,
  pin: string
};

const savedDetails = sessionStorage.getItem('driverDetails');
const defaultRun = savedDetails !== null
  ? JSON.parse(savedDetails)
  : {
    driverName: '',
    routeName: '',
    onBreak: false
}

export const RunContext = createContext<any>(defaultRun);

const RunContextProvider: React.FC = (props: any) => {
  const [runDetails, setRunDetails] = useState<IRun>(defaultRun);

  function updateRun(newDetails: IRun) {
    sessionStorage.setItem("driverDetails", JSON.stringify(newDetails)); 
    setRunDetails(newDetails);
  }

  return (
    <RunContext.Provider value={[runDetails, updateRun]}>
      {props.children}
    </RunContext.Provider>
  )
}

export default RunContextProvider;
