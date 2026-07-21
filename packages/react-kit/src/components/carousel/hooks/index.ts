import {
  type ReactElement,
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';

import { useCreateSafeRef } from '@/hooks';

/**
 * @author sonion
 * @description 无动画切换
 * @param {HTMLElement} el - 元素
 * @param {number} index - 要切换的索引
 * @returns {void}
 */
const noAnimationSwitch = (el: HTMLElement, index: number) => {
  el.style.cssText = `transition-duration: 0s; --index: ${index}`;
  el.clientLeft; // 触发回流
  el.style.cssText = ''; // 恢复过渡动画
};

/**
 * @author sonion
 * @description 更新翻页按钮的dom操作
 * @param {HTMLElement} wrapper - 容器元素。就是轮播子项的父元素（轮播inner）的父元素
 * @param {Array} showArrow - 左右箭头显示状态
 * @returns {void}
 */
const arrowDomOperation = (
  wrapper: HTMLElement,
  showArrow: [boolean, boolean]
) => {
  const arrow = wrapper.previousElementSibling as HTMLElement;
  if (!arrow) {
    return;
  }
  const [showLeft, showRight] = showArrow;
  arrow.children[0]?.classList.toggle('show', showLeft);
  arrow.children[1]?.classList.toggle('show', showRight);
};

/**
 * @author sonion
 * @description 每一次切换是的dom操作（更新主轮播图位置、指示器显示、翻页按钮）
 * @param {HTMLElement} el - 元素
 * @param {number} index - 操作索引
 * @param {Array} showArrow - 左右箭头显示状态
 * @returns {void}
 */
const domOperation = (
  el: HTMLElement,
  index: number,
  showArrow: [boolean, boolean]
) => {
  /** 轮播主要index */
  el.style.setProperty('--index', `${index}`);

  const wrapper = el.parentElement;
  if (!wrapper) {
    return;
  }
  /** 设置指示器 */
  const indicator = wrapper.parentElement?.nextElementSibling as HTMLElement;
  if (indicator) {
    indicator.querySelector('.active')?.classList.remove('active');
    indicator.children[
      index >= indicator.children.length ? 0 : index
    ]?.classList.add('active');
  }
  /** 设置箭头 */
  arrowDomOperation(wrapper, showArrow);
};

/* 箭头类型 */
export type ShowArrowType = 'always' | 'auto' | 'hover' | 'none';

type ShowArrowHookParams = {
  /** 箭头类型 */
  showArrow: ShowArrowType;
  /** 轮播图数量 */
  length: number;
  /** 轮播图宽度 */
  cardWidth?: number;
  /** 轮播图容器 */
  wrapperRef?: HTMLElement;
};
/**
 * @author sonion
 * @description 计算是否显示左右箭头
 * @param {ShowArrowHookParams} params - hook参数
 * @param {ShowArrowType} params.showArrow - 箭头类型
 * @param {number} params.length - 轮播图数量
 * @param {number} params.cardWidth - 轮播图宽度
 * @param {HTMLElement} params.wrapperRef - 轮播图容器
 * @returns {(index: number)=>[boolean, boolean]} - 计算是否显示左右箭头的函数
 */
export const useShowArrow = ({
  showArrow,
  length,
  cardWidth,
  wrapperRef,
}: ShowArrowHookParams) => {
  const displayQuantity = useMemo(() => {
    const wrapperWidth =
      (wrapperRef?.parentElement?.parentElement?.clientWidth || cardWidth) ?? 0;
    if (!cardWidth) {
      return 1;
    }
    return Math.floor(wrapperWidth / cardWidth); // 可完整显示的数量
  }, [wrapperRef, cardWidth]);

  return useCallback<(index: number) => [boolean, boolean]>(
    (index: number) => {
      if (showArrow !== 'auto') {
        return [true, true];
      }
      let isRightShowArrow: boolean;
      if (length > displayQuantity) {
        const lastDisplayedIndex = index + displayQuantity - 1;
        isRightShowArrow = lastDisplayedIndex < length - 1;
      } else {
        isRightShowArrow = false;
      }
      return [index > 0, isRightShowArrow];
    },
    [displayQuantity, length, showArrow]
  );
};

export type NonLoopEndFuncType = (
  /** 切换方向 */
  direction: 'prev' | 'next',
  /** 当前索引 */
  current: number,
  /** 轮播图数量 */
  total: number,
  /** 非循环轮播结束时的偏移量 */
  offset: number
) => void;
type PlayControlHookParams = {
  /** 轮播图数量 */
  length: number;
  /** 是否无缝轮播 */
  loop: boolean;
  /** 箭头类型 */
  showArrow: ShowArrowType;
  /** 轮播图宽度 */
  cardWidth?: number;
  /** 非循环轮播结束时的回调 */
  onNonLoopEnd?: NonLoopEndFuncType;
  /** 非循环轮播结束时的偏移量 */
  offsetOnEnd?: number;
};

/**
 * @author sonion
 * @description 播放轮播图控制
 * @param {PlayControlHookParams} params - hook参数
 * @param {number} params.length - 轮播图数量
 * @param {boolean} params.loop - 是否无缝轮播
 * @param {ShowArrowType} params.showArrow - 箭头类型
 * @param {number} params.cardWidth - 轮播图宽度
 * @param {NonLoopEndFuncType} params.onNonLoopEnd - 非循环轮播结束回调
 * @param {number} params.offsetOnEnd - 非循环轮播结束时的偏移量
 */
export const usePlayControl = ({
  length,
  loop,
  showArrow,
  cardWidth,
  onNonLoopEnd,
  offsetOnEnd = 0,
}: PlayControlHookParams) => {
  const FIRST = 0;
  const LAST = length;
  const indexRef = useRef(FIRST); // 第一张
  const [ref, setRef, isReadyRef] = useCreateSafeRef();

  // 非循环轮播时，偏移量参数规范化
  offsetOnEnd = ~~offsetOnEnd; // 向下取整数
  // 如偏移量为负数（轮播数再往后，就没了）或大于等于轮播图数量，都相当于不设置偏移
  offsetOnEnd = offsetOnEnd < 0 || offsetOnEnd >= length ? 0 : offsetOnEnd;

  // 生成计算是否显示左右箭头的函数
  const getShowArrow = useShowArrow({
    showArrow,
    length,
    cardWidth,
    wrapperRef: ref,
  });

  // length 变化箭头类型为自动的可能需要重新设置，否则隐藏了的不会更新
  useEffect(() => {
    const wrapper = ref?.parentElement;
    if (showArrow !== 'auto' || !wrapper) {
      return;
    }
    const arrowStatus = getShowArrow(indexRef.current);
    arrowDomOperation(wrapper, arrowStatus);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  const stepChange = useCallback(
    (direction?: 'prev' | 'next') => {
      if (!ref) {
        return;
      }
      if (loop) {
        if (indexRef.current >= LAST && direction !== 'prev') {
          indexRef.current = 0;
          noAnimationSwitch(ref, indexRef.current);
        } else if (indexRef.current <= FIRST && direction === 'prev') {
          indexRef.current = LAST;
          noAnimationSwitch(ref, indexRef.current);
        }
      }
      direction === 'prev' ? indexRef.current-- : indexRef.current++;
      const arrowStatus = getShowArrow(indexRef.current);
      domOperation(ref, indexRef.current, arrowStatus);
      // 不循环轮播 结束事件
      if (!loop && onNonLoopEnd) {
        indexRef.current === length - offsetOnEnd - 1 &&
          onNonLoopEnd(
            direction ?? 'next',
            indexRef.current,
            length,
            offsetOnEnd
          );
      }
    },
    [length, loop, ref, getShowArrow, offsetOnEnd, onNonLoopEnd, LAST]
  );

  const jumpChange = useCallback(
    (index: number) => {
      const originalIndex = indexRef.current; // 记录更改前索引
      indexRef.current = index < 0 ? 0 : index > length ? length : index;
      const arrowStatus = getShowArrow(indexRef.current);
      ref && domOperation(ref, indexRef.current, arrowStatus);
      if (!loop && onNonLoopEnd) {
        const direction = originalIndex < indexRef.current ? 'next' : 'prev';
        const _triggerIndex = length - offsetOnEnd - 1; // 触发非循环结束需要的索引
        // 当前索引大于等于触发索引，那原索引小于触发索引，才是首次满足，才该触发
        // 当前索引小于等于触发索引，那原索引大于触发索引，才是首次满足，才该触发
        ((indexRef.current >= _triggerIndex && originalIndex < _triggerIndex) ||
          (indexRef.current <= _triggerIndex &&
            originalIndex > _triggerIndex)) &&
          onNonLoopEnd(direction, indexRef.current, length, offsetOnEnd);
      }
    },
    [length, loop, ref, getShowArrow, offsetOnEnd, onNonLoopEnd]
  );

  const getCurrentIndex = useCallback(() => indexRef.current, []);
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => jumpChange(indexRef.current), [ref]); // 初始化时设置--index
  return [setRef, stepChange, jumpChange, getCurrentIndex, isReadyRef] as const;
};

/**
 * @author sonion
 * @description 创建自增id函数
 * @returns {()=>string} - 自增id函数
 */
const createAutoIncrementId = () => {
  const fix = Math.random().toString(36).slice(2);
  let id = 0;
  return () => `${fix}-${++id}`;
};
/** 自增id函数 */
const autoIncrementId = createAutoIncrementId();

/**
 * 子元素重渲染的依赖的类型
 * length 依赖 children的数量
 * child 依赖 children本身的变化
 */
export type RerenderType = 'length' | 'child';

/**
 * @author sonion
 * @description 创建无缝轮播结构
 * @param {ReactElement} children - 轮播列表
 * @param {boolean} loop - 是否无缝轮播
 * @param {RerenderType} rerender - 子元素重渲染的依赖类型
 * @returns {ReactElement[]} - 无缝轮播结构
 */
export const useLoopChildren = (
  children: ReactElement[],
  loop: boolean,
  rerender: RerenderType
) =>
  // 依赖 children?.length 或 children 的问题可忽略

  useMemo(() => {
    // oxlint-disable-next-line react/react-compiler
    if (!Array.isArray(children) || !children.length) {
      throw new Error('Carousel children must be an array');
    }
    if (loop) {
      const first = children[0] as ReactElement;
      const clonedChildren = [...children]; // 加到后面，指示器和轮播项目好对应
      // const last = children.at(-1);
      // clonedChildren.unshift(cloneElement(last!, { key: autoIncrementId() }));
      clonedChildren.push(cloneElement(first, { key: autoIncrementId() }));
      return clonedChildren;
    }
    return children;
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [rerender === 'child' ? children : children?.length, loop]);
