import { Fragment, useState } from "react";

function App() {
  let items = [
    "An item",
    "A second item",
    "A third item",
    "A fourth item",
    "And a fifth one",
  ];
  const [selectedItem, setSelectedItem] = useState(-1);
  //items = [];

  return (
    <Fragment>
      <h1>List</h1>
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
    </Fragment>
  );
}
export default App;
