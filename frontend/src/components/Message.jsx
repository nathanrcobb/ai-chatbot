function Message({ message }) {
    return (
        <div className="row mx-2">
            {message && message.role === "assistant" && (
                <div className="card chat-message message-assistant bg-secondary">
                    <h5 className="card-body text-white lh-base">
                        {message.content}
                    </h5>
                </div>
            )}
            {message && message.role === "user" && (
                <div className="card chat-message message-user bg-primary">
                    <h5 className="card-body text-white lh-base">
                        {message.content}
                    </h5>
                </div>
            )}
        </div>
    );
}

export default Message;
