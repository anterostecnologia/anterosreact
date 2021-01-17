import isDeepEqualReact from 'fast-deep-equal/react';
import { useCallback, useEffect, useRef } from 'react';

export const on = (obj, ...args) => obj.addEventListener(...args);
export const off = (obj, ...args) => obj.removeEventListener(...args);
export const isDeepEqual = isDeepEqualReact;
export const MAX_SMALL_INTEGER = Number.MAX_SAFE_INTEGER;

export const canUseDOM = typeof window !== 'undefined';
export function dethunkify(value) {
    return typeof value === 'function' ? value() : value;
}
export function managedEventListener(target, type, callback, options) {
    target.addEventListener(type, callback, options);
    return () => {
        target.removeEventListener(type, callback, options);
    };
}
export function managedInterval(callback, delayMs) {
    const id = setInterval(callback, delayMs);
    return () => {
        clearInterval(id);
    };
}
export function useEventCallback(callback) {
    // Source: https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
    const ref = useRef();
    useEffect(() => {
        ref.current = callback;
    }, [callback]);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return useCallback((...args) => ref.current(...args), [ref]);
}


// https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)

/* eslint-disable */
export const shadeBlendConvert = (p, c0, c1, l) => {
    let r,
      g,
      b,
      P,
      f,
      t,
      h,
      i = parseInt,
      m = Math.round,
      a = typeof c1 == 'string';
    if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a))
      return null;
    const SBCr = d => {
      let n = d.length,
        x = {};
      if (n > 9) {
        ([r, g, b, a] = d = d.split(',')), (n = d.length);
        if (n < 3 || n > 4) return null;
        (x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
      } else {
        if (n == 8 || n == 6 || n < 4) return null;
        if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
        d = i(d.slice(1), 16);
        if (n == 9 || n == 5)
          (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
        else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
      }
      return x;
    };
    (h = c0.length > 9),
      (h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
      (f = SBCr(c0)),
      (P = p < 0),
      (t = c1 && c1 != 'c' ? SBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
      (p = P ? p * -1 : p),
      (P = 1 - p);
    if (!f || !t) return null;
    if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
    else
      (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
        (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
        (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
    (a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
    if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
    else
      return (
        '#' +
        (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
      );
  };
  /* eslint-enable */


  export const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    const iOS = window.navigator.userAgent.match(/ipad|iphone/i);
    const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  
    el.contentEditable = true; // needed for iOS >= 10
    el.readOnly = false; // needed for iOS >= 10
    el.value = text;
    el.style.border = '0';
    el.style.padding = '0';
    el.style.margin = '0';
    el.style.position = 'absolute';
    // sets vertical scroll
    el.style.top = `${yPosition}px`;
  
    document.body.appendChild(el);
  
    if (iOS) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      el.setSelectionRange(0, 999999);
    } else {
      el.select();
    }
  
    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (error) {
      try {
        window.clipboardData.setData('text', text);
        successful = true;
      } catch (err) {
        console.error('unable to copy using clipboardData: ', err);
      }
    }
    document.body.removeChild(el);
  
    return successful;
  };
  
export function debounce(func, wait, immediate) {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    // eslint-disable-next-line func-names
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

const isClient = !!(
  typeof window !== 'undefined'
  && window.document
  && window.document.createElement
);

export {isClient};

  
  