import React from 'react';
import styled from 'styled-components';

interface AddTaskButtonProps {
  onClick: () => void;
}

const Button = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 0.375rem;
  background-color: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 0.15s ease;
  margin-top: 1rem;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #4f46e5;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick} aria-label="Add new task">
      + Add New Task
    </Button>
  );
};

export default AddTaskButton; 