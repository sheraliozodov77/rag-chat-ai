// Function to toggle the sidebar
function toggleNav() {
    var sidebar = document.getElementById("sidebar");
    var mainContent = document.querySelector(".chat-container");

    if (sidebar.style.width === "250px" || sidebar.style.width === "") {
        sidebar.style.width = "0";
        mainContent.style.marginLeft = "0";
    } else {
        sidebar.style.width = "250px";
        mainContent.style.marginLeft = "250px";
    }
}

// Function to send a message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const question = input.value.trim();
    const chatBox = document.getElementById('chatBox');
    const centerContent = document.getElementById('centerContent'); // Center content

    if (question !== "") {
        // Check if the chat has started (center content is hidden)
        if (centerContent && !chatBox.classList.contains('chat-started')) {
            // Remove center content and mark chat as started
            chatBox.classList.add('chat-started');
            centerContent.style.display = 'none';
        }

        // Display user's message in the chat
        displayMessage(question, 'user');

        // Fetch answer from the backend
        fetch('http://localhost:3000/ask', { // Use full URL to avoid issues with relative paths
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question }),
        })
        .then(response => {
            // Check if the response status is OK
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.answer) {
                // Display OpenAI's response
                displayMessage(data.answer, 'ai');
            } else {
                // Handle the case when no answer is found
                displayMessage("I'm sorry, I couldn't find an answer based on the provided PDFs.", 'ai');
            }
        })
        .catch((error) => {
            // Log the error for debugging and display a user-friendly message
            console.error('Error while fetching from /ask:', error);
            displayMessage("An error occurred while processing your request. Please try again later.", 'ai');
        })
        .finally(() => {
            // Reset textarea height and adjust chat container
            input.style.height = 'auto';
            input.value = "";
            adjustChatContainer();
        });
    }
}

// Event listener for keypress in textarea
document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.getElementById('chatInput');
    textarea.addEventListener('keydown', function(event) {
        // Check if Enter is pressed without the Shift key
        if (event.key === 'Enter' && !event.shiftKey) {
            // Prevent the default action to avoid a newline being entered
            event.preventDefault();
            // Call the function to send the message
            sendMessage();
        }
    });

    // Other event listeners and initializations
    textarea.addEventListener('input', autoResizeTextarea);
    adjustChatContainer(); // Initial adjustment
});

function displayMessage(message, sender) {
    var chatBox = document.getElementById('chatBox');
    var messageContainer = document.createElement('div');
    var senderName = document.createElement('div');
    var messageText = document.createElement('div');

    senderName.textContent = sender === 'user' ? 'You' : 'AI';
    senderName.style.fontWeight = 'bold';
    senderName.style.color = sender === 'user' ? '#3498DB' : '#2ECC71';

    messageText.textContent = message;
    messageText.classList.add('message-text');

    // Append sender and message text
    messageContainer.appendChild(senderName);
    messageContainer.appendChild(messageText);

    messageContainer.classList.add('message', sender);
    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

// Function to dynamically resize the textarea upwards
function autoResizeTextarea() {
    var textarea = document.getElementById('chatInput');
    if (textarea.value.trim() === '') {
        // Reset the textarea height if it's empty
        textarea.style.height = '50px';
    } else {
        // Calculate the new height only if the textarea is not empty
        var lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
        var previousHeight = textarea.clientHeight;
        var newScrollHeight = textarea.scrollHeight;
        var newHeight = newScrollHeight + lineHeight;

        if (newScrollHeight > previousHeight) {
            textarea.style.height = newHeight + 'px';
        } else if (textarea.rows > 1 && newScrollHeight < previousHeight) {
            textarea.style.height = newHeight - lineHeight + 'px';
        }
    }
    adjustChatContainer(); // Adjust the chat container to account for new textarea size
}

// Adjust the chat container's bottom padding to fit the input area
function adjustChatContainer() {
    var chatContainer = document.querySelector('.chat-container');
    var inputAreaHeight = document.querySelector('.input-area').offsetHeight;
    chatContainer.style.paddingBottom = inputAreaHeight + 'px';
}

// Add the event listener to resize the textarea as needed
document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.getElementById('chatInput');
    textarea.addEventListener('input', autoResizeTextarea);
    adjustChatContainer(); // Initial adjustment
});
