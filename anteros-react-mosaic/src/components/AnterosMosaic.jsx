import classNames from "classnames";
import countBy from "lodash/countBy";
import keys from "lodash/keys";
import pickBy from "lodash/pickBy";
import React from "react";
import { DndProvider } from "react-dnd";
import MultiBackend from "react-dnd-multi-backend";
import HTML5ToTouch from "react-dnd-multi-backend/dist/cjs/HTML5toTouch";
import { v4 as uuid } from "uuid";

const DEFAULT_EXPAND_PERCENTAGE = 70;

export const DEFAULT_CONTROLS_WITH_CREATION = React.Children.toArray([
  <ReplaceButton/>,
  <SplitButton/>,
  <ExpandButton/>,
  <RemoveButton/>,
]);

export const DEFAULT_CONTROLS_WITHOUT_CREATION = React.Children.toArray([<ExpandButton/>, <RemoveButton/>]);

export const MosaicContext = React.createContext(undefined);
export const MosaicWindowContext = React.createContext(undefined);

export class ExpandButton extends React.PureComponent {
  render() {
    return (
      <MosaicContext.Consumer>
        {({ mosaicActions }) =>
          createDefaultToolbarButton(
            "Expand",
            classNames("expand-button"),
            this.createExpand(mosaicActions)
          )
        }
      </MosaicContext.Consumer>
    );
  }

  createExpand(mosaicActions) {
    return () => {
      mosaicActions.expand(this.context.mosaicWindowActions.getPath());

      if (this.props.onClick) {
        this.props.onClick();
      }
    };
  }
}

export class RemoveButton extends React.PureComponent {
  render() {
    return (
      <MosaicContext.Consumer>
        {({ mosaicActions }) =>
          createDefaultToolbarButton(
            "Close Window",
            classNames("close-button", OptionalBlueprint.getIconClass("CROSS")),
            this.createRemove(mosaicActions)
          )
        }
      </MosaicContext.Consumer>
    );
  }

  createRemove(mosaicActions) {
    return () => {
      mosaicActions.remove(this.context.mosaicWindowActions.getPath());

      if (this.props.onClick) {
        this.props.onClick();
      }
    };
  }
}

export class ReplaceButton extends React.PureComponent {
  render() {
    return createDefaultToolbarButton(
      "Replace Window",
      classNames("replace-button", OptionalBlueprint.getIconClass("EXCHANGE")),
      this.replace
    );
  }

  replace = () => {
    this.context.mosaicWindowActions
      .replaceWithNew()
      .then(() => {
        if (this.props.onClick) {
          this.props.onClick();
        }
      })
      .catch(noop); // Swallow rejections (i.e. on user cancel)
  };
}

export class Separator extends React.PureComponent {
  render() {
    return <div className="separator" />;
  }
}

export class SplitButton extends React.PureComponent {
  render() {
    return createDefaultToolbarButton(
      "Split Window",
      classNames(
        "split-button",
        OptionalBlueprint.getIconClass("ADD_COLUMN_RIGHT")
      ),
      this.split
    );
  }

  split = () => {
    this.context.mosaicWindowActions
      .split()
      .then(() => {
        if (this.props.onClick) {
          this.props.onClick();
        }
      })
      .catch(noop);
  };
}

export function createDefaultToolbarButton(title, className, onClick, text) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={classNames(
        "mosaic-default-control",
        OptionalBlueprint.getClasses("BUTTON", "MINIMAL"),
        className
      )}
    >
      {text && <span className="control-text">{text}</span>}
    </button>
  );
}

/**
 * Used by `react-dnd`
 * @type {{WINDOW: string}}
 */
export const MosaicDragType = {
  WINDOW: "MosaicWindow",
};

function assertNever(shouldBeNever) {
  throw new Error("Caso não tratado: " + JSON.stringify(shouldBeNever));
}

export function split(boundingBox, relativeSplitPercentage, direction) {
  const absolutePercentage = getAbsoluteSplitPercentage(
    boundingBox,
    relativeSplitPercentage,
    direction
  );
  if (direction === "column") {
    return {
      first: {
        ...boundingBox,
        bottom: 100 - absolutePercentage,
      },
      second: {
        ...boundingBox,
        top: absolutePercentage,
      },
    };
  } else if (direction === "row") {
    return {
      first: {
        ...boundingBox,
        right: 100 - absolutePercentage,
      },
      second: {
        ...boundingBox,
        left: absolutePercentage,
      },
    };
  } else {
    return assertNever(direction);
  }
}

export function getAbsoluteSplitPercentage(
  boundingBox,
  relativeSplitPercentage,
  direction
) {
  const { top, right, bottom, left } = boundingBox;
  if (direction === "column") {
    const height = 100 - top - bottom;
    return (height * relativeSplitPercentage) / 100 + top;
  } else if (direction === "row") {
    const width = 100 - right - left;
    return (width * relativeSplitPercentage) / 100 + left;
  } else {
    return assertNever(direction);
  }
}

export function getRelativeSplitPercentage(
  boundingBox,
  absoluteSplitPercentage,
  direction
) {
  const { top, right, bottom, left } = boundingBox;
  if (direction === "column") {
    const height = 100 - top - bottom;
    return ((absoluteSplitPercentage - top) / height) * 100;
  } else if (direction === "row") {
    const width = 100 - right - left;
    return ((absoluteSplitPercentage - left) / width) * 100;
  } else {
    return assertNever(direction);
  }
}

export function asStyles({ top, right, bottom, left }) {
  return {
    top: `${top}%`,
    right: `${right}%`,
    bottom: `${bottom}%`,
    left: `${left}%`,
  };
}

const MosaicDropTargetPosition = {
  TOP: "top",
  BOTTOM: "bottom",
  LEFT: "left",
  RIGHT: "right",
};

function isUncontrolled(props) {
  return props.initialValue != null;
}

/**
 * Used to prepare `update` for `immutability-helper`
 * @param mosaicUpdate
 * @returns {any}
 */
export function buildSpecFromUpdate(mosaicUpdate) {
  if (mosaicUpdate.path.length > 0) {
    return set({}, mosaicUpdate.path, mosaicUpdate.spec);
  } else {
    return mosaicUpdate.spec;
  }
}

/**
 * Applies `updates` to `root`
 * @param root
 * @param updates
 * @returns {MosaicNode<T>}
 */
export function updateTree(root, updates) {
  let currentNode = root;
  updates.forEach((mUpdate) => {
    currentNode = update(currentNode, buildSpecFromUpdate(mUpdate));
  });

  return currentNode;
}

/**
 * Creates a `MosaicUpdate<T>` to remove the node at `path` from `root`
 * @param root
 * @param path
 * @returns {{path: T[], spec: {$set: MosaicNode<T>}}}
 */
export function createRemoveUpdate(root, path) {
  const parentPath = dropRight(path);
  const nodeToRemove = last(path);
  const siblingPath = parentPath.concat(getOtherBranch(nodeToRemove));
  const sibling = getAndAssertNodeAtPathExists(root, siblingPath);

  return {
    path: parentPath,
    spec: {
      $set: sibling,
    },
  };
}

function isPathPrefixEqual(a, b, length) {
  return isEqual(take(a, length), take(b, length));
}

/**
 * Creates a `MosaicUpdate<T>` to split the _leaf_ at `destinationPath` into a node of it and the node from `sourcePath`
 * placing the node from `sourcePath` in `position`.
 * @param root
 * @param sourcePath
 * @param destinationPath
 * @param position
 * @returns {(MosaicUpdate<T>|{path: MosaicPath, spec: {$set: {first: MosaicNode<T>, second: MosaicNode<T>, direction: MosaicDirection}}})[]}
 */
export function createDragToUpdates(
  root,
  sourcePath,
  destinationPath,
  position
) {
  let destinationNode = getAndAssertNodeAtPathExists(root, destinationPath);
  const updates = [];

  const destinationIsParentOfSource = isPathPrefixEqual(
    sourcePath,
    destinationPath,
    destinationPath.length
  );
  if (destinationIsParentOfSource) {
    // Must explicitly remove source from the destination node
    destinationNode = updateTree(destinationNode, [
      createRemoveUpdate(
        destinationNode,
        drop(sourcePath, destinationPath.length)
      ),
    ]);
  } else {
    // Can remove source normally
    updates.push(createRemoveUpdate(root, sourcePath));

    // Have to drop in the correct destination after the source has been removed
    const removedNodeParentIsInPath = isPathPrefixEqual(
      sourcePath,
      destinationPath,
      sourcePath.length - 1
    );
    if (removedNodeParentIsInPath) {
      destinationPath.splice(sourcePath.length - 1, 1);
    }
  }

  const sourceNode = getAndAssertNodeAtPathExists(root, sourcePath);
  let first;
  let second;
  if (
    position === MosaicDropTargetPosition.LEFT ||
    position === MosaicDropTargetPosition.TOP
  ) {
    first = sourceNode;
    second = destinationNode;
  } else {
    first = destinationNode;
    second = sourceNode;
  }

  let direction = "column";
  if (
    position === MosaicDropTargetPosition.LEFT ||
    position === MosaicDropTargetPosition.RIGHT
  ) {
    direction = "row";
  }

  updates.push({
    path: destinationPath,
    spec: {
      $set: { first, second, direction },
    },
  });

  return updates;
}

/**
 * Sets the splitPercentage to hide the node at `path`
 * @param path
 * @returns {{path: T[], spec: {splitPercentage: {$set: number}}}}
 */
export function createHideUpdate(path) {
  const targetPath = dropRight(path);
  const thisBranch = last(path);

  let splitPercentage;
  if (thisBranch === "first") {
    splitPercentage = 0;
  } else {
    splitPercentage = 100;
  }

  return {
    path: targetPath,
    spec: {
      splitPercentage: {
        $set: splitPercentage,
      },
    },
  };
}

/**
 * Sets the splitPercentage of node at `path` and all of its parents to `percentage` in order to expand it
 * @param path
 * @param percentage
 * @returns {{spec: MosaicUpdateSpec<T>, path: Array}}
 */
export function createExpandUpdate(path, percentage) {
  let spec = {};
  for (let i = path.length - 1; i >= 0; i--) {
    const branch = path[i];
    const splitPercentage = branch === "first" ? percentage : 100 - percentage;
    spec = {
      splitPercentage: {
        $set: splitPercentage,
      },
      [branch]: spec,
    };
  }

  return {
    spec,
    path: [],
  };
}

export class MosaicWithoutDragDropContext extends React.PureComponent {
  static defaultProps = {
    onChange: () => void 0,
    zeroStateView: <MosaicZeroState />,
    className: "mosaic-blueprint-theme",
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.mosaicId &&
      prevState.mosaicId !== nextProps.mosaicId &&
      process.env.NODE_ENV !== "production"
    ) {
      throw new Error(
        "O AnterosMosaic não oferece suporte à atualização do mosaicId após a instanciação"
      );
    }

    if (
      isUncontrolled(nextProps) &&
      nextProps.initialValue !== prevState.lastInitialValue
    ) {
      return {
        lastInitialValue: nextProps.initialValue,
        currentNode: nextProps.initialValue,
      };
    }

    return null;
  }

  state = {
    currentNode: null,
    lastInitialValue: null,
    mosaicId: this.props.mosaicId ? this.props.mosaicId:uuid(),
  };

  render() {
    const { className } = this.props;

    return (
      <MosaicContext.Provider value={this.childContext}>
        <div className={classNames(className, "mosaic mosaic-drop-target")}>
          {this.renderTree()}
          <RootDropTargets />
        </div>
      </MosaicContext.Provider>
    );
  }

  getRoot() {
    if (isUncontrolled(this.props)) {
      return this.state.currentNode;
    } else {
      return this.props.value;
    }
  }

  updateRoot = (updates, suppressOnRelease = false) => {
    const currentNode = this.getRoot() || {};

    this.replaceRoot(updateTree(currentNode, updates), suppressOnRelease);
  };

  replaceRoot = (currentNode, suppressOnRelease = false) => {
    this.props.onChange(currentNode);
    if (!suppressOnRelease && this.props.onRelease) {
      this.props.onRelease(currentNode);
    }

    if (isUncontrolled(this.props)) {
      this.setState({ currentNode });
    }
  };

  actions = {
    updateTree: this.updateRoot,
    remove: (path) => {
      if (path.length === 0) {
        this.replaceRoot(null);
      } else {
        this.updateRoot([createRemoveUpdate(this.getRoot(), path)]);
      }
    },
    expand: (path, percentage = DEFAULT_EXPAND_PERCENTAGE) =>
      this.updateRoot([createExpandUpdate(path, percentage)]),
    getRoot: () => this.getRoot(),
    hide: (path) => this.updateRoot([createHideUpdate(path)]),
    replaceWith: (path, newNode) =>
      this.updateRoot([
        {
          path,
          spec: {
            $set: newNode,
          },
        },
      ]),
  };

  childContext = {
    mosaicActions: this.actions,
    mosaicId: this.state.mosaicId,
  };

  renderTree() {
    const root = this.getRoot();
    this.validateTree(root);
    if (root === null || root === undefined) {
      return this.props.zeroStateView;
    } else {
      const { renderTile, resize } = this.props;
      return <MosaicRoot root={root} renderTile={renderTile} resize={resize} />;
    }
  }

  validateTree(node) {
    if (process.env.NODE_ENV !== "production") {
      const duplicates = keys(pickBy(countBy(getLeaves(node)), (n) => n > 1));

      if (duplicates.length > 0) {
        throw new Error(
          `IDs duplicados [${duplicates.join(
            ","
          )}] detectados. O mosaico não suporta card's com o mesmo ID`
        );
      }
    }
  }
}

export class AnterosMosaic extends React.PureComponent {
  render() {
    return (
      <DndProvider backend={MultiBackend} options={HTML5ToTouch}>
        <MosaicWithoutDragDropContext {...this.props} />
      </DndProvider>
    );
  }
}

const dropTarget = {
  drop: (props, monitor, component) => {
    if (component.context.mosaicId === (monitor.getItem() || {}).mosaicId) {
      return {
        path: props.path,
        position: props.position,
      };
    } else {
      return {};
    }
  },
};

class MosaicDropTargetClass extends React.PureComponent {
  static contextType = MosaicContext;
  context;

  render() {
    const { position, isOver, connectDropTarget, draggedMosaicId } = this.props;
    return connectDropTarget(
      <div
        className={classNames("drop-target", position, {
          "drop-target-hover":
            isOver && draggedMosaicId === this.context.mosaicId,
        })}
      />
    );
  }
}

export const MosaicDropTarget = DropTarget(
  MosaicDragType.WINDOW,
  dropTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    draggedMosaicId: monitor.getItem().mosaicId,
  })
)(MosaicDropTargetClass);

export class MosaicRoot extends React.PureComponent {
  static contextType = MosaicContext;
  context;

  render() {
    const { root } = this.props;
    return (
      <div className="mosaic-root">
        {this.renderRecursively(root, BoundingBox.empty(), [])}
      </div>
    );
  }

  renderRecursively(node, boundingBox, path) {
    if (isParent(node)) {
      const splitPercentage =
        node.splitPercentage == null ? 50 : node.splitPercentage;
      const { first, second } = BoundingBox.split(
        boundingBox,
        splitPercentage,
        node.direction
      );
      return flatten(
        [
          this.renderRecursively(node.first, first, path.concat("first")),
          this.renderSplit(node.direction, boundingBox, splitPercentage, path),
          this.renderRecursively(node.second, second, path.concat("second")),
        ].filter(nonNullElement)
      );
    } else {
      return (
        <div
          key={node}
          className="mosaic-tile"
          style={{ ...BoundingBox.asStyles(boundingBox) }}
        >
          {this.props.renderTile(node, path)}
        </div>
      );
    }
  }

  renderSplit(direction, boundingBox, splitPercentage, path) {
    const { resize } = this.props;
    if (resize !== "DISABLED") {
      return (
        <Split
          key={path.join(",") + "splitter"}
          {...resize}
          boundingBox={boundingBox}
          splitPercentage={splitPercentage}
          direction={direction}
          onChange={(percentage) => this.onResize(percentage, path, true)}
          onRelease={(percentage) => this.onResize(percentage, path, false)}
        />
      );
    } else {
      return null;
    }
  }

  onResize = (percentage, path, suppressOnRelease) => {
    this.context.mosaicActions.updateTree(
      [
        {
          path,
          spec: {
            splitPercentage: {
              $set: percentage,
            },
          },
        },
      ],
      suppressOnRelease
    );
  };
}

function nonNullElement(x) {
  return x !== null;
}

export class InternalMosaicWindow extends React.Component {
  static defaultProps = {
    additionalControlButtonText: "More",
    draggable: true,
    renderPreview: ({ title }) => (
      <div className="mosaic-preview">
        <div className="mosaic-window-toolbar">
          <div className="mosaic-window-title">{title}</div>
        </div>
        <div className="mosaic-window-body">
          <h4>{title}</h4>
          <OptionalBlueprint.Icon iconSize={72} icon="application" />
        </div>
      </div>
    ),
    renderToolbar: null,
  };
  static contextType = MosaicContext;
  context;

  state = {
    additionalControlsOpen: false,
  };

  rootElement = null;

  render() {
    const {
      className,
      isOver,
      renderPreview,
      additionalControls,
      connectDropTarget,
      connectDragPreview,
      draggedMosaicId,
    } = this.props;

    return (
      <MosaicWindowContext.Provider value={this.childContext}>
        {connectDropTarget(
          <div
            className={classNames(
              "mosaic-window mosaic-drop-target",
              className,
              {
                "drop-target-hover":
                  isOver && draggedMosaicId === this.context.mosaicId,
                "additional-controls-open": this.state.additionalControlsOpen,
              }
            )}
            ref={(element) => (this.rootElement = element)}
          >
            {this.renderToolbar()}
            <div className="mosaic-window-body">{this.props.children}</div>
            <div
              className="mosaic-window-body-overlay"
              onClick={() => this.setAdditionalControlsOpen(false)}
            />
            <div className="mosaic-window-additional-actions-bar">
              {additionalControls}
            </div>
            {connectDragPreview(renderPreview(this.props))}
            <div className="drop-target-container">
              {values(MosaicDropTargetPosition).map(this.renderDropTarget)}
            </div>
          </div>
        )}
      </MosaicWindowContext.Provider>
    );
  }

  getToolbarControls() {
    const { toolbarControls, createNode } = this.props;
    if (toolbarControls) {
      return toolbarControls;
    } else if (createNode) {
      return DEFAULT_CONTROLS_WITH_CREATION;
    } else {
      return DEFAULT_CONTROLS_WITHOUT_CREATION;
    }
  }

  renderToolbar() {
    const {
      title,
      draggable,
      additionalControls,
      additionalControlButtonText,
      path,
      renderToolbar,
    } = this.props;
    const { additionalControlsOpen } = this.state;
    const toolbarControls = this.getToolbarControls();
    const draggableAndNotRoot = draggable && path.length > 0;
    const connectIfDraggable = draggableAndNotRoot
      ? this.props.connectDragSource
      : (el) => el;

    if (renderToolbar) {
      const connectedToolbar = connectIfDraggable(
        renderToolbar(this.props, draggable)
      );
      return (
        <div
          className={classNames("mosaic-window-toolbar", {
            draggable: draggableAndNotRoot,
          })}
        >
          {connectedToolbar}
        </div>
      );
    }

    const titleDiv = connectIfDraggable(
      <div title={title} className="mosaic-window-title">
        {title}
      </div>
    );

    const hasAdditionalControls = !isEmpty(additionalControls);

    return (
      <div
        className={classNames("mosaic-window-toolbar", {
          draggable: draggableAndNotRoot,
        })}
      >
        {titleDiv}
        <div
          className={classNames(
            "mosaic-window-controls",
            OptionalBlueprint.getClasses("BUTTON_GROUP")
          )}
        >
          {hasAdditionalControls && (
            <button
              onClick={() =>
                this.setAdditionalControlsOpen(!additionalControlsOpen)
              }
              className={classNames(
                OptionalBlueprint.getClasses("BUTTON", "MINIMAL"),
                OptionalBlueprint.getIconClass("MORE"),
                {
                  [OptionalBlueprint.getClasses(
                    "ACTIVE"
                  )]: additionalControlsOpen,
                }
              )}
            >
              <span className="control-text">
                {additionalControlButtonText}
              </span>
            </button>
          )}
          {hasAdditionalControls && <Separator />}
          {toolbarControls}
        </div>
      </div>
    );
  }

  renderDropTarget = (position) => {
    const { path } = this.props;

    return <MosaicDropTarget position={position} path={path} key={position} />;
  };

  checkCreateNode() {
    if (this.props.createNode == null) {
      throw new Error("Operation invalid unless `createNode` is defined");
    }
  }

  split = (...args) => {
    this.checkCreateNode();
    const { createNode, path } = this.props;
    const { mosaicActions } = this.context;
    const root = mosaicActions.getRoot();

    const direction =
      this.rootElement.offsetWidth > this.rootElement.offsetHeight
        ? "row"
        : "column";

    return Promise.resolve(createNode(...args)).then((second) =>
      mosaicActions.replaceWith(path, {
        direction,
        second,
        first: getAndAssertNodeAtPathExists(root, path),
      })
    );
  };

  swap = (...args) => {
    this.checkCreateNode();
    const { mosaicActions } = this.context;
    const { createNode, path } = this.props;
    return Promise.resolve(createNode(...args)).then((node) =>
      mosaicActions.replaceWith(path, node)
    );
  };

  setAdditionalControlsOpen = (additionalControlsOpen) => {
    this.setState({ additionalControlsOpen });
  };

  getPath = () => this.props.path;

  connectDragSource = (connectedElements) => {
    const { connectDragSource } = this.props;
    return connectDragSource(connectedElements);
  };

  childContext = {
    mosaicWindowActions: {
      split: this.split,
      replaceWithNew: this.swap,
      setAdditionalControlsOpen: this.setAdditionalControlsOpen,
      getPath: this.getPath,
      connectDragSource: this.connectDragSource,
    },
  };
}

const dragSource = {
  beginDrag: (props, _monitor, component) => {
    if (props.onDragStart) {
      props.onDragStart();
    }
    // TODO: Na verdade, apenas exclua em vez de ocultar
    // O adiamento é necessário porque o elemento deve estar presente no início para que o HTML DnD não grite
    const hideTimer = defer(() =>
      component.context.mosaicActions.hide(component.props.path)
    );
    return {
      mosaicId: component.context.mosaicId,
      hideTimer,
    };
  },
  endDrag: (props, monitor, component) => {
    const { hideTimer } = monitor.getItem();
    // Se a chamada de ocultação ainda não aconteceu, cancele-a
    window.clearTimeout(hideTimer);

    const ownPath = component.props.path;
    const dropResult = monitor.getDropResult() || {};
    const { mosaicActions } = component.context;
    const { position, path: destinationPath } = dropResult;
    if (
      position != null &&
      destinationPath != null &&
      !isEqual(destinationPath, ownPath)
    ) {
      mosaicActions.updateTree(
        createDragToUpdates(
          mosaicActions.getRoot(),
          ownPath,
          destinationPath,
          position
        )
      );
      if (props.onDragEnd) {
        props.onDragEnd("drop");
      }
    } else {
      // TODO: restaurar o nó do estado capturado
      mosaicActions.updateTree([
        {
          path: dropRight(ownPath),
          spec: {
            splitPercentage: {
              $set: null,
            },
          },
        },
      ]);
      if (props.onDragEnd) {
        props.onDragEnd("reset");
      }
    }
  },
};

function alternateDirection(node, direction = "row") {
  if (isParent(node)) {
    const nextDirection = getOtherDirection(direction);
    return {
      direction,
      first: alternateDirection(node.first, nextDirection),
      second: alternateDirection(node.second, nextDirection),
    };
  } else {
    return node;
  }
}

export const Corner = {
  TOP_LEFT: 1,
  TOP_RIGHT: 2,
  BOTTOM_LEFT: 3,
  BOTTOM_RIGHT: 4,
};

/**
 * Returns `true` if `node` is a MosaicParent
 * @param node
 * @returns {boolean}
 */
export function isParent(node) {
  return node.direction != null;
}

/**
 * Creates a balanced binary tree from `leaves` with the goal of making them as equal area as possible
 * @param leaves
 * @param startDirection
 * @returns {MosaicNode<T>}
 */
export function createBalancedTreeFromLeaves(leaves, startDirection = "row") {
  if (leaves.length === 0) {
    return null;
  }

  let current = clone(leaves);
  let next = [];

  while (current.length > 1) {
    while (current.length > 0) {
      if (current.length > 1) {
        next.push({
          direction: "row",
          first: current.shift(),
          second: current.shift(),
        });
      } else {
        next.unshift(current.shift());
      }
    }
    current = next;
    next = [];
  }
  return alternateDirection(current[0], startDirection);
}

/**
 * Gets the sibling of `branch`
 * @param branch
 * @returns {any}
 */
export function getOtherBranch(branch) {
  if (branch === "first") {
    return "second";
  } else if (branch === "second") {
    return "first";
  } else {
    throw new Error(`Branch '${branch}' not a valid branch`);
  }
}

/**
 * Gets the opposite of `direction`
 * @param direction
 * @returns {any}
 */
export function getOtherDirection(direction) {
  if (direction === "row") {
    return "column";
  } else {
    return "row";
  }
}

/**
 * Traverses `tree` to find the path to the specified `corner`
 * @param tree
 * @param corner
 * @returns {MosaicPath}
 */
export function getPathToCorner(tree, corner) {
  let currentNode = tree;
  const currentPath = [];
  while (isParent(currentNode)) {
    if (
      currentNode.direction === "row" &&
      (corner === Corner.TOP_LEFT || corner === Corner.BOTTOM_LEFT)
    ) {
      currentPath.push("first");
      currentNode = currentNode.first;
    } else if (
      currentNode.direction === "column" &&
      (corner === Corner.TOP_LEFT || corner === Corner.TOP_RIGHT)
    ) {
      currentPath.push("first");
      currentNode = currentNode.first;
    } else {
      currentPath.push("second");
      currentNode = currentNode.second;
    }
  }

  return currentPath;
}

/**
 * Pega todas as folhas da `árvore`
 * @param tree
 * @returns {T[]}
 */
export function getLeaves(tree) {
  if (tree == null) {
    return [];
  } else if (isParent(tree)) {
    return getLeaves(tree.first).concat(getLeaves(tree.second));
  } else {
    return [tree];
  }
}

/**
 * Gets node at `path` from `tree`
 * @param tree
 * @param path
 * @returns {MosaicNode<T>|null}
 */
export function getNodeAtPath(tree, path) {
  if (path.length > 0) {
    return get(tree, path, null);
  } else {
    return tree;
  }
}

/**
 * Obtém um nó em `caminho` de` árvore` e verifica se nem `árvore` nem o resultado são nulos
 * @param tree
 * @param path
 * @returns {MosaicNode<T>}
 */
export function getAndAssertNodeAtPathExists(tree, path) {
  if (tree == null) {
    throw new Error("A raiz está vazia, não é possível buscar o caminho");
  }
  const node = getNodeAtPath(tree, path);
  if (node == null) {
    throw new Error(`O caminho [${path.join(",")}] não resolveu para um nó`);
  }
  return node;
}


// Cada etapa exportada aqui apenas para manter o react-hot-loader feliz
export const SourceConnectedInternalMosaicWindow = DragSource(
  MosaicDragType.WINDOW,
  dragSource,
  (connect, _monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
  })
)(InternalMosaicWindow);

export const SourceDropConnectedInternalMosaicWindow = DropTarget(
  MosaicDragType.WINDOW,
  {},
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    draggedMosaicId: monitor.getItem().mosaicId,
  })
)(SourceConnectedInternalMosaicWindow);

export class MosaicWindow extends React.PureComponent {
  render() {
    return <SourceDropConnectedInternalMosaicWindow {...this.props} />;
  }
}

export class MosaicZeroState extends React.PureComponent {
  static contextType = MosaicContext;
  context;

  render() {
    return (
      <div
        className={classNames(
          "mosaic-zero-state",
          OptionalBlueprint.getClasses("NON_IDEAL_STATE")
        )}
      >
        <div className={OptionalBlueprint.getClasses("NON_IDEAL_STATE_VISUAL")}>
          <OptionalBlueprint.Icon iconSize={120} icon="applications" />
        </div>
        <h4 className={OptionalBlueprint.getClasses("HEADING")}>
          No Windows Present
        </h4>
        <div>
          {this.props.createNode && (
            <button
              className={classNames(
                OptionalBlueprint.getClasses("BUTTON"),
                OptionalBlueprint.getIconClass("ADD")
              )}
              onClick={this.replace}
            >
              Add New Window
            </button>
          )}
        </div>
      </div>
    );
  }

  replace = () =>
    Promise.resolve(this.props.createNode())
      .then((node) => this.context.mosaicActions.replaceWith([], node))
      .catch(noop); // Swallow rejections (i.e. on user cancel)
}

class RootDropTargetsClass extends React.PureComponent {
  render() {
    return (
      <div
        className={classNames("drop-target-container", {
          "-dragging": this.props.isDragging,
        })}
      >
        {values(MosaicDropTargetPosition).map((position) => (
          <MosaicDropTarget position={position} path={[]} key={position} />
        ))}
      </div>
    );
  }
}


export const RootDropTargets = DropTarget(
  MosaicDragType.WINDOW,
  {},
  (_connect, monitor) => ({
    isDragging:
      monitor.getItem() !== null &&
      monitor.getItemType() === MosaicDragType.WINDOW,
  })
)(RootDropTargetsClass);

const RESIZE_THROTTLE_MS = 1000 / 30; // 30 fps

const TOUCH_EVENT_OPTIONS = {
  capture: true,
  passive: false,
};

export class Split extends React.PureComponent {
  rootElement = React.createRef();
  listenersBound = false;

  static defaultProps = {
    onChange: () => void 0,
    onRelease: () => void 0,
    minimumPaneSizePercentage: 20,
  };

  render() {
    const { direction } = this.props;
    return (
      <div
        className={classNames("mosaic-split", {
          "-row": direction === "row",
          "-column": direction === "column",
        })}
        ref={this.rootElement}
        onMouseDown={this.onMouseDown}
        style={this.computeStyle()}
      >
        <div className="mosaic-split-line" />
      </div>
    );
  }

  componentDidMount() {
    this.rootElement.current.addEventListener(
      "touchstart",
      this.onMouseDown,
      TOUCH_EVENT_OPTIONS
    );
  }

  componentWillUnmount() {
    this.unbindListeners();
    if (this.rootElement.current) {
      this.rootElement.current.ownerDocument.removeEventListener(
        "touchstart",
        this.onMouseDown,
        TOUCH_EVENT_OPTIONS
      );
    }
  }

  bindListeners() {
    if (this.listenersBound) {
      this.rootElement.current.ownerDocument.addEventListener(
        "mousemove",
        this.onMouseMove,
        true
      );
      this.rootElement.current.ownerDocument.addEventListener(
        "touchmove",
        this.onMouseMove,
        TOUCH_EVENT_OPTIONS
      );
      this.rootElement.current.ownerDocument.addEventListener(
        "mouseup",
        this.onMouseUp,
        true
      );
      this.rootElement.current.ownerDocument.addEventListener(
        "touchend",
        this.onMouseUp,
        true
      );
      this.listenersBound = true;
    }
  }

  unbindListeners() {
    if (this.rootElement.current) {
      this.rootElement.current.ownerDocument.removeEventListener(
        "mousemove",
        this.onMouseMove,
        true
      );
      this.rootElement.current.ownerDocument.removeEventListener(
        "touchmove",
        this.onMouseMove,
        TOUCH_EVENT_OPTIONS
      );
      this.rootElement.current.ownerDocument.removeEventListener(
        "mouseup",
        this.onMouseUp,
        true
      );
      this.rootElement.current.ownerDocument.removeEventListener(
        "touchend",
        this.onMouseUp,
        true
      );
      this.listenersBound = false;
    }
  }

  computeStyle() {
    const { boundingBox, direction, splitPercentage } = this.props;
    const positionStyle = direction === "column" ? "top" : "left";
    const absolutePercentage = BoundingBox.getAbsoluteSplitPercentage(
      boundingBox,
      splitPercentage,
      direction
    );
    return {
      ...BoundingBox.asStyles(boundingBox),
      [positionStyle]: `${absolutePercentage}%`,
    };
  }

  onMouseDown = (event) => {
    if (!isTouchEvent(event)) {
      if (event.button !== 0) {
        return;
      }
    }

    event.preventDefault();
    this.bindListeners();
  };

  onMouseUp = (event) => {
    this.unbindListeners();

    const percentage = this.calculateRelativePercentage(event);
    this.props.onRelease(percentage);
  };

  onMouseMove = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.throttledUpdatePercentage(event);
  };

  throttledUpdatePercentage = throttle((event) => {
    const percentage = this.calculateRelativePercentage(event);
    if (percentage !== this.props.splitPercentage) {
      this.props.onChange(percentage);
    }
  }, RESIZE_THROTTLE_MS);

  calculateRelativePercentage(event) {
    const { minimumPaneSizePercentage, direction, boundingBox } = this.props;
    const parentBBox = this.rootElement.current.parentElement.getBoundingClientRect();
    const location = isTouchEvent(event) ? event.changedTouches[0] : event;

    let absolutePercentage;
    if (direction === "column") {
      absolutePercentage =
        ((location.clientY - parentBBox.top) / parentBBox.height) * 100.0;
    } else {
      absolutePercentage =
        ((location.clientX - parentBBox.left) / parentBBox.width) * 100.0;
    }

    const relativePercentage = BoundingBox.getRelativeSplitPercentage(
      boundingBox,
      absolutePercentage,
      direction
    );

    return clamp(
      relativePercentage,
      minimumPaneSizePercentage,
      100 - minimumPaneSizePercentage
    );
  }
}

function isTouchEvent(event) {
  return event.changedTouches != null;
}
