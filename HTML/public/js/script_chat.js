// Constants
//const API_BASE_URL = "http://localhost:3000"; // Backend base URL
const API_BASE_URL = "http://localhost:3000";


// Function to toggle the sidebar
function toggleNav() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector(".chat-container");

    if (sidebar.style.width === "250px" || sidebar.style.width === "") {
        sidebar.style.width = "0";
        mainContent.style.marginLeft = "0";
    } else {
        sidebar.style.width = "250px";
        mainContent.style.marginLeft = "250px";
    }
}

// Function to toggle the sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('closed'); // Add or remove the 'closed' class
}

// Attach to your sidebar toggle button
document.querySelector('.openbtn').addEventListener('click', toggleSidebar);

// Function to send a message
async function sendMessage() {
    const input = document.getElementById("chatInput");
    const question = input.value.trim();
    const chatBox = document.getElementById("chatBox");
    const centerContent = document.getElementById("centerContent");
    const sessionId = getSessionId();

    if (question !== "") {
        // Hide the center content and mark the chat as started
        if (centerContent && !chatBox.classList.contains("chat-started")) {
            chatBox.classList.add("chat-started");
            centerContent.style.display = "none";
        }

        // Display user's message
        displayMessage(question, "user");
        await saveMessageToDatabase(sessionId, "user", question);

        try {
            const response = await fetch(`/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = data.answer || "I'm sorry, I couldn't find an answer.";
            displayTypingEffect(aiMessage, "ai");
            await saveMessageToDatabase(sessionId, "ai", aiMessage);
        } catch (error) {
            console.error("Error while fetching from /ask:", error);
            const errorMessage = "An error occurred while processing your request. Please try again later.";
            displayTypingEffect(errorMessage, "ai");
            await saveMessageToDatabase(sessionId, "ai", errorMessage);
        } finally {
            input.value = "";
        }
    }
}

// Function to display typing effect
function displayTypingEffect(message, sender) {
    const chatBox = document.getElementById("chatBox");
    const messageContainer = document.createElement("div");
    const senderName = document.createElement("div");
    const messageText = document.createElement("div");

    senderName.textContent = sender === "user" ? "You" : "AI";
    senderName.style.fontWeight = "bold";
    senderName.style.color = sender === "user" ? "#3498DB" : "#2ECC71";

    messageContainer.appendChild(senderName);
    chatBox.appendChild(messageContainer);

    let index = 0;
    const interval = setInterval(() => {
        if (index < message.length) {
            const char = message[index++];
            messageText.innerHTML += char === "\n" ? "<br>" : char;
        } else {
            clearInterval(interval);
        }
    }, 18); // Adjust typing speed

    messageText.classList.add("message-text");
    messageContainer.appendChild(messageText);
    messageContainer.classList.add("message", sender);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

// Function to display a message instantly
function displayMessage(message, sender) {
    const chatBox = document.getElementById("chatBox");
    const messageContainer = document.createElement("div");
    const senderName = document.createElement("div");
    const messageText = document.createElement("div");

    senderName.textContent = sender === "user" ? "You" : "AI";
    senderName.style.fontWeight = "bold";
    senderName.style.color = sender === "user" ? "#3498DB" : "#2ECC71";

    messageText.innerHTML = formatMessage(message);

    messageContainer.appendChild(senderName);
    messageContainer.appendChild(messageText);
    messageContainer.classList.add("message", sender);
    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to format the message with HTML
function formatMessage(message) {
    return message
        .replace(/(?:\r\n|\r|\n)/g, "<br>")
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/- (.+)/g, "• $1");
}

// Save a message to the database
async function saveMessageToDatabase(sessionId, role, content) {
    try {
        await fetch(`${API_BASE_URL}/saveMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId, role, content }),
        });
    } catch (error) {
        console.error("Error saving message to database:", error);
    }
}

// Load chat history from the database
async function loadChatHistory(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/getHistory/${sessionId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch chat history");
        }

        const messages = await response.json();
        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = ""; // Clear current chat
        messages.forEach(({ role, content }) => displayMessage(content, role));
    } catch (error) {
        console.error("Error loading chat history:", error);
    }
}
// Delete a session by sessionId
async function deleteSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete session.`);
      }
  
      alert("Session deleted successfully!");
      loadSidebarHistory(); // Refresh the sidebar after deletion
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session.");
    }
  }
  
// Load sessions into the sidebar
async function loadSidebarHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions`, { method: "GET" });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const sessions = await response.json();
        const sidebar = document.getElementById("chatHistory");
        sidebar.innerHTML = ""; // Clear any existing chat history

        if (sessions.length === 0) {
            const noChatsMessage = document.createElement("div");
            noChatsMessage.textContent = "No chats available.";
            noChatsMessage.classList.add("no-chats-message");
            sidebar.appendChild(noChatsMessage);
            return;
        }

        sessions.forEach(({ sessionId, title }) => {
            // Create container for each session
            const sessionContainer = document.createElement("div");
            sessionContainer.classList.add("session-container");

            // Create session link
            const sessionLink = document.createElement("a");
            sessionLink.textContent = title; // Use the title with timestamp
            sessionLink.href = "#";
            sessionLink.onclick = (event) => {
                event.preventDefault(); // Prevent default anchor behavior
                setSessionId(sessionId);
                loadChatHistory(sessionId);
            };

            // Create the three-dot menu
            const menuContainer = document.createElement("div");
            menuContainer.classList.add("menu-container");

            const ellipsisButton = document.createElement("button");
            ellipsisButton.classList.add("ellipsis-btn");
            ellipsisButton.textContent = "⋯";
            ellipsisButton.onclick = (event) => {
                event.stopPropagation(); // Prevent click event from propagating
                toggleMenu(menuContainer);
            };

            const menu = document.createElement("div");
            menu.classList.add("menu");
            menu.innerHTML = `
                <button class="rename-session-btn">Rename</button>
                <button class="delete-session-btn">Delete</button>
            `;
            menu.style.display = "none"; // Initially hidden

            // Attach rename logic
            menu.querySelector(".rename-session-btn").onclick = async (event) => {
                event.stopPropagation(); // Prevent click event from propagating
                const newTitle = prompt("Enter a new name for this session:", title);
                if (newTitle && newTitle.trim() !== "") {
                    await renameSession(sessionId, newTitle.trim());
                    loadSidebarHistory(); // Refresh the sidebar
                }
            };

            // Attach delete logic
            menu.querySelector(".delete-session-btn").onclick = async (event) => {
                event.stopPropagation(); // Prevent click event from propagating
                await deleteSession(sessionId);
                loadSidebarHistory(); // Refresh the sidebar
            };

            menuContainer.appendChild(ellipsisButton);
            menuContainer.appendChild(menu);

            sessionContainer.appendChild(sessionLink);
            sessionContainer.appendChild(menuContainer);
            sidebar.appendChild(sessionContainer);
        });

        // Add global click listener to close menus
        document.addEventListener("click", closeAllMenus);
    } catch (error) {
        console.error("Error loading chat sessions:", error);
    }
}

// Helper function to rename a session
async function renameSession(sessionId, newTitle) {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/rename`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
            throw new Error("Failed to rename session.");
        }
    } catch (error) {
        console.error("Error renaming session:", error);
    }
}

// Helper functions for menu toggle and close behavior
function toggleMenu(menuContainer) {
    const menu = menuContainer.querySelector(".menu");
    const allMenus = document.querySelectorAll(".menu");

    // Close all other menus before toggling
    allMenus.forEach((otherMenu) => {
        if (otherMenu !== menu) {
            otherMenu.style.display = "none";
        }
    });

    menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function closeAllMenus(event) {
    // Close all menus if the click is outside the menu
    const allMenus = document.querySelectorAll(".menu");
    allMenus.forEach((menu) => {
        if (!menu.contains(event.target)) {
            menu.style.display = "none";
        }
    });
}




// Add an event listener for the Enter key
document.getElementById("chatInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Prevent creating a new line
        sendMessage(); // Call the sendMessage function
    }
});


// Create a new chat session
async function createNewChat() {
    try {
        const response = await fetch(`${API_BASE_URL}/newSession`, {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error("Failed to create a new chat session.");
        }

        const { sessionId, title } = await response.json(); // Fetch both sessionId and title
        setSessionId(sessionId);
        loadSidebarHistory(); // Refresh the sidebar
    } catch (error) {
        console.error("Error creating new chat session:", error);
        alert("Failed to create a new chat session.");
    }
}


// Get or generate session ID
function getSessionId() {
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
        sessionId = Date.now().toString();
        sessionStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
}

// Set session ID
function setSessionId(sessionId) {
    sessionStorage.setItem("sessionId", sessionId);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    loadSidebarHistory();

    const sessionId = getSessionId();
    if (sessionId) {
        loadChatHistory(sessionId);
    }

    const newChatButton = document.querySelector(".add-chat-btn");
    if (newChatButton) {
        newChatButton.addEventListener("click", createNewChat);
    }
});
