import React, { useEffect, useState, useRef } from "react";
import { FiChevronDown, FiChevronUp, FiRefreshCw } from "react-icons/fi";
import { GrDocumentCsv } from "react-icons/gr";
import { useAuth } from "../AuthProvider";
import { BiSolidLike } from "react-icons/bi";
const languages = [
  { label: "English (USA)", value: "en-US" },
  { label: "German (Germany)", value: "de-DE" },
  { label: "Japanese (Japan)", value: "ja-JP" },
  { label: "Russian (Russia)", value: "ru-RU" },
];
const Home = () => {
  const {
    locale,
    setLocale,
    seed,
    setSeed,
    likes,
    setLikes,
    reviewsCount,
    setReviewsCount,
    generateBatch,
    coverUrls,
  } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [books, setBooks] = useState([]);
  const [batch, setBatch] = useState(0);
  const containerRef = useRef(null);
  useEffect(() => {
    const initialBatch0 = generateBatch(0);
    const initialBatch1 = generateBatch(1);
    setBooks([...initialBatch0, ...initialBatch1]);
    setBatch(1);
  }, [locale, seed, likes, reviewsCount]);
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottom) {
      const nextBatch = batch + 1;
      const newBooks = generateBatch(nextBatch);
      setBooks((prev) => [...prev, ...newBooks]);
      setBatch(nextBatch);
    }
  };
  const exportCSV = () => {
    if (!books.length) return;
    const headers = [
      "ID",
      "ISBN",
      "Title",
      "Author",
      "Publisher",
      "Likes",
      "Reviews Count",
      "Reviews (Quote - Author - Org)",
    ];
    const rows = books.map((book) => [
      book.id,
      book.isbn,
      `"${book.title}"`,
      `"${book.author}"`,
      `"${book.publisher}"`,
      book.likes,
      book.reviews.length,
      `"${book.reviews
        .map((r) => `${r.quote} — ${r.author}, ${r.org}`)
        .join(" | ")}"`,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `books_export_${new Date().toISOString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const randomIndex = Math.floor(Math.random() * coverUrls.length);
  const randomCover = coverUrls[randomIndex] || "";
  return (
    <div
      onScroll={handleScroll}
      ref={containerRef}
      className="max-h-screen overflow-y-auto   rounded-lg shadow-md"
    >
      <div className="sticky top-0 z-10">
        <div className="flex justify-between flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-6 sm:p-6 p-4 rounded-md bg-gray-50">
          <div className="relative w-full lg:w-fit">
            <select
              onChange={(e) => setLocale(e.target.value)}
              value={locale}
              className="w-full lg:w-auto px-6 pt-6 pb-2 font-semibold border border-gray-300 focus:outline-none focus:border-gray-300 bg-white rounded"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <span className="absolute left-7 top-[17px] text-gray-500 -translate-y-1/2">
              Language
            </span>
          </div>
          <div className="relative w-full lg:w-fit">
            <input
              type="number"
              className="w-full lg:w-auto border font-semibold border-gray-300 focus:outline-none focus:border-gray-300 bg-white rounded-md px-6 pt-6 pb-2"
              placeholder="Seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
            <FiRefreshCw
              className="absolute right-5 top-[48%] -translate-y-1/2 text-black cursor-pointer font-bold"
              size={18}
              onClick={() => setSeed(String(Math.floor(Math.random() * 10000)))}
            />
            <span className="absolute left-6 top-[17px] text-gray-500 -translate-y-1/2">
              seed
            </span>
          </div>
          <div className="flex flex-col gap-2 w-full lg:w-fit">
            <label className="text-sm font-medium">Likes</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={likes}
              onChange={(e) => setLikes(parseFloat(e.target.value))}
              className="w-full lg:w-32"
            />
          </div>
          <div className="relative w-full lg:w-fit">
            <input
              type="number"
              step="0.1"
              value={reviewsCount}
              onChange={(e) => setReviewsCount(parseFloat(e.target.value))}
              className="w-full lg:w-auto px-6 pt-6 pb-2 font-semibold bg-white focus:outline-none focus:border-gray-300 border border-gray-300 rounded"
            />
            <span className="absolute left-6 top-[17px] text-gray-500 -translate-y-1/2">
              Reviews
            </span>
          </div>
          <div className="w-full lg:w-fit">
            <GrDocumentCsv
              className="text-4xl cursor-pointer hover:text-blue-700 text-blue-500"
              onClick={exportCSV}
            />
          </div>
        </div>
        <table className="min-w-full table-auto text-left">
          <thead className="border-b border-gray-400 bg-white ">
            <tr className="s">
              <th className="p-2 ">#</th>
              <th className="p-2 ">ISBN</th>
              <th className="p-2">Title</th>
              <th className="p-2">Author(s)</th>
              <th className="p-2">Publisher</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        <table className="w-full  text-left">
          <tbody>
            {books.map((book, index) => (
              <React.Fragment key={book.id}>
                <tr
                  className={`cursor-pointer ${
                    expandedId === book.id ? "bg-blue-100" : "hover:bg-blue-100"
                  }`}
                  onClick={() =>
                    setExpandedId(expandedId === book.id ? null : book.id)
                  }
                >
                  <td className="p-2 flex items-center gap-2 font-semibold">
                    {expandedId === book.id ? (
                      <FiChevronUp className="text-gray-600" />
                    ) : (
                      <FiChevronDown className="text-gray-600" />
                    )}
                    {index + 1}
                  </td>
                  <td className="p-2">{book.isbn}</td>
                  <td className="p-2">{book.title}</td>
                  <td className="p-2">{book.author}</td>
                  <td className="p-2">{book.publisher}</td>
                </tr>
                {expandedId === book.id && (
                  <tr>
                    <td colSpan="5" className="bg-white px-6 py-4 ">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-4">
                          {randomCover ? (
                            <img
                              src={randomCover}
                              alt="Random Book Cover"
                              className="w-20 h-28 object-cover border rounded"
                            />
                          ) : (
                            <p>Loading...</p>
                          )}
                          <h1 className="py-1 px-2 text-xs flex items-center gap-1 text-white bg-blue-500 rounded-4xl">
                            {book.likes}
                            <BiSolidLike />
                          </h1>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold">
                            {book.title}{" "}
                            <span className="text-sm text-gray-500">
                              Paperback
                            </span>
                          </h2>
                          <p className="text-sm italic">by {book.author}</p>
                          <p className="text-xs text-gray-500">
                            {book.publisher}
                          </p>
                          <h3 className="mt-2 font-semibold">Reviews</h3>
                          <ul className="text-sm mt-1 space-y-1">
                            {(Array.isArray(book.reviews)
                              ? book.reviews
                              : []
                            ).map((r, i) => (
                              <li key={i}>
                                <p>{r.quote}</p>
                                <p className="text-gray-500 text-xs italic">
                                  — {r.author}, {r.org}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
