import Typography from '@material-ui/core/Typography';
import React from 'react';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  paperFooter: {
    padding: ".5em",
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0
  }
}));

const Footer: React.FC = () => {
    const classes = useStyles();

    return (
      <Paper elevation={3} className={classes.paperFooter}>
        <Typography align="center">
          ITRE - Copyrights reserved @2021
        </Typography>
      </Paper>
    )
}

export default Footer;
