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

const LoginLink = styled(Link)`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

const Login: React.FC = () => {
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
      console.log('Google login successful, calling backend...');
      
      const response = await api.googleAuth(credentialResponse.credential, false);
      console.log('Backend response:', response);

      if (response.token) {
        console.log('Token received, logging in user...');
        await login(response.token);
        
        // Check if this is a new user and redirect to profile setup
        if (response.isNewUser) {
          navigate('/profile-setup', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        setError('Account not found. Please sign up first.');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleGoogleError = () => {
    console.error('Google login error');
    setError('Google login failed. Please try again.');
  };

  return (
    <Container>
      <Card>
        <Title>Welcome Back to proxyc</Title>
        <Description>
          Sign in to continue managing your tasks and stay organized
        </Description>

        <GoogleBranding>
          <GoogleText>
            <strong>Sign in with Google</strong> to get:
          </GoogleText>
          <GoogleBenefits>
            <GoogleBenefitsItem>Secure authentication</GoogleBenefitsItem>
            <GoogleBenefitsItem>One-click sign in</GoogleBenefitsItem>
            <GoogleBenefitsItem>No password to remember</GoogleBenefitsItem>
          </GoogleBenefits>
        </GoogleBranding>

        {error && (
          <ErrorMessage>
            {error}
            {error.includes('Account not found') && (
              <ErrorLink to="/signup">Sign up</ErrorLink>
            )}
          </ErrorMessage>
        )}

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_blue"
          shape="rectangular"
          text="signin_with"
          size="large"
          width="300px"
        />

        <LoginLink to="/signup">
          Don't have an account? Sign up
        </LoginLink>
      </Card>
    </Container>
  );
};

export default Login; 