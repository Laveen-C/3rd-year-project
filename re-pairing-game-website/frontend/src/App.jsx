import { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Button,
  ButtonGroup,
  Slider,
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

// const clearState = () => {
//   setValid(false);
//   setWidth(1);
//   setmaxWidth(1);
//   setStrategy("");
//   setStep(0);
//   setmovesDisplay([]);
//   setRun(false);
//   setChosen([]);
// };

function App() {
  // Note to self: React will only re-render if a state variable has been changed!
  const [input, setInput] = useState("");
  const [display, setDisplay] = useState([]); // array of dicts, grouping dyck char and selection state
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);
  const [width, setWidth] = useState(1); // All Dyck words start with width 1
  const [maxWidth, setmaxWidth] = useState(1);
  const [strategy, setStrategy] = useState(""); // Holds route to the strategy method in the backend
  const [step, setStep] = useState(0); // Keeps track of the move we're on during a play
  const [movesDisplay, setmovesDisplay] = useState([]); // Each element contains move, width after move, and string after move
  const [run, setRun] = useState(false); // To swap between play pause functionality
  const [pairable, setPairable] = useState(false); // Shows if we have 2 legal manual options chosen
  const [chosen, setChosen] = useState([]); // Holds indices of chosen brackets

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
    setmaxWidth(1);
    setStrategy("");
    setStep(0);
    setmovesDisplay([]);
    setRun(false);
    setChosen([]);
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
    // Restricting is done by ZERO LEVELS!
    // Cases:
    // We selected a bracket
    // - first bracket => restrict
    // - second bracket => restrict all but those
    // - anything else => not allowed

    // But if we unselect a bracket
    // - Unrestrict brackets

    // const newDisplay = [...display];
    // // Flip it's state
    // newDisplay[index].selected = !newDisplay[index].selected;
    let newDisplay = [...display];
    newDisplay[index].selected = !newDisplay[index].selected;
    const choice = newDisplay[index].selected;
    setDisplay(newDisplay);
    modifyChosen(index, choice);
  };

  useEffect(() => {
    console.log("Chosen changed: " + chosen);
    let newDisplay = [...display];
    // Flip it's state
    if (valid) {
      switch (chosen.length) {
        case 0:
          console.log("0 case");
          for (var i = 0; i < newDisplay.length; i++) {
            if (newDisplay[i].char != "_") {
              newDisplay[i].removed = false;
            }
          }
          setDisplay(newDisplay);
          break;
        case 1:
          console.log("1 case");
          const restrictFrom = chosen[0];
          console.log(restrictFrom);
          axios
            .post(route + "/api/manualChoices", {
              display,
              restrictFrom,
            })
            .then((response) => {
              const result = response.data.disable;
              // Disable all chars for each index of result
              for (var i = 0; i < newDisplay.length; i++) {
                if (result.includes(i)) {
                  newDisplay[i].removed = true;
                } else {
                  newDisplay[i].removed = false;
                }
              }
              setDisplay(newDisplay);
            });
          break;
        case 2:
          console.log("2 case");
          for (var i = 0; i < newDisplay.length; i++) {
            if (!chosen.includes(i)) {
              newDisplay[i].removed = true;
            }
          }
          setDisplay(newDisplay);
          break;
      }
    }
  }, [chosen]);

  const modifyChosen = (index, choice) => {
    console.log("chosen length " + chosen.length);
    let newArr = [];
    switch (chosen.length) {
      case 0:
        // Nothing chosen yet, so we must be selecting
        newArr = [index];
        break;
      case 1:
        // One element exists. Are we removing or adding?
        if (choice) {
          if (display[index].char == "(") {
            newArr = [index, chosen[0]];
          } else {
            newArr = [chosen[0], index];
          }
        } else {
          newArr = [];
        }
        break;
      case 2:
        // Already chosen 2, so we must be unselecting
        newArr = chosen.filter((pos) => pos != index);
        break;
    }
    setChosen(newArr);
  };

  const handlePair = () => {
    // After removing the manually chosen pair, enable all valid choices again!
    if (chosen.length == 2) {
    }
  };

  const handleDropdown = (event) => {
    // Sets the strategy to use once we click a menu items
    setStrategy(event.target.value);
  };

  const generateMoves = async () => {
    // Called when we click the "GENERATE" button after selecting a strategy
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
      if (step != 0) {
        // We want to keep updating the move we're on, but only after we're past the first move
        movesDisplay[step - 1][3] = false;
      }
      movesDisplay[step][3] = true;
      newDisplay[left].selected = true;
      newDisplay[right].selected = true;
      // setStep(step); Potentially needed for re-render, do not remove Y
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

  // For each re-pairing move, we want to generate appropriate button text
  const generateMoveButton = (move) => {
    const stepNo = 1;
    const step = move[0];
    const stepWidth = move[1];
    const text = "";
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
                  if (!item.removed && valid) {
                    toggleSelect(index);
                  }
                }}
                style={{
                  cursor: item.removed ? "not-allowed" : "pointer",
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
            {/* Pair chosen, step, play/pause */}
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
                onClick={handlePair}
                disabled={
                  // Make sure to add constrant if we have 2 legal pair selected!
                  valid && chosen.length == 2 ? false : true
                }
              >
                Pair Selected
              </Button>
              <Button
                variant="contained"
                onClick={displayStep}
                disabled={
                  movesDisplay.length != 0 && step < movesDisplay.length
                    ? false
                    : true
                }
              >
                Step
              </Button>
              <ButtonGroup
                variant="contained"
                disabled={movesDisplay.length == 0}
              >
                <Button
                  disabled={run ? true : false}
                  onClick={() => {
                    setRun(true);
                  }}
                >
                  Play
                </Button>
                <Button
                  disabled={!run ? true : false}
                  onClick={() => {
                    setRun(false);
                  }}
                >
                  Pause
                </Button>
              </ButtonGroup>
            </Box>
            <Box
              style={{
                padding: "1vmin",
                display: "flex",
                alignItems: "center",
                gap: "2vmin",
              }}
            >
              <Slider
                defaultValue={30}
                step={10}
                marks
                min={10}
                max={110}
                disabled
              />
            </Box>
          </Box>
        </Box>
        {/* Re-pairing move list */}
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            overflow: "hidden",
            padding: "2vmin",
            borderLeft: "2px solid black",
            borderTop: "2px solid black",
          }}
        >
          <Typography variant="h6">Re-Pairing moves</Typography>
          {/* This is where the moves of the game so far will be displayed */}
          <Box
            style={{
              display: "flex",
              flexGrow: 1,
              flexDirection: "column",
              padding: "2vmin",
              height: "100%",
              overflowY: "auto",
            }}
          >
            {movesDisplay.map((move, index) => (
              <Button
                key={index}
                value={index}
                onClick={() => console.log(move)}
                style={{
                  margin: "5px 0",
                  padding: "10px",
                  border: "1px solid gray",
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                {`${index + 1}: ${move.join(", ")}`}
              </Button>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default App;
