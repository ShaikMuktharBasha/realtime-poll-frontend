import React, { useMemo } from 'react';
import { HiChartBar } from 'react-icons/hi';

const PollResults = React.memo(({ poll, hasVoted, onVote, voting, selectedOption }) => {
  const percentages = useMemo(() => {
    if (!poll || poll.totalVotes === 0) return poll?.options.map(() => 0) || [];
    return poll.options.map(option => 
      ((option.votes / poll.totalVotes) * 100).toFixed(1)
    );
  }, [poll]);

  const getPercentage = (index) => percentages[index] || 0;

  return (
    <>
      <div className="options-list">
        {poll.options.map((option, index) => (
          <div
            key={index}
            className={`option-card ${hasVoted ? 'voted' : ''}`}
            onClick={() => !hasVoted && !voting && onVote(index)}
            style={{
              opacity: voting && selectedOption === index ? 0.6 : 1,
              cursor: hasVoted ? 'default' : 'pointer'
            }}
          >
            <div 
              className="option-bar" 
              style={{ width: `${getPercentage(index)}%` }}
            />
            <div className="option-header">
              <span className="option-text">
                {option.text}
                {voting && selectedOption === index && ' (voting...)'}
              </span>
              <span className="option-votes">{option.votes}</span>
            </div>
            {hasVoted && (
              <div className="percentage">
                {getPercentage(index)}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="total-votes">
        <HiChartBar style={{ marginRight: '10px', verticalAlign: 'middle', fontSize: '1.4rem' }} />
        <strong>Total Votes: {poll.totalVotes}</strong>
      </div>
    </>
  );
});

PollResults.displayName = 'PollResults';

export default PollResults;
