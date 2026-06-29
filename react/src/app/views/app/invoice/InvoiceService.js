import { axios } from "fake-db/mock";

export const getAllInvoice = () => axios.get("/api/invoices");

export const getInvoiceById = (id) => axios.get("/api/invoices/id", { data: id });

export const deleteInvoice = (invoice) => axios.post("/api/invoices/delete", invoice);

export const addInvoice = (invoice) => axios.post("/api/invoices/add", invoice);

export const updateInvoice = (invoice) => axios.post("/api/invoices/update", invoice);
