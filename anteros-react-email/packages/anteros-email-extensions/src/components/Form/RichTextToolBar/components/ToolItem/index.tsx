
import { Tooltip } from '@arco-design/web-react';
import { classnames } from '@extensions/utils/classnames';
import React,{useRef,useEffect} from 'react';

export const ToolItem: React.FC<{
  title?: string;
  icon: React.ReactNode;
  onClick?: any;
  trigger?: string;
  style?: React.CSSProperties;
  isActive?: boolean;
}> = (props) => {
  const ref = useRef<any>(null);
  const onClick = props.onClick;

  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    ele.addEventListener('click', onClick);
    return () => {
      ele.removeEventListener('click', onClick);
    };
  }, [onClick]);

  if (!props.title) {
    return (
      <button
        ref={ref}
        tabIndex={-1}
        className='anteros-email-extensions-emailToolItem'
        title={props.title}
        onClick={props.onClick}
        style={props.style}
      >
        {props.icon}
      </button>
    );
  }
  return (
    <Tooltip mini position='bottom' content={props.title}>
      <button
        ref={ref}
        tabIndex={-1}
        className={classnames('anteros-email-extensions-emailToolItem', props.isActive && 'anteros-email-extensions-emailToolItem-active')}
        title={props.title}
        onClick={props.onClick}
        style={props.style}
      >
        {props.icon}
      </button>
    </Tooltip>
  );
};
