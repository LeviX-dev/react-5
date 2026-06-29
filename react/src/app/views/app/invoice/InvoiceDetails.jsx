import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "react-bootstrap/Card";

import InvoiceViewer from "./InvoiceViewer";
import InvoiceEditor from "./InvoiceEditor";

export default function InvoiceDetails() {
  const params = useParams();
  const [state, setState] = useState({ showInvoiceEditor: false, isNewInvoice: false });

  const toggleInvoiceEditor = () => {
    setState({ showInvoiceEditor: !state.showInvoiceEditor, isNewInvoice: false });
  };

  useEffect(() => {
    if (params.id === "create") setState({ showInvoiceEditor: true, isNewInvoice: false });
  }, [params]);

  return (
    <Card elevation={6} className="invoice-details m-sm-30">
      {state.showInvoiceEditor ? (
        <InvoiceEditor
          isNewInvoice={state.isNewInvoice}
          toggleInvoiceEditor={toggleInvoiceEditor}
        />
      ) : (
        <InvoiceViewer toggleInvoiceEditor={toggleInvoiceEditor} />
      )}
    </Card>
  );
}
