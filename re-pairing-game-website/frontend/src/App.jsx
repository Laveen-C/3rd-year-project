import { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import "./App.css";
import axios from "axios";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

function App() {
  // Note to self: React will only re-render if a state variable has been changed!
  const [input, setInput] = useState("");
  const [display, setDisplay] = useState([]); // Dyck words held as an array of dicts, grouping char and selection state
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);
  const [width, setWidth] = useState(1); // All Dyck words start with width 1
  const [maxWidth, setmaxWidth] = useState(1);
  const [strategy, setStrategy] = useState(""); // Holds route to the strategy method in the backend
  const [step, setStep] = useState(0); // Keeps track of the move we're on during a play
  const [movesDisplay, setmovesDisplay] = useState([]); // Each element contains move, width after move, and string after move

  const route = "http://localhost:8080";

  // keys for menu items, labels for text within menu items, routes for calling backend functions
  const strategies = [
    {
      key: "bruteForce",
      label: "Brute Force",
      route: "/api/bruteForce",
    },
    {
      key: "simple",
      label: "Simple",
      route: "/api/simple",
    },
    {
      key: "greedy",
      label: "Greedy",
      route: "/api/greedy",
    },
    {
      key: "non-simple",
      label: "Non-Simple Recursive",
      route: "/api/nonSimple",
    },
  ];

  // // BACKEND TEST CODE
  // const testBackend = async () => {
  //   const response = await axios.get("http://localhost:8080/api/test")
  //   console.log(response.data.test);
  // }

  // useEffect (() => {
  //   testBackend();
  // }, [])

  useEffect(() => {
    // For displaying errors (if there is one)
    if (error != "") {
      setDisplay(["Error: ", error]);
    }
  }, [error]);

  // When an error has been encountered e.g. on submission, reset these state vars to default
  // We want to keep any error message being displayed, and keep the text in the input field
  const clearState = () => {
    setValid(false);
    setWidth(1);
    setStrategy("");
    setStep(0);
    setmovesDisplay([]);
    setmaxWidth(1);
  };

  const handleSubmit = async () => {
    // When the submit button is pressed, we want to validate then display
    const response = await axios.post(route + "/api/validate", {
      input,
    });
    // If input was valid, we have no error, set valid to true, and construct the charArray for manual selection
    clearState();
    if (response.data.isValid) {
      setError("");
      setValid(true);
      const charArray = input
        .split("")
        .map((char) => ({ char, selected: false, removed: false }));
      setDisplay(charArray);
      setmovesDisplay([]);
    } else {
      setError(response.data.message);
      setDisplay(["Error: ", error]);
    }
  };

  const handleInput = (event) => {
    // For updating the text displayed within the input field
    setInput(event.target.value);
  };

  const toggleSelect = (index) => {
    // For updating colour (and eventually a valid selection state) on selected characters
    // We only want to allow manual re-pairing when the input is valid!
    if (valid && display[index].char != "_") {
      const newDisplay = [...display];
      newDisplay[index].selected = !newDisplay[index].selected;
      console.log(newDisplay);
      setDisplay(newDisplay);
    }
  };

  const handleDropdown = (event) => {
    setStrategy(event.target.value);
  };

  const generateMoves = async () => {
    console.log(route + strategy);
    const response = await axios.post(route + strategy, {
      display,
    });
    const result = response.data.movesDisplay;
    for (var item in result) {
      // Each pairing will have a state to show if we've stepped on it yet or not.
      // false -> not seen
      // true -> seen but not removed
      // We remove when we move past the pairing
      result[item].push(false);
    }
    setmovesDisplay(result);
    setStep(0);
    console.log(movesDisplay);
  };

  // Whenever width changes, check if its the max so far!
  useEffect(() => {
    if (width > maxWidth) {
      console.log("ITS BIGGER");
      setmaxWidth(width);
    }
  }, [width]);

  // Pass an index in, check if it's displayed or not, and make the next move
  const displayStep = () => {
    const newDisplay = [...display];
    let left = movesDisplay[step][0][0]; // Index of left bracket to be paired
    let right = movesDisplay[step][0][1]; // Index of right bracket to be paired
    if (movesDisplay[step][3] == false) {
      // We've not seen the move yet, so select the pair
      movesDisplay[step][3] = true;
      newDisplay[left].selected = true;
      newDisplay[right].selected = true;
      setStep(step);
    } else {
      // We have seen the move, so remove the pair and unselect the resulting "_"s
      newDisplay[left].char = "_";
      newDisplay[right].char = "_";
      newDisplay[left].selected = false;
      newDisplay[right].selected = false;
      newDisplay[left].removed = true;
      newDisplay[right].removed = true;
      setWidth(movesDisplay[step][1]);
      setStep(step + 1);
    }
    setDisplay(newDisplay);
  };

  const jumptoMove = () => {};

  return (
    <Grid container style={{ height: "100vh", width: "100vw" }}>
      <Grid
        item
        xs={8}
        style={{ display: "flex", flexDirection: "column", maxHeight: "100vh" }}
      >
        <Box
          style={{
            padding: "2vmin",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            flexWrap: "wrap",
            overflowY: "auto",
            borderRight: "2px solid black",
            borderBottom: "2px solid black",
          }}
        >
          {/* Invalid -> Display error message, otherwise display Dyck word with manual interaction */}
          {!valid ? (
            <Typography
              variant="h6"
              style={{
                color: "red",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "5vw",
              }}
            >
              {error}
            </Typography>
          ) : (
            // Map each char in Dyck word to a span element that changes colour and 'selected' state when clicked
            display.map((item, index) => (
              <span
                key={index}
                className={`character 
                ${item.selected && !item.removed ? "selected" : ""} 
                ${item.removed ? "removed" : ""}
                `}
                onClick={() => {
                  toggleSelect(index);
                }}
                style={{
                  cursor: "pointer",
                  transition: "all .25s ease",
                }}
              >
                {item.char}
              </span>
            ))
          )}
        </Box>
        <Box
          style={{
            padding: "2vmin",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "2px solid black",
            borderTop: "2px solid black",
          }}
        >
          {valid ? (
            <Typography
              variant="h6"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              Current Width: {width}, Max Width: {maxWidth}
            </Typography>
          ) : (
            <Typography
              variant="h6"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              Submit a valid Dyck word to begin playing the game!
            </Typography>
          )}
        </Box>
      </Grid>

      {/* I/O, strategies, and moves */}
      <Grid
        item
        xs={4}
        style={{ display: "flex", flexDirection: "column", maxHeight: "100vh" }}
      >
        {/* All I/O and strategy selection */}
        <Box
          style={{
            padding: "2vmin",
            paddingBottom: "1vmin",
            borderLeft: "2px solid black",
            borderBottom: "2px solid black",
          }}
        >
          <Typography variant="h6">Input and Algorithms</Typography>
          {/* Input Field and submit button*/}
          <Box style={{ paddingTop: "1vmin" }}>
            <Box
              style={{
                padding: "1vmin",
                display: "flex",
                alignItems: "center",
                gap: "2vmin",
              }}
            >
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
            <Box
              style={{
                padding: "1vmin",
                display: "flex",
                alignItems: "center",
                gap: "2vmin",
              }}
            >
              <FormControl style={{ flexGrow: 1 }}>
                <InputLabel>Choose a strategy</InputLabel>
                <Select
                  value={strategy}
                  label="Choose a strategy"
                  onChange={handleDropdown}
                >
                  {/* Sets each strategy from the 'strategies' list as a dropdown menu item */}
                  {strategies.map((strategy) => (
                    <MenuItem key={strategy.key} value={strategy.route}>
                      {strategy.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={generateMoves}
                disabled={valid && strategy != "" ? false : true}
              >
                Generate
              </Button>
            </Box>
            {/* Step, Run, Pause and Slider */}
            <Box
              style={{
                padding: "1vmin",
                display: "flex",
                alignItems: "center",
                gap: "2vmin",
              }}
            >
              <Button
                variant="contained"
                onClick={displayStep}
                disabled={
                  valid &&
                  movesDisplay.length != 0 &&
                  step < movesDisplay.length
                    ? false
                    : true
                }
              >
                Step
              </Button>
            </Box>
          </Box>
        </Box>
        {/* Re-pairing move list */}
        <Box
          style={{
            padding: "2vmin",
            borderLeft: "2px solid black",
            borderTop: "2px solid black",
          }}
        >
          <Typography variant="h6">Re-Pairing moves</Typography>
          {/* This is where the moves of the game so far will be displayed */}
          <Box
            style={{
              padding: "2vmin",
              display: "flex",
              flexGrow: 1,
              flexWrap: "wrap",
              flexDirection: "column",
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
            }}
          >
            {movesDisplay.map((move, index) => (
              <Box
                key={index}
                onClick={() => console.log(move)}
                style={{
                  margin: "5px 0",
                  padding: "10px",
                  border: "1px solid gray",
                  cursor: "pointer",
                }}
              >
                {move}
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default App;
