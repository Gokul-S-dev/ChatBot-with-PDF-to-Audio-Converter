import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // Sample messages for placeholder
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I assist you today?", sender: "bot" },
    { id: 2, text: "Hi!", sender: "user" },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: "user",
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      // Simulate bot response (you can replace this with actual API call)
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "Thanks for your message! This is a demo response.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConverterClick = () => {
    navigate("/converter");
  };

  return (
    <>
      {/* Background matching Home page */}
      <div className="chat-background">
        <Container
          fluid
          className="min-vh-100 d-flex align-items-center justify-content-center py-4"
        >
          <Row className="w-100 justify-content-center">
            <Col xs={12} md={10} lg={8} xl={6}>
              <Card className="chat-card shadow-lg border-0">
                <Card.Header className="chat-header text-center py-3">
                  <h4 className="mb-0 text-white">💬 Chat with AI Assistant</h4>
                </Card.Header>

                <Card.Body className="p-0">
                  {/* Chat Messages Area */}
                  <div className="chat-messages p-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`message mb-3 ${
                          msg.sender === "user" ? "user-message" : "bot-message"
                        }`}
                      >
                        <div
                          className={`message-bubble p-3 rounded-3 ${
                            msg.sender === "user"
                              ? "bg-primary text-white ms-auto"
                              : "bg-light text-dark"
                          }`}
                        >
                          <strong>
                            {msg.sender === "user" ? "You: " : "Chatbot: "}
                          </strong>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>

                <Card.Footer className="chat-footer p-3">
                  {/* Input Area */}
                  <Row className="g-2">
                    <Col xs={12} md={8}>
                      <Form.Control
                        type="text"
                        placeholder="Type your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="chat-input"
                      />
                    </Col>
                    <Col xs={6} md={2}>
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                      >
                        Send
                      </Button>
                    </Col>
                    <Col xs={6} md={2}>
                      <Button
                        variant="success"
                        className="w-100"
                        onClick={handleConverterClick}
                      >
                        Converter
                      </Button>
                    </Col>
                  </Row>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Chat;
