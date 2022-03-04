import React, {useState} from 'react';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Box from '@material-ui/core/Box';

//import MapOutlinedIcon from '@material-ui/icons/MapOutlined';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: '800px',
    margin: 'auto'
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

function getSteps(type: string) {
  if (type==='PU') {
    return ['Drive to Pickup', 'Customer Pickup', 'Finish Pickup'];
  } else {
    return ['Drive to Dropoff', 'Customer Dropoff', 'Finish Dropoff'];
  }
}

function getLocation() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, errors);
  } else {
    console.log("Geo Location not supported by browser");
  }
}

function getPosition(): Promise<Position> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );
}

/*
var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};
*/

var lat: any;
var long: any;

function success(pos: { coords: any; }) {
    var crd = pos.coords;
    lat = crd.latitude;
    long = crd.longitude;
    console.log(`More or less ${crd.accuracy} meters.`);
    console.log(lat+' '+long);
}

function errors(err: { code: any; message: any; }) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

const openMaps = (address: { modalContent: any; "": any; }) => {
  getLocation();
  window.open('https://www.google.com/maps/dir/' + lat + ' ,' + long + '/' + address);
}


function getArrivalTime(details: any) {
  if ( details.StopType === "PU") {
    return details.ActualPUTime;  
  } else {
    return details.ActualDOTime;
  }
}

function getDepartureTime(details: any) {
  if ( details.StopType === "PU") {
    return details.ActualPUDepart;  
  } else {
    return details.ActualDODepart;
  }
}
function getPickupDropoffOdom(details: any) {
  if ( details.StopType === "PU") {
    return details.OdometerRead;  
  } else {
    return details.DOOdometerRead;
  }
}
function isTripCompleted(details: any) {
  // these fields are buffers
  if ( details.StopType === "PU") {
    return details.PUComplete ? details.PUComplete.data[0] === 1 : 0;
  } else {
    return details.Completed ? details.Completed.data[0] === 1 : 0;
  }
}

function determineCurrentStep(details: any) {
  let isNoShow = details.NoShow ? details.NoShow.data[0] === 1 : false;
  if (isTripCompleted(details)) {
    return 3;
  } else if (getArrivalTime(details) === null) {
    return 0;
  } else if (getPickupDropoffOdom(details) === null && !isNoShow) {
    return 1;
  } else {
    return 2;
  }
}

const pickUpDropOffNoShowText = (details: any) => {
  let isNoShow = details.NoShow ? details.NoShow.data[0] === 1 : false;

  if (isNoShow) {
    return `passenger no show`;
  } else {
    let isPU = details.StopType === "PU";
    return `${isPU ? 'picked up' : 'dropped off'} passengers`;
  }
}

function createCompletedText(details: any) {
  let arrivalText = `arrived at ${(moment(getArrivalTime(details)).format("hh:mm A"))}`;
  let pickUpDropOffText = pickUpDropOffNoShowText(details);
  let departureText = `departed at ${(moment(getDepartureTime(details)).format("hh:mm A"))}`;

  return [
    arrivalText,
    pickUpDropOffText,
    departureText
  ];
}


const ToDoItem: React.FC<any> = ({ id, details, updateModalState, fetchDetails }) => {
  //console.log(details);
  const [completedText, setCompletedText] = React.useState(createCompletedText(details));
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(determineCurrentStep(details));
  //console.log('current step', determineCurrentStep(details), activeStep);
  const steps = getSteps(details.StopType);

  const handleNext = () => {
    console.log('going forward a step');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 1 ) {
      undoVanArrived();
    }
    else if (activeStep === 3 ) {
      // do certain undo function
      undoTripComplete();
    }
    console.log('going back a step');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  //for error display
  const [error, setError] = useState<any>({ success: 1, message: "" });

  //for toast message 
  const [showToast, setShowToast] = useState(false);

  const titleText = () => {
    let type = details.StopType === "PU" ? 'Pick Up' : 'Drop Off';
    let title= `${type}: ${details.Client}`;
    return title;
  };

  const getPassengerCount = () => {
    let numPass = details.BilledPassengers + details.UnbilledPassengers;
    if (numPass > 1) {
      return `${numPass} Passengers`;
    } else {
      return `${numPass} Passenger`;
    }
  }

  const markBusArrived = (stopType: string): void => {
    getPosition()
      .then((position) => {
        let crd = position.coords;
        lat = crd.latitude;
        long = crd.longitude;
        console.log('gps coords',lat, long);
        fetch(`/api/v2/markBusArrived?scheduleId=${details.ScheduledID}&stopType=${stopType}&latitude=${lat}&longitude=${long}`)
          .then(res => {
              console.log('marked arrived');
              setError({ success: true, message: "Updated Successfully!" });
              setShowToast(true);
          })
          .catch(err => {
              setError({ success: false, message: "Failed to update!" });
              setShowToast(true);
          })
      })
      .catch((err) => {
        // maybe call non gps version?
      });
    fetchDetails();
    let compText = completedText;
    compText[0] = `arrived at ${moment(new Date()).format("hh:mm A")}`;
    setCompletedText(compText);
  }
  
  const markTripComplete = (stopType: string): void => {
    fetch(`/api/v2/markTripComplete?scheduleId=${details.ScheduledID}&stopType=${stopType}`)
      .then(res => {
        setError({ success: true, message: "Updated Successfully!" });
        setShowToast(true);
      })
      .catch(err => {
        setError({ success: false, message: "Failed to update!" });
        setShowToast(true);
      })

    fetchDetails();
    let compText = completedText;
    compText[2] = `departed at ${moment(new Date()).format("hh:mm A")}`;
    setCompletedText(compText);
  }

  const undoVanArrived = (): void => {
    fetch(`/api/v2/undoVanArrived?scheduleId=${details.ScheduledID}&stopType=${details.StopType}`)
      .then(res => {
        setError({ success: true, message: "Updated Successfully!" });
        setShowToast(true);
      })
      .catch(err => {
        setError({ success: false, message: "Failed to update!" });
        setShowToast(true);
      })

    fetchDetails();
  }

  const undoTripComplete = (): void => {
    fetch(`/api/v2/undoTripComplete?scheduleId=${details.ScheduledID}&stopType=${details.StopType}`)
      .then(res => {
        setError({ success: true, message: "Updated Successfully!" });
        setShowToast(true);
      })
      .catch(err => {
        setError({ success: false, message: "Failed to update!" });
        setShowToast(true);
      })

    fetchDetails();
  }

  const markNoShow = (): void => {
    fetch(`/api/v1/markNoShow?scheduleId=${details.ScheduledID}`)
      .then(result => {
        setError({ success: true, message: "Updated Successfully!" });
        setShowToast(true);
      })
      .catch(error => {
        setError({ success: false, message: "Failed to update!" });
        setShowToast(true);
        console.log(error);
      })
    fetchDetails();
    let compText = completedText;
    compText[1] = 'passenger no show';
    setCompletedText(compText);
  }

    return (
      <Box m={2}>
        <Card
          className={classes.root}
          key={id}
          style={details.StopType === "PU" ? { borderLeft: "10px solid orange" } : { borderLeft: "10px solid green" }}>
          <Box px={2}>
            <CardHeader
              title={titleText()}
              action={
                <Button
                  id="navigate"
                  variant="outlined"
                  className="mapBtn"
                  onClick={() => openMaps(details.Address)}>
                  Open Maps
                </Button>
              }
              subheader={
                <List dense><ListItem><ListItemText
                  primary={moment(details.Time, "HH:mm:ss").format("hh:mm A")}
                /></ListItem>
                <ListItem><ListItemText
                  primary={details.Address}
                /></ListItem>
                <ListItem><ListItemText
                  primary={getPassengerCount()}
                /></ListItem></List>
              }
            />

            <CardContent style={{padding: 0}}>
              <div className={classes.root}>
                <Stepper style={{paddingTop: 0}} activeStep={activeStep} orientation="vertical">
                {/*
                <Stepper style={{paddingTop: 0}} activeStep={determineCurrentStep(details)} orientation="vertical">
                */}
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>
                        <Box display="flex">
                          {label} 
                          {activeStep > index && 
                            <Box fontStyle="oblique" ml="auto">
                                {completedText[index]}
                            {/*
                            {createCompletedText(details)[index]}
                            */}
                          </Box>} 
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Box display="flex" justifyContent="flex-end">
                          <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            className={classes.button}
                          >
                            Back
                          </Button>
                          { index === 0 && <Button
                              variant="contained" color="primary"
                              className={classes.button}
                              onClick={() => {
                                handleNext();
                                markBusArrived(details.StopType);}}
                            >
                              { details.StopType === "PU"
                                  ? 'Arrived at pickup'
                                  : 'Arrived at dropoff'
                              }
                          </Button>}
                          { index === 1 && <div>
                            { details.StopType === "PU" && 
                              <Button
                                variant="contained" color="primary"
                                className={classes.button}
                                onClick={() => {
                                  markNoShow();
                                  //updateModalState({...details,
                                  //                  markNoShow: true});
                                  handleNext();}}
                              >
                                No Show
                              </Button>}
                            <Button
                              variant="contained" color="primary"
                              className={classes.button}
                              onClick={() => {
                                updateModalState({...details,
                                                  markNoShow: false});
                                handleNext();}}
                            >
                              { details.StopType === "PU"
                                  ? 'Pick Up Passenger'
                                  : 'Drop Off Passenger'
                              }
                            </Button>
                          </div>}
                          { index === 2 && <Button
                              variant="contained" color="primary"
                              className={classes.button}
                              onClick={() => {
                                handleNext();
                                markTripComplete(details.StopType);
                              }}
                            >
                              Complete & Depart
                          </Button>}
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
                {activeStep === steps.length && (
                  <Box display="flex" justifyContent="flex-end" m={1}>
                      <Button onClick={handleBack} className={classes.button}>
                        Back
                      </Button>
                  </Box>
                )}
              </div>
              </CardContent>
              </Box>
        </Card>
      </Box>
    )
}

export default ToDoItem;
