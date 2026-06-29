import { useEffect, useState } from "react";
import { Modal, FormControl, Button } from "react-bootstrap";
import { getAllTodoTag, addNewTag, deleteTag } from "./todoService";
import { generateRandomId } from "@utils";

export default function TagDialog({ reloadTagList, open, handleClose }) {
  const [state, setState] = useState({ name: "", tagList: [] });

  const handleChange = (event) => {
    if (event.key === "Enter") handleAddNewTag();
    else setState((prev) => ({ ...prev, name: event.target.value }));
  };

  const handleAddNewTag = async () => {
    const name = state.name.trim();
    if (!name) return;

    try {
      const { data } = await addNewTag({ id: generateRandomId(), name });
      setState({ tagList: data, name: "" });
      reloadTagList();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteTag = async (id) => {
    try {
      const { data } = await deleteTag({ id, name: state.name });
      setState((prev) => ({ ...prev, tagList: data }));
      reloadTagList();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTodoTag().then(({ data }) => setState({ tagList: [...data] }));
  }, []);

  const { name, tagList } = state;

  return (
    <Modal onHide={handleClose} show={open} size="sm">
      <div className="px-3 py-4">
        <div className="d-flex align-items-center gap-2">
          <FormControl
            value={name}
            onChange={handleChange}
            onKeyDown={handleChange}
            placeholder="New tag*"
            className="flex-grow-1"
          />

          <Button onClick={handleAddNewTag} variant="primary">
            Add
          </Button>
        </div>

        <div className="pt-3">
          {tagList.map((tag, index) => (
            <div className="d-flex align-items-center justify-content-between my-2" key={tag.id}>
              <span className="text-capitalize">
                {index + 1}. {tag.name}
              </span>
              <Button onClickCapture={() => handleDeleteTag(tag.id)} variant="danger">
                Delete
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-2 text-right">
          <Button onClick={handleClose} variant="outline-danger">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
