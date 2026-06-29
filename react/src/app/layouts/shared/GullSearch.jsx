import { startTransition, useState } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import clsx from "clsx";

const PRODUCTS = [
  {
    name: "Headphone 1",
    category: "Gadget",
    currentPrice: 300,
    prevPrice: 400,
    status: "Sale",
    imgUrl: "/assets/images/products/headphone-1.jpg"
  },
  {
    name: "Bitz Headphone 1",
    category: "Gadget",
    currentPrice: 300,
    prevPrice: 400,
    status: "New",
    imgUrl: "/assets/images/products/headphone-2.jpg"
  },
  {
    name: "Sony Headphone 1",
    category: "Gadget",
    currentPrice: 300,
    prevPrice: 400,
    status: "New",
    imgUrl: "/assets/images/products/headphone-3.jpg"
  },
  {
    name: "Earphone 1",
    category: "Gadget",
    currentPrice: 300,
    prevPrice: 400,
    status: "New",
    imgUrl: "/assets/images/products/headphone-4.jpg"
  }
];

export default function GullSearch({ open, handleClose }) {
  const [query, setQuery] = useState("");

  const handleSearch = (event) => {
    event.persist();
    startTransition(() => {
      setQuery(event.target.value.toLowerCase());
    });
  };

  const searchList = PRODUCTS.filter((item) => item.name.toLowerCase().match(query));

  return (
    <div className={clsx({ "search-ui": true, open: open })}>
      <div className="d-flex justify-content-between align-items-center search-header o-hidden">
        <img src="/assets/images/logo.png" alt="" className="logo float-left" />
        <button className="search-close btn btn-icon bg-transparent mt-2" onClick={handleClose}>
          <i className="i-Close-Window text-22 text-muted" />
        </button>
      </div>

      <input
        autoFocus
        type="text"
        placeholder="Type here"
        className="search-input"
        onChange={handleSearch}
      />

      <div className="search-title">
        <span className="text-muted">Search results</span>
      </div>

      <div className="search-results list-horizontal">
        {searchList.map((item, index) => (
          <div key={index} className="list-item col-md-12 p-0">
            <div className="card o-hidden flex-row mb-4 d-flex align-items-center">
              <div className="list-thumb d-flex">
                <img src={item.imgUrl} alt="product" />
              </div>

              <div className="flex-grow-1 card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center flex-lg-row">
                <Link to="/" className="w-40 w-sm-100">
                  <div className="item-title">{item.name}</div>
                </Link>

                <p className="m-0 text-muted text-small w-15 w-sm-100">Gadget</p>

                <p className="m-0 text-muted text-small w-15 w-sm-100 d-flex align-items-center gap-1">
                  ${item.currentPrice}
                  <del className="text-secondary">${item.prevPrice}</del>
                </p>

                <p className="m-0 text-muted text-small w-15 w-sm-100 d-none d-lg-block item-badges">
                  <span
                    className={clsx({
                      badge: true,
                      "bg-danger": item.status === "Sale",
                      "bg-primary": item.status === "New"
                    })}>
                    {item.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <!-- PAGINATION CONTROL --> */}
      <div className="px-3 mt-5 d-flex flex-row justify-content-center">
        <ReactPaginate
          nextLabel=">>"
          previousLabel="<<"
          breakLabel="..."
          breakClassName="break-me"
          pageRangeDisplayed={5}
          marginPagesDisplayed={2}
          pageCount={Math.round(PRODUCTS.length / 5)}
          activeClassName="active"
          containerClassName="pagination"
          subContainerClassName="pages pagination"
        />
      </div>
    </div>
  );
}
