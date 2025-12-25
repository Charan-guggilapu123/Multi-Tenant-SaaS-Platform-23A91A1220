import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

    // Fetch Data
    const fetchData = async () => {
        try {
            // Get single project details
            const projectRes = await api.get(`/projects/${projectId}`);
            setProject(projectRes.data.data);

            // Get tasks for this project
            const tasksRes = await api.get(`/projects/${projectId}/tasks`);
            setTasks(tasksRes.data.data.tasks);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/projects/${projectId}/tasks`, newTask);
            setShowTaskModal(false);
            setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating task');
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
            fetchData();
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchData();
        } catch (error) {
            alert('Error deleting task');
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-300">Loading...</div>;
    if (!project) return <div className="text-center py-8 text-gray-300">Project not found</div>;

    return (
        <div>
            <div className="mb-6">
                <Link to="/projects" className="text-white hover:text-gray-300">← Back to Projects</Link>
            </div>

            <div className="bg-neutral-800 border border-gray-800 overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-white">{project.name}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-300">{project.description}</p>
                </div>
                <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'active' ? 'bg-green-900 text-green-200' : 'bg-gray-900 text-gray-200'}`}>
                        {project.status}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                <button
                    onClick={() => setShowTaskModal(true)}
                    className="bg-black border border-gray-700 text-white px-4 py-2 rounded-md hover:bg-neutral-900"
                >
                    Add Task
                </button>
            </div>

            <div className="bg-neutral-800 border border-gray-800 overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-700">
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                            className="text-xs rounded-full px-2 py-1 bg-neutral-900 text-white border-gray-700"
                                        >
                                            <option value="todo">Todo</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-300 mr-4">
                                            Priority: {task.priority}
                                        </p>
                                        <p className="flex items-center text-sm text-gray-300">
                                            Assigned: {task.assignee?.fullName || 'Unassigned'}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-300 sm:mt-0">
                                        <button onClick={() => handleDeleteTask(task.id)} className="text-red-300 hover:text-red-200 ml-4">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 border border-gray-800 rounded-lg max-w-md w-full p-6 text-white">
                        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full bg-neutral-900 text-white border-gray-700 rounded-md focus:ring-0 focus:border-gray-600 sm:text-sm border p-2"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Priority</label>
                                <select
                                    className="mt-1 block w-full bg-neutral-900 text-white border-gray-700 rounded-md focus:ring-0 focus:border-gray-600 sm:text-sm border p-2"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
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

export default ProjectDetails;
