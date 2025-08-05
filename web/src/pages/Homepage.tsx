import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomepageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: ${({ theme }) => theme.colors.white};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
`;

const AuthButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Button = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all ${({ theme }) => theme.transitions.default};
  
  &.primary {
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.primary};
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
  }
  
  &.secondary {
    border: 2px solid ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.white};
    
    &:hover {
      background: ${({ theme }) => theme.colors.white};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const Hero = styled.section`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h2`
  font-size: 3.5rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  opacity: 0.9;
  line-height: 1.6;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  transition: all ${({ theme }) => theme.transitions.default};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const FeaturesSection = styled.section`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[800]};
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.gray[800]};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.default};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.white};
`;

const FeatureTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.gray[800]};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.6;
`;

const Footer = styled.footer`
  background: ${({ theme }) => theme.colors.gray[900]};
  color: ${({ theme }) => theme.colors.gray[300]};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Homepage: React.FC = () => {
  return (
    <HomepageContainer>
             <Header>
         <Logo>proxyc</Logo>
         <AuthButtons>
          <Button to="/login" className="secondary">Sign In</Button>
          <Button to="/signup" className="primary">Sign Up</Button>
        </AuthButtons>
      </Header>

      <Hero>
        <HeroTitle>Focus on everything you need to get done</HeroTitle>
        <HeroSubtitle>
          A smart todo list app filled with intelligent features to help you stay organized, 
          boost productivity, and achieve your goals with ease.
        </HeroSubtitle>
        <CTAButton to="/signup">Get Started Free</CTAButton>
      </Hero>

      <FeaturesSection>
        <FeaturesContainer>
          <SectionTitle>Better organize your life</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>📱</FeatureIcon>
              <FeatureTitle>Access from anywhere</FeatureTitle>
                             <FeatureDescription>
                 Use proxyc for free and sync your lists across the web and all your devices. 
                 Never lose track of your tasks again.
               </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🎯</FeatureIcon>
              <FeatureTitle>Smart daily planner</FeatureTitle>
              <FeatureDescription>
                Set yourself up for success with intelligent and personalized suggestions 
                to update your daily or weekly todo list.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📅</FeatureIcon>
              <FeatureTitle>Due date tracking</FeatureTitle>
              <FeatureDescription>
                Never miss a deadline again! Assign due dates to your tasks and get visual 
                alerts for upcoming and overdue items.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>👥</FeatureIcon>
              <FeatureTitle>Simplified sharing</FeatureTitle>
              <FeatureDescription>
                Share your todo lists with friends, family, and colleagues to keep everyone 
                connected and aware of what needs to be done.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>Drag & drop interface</FeatureTitle>
              <FeatureDescription>
                Easily prioritize your tasks with our intuitive drag-and-drop interface. 
                Reorder items with a simple click and drag.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🔒</FeatureIcon>
              <FeatureTitle>Secure & private</FeatureTitle>
              <FeatureDescription>
                Your data is protected with enterprise-grade security. Your tasks and 
                personal information stay private and secure.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

             <Footer>
         <p>&copy; 2025 proxyc. All rights reserved.</p>
       </Footer>
    </HomepageContainer>
  );
};

export default Homepage; 