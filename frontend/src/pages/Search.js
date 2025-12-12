import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { coursesAPI } from '../api/courses';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const searchCourses = async () => {
      try {
        setLoading(true);
        
        // Fetch courses from API
        const allCourses = await coursesAPI.getCourses();
        
        if (query.trim()) {
          // Filter courses based on search query
          const results = allCourses.filter(course =>
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase()) ||
            (course.category && course.category.toLowerCase().includes(query.toLowerCase()))
          );
          setFilteredCourses(results);
          setNoResults(results.length === 0);
        } else {
          setFilteredCourses([]);
          setNoResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setNoResults(true);
      } finally {
        setLoading(false);
      }
    };
    
    searchCourses();
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      
      <div className="flex-grow">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <SearchIcon className="w-6 h-6 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
            </div>
            <p className="text-gray-600 mt-2">
              {query ? `Results for "${query}"` : 'Enter a search term to find courses'}
            </p>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <SearchIcon className="w-8 h-8 text-[#0056D2]" />
              </div>
              <p className="text-gray-600 mt-4">Searching...</p>
            </div>
          ) : noResults ? (
            <div className="text-center py-12">
              <X className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h2>
              <p className="text-gray-600 mb-8">
                {query 
                  ? `We couldn't find any courses matching "${query}". Try different keywords.`
                  : 'Please enter a search term to find courses.'
                }
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-[#0056D2] hover:bg-[#00419e] text-white"
              >
                Back to Home
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <SearchIcon className="w-12 h-12 text-white opacity-50" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1">{course.title}</h3>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          {course.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                          {course.level}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-[#0056D2] border-[#0056D2] hover:bg-blue-50"
                      >
                        View Course
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
