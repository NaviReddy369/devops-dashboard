/**
 * Agent Dashboard
 * Allows agents (special users) to view and pick up Neural Gateway requests
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Brain, User, CheckCircle, MessageSquare, Send } from 'lucide-react';

interface NeuralRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'pending' | 'matched' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assignedAssistantId: string | null;
  createdAt: Timestamp;
  messages?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: Timestamp;
  }>;
}

const AgentDashboard = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<NeuralRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NeuralRequest | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Query for pending and assigned requests
    const q = query(
      collection(db, 'neuralTasks'),
      where('status', 'in', ['pending', 'matched', 'accepted', 'in-progress']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData: NeuralRequest[] = [];
      snapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() } as NeuralRequest);
      });
      setRequests(requestsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handlePickup = async (requestId: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'neuralTasks', requestId), {
        assignedAssistantId: currentUser.uid,
        assignedAssistantName: currentUser.displayName || currentUser.email || 'Agent',
        status: 'accepted',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error picking up request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || !selectedRequest || !message.trim()) return;

    try {
      setLoading(true);
      const requestRef = doc(db, 'neuralTasks', selectedRequest.id);
      const requestDoc = await getDoc(requestRef);
      const currentMessages = requestDoc.data()?.messages || [];

      await updateDoc(requestRef, {
        messages: [
          ...currentMessages,
          {
            id: `msg-${Date.now()}`,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || currentUser.email || 'Agent',
            content: message,
            createdAt: new Date(),
          },
        ],
        status: 'in-progress',
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'neuralTasks', requestId), {
        status: 'completed',
        updatedAt: new Date(),
      });
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error completing request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-purple-200 text-lg">Please log in to access the Agent Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-10 h-10 text-purple-300" />
          <div>
            <h1 className="text-3xl font-bold">Agent Dashboard</h1>
            <p className="text-purple-200">Manage Neural Gateway requests</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-purple-100">Available Requests</h2>
            {requests.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-8 text-center border border-purple-300/20">
                <p className="text-purple-200">No requests available</p>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30 hover:border-purple-400/50 transition cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-purple-100 mb-2">{request.title}</h3>
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">{request.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-3 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50">
                      {request.status}
                    </span>
                    {request.category && (
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/50">
                        {request.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-purple-200">
                      <User className="w-4 h-4" />
                      {request.requesterName}
                    </span>
                    {request.assignedAssistantId === currentUser.uid && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/50">
                        Assigned to you
                      </span>
                    )}
                  </div>
                  {request.status === 'pending' && request.assignedAssistantId !== currentUser.uid && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePickup(request.id);
                      }}
                      disabled={loading}
                      className="mt-4 w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50"
                    >
                      Pick Up Request
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Request Details & Messages */}
          <div className="space-y-4">
            {selectedRequest ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-purple-100 mb-2">{selectedRequest.title}</h3>
                  <p className="text-purple-200 text-sm">{selectedRequest.description}</p>
                </div>

                {/* Messages */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-purple-100 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </h4>
                  {selectedRequest.messages && selectedRequest.messages.length > 0 ? (
                    selectedRequest.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.senderId === currentUser.uid
                            ? 'bg-purple-500/20 ml-4'
                            : 'bg-white/5 mr-4'
                        }`}
                      >
                        <p className="text-xs text-purple-300 mb-1">{msg.senderName}</p>
                        <p className="text-purple-100 text-sm">{msg.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-purple-300 text-sm">No messages yet</p>
                  )}
                </div>

                {/* Send Message */}
                {selectedRequest.assignedAssistantId === currentUser.uid && (
                  <div className="space-y-2">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || !message.trim()}
                        className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                      {selectedRequest.status === 'in-progress' && (
                        <button
                          onClick={() => handleComplete(selectedRequest.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-8 text-center border border-purple-300/20">
                <p className="text-purple-200">Select a request to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;

