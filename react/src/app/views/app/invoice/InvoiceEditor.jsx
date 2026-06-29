import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, FormLabel, FormGroup, FormControl, Row, Col, Table } from "react-bootstrap";
import { Formik, FieldArray } from "formik";
import DatePicker from "react-datepicker";
import * as yup from "yup";
import { getInvoiceById, addInvoice, updateInvoice } from "./InvoiceService";

export default function InvoiceEditor(props) {
  const params = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    id: "",
    orderNo: "",
    buyer: { name: "", address: "" },
    seller: { name: "", address: "" },
    item: [],
    status: "",
    vat: "",
    date: new Date(),
    currency: "$",
    loading: false
  });

  let subTotalCost = 0;

  const generateRandomId = () => {
    let tempId = Math.random().toString();
    let id = tempId.substring(2, tempId.length - 1);
    setState({ id });
  };

  const handleSubmit = (values, { setSubmitting }) => {
    let { id } = state;
    setState({ loading: true });
    setSubmitting(true);

    if (props.isNewInvoice)
      addInvoice({ id, ...values }).then(() => {
        setState({ loading: false });
        navigate(`/invoice/${id}`);
        props.toggleInvoiceEditor();
      });
    else
      updateInvoice(values).then(() => {
        setState({ loading: false });
        props.toggleInvoiceEditor();
      });
  };

  const calculateSubTotal = (values) => {
    const items = values.item || [];
    subTotalCost = items.reduce((total, item) => total + item.price * item.unit, 0);
  };

  useEffect(() => {
    if (!props.isNewInvoice)
      getInvoiceById(params.id).then((res) => {
        setState((prevState) => ({ ...prevState, ...res.data }));
      });
    else {
      generateRandomId();
    }
  }, [params.id, props.isNewInvoice]);

  let { loading } = state;

  return (
    <div className="invoice-viewer py-3">
      <Formik
        initialValues={state}
        onSubmit={handleSubmit}
        validationSchema={invoiceSchema}
        enableReinitialize={true}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => {
          calculateSubTotal(values);

          return (
            <Fragment>
              <Form onSubmit={handleSubmit} className="px-3">
                <div className="viewer_actions d-flex align-items-center justify-content-end gap-2 mb-4">
                  <Button
                    type="button"
                    variant="warning"
                    onClick={() => props.toggleInvoiceEditor()}>
                    Cancel
                  </Button>

                  <Button type="submit" variant="primary" disabled={loading}>
                    Save
                  </Button>
                </div>

                <Row className="justify-content-between">
                  <Col md={6} sm={7}>
                    <h4 className="fw-bold">Order Info</h4>

                    <FormGroup className="col-md-4 col-sm-7 mb-3">
                      <FormLabel>Order Number</FormLabel>
                      <FormControl
                        type="text"
                        name="orderNo"
                        className="form-control"
                        placeholder="Enter order number"
                        onBlur={handleBlur}
                        value={values.orderNo}
                        onChange={handleChange}
                        isInvalid={errors.orderNo && touched.orderNo}
                      />
                    </FormGroup>
                  </Col>

                  <Col offset={{ lg: 3 }} md={3} sm={5}>
                    <label className="d-block text-12 text-muted mb-3">Order Status</label>

                    <div className="pe-0 mb-4">
                      <fieldset>
                        <label className="radio radio-danger">
                          <input
                            type="radio"
                            name="status"
                            value="pending"
                            onChange={handleChange}
                            checked={values.status === "pending"}
                          />
                          <span>Pending</span>
                          <span className="checkmark" />
                        </label>

                        <label className="radio check-reverse radio-warning">
                          <input
                            type="radio"
                            name="status"
                            value="processing"
                            onChange={handleChange}
                            checked={values.status === "processing"}
                          />
                          <span>Processing</span>
                          <span className="checkmark"></span>
                        </label>

                        <label className="radio radio-success">
                          <input
                            type="radio"
                            name="status"
                            value="delivered"
                            onChange={handleChange}
                            checked={values.status === "delivered"}
                          />
                          <span>Delivered</span>
                          <span className="checkmark" />
                        </label>
                      </fieldset>

                      {errors.status && touched.status && (
                        <small className="text-danger">Minimum 1 item is required</small>
                      )}
                    </div>

                    <div className="form-group mb-3">
                      <div className="mb-1">Order Date</div>
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        className="form-control text-right"
                        selected={new Date(values.date)}
                        onChange={(date) => setFieldValue("date", date)}
                      />
                    </div>
                  </Col>
                </Row>

                <div className="mt-3 mb-4 border-top" />

                <Row className="mb-5">
                  <Col md={6}>
                    <h5 className="fw-bold">Bill From</h5>

                    <FormGroup className="col-md-10 mb-3 pl-0">
                      <FormControl
                        type="text"
                        className="form-control"
                        name="seller.name"
                        placeholder="Bill From"
                        value={values.seller.name || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          errors.seller &&
                          errors.seller.name &&
                          touched.seller &&
                          touched.seller.name
                        }
                      />
                    </FormGroup>

                    <FormGroup className="col-md-10 mb-3 pl-0">
                      <FormControl
                        as="textarea"
                        rows={4}
                        placeholder="Bill From Address"
                        name="seller.address"
                        value={values.seller.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          errors.seller &&
                          touched.seller &&
                          errors.seller.address &&
                          touched.seller.address
                        }
                      />
                    </FormGroup>
                  </Col>

                  <Col md={6} className="text-end">
                    <h5 className="fw-bold">Bill To</h5>

                    <FormGroup className="col-md-10 offset-md-2 mb-3 pe-0">
                      <FormControl
                        type="text"
                        className="text-right"
                        name="buyer.name"
                        placeholder="Bill From"
                        value={values.buyer.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          errors.buyer && touched.buyer && errors.buyer.name && touched.buyer.name
                        }
                      />
                    </FormGroup>

                    <FormGroup className="col-md-10 offset-md-2 mb-3 pe-0">
                      <FormControl
                        as="textarea"
                        rows={4}
                        className="text-right"
                        placeholder="Bill From Address"
                        name="buyer.address"
                        value={values.buyer.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          errors.buyer &&
                          touched.buyer &&
                          errors.buyer.address &&
                          touched.buyer.address
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <FieldArray name="item">
                    {(arrayHelpers) => (
                      <Col xs={12}>
                        <Table responsive hover className="mb-3">
                          <thead className="bg-gray-300">
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Item Name</th>
                              <th scope="col">Unit Price</th>
                              <th scope="col">Unit</th>
                              <th scope="col">Cost</th>
                              <th scope="col"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {values.item.map((item, ind) => (
                              <tr key={ind}>
                                <th className="text-middle" scope="row">
                                  {ind + 1}
                                </th>
                                <td>
                                  <FormControl
                                    value={values.item[ind].name}
                                    name={`item[${ind}].name`}
                                    type="text"
                                    placeholder="Item Name"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={
                                      errors.item &&
                                      touched.item &&
                                      errors.item[ind] &&
                                      touched.item[ind] &&
                                      errors.item[ind].name &&
                                      touched.item[ind].name
                                    }
                                  />
                                </td>
                                <td>
                                  <FormControl
                                    value={values.item[ind].price}
                                    name={`item[${ind}].price`}
                                    type="number"
                                    placeholder="Unit Price"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={
                                      errors.item &&
                                      touched.item &&
                                      errors.item[ind] &&
                                      touched.item[ind] &&
                                      errors.item[ind].price &&
                                      touched.item[ind].price
                                    }
                                  />
                                </td>
                                <td>
                                  <FormControl
                                    value={values.item[ind].unit}
                                    name={`item[${ind}].unit`}
                                    type="number"
                                    placeholder="Unit"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={
                                      errors.item &&
                                      touched.item &&
                                      errors.item[ind] &&
                                      touched.item[ind] &&
                                      errors.item[ind].unit &&
                                      touched.item[ind].unit
                                    }
                                  />
                                </td>
                                <td className="text-middle">
                                  {values.item[ind].price * values.item[ind].unit}
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => arrayHelpers.remove(ind)}
                                    className="btn btn-outline-secondary float-right">
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        {values.item.length === 0 && (
                          <small className="text-danger">Minimum 1 item is required</small>
                        )}

                        <button
                          type="button"
                          onClick={() => arrayHelpers.push({ name: "", price: "", unit: "" })}
                          className="btn btn-primary float-end mb-4">
                          Add Item
                        </button>
                      </Col>
                    )}
                  </FieldArray>

                  <Col xs={12}>
                    <div className="invoice-summary invoice-summary-input float-right">
                      <p>
                        Sub total:
                        <span>
                          {values.currency}
                          {subTotalCost}
                        </span>
                      </p>

                      <p className="d-flex align-items-center">
                        Vat(%):
                        <span>
                          {values.currency}
                          {(subTotalCost * values.vat) / 100}
                        </span>
                      </p>

                      <h5 className="fw-bold d-flex align-items-center">
                        Grand Total:
                        <span>
                          {values.currency}
                          {subTotalCost + (subTotalCost * values.vat) / 100}
                        </span>
                      </h5>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Fragment>
          );
        }}
      </Formik>
    </div>
  );
}

const invoiceSchema = yup.object().shape({
  orderNo: yup.string().required("orderNo is required"),
  status: yup.string().required("status is required"),
  seller: yup.object().shape({
    name: yup.string().required("name is required"),
    address: yup.string().required("address is required")
  }),
  buyer: yup.object().shape({
    name: yup.string().required("name is required"),
    address: yup.string().required("address is required")
  }),
  item: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required("name is required"),
        price: yup.number().required("price is required"),
        unit: yup.number().required("unit is required")
      })
    )
    .min(1, "Minimum 1 item is required"),
  vat: yup.number().required("unit is required"),
  currency: yup.string().required("name is required")
});
