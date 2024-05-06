import { useState, useEffect } from 'react'
import { Grid, Box, Button, TextField, Typography } from '@mui/material';
import './App.css'
import axios from "axios";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function App() {
  const [input, setInput] = useState('');
  const [display, setDisplay] = useState([]);
  const [error, setError] = useState('');
  const [manual, setManual] = useState(false); // By default manual mode is off
  const [width, setWidth] = useState(1);

  useEffect(() => { // For displaying errors (if there is one)
    if (error != ''){
      setDisplay(["Error: ", error]);
    }
  } ,[error]);

  const handleSubmit = async () => {
      const response = await axios.post('http://localhost:8080/api/validate', { input }); // Error msg returned from validation
      // console.log(response.data.isValid);
      if (response.data.isValid) {
        setError('');
        setManual(true);
        const charArray = input.split('').map((char) => ({ char, selected: false }));
        setDisplay(charArray);
        console.log("yippee");
      }
      else {
        setError(response.data.message);
        setManual(false)
        setDisplay([]);
      }
  };

  const handleInput = (event) => {
    setInput(event.target.value);
  };

  const toggleSelect = (index) => {
    if (manual) {
      const newDisplay = [... display];
      newDisplay[index].selected = !newDisplay[index].selected;
      setDisplay(newDisplay);
    }
  };
  
  // // BACKEND TEST CODE
  // const testBackend = async () => {
  //   const response = await axios.get("http://localhost:8080/api/test")
  //   console.log(response.data.test);
  // }

  // useEffect (() => {
  //   testBackend();
  // }, [])

  return (
    <Grid container style={{ height: '100vh', width: '100vw' }}>
      <Grid item xs={8} style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh'}}>
        <Box style={{ padding: '2vmin', display: 'flex', textAlign: 'center', alignItems: 'center', justifyContent: 'center', flexGrow: 1, flexWrap: 'wrap', overflowY: 'auto' }}>
          {error != '' ? (
            <Typography variant="h6" style={{ color: 'red', fontFamily: "'Courier New', Courier, monospace", fontSize: '5vw' }}>
              {error}
            </Typography>
            ) : (
            display.map((item, index) => (
              <span
                key={index}
                className={`character ${item.selected ? 'selected': '' }`}
                onClick={() => {toggleSelect(index); console.log(display);}}
                style={{ cursor: manual ? 'pointer' : 'not-allowed', fontFamily: "'Courier New', Courier, monospace", fontSize: '8vw'}}
              >
                {item.char}
              </span>
            )))
          }
        </Box>
        <Box style={{ padding: '2vmin', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {display.length != 0 ? (
            <Typography variant="h6" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Width Counter: {width}
              {console.log(display)}
            </Typography>
          ) : (
            <Typography variant="h6" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Submit a Dyck word to begin playing the game!
            </Typography>
          )
          }
        </Box>
      </Grid>

      {/* I/O, strategies, and moves */}
      <Grid item xs={4}>
        <Box style={{ padding: '2vmin' }}>
          <Typography variant="h6">Input and Algorithms</Typography>
          <Box style={{ padding: '2vmin', display: 'flex', alignItems: 'center', gap: '2vmin' }}>
            <TextField
              label="Enter Dyck word here"
              variant="outlined"
              value={input}
              onChange={handleInput}
              style={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button> 
          </Box>
        </Box>
        <Box style={{ flexGrow: 1, padding: '2vmin' }}>
          <Typography variant="h6">Re-Pairing moves</Typography>
          {/* This is where the steps of the game so far will be displayed */}
        </Box>
      </Grid>

    </Grid>
  )
}

export default App 
