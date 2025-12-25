import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Get User/Tenant Info
                const meResponse = await api.get('/auth/me');
                const tenantId = meResponse.data.data.tenant.id;
                const userId = meResponse.data.data.id;

                // Get Projects
                const projectsRes = await api.get('/projects?limit=5');
                const projects = projectsRes.data.data.projects || [];
                setRecentProjects(projects);

                // Get Tenant Stats
                const tenantRes = await api.get(`/tenants/${tenantId}`);
                const tenantStats = tenantRes.data.data.stats || {};

                // Fetch My Tasks - aggregate from all projects
                let allTasks = [];
                if (projects && projects.length > 0) {
                    for (const project of projects.slice(0, 3)) { // Limit to first 3 projects for performance
                        try {
                            const tasksRes = await api.get(`/projects/${project.id}/tasks?limit=100`);
                            const tasks = tasksRes.data.data.tasks || [];
                            allTasks = allTasks.concat(tasks.map(t => ({ ...t, projectName: project.name })));
                        } catch (e) {
                            console.warn(`Failed to fetch tasks for project ${project.id}`);
                        }
                    }
                }

                // Filter tasks assigned to current user
                const userTasks = allTasks.filter(t => t.assignedTo?.id === userId).slice(0, 5);

                // Count completed vs pending
                const completed = allTasks.filter(t => t.status === 'completed').length;
                const pending = allTasks.filter(t => t.status !== 'completed').length;

                setMyTasks(userTasks);
                setStats({
                    totalProjects: tenantStats.totalProjects || projects.length || 0,
                    totalTasks: tenantStats.totalTasks || allTasks.length || 0,
                    completedTasks: completed,
                    pendingTasks: pending
                });

                setLoading(false);
            } catch (error) {
                console.error("Dashboard fetch error", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center py-8 text-gray-300">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-neutral-800 border border-gray-800 rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-300 truncate">Total Projects</dt>
                        <dd className="mt-1 text-3xl font-semibold text-white">{stats.totalProjects}</dd>
                    </div>
                </div>
                <div className="bg-neutral-800 border border-gray-800 rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-300 truncate">Total Tasks</dt>
                        <dd className="mt-1 text-3xl font-semibold text-white">{stats.totalTasks}</dd>
                    </div>
                </div>
                <div className="bg-neutral-800 border border-gray-800 rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-300 truncate">Completed</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-300">{stats.completedTasks}</dd>
                    </div>
                </div>
                <div className="bg-neutral-800 border border-gray-800 rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-300 truncate">Pending</dt>
                        <dd className="mt-1 text-3xl font-semibold text-yellow-300">{stats.pendingTasks}</dd>
                    </div>
                </div>
            </div>

            {/* My Tasks */}
            {myTasks.length > 0 && (
                <div className="bg-neutral-800 border border-gray-800 sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-white">My Tasks</h3>
                    </div>
                    <div className="border-t border-gray-700">
                        <ul className="divide-y divide-gray-700">
                            {myTasks.map((task) => (
                                <li key={task.id}>
                                    <div className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{task.title}</p>
                                                <p className="text-xs text-gray-300">{task.projectName}</p>
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    task.status === 'completed' ? 'bg-green-900 text-green-200' :
                                                    task.status === 'in_progress' ? 'bg-blue-900 text-blue-200' :
                                                    'bg-gray-900 text-gray-200'
                                                }`}>
                                                    {task.status}
                                                </span>
                                                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    task.priority === 'high' ? 'bg-red-900 text-red-200' :
                                                    task.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                                                    'bg-gray-900 text-gray-200'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Recent Projects */}
            <div className="bg-neutral-800 border border-gray-800 sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-white">Recent Projects</h3>
                </div>
                <div className="border-t border-gray-700">
                    {recentProjects.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-300">
                            No projects yet. <Link to="/projects" className="text-indigo-600 hover:text-indigo-500">Create one</Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-700">
                            {recentProjects.map((project) => (
                                <li key={project.id}>
                                    <Link to={`/projects/${project.id}`} className="block hover:bg-neutral-900">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-white truncate">{project.name}</p>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'active' ? 'bg-green-900 text-green-200' : 'bg-gray-900 text-gray-200'}`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-300">
                                                        Tasks: {project.taskCount || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
