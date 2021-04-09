export function stopPropagation(event) {
  event.stopPropagation();
}

export function wrapEvent(ourHandler, theirHandler) {
  if (theirHandler === undefined) return ourHandler;

  return function(event) {
    ourHandler(event);
    theirHandler(event);
  };
}
