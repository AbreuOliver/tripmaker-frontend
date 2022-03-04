import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';

import AirportShuttleIcon from '@material-ui/icons/AirportShuttle';

import { RunContext } from '../contexts/RunContext';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: '800px',
    margin: 'auto'
  },
  button: {
    margin: theme.spacing(1),
    flexGrow: 1,
  },
  submit: {
    margin: theme.spacing(1),
    marginLeft: 'auto'
  },
  activeRun: {
    borderLeft: `10px solid ${theme.palette.primary.main}`,
  }
}));

function isStarted(details: any) {
  return details.actualStartTime !== null;
}


function errors(err: { code: any; message: any; }) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}


const RunItem: React.FC<any> = ({ id, details, enterRun }) => {
  //console.log(details);
  const classes = useStyles();

  const [runStarted, setRunStarted] = useState(isStarted(details));
  const [startPromptActive, setStartState] = useState(false);
  const [finish, setFinish] = useState(false);
  const [startOdometer, setStartOdometer] = useState<number>();
  const [endOdometer, setEndOdometer] = useState<number>();
  const [active, setActive] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [userDetails, setUserDetails] = useContext(RunContext); 

  useEffect(() => {
    setActive(isActive());
    setDisabled(shouldBeDisabled());
  });

  const handleStartContinue = () => {
    if (!runStarted) { //run hasn't been started, so open start odometer field
      setStartState(!startPromptActive);
    } else if (active){ //run has started and is active, just enter run
      enterRun(details);
    } else { //run has been started but is finished, override finished and enter
      // do something that clears the finish times
      resumeRun();
    }
  }

  const getStartTime = () => {
    let start = details.actualStartTime;
    return moment(start).format("hh:mm A");
  }
  const getEndTime = () => {
    let end = details.actualEndTime;
    return moment(end).format("hh:mm A");
  }
  const getStartButtonColor = () => {
    if (!runStarted) {
      return "default";
    } else if (active) {
      return "primary";
    } else {
      return "default";
    }
  }

  const startRun = () => {
    const startDetails = {
      runId: details.runId,
      odoReading: startOdometer
    }

    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(startDetails)
    }

    fetch('/api/v1/startRun', requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          enterRun(details);
        },
        (error) => {
          console.log(error);
        }
      )
  }
  const resumeRun = () => {
    const runDetails = {
      runId: details.runId
    }

    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(runDetails)
    }

    fetch('/api/v1/resumeRun', requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          enterRun(details);
        },
        (error) => {
          console.log(error);
        }
      )
  }

  const finishRun = () => {
    const endDetails = {
      runId: details.runId,
      odoReading: endOdometer
    }

    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(endDetails)
    }

    fetch('/api/v1/endRun', requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          // needed because details aren't getting refetched
          details.actualEndTime = new Date().toUTCString();
          setActive(false);
          setFinish(false);
          removeRunFromUserDetails();
        },
        (error) => {
          console.log('run did not end');
          console.log(error);
        }
      )
  }

  function removeRunFromUserDetails() {
    let newUserDetails = {...userDetails};
    delete newUserDetails.runId;
    delete newUserDetails.runName;
    setUserDetails(newUserDetails); 
  }

  const isActive = () => { 
    return details.actualStartTime && !details.actualEndTime;
  }
  const toggleFinishPrompt = () => {
    console.log('toggled finish prompt');
    setFinish(!finish);
  }

  const shouldBeDisabled = () => {
    return isOtherRunActive() || isBreakStarted();
  }
  
  const isOtherRunActive = () => {
    return userDetails.runId && userDetails.runId !== details.runId;
  }
  const isBreakStarted = () => {
    return userDetails.onBreak;
  }

  
  return (
    <Box m={2} style={disabled ? {pointerEvents: "none", opacity: "0.6"} : {}}>
      <Card
        className={`classes.root  ${active ? classes.activeRun : ''}`}
        key={id}
        >
        <Box px={2}>
          <CardHeader
            title={details.routeShortName}
            subheader={
              <List dense>
                <ListItem> 
                  <Box mr={1}><AirportShuttleIcon/></Box>
                  {details.VehicleIdentifier}
                </ListItem>
                {!details.actualStartTime &&
                  <ListItem>
                    Not Started
                  </ListItem>}
                {details.actualStartTime &&
                  <ListItem>
                    {`Started at ${getStartTime()}`}
                  </ListItem>}
                {details.actualEndTime &&
                  <ListItem>
                    {`Ended at ${getEndTime()}, resume to override`}
                  </ListItem>}
              </List>
            }
          />
          <CardContent style={{padding: 0}}>
            <Box display="flex">
              <Button
                variant={"contained"}
                color={getStartButtonColor()}
                onClick={() => handleStartContinue()}
                className={classes.button}>
                {!runStarted ? "Start Run" : "Resume"}
              </Button>
              <Button
                variant={active ? "contained": undefined}
                disabled={!active}
                onClick={toggleFinishPrompt}
                className={classes.button}>
                Finish Run
              </Button>
            </Box>
            {startPromptActive &&
              <div>
                <TextField fullWidth
                  label="Starting Odometer" 
                  type="number"
                  name="OdometerRead"
                  InputProps={{ inputProps: { min: 0, max: 999999 } }}
                  value={startOdometer} />
                <Box display="flex" justifyContent="flex-end">
                <Button
                  onClick={() => startRun()}
                    variant="contained"
                    type="submit"
                    color="primary"
                  className={classes.submit}>
                  Submit & Start
                </Button>
                </Box>
              </div>
            }
            {finish &&
              <div>
                <TextField fullWidth
                  label="Ending Odometer" 
                  type="number"
                  name="OdometerRead"
                  InputProps={{ inputProps: { min: 0, max: 999999 } }}
                  value={endOdometer} />
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    onClick={() => finishRun()}
                    variant="contained"
                    type="submit"
                    color="primary"
                    className={classes.submit}>
                    Submit & Finish
                  </Button>
                </Box>
              </div>
            }
          </CardContent>
        </Box>
      </Card>
    </Box>
  )
}

export default RunItem;
