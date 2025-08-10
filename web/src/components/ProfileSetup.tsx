import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const SetupContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SetupCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h1`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.gray[700]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  resize: vertical;
  min-height: 80px;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background: white;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray[700]};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

const SkipButton = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`;

interface ProfileSetupData {
  displayName: string;
  bio: string;
  timezone: string;
  language: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      taskReminders: boolean;
    };
    defaultCategories: string[];
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileSetupData>({
    displayName: user?.displayName || user?.name || '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language.split('-')[0],
    preferences: {
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        taskReminders: true,
      },
      defaultCategories: ['Work', 'Personal', 'Shopping', 'Health'],
      reminderFrequency: 'daily',
    },
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProfileSetupData] as Record<string, any>),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [type]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.setupProfile(formData);
      updateUser(response.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <SetupContainer>
      <SetupCard>
        <Title>Complete Your Profile</Title>
        <Subtitle>
          Help us personalize your experience with a few quick questions
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="How should we call you?"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <TextArea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself..."
              maxLength={500}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="language">Language</Label>
            <Select
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Theme Preference</Label>
            <Select
              value={formData.preferences.theme}
              onChange={(e) => handleInputChange('preferences.theme', e.target.value)}
            >
              <option value="auto">Auto (System)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Notifications</Label>
            <CheckboxGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.preferences.notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                />
                Email notifications
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.preferences.notifications.push}
                  onChange={(e) => handleNotificationChange('push', e.target.checked)}
                />
                Push notifications
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.preferences.notifications.taskReminders}
                  onChange={(e) => handleNotificationChange('taskReminders', e.target.checked)}
                />
                Task reminders
              </CheckboxLabel>
            </CheckboxGroup>
          </FormGroup>

          <FormGroup>
            <Label>Reminder Frequency</Label>
            <Select
              value={formData.preferences.reminderFrequency}
              onChange={(e) => handleInputChange('preferences.reminderFrequency', e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </FormGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </Button>

          <SkipButton type="button" onClick={handleSkip}>
            Skip for now
          </SkipButton>
        </Form>
      </SetupCard>
    </SetupContainer>
  );
};

export default ProfileSetup;
