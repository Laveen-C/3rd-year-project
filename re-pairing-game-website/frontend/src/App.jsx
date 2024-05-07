import { useState, useEffect } from 'react'
import { Grid, Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import './App.css'
import axios from "axios";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function App() {
  const [input, setInput] = useState('');
  const [display, setDisplay] = useState([]); // Dyck words held as an array of dicts, grouping char and selection state
  const [error, setError] = useState('');
  const [valid, setValid] = useState(false); 
  const [width, setWidth] = useState(1); // All Dyck words start with width 1
  const [strategy, setStrategy] = useState('');
  const [moves, setMoves] = useState([]); // Moves to re-pair the current word 

  const strategies = [
    { value: 'bruteForce', label: 'Brute Force' },
    { value: 'simple', label: 'Simple' },
    { value: 'non-simple', label: 'Non-Simple Recursive' },
    { value: 'greedy', label: 'Greedy' }
  ];

  useEffect(() => { // For displaying errors (if there is one)
    if (error != '') {
      setDisplay(["Error: ", error]);
    }
  }, [error]);

  const handleSubmit = async () => { // When the submit button is pressed, this is called
    const response = await axios.post('http://localhost:8080/api/validate', { input }); // Error msg returned from validation
    if (response.data.isValid) {
      setError('');
      setValid(true);
      const charArray = input.split('').map((char) => ({ char, selected: false }));
      setDisplay(charArray);
    }
    else {
      setError(response.data.message);
      setValid(false)
      setDisplay([]);
    }
    setWidth(1);
    setMoves([]);
  };

  const handleInput = (event) => { // For updating the text displayed within the input field
    setInput(event.target.value);
  };

  const toggleSelect = (index) => { // For updating colour (and eventually a valid selection state) on selected characters
    // We only want to allow manual re-pairing when the input is valid!
    if (valid) {
      const newDisplay = [...display];
      newDisplay[index].selected = !newDisplay[index].selected;
      setDisplay(newDisplay);
    }
  };

  const handleDropdown = (event) => {
    setStrategy(event.target.value);
  };

  const generateMoves = async () => {
    const response = await axios.post('http://localhost:8080/api/simple', { display }); 
    const resultmoves = [];
    console.log(display);
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
      <Grid item xs={8} style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
        <Box style={{ padding: '2vmin', display: 'flex', textAlign: 'center', alignItems: 'center', justifyContent: 'center', flexGrow: 1, flexWrap: 'wrap', overflowY: 'auto' }}>
          {error != '' ? (
            <Typography variant="h6" style={{ color: 'red', fontFamily: "'Courier New', Courier, monospace", fontSize: '5vw' }}>
              {error}
            </Typography>
          ) : (
            display.map((item, index) => (
              <span
                key={index}
                className={`character ${item.selected ? 'selected' : ''}`}
                onClick={() => { toggleSelect(index); console.log(display); }}
                style={{ cursor: valid ? 'pointer' : 'not-allowed', fontFamily: "'Courier New', Courier, monospace", fontSize: '8vw' }}
              >
                {item.char}
              </span>
            )))
          }
        </Box>
        <Box style={{ padding: '2vmin', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {valid ? (
            <Typography variant="h6" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Width Counter: {width}
            </Typography>
          ) : (
            <Typography variant="h6" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Submit a valid Dyck word to begin playing the game!
            </Typography>
          )
          }
        </Box>
      </Grid>

      {/* I/O, strategies, and moves */}
      <Grid item xs={4}>
        {/* Input field and submit button */}
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
          {/* Strategy selection and move generation */}
          <Box style={{ padding: '2vmin', display: 'flex', alignItems: 'center', gap: '2vmin' }}>
            <FormControl style={{ flexGrow: 1 }} >
              <InputLabel>Choose a strategy</InputLabel>
              <Select value={strategy} label="Choose a strategy" onChange={handleDropdown}>
                {/* Takes strategy names from the 'strategies' list, and sets each one as an option in the dropdown menu */}
                {strategies.map((strategy) => (
                  <MenuItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={generateMoves}>
              Generate
            </Button>
          </Box>
        </Box>
        <Box style={{ flexGrow: 1, padding: '2vmin' }}>
          <Typography variant="h6">Re-Pairing moves</Typography>
          {/* This is where the moves of the game so far will be displayed */}
        </Box>
      </Grid>

    </Grid>
  )
}

export default App 
