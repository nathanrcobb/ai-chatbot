import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

function ApiKeyModal({ show, setShow, apiKeyError, handleAPIKeyModalClick }) {
    return (
        <Modal show={show} centered>
            <Modal.Header onHide={() => setShow(false)} closeButton>
                <Modal.Title>API Key</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="apiKeyForm.input">
                        {apiKeyError && (
                            <h5 className="tooltip apikey">Invalid API Key.</h5>
                        )}
                        <Form.Label>
                            Please enter:
                            <img
                                src="/use_this.png"
                                alt="use this"
                                style={{ height: "1.25rem", width: "17rem" }}
                            />
                            <br />
                            Where the date is the first day the month of
                            Halloween '23
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="API Key"
                            autoFocus
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAPIKeyModalClick}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ApiKeyModal;
