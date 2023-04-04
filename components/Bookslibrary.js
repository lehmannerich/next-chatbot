export default function Bookslibrary({ books, selected, setSelected }) {
  function handleSelect(book) {
    setSelected(book);
  }

  return (
    <div className="w-full py-2">
      <ul className="flex gap-3 text-xs flex-wrap">
        {books.map((book, index) => (
          <li
            key={index}
            onClick={() => handleSelect(book)}
            className={`cursor-pointer inline-block ${
              book.table_key === selected.table_key
                ? "text-neutral-900"
                : "text-neutral-400"
            }`}
          >
            <div
              className="cover mb-2"
              style={{
                backgroundImage: `linear-gradient(to right, rgb(20, 13, 20) 3px, rgba(255, 255, 255, 0.5) 5px, rgba(255, 255, 255, 0.25) 7px, rgba(255, 255, 255, 0.25) 10px, transparent 12px, transparent 16px, rgba(255, 255, 255, 0.25) 17px, transparent 22px), url(${book.cover})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            ></div>
            {book.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
