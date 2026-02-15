import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import config from '../config';
import PollResults from '../components/PollResults';
import { FaArrowLeft, FaCheckCircle, FaHandPointer, FaExclamationCircle } from 'react-icons/fa';
import { MdLiveTv } from 'react-icons/md';
import { IoMdCreate } from 'react-icons/io';

function PollPage() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voting, setVoting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  const fetchPoll = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/polls/${pollId}`);
      if (response.data.success) {
        setPoll(response.data.poll);
        if (response.data.poll.hasVoted) {
          setHasVoted(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Poll not found');
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    // ANTI-CHEATING PROTECTION #2: Check localStorage
    const localVoteKey = `poll_voted_${pollId}`;
    const hasVotedLocally = localStorage.getItem(localVoteKey) === 'true';
    if (hasVotedLocally) {
      setHasVoted(true);
    }

    // Fetch poll data
    fetchPoll();

    // Initialize Socket.io connection for real-time updates
    const newSocket = io(config.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 3
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.io');
      setIsConnected(true);
      newSocket.emit('joinPoll', pollId);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io');
      setIsConnected(false);
    });

    // REAL-TIME UPDATE: Throttled to prevent excessive re-renders
    newSocket.on('voteUpdate', (data) => {
      const now = Date.now();
      // Throttle updates to max once per 100ms
      if (now - lastUpdateRef.current < 100) return;
      
      lastUpdateRef.current = now;
      console.log('📊 Real-time vote update received:', data);
      
      // Batch state update for better performance
      setPoll(prevPoll => ({
        ...prevPoll,
        options: data.options,
        totalVotes: data.totalVotes
      }));
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leavePoll', pollId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [pollId, fetchPoll]);

  const handleVote = useCallback(async (optionIndex) => {
    if (hasVoted || voting) return;

    setVoting(true);
    setSelectedOption(optionIndex);

    try {
      const response = await axios.post(`${config.API_URL}/api/polls/${pollId}/vote`, {
        optionIndex
      });

      if (response.data.success) {
        // Optimistic UI update - update immediately
        setPoll(response.data.poll);
        setHasVoted(true);
        
        // ANTI-CHEATING PROTECTION #2: Save vote in localStorage
        const localVoteKey = `poll_voted_${pollId}`;
        localStorage.setItem(localVoteKey, 'true');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record vote');
      setSelectedOption(null);
    } finally {
      setVoting(false);
    }
  }, [hasVoted, voting, pollId]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading poll...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2><FaExclamationCircle style={{ marginRight: '10px', verticalAlign: 'middle' }} /> {error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            <IoMdCreate style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Create New Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="live-indicator">
        <span className="live-dot"></span>
        <MdLiveTv style={{ marginRight: '6px', verticalAlign: 'middle' }} />
        {isConnected ? 'Live Updates Active' : 'Connecting...'}
      </div>

      <div className="poll-question">
        <h2>{poll.question}</h2>
      </div>

      {hasVoted ? (
        <div className="alert alert-info">
          <FaCheckCircle style={{ marginRight: '8px', verticalAlign: 'middle' }} /> You have already voted on this poll
        </div>
      ) : (
        <div className="alert alert-success">
          <FaHandPointer style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Click an option below to vote
        </div>
      )}

      <PollResults 
        poll={poll}
        hasVoted={hasVoted}
        onVote={handleVote}
        voting={voting}
        selectedOption={selectedOption}
      />

      <button className="btn back-btn" onClick={() => navigate('/')}>
        <FaArrowLeft style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Create New Poll
      </button>
    </div>
  );
}

export default PollPage;
