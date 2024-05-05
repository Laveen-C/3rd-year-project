import { useState, useEffect } from 'react'
import { Grid, Box, Button, TextField, Typography } from '@mui/material';
import './App.css'
import axios from "axios";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function App() {
  const [input, setInput] = useState('');
  const [display, setDisplay] = useState([]);

  const handleSubmit = () => {
    const charArray = input.split('').map((char) => ({ char, selected: false }));
    setDisplay(charArray);
  };

  const handleInput = (event) => {
    setInput(event.target.value);
  };

  const toggleSelect = (index) => {
    const newDisplay = [...display];
    newDisplay[index].selected = !newDisplay[index].selected;
    setDisplay(newDisplay);
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
        <Box style={{ padding: '2vmin', display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, flexWrap: 'wrap', overflowY: 'auto' }}>
          {display.map((item, index) => (
            <span
              key={index}
              onClick={() => {toggleSelect(index); console.log(display);}} // Printing char array for test! Currently a dictionary from char to bool (true if char selected by user)
              className={`displayText ${item.selected ? 'selected' : ''}`}
              // style={{ cursor: 'pointer', fontFamily: "'Courier New', Courier, monospace", fontSize: '8vw' }}
            >
              {item.char}
            </span>
          ))}
        </Box>
        <Box style={{ padding: '2vmin', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" style={{ textAlign: 'center', justifyContent: 'center' }}>
            Width Counter: {/* Display width calculation here */}
          </Typography>
        </Box>
      </Grid>
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
