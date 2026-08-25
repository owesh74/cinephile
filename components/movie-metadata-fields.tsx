"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type Person = {
  id: string;
  name: string;
  photoUrl: string | null;
};

type CastEntry = {
  personId: string;
  name: string;
  characterName: string;
};

type MovieMetadataFieldsProps = {
  people: Person[];

  initialGenres?: string[];
  initialCountries?: string[];
  initialLanguage?: string | null;
  initialDirector?: string;
  initialWriters?: string[];
  initialCast?: string[];
};

const COMMON_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
  "Musical",
  "History",
  "Biography",
  "Sport",
];

const COMMON_LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Japanese",
  "Korean",
  "Chinese",
  "Portuguese",
  "Russian",
  "Arabic",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Bengali",
  "Marathi",
  "Punjabi",
  "Turkish",
  "Dutch",
];

const COMMON_COUNTRIES = [
  "United States",
  "United Kingdom",
  "India",
  "Canada",
  "Australia",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Japan",
  "South Korea",
  "China",
  "Hong Kong",
  "Ireland",
  "Mexico",
  "Brazil",
  "Russia",
  "New Zealand",
];

function parsePersonNames(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCast(value: string | undefined): CastEntry[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, ...characterParts] = entry.split(" as ");

      return {
        personId: "",
        name: name.trim(),
        characterName: characterParts.join(" as ").trim(),
      };
    });
}

export function MovieMetadataFields({
  people,
  initialGenres = [],
  initialCountries = [],
  initialLanguage = "",
  initialDirector = "",
  initialWriters = [],
  initialCast = [],
}: MovieMetadataFieldsProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialGenres
  );

  const [customGenre, setCustomGenre] = useState("");

  const [selectedCountries, setSelectedCountries] =
    useState<string[]>(initialCountries);

  const [countrySearch, setCountrySearch] = useState("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const countrySearchRef = useRef<HTMLDivElement>(null);

  const [language, setLanguage] = useState(initialLanguage ?? "");

  const [customLanguage, setCustomLanguage] = useState("");

  const [director, setDirector] = useState(initialDirector);

  const [directorSearch, setDirectorSearch] = useState("");

  const [writers, setWriters] = useState<string[]>(
    initialWriters.length > 0
      ? initialWriters
      : parsePersonNames(initialWriters.join(", "))
  );

  const [writerSearch, setWriterSearch] = useState("");

  const [cast, setCast] = useState<CastEntry[]>(
    initialCast.length > 0
      ? parseCast(initialCast.join(", "))
      : []
  );

  const [castSearch, setCastSearch] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [selectedCastPerson, setSelectedCastPerson] = useState<Person | null>(
    null
  );

  const [showAllGenres, setShowAllGenres] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        countrySearchRef.current &&
        !countrySearchRef.current.contains(event.target as Node)
      ) {
        setShowCountrySuggestions(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const filteredGenres = showAllGenres
    ? COMMON_GENRES
    : COMMON_GENRES.slice(0, 10);

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();

    if (!query) {
      return COMMON_COUNTRIES.slice(0, 8);
    }

    return COMMON_COUNTRIES.filter((country) =>
      country.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [countrySearch]);

  const directorSuggestions = useMemo(() => {
    const query = directorSearch.trim().toLowerCase();

    if (!query) return [];

    return people
      .filter((person) =>
        person.name.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [people, directorSearch]);

  const writerSuggestions = useMemo(() => {
    const query = writerSearch.trim().toLowerCase();

    if (!query) return [];

    return people
      .filter((person) =>
        person.name.toLowerCase().includes(query)
      )
      .filter((person) => !writers.includes(person.name))
      .slice(0, 6);
  }, [people, writerSearch, writers]);

  const castSuggestions = useMemo(() => {
    const query = castSearch.trim().toLowerCase();

    if (!query) return [];

    return people
      .filter((person) =>
        person.name.toLowerCase().includes(query)
      )
      .filter(
        (person) =>
          !cast.some((entry) => entry.name === person.name)
      )
      .slice(0, 6);
  }, [people, castSearch, cast]);

  function toggleGenre(genre: string) {
    setSelectedGenres((current) =>
      current.includes(genre)
        ? current.filter((item) => item !== genre)
        : [...current, genre]
    );
  }

  function addCustomGenre() {
    const genre = customGenre.trim();

    if (!genre) return;

    if (!selectedGenres.includes(genre)) {
      setSelectedGenres((current) => [...current, genre]);
    }

    setCustomGenre("");
  }

  function toggleCountry(country: string) {
    setSelectedCountries((current) =>
      current.includes(country)
        ? current.filter((item) => item !== country)
        : [...current, country]
    );
  }

  function addCustomCountry() {
    const country = countrySearch.trim();

    if (!country) return;

    if (!selectedCountries.includes(country)) {
      setSelectedCountries((current) => [...current, country]);
    }

    setCountrySearch("");
  }

  function addWriter(name: string) {
    if (!name.trim()) return;

    if (!writers.includes(name)) {
      setWriters((current) => [...current, name]);
    }

    setWriterSearch("");
  }

  function removeWriter(name: string) {
    setWriters((current) =>
      current.filter((writer) => writer !== name)
    );
  }

  // Selecting an existing actor does NOT add them immediately.
  // It selects the actor so the user can enter their character first.
  function selectCastPerson(person: Person) {
    setSelectedCastPerson(person);
    setCastSearch(person.name);
  }

  function addSelectedCastPerson() {
    if (!selectedCastPerson) return;

    const person = selectedCastPerson;
    const character = characterName.trim();

    setCast((current) => {
      if (
        current.some(
          (item) =>
            item.personId === person.id ||
            item.name.toLowerCase() === person.name.toLowerCase()
        )
      ) {
        return current;
      }

      return [
        ...current,
        {
          personId: person.id,
          name: person.name,
          characterName: character,
        },
      ];
    });

    setSelectedCastPerson(null);
    setCastSearch("");
    setCharacterName("");
  }

  function addCustomCast() {
    const name = castSearch.trim();

    if (!name) return;

    setCast((current) => {
      if (
        current.some(
          (item) => item.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        return current;
      }

      return [
        ...current,
        {
          personId: "",
          name,
          characterName: characterName.trim(),
        },
      ];
    });

    setSelectedCastPerson(null);
    setCastSearch("");
    setCharacterName("");
  }

  function removeCast(name: string) {
    setCast((current) =>
      current.filter((entry) => entry.name !== name)
    );
  }

  return (
    <div className="space-y-7">

      {/* Genres */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Genres</h3>
          <p className="text-xs text-muted-foreground">
            Select one or more genres.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredGenres.map((genre) => {
            const selected = selectedGenres.includes(genre);

            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                }`}
              >
                {selected ? "✓ " : ""}
                {genre}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowAllGenres((value) => !value)}
          className="text-xs underline text-muted-foreground"
        >
          {showAllGenres ? "Show fewer" : "Show all genres"}
        </button>

        {selectedGenres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-md bg-muted px-2.5 py-1 text-xs"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomGenre();
              }
            }}
            placeholder="Add custom genre..."
          />

          <button
            type="button"
            onClick={addCustomGenre}
            className="rounded-md border px-4 text-sm hover:bg-muted"
          >
            Add
          </button>
        </div>

        <input
          type="hidden"
          name="genres"
          value={selectedGenres.join(", ")}
        />
      </section>

      {/* Countries */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Countries</h3>
          <p className="text-xs text-muted-foreground">
            Select all countries involved in the movie.
          </p>
        </div>

        <div ref={countrySearchRef} className="relative">
          <Input
            value={countrySearch}
            onFocus={() => setShowCountrySuggestions(true)}
            onChange={(e) => {
              setCountrySearch(e.target.value);
              setShowCountrySuggestions(true);
            }}
            placeholder="Search country..."
          />

          {showCountrySuggestions && countrySearch && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
              {filteredCountries.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => {
                    toggleCountry(country);
                    setCountrySearch("");
                    setShowCountrySuggestions(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {selectedCountries.includes(country) ? "✓ " : ""}
                  {country}
                </button>
              ))}

              {!filteredCountries.some(
                (country) =>
                  country.toLowerCase() ===
                  countrySearch.trim().toLowerCase()
              ) && (
                <button
                  type="button"
                  onClick={() => {
                    addCustomCountry();
                    setShowCountrySuggestions(false);
                  }}
                  className="block w-full border-t px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  + Add "{countrySearch.trim()}"
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedCountries.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => toggleCountry(country)}
              className="rounded-md border border-primary bg-primary/10 px-3 py-1.5 text-xs"
            >
              {country} ×
            </button>
          ))}
        </div>

        <input
          type="hidden"
          name="countries"
          value={selectedCountries.join(", ")}
        />
      </section>

      {/* Language */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Language</h3>
          <p className="text-xs text-muted-foreground">
            Choose a common language or enter your own.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={
              COMMON_LANGUAGES.includes(language)
                ? language
                : ""
            }
            onChange={(e) => {
              setLanguage(e.target.value);
              setCustomLanguage("");
            }}
            className="h-10 rounded-md border border-border bg-input px-3 text-sm text-foreground"
          >
            <option value="">Choose language...</option>

            {COMMON_LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <Input
            value={customLanguage}
            onChange={(e) => {
              setCustomLanguage(e.target.value);
              setLanguage(e.target.value);
            }}
            placeholder="Or enter custom language"
          />
        </div>

        <input
          type="hidden"
          name="language"
          value={language}
        />
      </section>

      {/* Director */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Director</h3>
          <p className="text-xs text-muted-foreground">
            Search people already in Cinephile.
          </p>
        </div>

        <div className="relative">
          <Input
            value={directorSearch || director}
            onChange={(e) => {
              setDirectorSearch(e.target.value);
              setDirector(e.target.value);
            }}
            placeholder="Search director..."
          />

          {directorSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
              {directorSuggestions.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    setDirector(person.name);
                    setDirectorSearch("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                >
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                    {person.photoUrl ? (
                      <img
                        src={person.photoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs">
                        {person.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <span className="text-sm">
                    {person.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="hidden"
          name="director"
          value={director}
        />
      </section>

      {/* Writers */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Writers</h3>
          <p className="text-xs text-muted-foreground">
            Search and add multiple writers.
          </p>
        </div>

        {writers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {writers.map((writer) => (
              <button
                key={writer}
                type="button"
                onClick={() => removeWriter(writer)}
                className="rounded-md border border-primary bg-primary/10 px-3 py-1.5 text-xs"
              >
                {writer} ×
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <Input
            value={writerSearch}
            onChange={(e) => setWriterSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addWriter(writerSearch);
              }
            }}
            placeholder="Search writer..."
          />

          {writerSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
              {writerSuggestions.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => addWriter(person.name)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                    {person.photoUrl ? (
                      <img
                        src={person.photoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs">
                        {person.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <span className="text-sm">
                    {person.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="hidden"
          name="writers"
          value={writers.join(", ")}
        />
      </section>

      {/* Cast */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Cast</h3>
          <p className="text-xs text-muted-foreground">
            Search an actor and optionally enter their character.
          </p>
        </div>

        {cast.length > 0 && (
          <div className="space-y-2">
            {cast.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {entry.name}
                  </p>

                  {entry.characterName && (
                    <p className="text-xs text-muted-foreground">
                      as {entry.characterName}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeCast(entry.name)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
          <div className="relative">
            <Input
              value={castSearch}
              onChange={(e) => {
                setCastSearch(e.target.value);

                if (
                  selectedCastPerson &&
                  e.target.value !== selectedCastPerson.name
                ) {
                  setSelectedCastPerson(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (selectedCastPerson) {
                    addSelectedCastPerson();
                  } else if (castSearch.trim()) {
                    addCustomCast();
                  }
                }
              }}
              placeholder="Search actor..."
            />

            {castSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
                {castSuggestions.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => selectCastPerson(person)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                  >
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                      {person.photoUrl ? (
                        <img
                          src={person.photoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs">
                          {person.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <span className="text-sm">
                      {person.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Character name (optional)"
            />

            {selectedCastPerson && (
              <button
                type="button"
                onClick={addSelectedCastPerson}
                className="w-full rounded-md border border-primary bg-primary/10 px-3 py-2 text-sm font-medium hover:bg-primary/20"
              >
                Add {selectedCastPerson.name}
                {characterName.trim()
                  ? ` as ${characterName.trim()}`
                  : ""}
              </button>
            )}
          </div>
        </div>

        {castSearch.trim() &&
          !selectedCastPerson &&
          castSuggestions.length === 0 && (
            <button
              type="button"
              onClick={addCustomCast}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              + Add "{castSearch.trim()}" as a new actor
            </button>
          )}

        <input
          type="hidden"
          name="cast"
          value={cast
            .map((entry) =>
              entry.characterName
                ? `${entry.name} as ${entry.characterName}`
                : entry.name
            )
            .join(", ")}
        />
      </section>
    </div>
  );
}