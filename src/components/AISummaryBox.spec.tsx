import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AISummaryBox from '@/components/AISummaryBox';

describe('AISummaryBox', () => {
  it('shows the summary with an AI notice', () => {
    render(<AISummaryBox summary="  Учениците посетиха музея.  " />);

    expect(screen.getByRole('heading', { name: 'Накратко' })).toBeInTheDocument();
    expect(screen.getByText('Учениците посетиха музея.')).toBeInTheDocument();
    expect(screen.getByText(/Обобщено с изкуствен интелект/)).toBeInTheDocument();
  });

  it('renders nothing without a summary', () => {
    const { container } = render(<AISummaryBox summary="   " />);
    expect(container).toBeEmptyDOMElement();

    const { container: missing } = render(<AISummaryBox />);
    expect(missing).toBeEmptyDOMElement();
  });
});
