import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import Carousel, { type CarouselRef } from '../../src/components/carousel';

const items = [
  <div key="one">one</div>,
  <div key="two">two</div>,
  <div key="three">three</div>,
];

describe('Carousel', () => {
  it('renders carousel items, cloned loop item and indicators by default', () => {
    render(<Carousel autoPlay={false}>{items}</Carousel>);

    expect(screen.getAllByText('one')).toHaveLength(2);
    expect(screen.getByText('two')).toBeTruthy();
    expect(screen.getByText('three')).toBeTruthy();
  });

  it('does not clone first item when loop is disabled', () => {
    render(
      <Carousel autoPlay={false} loop={false}>
        {items}
      </Carousel>
    );

    expect(screen.getAllByText('one')).toHaveLength(1);
  });

  it('exposes imperative controls through ref', () => {
    const ref = createRef<CarouselRef>();
    render(
      <Carousel autoPlay={false} ref={ref}>
        {items}
      </Carousel>
    );

    expect(ref.current?.getCurrentIndex()).toBe(0);
    ref.current?.jumpChange(1);
    expect(ref.current?.getCurrentIndex()).toBe(1);
    ref.current?.stepChange('prev');
    expect(ref.current?.getCurrentIndex()).toBe(0);
  });

  it('uses custom arrow renderers and triggers navigation', () => {
    const ref = createRef<CarouselRef>();
    const Prev = ({ onClick }: { onClick: () => void }) => (
      <button type="button" onClick={onClick}>
        prev
      </button>
    );
    const Next = ({ onClick }: { onClick: () => void }) => (
      <button type="button" onClick={onClick}>
        next
      </button>
    );

    render(
      <Carousel autoPlay={false} ref={ref} arrows={[Prev, Next]}>
        {items}
      </Carousel>
    );

    screen.getByText('next').click();
    expect(ref.current?.getCurrentIndex()).toBe(1);
    screen.getByText('prev').click();
    expect(ref.current?.getCurrentIndex()).toBe(0);
  });

  it('calls onNonLoopEnd once the non-loop end threshold is reached', () => {
    const ref = createRef<CarouselRef>();
    const onNonLoopEnd = vi.fn();

    render(
      <Carousel
        autoPlay={false}
        loop={false}
        ref={ref}
        onNonLoopEnd={onNonLoopEnd}
      >
        {items}
      </Carousel>
    );

    ref.current?.jumpChange(2);

    expect(onNonLoopEnd).toHaveBeenCalledWith('next', 2, 3, 0);
  });
});
