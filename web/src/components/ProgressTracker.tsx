import React from 'react';
import styled from 'styled-components';
import { Task } from '../types';

interface ProgressTrackerProps {
  tasks: Task[];
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.gray[900]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const Progress = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => `${percentage}%`};
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  transition: width ${({ theme }) => theme.transitions.default};
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const PriorityStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PriorityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const PriorityLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const PriorityCount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.gray[900]};
`;

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const priorityCounts = tasks.reduce(
    (acc, task) => {
      acc[task.priority]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <Container>
      <Title>Progress</Title>
      <ProgressBar>
        <Progress percentage={completionPercentage} />
      </ProgressBar>

      <Stats>
        <StatItem>
          <StatValue>{totalTasks}</StatValue>
          <StatLabel>Total Tasks</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{completedTasks}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatItem>
      </Stats>

      <Title>Priority Distribution</Title>
      <PriorityStats>
        <PriorityItem>
          <PriorityLabel>High Priority</PriorityLabel>
          <PriorityCount>{priorityCounts.high}</PriorityCount>
        </PriorityItem>
        <PriorityItem>
          <PriorityLabel>Medium Priority</PriorityLabel>
          <PriorityCount>{priorityCounts.medium}</PriorityCount>
        </PriorityItem>
        <PriorityItem>
          <PriorityLabel>Low Priority</PriorityLabel>
          <PriorityCount>{priorityCounts.low}</PriorityCount>
        </PriorityItem>
      </PriorityStats>
    </Container>
  );
};

export default ProgressTracker; 