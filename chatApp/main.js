document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const loader = document.getElementById('loader');
    
    const database = firebase.database();
    let lastMessageDate = null;
    let messageListenerActive = true;
    const displayedMessageIds = new Set(); // Track displayed message IDs
    const userName = localStorage.getItem('username');

    // Fixed responses for demo
    const fixedResponses = {
        "hello": "Hi there!",
        "hi": "Hello " + userName + '!',
        // ... (other fixed responses) ...
    };

    // Event listener for send button
    sendButton.addEventListener('click', () => {
        const userMessage = userInput.value.trim();
        if (userMessage) {
            userInput.value = '';
            const timestamp = Date.now();
            saveMessage('user', userMessage, timestamp); // Save user message to the database

            // Check if user's message has a fixed response
            const aiResponse = fixedResponses[userMessage.toLowerCase()];
            if (aiResponse) {
                const aiTimestamp = timestamp + 1; // Ensure a unique timestamp
                addMessage('AI', aiResponse, aiTimestamp);
                saveMessage('AI', aiResponse, aiTimestamp); // Save AI response to the database with a unique timestamp
            } else {
                // Default response for unrecognized input
                const defaultResponse = "I'm sorry, I didn't understand that.";
                const aiTimestamp = timestamp + 1; // Ensure a unique timestamp
                addMessage('AI', defaultResponse, aiTimestamp);
                saveMessage('AI', defaultResponse, aiTimestamp); // Save default AI response to the database with a unique timestamp
            }

            // Temporarily disable child_added event listener to prevent duplicate messages
            if (messageListenerActive) {
                messageListenerActive = false;
                database.ref('messages').off('child_added');
                setTimeout(() => {
                    database.ref('messages').on('child_added', (snapshot) => {
                        if (!messageListenerActive) {
                            return;
                        }
                        const message = snapshot.val();
                        if (!displayedMessageIds.has(snapshot.key)) {
                            addMessage(message.sender, message.message, message.timestamp);
                            displayedMessageIds.add(snapshot.key); // Mark message as displayed
                        }
                    });
                    messageListenerActive = true;
                }, 1000); // Reattach listener after 1 second
            }
        }
    });

    // Function to add message to the chat box
    function addMessage(sender, message, timestamp) {
        const currentDate = new Date(timestamp).toDateString();
        if (isNaN(timestamp)) {
            return;
        }
        if (currentDate !== lastMessageDate) {
            addDateLabel(currentDate);
            lastMessageDate = currentDate;
        }

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = message;

        const timestampElement = document.createElement('div');
        timestampElement.classList.add('timestamp');
        timestampElement.textContent = getCurrentTime(timestamp);

        messageElement.appendChild(timestampElement);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Function to add date label
    function addDateLabel(date) {
        const dateLabelElement = document.createElement('div');
        dateLabelElement.classList.add('date-label');
        dateLabelElement.textContent = date === new Date().toDateString() ? 'Today' : date;
        chatBox.appendChild(dateLabelElement);
    }

    // Function to save message to Firebase
    function saveMessage(sender, message, timestamp) {
        const messageRef = database.ref('messages').push();
        messageRef.set({
            sender: sender,
            message: message,
            timestamp: timestamp
        });
    }

    // Function to get current time in HH:mm format
    function getCurrentTime(timestamp) {
        if (isNaN(timestamp)) {
            return "Invalid Date";
        }
        const date = new Date(timestamp);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    }

    // Fetch messages from Firebase and display them
    database.ref('messages').on('child_added', (snapshot) => {
        if (!messageListenerActive) {
            loader.textContent = 'Empty';
            loader.classList.add('hidden');
            return;
        }
        const message = snapshot.val();
        if (!displayedMessageIds.has(snapshot.key)) {
            addMessage(message.sender, message.message, message.timestamp);
            displayedMessageIds.add(snapshot.key); // Mark message as displayed
        }
        loader.classList.add('hidden');
    });

    // Clear chat functionality (keep this section as is)
    const clearChatButton = document.getElementById('clear-chat-button');
    const popup_container = document.getElementById('popup_container');
    const clearChat = document.getElementById('yes');
    const closePopupButton = document.getElementById('cancel');
    
    clearChatButton.addEventListener('click', () => {
        popup_container.classList.remove('hidden');
        clearChat.addEventListener('click', () => {
            clearChat.textContent = 'Loading...';
            chatBox.innerHTML = '';
            database.ref('messages').remove()
                .then(() => {
                    console.log('Chat cleared successfully.');
                    lastMessageDate = null;
                    displayedMessageIds.clear(); // Clear displayed message IDs
                    popup_container.classList.add('hidden');
                    clearChat.textContent = 'Yes';
                })
                .catch((error) => {
                    console.error('Error clearing chat:', error);
                    clearChat.textContent = 'Error';
                });
        });
        closePopupButton.addEventListener('click', () => {
            popup_container.classList.add('hidden');
        });
    });

    // Login functionality (keep this section as is)
    const login_btn = document.querySelector('#login_btn');
    const login_container = document.querySelector('#login_container');
    const nameinp = document.querySelector('#name');
    const numinp = document.querySelector('#number');
    const usernameLabel = document.querySelector('#username');

    const alreadyLogined = () => {
        login_container.classList.add('hidden');
        usernameLabel.textContent = localStorage.getItem('username');
    };

    localStorage.getItem('username') ? alreadyLogined() : login_container.classList.remove('hidden');

    login_btn.onclick = () => {
        if (nameinp.value.length > 3) {
            if (numinp.value.length == 10) {
                LoginIng();
            } else {
                alert('Enter a valid number');
            }
        } else {
            alert('Name minimum 4 char');
        }
    };

    const LoginIng = () => {
        localStorage.setItem('username', nameinp.value);
        usernameLabel.textContent = nameinp.value;
        login_btn.textContent = 'Getting...';
        setTimeout(hide, 2000);
    };

    const hide = () => {
        login_container.classList.add('hidden');
    };
});
