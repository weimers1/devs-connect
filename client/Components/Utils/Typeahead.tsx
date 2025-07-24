import React, { useState, useEffect, useRef } from 'react';

interface TypeaheadProps {
    apiEndpoint: string;
    id: string;
    inputClasses: string;
    placeHolder: string;
}

interface SearchResult {
    id: number;
    text: string;
}

const Typeahead = ({
    apiEndpoint,
    id,
    inputClasses,
    placeHolder,
}: TypeaheadProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(-1);
    const [hasSelected, setHasSelected] = useState(false);
    const [error, setError] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Delay search to prevent excessive API calls
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            console.log(hasSelected);
            if (searchTerm && !hasSelected) {
                // Skip search during selection
                performSearch(searchTerm);
            } else if (!searchTerm) {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, hasSelected]);

    const performSearch = async (term: string) => {
        try {
            const response = await fetch(
                `${apiEndpoint}?q=${encodeURIComponent(term)}`
            );
            const jsonResponse = await response.json();
            if (jsonResponse.status !== 200) {
                setError(jsonResponse.message);
                return;
            }
            setResults(jsonResponse.data);
            setIsOpen(true);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setIsOpen(false);
        }
    };

    const handleSelect = (result: SearchResult) => {
        setHasSelected(true); // Set flag to prevent search
        setSearchTerm(result.text);
        setSelectedId(result.id);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setSearchTerm(e.target.value);
        setSelectedId(-1); // Clear ID when user types new text
        setHasSelected(false); // Ensure typing allows searches
    };

    return (
        <div
            className="relative"
            ref={wrapperRef}
        >
            <input
                type="hidden"
                id={`${id}-id`}
                value={selectedId}
            />
            <input
                type="text"
                id={`${id}-text`}
                className={inputClasses}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm && setIsOpen(true)}
                autoComplete="off"
                placeholder={placeHolder}
            />
            <span
                className={`absolute block bg-gray-100/75 px-4 py-2 rounded-md w-75 text-xs text-red-700 ${
                    error !== '' ? '' : 'hidden'
                }`}
            >
                {error}
            </span>
            {isOpen && results.length > 0 && (
                <ul
                    className="absolute z-2 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg"
                    role="listbox"
                >
                    {results.map((result) => (
                        <li
                            key={result.id}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelect(result)}
                            role="option"
                        >
                            {result.text}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Typeahead;
