import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import config from '../config';
import { FaPoll, FaPlus, FaTrash, FaCopy, FaShare, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { IoMdCreate } from 'react-icons/io';

function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [pollLink, setPollLink] = useState('');
  const [error, setError] = useState('');

  const handleOptionChange = useCallback((index, value) => {
    setOptions(prev => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
  }, []);

  const addOption = useCallback(() => {
    if (options.length < 10) {
      setOptions(prev => [...prev, '']);
    }
  }, [options.length]);

  const removeOption = useCallback((index) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index));
    }
  }, [options.length]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${config.API_URL}/api/polls`, {
        question: question.trim(),
        options: validOptions
      });

      if (response.data.success) {
        const link = `${window.location.origin}/poll/${response.data.pollId}`;
        setPollLink(link);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  }, [question, options]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(pollLink);
    alert('Link copied to clipboard!');
  }, [pollLink]);

  const createAnother = useCallback(() => {
    setQuestion('');
    setOptions(['', '']);
    setPollLink('');
    setError('');
  }, []);

  if (pollLink) {
    return (
      <div className="container">
        <h1><FaCheckCircle style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Poll Created!</h1>
        <div className="share-link">
          <h3><FaShare style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Share this link with others:</h3>
          <div className="link-display">
            <input type="text" value={pollLink} readOnly />
            <button className="btn copy-btn" onClick={copyToClipboard}>
              <FaCopy style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Copy
            </button>
          </div>
          <p style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
            Anyone with this link can vote on your poll!
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => window.location.href = pollLink} style={{ marginTop: '20px' }}>
          <FaArrowRight style={{ marginRight: '8px', verticalAlign: 'middle' }} /> View Poll
        </button>
        <button className="btn btn-secondary" onClick={createAnother} style={{ marginTop: '10px', width: '100%' }}>
          <IoMdCreate style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Create Another Poll
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1><FaPoll style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Create a Poll</h1>
      <p className="subtitle">Create your poll and share it with others</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Poll Question</label>
          <textarea
            placeholder="e.g., What's the best programming language?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label>Options (minimum 2)</label>
          {options.map((option, index) => (
            <div key={index} className="option-input-group">
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                maxLength={100}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeOption(index)}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          {options.length < 10 && (
            <button
              type="button"
              className="btn add-option-btn"
              onClick={addOption}
            >
              <FaPlus style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Add Option
            </button>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <><IoMdCreate style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Creating...</>
          ) : (
            <><IoMdCreate style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Create Poll</>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreatePoll;
