import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 倒计时 Hook
 *
 * 用于验证码重发倒计时功能，防止用户频繁发送验证码
 *
 * @param initialSeconds 初始倒计时秒数（默认 60 秒）
 * @returns {object} 包含倒计时状态和控制方法
 */
export function useCountdown(initialSeconds: number = 60) {
   const [seconds, setSeconds] = useState(0);
   const [isRunning, setIsRunning] = useState(false);
   const intervalRef = useRef<NodeJS.Timeout | null>(null);

   /**
    * 清理定时器
    */
   const clearTimer = useCallback(() => {
      if (intervalRef.current) {
         clearInterval(intervalRef.current);
         intervalRef.current = null;
      }
   }, []);

   /**
    * 开始倒计时
    */
   const start = useCallback(() => {
      clearTimer();
      setSeconds(initialSeconds);
      setIsRunning(true);
   }, [initialSeconds, clearTimer]);

   /**
    * 重置倒计时
    */
   const reset = useCallback(() => {
      clearTimer();
      setSeconds(0);
      setIsRunning(false);
   }, [clearTimer]);

   /**
    * 倒计时逻辑
    */
   useEffect(() => {
      if (!isRunning || seconds <= 0) {
         if (seconds === 0 && isRunning) {
            setIsRunning(false);
         }
         return;
      }

      intervalRef.current = setInterval(() => {
         setSeconds((prev) => {
            if (prev <= 1) {
               clearTimer();
               setIsRunning(false);
               return 0;
            }
            return prev - 1;
         });
      }, 1000);

      return clearTimer;
   }, [isRunning, seconds, clearTimer]);

   /**
    * 组件卸载时清理定时器
    */
   useEffect(() => {
      return clearTimer;
   }, [clearTimer]);

   return {
      seconds,
      isRunning,
      start,
      reset,
   };
}
