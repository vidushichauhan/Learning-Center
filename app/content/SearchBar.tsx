interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
  }
  
  const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => (
    <input
      type="text"
      placeholder="Search courses..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="border p-2 rounded w-full md:w-1/2 mx-auto mb-10 block text-center"
    />
  );
  
  export default SearchBar;
  