import React, { useState } from 'react';
import styled from 'styled-components';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { config } from '../config/environment';
import api from '../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.gray[900]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const GoogleBranding = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const GoogleText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const GoogleBenefits = styled.ul`
  text-align: left;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray[700]};
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing.md};
`;

const GoogleBenefitsItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.red[50]};
  color: ${({ theme }) => theme.colors.red[700]};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ErrorLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  margin-left: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const SignupLink = styled(Link)`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

const Signup: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError('');
      console.log('Google signup successful, calling backend...');
      
      const response = await api.googleAuth(credentialResponse.credential, true);
      console.log('Backend response:', response);

      if (response.token) {
        console.log('Token received, logging in user...');
        await login(response.token);
        
        // Always redirect new users to profile setup during signup
        if (response.isNewUser) {
          navigate('/profile-setup', { replace: true });
        } else {
          // If user already exists, redirect to dashboard
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setError('Account already exists. Please sign in instead.');
      } else {
        setError(error.response?.data?.message || 'Signup failed. Please try again.');
      }
    }
  };

  const handleGoogleError = () => {
    console.error('Google signup error');
    setError('Google signup failed. Please try again.');
  };

  return (
    <Container>
      <Card>
        <Title>Join proxyc</Title>
        <Description>
          Create your account with Google to start organizing your tasks and boost your productivity
        </Description>

        <GoogleBranding>
          <GoogleText>
            <strong>Sign up with Google</strong> to get:
          </GoogleText>
          <GoogleBenefits>
            <GoogleBenefitsItem>Instant account creation</GoogleBenefitsItem>
            <GoogleBenefitsItem>Secure authentication</GoogleBenefitsItem>
            <GoogleBenefitsItem>Personalized experience</GoogleBenefitsItem>
            <GoogleBenefitsItem>No password setup required</GoogleBenefitsItem>
          </GoogleBenefits>
        </GoogleBranding>

        {error && (
          <ErrorMessage>
            {error}
            {error.includes('Account already exists') && (
              <ErrorLink to="/login">Sign in instead</ErrorLink>
            )}
          </ErrorMessage>
        )}

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_blue"
          shape="rectangular"
          text="signup_with"
          size="large"
          width="300px"
        />

        <SignupLink to="/login">
          Already have an account? Sign in
        </SignupLink>
      </Card>
    </Container>
  );
};

export default Signup; 