import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import AirportShuttleIcon from '@material-ui/icons/AirportShuttle';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.primary.main
  },
}));

interface TabsProps {
  ChangeHandler: (newValue: number) => void
}

export default function CenteredTabs(Props: TabsProps) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    Props.ChangeHandler(newValue);
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="fullWidth"
        centered
      >
        <Tab 
          label="To Do" 
          icon={<AirportShuttleIcon/>} />
        <Tab 
          label="Finished" 
          icon={<DoneAllIcon />} />
      </Tabs>
    </div>
  );
}

