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

function App() {
  // Note to self: React will only re-render if a state variable has been changed!
  const [input, setInput] = useState("");
  const [display, setDisplay] = useState([]); // array of dicts, grouping dyck char and selection state
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);
  const [manual, setManual] = useState(false); // For enabling/disabling "Pair Selected" button
  const [width, setWidth] = useState(1); // All Dyck words start with width 1
  const [maxWidth, setmaxWidth] = useState(1);
  const [strategy, setStrategy] = useState(""); // Holds route to the strategy method in the backend
  const [step, setStep] = useState(0); // Keeps track of the move we're on during a play
  const [movesDisplay, setmovesDisplay] = useState([]); // Each element contains move, width after move, and string after move
  const [run, setRun] = useState(false); // To swap between play pause functionality
  const [chosen, setChosen] = useState([]); // Holds indices of chosen brackets
  const [updateManual, setUpdate] = useState(false); // To trigger effect required for handlePair
  const [movesChanged, setmovesChanged] = useState(false); // When movesDisplay changes, we change this value to trigger an effect
  const [jumped, setJumped] = useState(false); // Boolean set when button clicked

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
    setManual(false);
    setWidth(1);
    setmaxWidth(1);
    setStrategy("");
    setStep(0);
    setmovesDisplay([]);
    setRun(false);
    setChosen([]);
    setUpdate(false);
    setmovesChanged(false);
    setJumped(false);
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
    // When the number of selected brackets changes, we always want to restrict or unrestrict, so we make this an effect
    console.log("Chosen changed: " + chosen);
    let newDisplay = [...display];
    // Flip it's state
    if (valid) {
      switch (chosen.length) {
        case 0:
          console.log("0 case");
          for (var i = 0; i < newDisplay.length; i++) {
            newDisplay[i].selected = false;
            if (newDisplay[i].char != "_") {
              newDisplay[i].removed = false;
            } else {
              newDisplay[i].removed = true;
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
              newDisplay[i].selected = false;
              newDisplay[i].removed = true;
            } else {
              newDisplay[i].selected = true;
              newDisplay[i].removed = false;
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
          setManual(true);
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

  const handlePair = async () => {
    // After removing the manually chosen pair, enable all valid choices again!
    let move = [];
    let pair = [];
    pair.push(chosen[0]);
    pair.push(chosen[1]);
    move.push(pair);
    let word = "";
    let newDisplay = [];
    if (step == 0) {
      console.log("Getting width from: " + pair);
      const response = await axios.post(route + "/api/moveWidth", {
        display,
        pair,
      });
      axios
        .post(route + "/api/moveWidth", {
          display,
          pair,
        })
        .then((response) => {
          const newWidth = response.data.new;
          move.push(newWidth);
          console.log("move and width after this selection: " + move);
          console.log("current display: " + display);
          for (var i = 0; i < display.length; i++) {
            word += display[i].char;
          }
          move.push(word);
          move.push(true);
          console.log("first one: " + move);
          // movesDisplay.push(move);
          // Instead of pushing, remove all other displayed options if manually selected in the middle of a run
          for (var j = 0; j < step; j++) {
            console.log("j = " + j + ", step = " + step);
            newDisplay.push(movesDisplay[j]);
          }
          newDisplay.push(move);
          setmovesDisplay(newDisplay);
          setUpdate(true);
        });
    } else {
      const current = movesDisplay[step - 1][1];
      axios
        .post(route + "/api/currentToNewWidth", {
          display,
          current,
          pair,
        })
        .then((response) => {
          const newWidth = response.data.new;
          move.push(newWidth);
          console.log("move and width after this selection: " + move);
          console.log("current display: " + display);
          for (var i = 0; i < display.length; i++) {
            word += display[i].char;
          }
          move.push(word);
          move.push(true);
          console.log("not the first one: " + move);
          // movesDisplay.push(move);
          // Instead of pushing, remove all other displayed options if manually selected in the middle of a run
          for (var j = 0; j < step; j++) {
            console.log("j = " + j + ", step = " + step);
            newDisplay.push(movesDisplay[j]);
          }
          newDisplay.push(move);
          setmovesDisplay(newDisplay);
          setUpdate(true);
        });
    }
    // After pairing everything up, re-enable
  };

  useEffect(() => {
    // When we choose two brackets manually and re-pair them, we need to display the result, and reset chosen.
    // However, setmovesDisplay(newDisplay); (see handlePair) schedules the update to happen at the next re-render cycle.
    // Solve this by using a state var that we modify when needed, which calls this effect.
    if (updateManual) {
      displayStep();
      setChosen([]);
      setUpdate(false);
    }
  }, [updateManual]);

  const handleDropdown = (event) => {
    // Sets the strategy to use once we click a menu items
    setStrategy(event.target.value);
  };

  const generateMoves = async () => {
    // Generate should take what we're displaying, and generate from there!
    // If we're generating from something selected, revert the selection:
    setChosen([]);
    setManual(false);
    console.log(route + strategy);
    axios
      .post(route + strategy, {
        display,
      })
      .then((response) => {
        const result = response.data.movesDisplay;
        for (var item in result) {
          // Each pairing will have a state to show if we've stepped on it yet or not.
          // false -> not seen
          // true -> seen but not removed
          // We remove when we move past the pairing
          result[item].push(false);
        }
        if (movesDisplay.length == 0) {
          // Means we're starting from the beginning. No steps or moves done yet
          setmovesDisplay(result);
        } else {
          // Means we already have moves generated. Remove everything after the move we're looking at
          let newDisplay = [];
          for (var i = 0; i < step; i++) {
            // Only remove things we're trying to keep!
            // Remove
            console.log(movesDisplay[i]);
            newDisplay.push(movesDisplay[i]);
          }
          for (var item in result) {
            newDisplay.push(result[item]);
          }
          setmovesDisplay(newDisplay);
        }
        setmovesChanged(true);
      });
  };

  const moveLabel = (index) => {
    // Generate the label given the index of the move
    let label = "";
    let pair = movesDisplay[index][0];
    let left = pair[0] + 1;
    let right = pair[1] + 1;
    let widthAfter = movesDisplay[index][1];
    label =
      "Move = (" + left + ", " + right + ") | Width after move = " + widthAfter;
    return label;
  };

  useEffect(() => {
    if (movesChanged) {
      for (var item in movesDisplay) {
        let label = moveLabel(item);
        console.log("label: " + label);
        movesDisplay[item].push(label);
      }
    }
    setmovesChanged(false);
  }, [movesChanged]);

  // Whenever width changes, check if its the max so far!
  useEffect(() => {
    if (width > maxWidth) {
      setmaxWidth(width);
    }
  }, [width]);

  // check what stage of current step we're on, display appropriate visuals, then update step if needed
  const displayStep = () => {
    // If something's selected, revert it before displaying from pre-existing steps
    const newDisplay = [...display];
    let left = movesDisplay[step][0][0]; // Index of left bracket to be paired
    let right = movesDisplay[step][0][1]; // Index of right bracket to be paired
    if (step != 0) {
      // We want to keep updating the move we're on, but only after we're past the first move
      movesDisplay[step - 1][3] = false;
    }
    if (movesDisplay[step][3] == false) {
      // We've not seen the move yet, so select the pair
      movesDisplay[step][3] = true;
      // newDisplay[left].selected = true;
      // newDisplay[right].selected = true;
      setChosen([left, right]);
      // setStep(step); Potentially needed for re-render, do not remove Y
    } else {
      // We have seen the move, so remove the pair and unselect the resulting "_"s
      newDisplay[left].char = "_";
      newDisplay[right].char = "_";
      // newDisplay[left].selected = false;
      // newDisplay[right].selected = false;
      // newDisplay[left].removed = true;
      // newDisplay[right].removed = true;
      setChosen([]);
      setWidth(movesDisplay[step][1]);
      setStep(step + 1);
    }
    setDisplay(newDisplay);
    if (manual) {
      setManual(false);
      setmovesChanged(true);
    }
  };

  const jumptoMove = (index) => {
    let newDisplay = [...display];
    console.log(newDisplay);
    let newWord = movesDisplay[index][2];
    // Change current step to false, and step we're jumping to false
    console.log("step: " + step + ", index: " + index);
    if (step == movesDisplay.length) {
      movesDisplay[step - 1][3] = false;
    } else {
      movesDisplay[step][3] = false;
    }
    movesDisplay[index][3] = false;
    for (var item in display) {
      let newChar = newWord.charAt(item);
      newDisplay[item].char = newChar;
    }
    setDisplay(newDisplay);
    setStep(index);
    setJumped(true);
  };

  useEffect(() => {
    // If step changed, change highlighted portion of display
    if (jumped) {
      displayStep();
      setJumped(false);
    }
  }, [jumped]);

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
                justifyContent: "center",
                gap: "2vmin",
              }}
            >
              <Button
                variant="contained"
                onClick={handlePair}
                disabled={
                  // Make sure to add constrant if we have 2 legal pair selected!
                  manual && chosen.length == 2 ? false : true
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
                // className={`${move[3] ? "selected" : "inherit"}`}
                onClick={() => jumptoMove(index)} // Eventually change to jumpToMove
                sx={{
                  margin: "5px 0",
                  padding: "10px",
                  border: "1px solid gray",
                  width: "100%",
                  cursor: "pointer",
                  color: (theme) =>
                    move[3] == true ? "red" : theme.palette.primary.main,
                  fontWeight: move[3] == true ? "bold" : "normal",
                  ":hover": {
                    bgcolor: (theme) =>
                      move[3] == true ? "#FFE9E9" : "#E9E9FF", // Optional: Adjust hover background color
                  },
                }}
              >
                {`${index + 1}: ${move[4]}`}
              </Button>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default App;
