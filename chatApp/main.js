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
    "hi": "Hello "+userName +'!',
    "hey": "Hey there!",
    "hy": "Hey there!",
    "how are you?": "I'm doing well, thank you!",
    "how are you": "I'm doing well, thank you!",
    "how's it going?": "Going well, thank you!",
    "how's it going": "Going well, thank you!",
    "goodbye": "Goodbye! Have a great day!",
    "bye": "See you later!",
    "see you": "Take care!",
    "what's up?": "Not much, just here to help!",
    "what's up": "Not much, just here to help!",
    "howdy": "Howdy! How can I assist you?",
    "nice to meet you": "Likewise! How can I assist you today?",
    "pleased to meet you": "The pleasure is mine. How can I help?",
    "thank you": "You're welcome! It's my pleasure to help.",
    "thanks": "You're welcome!",
    "how's the weather?": "It's {weather} today! How about you?",
    "how's the weather": "It's {weather} today! How about you?",
    "what's the weather like?": "Currently, it's {weather}.",
    "is it going to rain?": "Yes, it might rain later today.",
    "is it going to rain": "Yes, it might rain later today.",
    "can you help me?": "Of course! What do you need assistance with?",
    "tell me a joke": "Why don't scientists trust atoms? Because they make up everything!",
    "who are you?": "I'm a virtual assistant here to help you.",
    "what can you do?": "I can provide information, answer questions, and assist with tasks.",
    "how old are you?": "I don't have an age. I'm here whenever you need me!",
    "where are you from?": "I exist in the digital realm, ready to assist wherever you are.",
    "do you like cats?": "I don't have personal preferences, but I'm happy to discuss cats!",
    "do you like dogs?": "Similarly, I'm neutral about dogs, but I can help with dog-related topics.",
    "what is your favorite color?": "I don't have a favorite color, but I appreciate all colors equally!",
    "tell me about yourself": "I'm a virtual assistant powered by artificial intelligence, designed to assist you.",
    "how can I contact you?": "You can interact with me here. How can I assist you today?",
    "how do you work?": "I process information and respond based on predefined patterns and algorithms.",
    "what time is it?": "It's time to assist you! Unfortunately, I don't have access to real-time clock information.",
    "what's your name?": "I'm your virtual assistant. How can I help you today?",
    "how smart are you?": "I'm designed to assist with a wide range of tasks and questions.",
    "can you tell me a story?": "Once upon a time, there was a user who asked for a story...",
    "are you human?": "No, I'm an artificial intelligence created to assist you.",
    "what languages do you speak?": "I'm fluent in the language of computers and can communicate in multiple human languages.",
    "can I trust you?": "You can trust that I'm here to help you to the best of my abilities.",
    "are you real?": "I'm as real as the words you see on your screen!",
    "tell me something interesting": "Did you know that the shortest war in history was between Britain and Zanzibar on August 27, 1896? It lasted only 38 minutes.",
    "what's your favorite food?": "I don't eat, but I'm here to help you with any food-related questions.",
    "are you a robot?": "I'm an artificial intelligence, which is similar but different from a robot.",
    "what's the meaning of life?": "The meaning of life is a question that philosophers and individuals ponder. It can vary based on perspectives and beliefs.",
    "can I change your name?": "My name is designed to identify me as your virtual assistant.",
    "what's your favorite book?": "I don't have personal preferences, but I can recommend books based on your interests.",
    "what's your favorite movie?": "I don't watch movies, but I can discuss and recommend movies.",
    "can you sing?": "I don't have a voice, but I can provide lyrics or information about songs.",
    "what's the capital of [country]?": "The capital of {country} is [capital].",
    "how do you spell [word]?": "The correct spelling of [word] is [spelling].",
    "what's [math problem]?": "The answer to [math problem] is [answer].",
    "define [word]": "The definition of [word] is [definition].",
    "tell me about [topic]": "Here's some information about [topic]: [information].",
    "who invented [invention]?": "[Invention] was invented by [inventor].",
    "how do I [task]?": "To [task], you can [instructions].",
    "what's the distance between [location1] and [location2]?": "The distance between [location1] and [location2] is [distance].",
    "translate [phrase] to [language]": "The translation of [phrase] to [language] is [translation].",
    "what's the current [currency] to [currency] exchange rate?": "The current exchange rate from [currency1] to [currency2] is [rate].",
    "how do I say [phrase] in [language]?": "The translation of [phrase] in [language] is [translation].",
    "what's the latest news?": "Here are the latest news headlines: [news].",
    "what's the weather forecast for [location]?": "The weather forecast for [location] is [weather].",
    "how do I get from [location1] to [location2]?": "To get from [location1] to [location2], you can [directions].",
    "can you recommend a restaurant in [city]?": "I recommend [restaurant] in [city] for dining out.",
    "tell me a random fact": "Did you know that [random fact]?",
    "what's the population of [country]?": "The population of [country] is [population].",
    "what's the time in [city]?": "The current time in [city] is [time].",
    "what's the temperature in [city]?": "The current temperature in [city] is [temperature].",
    "what's the meaning of [phrase]?": "The meaning of [phrase] is [meaning].",
    "can you help with my homework?": "I can assist with understanding concepts and providing explanations.",
    "what's the largest [animal]?": "The largest [animal] is [largest animal].",
    "what's the tallest [building]?": "The tallest [building] is [tallest building].",
    "what's the capital of [state] in the United States?": "The capital of [state] is [capital].",
    "how many [units] are in [amount] [measurement]?": "There are [number of units] [units] in [amount] [measurement].",
    "what's the latest score in [sport] match?": "The latest score in [sport] match is [score].",
    "what's the best [product] on the market?": "The best [product] on the market is [product].",
    "what's the difference between [object1] and [object2]?": "The difference between [object1] and [object2] is [difference].",
    "can you explain [concept]?": "Certainly! [Explanation of concept].",
    "what's the average lifespan of [animal]?": "The average lifespan of [animal] is [lifespan].",
    "how do I reset my password?": "To reset your password, you can [instructions].",
    "where can I find [item]?": "You can find [item] at [location].",
    "what's the recipe for [dish]?": "Here's the recipe for [dish]: [recipe].",
    "who is [famous person]?": "[Famous person] is known for [description].",
    "can you help me with a coding problem?": "I can assist with understanding code concepts and debugging.",
    "what's the best way to learn [subject]?": "The best way to learn [subject] is to [learning method].",
    "what's the latest technology news?": "Here are the latest technology news headlines: [news].",
    "what's the healthiest [food]?": "The healthiest [food] is [healthiest food].",
    "what's the most efficient way to [task]?": "The most efficient way to [task] is [efficiency tip].",
    "how do I invest in [investment]?": "To invest in [investment], you can [investment advice].",
    "what's the longest river in the world?": "The longest river in the world is [river].",
    "who won the [sport] championship last year?": "The winner of the [sport] championship last year was [winner].",
    "what's the best way to relax?": "The best way to relax is to [relaxation method].",
    "log out": "Are you sure? if yes Enter your name and write Log Out (name Log Out)",
    userName:userName,
    
    }


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
              //  addMessage('AI', aiResponse, aiTimestamp);
                saveMessage('AI', aiResponse, aiTimestamp); // Save AI response to the database with a unique timestamp
            } else {
                // Default response for unrecognized input
                const defaultResponse = "I'm sorry, I didn't understand that.";
                const aiTimestamp = timestamp + 1; // Ensure a unique timestamp
              //  addMessage('AI', defaultResponse, aiTimestamp);
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
        location.reload()
    };
});
