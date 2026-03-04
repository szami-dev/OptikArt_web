import { Fragment, useState } from "react";

interface Props {
  items: string[];
  heading: string;
}
function ListGroup({ items, heading }: Props) {
  const [selectedItem, setSelectedItem] = useState(-1);
  const [selectedName, setSelectedName] = useState("");
  //items = [];

  return (
    <Fragment>
      <h1>{heading}</h1>
      {items.length === 0 && <p>No items found</p>}
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={`list-group-item ${index === selectedItem ? "active" : ""}`}
            onClick={() => setSelectedItem(index)}
            key={item}
          >
            {item}
          </li>
        ))}
      </ul>
      <input
        type="text"
        name="name"
        id=""
        onChange={(e) => setSelectedName(e.target.value)}
      />
      <p>{selectedName}</p>
    </Fragment>
  );
}
export default ListGroup;
