import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import DevopsDashboard from './pages/DevopsDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import NeuralTaskGateway from './pages/NeuralTaskGateway';
import TaskDashboard from './pages/TaskDashboard';
import TaskHatch from './pages/TaskHatch';
import AgentDashboard from './pages/AgentDashboard';
import TaskerProfile from './pages/TaskerProfile';
import TaskerMeta from './pages/TaskerMeta';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route
          path="services/devops-dashboard"
          element={
            <ProtectedRoute>
              <DevopsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="neural-task-gateway"
          element={
            <ProtectedRoute>
              <NeuralTaskGateway />
            </ProtectedRoute>
          }
        />
        <Route
          path="task-dashboard"
          element={
            <ProtectedRoute>
              <TaskDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasker-profile"
          element={
            <ProtectedRoute>
              <TaskerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasker-meta"
          element={
            <ProtectedRoute>
              <TaskerMeta />
            </ProtectedRoute>
          }
        />
        <Route
          path="task-hatch"
          element={
            <ProtectedRoute>
              <TaskHatch />
            </ProtectedRoute>
          }
        />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route
          path="agent-dashboard"
          element={
            <ProtectedRoute>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};


export default App;
