import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';

import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Header from '../../components/Header';
import { RunContext } from '../../contexts/RunContext';

import {PullToRefresh} from 'react-js-pull-to-refresh';
import {PullDownContent, ReleaseContent, RefreshContent} from "react-js-pull-to-refresh";

import RunItem from '../../components/RunItem';
import Warning from '../../components/Warning';

const useStyles = makeStyles(theme => ({
  paperRoot: {
    backgroundColor: "#fafafa",
    minHeight: "100vh"
  },
  main: {
    maxHeight: '100vh', 
    overflow: 'auto'
  },
  wrapper: {
    maxWidth: '800px',
    margin: 'auto',
  },
  h1: {
    fontSize: '2em'
  }
}));

const RunHub: React.FC = (props: any) => {
  const classes = useStyles();
  const heading = "Run Hub";
  const backPath = "/"
  const headerProps = {
      heading: heading,
      isHome: false,
      backPath: backPath
  }
  const history = useHistory();

  const [listOfRuns, setListOfRuns] = useState<any>([]);
  const [userDetails, setUserDetails] = useContext(RunContext); 

	useEffect(() => {
    fetchRuns();
	}, [userDetails.driverId]); 

  useEffect(() => {
    checkForActiveRun();
  }, [listOfRuns]);

  useEffect(() => {
    checkForActiveBreak();
  }, [userDetails.runId]);

  const checkForActiveRun = () => {
    console.log('looking through runs for active run');
    listOfRuns.forEach( (run: any) => {
      if (isRunActive(run)) {
        console.log('active run found', run);
        setUserDetails({
          ...userDetails,
          runId: run.runId,
          runName: run.routeShortName
        }); 
      }
    });
  }

  const isRunActive = (run: any) => { 
    return run.actualStartTime && !run.actualEndTime;
  }

	//pull to refresh all trips by calling fetchRuns function
  const doRefresh = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        fetchRuns().then(resolve);
      }, 400);
    });
  }

	const fetchRuns = () => {
    return new Promise((resolve, reject) => {
      console.log('fetching runs');
      fetch(`/api/v1/getRoutesForDriver?driverId=${userDetails.driverId}`)
        .then(res => res.json())
        .then(
          (result) => {
            setListOfRuns(result.data);
          },
          (error) => {
          }
        ).then(
          res => resolve(),
          err => reject()
        );
    });
  }

  const enterRun = (run: any) => {
    setUserDetails({
      ...userDetails,
      runId: run.runId,
      runName: run.routeShortName
    });
    history.push("/manifest");
  }

  const checkForActiveBreak = () => {
    const requestOptions = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({runId: userDetails.runId})
    }
    fetch('/api/v1/getRunBreakDetails', requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          if (isThereActiveBreak(result.data)) {
            setUserDetails({
              ...userDetails,
              onBreak: true
            }); 
          };
        },
        (error) => {
          console.log(error);
        }
    )
  }

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
  
  const isThereActiveBreak = (breakDetails: Array<BreakDetail>) => {
    if (breakDetails.length > 0) {
      return breakDetails[breakDetails.length - 1].EndBreakTime === null;
    } else {
      return false;
    }
  }


  return (
    <div className={classes.main}>
      <AppBar position="sticky">
        <Header {...headerProps} />
      </AppBar>
      <Box className={classes.wrapper} m={2}> 
        <Box m={4}>
          <Typography variant="h4" component="h1">
            {`Welcome, ${userDetails.driverName}`}
          </Typography>
          <Typography variant="subtitle1">
            {`You have ${listOfRuns.length} run${listOfRuns.length===1 ? '' : 's'} assigned today`}
          </Typography>
          <Typography variant="subtitle1">
            {userDetails.runName 
              ? `${userDetails.runName} currently active`
              : 'No run currently active' }
          </Typography>
        </Box>

        <PullToRefresh
          //pullDownContent={<PullDownContent />}
          pullDownContent={<div></div>}
          releaseContent={<ReleaseContent />}
          refreshContent={<RefreshContent />}
          pullDownThreshold={120}
          onRefresh={doRefresh}
          triggerHeight={'auto'}
          startInvisible={false}
        >
        { userDetails.onBreak && <Warning 
          title={'On Break'}
          message={'Cannot start, resume, or finish runs until break is over'}/>
        }
        {listOfRuns.length > 0 && listOfRuns.map((todo: any, k:number) => (
          <RunItem 
            key={todo.runId}
            id={todo.ScheduledID}
            details={todo}
            enterRun={enterRun} />
        ))}
        </PullToRefresh>
      </Box>
    </div>
  )
}


export default RunHub;
