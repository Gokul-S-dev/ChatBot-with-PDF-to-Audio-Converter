import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Converter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [conversionStatus, setConversionStatus] = useState(
    "Waiting for file upload..."
  );
  const [isConverting, setIsConverting] = useState(false);
  const [statusVariant, setStatusVariant] = useState("info");
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioReady, setIsAudioReady] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate PDF file type
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setConversionStatus(`File selected: ${file.name}`);
        setStatusVariant("success");
      } else {
        setSelectedFile(null);
        setConversionStatus("Please select a valid PDF file.");
        setStatusVariant("warning");
      }
    } else {
      setSelectedFile(null);
      setConversionStatus("Waiting for file upload...");
      setStatusVariant("info");
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setConversionStatus("Please select a PDF file first.");
      setStatusVariant("warning");
      return;
    }

    setIsConverting(true);
    setConversionStatus("Converting PDF to audio...");
    setStatusVariant("primary");

    try {
      // Placeholder for backend API call
      // Replace this with your actual API endpoint
      const formData = new FormData();
      formData.append("pdf", selectedFile);

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Uncomment and modify this when you have your backend ready:
      /*
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setConversionStatus('Conversion complete! Download your audio file.')
        setStatusVariant('success')
      } else {
        throw new Error('Conversion failed')
      }
      */

      // Demo success response - simulate audio file URL
      // In real implementation, you'll get this URL from your backend API response
      const demoAudioUrl =
        "https://www.soundjay.com/misc/sounds-yoyo/beep-07a.mp3"; // Demo audio
      setAudioUrl(demoAudioUrl);
      setIsAudioReady(true);
      setConversionStatus("Conversion complete! Play your audio below.");
      setStatusVariant("success");
    } catch (error) {
      setConversionStatus("Conversion failed. Please try again.");
      setStatusVariant("danger");
    } finally {
      setIsConverting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setConversionStatus("Waiting for file upload...");
    setStatusVariant("info");
    setIsConverting(false);
    setAudioUrl(null);
    setIsAudioReady(false);

    // Clear file input
    const fileInput = document.getElementById("pdfFileInput");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <>
      {/* Background matching other pages */}
      <div className="converter-background">
        <Container
          fluid
          className="min-vh-100 d-flex align-items-center justify-content-center py-4"
        >
          <Row className="w-100 justify-content-center">
            <Col xs={12} md={8} lg={6} xl={5}>
              <Card className="converter-card shadow-lg border-0">
                <Card.Header className="converter-header text-center py-4">
                  <h3 className="mb-0 text-white">📄 PDF to Audio Converter</h3>
                </Card.Header>

                <Card.Body className="p-4">
                  {/* Status Display */}
                  <Alert variant={statusVariant} className="text-center mb-4">
                    {conversionStatus}
                  </Alert>

                  {/* File Upload Section */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-3">
                      Select PDF File:
                    </Form.Label>
                    <Form.Control
                      id="pdfFileInput"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      disabled={isConverting}
                      className="file-input"
                    />
                    <Form.Text className="text-muted mt-2">
                      Only PDF files are supported. Maximum file size: 10MB
                    </Form.Text>
                  </Form.Group>

                  {/* Selected File Info */}
                  {selectedFile && (
                    <div className="file-info mb-4 p-3 bg-light rounded">
                      <small className="text-muted">Selected file:</small>
                      <div className="fw-bold">{selectedFile.name}</div>
                      <small className="text-muted">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </div>
                  )}

                  {/* Audio Player Section */}
                  {isAudioReady && audioUrl && (
                    <div className="audio-player-section mb-4 p-4 bg-light rounded-3 border">
                      <h5 className="mb-3 text-center">
                        🎵 Your Audio is Ready!
                      </h5>
                      <audio
                        controls
                        className="w-100 audio-player"
                        preload="metadata"
                      >
                        <source src={audioUrl} type="audio/mpeg" />
                        <source src={audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          🎧 Use headphones for the best listening experience
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <Row className="g-3">
                    <Col xs={12} sm={6}>
                      <Button
                        variant="info"
                        size="lg"
                        className="w-100 convert-button"
                        onClick={handleConvert}
                        disabled={!selectedFile || isConverting}
                      >
                        {isConverting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Converting...
                          </>
                        ) : (
                          "🔄 Convert to Audio"
                        )}
                      </Button>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Button
                        variant="danger"
                        size="lg"
                        className="w-100"
                        onClick={handleCancel}
                        disabled={isConverting}
                      >
                        ❌ Cancel
                      </Button>
                    </Col>
                  </Row>

                  {/* Additional Info */}
                  <div className="mt-4 text-center">
                    <small className="text-muted">
                      Your PDF will be converted to high-quality audio format
                      (MP3)
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Converter;
