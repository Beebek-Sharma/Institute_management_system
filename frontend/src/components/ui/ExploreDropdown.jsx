import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { coursesAPI } from "../../api/courses";

export default function ExploreDropdown({ open }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchExploreData();
    }
  }, [open]);

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      const allCourses = await coursesAPI.getCourses();
      setCourses(allCourses.slice(0, 8)); // Show first 8 courses
      
      // Extract unique categories from courses
      const uniqueCategories = [...new Set(allCourses.map(c => c.category).filter(Boolean))].slice(0, 8);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching explore data:", error);
    } finally {
      setLoading(false);
    }
  };

  const staticSkills = [
    "Python", "React", "Machine Learning", "SQL",
    "JavaScript", "Data Science", "Cloud Computing", "Web Development"
  ];

  const staticRoles = [
    "Full Stack Developer", "Data Analyst", "Project Manager", 
    "UI/UX Designer", "DevOps Engineer", "Product Manager",
    "Business Analyst", "System Administrator"
  ];

  if (!open) return null;

  return (
    <div
      className="absolute left-0 top-full w-[1000px] bg-white shadow-2xl z-[100] border-b border-gray-200"
      style={{ minHeight: '320px', overflow: 'visible' }}
    >
      {loading ? (
        <div className="px-8 py-8 flex justify-center items-center" style={{ minHeight: '320px' }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading explore content...</p>
          </div>
        </div>
      ) : (
        <div className="px-8 py-8 grid grid-cols-4 gap-8">
          {/* Explore Roles */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 text-base">Explore Roles</h4>
            <ul className="space-y-2">
              {staticRoles.map((role, i) => (
                <li
                  key={i}
                  className="hover:text-blue-600 cursor-pointer text-gray-700 text-sm transition"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(role)}`)}
                >
                  {role}
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate('/courses')}
                  className="text-blue-600 hover:underline text-sm font-medium mt-2"
                >
                  View all →
                </button>
              </li>
            </ul>
          </div>

          {/* Explore Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 text-base">Explore Categories</h4>
            <ul className="space-y-2">
              {categories.length > 0 ? (
                <>
                  {categories.map((category, i) => (
                    <li
                      key={i}
                      className="hover:text-blue-600 cursor-pointer text-gray-700 text-sm transition"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(category)}`)}
                    >
                      {category}
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => navigate('/courses')}
                      className="text-blue-600 hover:underline text-sm font-medium mt-2"
                    >
                      View all →
                    </button>
                  </li>
                </>
              ) : (
                <li className="text-gray-500 text-sm">No categories available</li>
              )}
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 text-base">Popular Courses</h4>
            <ul className="space-y-2">
              {courses.length > 0 ? (
                <>
                  {courses.map((course, i) => (
                    <li
                      key={i}
                      className="hover:text-blue-600 cursor-pointer text-gray-700 text-sm transition line-clamp-2"
                      title={course.title}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      {course.title}
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => navigate('/courses')}
                      className="text-blue-600 hover:underline text-sm font-medium mt-2"
                    >
                      View all →
                    </button>
                  </li>
                </>
              ) : (
                <li className="text-gray-500 text-sm">No courses available</li>
              )}
            </ul>
          </div>

          {/* Trending Skills */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 text-base">Trending Skills</h4>
            <ul className="space-y-2">
              {staticSkills.map((skill, i) => (
                <li
                  key={i}
                  className="hover:text-blue-600 cursor-pointer text-gray-700 text-sm transition"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(skill)}`)}
                >
                  {skill}
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate('/courses')}
                  className="text-blue-600 hover:underline text-sm font-medium mt-2"
                >
                  View all →
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
