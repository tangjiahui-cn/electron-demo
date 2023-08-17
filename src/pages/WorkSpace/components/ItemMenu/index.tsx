import React, {useRef} from "react";
import {useStateWithRef} from "../../../../hooks/useStateWithRef";
import {createRoot} from "react-dom/client";
import styles from './index.module.less';

export interface Option { label: string, value: string }

interface ItemMenuProps {
  options?: Option[];
  onChoose?: (value: string, option: Option) => void;
  children: React.ReactNode;
}

export default function ItemMenu (props: ItemMenuProps) {
  const ref = useRef();
  const menuRef = useRef<any>();
  const [visible, setVisible] = useStateWithRef(false);

  function handleChooseItem (option: Option) {
    close();
    props?.onChoose?.(option.value, option);
  }

  function createMenu (e) {
    const div = menuRef.current = document.createElement('div')

    function listenOnce (e) {
      window.removeEventListener('mousedown', listenOnce)
      close();

      // 菜单打开情况下再次点击相同菜单项触发
      const isRightClickAgain = e.target === ref.current && e.which ===3 
      if (isRightClickAgain) {
        onMouseDown(e, true) 
      }
    }

    createRoot(div).render(<div
      className={styles.menu}
      style={{
        top: e.pageY,
        left: e.pageX,
      }}
      onMouseEnter={() => {
        window.removeEventListener('mousedown', listenOnce);
      }}
      onMouseLeave={() => {
        window.addEventListener('mousedown', listenOnce);
      }}
    >
      {
        props?.options?.map(option => {
          return <div
            key={option?.value}
            className={styles['menu-item']}
            onClick={() => handleChooseItem(option)}
          >{option.label}</div>
        })
      }
    </div>)
    document.body.appendChild(div)
  }

  function destroyMenu () {
    document.body.removeChild(menuRef.current)
    menuRef.current = null
  }

  function onMouseDown (e, immediately?: boolean) {
    const isRightMouse = (e?.nativeEvent?.which || e?.which) === 3
    if (isRightMouse) {
      if (visible && !immediately) {
        return;
      }
      createMenu(e);
      setVisible(true);
    }
  }

  function close () {
    if (!menuRef.current) return;
    setVisible(false);
    destroyMenu();
  }

  return React.cloneElement(props.children, {ref, onMouseDown})
}