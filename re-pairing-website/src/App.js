import React, { useState, useEffect, useRef } from 'react';
import { Button, MenuItem, TextField} from '@mui/material';

import './App.css';

const App = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [trees, setTrees] = useState('');

  const DisplayResult = ({ result }) => {
    return <p>{result}</p>;
  };

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  const handleAlgoChange = (event) => {
    var value = event.target.value;

    switch (value) {
      case 1: // Simple case
        simple();
      case 2: // Non-simple recursive case
      
      case 3: // Greedy by length case
    }
  }

  const handleClick = () => {
    var temp = validateInput();
    temp.then((valid) => {
      if (valid) {
        console.log("PLACEHOLDER FOR TREE");
        defineTree();
      }
    })
  };

  const defineTree = async () => {
    try {
        const treeResponse = await fetch('http://127.0.0.1:5000/api/tree', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input }),
        });
        const treeData = await treeResponse.json();
        setTrees(treeData.trees);
        console.log(treeData.trees);
      } catch (error) {
      console.error(error);
    }
  };

  const simple = async () => { // Obtains a 2D array of re-pairing steps when the simple button is pressed 
    try {
      const simpleResponse = await fetch('http://127.0.0.1:5000/api/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
      const simpleData = await simpleResponse.json();
      console.log(simpleData.steps); // Test output in console
    } catch (error) {
      console.log(error);
    }
  };

  const runSteps = () => {

  }

  // FLASK TEST CODE
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch('http://127.0.0.1:5000/api/test');
  //       const data = await response.json();
  //       console.log(data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const validateInput = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      setResult(data.message);
      return data.isValid;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">

      <div className='displayWindow'> 
        {result && <DisplayResult result={result} />}
      </div>

      <div className='controlWindow'>
        <div className = 'padding'></div>

        <div id='input-plane'>
          <h1 className='plane-title'>Input and Algorithms</h1>

          <div className='input-field'>
            <div className='input-field-textbox'>
            <TextField 
              fullWidth 
              size = "small" 
              className="h-20" 
              label="Enter Dyck Word here" 
              value = {input} 
              onChange = {handleChange}/>
            </div>

            <div className='inline w-15'></div>
            <Button className='h-40' variant='contained' onClick = {handleClick}> Submit </Button>

            {/* <div className='buttonP'>
            <Button className='h-40' variant='contained' onClick = {simple}> Simple </Button>
            </div>
            <div className='buttonP'>
            <Button className='h-40' variant='contained'> Non-simple recursive </Button>
            </div> */}

            <div className='buttonP'>
              <TextField
                select
                fullWidth
                id="algorithm-menu"
                label="Select re-pairing algorithm"
                defaultValue=""
                
              >
                // onChange={handleChange} WHAT TO DO WHEN ALGO IS CHOSEN 
                <MenuItem value={1}>Simple</MenuItem>
                <MenuItem value={2}>Non-Simple Recursive</MenuItem>
                <MenuItem value={3}>Greedy (by length)</MenuItem>
              </TextField>
            </div>

            <div className='buttonP'>
            <Button className='h-40' variant='contained'> Step </Button>
            </div>

          </div>

        </div>

        <div id='tree-display-plane'>
          <h1 className='plane-title'>Tree Display</h1>
        </div>

      </div>
    </div>
  );
}

export default App;
