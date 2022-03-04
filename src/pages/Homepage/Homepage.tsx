import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Snackbar from '@material-ui/core/Snackbar';
import ReactCodeInput from "react-code-input";
import Typography from '@material-ui/core/Typography';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import PersonIcon from '@material-ui/icons/Person';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import './Homepage.css';



import React, {
    useContext,
    useEffect,
    useState,
} from 'react';

import { RunContext } from '../../contexts/RunContext';

import Footer from '../../components/Footer';
import Header from '../../components/Header';

import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  textField: {
    marginBottom: theme.spacing(4)
  },
  form : {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  main : {
    marginTop: '10vh',
    height: '75vh',
    backgroundColor: '#ddd',
    maxWidth: '800px',
    margin: 'auto'
  }
}));

interface State {
  pin: string;
  showPassword: boolean;
}

let URL = "http://localhost:4444";

const Homepage: React.FC = (props: any) => {

  const classes = useStyles();

  const [state, setState] = React.useState({
    driverId: -1,
    driverName: '',
    runId: -1,
    routeName: 'none',
    vehicleName: 'none',
    // low security, just testing out currently,
    pin: ''
  })

  const [values, setValues] = React.useState<State>({
    pin: '',
    showPassword: false,
  });

  const [error, setError] = useState<any>({ message: "" });
  const [listOfDriverNames, setListOfDriverNames] = useState<any>([]);

  const [runDetails, setRunDetails] = useContext(RunContext) // use this context in it's childres (refer App.tsx)

  const history = useHistory();

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchAllDriverNames = () => {
      fetch(`${URL}/api/v1/getDriverNames`)
        .then(res => res.json())
        .then(
          (result) => {
            setListOfDriverNames(result.data);
          },
          (error) => {
            setError(error);
          }
        )
    }
    

    fetchAllDriverNames();
  }, []); //for driver names 

  // bug in react-code-input means filterCharsIsWhitelist isn't working
  // attempt to whitelist everything that's not a number?
  const nonNumber = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n',' o','p','q','r','s','t','u','v','w','x','y','z'];


  const handleSubmit = (event: any) => {
    console.log('submitting the following state:', state);
    event.preventDefault();

    if (state.driverId === -1) {
      setError({ message: "Please Select Driver" });
      setShowToast(true);
      return;
    } else if (state.pin === "" || state.pin.length < 6) {
      setError({ message: "Please enter Driver PIN" });
      setShowToast(true);
      return;
    }
    setError({ message: "" });
    
    const details = {
      driverId: state.driverId,
      pin: state.pin
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
            setRunDetails({ 
              driverName: getSelectedDriverName(state.driverId),
              driverId: state.driverId,
              pin: state.pin
            });
            // very ad hoc, this should be eventually done better
            setTimeout(function() {
              history.push("/runHub");
            }, 500); 
          } else {
            setError({ message: "Driver and PIN do not match" });
            setShowToast(true);
          }
        },
        (error) => {
          setError({ message: "Unable to authenticate Driver" });
          setShowToast(true);
        }
    );
  }


  const handleInputChange = (event: any) => {
    if (event.target) {
      setState({
        ...state,
        [event.target.name]: event.target.value
      })
    }
  }
  const handlePINChange = (pin: string) => {
    state.pin = pin;
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

  // dont know why
  const handleChange =
    (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (prop === 'pin') {
        const re = /^[0-9\b]+$/;
        if (event.target.value !== '' &&  !re.test(event.target.value)) {
          //setValues({ ...values, pin: event.target.value });
          return;
        }
      }  
      setValues({ ...values, [prop]: event.target.value });
    };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
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



  const getSelectedDriverName = (driverId: number) => {
    let driverName = '';
    for (let i = 0; i < listOfDriverNames.length; ++i) {
      if (listOfDriverNames[i].EmployeeID === driverId) {
        driverName = `${listOfDriverNames[i].FirstName} ${listOfDriverNames[i].LastName}`;
        return driverName;
      }
    }
  }


  const heading = "ITRE - Trip Maker";
  const backPath = "/";

  const headerProps = {
    heading: heading,
    isHome: true,
    backPath: backPath
  }

  return (
      <>
        <div style={{maxHeight: '100vh', overflow: 'auto'}}>
          <AppBar position="sticky">
            <Header {...headerProps} />
          </AppBar>
          <div className={classes.main}>
            <form 
              className={classes.form}
              name="driverDetails"
              method="POST"
              onSubmit={handleSubmit}
              encType="multipart/form-data">

              <Card>
                <CardHeader color="primary"
                  title="Welcome"
                />
                <CardContent>
                  <Snackbar
                    open={showToast}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    message={error.message}
                    action={toastAction}/>

                  <TextField
                    select fullWidth required={true}
                    className={classes.textField}
                    value={state.driverId}
                    onChange={handleInputChange}
                    label="Name"
                    name="driverId"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="-1" disabled>Select Driver
                    </MenuItem>
                    {listOfDriverNames.map((name: any, key: any) =>
                      <MenuItem
                        key={key}
                        value={name["EmployeeID"]}>
                        {name["FirstName"] + " " + name["LastName"]}
                      </MenuItem>
                    )}
                  </TextField>
                  <Typography>
                  Enter Driver PIN:
                  </Typography>
                  <div
                    style={{display: 'flex', alignItems: 'center'}}
                  >
                    <ReactCodeInput 
                      onChange={handlePINChange}
                      name="pin"
                      fields={6}
                      type={values.showPassword ? 'number' : 'password'}
                      value={state.pin}
                      inputMode="numeric"
                      //filterCharsIsWhitelist={true}
                      filterChars={nonNumber}
                    />
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </div>

                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      type="submit"
                      color="primary"
                      style={{marginLeft: 'auto'}}
                      >
                      Submit
                    </Button>
                  </Box>

                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      <Footer />
    </>
  )
}

export default Homepage;
