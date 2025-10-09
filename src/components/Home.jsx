import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Scene3D from "./Scene3D";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate("/chat");
  };

  return (
    <>
      {/* 3D Background Scene */}
      <Scene3D />

      {/* Main Content */}
      <div className="home-container">
        <Container
          fluid
          className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
        >
          <div className="text-center">
            {/* Hero Section */}
            <Card className="hero-card bg-transparent border-0 text-white">
              <Card.Body className="py-5 px-4">
                <h1 className="hero-title mb-4"> Welcome to  Chatbot</h1>
                <p className="hero-subtitle lead mb-5">
                  Your AI-powered assistant with smart conversations.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="cta-button px-5 py-3"
                  onClick={handleStartChat}
                >
                  Start Chatting
                </Button>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Home;
