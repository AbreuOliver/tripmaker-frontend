import React from 'react';
import '@fontsource/roboto';

import { BrowserRouter as Router} from 'react-router-dom'; 

import { createTheme, ThemeProvider } from '@material-ui/core/styles';

import CustomSwitch from './components/Switch';

import RunContextProvider from './contexts/RunContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
//import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import CSS from 'csstype';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00838f',
      light: '#4fb3bf',
      dark: '#005662'
    },
    secondary: {
      main: '#90a4ae',
      light: '#c1d5e0',
      dark: '#62757f'
    },
    warning: {
      main: '#ED6C02',
      light: '#ff9800',
      dark: '#e65100'
    }
  }
});


const App: React.FC = () => {
	const body: CSS.Properties = {
		backgroundColor: '#ddd',
    minHeight: '100vh',
	};

	return (
		<ThemeProvider theme={theme}>
      <div style={body}>
        <Router>
          <RunContextProvider>
            <CustomSwitch />
          </RunContextProvider>
        </Router>
      </div>
		</ThemeProvider>
	);
}
export default App;
