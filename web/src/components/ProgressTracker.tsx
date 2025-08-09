import React from 'react';
import styled from 'styled-components';
import { Task } from '../services/api';

interface ProgressTrackerProps {
  tasks: Task[];
  showCompleted: boolean;
  onToggleCompleted: () => void;
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

// const Title = styled.h2`
//   font-size: ${({ theme }) => theme.typography.fontSize.xl};
//   font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
//   color: ${({ theme }) => theme.colors.gray[900]};
//   margin-bottom: ${({ theme }) => theme.spacing.lg};
// `;

const ProgressBar = styled.div.attrs({ role: 'progressbar' })`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const Progress = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'percentage'
})<{ percentage: number }>`
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
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[200]};
    transform: translateY(-1px);
  }
`;

const ClickableStatItem = styled(StatItem).withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>`
  background-color: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary : theme.colors.gray[100]};
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.white : 'inherit'};

  &:hover {
    background-color: ${({ isActive, theme }) => 
      isActive ? theme.colors.secondary : theme.colors.gray[200]};
  }
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ClickableStatValue = styled(StatValue).withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>`
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.white : theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ClickableStatLabel = styled(StatLabel).withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>`
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.white : theme.colors.gray[600]};
`;

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  tasks, 
  showCompleted, 
  onToggleCompleted 
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return (
    <Container>
      <ProgressBar>
        <Progress percentage={completionPercentage} />
      </ProgressBar>

      <Stats>
        <ClickableStatItem isActive={!showCompleted} onClick={onToggleCompleted}>
          <ClickableStatValue isActive={!showCompleted}>{pendingTasks}</ClickableStatValue>
          <ClickableStatLabel isActive={!showCompleted}>Pending</ClickableStatLabel>
        </ClickableStatItem>
        <ClickableStatItem isActive={showCompleted} onClick={onToggleCompleted}>
          <ClickableStatValue isActive={showCompleted}>{completedTasks}</ClickableStatValue>
          <ClickableStatLabel isActive={showCompleted}>Completed</ClickableStatLabel>
        </ClickableStatItem>
      </Stats>
    </Container>
  );
};

export default ProgressTracker; 