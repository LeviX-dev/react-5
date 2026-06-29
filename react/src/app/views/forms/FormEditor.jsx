import { useState } from "react";
import { Card, Col, Row } from "react-bootstrap";

import { content1, content2, content3 } from "./richEditorContent";
import Breadcrumb from "app/components/Breadcrumb";
import RichTextEditor from "app/components/RichTextEditor";

export default function FormEditor() {
  const [state, setState] = useState({ content1, content2, content3 });

  const handleContentChange = (contentHtml, property) => {
    setState((prevState) => ({ ...prevState, [property]: contentHtml }));
  };

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "Forms", path: "/forms" }, { name: "Rich Editor" }]} />

      <Row>
        <Col md={12} className="mb-3">
          <Card body>
            <Card.Title className="mb-1">Snow Editor</Card.Title>
            <Card.Text>Your powerful rich text editor.</Card.Text>

            <RichTextEditor
              theme="snow"
              content={state.content1}
              placeholder="insert text here..."
              handleContentChange={(html) => handleContentChange(html, "content1")}
              modules={{
                toolbar: [
                  [{ size: ["small", false, "large", "huge"] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["clean"]
                ]
              }}
            />
          </Card>
        </Col>

        <Col md={12} className="mb-3">
          <Card body>
            <Card.Title className="mb-1">Bubble Editor</Card.Title>
            <Card.Text>Your powerful rich text editor.</Card.Text>

            <RichTextEditor
              theme="bubble"
              content={state.content2}
              placeholder="insert text here..."
              handleContentChange={(html) => handleContentChange(html, "content2")}
            />
          </Card>
        </Col>

        <Col md={12}>
          <Card body>
            <Card.Title className="mb-1">Full Editor</Card.Title>
            <Card.Text>Your powerful rich text editor.</Card.Text>

            <RichTextEditor
              content={state.content3}
              placeholder="insert text here..."
              handleContentChange={(html) => handleContentChange(html, "content3")}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
