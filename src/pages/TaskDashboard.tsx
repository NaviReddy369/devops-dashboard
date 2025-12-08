import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Brain, Clock, User, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedHours: number | null;
  userName: string;
  userEmail: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const TaskDashboard = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let q;
    if (filter === 'all') {
      q = query(
        collection(db, 'neuralTasks'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'neuralTasks'),
        where('userId', '==', currentUser.uid),
        where('status', '==', filter),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData: Task[] = [];
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, filter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-200 text-lg">Please log in to view your task dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-300" />
            <div>
              <h1 className="text-3xl font-bold">Neural Task Dashboard</h1>
              <p className="text-purple-200">Monitor your submitted tasks</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-purple-200 hover:bg-white/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 text-purple-300 mx-auto animate-spin" />
            <p className="text-purple-200 mt-4">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-purple-300/20">
            <Brain className="w-16 h-16 text-purple-300/50 mx-auto mb-4" />
            <p className="text-purple-200 text-lg">No tasks found</p>
            <p className="text-purple-300 text-sm mt-2">
              {filter === 'all' 
                ? 'Submit your first task to get started'
                : `No ${filter.replace('-', ' ')} tasks at the moment`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30 hover:border-purple-400/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="text-xl font-semibold text-purple-100">{task.title}</h3>
                    </div>
                    <p className="text-purple-200 text-sm mb-3">{task.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  {task.category && (
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50">
                      {task.category}
                    </span>
                  )}
                  {task.estimatedHours && (
                    <span className="flex items-center gap-1 text-purple-200">
                      <Clock className="w-4 h-4" />
                      {task.estimatedHours}h
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-purple-200">
                    <User className="w-4 h-4" />
                    {task.userName}
                  </span>
                  <span className="text-purple-300/70">
                    Created: {formatDate(task.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;

