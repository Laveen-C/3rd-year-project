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
  const [strategy, setStrategy] = useState(""); // Holds route to the strategy method in the backend
  const [moves, setMoves] = useState([]); // Moves to re-pair the current word
  const [step, setStep] = useState(0); // Keeps track of the move we're on during a play

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
    setMoves([]);
    setStep(0);
  };

  const handleSubmit = async () => {
    // When the submit button is pressed, we want to validate then display
    const response = await axios.post(route + "/api/validate", {
      input,
    });
    // If input was valid, we have no error, set valid to true, and construct the charArray for manual selection
    if (response.data.isValid) {
      setError("");
      setValid(true);
      const charArray = input
        .split("")
        .map((char) => ({ char, selected: false, removed: false }));
      setDisplay(charArray);
      setMoves([]);
    } else {
      setError(response.data.message);
      clearState;
    }
  };

  const handleInput = (event) => {
    // For updating the text displayed within the input field
    setInput(event.target.value);
  };

  const toggleSelect = (index) => {
    // For updating colour (and eventually a valid selection state) on selected characters
    // We only want to allow manual re-pairing when the input is valid!
    if (valid) {
      console.log(display);
      const newDisplay = [...display];
      console.log(newDisplay);
      newDisplay[index].selected = !newDisplay[index].selected;
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
    const result = response.data.moves;
    for (var item in result) {
      // Each pairing will have a state to show if we've stepped on it yet or not.
      // false -> not seen
      // true -> seen but not removed
      // We remove when we move past the pairing
      result[item].push(false);
    }
    setMoves(result);
    setStep(0);
    console.log(moves);
  };

  // Pass an index in, check if it's displayed or not, and make the next move
  const displayStep = () => {
    const newDisplay = [...display];
    let left = moves[step][0]; // Index of left bracket to be paired
    let right = moves[step][1]; // Index of right bracket to be paired
    if (moves[step][2] == false) {
      // We've not seen the move yet
      moves[step][2] = true;
      newDisplay[left].selected = true;
      newDisplay[right].selected = true;
      setStep(step);
    } else {
      // We have seen the move
      newDisplay[left].char = "_";
      newDisplay[right].char = "_";
      newDisplay[left].removed = true;
      newDisplay[right].removed = true;
      setStep(step + 1);
    }
    setDisplay(newDisplay);
  };

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
                className={`character ${
                  item.selected && !item.removed ? "selected" : ""
                } ${item.removed ? "removed" : ""}`}
                onClick={() => {
                  toggleSelect(index);
                }}
                style={{
                  cursor: "pointer",
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
          }}
        >
          {valid ? (
            <Typography
              variant="h6"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              Width Counter: {width}
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
      <Grid item xs={4}>
        {/* All I/O and strategy selection */}
        <Box style={{ padding: "2vmin", paddingBottom: "1vmin" }}>
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
                  valid && moves.length != 0 && step < moves.length
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
        <Box style={{ flexGrow: 1, padding: "2vmin", paddingTop: "1.5vmin" }}>
          <Typography variant="h6">Re-Pairing moves</Typography>
          {/* This is where the moves of the game so far will be displayed */}
        </Box>
      </Grid>
    </Grid>
  );
}

export default App;
