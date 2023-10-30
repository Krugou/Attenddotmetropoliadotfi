import React, { useState } from 'react';
import apiHooks from '../../../../hooks/ApiHooks';
// this is view for teacher to create the course
const TeacherCreateCourse: React.FC = () => {
    const [courseName, setCourseName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [courseTopics, setCourseTopics] = useState<string[]>([]);
    const [customTopics, setCustomTopics] = useState<string[]>(['']);
    const [courseCode, setCourseCode] = useState('');
    const [studentGroup, setStudentGroup] = useState('');
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFile(event.target.files ? event.target.files[0] : null);
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTopics = Array.from(e.target.selectedOptions, option => option.value);
        setCourseTopics(selectedTopics);
    };

    const addCustomTopic = () => {
        setCustomTopics(prevTopics => [...prevTopics, '']);
    };

    const handleCustomTopicChange = (index: number, value: string) => {
        const newTopics = [...customTopics];
        newTopics[index] = value;
        setCustomTopics(newTopics);
    };

    const [shouldCheckDetails, setShouldCheckDetails] = useState(true);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // If the checkbox is checked, verify the course details
        if (shouldCheckDetails) {
            console.log('Checking course details...');
            const response = await apiHooks.checkIfCourseExists({
                codes: courseCode,
                studentGroups: studentGroup,
            });

            console.log('Received response:', response);

            // If the course details do not exist, show an error message and return
            if (!response.exists) {
                console.error('Course details do not exist');
                return;
            }

            console.log('Course details exist');
        }

        // If both checks pass, create the course
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('courseName', courseName);
            formData.append('courseCode', courseCode);
            formData.append('studentGroup', studentGroup);

            // Use the createCourse function here
            const response = await apiHooks.createCourse({
                courseName,
                courseCode,
                studentGroup,
                file,
            });

            if (response.ok) {
                console.log('Course created successfully');
                console.log('File uploaded successfully');
            } else {
                console.error('Course creation failed');
                console.error('File upload failed');
            }
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-1/2 bg-gray-100">
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Create Course</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-white p-6 rounded shadow-md">
                <input
                    type="text"
                    placeholder="Course Name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                    title="Enter the course name here example: Mediapalvelut-projekti"

                />
                <input
                    type="text"
                    placeholder="Course Code"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                    title="Enter the course code here example: TX00CG61-3009"

                />
                <input
                    type="text"
                    placeholder="Student Group"
                    value={studentGroup}
                    onChange={(e) => setStudentGroup(e.target.value)}
                    className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                    title="Enter the student group here example: tvt21-m"
                />
                <select
                    multiple
                    value={courseTopics}
                    onChange={handleTopicChange}
                    className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                    <option value="math">Math</option>
                    <option value="physics">Physics</option>
                    {/* Add more options as needed */}
                </select>
                {customTopics.map((topic, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder="Custom Topic"
                        value={topic}
                        onChange={(e) => handleCustomTopicChange(index, e.target.value)}
                        className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        title='add custom topics here example: "exam"'
                    />
                ))}
                <button
                    type="button"
                    onClick={addCustomTopic}
                    className="mb-3 w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add Custom Topic
                </button>
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                    <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M10 4a2 2 0 00-2 2v4a2 2 0 104 0V6a2 2 0 00-2-2zm0 12a6 6 0 100-12 6 6 0 000 12z" />
                    </svg>
                    <span className="mt-2 text-base leading-normal">Select a file</span>
                    <input type='file' className="hidden" onChange={handleFileChange} />
                </label>
                <label>
                    <span>Check Course Details</span>
                    <input
                        type="checkbox"
                        checked={shouldCheckDetails}
                        onChange={() => setShouldCheckDetails(prev => !prev)}
                    />
                </label>
                <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                    Create Course
                </button>
            </form>
        </div>
    );
};

export default TeacherCreateCourse;