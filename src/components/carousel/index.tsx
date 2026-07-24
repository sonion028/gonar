import {
  type FC,
  type CSSProperties,
  type ReactElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import { useRAfInterval } from '@/hooks';

import {
  type ShowArrowType,
  type RerenderType,
  type NonLoopEndFuncType,
  usePlayControl,
  useLoopChildren,
} from './hooks';

import styles from './index.module.scss';

type IndicatorType = 'line' | 'dot' | 'none';
export type CarouselProps = {
  /** 单个轮播项的宽度 */
  cardWidth?: number;
  /** 单个轮播项的高度 */
  cardHeight?: number;
  /** 轮播容器的宽度 */
  wrapperWidth?: number;
  /** 轮播容器的高度 */
  wrapperHeight?: number;
  /** 轮播项之间的间隔 */
  gapSize?: number;
  /** 是否无缝轮播 */
  loop?: boolean; // 是否循环
  /** 切换时间（毫秒） */
  duration?: number;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 箭头类型 */
  showArrow?: ShowArrowType;
  /** 指示器类型 */
  indicatorType?: IndicatorType;
  /** 主轮播类名，不包括指示器 */
  className?: string;
  /** 主轮播样式，不包括指示器 */
  style?: CSSProperties;
  /** 轮播项 */
  children: ReactElement[];
  /** 轮播项更新依赖方式 */
  rerender?: RerenderType;
  /** 非循环模式下，轮播结束回调 */
  onNonLoopEnd?: NonLoopEndFuncType;
  /** 非循环模式下，轮播结束时的偏移量。就是提前第几张就算结束。暂不支持延后。 */
  offsetOnEnd?: number;
  // 因外框可达于轮播项，一页可能展示多张，设置偏移时注意是否可能永远触发不到
  /** 自定义渲染箭头 */
  arrows?: [
    /** 自定义渲染上一个箭头 */
    FC<{ onClick: () => void; className?: string }>,
    /** 自定义渲染下一个箭头 */
    FC<{ onClick: () => void; className?: string }>,
  ];
};

export type CarouselRef = {
  /** 开始播放 */
  run: () => void;
  /** 停止播放 */
  stop: () => void;
  /** 切换到上一个或下一个 */
  stepChange: (arg: 'prev' | 'next') => void;
  /** 跳转到指定索引 */
  jumpChange: (arg: number) => void;
  /** 获取当前索引 */
  getCurrentIndex: () => number;
};

/**
 * @author sonion
 * @description 轮播组件，用于展示多个轮播项
 * @param {CarouselProps} props - 组件的属性
 * @param {number} [props.cardWidth] - 单个轮播项的宽度
 * @param {number} [props.cardHeight] - 单个轮播项的高度
 * @param {number} [props.wrapperWidth] - 轮播容器的宽度
 * @param {number} [props.wrapperHeight] - 轮播容器的高度
 * @param {number} [props.gapSize] - 轮播项之间的间隔
 * @param {boolean} [props.loop] - 是否无缝循环
 * @param {number} [props.duration=6000] - 切换时间（毫秒）
 * @param {boolean} [props.autoPlay=true] - 是否自动播放
 * @param {ShowArrowType} [props.showArrow='always'] - 箭头类型
 * @param {IndicatorType} [props.indicatorType='line'] - 指示器类型
 * @param {string} [props.className] - 主轮播类名，不包括指示器
 * @param {CSSProperties} [props.style] - 主轮播样式，不包括指示器
 * @param {ReactElement[]} children - 轮播项
 * @param {RerenderType} [props.rerender='length'] - 轮播项更新依赖方式
 * @param {(direction: 'prev' | 'next', current: number, total: number, offset: number) => void} [props.onNonLoopEnd] - 非循环模式下，轮播结束回调。
 * @param {number} [props.offsetOnEnd=0] - 非循环模式下，轮播结束时的偏移量。就是提前第几张就算结束。暂不支持延后。
 * @param {[FC<{ onClick: () => void; className?: string }>, FC<{ onClick: () => void; className?: string }>]} [props.arrows] - 自定义渲染箭头
 */
const Carousel = forwardRef<CarouselRef, CarouselProps>(
  (
    {
      cardWidth,
      cardHeight,
      wrapperWidth,
      wrapperHeight,
      gapSize,
      loop = true,
      duration = 6000,
      autoPlay = true,
      showArrow = 'always' as ShowArrowType,
      indicatorType = 'line',
      className,
      style,
      children,
      rerender = 'length' as RerenderType, // 默认按children更新依赖其数量变化，可以减少重渲染
      onNonLoopEnd,
      offsetOnEnd = 0,
      arrows,
    },
    ref
  ) => {
    const list = useLoopChildren(children, loop, rerender);
    const [setBannerRef, stepChange, jumpChange, getCurrentIndex] =
      usePlayControl({
        length: children.length,
        loop,
        showArrow,
        cardWidth,
        onNonLoopEnd,
        offsetOnEnd,
      });
    const [run, stop] = useRAfInterval(stepChange, duration);

    useEffect(() => {
      if (autoPlay) {
        run();
      }
      return stop;
    }, [run, stop, autoPlay]);
    useImperativeHandle(
      ref,
      () => ({
        run,
        stop,
        stepChange,
        jumpChange,
        getCurrentIndex,
      }),
      [run, stop, stepChange, jumpChange, getCurrentIndex]
    );

    return (
      <>
        <div
          className={`${styles.carousel} ${className ?? ''}`}
          style={
            {
              ...style,
              '--wrapperWidth': wrapperWidth,
              '--wrapperHeight': wrapperHeight,
              '--cardWidth': cardWidth,
              '--cardHeight': cardHeight,
              '--gapSize': gapSize,
            } as unknown as CSSProperties
          }
          onMouseEnter={stop}
          onMouseLeave={autoPlay ? run : void 0}
        >
          <div className={`${styles.arrow} ${showArrow}`}>
            {arrows?.[0] ? (
              arrows[0]({
                onClick: () => stepChange('prev'),
                className: styles.left,
              })
            ) : (
              // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
              <i
                className={styles.left}
                onClick={() => stepChange('prev')}
                onKeyDown={(e) => e.key === 'ArrowLeft' && stepChange('prev')}
              />
            )}
            {arrows?.[1] ? (
              arrows[1]({
                onClick: () => stepChange(),
                className: styles.right,
              })
            ) : (
              // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
              <i
                className={styles.right}
                onClick={() => stepChange()}
                onKeyDown={(e) => e.key === 'ArrowRight' && stepChange()}
              />
            )}
          </div>

          <div className={styles.wrapper}>
            <div className={styles.inner} ref={setBannerRef}>
              {list}
            </div>
          </div>
        </div>
        <div className={`${styles.indicator} ${indicatorType}`}>
          {children.map((_, i) => (
            // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
            <i
              // oxlint-disable-next-line react/no-array-index-key
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                jumpChange(i);
              }}
              onKeyDown={(e) => e.key === String(i) && jumpChange(i)}
            />
          ))}
        </div>
      </>
    );
  }
);

Carousel.displayName = 'Carousel'; // 调试/错误 信息友好；屏幕阅读器可识别组件

type CarouselType = typeof Carousel;
export type { ShowArrowType, RerenderType, CarouselType };
export default Carousel;
