import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/utils';
import { FaArrowDown } from "react-icons/fa6";

function FeaturedCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check user authentication
    const user = JSON.parse(localStorage.getItem("user"));
    const isAuthenticated = !!user?.token;

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/course/courses`, {
                    withCredentials: true,
                });

                // Sort courses by creation date (newest first)
                const sortedCourses = response.data.courses.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setTimeout(() => {
                    setCourses(sortedCourses);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.log("Error in fetching courses", error);
                toast.error("Failed to fetch courses. Please try again.");
            }
        };
        fetchCourses();
    }, []);


    const handleViewDetails = (courseId) => {
        if (isAuthenticated) {
            // Navigate to the course details page if authenticated
            navigate(`/courses/${courseId}`);
        } else {
            // Show a message or prompt to log in
            toast.error("Please login to view course details.");
        }
    };

    return (
        <div className="transition-all duration-500">
            <div className="flex flex-col w-full h-auto transition-all duration-200">
                <div className="top-0 w-full fixed backdrop-blur-sm">
                    <Navbar />
                </div>

                <div className="py-10 px-4 md:px-20 flex flex-col text-white transition-all duration-500">
                    {loading ? (
                        <div className="flex justify-center items-center h-96 w-full">
                            <div className="loader"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex overflow-x-auto space-x-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-300 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-10">
                                {courses.slice(0, 8).map((course) => (  // ✅ Limits to max 6 courses
                                    <div
                                        key={course._id}
                                        className="w-[300px] flex-shrink-0 md:flex-shrink md:w-[400px] flex flex-col gap-4 "
                                    >
                                        <Link
                                            to={`/courses/${course._id}`}
                                            className="bg-[#171717] text-white flex flex-col flex-nowrap h-96 rounded-2xl relative"
                                        >
                                            <img
                                                src={course.image.url}
                                                alt={course.title}
                                                className="w-full h-52 md:h-64 object-cover rounded-t-2xl shadow-md"
                                            />
                                            <div className="flex flex-col justify-center px-6 py-4">
                                                <span className="text-lg font-semibold">{course.title}</span>
                                                <span className="text-sm text-gray-400">{course.description}</span>
                                                <span className="text-lg font-bold mt-2 absolute bottom-2">₹ {course.price}</span>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => handleViewDetails(course._id)}
                                            className="bg-[#24cfa6] rounded-md text-black py-2 font-semibold text-lg text-center"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                                <div className='flex flex-col justify-center items-center'>
                                    <Link to={'/courses'} className='bg-[#24cfa6] hover:scale-110 duration-300 px-4 py-1 text-base md:px-4 md:py-2 md:text-xl text-black rounded font-semibold font-mono flex flex-nowrap justify-center items-center gap-4'>Explore Courses <FaArrowDown className='-rotate-90' /> </Link>
                                </div>
                            </div>

                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FeaturedCourses;
