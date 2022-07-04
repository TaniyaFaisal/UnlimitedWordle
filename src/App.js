import './App.css';

import React, { useEffect, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Keyboard from './components/Keyboard';
import Modal from '@mui/material/Modal';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { wordList } from './constants/data';

const App = () => {
  const [boardData, setBoardData] = useState(JSON.parse(localStorage.getItem("board-data")));
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorStatus, setErrorStatus] = useState(false);
  const [charArray, setCharArray] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const resetBoard = () => {
    var alphabetIndex = Math.floor(Math.random() * 26);
    var wordIndex = Math.floor(Math.random() * wordList[String.fromCharCode(97 + alphabetIndex)].length);
    let newBoardData = {
      ...boardData, "solution": wordList[String.fromCharCode(97 + alphabetIndex)][wordIndex],
      "rowIndex": 0,
      "boardWords": [],
      "boardRowStatus": [],
      "presentCharArray": [],
      "absentCharArray": [],
      "correctCharArray": [],
      "status": "IN_PROGRESS"
    };
    setBoardData(newBoardData);
    localStorage.setItem("board-data", JSON.stringify(newBoardData));
  }


  useEffect(() => {
    if (!boardData || !boardData.solution) {
      var alphabetIndex = Math.floor(Math.random() * 26);
      var wordIndex = Math.floor(Math.random() * wordList[String.fromCharCode(97 + alphabetIndex)].length);
      let newBoardData = {
        ...boardData, "solution": wordList[String.fromCharCode(97 + alphabetIndex)][wordIndex],
        "rowIndex": 0,
        "boardWords": [],
        "boardRowStatus": [],
        "presentCharArray": [],
        "absentCharArray": [],
        "correctCharArray": [],
        "status": "IN_PROGRESS"
      };
      setBoardData(newBoardData);
      localStorage.setItem("board-data", JSON.stringify(newBoardData));
    }
  }, []);

  const handleMessage = (message) => {
    setMessage(message);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }

  const handleError = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
    }, 2000);
  }

  const handleErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 3000);
  }

  const handleErrorStatus = () => {
    setErrorStatus(true);
    setTimeout(() => {
      setErrorStatus(false);
    }, 2000);
  }

  const enterBoardWord = (word) => {
    let boardWords = boardData.boardWords;
    let boardRowStatus = boardData.boardRowStatus;
    let solution = boardData.solution;
    let presentCharArray = boardData.presentCharArray;
    let absentCharArray = boardData.absentCharArray;
    let correctCharArray = boardData.correctCharArray;
    let rowIndex = boardData.rowIndex;
    let rowStatus = [];
    let matchCount = 0;
    let status = boardData.status;

    for (var index = 0; index < word.length; index++) {
      if (solution.charAt(index) === word.charAt(index)) {
        matchCount++;
        rowStatus.push("correct");
        if (!correctCharArray.includes(word.charAt(index))) correctCharArray.push(word.charAt(index));
        if (presentCharArray.indexOf(word.charAt(index)) !== -1) presentCharArray.splice(presentCharArray.indexOf(word.charAt(index)), 1);
      } else if (solution.includes(word.charAt(index))) {
        rowStatus.push("present");
        if (!correctCharArray.includes(word.charAt(index))
          && !presentCharArray.includes(word.charAt(index))) presentCharArray.push(word.charAt(index)); 
      } else {
        rowStatus.push("absent");
        if (!absentCharArray.includes(word.charAt(index))) absentCharArray.push(word.charAt(index));
      }
    }
    if (matchCount === 5) {
      status = "WIN";
      handleMessage(<>
        <Typography id="modal-modal-title" variant="h5" component="h2" style={{ color: "#7B68EE" }}>
          Congrats!! You Won!!
        </Typography></>)
    }
    else if (rowIndex + 1 === 6) {
      status = "LOST";
      handleMessage(<>
        <Typography id="modal-modal-title" variant="h5" component="h2" style={{ color: "#7B68EE" }}>
          Sorry!! The word is <Typography variant="h5" component="h2" style={{ color: "black" }}>{JSON.stringify(boardData.solution).toUpperCase()}</Typography>
        </Typography></>)
    }
    boardRowStatus.push(rowStatus);
    boardWords[rowIndex] = word;
    let newBoardData = {
      ...boardData,
      "boardWords": boardWords,
      "boardRowStatus": boardRowStatus,
      "rowIndex": rowIndex + 1,
      "status": status,
      "presentCharArray": presentCharArray,
      "absentCharArray": absentCharArray,
      "correctCharArray": correctCharArray
    };
    setBoardData(newBoardData);
    localStorage.setItem("board-data", JSON.stringify(newBoardData));
  }

  const enterCurrentText = (word) => {
    let boardWords = boardData.boardWords;
    let rowIndex = boardData.rowIndex;
    boardWords[rowIndex] = word;
    let newBoardData = {
      ...boardData,
      "boardWords": boardWords
    };
    setBoardData(newBoardData);
  }

  const handleKeyPress = (key) => {
    if (boardData.rowIndex > 5 || boardData.status === "WIN") return;
    if (key === "ENTER") {
      if (charArray.length === 5) {
        let word = charArray.join("").toLowerCase();
        if (!wordList[word.charAt(0)].includes(word)) {
          handleErrorStatus();
          handleErrorMessage("Not in word list");
          return;
        }
        enterBoardWord(word);
        setCharArray([]);
      } else {
        handleErrorMessage("Not enough letters");
      }
      return;
    }
    if (key === "⌫") {
      charArray.splice(charArray.length - 1, 1);
      setCharArray([...charArray]);
    }
    else if (charArray.length < 5) {
      charArray.push(key);
      setCharArray([...charArray]);
    }
    enterCurrentText(charArray.join("").toLowerCase());
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }} >
        <AppBar position="static" style={{ backgroundColor: "#7B68EE" }}>
          <Toolbar>
            
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
             Unlimited Wordle
            </Typography>
            <Button color="inherit" onClick={resetBoard}>New Game?</Button>
          </Toolbar>
        </AppBar>
      </Box>
      {message && <Modal
        open={true}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className='modalStyle'>
          {message}
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Wanna play again? Click on <Button style={{color:"#7B68EE"}} onClick={resetBoard}><u><b>New Game</b></u></Button>
          </Typography>
        </Box>
      </Modal>
      }
      <div className='container'>
        {errorMessage && <div className='message'>
          {errorMessage}
        </div>}
        <div className='cube'>
          {[0, 1, 2, 3, 4, 5].map((row, rowIndex) => (
            <div className={`cube-row ${boardData && row === boardData.rowIndex && error && "error"}`} key={rowIndex}>
              {
                [0, 1, 2, 3, 4].map((column, letterIndex) => (
                  <div key={letterIndex} className={`letter ${boardData && boardData.boardRowStatus[row] ? boardData.boardRowStatus[row][column] : ""}`}>
                    {boardData && boardData.boardWords[row] && boardData.boardWords[row][column]}
                  </div>
                ))
              }
            </div>
          ))}
        </div>
        <div className='bottom'>
          <Keyboard boardData={boardData}
            handleKeyPress={handleKeyPress} />
        </div>
      </div>
    </>
  );
};

export default App;


