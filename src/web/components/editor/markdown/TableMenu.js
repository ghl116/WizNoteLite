import React, { useEffect, useState, useRef } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import classNames from 'classnames';
import Icon from '../../../config/icons';
import { filterParentElement } from '../libs/dom_utils';
import { setRangeByDomBeforeEnd } from '../libs/range_utils';

function updateHotkeyTip(hotkeyStr) {
  let hotkey;
  if (/Mac/.test(navigator.platform) || navigator.platform === 'iPhone') {
    hotkey = hotkeyStr.replace('ctrl', '⌘').replace('shift', '⇧')
      .replace('alt', '⌥');
    if (hotkey.indexOf('⇧') > -1) {
      hotkey = hotkey.replace(':', ';').replace('+', '=')
        .replace('_', '-');
    }
  } else {
    hotkey = hotkeyStr.replace('⌘', 'ctrl').replace('⇧', 'shift')
      .replace('⌥', 'alt');
    if (hotkey.indexOf('shift') > -1) {
      hotkey = hotkey.replace(';', ':').replace('=', '+');
    }
  }
  return hotkey;
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  menuRoot: {
    width: '224px',
    color: palette.type === 'dark' ? '#fff' : '#333',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    height: '32px',
    width: '100%',
    position: 'relative',
  },
  clearOverflow: {
    overflow: 'visible',
  },
  subMenu: {
    position: 'absolute',
    top: '-6px',
    display: 'none',
    '&.active': {
      display: 'block',
    },
  },
  rightMenu: {
    right: 0,
    transform: 'translateX(100%)',
    paddingLeft: spacing(3),
  },
  leftMenu: {
    left: 0,
    transform: 'translateX(-100%)',
    paddingRight: spacing(3),
  },
  subMenuContainer: {
    backgroundColor: palette.type === 'dark' ? '#555555' : '#fff',
    color: palette.type === 'dark' ? '#fff' : '#333',
    boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
  },
  subMenuItem: {
    display: 'flex',
    border: 'none',
    textAlign: 'left',
    outline: 'none',
    fontSize: 14,
    padding: spacing(0, 2, 0, 1),
    height: 32,
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    '&:hover,&.hover': {
      backgroundColor: '#006eff',
      color: '#fff',
    },
  },
  menuItemIcon: {
    borderRadius: 4,
    marginRight: spacing(1),
    width: 20,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    fontSize: 14,
  },
  menuName: {
    flex: '1',
    fontSize: '15px',
    letterSpacing: '1px',
  },
  menuLine: {
    height: '1px',
    backgroundColor: '#d8d8d8',
    margin: spacing(0, 2),
  },
  iconArrow: {
    color: '#aaa',
    fontSize: '10px',
  },
  shortcut: {
    color: '#aaa',
    fontSize: '12px',
  },
}));

let makeCellEle;

function TableMenu(props) {
  const classes = useStyles();

  const { intl } = props;

  const [menuPosition, setMenuPosition] = useState(undefined);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [align, setAlign] = useState('left');
  const subMenuRef = useRef();

  function dispatchKey(hotKey) {
    if (props.editor?.vditor.ir.element) {
      const hotKeys = updateHotkeyTip(hotKey).split('-');
      let ctrlKey = false;
      let metaKey = false;
      if (hotKeys.length > 1 && (hotKeys[0] === 'ctrl' || hotKeys[0] === '⌘')) {
        if (/Mac/.test(navigator.platform)) {
          metaKey = true;
        } else {
          ctrlKey = true;
        }
      }
      const shiftKey = hotKeys.length > 2 && (hotKeys[1] === 'shift' || hotKeys[1] === '⇧');
      let key = (shiftKey ? hotKeys[2] : hotKeys[1]) || '-';
      if (shiftKey && key === '-' && !/Mac/.test(navigator.platform)) {
        key = '_';
      }
      const mockKeyboardEvent = new KeyboardEvent('keydown', {
        key, ctrlKey, metaKey, shiftKey,
      });
      props.editor.vditor.ir.element.dispatchEvent(mockKeyboardEvent);
    }
  }

  function clickHandler(type, e) {
    setRangeByDomBeforeEnd(makeCellEle);

    switch (type) {
      case 'addRowAbove':
        break;
      case 'addRowBelow':
        dispatchKey('⌘-=');
        break;
      case 'addColBefore':
        break;
      case 'addColAfter':
        dispatchKey('⌘-⇧-=');
        break;
      case 'alignLeft':
        dispatchKey('⌘-⇧-L');
        break;
      case 'alignCenter':
        dispatchKey('⌘-⇧-C');
        break;
      case 'alignRight':
        dispatchKey('⌘-⇧-R');
        break;
      case 'deleteRow':
        dispatchKey('⌘--');
        break;
      case 'deleteCol':
        dispatchKey('⌘-⇧--');
        break;
      case 'deleteTable':

        break;
      case 'CpHtml':

        break;
      case 'CpMd':

        break;
      default:
        break;
    }
    e.preventDefault();
    setMenuPosition(undefined);
  }

  useEffect(() => {
    function showSubMenuHandler(e) {
      const ele = filterParentElement(e.target, document.body, (dom) => dom.getAttribute('data-type') === 'subMenu', true);
      if (ele && !showSubMenu) {
        setShowSubMenu(true);
      } else if (!ele && showSubMenu) {
        setShowSubMenu(false);
      }
    }

    function mousedownHandler(e) {
      if (props.editor) {
        const ele = filterParentElement(e.target, props.editor.vditor.element, (dom) => dom.getAttribute('data-type') === 'table');
        if (e.button === 2 && ele) {
          makeCellEle = filterParentElement(e.target, props.editor.vditor.element, (dom) => ['th', 'td'].includes(dom.tagName?.toLocaleLowerCase()), true);
          if (makeCellEle) {
            const makeCellEleAlign = makeCellEle.getAttribute('align') ?? 'left';
            if (makeCellEleAlign !== align) {
              setAlign(makeCellEleAlign);
            }
            setMenuPosition({
              top: e.clientY,
              left: e.clientX,
            });
          }
          e.preventDefault();
        } else if (!filterParentElement(e.target, document.body, (dom) => dom.getAttribute('data-type') === 'subMenu', true) && menuPosition) {
          setMenuPosition(undefined);
        }
      }
    }
    window.addEventListener('mouseover', showSubMenuHandler);
    window.addEventListener('mousedown', mousedownHandler);
    return () => {
      window.removeEventListener('mouseover', showSubMenuHandler);
      window.removeEventListener('mousedown', mousedownHandler);
    };
  }, [menuPosition, showSubMenu, props.editor, align]);

  const subMenuPosClass = (menuPosition?.left ?? 0) + 344 < window.innerWidth
    ? classes.rightMenu : classes.leftMenu;

  return (
    <Menu
      keepMounted
      open={Boolean(menuPosition)}
      anchorReference="anchorPosition"
      anchorPosition={menuPosition}
      classes={{
        list: classes.menuRoot,
        paper: classes.clearOverflow,
      }}
    >
      <MenuItem onClick={(e) => clickHandler('addRowAbove', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuAddRowAbove' })}</div>
        </div>
      </MenuItem>
      <MenuItem onClick={(e) => clickHandler('addRowBelow', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuAddRowBelow' })}</div>
          <div className={classes.shortcut}>{updateHotkeyTip('⌘+Enter')}</div>
        </div>
      </MenuItem>
      <div className={classes.menuLine} />
      <MenuItem onClick={(e) => clickHandler('addColBefore', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuAddColBefore' })}</div>
        </div>
      </MenuItem>
      <MenuItem onClick={(e) => clickHandler('addColAfter', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuAddColAfter' })}</div>
          <div className={classes.shortcut}>{updateHotkeyTip('⌘+⌥+Enter')}</div>
        </div>
      </MenuItem>
      <div className={classes.menuLine} />
      <MenuItem classes={{
        root: classes.clearOverflow,
      }}
      >
        <div
          className={classes.menuItem}
          data-type="subMenu"
        >
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuAlign' })}</div>
          <ArrowForwardIosIcon className={classes.iconArrow} />
          <div
            className={classNames(classes.subMenu, {
              active: showSubMenu,
            }, subMenuPosClass)}
            ref={subMenuRef}
          >
            <div className={classes.subMenuContainer}>
              <button type="button" className={classes.subMenuItem} onClick={(e) => clickHandler('alignLeft', e)}>
                <div className={classes.menuItemIcon}>
                  {align === 'left' && (<Icon.SelectedIcon className={classes.selectedIcon} />)}
                </div>
                <div>{intl.formatMessage({ id: 'tableMenuLeft' })}</div>
              </button>
              <button type="button" className={classes.subMenuItem} onClick={(e) => clickHandler('alignCenter', e)}>
                <div className={classes.menuItemIcon}>
                  {align === 'center' && (<Icon.SelectedIcon className={classes.selectedIcon} />)}
                </div>
                <div>{intl.formatMessage({ id: 'tableMenuCenter' })}</div>
              </button>
              <button type="button" className={classes.subMenuItem} onClick={(e) => clickHandler('alignRight', e)}>
                <div className={classes.menuItemIcon}>
                  {align === 'right' && (<Icon.SelectedIcon className={classes.selectedIcon} />)}
                </div>
                <div>{intl.formatMessage({ id: 'tableMenuRight' })}</div>
              </button>
            </div>
          </div>
        </div>
      </MenuItem>
      <div className={classes.menuLine} />
      <MenuItem onClick={(e) => clickHandler('deleteRow', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuDeleteRow' })}</div>
        </div>
      </MenuItem>
      <MenuItem onClick={(e) => clickHandler('deleteCol', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuDeleteCol' })}</div>
        </div>
      </MenuItem>
      <MenuItem onClick={(e) => clickHandler('deleteTable', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuDeleteTable' })}</div>
        </div>
      </MenuItem>
      <div className={classes.menuLine} />
      <MenuItem onClick={(e) => clickHandler('CpHtml', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuCpHtml' })}</div>
        </div>
      </MenuItem>
      <MenuItem onClick={(e) => clickHandler('CpMd', e)}>
        <div className={classes.menuItem}>
          <div className={classes.menuName}>{intl.formatMessage({ id: 'tableMenuCpMd' })}</div>
        </div>
      </MenuItem>
    </Menu>
  );
}

TableMenu.propTypes = {
  intl: PropTypes.object.isRequired,
  editor: PropTypes.object,
};

TableMenu.defaultProps = {
  editor: null,
};

export default injectIntl(TableMenu);