import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import ChatLog from "../components/ChatLog";
import TextInput from "../components/TextInput";

function Home() {
    const baseURL = "http://localhost:8000";

    const [apiKeyError, setApiKeyError] = useState(false);
    const [error, setError] = useState(false);
    const [show, setShow] = useState(false);
    const [apiKey, setApiKey] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userTyping, setUserTyping] = useState(false);
    const [inputDisabled, setInputDisabled] = useState(false);
    const [userInput, setUserInput] = useState("");

    const scrollToBottom = () => {
        const chat_window = document.querySelector("#chat-log").parentElement;
        chat_window.scrollTo(0, chat_window.scrollHeight);
    };

    const getCookie = () => {
        const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("chatbot_apikey="))
            ?.split("=");
        return cookie;
    };

    const resetCookie = () => {
        const cookie = getCookie();

        if (cookie) {
            const cookieKey = cookie[0];
            document.cookie =
                cookieKey + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC";
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${baseURL}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                console.log(`HTTP error: ${res.status}.`);
            }
            if (res.status !== 200) {
                console.log(`Invalid response received.`);
            }
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.log(`Fetch error: ${error}`);
        }
        setTimeout(scrollToBottom, 300);
    };

    useEffect(() => {
        const cookie = getCookie();

        if (cookie) {
            const cookieValue = cookie[1];
            if (cookieValue) {
                setApiKey(cookieValue);
                setShow(false);
            } else {
                resetCookie();
            }
        }
        if (!apiKey) {
            setShow(true);
        }
        // eslint-disable-next-line
    }, [apiKey]);

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line
    }, []);

    const handleAPIKeyModalClick = (e) => {
        const apiKeyInput = document.getElementById("apiKeyForm.input");
        const apiKeyValue = apiKeyInput.value;

        if (apiKeyValue) {
            apiKeyInput.textContent = "";
            document.cookie = `chatbot_apikey=${apiKeyValue}; SameSite=None; Secure`;
            setApiKey(apiKeyValue);
            setApiKeyError(false);
            setShow(false);
        } else {
            setApiKeyError(true);
        }
    };

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
            setMessages([
                ...messages,
                { role: "user", content: userInput },
                ...(isImagePrompt
                    ? [
                          {
                              role: "info",
                              content:
                                  "Please wait a moment while I generate that image for you...",
                          },
                      ]
                    : []),
            ]);
            setUserInput("");

            try {
                const res = await fetch(
                    `${baseURL}/${isImagePrompt ? "i" : ""}`,
                    {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            "x-api-key": `${apiKey}`,
                        },
                        body: JSON.stringify({ prompt: userInput }),
                    }
                );
                if (!res.ok) {
                    if (res.status === 401) {
                        resetCookie();
                        setApiKey(null);
                        console.log("Invalid API key.");
                        setShow(true);
                    } else {
                        console.log(`HTTP error: ${res.status}.`);
                    }
                } else {
                    if (res.status !== 200) {
                        console.log(`Invalid response received.`);
                    }
                }
            } catch (error) {
                console.log(`Fetch error: ${error}`);
            }

            fetchMessages();
            setLoading(false);
            setInputDisabled(false);
        }
    };

    const onResetClick = async () => {
        setInputDisabled(true);
        setUserTyping(false);
        setLoading(false);
        try {
            const res = await fetch(`${baseURL}/`, {
                method: "DELETE",
            });
            if (!res.ok) {
                console.log(`HTTP error: ${res.status}.`);
            }
            if (res.status !== 200) {
                console.log(`Invalid response received.`);
            }
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.log(`Fetch error: ${error}`);
        }
        setLoading(false);
        setInputDisabled(false);
    };

    return (
        <>
            {!apiKey && (
                <Modal show={show} centered>
                    <Modal.Header onHide={() => setShow(false)} closeButton>
                        <Modal.Title>API Key</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form>
                            <Form.Group
                                className="mb-3"
                                controlId="apiKeyForm.input"
                            >
                                {apiKeyError && (
                                    <h5 className="tooltip apikey">
                                        Invalid API Key.
                                    </h5>
                                )}
                                <Form.Control
                                    type="text"
                                    placeholder="API Key"
                                    autoFocus
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShow(false)}
                        >
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAPIKeyModalClick}
                        >
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
            <div className="container mt-5">
                <div id="header">
                    <div>
                        <h3 className="row font-roboto-bold">
                            Personal Chatbot
                        </h3>
                    </div>
                    {messages && messages.length > 2 && (
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
                        scrollToBottom={scrollToBottom}
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
        </>
    );
}

export default Home;
