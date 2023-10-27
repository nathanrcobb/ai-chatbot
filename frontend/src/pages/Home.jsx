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

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleUserInputSubmit();
        }
    };

    const handleUserInputSubmit = async (e) => {
        e?.preventDefault();

        const input = userInput.toLowerCase();
        const isImagePrompt = input.startsWith("/image ");

        if (userInput.length === 0) {
            setError(true);
        } else {
            setInputDisabled(true);
            setUserTyping(false);
            setLoading(true);
            setMessages([...messages, { role: "user", content: userInput }]);
            setUserInput("");

            await fetch(`${baseURL}/${isImagePrompt ? "i" : ""}`, {
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

            setTimeout(() => {
                const chat_window =
                    document.querySelector("#chat-log").parentElement;
                chat_window.scrollTo(0, chat_window.scrollHeight);
            }, 200);
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
                    handleKeyDown={handleKeyDown}
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
