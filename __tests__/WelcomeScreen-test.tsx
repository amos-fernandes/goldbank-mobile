import React from 'react';
import { render } from '@testing-library/react-native';
import WelcomeScreen from '@/app/(auth)/welcome';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  Link: ({ children }: any) => children,
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

describe('WelcomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText('GOLD BANK')).toBeTruthy();
    expect(getByText('Sua fortuna em um só lugar')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = render(<WelcomeScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
