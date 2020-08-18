export const getSource = (data = {}, transform) => ({
  beginDrag(props) {
    const item = transform ? transform(props) : {};
    return { ...data, ...item };
  },
  canDrag: props => true
});

export const getCollect = () => (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});