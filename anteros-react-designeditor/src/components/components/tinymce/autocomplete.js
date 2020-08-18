
export default class AutoComplete {

  on(editor, matchReg, callback = () => { }) {
    if (!editor || !matchReg) {
      throw new Error('forneça editor ou corresponda ao argumento RegExp');
    }
    if (this.editor) {
      return;
    }
    this.editor = editor;
    this.matchReg = matchReg;
    this.callback = callback;
    editor.on('Input', this.onInput);
  }

  onInput = () => {
    const offset = this.editor.selection.getRng().endOffset;
    const text = this.editor.selection.getSel().anchorNode.data;
    if (!text) {
      return;
    }
    const match = text.slice(0, offset)
      .match(this.matchReg);
    if (match) {
      const rect = this.editor.selection.getBoundingClientRect();
      this.callback({
        match: true,
        query: match[1] || '',
        position: {
          x: rect.left,
          y: rect.top
        }
      });
    } else {
      this.callback({
        match: false,
      });
    }
  }

  off() {
    if (!this.editor) {
      return;
    }
    try {
      this.editor.off('Input');
    } catch (e) {

    }
    this.editor = null;
    this.matchReg = null;
    this.callback = null;
  }
}