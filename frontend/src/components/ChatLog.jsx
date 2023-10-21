import { useEffect } from "react";
import Message from "./Message";

function ChatLog({ messages, userTyping, loading }) {
    useEffect(() => {
        const chat_window = document.querySelector("#chat-log").parentElement;
        chat_window.scrollTo(0, chat_window.scrollHeight);
    }, [messages, userTyping]);

    return (
        <>
            {userTyping || loading ? (
                <>
                    <div className="chat-window partial-chat overflow-auto mb-3">
                        <div id="chat-log">
                            <div id="container message-container">
                                {messages &&
                                    messages.map((message, index) => (
                                        <Message
                                            key={index}
                                            message={message}
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>
                    <div className="chat-window typing-status">
                        {userTyping && (
                            <div id="user-typing">
                                <ul className="px-3">
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                </ul>
                            </div>
                        )}
                        {loading && (
                            <div id="assistant-typing">
                                <ul className="px-3">
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="chat-window full-chat overflow-auto mb-3">
                    <div id="chat-log">
                        <div id="container message-container">
                            {messages &&
                                messages.map((message, index) => (
                                    <Message key={index} message={message} />
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatLog;
