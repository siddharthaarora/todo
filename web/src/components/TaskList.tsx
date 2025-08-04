import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { Task } from '../services/api';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onAddTask: (task: Task) => void;
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const QuickAddContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const QuickAddInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-right: 48px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const AddButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    opacity: 0.8;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

// const Header = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: ${({ theme }) => theme.spacing.lg};
// `;

// const Title = styled.h2`
//   font-size: ${({ theme }) => theme.typography.fontSize.xl};
//   font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
//   color: ${({ theme }) => theme.colors.gray[900]};
// `;

// const Controls = styled.div`
//   display: flex;
//   gap: ${({ theme }) => theme.spacing.md};
// `;

// const Select = styled.select`
//   padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
//   border: 1px solid ${({ theme }) => theme.colors.gray[300]};
//   border-radius: ${({ theme }) => theme.borderRadius.md};
//   background-color: ${({ theme }) => theme.colors.white};
//   color: ${({ theme }) => theme.colors.gray[700]};
//   font-size: ${({ theme }) => theme.typography.fontSize.sm};
//   cursor: pointer;

//   &:focus {
//     outline: none;
//     border-color: ${({ theme }) => theme.colors.primary};
//   }
// `;

const DateHeader = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.gray[700]};
  margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.md} 0;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 2px solid ${({ theme }) => theme.colors.gray[200]};
`;

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onAddTask,
}) => {
  const [quickAddText, setQuickAddText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQuickAdd = () => {
    if (quickAddText.trim()) {
      const newTask: Task = {
        _id: Date.now().toString(),
        title: quickAddText.trim(),
        description: '',
        completed: false,
        dueDate: new Date().toISOString(),
        category: '',
        userId: 'default-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onAddTask(newTask);
      setQuickAddText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickAddText.trim()) {
      handleQuickAdd();
    }
  };

  const sortTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateA - dateB;
    });
  };

  const filterTasks = (tasks: Task[]): Task[] => {
    // Show all tasks by default
    return tasks;
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Here you would typically update the tasks order in your state management
  };

  const sortedAndFilteredTasks = filterTasks(sortTasks(tasks));

  // Group tasks by due date
  const groupTasksByDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {};
    
    tasks.forEach(task => {
      let dateKey: string;
      if (!task.dueDate) {
        dateKey = 'No Due Date';
      } else {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (dueDate.toDateString() === today.toDateString()) {
          dateKey = 'Today';
        } else if (dueDate.toDateString() === tomorrow.toDateString()) {
          dateKey = 'Tomorrow';
        } else {
          dateKey = dueDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });
    
    return groups;
  };

  const taskGroups = groupTasksByDate(sortedAndFilteredTasks);

  return (
    <Container>
      <QuickAddContainer>
        <QuickAddInput
          ref={inputRef}
          type="text"
          placeholder="Quick add a task (press Enter to add)"
          value={quickAddText}
          onChange={(e) => setQuickAddText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <AddButton
          onClick={handleQuickAdd}
          disabled={!quickAddText.trim()}
          aria-label="Add task"
        >
          +
        </AddButton>
      </QuickAddContainer>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {Object.entries(taskGroups).map(([dateKey, tasksInGroup], groupIndex) => (
                <div key={dateKey}>
                  <DateHeader>{dateKey}</DateHeader>
                  {tasksInGroup.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={groupIndex * 1000 + index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskItem
                            task={task}
                            onEdit={() => onEditTask(task)}
                            onDelete={() => onDeleteTask(task._id)}
                            onToggleComplete={() => onToggleComplete(task._id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
};

export default TaskList; 