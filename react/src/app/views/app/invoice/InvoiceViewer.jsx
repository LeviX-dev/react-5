import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Col, Row, Table, Button } from "react-bootstrap";
import { format } from "date-fns";

import { getInvoiceById } from "./InvoiceService";

export default function InvoiceViewer(props) {
  const params = useParams();
  const [invoice, setInvoice] = useState({});

  useEffect(() => {
    getInvoiceById(params.id).then((res) => setInvoice({ ...res.data }));
  }, [params.id]);

  const { orderNo, buyer, seller, item: invoiceItemList = [], status, vat, date } = invoice;

  const subTotalCost = invoiceItemList.reduce((total, item) => total + item.price * item.unit, 0);

  return (
    <div className="invoice-viewer py-16">
      <div className="viewer_actions px-3 mb-3 d-flex align-items-center justify-content-between">
        <Link to="/invoice/list">
          <i className="i-Left1 text-20 font-weight-700" />
        </Link>

        <div className="d-flex align-items-center gap-2">
          <Button variant="primary" onClick={() => props.toggleInvoiceEditor()}>
            Edit Invoice
          </Button>

          <Button variant="warning" onClick={() => window.print()}>
            Print Invoice
          </Button>
        </div>
      </div>

      <div id="print-area" className="px-3">
        <Row>
          <Col md={6}>
            <h4 className="font-weight-bold">Order Info</h4>
            <p>#{orderNo}</p>
          </Col>

          <Col md={6} className="text-sm-right">
            <p className="text-capitalize">
              <strong>Order status:</strong> {status}
            </p>

            <p>
              <strong>Order date: </strong>
              <span>{date ? format(new Date(date).getTime(), "MMMM dd, yyyy") : ""}</span>
            </p>
          </Col>
        </Row>

        <div className="mt-3 mb-4 border-top" />

        <Row className="mb-5">
          <Col md={6} className="mb-3 mb-sm-0">
            <h5 className="font-weight-bold">Bill From</h5>
            <p>{seller ? seller.name : null}</p>
            <span className="white-space-pre-line">{seller ? seller.address : null}</span>
          </Col>

          <Col md={6} className="text-sm-right">
            <h5 className="font-weight-bold">Bill To</h5>
            <p>{buyer ? buyer.name : null}</p>
            <span className="white-space-pre-line">{buyer ? buyer.address : null}</span>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Table responsive hover className="mb-4">
              <thead className="bg-gray-300">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Item Name</th>
                  <th scope="col">Unit Price</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Cost</th>
                </tr>
              </thead>

              <tbody>
                {invoiceItemList.map((item, index) => (
                  <tr key={index}>
                    <td className="text-capitalize">{index + 1}</td>
                    <td className="text-capitalize">{item.name}</td>
                    <td className="text-capitalize">{item.price}</td>
                    <td className="text-capitalize">{item.unit}</td>
                    <td>{item.unit * item.price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>

          <Col xs={12}>
            <div className="invoice-summary">
              <p>
                Sub total: <span>${subTotalCost}</span>
              </p>
              <p>
                Vat(%): <span>{vat}</span>
              </p>
              <h5 className="font-weight-bold">
                Grand Total:
                <span>${subTotalCost - (subTotalCost * vat) / 100}</span>
              </h5>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
