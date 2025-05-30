import React, { createContext, useContext, useState, useEffect } from "react";
import { faker } from "@faker-js/faker/locale/en";
import { faker as fakerDe } from "@faker-js/faker/locale/de";
import { faker as fakerJp } from "@faker-js/faker/locale/ja";
import { faker as fakerRu } from "@faker-js/faker/locale/ru";
const AuthContext = createContext();
const PEXELS_API_KEY =
  "ghYbRtUxLRpOsEAQyJEQv6YBBEIaa55oQjtaNJHQ1DM6hQlYD5ZNcPbL";
const languageMap = {
  "en-US": faker,
  "de-DE": fakerDe,
  "ja-JP": fakerJp,
  "ru-RU": fakerRu,
};
export const AuthProvider = ({ children }) => {
  const [locale, setLocale] = useState("en-US");
  const [seed, setSeed] = useState("1234");
  const [likes, setLikes] = useState(3.7);
  const [reviewsCount, setReviewsCount] = useState(4.7);
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

  const times = (n, fn) => {
    if (n < 0) throw new Error("The first argument cannot be negative.");
    return (arg) => {
      for (let i = Math.floor(n); i--; ) {
        arg = fn(arg);
      }
      return Math.random() < n % 1 ? fn(arg) : arg;
    };
  };

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

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
