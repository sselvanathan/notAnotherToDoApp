import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// This is a simple example test to demonstrate the testing setup
describe('Example Test', () => {
  it('renders a simple component', () => {
    // Render a simple component
    render(<div data-testid="test-element">Hello, world!</div>);
    
    // Assert that the component is rendered
    const element = screen.getByTestId('test-element');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello, world!');
  });
});