import React from 'react';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

//import { MemoryRouter as Router } from 'react-router';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    backButton: {
      marginRight: theme.spacing(2),
      color: theme.palette.secondary.light
    },
    title: {
      margin: "auto"
    },
    endButtons: {
      color: theme.palette.secondary.light,
      marginLeft: theme.spacing(2),
    },
  }),
);


type HeaderProps = {
    heading: string,
    isHome: boolean
}

const Header: React.FC<HeaderProps> = (props: any) => {
  const classes = useStyles();

  return (
    <Toolbar>
      {!props.isHome && (
        <IconButton
            edge="start"
            className={classes.backButton}
            component={Link}
            to={props.backPath}>
            <ArrowBackIcon />
        </IconButton>
      )}
      <Typography className={classes.title}>{props.heading}</Typography>
      {!props.isHome && (<IconButton
          className={classes.endButtons}
          edge="end"
          component={Link}
          to={"/break"}>
          <AccessTimeIcon />
      </IconButton>)}
    </Toolbar>
  )
}

export default Header;
