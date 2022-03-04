import {
    IonDatetime,
} from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';

import Header from '../../components/Header';
import './Break.css';
import { RunContext } from '../../contexts/RunContext';

const useStyles = makeStyles((theme) => 
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      '& > * + *': {
        marginLeft: theme.spacing(2),
      },
    },
    card: {
      margin: theme.spacing(2),
      marginTop: theme.spacing(4),
    },
    wrapper: {
      maxWidth: '800px',
      margin: 'auto',
    },
    main: {
      maxHeight: '100vh', 
      overflow: 'auto'
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
      flexGrow: 1,
    },
  }),
);

function getPosition(): Promise<Position> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );
}


const Break: React.FC = (props: any) => {
  const classes = useStyles();

  const headerProps = {
      heading: "Breaks Overview",
      isHome: false,
      backPath: "/runHub"
  }

  const [loading, setLoading] = React.useState(false);    

  const startLoadingIcon = () => {
    setLoading(true);
  }
  const endLoadingIcon = () => {
    setLoading(false);
  }

  const [ct, setCt] = useState(new Date().toLocaleString());
  useEffect( () => {
    let isMounted = true;
    // things to do at begin of page mounting

    let secTimer = setInterval( () => {
      setCt(new Date().toLocaleString())
    }, 1000);

    getBreaksDetails();

    return function cleanup() {
      clearInterval(secTimer);
    }
  }, []);

  const [error, setError] = useState<any>({ message: "" });
  const [odometerRead, setOdometerRead] = useState(0);

  const [showToast, setShowToast] = useState(false);

  const [breakStarted, setBreakStarted] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState('no previous actions');
  const [currentBreakID, updateCurrentBreakID] = useState<number | null>(null);
  const [timeOnBreaks, setTimeOnBreaks] = useState('--');

  interface BreakDetail {
    RunBreakID: number,
    RunID: number,
    PUX: number,
    PUY: string,
    DOX: number,
    DOY: string,
    StartBreakTime: number,
    EndBreakTime: number
  }
 
  const handleOdometerChange = (event: any) => {
    setOdometerRead(event.target.value);
  }
   
  const isBreakStarted = ( breaksDetails: Array<BreakDetail>) => {
    if (breaksDetails.length > 0) {
      return breaksDetails[breaksDetails.length - 1].EndBreakTime === null;
    } else {
      return false;
    }
  }

  const getLastAction = ( breaksDetails: Array<BreakDetail>) => {
    if (breaksDetails.length > 0) {
      let mostRecentBreak = breaksDetails[breaksDetails.length - 1];
      let sDate = new Date(mostRecentBreak.StartBreakTime).toLocaleTimeString();
      let eDate = mostRecentBreak.EndBreakTime !== null
        ? new Date(mostRecentBreak.EndBreakTime).toLocaleTimeString()
        : null;
      console.log(mostRecentBreak);
      let message = mostRecentBreak.EndBreakTime === null
        //? "break started at " + mostRecentBreak.StartBreakTime
        ? "break started at " + sDate
        : "ended break at " + eDate;
      return message;
    } else {
      return 'no previous actions';
    }
  }

  const getLastBreakID = ( breaksDetails: Array<BreakDetail>) => {
    if (breaksDetails.length > 0) {
      let mostRecentBreak = breaksDetails[breaksDetails.length - 1];
      return mostRecentBreak.RunBreakID;
    } else {
      return null;
    }
  }

  const getBreaksDetails = () => {
    
    const details = {
      runId: userDetails.runId
    }

    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    }

    fetch('/api/v1/getRunBreakDetails', requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(typeof(result), result);
          let breakStarted = isBreakStarted(result.data);
          setBreakStarted(breakStarted);
          if (breakStarted) {
            updateCurrentBreakID(getLastBreakID(result.data));
          }
          setLastActionMessage(getLastAction(result.data));
          updateBreaksTable(result.data);
          updateTimeOnBreaks(result.data);
        },
        (error) => {
          setError({ 
            success: false, 
            message: "Error: Break details could not be fetched" 
          });
          console.log(error);
        }
    )
  }

  const updateBreaksTable = (breaksDetails: Array<BreakDetail>) => {
    let tbody = '';
    breaksDetails.forEach( (bd) => {
      let sTime = new Date(bd.StartBreakTime).toLocaleTimeString();
      let eTime = bd.EndBreakTime !== null
        ? new Date(bd.EndBreakTime).toLocaleTimeString()
        : '';
      tbody += '<tr><td>' + sTime + '</td><td>' + eTime + '</td></tr>';
    });
    const table = document.getElementById('breakTableBody');
    if (table) {
      table.innerHTML = tbody;
    }

  }
  
  const updateTimeOnBreaks = (breaksDetails: Array<BreakDetail>) => {
    let timeOnBreaks = 0;

    breaksDetails.forEach( (bd) => {
      let sTime = new Date(bd.StartBreakTime).getTime();
      let eTime = bd.EndBreakTime !== null
        ? new Date(bd.EndBreakTime).getTime()
        : sTime;
      //timeOnBreaks += (eTime - sTime) / 1000;
      timeOnBreaks += eTime - sTime;

    });
    //let formattedTime = new Date(SECONDS * 1000).toISOString().substr(11, 8);
    let formattedTime = new Date(timeOnBreaks).toISOString().substr(11, 8);
    setTimeOnBreaks(formattedTime);

  }

  const handleClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowToast(false);
  };

  const toastAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );


  const startBreak = () => {
    startLoadingIcon();
    getPosition()
      .then((position) => {

        const breakDetails = {
          runId: userDetails.runId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          odometer: odometerRead
        }

        const requestOptions = {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(breakDetails)
        }

        console.log(requestOptions);

        fetch('/api/v2/startRunBreak', requestOptions)
          .then(res => res.json())
          .then(
            (result) => {
              setError({ success: true, message: "Break Started" });
              setShowToast(true);
              console.log(result);

              getBreaksDetails();
              endLoadingIcon();
              updateOnBreak();

              setOdometerRead(0);
            },
            (error) => {
              setError({ 
                success: false, 
                message: "Error: Could not start break" 
              });
              setShowToast(true);
              console.log(error);
              endLoadingIcon();
          })
      })
  }
  
  const updateOnBreak = () => {
    setUserDetails({
      ...userDetails,
      onBreak: true
    }); 
  }
  const updateOffBreak = () => {
    setUserDetails({
      ...userDetails,
      onBreak: false
    }); 
  }

  const endBreak = () => {
    startLoadingIcon();
    getPosition()
      .then((position) => {

        const breakDetails = {
          runBreakId: currentBreakID,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          odometer: odometerRead
        }

        const requestOptions = {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(breakDetails)
        }

        console.log(requestOptions);

        fetch('/api/v2/endRunBreak', requestOptions)
          .then(res => res.json())
          .then(
            (result) => {
              setError({ success: true, message: "Break Ended" });
              setShowToast(true);
              getBreaksDetails();
              endLoadingIcon();
              updateOffBreak();
              setOdometerRead(0);
            },
            (error) => {
              setError({ 
                success: false, 
                message: "Error: Could not end break" 
              });
              setShowToast(true);
              endLoadingIcon();
          })
      })
  }

  const [userDetails, setUserDetails] = useContext(RunContext) // use this context in it's childres (refer App.tsx)

return (
    <div className={classes.main}>
      <AppBar position="sticky">
        <Header {...headerProps} />
      </AppBar>
      <Box className={classes.wrapper} m={2}> 
        { userDetails.runId === -1 || !userDetails.runId
          ? <Box m={4}>
              <Typography variant="h5" component="h1">
                No run currently active
              </Typography>
            </Box>
          : <div>
        <Card className={classes.card}>
          <CardHeader color="primary"
            title={`Break Management for ${userDetails.runName}`}
          />
          <CardContent>
            <IonDatetime id="primaryTime"
              displayFormat="MMM DD, hh:mm:ss a"
              value={ct}>
            </IonDatetime>
            <Typography id="lastActionMessage">
              last action: <span>{lastActionMessage}</span>
            </Typography>
            <Fade
              in={loading}
              style={{
                transitionDelay: loading ? '400ms' : '0ms',
              }}
              unmountOnExit>
              <div className={classes.root}>
                <CircularProgress />
              </div>
            </Fade>
            <TextField fullWidth
              label="Odometer Reading" 
              type="number"
              name="OdometerRead"
              InputProps={{ inputProps: { min: 0, max: 999999 } }}
              value={ odometerRead===0 ? '' : odometerRead }
              onChange={handleOdometerChange} />
            <Box display="flex">
              <Button
                variant={!breakStarted ? "contained": undefined}
                disabled={breakStarted || odometerRead === 0}
                onClick={() => startBreak()}
                className={classes.button}>
                Start Break
              </Button>
              <Button
                variant={breakStarted ? "contained": undefined}
                disabled={!breakStarted || odometerRead === 0}
                onClick={() => endBreak()}
                className={classes.button}>
                Finish Break
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card className={classes.card}>
          <CardHeader color="primary"
            title="Break Records"
          />
          <Snackbar
            open={showToast}
            autoHideDuration={3000}
            onClose={handleClose}
            message={error.message}
            action={toastAction}
          />
          <CardContent>
            <table id='breakTable'>
              <thead>
                <tr>
                  <th>Break Start</th>
                  <th>Break Finish</th>
                </tr>
              </thead>
              <tbody id='breakTableBody'>
              </tbody>
            </table>
            <p>Total Time on Breaks: <b>{timeOnBreaks}</b></p>
          </CardContent>
        </Card>
        </div>}
      </Box>
    </div>
  )
}

export default Break;
