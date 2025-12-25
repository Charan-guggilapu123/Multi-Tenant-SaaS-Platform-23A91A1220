import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data.data.projects);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', newProject);
            setShowModal(false);
            setNewProject({ name: '', description: '' });
            fetchProjects();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating project');
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-300">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Projects</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-black border border-gray-700 text-white px-4 py-2 rounded-md hover:bg-neutral-900"
                >
                    Create New Project
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <div key={project.id} className="bg-neutral-800 border border-gray-800 overflow-hidden rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-white truncate">
                                <Link to={`/projects/${project.id}`}>{project.name}</Link>
                            </h3>
                            <p className="mt-1 text-sm text-gray-300 truncate">{project.description}</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'active' ? 'bg-green-900 text-green-200' : 'bg-gray-900 text-gray-200'}`}>
                                    {project.status}
                                </span>
                                <span className="text-sm text-gray-300">{project.taskCount} tasks</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 border border-gray-800 rounded-lg max-w-md w-full p-6 text-white">
                        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full bg-neutral-900 text-white border-gray-700 rounded-md focus:ring-0 focus:border-gray-600 sm:text-sm border p-2"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Description</label>
                                <textarea
                                    className="mt-1 block w-full bg-neutral-900 text-white border-gray-700 rounded-md focus:ring-0 focus:border-gray-600 sm:text-sm border p-2"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-neutral-900 border border-gray-700 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-black border border-gray-700 text-white px-4 py-2 rounded-md"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
