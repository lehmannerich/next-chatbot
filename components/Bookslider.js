export default function Bookslider({ books, selected, setSelected }) {
  function handleSelect(book) {
    setSelected(book);
  }
  return (
    <div className="w-full py-2">
      <ul className="flex gap-2 text-xs justify-end">
        {books.map((book, index) => (
          <li
            key={index}
            onClick={() => handleSelect(book)}
            className={`cursor-pointer inline-block text-neutral-400 ${
              book.table_key === selected.table_key ? "text-neutral-900" : ""
            }`}
          >
            {book.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
