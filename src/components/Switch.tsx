import React, {useState, useContext, useEffect} from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom'; 

import Homepage from '../pages/Homepage/Homepage';
import Manifest from '../pages/Manifest/Manifest';
import RunHub from '../pages/RunHub/RunHub';
import Break from '../pages/Break/Break';

import { RunContext } from '../contexts/RunContext';

const CustomSwitch: React.FC = () => {
  const [userDetails, setUserDetails] = useContext(RunContext);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if ( userDetails.driverId && userDetails.pin) {
      authenticateUser();
      setAuthenticated(true); //testing
    } else {
      setAuthenticated(false);
    }
  }, [userDetails]); 
  
  // this is a low security implementation
  // plain text pin is being transmitted and saved in session storage
  const authenticateUser = () => {
    const details = {
      driverId: userDetails.driverId,
      pin: userDetails.pin
    }

    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    }
    fetch('/api/v1/authenticateDriver', requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          if (result.data === 'authenticated') {
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
            //setAuthenticated(true);
          }
        },
        (error) => {
          setAuthenticated(false);
        }
    )
  }

  console.log('attempt at context and routing');

  return (
    <Switch> 
      <Route exact path="/">
        <Homepage />
      </Route>
      { authenticated && <Route path="/runHub">
          <RunHub />
        </Route>}
      { (authenticated && !userDetails.onBreak) && <Route path="/manifest">
          <Manifest />
        </Route>}
      { (userDetails.runId && userDetails.onBreak) && 
        <Redirect from="/manifest" to="/profile" />}
      { userDetails.driverId && <Route path="/break">
          <Break />
        </Route>}
      <Redirect from="*" to="/" />
    </Switch>	
  )
}

export default CustomSwitch;
