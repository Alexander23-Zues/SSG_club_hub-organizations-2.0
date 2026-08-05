import { useSearchParams } from 'react-router-dom';

// Returns the `q` search param from the URL
const useSearchQuery = () => {
  const [params] = useSearchParams();
  return params.get('q') || '';
};

export default useSearchQuery;
