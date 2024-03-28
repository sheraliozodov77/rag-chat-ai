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
    var input = document.getElementById('chatInput');
    var question = input.value.trim();
    var chatBox = document.getElementById('chatBox');
    var centerContent = document.getElementById('centerContent'); // Center content

    if (question !== "") {
        // Check if the chat has started (center content is hidden)
        if (!chatBox.classList.contains('chat-started')) {
            // Remove center content and mark chat as started
            chatBox.classList.add('chat-started');
            centerContent.style.display = 'none';
        }

        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question }),
        })
        .then(response => response.json())
        .then(data => {
            displayMessage(question, 'user');
            displayMessage(data.answer, 'ai');
            input.style.height = 'auto';
            autoResizeTextarea();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        input.value = "";
        input.style.height = '50px';
        adjustChatContainer();
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

    senderName.textContent = sender === 'user' ? 'You' : 'UzGPT';
    senderName.style.fontWeight = 'bold';
    senderName.style.color = sender === 'user' ? '#3498DB' : '#2ECC71';

    messageText.textContent = message;
    messageContainer.appendChild(senderName);
    messageContainer.appendChild(messageText);

    messageContainer.classList.add('message', sender);
    messageText.classList.add('message-text');

    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
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
            // Reset the textarea height after sending the message
            textarea.style.height = '50px';
            adjustChatContainer(); // Adjust the chat container to account for new textarea size
        }
    });

    textarea.addEventListener('input', autoResizeTextarea);
    adjustChatContainer(); // Initial adjustment
});

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