import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import swal from "sweetalert2";
import clsx from "clsx";

import { getAllInvoice, deleteInvoice } from "./InvoiceService";

export default function InvoiceList() {
  const navigate = useNavigate();

  const [invoiceList, setInvoiceList] = useState([]);

  useEffect(() => {
    getAllInvoice().then((res) => setInvoiceList(res.data));
  }, []);

  const handleViewClick = (invoiceId) => {
    navigate(`/invoice/${invoiceId}`);
  };

  const handleDeleteInvoice = async (invoice) => {
    const options = {
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No"
    };

    try {
      const { isConfirmed } = await swal.fire(options);
      if (!isConfirmed) return;

      const res = await deleteInvoice(invoice);

      toast.success("Invoice deleted successfully");
      setInvoiceList(res.data);
    } catch (error) {}
  };

  return (
    <div>
      <Link to="/invoice/create">
        <Button className="mb-3" variant="primary">
          Add Invoice
        </Button>
      </Link>

      <Card elevation={6} className="w-100 overflow-auto">
        <Table style={{ minWidth: 750 }}>
          <thead>
            <tr>
              <th className="py-3">Order No.</th>
              <th className="py-3">Bill From</th>
              <th className="py-3">Bill To</th>
              <th className="py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoiceList.map((invoice) => (
              <tr key={invoice.id}>
                <td className="py-3 capitalize" align="left">
                  {invoice.orderNo}
                </td>

                <td className="py-3 capitalize" align="left">
                  {invoice.seller.name}
                </td>

                <td className="py-3 capitalize" align="left">
                  {invoice.buyer.name}
                </td>

                <td className="py-3 capitalize">
                  <small
                    className={clsx("badge rounded-pill text-white px-8 py-2 text-capitalize", {
                      "bg-success": invoice.status === "delivered",
                      "bg-warning": invoice.status === "processing",
                      "bg-danger": invoice.status === "pending"
                    })}>
                    {invoice.status}
                  </small>
                </td>

                <td className="py-3">
                  <div className="d-flex align-items-center gap-3">
                    <i
                      className="i-Arrow-Right font-weight-900 text-primary cursor-pointer"
                      onClick={() => handleViewClick(invoice.id)}
                    />

                    <i
                      className="i-Folder-Trash font-weight-900 text-danger cursor-pointer"
                      onClick={() => handleDeleteInvoice(invoice)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
