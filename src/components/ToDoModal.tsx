import {
    IonToast
} from '@ionic/react';

import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';


import React, { useState } from 'react';
import moment from 'moment';

const styles = (theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '5em',
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      margin: theme.spacing(2),
    },
    root: {
      margin: 0,
      padding: theme.spacing(2),
      paddingBottom: 0
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);



const ToDoModal: React.FC<any> = ({ open, handleOpen, handleClose, modalContent, setModalContent, fetchDetails }) => {

  /*
  //console.log(modalContent)
  interface originalTripDataInfo {
      [k: string]: any,
      stopType: string,
      billedPassCount: number;
      unBilledPassCount: number;
      customerPay: number;
      scheduleId: number;
      odometerRead: number;
  }
  
  //init obj
	const [originalTripData1, setOriginalTripData] = useState<originalTripDataInfo>({
      stopType: '',
      billedPassCount: -1,
      unBilledPassCount: -1,
      customerPay: -1,
      scheduleId: -1,
      odometerRead: 0
  }); 

  var originalTripData: originalTripDataInfo = {
      stopType: '',
      billedPassCount: -1,
      unBilledPassCount: -1,
      customerPay: -1,
      scheduleId: -1,
      odometerRead: 0
  };

  //when user clicked on a trip fill it
  if (modalContent !== undefined) {
    originalTripData = {
      stopType: modalContent.StopType,
      billedPassCount: modalContent.BilledPassengers,
      unBilledPassCount: modalContent.UnbilledPassengers,
      scheduleId: modalContent.ScheduledID,
      customerPay: modalContent.CustomerPay,
      odometerRead: modalContent.odometerRead
    }
  }
  */

  const [error, setError] = useState<any>({ success: 1, message: "" });

  //for toast message 
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (): void => {
    //console.log(JSON.stringify(originalTripData))
    let details = {
      stopType: modalContent.StopType,
      billedPassCount: modalContent.BilledPassengers,
      unBilledPassCount: modalContent.UnbilledPassengers,
      scheduleId: modalContent.ScheduledID,
      customerPay: modalContent.CustomerPay,
      odometerRead: modalContent.StopType === "PU"
        ? modalContent.OdometerRead
        : modalContent.DOOdometerRead
    }
    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      //body: JSON.stringify(originalTripData)
      body: JSON.stringify(details)
    }
    fetch("/api/v1/updateTripDetails", requestOptions)
      .then(res => res.json())
      .then(
        async (result) => {
          //setError({ success: true, message: "Updated Successfully!" });
          //setShowToast(true);
          handleClose();
          // want something that tells the card that opened the modal to go to next step
          fetchDetails();
          console.log(result);
        },
        (error) => {
          setError({ success: false, message: "Failed to update!" });
          setShowToast(true);
          console.log(error);
        }
      )        
  }

  const handleInputChange = (event: any) => {
    if (event.target) {
      setModalContent({
        ...modalContent,
        [event.target.name]: event.target.value
      })
    }
  }


  return (
      <>
        { modalContent && <Dialog 
          onClose={handleClose} 
          aria-labelledby="customized-dialog-title" 
          open={open}>
            <DialogTitle 
              id="customized-dialog-title" 
              onClose={handleClose}>
              {modalContent.StopType === "PU" 
                ? "Picking Up " 
                : "Dropping Off "}
              {modalContent.Client}
              {modalContent.markNoShow ? 'no show' : ''}
            </DialogTitle>
            <DialogContent style={{marginTop: 0}}>
              <Box display="flex" mb=".5em">
                <Box width="40%" mr="auto">
                  <TextField disabled
                    label="Purpose" 
                    InputProps={{ 
                      disableUnderline: true,
                    }}
                    defaultValue={modalContent.Purpose} />
                  <TextField disabled
                    label={modalContent.StopType === "PU" 
                      ? "Scheduled Pickup" 
                      : "Scheduled Dropoff"}
                    InputProps={{ disableUnderline: true }}
                    defaultValue={
                      moment(modalContent.Time, "HH:mm:ss").format("hh:mm A")
                    } />
                  <TextField disabled
                    label="Appointment Time" 
                    InputProps={{ disableUnderline: true }}
                    defaultValue={
                      moment(modalContent.AppointmentTime).format("hh:mm A")
                    } />
                </Box>
                <Box width="50%">
                  <TextField disabled fullWidth
                    label="Address" 
                    InputProps={{ disableUnderline: true }}
                    defaultValue={modalContent.Address1} />
                  <TextField disabled fullWidth
                    InputProps={{ disableUnderline: true }}
                    defaultValue={
                      `${modalContent.City}, ${modalContent.State}`
                    } />
                </Box>
              </Box>

              <TextField fullWidth
                label="Odometer Reading" 
                type="number"
                name={ modalContent.StopType === 'PU' 
                  ? "OdometerRead"
                  : "DOOdometerRead"}
                InputProps={{ inputProps: { min: 0, max: 999999 } }}
                value={ modalContent.StopType === 'PU' 
                  ? modalContent.OdometerRead 
                  : modalContent.DOOdometerRead}
                onChange={handleInputChange} />

              {modalContent.StopType === "PU" && <TextField fullWidth
                label="Billed Passengers" 
                type="number"
                name="BilledPassengers"
                InputProps={{ inputProps: { min: 0, max: 99 } }}
                onChange={handleInputChange} 
                value={modalContent.BilledPassengers} />}

              {modalContent.StopType === "PU" && <TextField fullWidth
                label="Unbilled Passengers" 
                type="number"
                name="UnbilledPassengers"
                InputProps={{ inputProps: { min: 0, max: 99 } }}
                onChange={handleInputChange} 
                value={modalContent.UnbilledPassengers} />}

              {(modalContent.StopType === "PU" && modalContent.MobilityAid)
                ? <TextField fullWidth
                    label="Mobility Aid" 
                    InputProps={{ readOnly: true }}
                    disabled
                    value={modalContent.MobilityAid} />
                : null
              }
              
              {modalContent.StopType === "PU" && <Typography>
                Fare Owed 
                ${modalContent.FareOwed} x  
                {modalContent.BilledPassengers} = 
                ${modalContent.FareOwed*modalContent.BilledPassengers}
              </Typography>}

              {modalContent.StopType === "PU" && <TextField fullWidth
                label="Payment Received" 
                type="number"
                name="CustomerPay"
                InputProps={{ 
                  inputProps: { min: 0.00, max: 999 },
                  startAdornment: 
                    <InputAdornment position="start">$</InputAdornment>
                  }}
                onChange={handleInputChange} 
                defaultValue={modalContent.CustomerPay} />}

            <div>
              { (modalContent === undefined || modalContent === null) &&
                <Typography variant="h5" component="h1">
                  Error Loading data...
                </Typography>
              }
              {modalContent && <>
                <form
                  method="POST"
                  onSubmit={handleSubmit}
                  name="tripModalForm"
                  encType="multipart/form-data"
                >
                  {error.message && <IonToast
                    isOpen={showToast}
                    message={error.message}
                    position="bottom"
                    cssClass="toast"
                    duration={800}
                  />}
              </form>
            </>}
          </div>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleSubmit} color="primary">
                Submit Details
              </Button>
            </DialogActions>
    </Dialog>}
    </>
  )
}

export default ToDoModal;
