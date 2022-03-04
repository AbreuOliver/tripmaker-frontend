import {
	IonToast
} from '@ionic/react';


import React,
{
	useState,
	useEffect,
	useContext
} from 'react';


import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import { makeStyles, Theme } from '@material-ui/core/styles';

import { RunContext } from '../../contexts/RunContext';

import Header from '../../components/Header';
import ToDos from '../../components/ToDos';
import Tabs from '../../components/Tabs';

import {PullToRefresh} from 'react-js-pull-to-refresh';
import {PullDownContent, ReleaseContent, RefreshContent} from "react-js-pull-to-refresh";

const useStyles = makeStyles((theme: Theme) => ({
  appbar: {
    backgroundColor: theme.palette.primary.dark
  },
  main: {
    maxHeight: '100vh', 
    overflow: 'auto'
  },
}));

const Manifest: React.FC = (props: any) => {
  const classes = useStyles();

	const [error, setError] = useState<any>({ message: '' });
	const [tab, setTab] = useState<number>(0);
	const [dataBackUp, setDataBackUp] = useState<Array<any>>([]);
	const [data, setData] = useState<Array<any>>([]); //holds all trips

	const [runDetails, _] = useContext(RunContext) // use this context in it's childrens (refer App.tsx)

	const [showToast, setShowToast] = useState(false);

  const successfulFetchedDetails = (result: any) => {
    console.log("total fetched data length", result.data.length, result.data)
    
    setDataBackUp(result.data);
    setData(filterDataByTab(result.data, tab)); 
  }

  const failedFetchedDetails = (err: any) => {
    setError(err);
    setShowToast(true);
  }

	const fetchDetailsPromise = () => {
    return new Promise((resolve, reject) => {
      console.log('fetching details');
      if (runDetails.runId === "") {
        reject();
      }
      setError({ message: 'Fetching data...' });
      //setShowToast(true);

      setDataBackUp([]);
      fetch("/api/v1/scheduleForRun?runID=" + runDetails.runId)
        .then(res => res.json())
        .then(
          res => successfulFetchedDetails(res), 
          err => failedFetchedDetails(err)
        ).then(
          res => resolve(),
          err => reject()
        );
    });
  }

	const fetchDetails = () => {
    console.log('fetching details');
		if (runDetails.runId === "") {
			return;
		}
		setError({ message: 'Fetching data...' });
		//setShowToast(true);

		setDataBackUp([]);
		fetch("/api/v1/scheduleForRun?runID=" + runDetails.runId)
			.then(res => res.json())
			.then(
        res => successfulFetchedDetails(res), 
        err => failedFetchedDetails(err)
			)
	}

	//fetch trips on rendering
	useEffect(() => {
		fetchDetails();
	}, [runDetails]); //for new run -- re-render the manifest

  function isTripCompleted(details: any) {
    // these fields are buffers
    if ( details.StopType === "PU") {
      return details.PUComplete ? details.PUComplete.data[0] === 1 : 0;
    } else {
      return details.Completed ? details.Completed.data[0] === 1 : 0;
    }
  }
  
  const filterDataByTab = (data: any[], tab: number) => {
    let unFinishedTrips = [];
    let finishedTrips = [];
    for (let i = 0; i < data.length; ++i) {
      const currentTrip = data[i];
      if (isTripCompleted(currentTrip)){
        finishedTrips.push(currentTrip);
      } else {
        unFinishedTrips.push(currentTrip);
      }
    }

		if (tab === 0) { // ie show unfinished tasks
      console.log('num unfinished trips', unFinishedTrips.length);
      return unFinishedTrips;
    } else {
      console.log('num finished trips', finishedTrips.length);
      return finishedTrips;
    }
  }

	//pull to refresh all trips by calling fetchDetails function
  const doRefresh = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        fetchDetailsPromise().then(resolve);
      }, 400);
    });
  }

  const tabsChangeHandler = (newValue: number) => {
    setTab(newValue);
		const tempData = [...dataBackUp]
    setData(filterDataByTab(tempData, newValue));
  }
  
	return (
			<div className={classes.main}>
        <AppBar position="sticky">
          <Header {...{
            heading: `Manifest for ${runDetails.runName}`,
            isHome: false,
            backPath: '/runHub'
          }} />
          <Tabs 
            ChangeHandler={tabsChangeHandler}/>
        </AppBar>

        {error.message &&
          <IonToast
            isOpen={showToast}
            message={error.message}
            position="bottom"
            cssClass="toast"
            duration={2000}
          />}

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
        <Box m={2}> 
          {data && <ToDos todos={data} fetchDetails={fetchDetails} />}
        </Box>
        </PullToRefresh>
			</div>
	);
}
export default Manifest;
