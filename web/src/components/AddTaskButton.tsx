import React from 'react';
import styled from 'styled-components';

interface AddTaskButtonProps {
  onClick: () => void;
}

const Button = styled.button`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick} aria-label="Add new task">
      +
    </Button>
  );
};

export default AddTaskButton; 