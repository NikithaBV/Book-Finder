import React, { useState, useEffect, useRef } from "react";

function useDebouncedValue(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [numFound, setNumFound] = useState(0);
  const perPage = 20;
  const abortRef = useRef(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setNumFound(0);
      setError(null);
      setLoading(false);
      return;
    }

    const offset = (page - 1) * perPage;
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      debouncedQuery
    )}&limit=${perPage}&offset=${offset}`;

    setLoading(true);
    setError(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.docs || []);
        setNumFound(data.numFound || 0);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to fetch books.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-800 mb-8 flex items-center gap-2">
         Book Finder
      </h1>

      {/* Centered Search Bar */}
      <div className="w-full max-w-lg mb-8 ml-10">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search books by title..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      {loading && (
        <div className="flex justify-center mt-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <p className="text-center text-red-600 font-semibold mt-6">{error}</p>
      )}

      {!loading && results.length > 0 && (
        <div className="w-full flex flex-col items-center">
          <p className="text-gray-700 mb-4">
            Showing {results.length} of {numFound} results
          </p>

          {/* grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
            {results.map((book, i) => (
              <div
                key={i}
                className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden flex flex-col"
              >
                {book.cover_i ? (
                  <img
                    src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                    alt={book.title}
                    className="h-60 w-full object-cover"
                  />
                ) : (
                  <div className="h-60 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                    No Cover
                  </div>
                )}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <h2 className="font-semibold text-lg text-blue-800 mb-1">
                    {book.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {book.author_name ? book.author_name.join(", ") : "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 mt-auto">
                    {book.first_publish_year
                      ? `Published: ${book.first_publish_year}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* pagination */}
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-6 py-2 rounded-full font-medium shadow-md transition-all ${
                page === 1
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
              }`}
            >
              ⬅️ Previous
            </button>

            <span className="text-gray-700 font-semibold text-lg">
              Page {page}
            </span>

            <button
              disabled={results.length < perPage}
              onClick={() => setPage(page + 1)}
              className={`px-6 py-2 rounded-full font-medium shadow-md transition-all ${
                results.length < perPage
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
              }`}
            >
              Next ➡️
            </button>
          </div>
        </div>
      )}
      {/* footer */}
     <footer className="mt-10 py-4 text-center text-gray-600 border-t">
  © 2025 Nikitha. All rights reserved.
</footer>

    </div>
  );
}
