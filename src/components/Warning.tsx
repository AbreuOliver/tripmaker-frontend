import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: '800px',
    margin: 'auto',
    backgroundColor: theme.palette.warning.dark,
    color: '#fff',
  },
}));


const Warning: React.FC<any> = ({ title, message }) => {
  const classes = useStyles();

  return (
    <Box m={2}>
      <Card className={classes.root}>
        <CardHeader title={title} />
        <Box p={2}>
          <CardContent style={{padding: 0}}>
            <Typography>
              {message}
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Box>
  )
}

export default Warning;
