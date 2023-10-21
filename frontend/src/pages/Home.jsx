import { useEffect, useState } from "react";

import ChatLog from "../components/ChatLog";
import TextInput from "../components/TextInput";

function Home() {
    const baseURL = "http://localhost:8000";

    const [error, setError] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userTyping, setUserTyping] = useState(false);
    const [inputDisabled, setInputDisabled] = useState(false);
    const [userInput, setUserInput] = useState("");

    const fetchMessages = async () => {
        const res = await fetch(`${baseURL}/`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setMessages(data);
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleUserInputSubmit = async (e) => {
        e.preventDefault();
        if (userInput.length === 0) {
            setError(true);
        } else {
            setInputDisabled(true);
            setUserTyping(false);
            setLoading(true);
            setMessages([...messages, { role: "user", content: userInput }]);
            setUserInput("");

            await fetch(`${baseURL}/`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: userInput }),
            }).then(() => {
                setLoading(false);
                setInputDisabled(false);
                fetchMessages();
            });
        }
    };

    const onResetClick = async () => {
        setInputDisabled(true);
        setUserTyping(false);
        setLoading(false);
        const res = await fetch(`${baseURL}/`, {
            method: "DELETE",
        });
        const data = await res.json();
        setMessages(data);
        setLoading(false);
        setInputDisabled(false);
    };

    return (
        <div className="container mt-5">
            <div id="header">
                <div>
                    <h3 className="row font-roboto-bold">Personal Chatbot</h3>
                </div>
                {messages && messages.length > 1 && (
                    <button
                        id="chat-reset"
                        className="btn btn-warning"
                        onClick={onResetClick}
                        disabled={inputDisabled}
                    >
                        Reset Chat Log
                    </button>
                )}
            </div>

            <hr />

            <div className="row">
                <ChatLog
                    messages={messages}
                    userTyping={userTyping}
                    loading={loading}
                />

                <TextInput
                    userTyping={userTyping}
                    setUserTyping={setUserTyping}
                    error={error}
                    setError={setError}
                    handleUserInputSubmit={handleUserInputSubmit}
                    userInput={userInput}
                    setUserInput={setUserInput}
                    inputDisabled={inputDisabled}
                />
            </div>
        </div>
    );
}

export default Home;
