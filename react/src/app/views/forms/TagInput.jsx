import { useState } from "react";
import Card from "react-bootstrap/Card";
import { WithContext as ReactTags } from "react-tag-input";

export default function TagInput() {
  const [state, setState] = useState({
    tags: [
      { id: "USA", text: "USA" },
      { id: "Germany", text: "Germany" },
      { id: "Austria", text: "Austria" },
      { id: "Costa Rica", text: "Costa Rica" },
      { id: "Sri Lanka", text: "Sri Lanka" },
      { id: "Thailand", text: "Thailand" }
    ],
    suggestions: [
      { id: "USA", text: "USA" },
      { id: "Germany", text: "Germany" },
      { id: "Austria", text: "Austria" },
      { id: "Costa Rica", text: "Costa Rica" },
      { id: "Sri Lanka", text: "Sri Lanka" },
      { id: "Thailand", text: "Thailand" }
    ]
  });

  const handleDelete = (i) => {
    const { tags } = state;
    setState((prevState) => ({ ...prevState, tags: tags.filter((tag, index) => index !== i) }));
  };

  const handleAddition = (tag) => {
    setState((state) => ({ ...state, tags: [...state.tags, tag] }));
  };

  const handleDrag = (tag, currPos, newPos) => {
    if (!newPos) return;

    let tags = [...state.tags];

    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    setState((prevState) => ({ ...prevState, tags }));
  };

  const { tags, suggestions } = state;

  return (
    <Card body>
      <Card.Title>Tag Input</Card.Title>

      <ReactTags
        tags={tags}
        allowDragDrop={false}
        delimiters={[188, 13]}
        suggestions={suggestions}
        handleDrag={handleDrag}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        inputProps={{ placeholder: "add tags" }}
      />
    </Card>
  );
}
