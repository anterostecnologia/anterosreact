import React, {
    useState,
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
  } from "react";
  
  import { RefObject, useLayoutEffect } from "react";
  import ReactDOM from "react-dom";
  
  
  
  
  const styles = {
    popupContent: {
      tooltip: {
        position: 'absolute',
        zIndex: 999,
      },
      modal: {
        position: 'relative',
        margin: 'auto',
      },
    },
    popupArrow: {
      height: '8px',
      width: '16px',
      position: 'absolute',
      background: 'transparent',
      color: '#FFF',
      zIndex: -1,
    },
    overlay: {
      tooltip: {
        position: 'fixed',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: 999,
      },
      modal: {
        position: 'fixed',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        display: 'flex',
        zIndex: 999,
      },
    },
  };
  
  
  export const POSITION_TYPES = [
    "top left",
    "top center",
    "top right",
    "right top",
    "right center",
    "right bottom",
    "bottom left",
    "bottom center",
    "bottom right",
    "left top",
    "left center",
    "left bottom",
    //'center center',
  ];
  const getCoordinatesForPosition = (
    triggerBounding,
    ContentBounding,
    position,
    arrow,
    { offsetX, offsetY }
  ) => {
    const margin = arrow ? 8 : 0;
    const args = position.split(" ");
    const CenterTop = triggerBounding.top + triggerBounding.height / 2;
    const CenterLeft = triggerBounding.left + triggerBounding.width / 2;
    const { height, width } = ContentBounding;
    let top = CenterTop - height / 2;
    let left = CenterLeft - width / 2;
    let transform = "";
    let arrowTop = "0%";
    let arrowLeft = "0%";
    switch (args[0]) {
      case "top":
        top -= height / 2 + triggerBounding.height / 2 + margin;
        transform = `rotate(180deg)  translateX(50%)`;
        arrowTop = "100%";
        arrowLeft = "50%";
        break;
      case "bottom":
        top += height / 2 + triggerBounding.height / 2 + margin;
        transform = `rotate(0deg) translateY(-100%) translateX(-50%)`;
        arrowLeft = "50%";
        break;
      case "left":
        left -= width / 2 + triggerBounding.width / 2 + margin;
        transform = ` rotate(90deg)  translateY(50%) translateX(-25%)`;
        arrowLeft = "100%";
        arrowTop = "50%";
        break;
      case "right":
        left += width / 2 + triggerBounding.width / 2 + margin;
        transform = `rotate(-90deg)  translateY(-150%) translateX(25%)`;
        arrowTop = "50%";
        break;
      default:
    }
    switch (args[1]) {
      case "top":
        top = triggerBounding.top;
        arrowTop = `${triggerBounding.height / 2}px`;
        break;
      case "bottom":
        top = triggerBounding.top - height + triggerBounding.height;
        arrowTop = `${height - triggerBounding.height / 2}px`;
        break;
      case "left":
        left = triggerBounding.left;
        arrowLeft = `${triggerBounding.width / 2}px`;
        break;
      case "right":
        left = triggerBounding.left - width + triggerBounding.width;
        arrowLeft = `${width - triggerBounding.width / 2}px`;
        break;
      default:
    }
  
    top = args[0] === "top" ? top - offsetY : top + offsetY;
    left = args[0] === "left" ? left - offsetX : left + offsetX;
  
    return { top, left, transform, arrowLeft, arrowTop };
  };
  
  export const getTooltipBoundary = (keepTooltipInside) => {
    let boundingBox = {
      top: 0,
      left: 0,
      /* eslint-disable-next-line no-undef */
      width: window.innerWidth,
      /* eslint-disable-next-line no-undef */
      height: window.innerHeight,
    };
    if (typeof keepTooltipInside === "string") {
      /* eslint-disable-next-line no-undef */
      const selector = document.querySelector(keepTooltipInside);
      if (process.env.NODE_ENV !== "production") {
        if (selector === null)
          throw new Error(
            `${keepTooltipInside} o seletor não existe: keepTooltipInside deve ser um seletor html válido 'class' ou 'Id' ou um valor booleano`
          );
      }
      if (selector !== null) boundingBox = selector.getBoundingClientRect();
    }
  
    return boundingBox;
  };
  
  const calculatePosition = (
    triggerBounding,
    ContentBounding,
    position,
    arrow,
    { offsetX, offsetY },
    keepTooltipInside
  ) => {
    let bestCoords = {
      arrowLeft: "0%",
      arrowTop: "0%",
      left: 0,
      top: 0,
      transform: "rotate(135deg)",
    };
    let i = 0;
    const wrapperBox = getTooltipBoundary(keepTooltipInside);
    let positions = Array.isArray(position) ? position : [position];
    if (keepTooltipInside || Array.isArray(position))
      positions = [...positions, ...POSITION_TYPES];
    while (i < positions.length) {
      bestCoords = getCoordinatesForPosition(
        triggerBounding,
        ContentBounding,
        positions[i],
        arrow,
        { offsetX, offsetY }
      );
  
      const contentBox = {
        top: bestCoords.top,
        left: bestCoords.left,
        width: ContentBounding.width,
        height: ContentBounding.height,
      };
  
      if (
        contentBox.top <= wrapperBox.top ||
        contentBox.left <= wrapperBox.left ||
        contentBox.top + contentBox.height >=
          wrapperBox.top + wrapperBox.height ||
        contentBox.left + contentBox.width >= wrapperBox.left + wrapperBox.width
      ) {
        i++;
      } else {
        break;
      }
    }
  
    return bestCoords;
  };
  
  let popupIdCounter = 0;
  
  const getRootPopup = () => {
    let PopupRoot = document.getElementById("popup-root");
  
    if (PopupRoot === null) {
      PopupRoot = document.createElement("div");
      PopupRoot.setAttribute("id", "popup-root");
      document.body.appendChild(PopupRoot);
    }
  
    return PopupRoot;
  };
  
  export const useOnEscape = (handler, active = true) => {
    useEffect(() => {
      if (!active) return;
      const listener = (event) => {
        if (event.key === "Escape") handler(event);
      };
      document.addEventListener("keyup", listener);
  
      return () => {
        if (!active) return;
        document.removeEventListener("keyup", listener);
      };
    }, [handler, active]);
  };
  
  export const useRepositionOnResize = (handler, active = true) => {
    useEffect(() => {
      if (!active) return;
      const listener = () => {
        handler();
      };
  
      window.addEventListener("resize", listener);
  
      return () => {
        if (!active) return;
        window.removeEventListener("resize", listener);
      };
    }, [handler, active]);
  };
  
  export const useOnClickOutside = (ref, handler, active = true) => {
    useEffect(() => {
      if (!active) return;
      const listener = (event) => {
        const refs = Array.isArray(ref) ? ref : [ref];
  
        let contains = false;
        refs.forEach((r) => {
          if (!r.current || r.current.contains(event.target)) {
            contains = true;
            return;
          }
        });
        event.stopPropagation();
        if (!contains) handler(event);
      };
  
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
  
      return () => {
        if (!active) return;
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    }, [ref, handler, active]);
  };
  
  export const useTabbing = (contentRef, active = true) => {
    useEffect(() => {
      if (!active) return;
      const listener = (event) => {
        if (event.keyCode === 9) {
          if (contentRef && contentRef.current) {
            const els = contentRef.current.querySelectorAll(
              'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
            );
  
            const focusableEls = Array.prototype.slice.call(els);
            if (focusableEls.length === 1) {
              event.preventDefault();
              return;
            }
  
            const firstFocusableEl = focusableEls[0];
            const lastFocusableEl = focusableEls[focusableEls.length - 1];
            if (event.shiftKey && document.activeElement === firstFocusableEl) {
              event.preventDefault();
              lastFocusableEl.focus();
            } else if (document.activeElement === lastFocusableEl) {
              event.preventDefault();
              firstFocusableEl.focus();
            }
          }
        }
      };
  
      document.addEventListener("keydown", listener);
  
      return () => {
        if (!active) return;
        document.removeEventListener("keydown", listener);
      };
    }, [contentRef, active]);
  };
  
  export const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
  
  export const AnterosPopup = forwardRef(
    (
      {
        trigger = null,
        onOpen = () => {},
        onClose = () => {},
        defaultOpen = false,
        open = undefined,
        disabled = false,
        nested = false,
        closeOnDocumentClick = true,
        repositionOnResize = true,
        closeOnEscape = true,
        on = ["click"],
        contentStyle = {},
        arrowStyle = {},
        overlayStyle = {},
        className = "",
        position = "bottom center",
        modal = false,
        lockScroll = false,
        arrow = true,
        offsetX = 0,
        offsetY = 0,
        mouseEnterDelay = 100,
        mouseLeaveDelay = 100,
        keepTooltipInside = false,
        children,
      },
      ref
    ) => {
      const [isOpen, setIsOpen] = useState(open || defaultOpen);
      const triggerRef = useRef(null);
      const contentRef = useRef(null);
      const arrowRef = useRef(null);
      const focusedElBeforeOpen = useRef(null);
      const popupId = useRef(`popup-${++popupIdCounter}`);
  
      const isModal = modal ? true : !trigger;
      const timeOut = useRef(0);
  
      useIsomorphicLayoutEffect(() => {
        if (isOpen) {
          focusedElBeforeOpen.current = document.activeElement;
          setPosition();
          focusContentOnOpen();
          lockScrolll();
        } else {
          resetScroll();
        }
        return () => {
          clearTimeout(timeOut.current);
        };
      }, [isOpen]);
  
      useEffect(() => {
        if (typeof open === "boolean") {
          if (open) openPopup();
          else closePopup();
        }
      }, [open, disabled]);
  
      const openPopup = (event) => {
        if (isOpen || disabled) return;
        setIsOpen(true);
        setTimeout(() => onOpen(event), 0);
      };
  
      const closePopup = (event) => {
        if (!isOpen || disabled) return;
        setIsOpen(false);
        if (isModal && focusedElBeforeOpen.current)
          focusedElBeforeOpen.current.focus();
        setTimeout(() => onClose(event), 0);
      };
  
      const togglePopup = (event) => {
        if (event) {
          event.stopPropagation();
        }
        if (!isOpen) openPopup(event);
        else closePopup(event);
      };
  
      const onMouseEnter = (event) => {
        clearTimeout(timeOut.current);
        timeOut.current = setTimeout(() => openPopup(event), mouseEnterDelay);
      };
  
      const onContextMenu = (event) => {
        if (event) {
          event.preventDefault();
        }
        togglePopup();
      };
  
      const onMouseLeave = (event) => {
        clearTimeout(timeOut.current);
        timeOut.current = setTimeout(() => closePopup(event), mouseLeaveDelay);
      };
  
      const lockScrolll = () => {
        if (isModal && lockScroll)
          document.getElementsByTagName("body")[0].style.overflow = "hidden";
      };
  
      const resetScroll = () => {
        if (isModal && lockScroll)
          document.getElementsByTagName("body")[0].style.overflow = "auto";
      };
      const focusContentOnOpen = () => {
        if (contentRef && contentRef.current) {
          const focusableEls = contentRef.current.querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
          );
          const firstEl = Array.prototype.slice.call(focusableEls)[0];
          if (firstEl) {
            firstEl.focus();
          }
        }
      };
  
      useImperativeHandle(ref, () => ({
        open: () => {
          openPopup();
        },
        close: () => {
          closePopup();
        },
        toggle: () => {
          togglePopup();
        },
      }));
  
      // set Position
      const setPosition = () => {
        if (isModal || !isOpen) return;
        if (
          !triggerRef ||
          !triggerRef.current ||
          !contentRef ||
          !contentRef.current
        )
          return;
        const trigger1 = triggerRef.current.getBoundingClientRect();
        const content1 = contentRef.current.getBoundingClientRect();
  
        const cords = calculatePosition(
          trigger1,
          content1,
          position,
          arrow,
          {
            offsetX,
            offsetY,
          },
          keepTooltipInside
        );
        contentRef.current.style.top = `${cords.top + window.scrollY}px`;
        contentRef.current.style.left = `${cords.left + window.scrollX}px`;
        if (arrow && !!arrowRef.current) {
          arrowRef.current.style.transform = cords.transform;
          arrowRef.current.style.setProperty("-ms-transform", cords.transform);
          arrowRef.current.style.setProperty(
            "-webkit-transform",
            cords.transform
          );
          arrowRef.current.style.top =
          arrowStyle.top ? arrowStyle.top.toString() : cords.arrowTop;
          arrowRef.current.style.left =
          arrowStyle.left ? arrowStyle.left.toString() : cords.arrowLeft;
        }
      };
  
      useOnEscape(closePopup, closeOnEscape);
      useTabbing(contentRef, isOpen && isModal);
      useRepositionOnResize(setPosition, repositionOnResize);
      useOnClickOutside(
        !!trigger ? [contentRef, triggerRef] : [contentRef],
        closePopup,
        closeOnDocumentClick && !nested
      );
      const renderTrigger = () => {
        const triggerProps = {
          key: "T",
          ref: triggerRef,
          "aria-describedby": popupId.current,
        };
        const onAsArray = Array.isArray(on) ? on : [on];
        for (let i = 0, len = onAsArray.length; i < len; i++) {
          switch (onAsArray[i]) {
            case "click":
              triggerProps.onClick = togglePopup;
              break;
            case "right-click":
              triggerProps.onContextMenu = onContextMenu;
              break;
            case "hover":
              triggerProps.onMouseEnter = onMouseEnter;
              triggerProps.onMouseLeave = onMouseLeave;
              break;
            case "focus":
              triggerProps.onFocus = onMouseEnter;
              triggerProps.onBlur = onMouseLeave;
              break;
            default:
          }
        }
  
        if (typeof trigger === "function") {
          const comp = trigger(isOpen);
          return !!trigger && React.cloneElement(comp, triggerProps);
        }
  
        return !!trigger && React.cloneElement(trigger, triggerProps);
      };
  
      const addWarperAction = () => {
        const popupContentStyle = isModal
          ? styles.popupContent.modal
          : styles.popupContent.tooltip;
  
        const childrenElementProps = {
          className: `popup-content ${
            className !== ""
              ? className
                  .split(" ")
                  .map((c) => `${c}-content`)
                  .join(" ")
              : ""
          }`,
          style: {
            ...popupContentStyle,
            ...contentStyle,
            pointerEvents: "auto",
          },
          ref: contentRef,
          onClick: (e) => {
            e.stopPropagation();
          },
        };
        if (!modal && on.indexOf("hover") >= 0) {
          childrenElementProps.onMouseEnter = onMouseEnter;
          childrenElementProps.onMouseLeave = onMouseLeave;
        }
        return childrenElementProps;
      };
  
      const renderContent = () => {
        return (
          <div
            {...addWarperAction()}
            key="C"
            role={isModal ? "dialog" : "tooltip"}
            id={popupId.current}
          >
            {arrow && !isModal && (
              <div ref={arrowRef} style={styles.popupArrow}>
                <svg
                  data-testid="arrow"
                  className={`popup-arrow ${
                    className !== ""
                      ? className
                          .split(" ")
                          .map((c) => `${c}-arrow`)
                          .join(" ")
                      : ""
                  }`}
                  viewBox="0 0 32 16"
                  style={{
                    position: "absolute",
                    ...arrowStyle,
                  }}
                >
                  <path d="M16 0l16 16H0z" fill="currentcolor" />
                </svg>
              </div>
            )}
            {children && typeof children === "function"
              ? children(closePopup, isOpen)
              : children}
          </div>
        );
      };
  
      const overlay = on.indexOf("hover") < 0;
      const ovStyle = isModal ? styles.overlay.modal : styles.overlay.tooltip;
  
      const content = [
        overlay && (
          <div
            key="O"
            data-testid="overlay"
            data-popup={isModal ? "modal" : "tooltip"}
            className={`popup-overlay ${
              className !== ""
                ? className
                    .split(" ")
                    .map((c) => `${c}-overlay`)
                    .join(" ")
                : ""
            }`}
            style={{
              ...ovStyle,
              ...overlayStyle,
              pointerEvents:
                (closeOnDocumentClick && nested) || isModal ? "auto" : "none",
            }}
            onClick={closeOnDocumentClick && nested ? closePopup : undefined}
            tabIndex={-1}
          >
            {isModal && renderContent()}
          </div>
        ),
  
        !isModal && renderContent(),
      ];
  
      return (
        <>
          {renderTrigger()}
          {isOpen && ReactDOM.createPortal(content, getRootPopup())}
        </>
      );
    }
  );
  
  export default AnterosPopup;
  