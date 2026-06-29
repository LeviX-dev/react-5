import { Modal, Form, Col, Button, Row } from "react-bootstrap";
import * as yup from "yup";
import { Formik } from "formik";
import DatePicker from "react-datepicker";
import { CirclePicker } from "react-color";

export default function CalendarEventDialog(props) {
  const { open, eventObject, handleSubmit, handleDeleteEvent, closeDialog } = props;

  const handleFormSubmit = (values) => {
    handleSubmit(values);
  };

  return (
    <Modal show={open} centered={true} onHide={closeDialog}>
      <Formik
        enableReinitialize={true}
        initialValues={eventObject}
        onSubmit={handleFormSubmit}
        validationSchema={eventSchema}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => {
          return (
            <>
              <Modal.Header className="bg-primary text-white d-flex flex-wrap justify-content-between align-items-center">
                <h4 className="m-0 text-white">New Event</h4>
                <i className="i-Close-Window cursor-pointer text-18" onClick={closeDialog} />
              </Modal.Header>

              <Modal.Body>
                <h4>This sis our </h4>

                <Form onSubmit={handleSubmit}>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>

                    <Form.Control
                      type="text"
                      name="title"
                      className="mb-3"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.title}
                      isInvalid={errors.title && touched.title}
                    />
                  </Form.Group>

                  <Row className="mb-3">
                    <Form.Group as={Col} xs={6} className="d-flex flex-column">
                      <Form.Label className="me-2">Start Date</Form.Label>

                      <DatePicker
                        className="form-control mb-1 w-100"
                        dateFormat="dd/MM/yyyy"
                        selected={values.start ? new Date(values.start) : new Date()}
                        onChange={(date) => setFieldValue("start", date)}
                      />
                    </Form.Group>

                    <Form.Group as={Col} xs={6} className="d-flex flex-column">
                      <Form.Label className="me-2">End Date</Form.Label>

                      <DatePicker
                        className="form-control mb-1"
                        dateFormat="dd/MM/yyyy"
                        selected={values.end ? new Date(values.end) : new Date()}
                        onChange={(date) => setFieldValue("end", date)}
                      />
                    </Form.Group>
                  </Row>

                  <p>
                    <label className="checkbox checkbox-primary">
                      <input
                        type="checkbox"
                        name="allDay"
                        value={values.allDay}
                        checked={values.allDay}
                        onBlur={handleBlur}
                        onChange={handleChange}
                      />
                      <span>All day</span>
                      <span className="checkmark" />
                    </label>
                  </p>

                  <CirclePicker
                    className="w-100 mb-4"
                    color={values.color}
                    onChangeComplete={({ hex }) => setFieldValue("color", hex)}
                  />

                  <div className="d-flex justify-content-between">
                    <Button type="submit" variant="primary">
                      Save
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      className="d-flex align-items-baseline gap-1 text-white"
                      onClick={() => handleDeleteEvent(values.id)}>
                      <i className="i-Delete-File" />
                      Delete
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </>
          );
        }}
      </Formik>
    </Modal>
  );
}

const eventSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  start: yup.string().required("Start date is required")
});
