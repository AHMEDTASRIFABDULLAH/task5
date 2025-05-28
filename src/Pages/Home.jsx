import React from "react";
import { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiChevronUp, FiRefreshCw } from "react-icons/fi";
import { faker } from "@faker-js/faker/locale/en";
import { faker as fakerDe } from "@faker-js/faker/locale/de";
import { faker as fakerJp } from "@faker-js/faker/locale/ja";
import { faker as fakerRu } from "@faker-js/faker/locale/ru";
import { BiSolidLike } from "react-icons/bi";

const PEXELS_API_KEY =
  "ghYbRtUxLRpOsEAQyJEQv6YBBEIaa55oQjtaNJHQ1DM6hQlYD5ZNcPbL";
const languageMap = {
  "en-US": faker,
  "de-DE": fakerDe,
  "ja-JP": fakerJp,
  "ru-RU": fakerRu,
};

const languages = [
  { label: "English (USA)", value: "en-US" },
  { label: "German (Germany)", value: "de-DE" },
  { label: "Japanese (Japan)", value: "ja-JP" },
  { label: "Russian (Russia)", value: "ru-RU" },
];

const times = (n, fn) => {
  if (n < 0) throw new Error("The first argument cannot be negative.");
  return (arg) => {
    for (let i = Math.floor(n); i--; ) {
      arg = fn(arg);
    }
    return Math.random() < n % 1 ? fn(arg) : arg;
  };
};

const Home = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [locale, setLocale] = useState("en-US");
  const [seed, setSeed] = useState("1234");
  const [likes, setLikes] = useState(3.7);
  const [reviewsCount, setReviewsCount] = useState(4.7);
  const [books, setBooks] = useState([]);
  const [batch, setBatch] = useState(0);
  const containerRef = useRef(null);

  const generateSampleReviews = (count, fake) =>
    Array.from({ length: count }, () => ({
      quote: fake.lorem.sentence(),
      author: fake.person.fullName(),
      org: fake.company.name(),
    }));

  const generateBatch = (batchIndex) => {
    const fake = languageMap[locale];
    fake.seed(`${seed}-${batchIndex}`);
    const newBatch = [];
    const addLikes = times(likes, (prev) => prev + 1);
    const addReviews = times(reviewsCount, (prev) => prev + 1);

    for (let i = 0; i < 10; i++) {
      const idx = batchIndex * 10 + i + 1;
      const totalLikes = addLikes(0);
      const totalReviews = Math.floor(addReviews(0));
      newBatch.push({
        id: idx,
        isbn: fake.string.alphanumeric(13),
        title: fake.lorem.words(3),
        author: fake.person.fullName(),
        publisher: fake.company.name(),
        likes: totalLikes,
        reviews: generateSampleReviews(totalReviews, fake),
      });
    }
    return newBatch;
  };

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

  const [coverUrls, setCoverUrls] = useState([]);

  useEffect(() => {
    fetch("https://api.pexels.com/v1/search?query=book%20cover&per_page=23", {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const urls = data.photos.map((photo) => photo.src.large);
        setCoverUrls(urls);
      })
      .catch((err) => console.error(err));
  }, []);

  const randomIndex = Math.floor(Math.random() * coverUrls.length);
  const randomCover = coverUrls[randomIndex] || "";

  return (
    <div
      onScroll={handleScroll}
      ref={containerRef}
      className="max-h-screen overflow-y-auto   rounded-lg shadow-md"
    >
      <div className="sticky top-0">
        <div className="flex flex-wrap gap-4  p-6 rounded-md bg-gray-100  ">
          <div className="relative w-fit">
            <select
              onChange={(e) => setLocale(e.target.value)}
              value={locale}
              className="px-6 pt-6 pb-2  font-semibold border border-gray-300 focus:outline-none focus:border-gray-300  bg-white rounded"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <span className="absolute left-7 top-[17px] text-gray-500 -translate-y-1/2 ">
              Language
            </span>
          </div>

          <div className="relative w-fit">
            <input
              type="number"
              className="border font-semibold  border-gray-300 focus:outline-none focus:border-gray-300  fo  bg-white rounded-md px-6 pt-6 pb-2"
              placeholder="Seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
            <FiRefreshCw
              className="absolute right-5 top-[48%] -translate-y-1/2 text-black cursor-pointer font-bold"
              size={18}
              onClick={() => setSeed(String(Math.floor(Math.random() * 10000)))}
            />
            <span className="absolute left-6 top-[17px] text-gray-500 -translate-y-1/2 ">
              seed
            </span>
          </div>

          <div className="flex justify-between flex-col">
            <label className="text-sm font-medium">Likes </label>

            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={likes}
              onChange={(e) => setLikes(parseFloat(e.target.value))}
              className="w-32"
            />
          </div>
          <div className="relative w-fit">
            <input
              type="number"
              step="0.1"
              value={reviewsCount}
              onChange={(e) => setReviewsCount(parseFloat(e.target.value))}
              className="px-6 pt-6 pb-2 font-semibold bg-white focus:outline-none focus:border-gray-300  border border-gray-300 rounded "
            />
            <span className="absolute left-6 top-[17px] text-gray-500 -translate-y-1/2 ">
              Reviews
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        <table className="w-full text-left">
          <thead className="border-b sticky">
            <tr className="s">
              <th className="p-2">#</th>
              <th className="p-2">ISBN</th>
              <th className="p-2">Title</th>
              <th className="p-2">Author(s)</th>
              <th className="p-2">Publisher</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <React.Fragment key={book.id}>
                <tr
                  className={`cursor-pointer ${
                    expandedId === book.id ? "bg-blue-100" : "hover:bg-gray-100"
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
                    <td colSpan="5" className="bg-white px-6 py-4 border-t">
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
