import React, { useState, useEffect } from "react";
import { fetchBoardData } from "../src/utils/fetchBoardData";
import PromptInput from "../components/PromptInput";
import Button from "../components/Button";

export default function Main() {
  // const { messages, setMessages, conversationHistory } = summarizeChat();
  const [inputValue, setInputValue] = useState("");   // State to manage current input value
  const [boardData, setBoardData] = useState(null); // Data from Miro board

  // UseEffect to set up the Miro app's UI behavior when opened
  useEffect(() => {
    
    // Define the interval
    const intervalId = setInterval(() => {
      fetchBoardData(); // Fetch the data from the board
    }, 60000); // Fetch every 60 seconds
    
    // Prevents re-initialization if the app is already open
    if (new URLSearchParams(window.location.search).has("panel")) return;

    // Registers a click event to open the app's panel on the Miro board
    window.miro.board.ui.on("icon:click", async () => {
      window.miro.board.ui.openPanel({
        url: `/?panel=1`,
      });
    });
}, []); // Runs only on component mount // Empty dependency array ensures this runs once when the component mounts


  // // Function to handle the key press event (Enter key) TODO figure out "return"
  // const handleKeyDown = (event) => {
  //   if (event.key === "Enter") {
  //     event.preventDefault(); // Prevent default behavior (e.g., form submission)
  //     handleButtonClick(); // Trigger the send logic when the Enter key is pressed
  //   }
  // };

  // Updates the `inputValue` as the user types in the input field
  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  // Handles the "Send" button click
  const handleButtonClick = async () => {
    fetchBoardData();
    setInputValue(""); // Clear input field after sending
  };

  return (
    <div className="grid">
      {/* Chat history container */}
      

      {/* Input area for user to type and send messages */}
      <div className="input-container cs1 ce12">
        <PromptInput
          placeholder="Type your message here..." // Placeholder for input field
          value={inputValue} // Controlled input value
          onChange={handleInputChange} // Updates `inputValue` on change
        />
        <Button onClick={handleButtonClick}>Send</Button> {/* Sends the message */}
      </div>
    </div>
  );
}
